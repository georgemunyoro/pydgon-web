import React, {
  useState,
  useEffect,
  Ref,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";

import { Pane } from "evergreen-ui";

import Message from "./Message";

import { useSelector } from "react-redux";
import { RootState } from "../reducers";

import Api from "../api";

interface Props {
  handleNewMessageEvent: (message: any) => void;
  socket: SocketIOClient.Socket;
}

interface MessageModel {
  id?: number;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  sender?: string;
  recepient?: string;
}

export interface MessageListRefObject {
  addSentMessage: (message: UnsentMessage) => void;
}

const MessageList: React.ForwardRefRenderFunction<
  MessageListRefObject,
  Props
> = (
  { handleNewMessageEvent, socket }: Props,
  ref: Ref<MessageListRefObject>
) => {
  const loggedInUser = useSelector((state: RootState) => state.user.uuid);
  const chat_uuid = useSelector(
    (state: RootState) => state.currentChatUser.uuid
  );

  const listRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<MessageModel[]>([{}]);
  const [socketSet, setSocketSet] = useState(false);

  function updateScroll() {
    if (listRef != null) {
      if (listRef.current != null) {
        listRef.current.scrollTop = listRef.current?.scrollHeight;
      }
    }
  }

  function addSentMessage(message: UnsentMessage) {
    setMessages((messages: any) => [...messages, message]);
    updateScroll();
  }

  useImperativeHandle(ref, () => ({
    addSentMessage,
  }));

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
      if (socket != null && !socketSet) {
        socket.on(loggedInUser + "-new-message", (data: any) => {
          if (loggedInUser != null) {
            if (data.sender !== loggedInUser) {
              handleNewMessageEvent(data);
            }
            if (data.sender !== chat_uuid) return;
          }
          setMessages((messages: any) => [...messages, data]);
          updateScroll();
        });
        setSocketSet(true);
      }
    }

    listenForIncomingMessages();
    fetchChatMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat_uuid, loggedInUser, socket, handleNewMessageEvent]);

  return (
    <Pane
      ref={listRef}
      flexGrow={1}
      overflowX="hidden"
      overflowY="scroll"
      id={"messageList"}
    >
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

export default forwardRef(MessageList);
