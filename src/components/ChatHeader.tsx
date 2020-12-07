import React, {
  useEffect,
  useState,
} from 'react';

import {Pane, Avatar, Text, Badge} from 'evergreen-ui';

export interface ChatHeaderRefObject {
  setOnline: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Props {
  contact: {
    username: string;
    uuid: string;
  };
  socket: SocketIOClient.Socket;
}

const ChatHeader: React.FC<Props> = ({contact, socket}) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);

  const setupOnlineStatusCheckSocketListener = () => {
    socket.on("user-online", async (user: any) => {
      if (
        user.uuid === contact.uuid
      ) {
		setIsOnline(true);
      }
    });

    socket.on("user-offline", async (user: any) => {
      if (
        user.uuid === contact.uuid
      ) {
		setIsOnline(false);
      }
    });
  }

  useEffect(() => {
	setIsOnline(false);
	setupOnlineStatusCheckSocketListener();
    socket.emit('status-check', contact.uuid);
  }, [contact]);

  return (
    <Pane
      flexBasis={45}
      flexGrow={0}
      flexShrink={0}
      padding={10}
      borderBottom
      display="flex">
      <Avatar name={contact.username} />
      <Text marginLeft={5} marginTop={2}>
        {contact.username}
      </Text>
      <Badge marginLeft="auto" marginY={5} color={isOnline ? 'green' : undefined}>
        {isOnline ? 'online' : 'offline'}
      </Badge>
    </Pane>
  );
};

export default ChatHeader;
