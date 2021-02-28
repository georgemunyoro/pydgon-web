import React, { useState, useEffect } from "react";

import { Pane, Text, Badge, CornerDialog, Button } from "evergreen-ui";

import { useSelector } from "react-redux";
import { RootState } from "../reducers";

import MessageBox from "./MessageBox";
import MessageList from "./MessageList";
import ChatHeader from "./ChatHeader";

import Api from "../api";

import { UnsentMessage } from "../types/global";

interface Props {
  socket: SocketIOClient.Socket;
  currentChatUser: { username: string; uuid: string };
}

const MessageView: React.FC<Props> = ({ socket, currentChatUser }: Props) => {
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(true);
  const [messages, setMessages] = useState<any>([]);

  const loggedInUser = useSelector((state: RootState) => state.user);

  const setupSocketListeners = () => {
    socket.on(loggedInUser.uuid + "-new-message", (data: any) => {
      if (loggedInUser.uuid != null) {
        if (data.sender !== loggedInUser.uuid) {
          if (data.sender === currentChatUser.uuid) {
            if (messages.filter((m: any) => m.uuid == data.uuid).length == 0) {
              data.read = true;
              addMessage(data);
              socket.emit("message-read", data);
            }
          }
        }
      }
    });
  };

  function addMessage(message: UnsentMessage) {
    setMessages((messages: any) => [message, ...messages]);
  }

  async function fetchChatMessages() {
    try {
      const res = await Api.getMessages(
        localStorage.getItem("jwt"),
        currentChatUser.uuid
      );
      res.data.data.messages.sort((a: any, b: any) =>
        new Date(a.createdAt!).getTime() > new Date(b.createdAt!).getTime()
          ? -1
          : 1
      );
      setMessages(res.data.data.messages);
      } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchChatMessages();
    setupSocketListeners();
  }, [currentChatUser]);

  if (currentChatUser.uuid === "") {
    return (
      <Pane textAlign="center" lineHeight="100vh" id="message_view">
        <Text margin={10} size={600} textAlign="center">
          Welcome to Pydgon
        </Text>
        <Badge color="neutral" isSolid>
          Beta
        </Badge>
        <React.Fragment>
          <CornerDialog
            title="Hello World!"
            isShown={showWelcomeDialog}
            onCloseComplete={() => setShowWelcomeDialog(false)}
            onConfirm={() =>
              window.open(
                "https://github.com/georgemunyoro/pydgon-web",
                "_blank"
              )
            }
          >
            <Text>
              Thank you for using Pydgon, if you're interested in helping out
              with the project, check out
              <a href="https://github.com/georgemunyoro/pydgon-web">
                our github repo
              </a>
            </Text>
          </CornerDialog>
        </React.Fragment>
      </Pane>
    );
  }

  return (
    <Pane display="flex" flexDirection="column" id="message_view">
      <ChatHeader contact={currentChatUser} socket={socket} />
      <MessageList
        messages={messages}
        chat_uuid={currentChatUser.uuid}
        socket={socket}
      />
      <MessageBox addMessageToChatView={addMessage} socket={socket} />
    </Pane>
  );
};

export default MessageView;
