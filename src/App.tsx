import React, { useEffect, createRef, Ref, useState } from "react";
import "./App.css";

import "react-image-lightbox/style.css";

import Sidebar from "./components/Sidebar";
import MessageView from "./components/MessageView";
import { ContactListRefObject } from "./components/ContactList";
import LoginForm from "./components/LoginForm";

import Api from "./api";

import { Dialog } from "evergreen-ui";

import { RootState } from "./reducers/index";
import { useDispatch, useSelector } from "react-redux";
import { setLoggedInUser, setLoggedIn } from "./actions";

import io from "socket.io-client";

import { useSetState } from "./hooks/useSetState";
import { UnsentMessage, UserProfile } from "./types/global";


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

  const contactListRef: Ref<ContactListRefObject> = createRef();

  const handleClickContact = async (contact: any) => {
    setCurrentChatContact(contact);
  };

  const handleNewMessageEvent = async (data: any) => {
    contactListRef.current?.fetchContacts();
  };

  const handleLoggedInEvent = (user: any) => {
    contactListRef.current?.fetchContacts();
  };

  const handleContactDeletion = ({ contact }: any) => {
    contactListRef.current?.fetchContacts();
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
  }, [contactListRef]);

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
		currentChatUser={currentChatContact}
      />
    </div>
  );
};
