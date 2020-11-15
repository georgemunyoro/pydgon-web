import React, { useEffect, useState } from "react";

import { Pane, Avatar, Text, Badge } from "evergreen-ui";

interface Props {
  contact: {
    username: string;
    uuid: string;
  };
  socket: SocketIOClient.Socket;
  authenticatedUser: UserProfile;
}

const ChatHeader: React.FC<Props> = ({
  contact,
  socket,
  authenticatedUser,
}) => {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    setOnline(false);
    socket.on("user-online", (user: any) => {
      console.log(authenticatedUser, user);
      if (user.uuid !== authenticatedUser.uuid) {
        if (user.uuid === contact.uuid) {
          setOnline(true);
        }
      }
    });

    socket.on("user-offline", (user: any) => {
      console.log(authenticatedUser, user);
      if (user.uuid !== authenticatedUser.uuid) {
        if (user.uuid === contact.uuid) {
          setOnline(false);
        }
      }
    });
  }, []);

  return (
    <Pane
      flexBasis={45}
      flexGrow={0}
      flexShrink={0}
      padding={10}
      borderBottom
      display="flex"
    >
      <Avatar name={contact.username} />
      <Text marginLeft={5} marginTop={2}>
        {contact.username}
      </Text>
      <Badge margin={5} color={online ? "green" : undefined}>
        {online ? "online" : "offline"}
      </Badge>
    </Pane>
  );
};

export default ChatHeader;
