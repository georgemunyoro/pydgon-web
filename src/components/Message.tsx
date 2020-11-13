import React from "react";

import { Pane, Text, Avatar, defaultTheme } from "evergreen-ui";

interface UserMessage {
  sender: string;
  recepient: string;
  id: number;
  content: string;
}

interface Props {
  message: UserMessage;
  loggedInUser: string | null | undefined;
}

const Message: React.FC<Props> = ({ message, loggedInUser }) => {
  return (
    <Pane
      marginY={5}
      marginX={15}
      display="flex"
      borderRadius={3}
      maxWidth="70%"
      wordWrap="break-word"
      wordBreak="break-all"
      whiteSpace="pre-wrap"
      background={message.sender === loggedInUser ? defaultTheme.colors.background.greenTint : defaultTheme.colors.background.blueTint}
      hoverElevation={2}
      style={{
        width: "max-content",
        marginLeft: message.sender === loggedInUser ? "auto" : "none"
      }}
    >
      <Text margin={10}>{message.content}</Text>
    </Pane>
  );
};

export default Message;
