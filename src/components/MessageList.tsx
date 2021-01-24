import React, {useState, useEffect, useRef} from 'react';

import {Pane, Spinner, Badge} from 'evergreen-ui';

import InfiniteScroll from 'react-infinite-scroll-component';

import Message from './Message';

import {useSelector} from 'react-redux';
import {RootState} from '../reducers';

import Api from '../api';
import {UnsentMessage} from '../types/global';

interface Props {
  socket: SocketIOClient.Socket;
  chat_uuid: string;
  messages: any[];
}

interface MessageModel {
  id?: number;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  sender?: string;
  recepient?: string;
}

const MessageList: React.FC<Props> = ({socket, chat_uuid, messages}: Props) => {
  const loggedInUser = useSelector((state: RootState) => state.user);

  const listRef = useRef<HTMLDivElement>(null);

  const [hasMore, setHasMore] = useState(true);
  const [messagesToRender, setMessagesToRender] = useState<MessageModel[]>([
    {},
  ]);

  function emitUserOnline() {
    socket.emit('user-online', loggedInUser);
  }

  function updateScroll() {
    if (listRef != null) {
      if (listRef.current != null) {
        listRef.current.scrollTop =
          listRef.current?.scrollHeight - listRef.current?.clientHeight;
      }
    }
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

  useEffect(() => {
    emitUserOnline();
    setMessagesToRender(messages);
    updateScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat_uuid]);

  return (
    <Pane
      ref={listRef}
      flexGrow={1}
      overflowX="hidden"
      overflowY="scroll"
      id={'messageList'}>
      <InfiniteScroll
        dataLength={messagesToRender.length}
        next={fetchMoreMessages}
        style={{
          display: 'flex',
          flexDirection: 'column-reverse',
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
        scrollableTarget="messageList">
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

export default React.memo(MessageList);
