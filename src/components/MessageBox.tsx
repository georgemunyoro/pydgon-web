import React, { useEffect, useState } from "react";

import { Textarea, Pane, IconButton, CaretUpIcon } from "evergreen-ui";

import { useSelector } from "react-redux";
import { RootState } from "../reducers";

interface Props {
  socket: SocketIOClient.Socket;
}

const MessageBox: React.FC<Props> = ({ socket }) => {
  const [message, setMessage] = useState("");

  const userId = useSelector((state: RootState) => state.user.uuid);
  const currentChat = useSelector(
    (state: RootState) => state.currentChatUser.uuid
  );

  const sendMessage = () => {
    if (message.trim() === "") return;
    if (socket != null) {
      console.log(socket);
      socket.emit("chat-message", {
        sender: userId,
        recepient: currentChat,
        content: message,
      });
      console.log("SENT", message);
      setMessage("");
    }
  };

  const handleTextareaKeyupEvent = (event: any) => {
    if (event.keyCode === 13 && !event.shiftKey) sendMessage();
  };

  return (
    <Pane borderTop display="flex" padding={5}>
      <Textarea
        onChange={(event: any) => {
          setMessage(event.target.value);
        }}
        value={message}
        onKeyUp={(event: any) => handleTextareaKeyupEvent(event)}
        minHeight="2.2rem"
        height="2.2rem"
        marginRight={5}
      />
      <IconButton
        appearance="minimal"
        height="2.2rem"
        onClick={sendMessage}
        icon={CaretUpIcon}
      />
    </Pane>
  );
};

export default MessageBox;
