import React from "react";

import { Pane, Avatar, Text } from "evergreen-ui";

interface Props {
  contact: {
    username: string;
    uuid: string;
  };
}

const ChatHeader: React.FC<Props> = ({ contact }) => {
  return (
    <Pane flexBasis={45} flexGrow={0} flexShrink={0} padding={10} borderBottom display="flex">
      <Avatar name={contact.username} />
      <Text marginLeft={5} marginTop={2}>{contact.username}</Text>
    </Pane>
  );
};

export default ChatHeader;
