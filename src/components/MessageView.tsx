import React, { useState, forwardRef, useImperativeHandle, Ref } from "react";

import { Pane, Text } from "evergreen-ui";

import MessageBox from "./MessageBox";
import MessageList from "./MessageList";
import ChatHeader from "./ChatHeader";

import { MessageListRefObject } from "./MessageList";

interface Props {
  handleNewMessageEvent: (message: any) => void;
  socket: SocketIOClient.Socket;
  handleSendMessage: (message: UnsentMessage) => void;
  messageListRef: Ref<MessageListRefObject>;
}

export interface MessageViewRefObject {
  updateViewUser: (user: any) => void;
  setAuthUser: (user: UserProfile) => void;
}

const MessageView: React.ForwardRefRenderFunction<
  MessageViewRefObject,
  Props
> = (
  { handleNewMessageEvent, socket, handleSendMessage, messageListRef }: Props,
  ref: Ref<MessageViewRefObject>
) => {
  const [authenticatedUser, setAuthenticatedUser] = useState({});
  const [currentChatUser, setCurrentChatUser] = useState({
    username: "",
    uuid: "",
  });

  function updateViewUser(user: any) {
    setCurrentChatUser(user);
  }

  function setAuthUser(user: UserProfile) {
    setAuthenticatedUser(user);
  }

  useImperativeHandle(ref, () => ({
    updateViewUser,
    setAuthUser,
  }));

  if (currentChatUser.uuid === "") {
    return (
      <Pane textAlign="center" lineHeight="100vh" id="message_view">
        <Text margin={10} size={600} textAlign="center">
          Welcome to Mercury
        </Text>
      </Pane>
    );
  }

  return (
    <Pane display="flex" flexDirection="column" id="message_view">
      <ChatHeader
        authenticatedUser={authenticatedUser}
        socket={socket}
        contact={currentChatUser}
      />
      <MessageList
        ref={messageListRef}
        chat_uuid={currentChatUser.uuid}
        socket={socket}
        handleNewMessageEvent={handleNewMessageEvent}
      />
      <MessageBox handleSendMessage={handleSendMessage} socket={socket} />
    </Pane>
  );
};

export default forwardRef(MessageView);
