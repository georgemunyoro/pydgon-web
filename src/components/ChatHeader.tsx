import React, {
  useEffect,
  useState,
  Ref,
  forwardRef,
  useImperativeHandle,
} from "react";

import { Pane, Avatar, Text, Badge } from "evergreen-ui";

export interface ChatHeaderRefObject {
  setOnline: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Props {
  contact: {
    username: string;
    uuid: string;
  };
  socket: SocketIOClient.Socket;
  authenticatedUser: UserProfile;
}

const ChatHeader: React.ForwardRefRenderFunction<ChatHeaderRefObject, Props> = (
  { contact, socket, authenticatedUser }: Props,
  ref: Ref<ChatHeaderRefObject>
) => {
  const [online, setOnline] = useState(false);

  useImperativeHandle(ref, () => ({
    setOnline,
  }));

  useEffect(() => {
    socket.emit("status-check", contact.uuid);
  }, [contact]);

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
      <Badge marginLeft="auto" marginY={5} color={online ? "green" : undefined}>
        {online ? "online" : "offline"}
      </Badge>
    </Pane>
  );
};

export default forwardRef(ChatHeader);
