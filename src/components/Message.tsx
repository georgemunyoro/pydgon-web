import React, { useEffect, useState } from "react";
import VizSensor from "react-visibility-sensor";

import { Pane, Text, defaultTheme } from "evergreen-ui";

// @ts-ignore
import { ReactTinyLink } from "react-tiny-link";

import { useSelector } from "react-redux";
import { RootState } from "../reducers";

interface UserMessage {
  sender: string;
  recepient: string;
  id: string;
  content: string;
  read: Boolean;
}

interface Props {
  message: UserMessage;
  loggedInUser: string | null | undefined;
  socket: SocketIOClient.Socket;
}

const Message: React.FC<Props> = ({ message, loggedInUser, socket }) => {
  const chat_uuid = useSelector(
    (state: RootState) => state.currentChatUser.uuid
  );
  const [read, setRead] = useState(message.read);
  const [containsLink, setContainsLink] = useState(false);
  const [link, setLink] = useState("");

  function initSocketListener() {
    if (message.id != null) {
      socket.on(message.id + "-read", () => {
        setRead(true);
      });
    }
  }

  function extractUrls(string: String): string[] | undefined {
    const matches = string.match(
      "https?://([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?"
    );
    return matches?.filter((match: any) => match != null);
  }

  function checkIfMessageContainsLink() {
    if (message.content != null) {
      const links = extractUrls(message.content);
      if (links !== undefined) {
        setContainsLink(true);
        setLink(links[0]);
      }
    }
  }

  useEffect(() => {
    initSocketListener();
    checkIfMessageContainsLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, chat_uuid]);

  return (
    <VizSensor
      onChange={(isVisible) => {
        if (
          isVisible &&
          !read &&
          message.id != null &&
          message.recepient === loggedInUser
        ) {
          console.log("VIS", message.content);
          socket.emit("message-read", message);
        }
      }}
    >
      <Pane
        borderRight
        transitionDuration="1s"
        borderColor={read ? "transparent" : "royalblue"}
        marginY={5}
        marginX={15}
        display="flex"
        borderRadius={3}
        flexDirection="column"
        maxWidth="70%"
        wordWrap="break-word"
        wordBreak="break-word"
        whiteSpace="pre-wrap"
        background={message.sender === loggedInUser
          ? defaultTheme.colors.background.greenTint
          : defaultTheme.colors.background.blueTint
        }
        hoverElevation={2}
        style={{
          width: containsLink ? "50%" : "max-content",
          marginLeft: message.sender === loggedInUser ? "auto" : "none",
        }}
      >
        {containsLink && (
          <ReactTinyLink
            cardSize="small"
            showGraphic={true}
            maxLine={2}
            minLine={1}
            width="100%"
            url={link}
          />
        )}
        <Text margin={10}>{message.content}</Text>
      </Pane>
    </VizSensor>
  );
};

export default Message;
