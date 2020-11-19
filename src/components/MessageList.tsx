import React, {
  useState,
  useEffect,
  Ref,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";

import { Pane, Spinner, Badge } from "evergreen-ui";

import InfiniteScroll from "react-infinite-scroll-component";

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

  const [hasMore, setHasMore] = useState(true);
  const [messages, setMessages] = useState<MessageModel[]>([{}]);
  const [messagesToRender, setMessagesToRender] = useState<MessageModel[]>([
    {},
  ]);
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
    await setMessages((messages: any) => [message, ...messages]);
    await setMessagesToRender((messages: any) => [message, ...messages]);
    updateScroll();
    emitUserOnline();
  }

  async function addReceivedMessage(message: any) {
    await setMessages((messages: any) => [message, ...messages]);
    await setMessagesToRender((messages: any) => [message, ...messages]);
    updateScroll();
    emitUserOnline();
  }

  async function fetchMoreMessages() {
    const messagesAvailable = messages.length - messagesToRender.length;
    if (messagesAvailable > 25) {
      setMessagesToRender(messages.slice(0, messagesToRender.length + 24));

      if (listRef != null) {
        if (listRef.current != null) {
          listRef.current.scrollTop = listRef.current.scrollTop =
            0.21 * listRef.current.scrollHeight;
        }
      }
    } else {
      setMessagesToRender(messages);
      setHasMore(false);
    }
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
        console.log(res.data.data.messages.slice(0, 5));
        res.data.data.messages.reverse();
        setMessages(res.data.data.messages);
        setMessagesToRender(res.data.data.messages.slice(0, 25));
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
      <InfiniteScroll
        dataLength={messagesToRender.length}
        next={fetchMoreMessages}
        style={{
          display: "flex",
          flexDirection: "column-reverse",
        }}
        inverse={true}
        hasMore={hasMore}
        endMessage={
          <Pane width="100%" textAlign="center" padding={10}>
            <Badge color="teal">Beginning of chat</Badge>
          </Pane>
        }
        loader={
          <Pane width="100%" padding={10}>
            <Spinner margin="auto" />
          </Pane>
        }
        scrollableTarget="messageList"
      >
        {messagesToRender.map((message: any) => (
          <Message
            socket={socket}
            key={message.id}
            message={message}
            loggedInUser={loggedInUser.uuid}
          />
        ))}
      </InfiniteScroll>
    </Pane>
  );
};

export default forwardRef(MessageList);
