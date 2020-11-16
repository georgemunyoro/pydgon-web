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
  chat_uuid: string;
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
  addReceivedMessage: (message: any) => void;
}

const MessageList: React.ForwardRefRenderFunction<
  MessageListRefObject,
  Props
> = (
  { handleNewMessageEvent, socket, chat_uuid }: Props,
  ref: Ref<MessageListRefObject>
) => {
  const loggedInUser = useSelector((state: RootState) => state.user);

  const listRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<MessageModel[]>([{}]);
  const [socketSet, setSocketSet] = useState(false);

  function emitUserOnline() {
    socket.emit("user-online", loggedInUser);
  }

  function updateScroll() {
    if (listRef != null) {
      if (listRef.current != null) {
        listRef.current.scrollTop =
          listRef.current?.scrollHeight - listRef.current?.clientHeight;
      }
    }
  }

  async function addSentMessage(message: UnsentMessage) {
    await setMessages((messages: any) => [...messages, message]);
    updateScroll();
    emitUserOnline();
  }

  async function addReceivedMessage(message: any) {
    await setMessages((messages: any) => [...messages, message]);
    updateScroll();
    emitUserOnline();
  }

  useImperativeHandle(ref, () => ({
    addSentMessage,
    addReceivedMessage,
  }));

  useEffect(() => {
    async function fetchChatMessages() {
      try {
        const res = await Api.getMessages(
          localStorage.getItem("jwt"),
          chat_uuid
        );
        setMessages(res.data.data.messages);
        sessionStorage.setItem(
          chat_uuid,
          JSON.stringify(res.data.data.messages)
        );
        updateScroll();
      } catch (error) {
        console.error(error);
      }
    }

    emitUserOnline();
    if (sessionStorage.getItem(chat_uuid) != null) {
      const savedMessages = sessionStorage.getItem(chat_uuid);
      if (savedMessages != null) {
        setMessages(JSON.parse(savedMessages));
      }
      return;
    }

    fetchChatMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser.uuid, socket, handleNewMessageEvent, chat_uuid]);

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
          socket={socket}
          key={message.id}
          message={message}
          loggedInUser={loggedInUser.uuid}
        />
      ))}
    </Pane>
  );
};

export default forwardRef(MessageList);
