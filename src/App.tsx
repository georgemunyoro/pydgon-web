import React, { useEffect, createRef, Ref, useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import MessageView, { MessageViewRefObject } from "./components/MessageView";
import { ContactListRefObject } from "./components/ContactList";
import { MessageListRefObject } from "./components/MessageList";
import LoginForm from "./components/LoginForm";

import Api from "./api";

import { Dialog } from "evergreen-ui";

import { RootState } from "./reducers/index";
import { useDispatch, useSelector } from "react-redux";
import { setLoggedInUser, setLoggedIn } from "./actions";

import io from "socket.io-client";
import { ChatHeaderRefObject } from "./components/ChatHeader";

import { useSetState } from "./hooks/useSetState";

const SOCKET_IO_URL = process.env.REACT_APP_SOCKET_IO_URL?.toString();

export const App: React.FC = () => {
  const socket = io(SOCKET_IO_URL?.toString()!, { transports: ["websocket"] });

  const dispatch = useDispatch();

  const [
    currentChatContact,
    setCurrentChatContact,
    getCurrentChatContact,
  ] = useSetState({
    username: "",
    uuid: "",
  });

  const loggedIn = useSelector((state: RootState) => state.isLoggedIn);

  const messageListRef: Ref<MessageListRefObject> = createRef();
  const messageViewRef: Ref<MessageViewRefObject> = createRef();
  const contactListRef: Ref<ContactListRefObject> = createRef();
  const chatHeaderRef: Ref<ChatHeaderRefObject> = createRef();

  const handleClickContact = async (contact: any) => {
    chatHeaderRef.current?.setOnline(false);
    setCurrentChatContact(contact);
    await messageViewRef.current?.updateViewUser(contact);
  };

  const handleNewMessageEvent = async (data: any) => {
    const chat_uuid = await getCurrentChatContact();
    if (data.sender === chat_uuid.uuid) {
      data.read = true;
      await messageListRef.current?.addReceivedMessage(data);
      socket.emit("message-read", data);
    }

    contactListRef.current?.fetchContacts();
  };

  const handleLoggedInEvent = (user: any) => {
    messageViewRef.current?.setAuthUser(user);
    contactListRef.current?.fetchContacts();
  };

  const handleSendMessage = (message: UnsentMessage) => {
    if (message.recepient === currentChatContact.uuid) {
      messageListRef.current?.addSentMessage(message);
    }
  };

  const handleContactDeletion = ({ contact }: any) => {
    contactListRef.current?.fetchContacts();
    if (currentChatContact.uuid === contact) {
      messageViewRef.current?.updateViewUser({
        username: "",
        uuid: "",
      });
    }
  };

  const setupSocketListeners = (authenticatedUser: UserProfile) => {
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault();
      return (() => {
        socket.removeAllListeners();
        socket.disconnect();
        socket.emit("user-offline", authenticatedUser);
      })();
    });

    socket.on(authenticatedUser.uuid + "-status-check", () => {
      socket.emit("user-online", authenticatedUser);
    });

    socket.on("user-online", async (user: any) => {
      if (
        user.uuid !== authenticatedUser.uuid &&
        user.uuid === currentChatContact.uuid
      ) {
        chatHeaderRef.current?.setOnline(true);
      }
    });

    socket.on("user-offline", (user: any) => {
      if (
        user.uuid !== authenticatedUser.uuid &&
        user.uuid === currentChatContact.uuid
      ) {
        chatHeaderRef.current?.setOnline(false);
      }
    });

    socket.on(authenticatedUser.uuid + "-new-message", (data: any) => {
      if (authenticatedUser.uuid != null) {
        if (data.sender !== authenticatedUser.uuid) {
          handleNewMessageEvent(data);
        }
      }
    });
  };

  useEffect(() => {
    async function logUserIn() {
      const res = await Api.getLoggedInUserInfo(localStorage.getItem("jwt"));
      const authenticatedUser = res.data.data.authenticatedUser;
      handleLoggedInEvent(authenticatedUser);
      dispatch(setLoggedInUser(authenticatedUser));
      socket.emit("user-online", authenticatedUser);
      setupSocketListeners(authenticatedUser);
    }

    sessionStorage.clear();
    if (localStorage.getItem("jwt") !== null) {
      logUserIn();
      dispatch(setLoggedIn());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactListRef, messageViewRef]);

  return (
    <div id={"appRoot"}>
      <Dialog
        isShown={!loggedIn}
        title="Login"
        hasFooter={false}
        hasHeader={false}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEscapePress={false}
        hasClose={false}
      >
        <LoginForm handleLoggedInEvent={handleLoggedInEvent} />
      </Dialog>
      <Sidebar
        socket={socket}
        contactListRef={contactListRef}
        handleContactDeletion={handleContactDeletion}
        handleClickContact={handleClickContact}
      />
      <MessageView
        socket={socket}
        chatHeaderRef={chatHeaderRef}
        messageListRef={messageListRef}
        handleSendMessage={handleSendMessage}
        handleNewMessageEvent={handleNewMessageEvent}
        ref={messageViewRef}
      />
    </div>
  );
};
