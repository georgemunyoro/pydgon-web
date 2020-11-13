import React, { useState, useEffect } from "react";

import { Pane } from "evergreen-ui";

import Message from "./Message";

import { useSelector } from "react-redux";
import { RootState } from "../reducers";

import Api from "../api";

interface Props {
  handleNewMessageEvent: (message: any) => void;
  socket: SocketIOClient.Socket;
}

const MessageList: React.FC<Props> = ({ handleNewMessageEvent, socket }: Props) => {
  const loggedInUser = useSelector((state: RootState) => state.user.uuid);
  const chat_uuid = useSelector(
    (state: RootState) => state.currentChatUser.uuid
  );

  const [messages, setMessages] = useState([{}]);

  function updateScroll() {
    let messageList = document.getElementById("messageList");
    if (messageList != null) messageList.scrollTop = messageList.scrollHeight;
  }

  useEffect(() => {
    async function fetchChatMessages() {
      try {
        const res = await Api.getMessages(
          localStorage.getItem("jwt"),
          chat_uuid
        );
        setMessages(res.data.data.messages);
        updateScroll();
      } catch (error) {
        console.error(error);
      }
    }

    function listenForIncomingMessages() {
      console.log("el")
      if (socket != null) {
        socket.on("new-message", (data: any) => {
          if (loggedInUser != null) {
            if (data.sender !== loggedInUser) handleNewMessageEvent(data);
          }
          setMessages((messages: any) => [...messages, data]);
          updateScroll();
        });
      }
    }

    listenForIncomingMessages();
    fetchChatMessages();
  }, [chat_uuid, loggedInUser, socket, handleNewMessageEvent]);

  return (
    <Pane flexGrow={1} overflowX="hidden" overflowY="scroll" id={"messageList"}>
      {messages.map((message: any) => (
        <Message
          key={message.id}
          message={message}
          loggedInUser={loggedInUser}
        />
      ))}
    </Pane>
  );
};

export default MessageList;
