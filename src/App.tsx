import React, { useEffect, createRef, Ref } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import MessageView, { MessageViewRefObject } from "./components/MessageView";
import { ContactListRefObject } from "./components/ContactList";
import LoginForm from "./components/LoginForm";

import Api from "./api";

import { Dialog } from "evergreen-ui";

import { RootState } from "./reducers/index";
import { useDispatch, useSelector } from "react-redux";
import { setLoggedInUser, setLoggedIn, setSocket } from "./actions";

import io from "socket.io-client";

const SOCKET_IO_URL = process.env.REACT_APP_SOCKET_IO_URL?.toString();

export const App: React.FC = () => {
  const socket = io(SOCKET_IO_URL?.toString()!, { transports: ["websocket"] });

  const dispatch = useDispatch();

  const loggedIn = useSelector((state: RootState) => state.isLoggedIn);

  const messageViewRef: Ref<MessageViewRefObject> = createRef();
  const contactListRef: Ref<ContactListRefObject> = createRef();

  const handleNewMessageEvent = (data: any) => {
    console.log("new_message");
    contactListRef.current?.fetchContacts();
  };

  const handleLoggedInEvent = (user: any) => {
    console.log("handle_logger_in_user_event");
    contactListRef.current?.fetchContacts();
  };

  useEffect(() => {
    async function logUserIn() {
      const res = await Api.getLoggedInUserInfo(localStorage.getItem("jwt"));
      const authenticatedUser = res.data.data.authenticatedUser;
      handleLoggedInEvent(authenticatedUser);
      dispatch(setLoggedInUser(authenticatedUser));
    }

    if (localStorage.getItem("jwt") !== null) {
      logUserIn();
      dispatch(setLoggedIn());
    }
  }, [dispatch, contactListRef]);

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
        contactListRef={contactListRef}
        handleClickContact={(user: any) =>
          messageViewRef.current?.updateViewUser(user)
        }
      />
      <MessageView
        socket={socket}
        handleNewMessageEvent={handleNewMessageEvent}
        ref={messageViewRef}
      />
    </div>
  );
};
