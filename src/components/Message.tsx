import React, { useEffect, useState } from "react";
import VizSensor from "react-visibility-sensor";

import { Pane, Text, Avatar, defaultTheme } from "evergreen-ui";

import { useSelector } from "react-redux";
import { RootState } from "../reducers";

interface UserMessage {
  sender: string;
  recepient: string;
  id: string;
  content: string;
  read: Boolean;
}

interface Props {
  message: UserMessage;
  loggedInUser: string | null | undefined;
  socket: SocketIOClient.Socket;
}

const Message: React.FC<Props> = ({ message, loggedInUser, socket }) => {
  const chat_uuid = useSelector(
    (state: RootState) => state.currentChatUser.uuid
  );
  const [read, setRead] = useState(message.read);

  function initSocketListener() {
    if (message.id != null) {
      socket.on(message.id + "-read", () => {
        setRead(true);
      });
    }
  }

  useEffect(() => {
    initSocketListener();
  }, [message, chat_uuid]);

  return (
    <VizSensor
      onChange={(isVisible) => {
        if (
          isVisible &&
          !read &&
          message.id != null &&
          message.recepient === loggedInUser
        ) {
          console.log("VIS", message.content);
          socket.emit("message-read", message);
        }
      }}
    >
      <Pane
        borderRight
        transitionDuration="1s"
        borderColor={read ? "transparent" : "royalblue"}
        marginY={5}
        marginX={15}
        display="flex"
        borderRadius={3}
        maxWidth="70%"
        wordWrap="break-word"
        wordBreak="break-all"
        whiteSpace="pre-wrap"
        background={
          message.sender === loggedInUser
            ? defaultTheme.colors.background.greenTint
            : defaultTheme.colors.background.blueTint
        }
        hoverElevation={2}
        style={{
          width: "max-content",
          marginLeft: message.sender === loggedInUser ? "auto" : "none",
        }}
      >
        <Text margin={10}>{message.content}</Text>
      </Pane>
    </VizSensor>
  );
};

export default Message;
