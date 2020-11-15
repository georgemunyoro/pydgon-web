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
        socket.on(loggedInUser.uuid + "-new-message", (data: any) => {
          if (loggedInUser.uuid != null) {
            if (data.sender !== loggedInUser.uuid) {
              handleNewMessageEvent(data);
            }
          }
          if (data.sender === chat_uuid) {
            console.log("MES", data, chat_uuid);
            setMessages((messages: any) => [...messages, data]);
            updateScroll();
          }
        });
        setSocketSet(true);
      }
    }

    listenForIncomingMessages();
    fetchChatMessages();
    emitUserOnline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser.uuid, socket, handleNewMessageEvent]);

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
          loggedInUser={loggedInUser.uuid}
        />
      ))}
    </Pane>
  );
};

export default forwardRef(MessageList);
