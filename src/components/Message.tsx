import React, { useEffect, useState } from "react";
import VizSensor from "react-visibility-sensor";

import { Pane, Text, defaultTheme, Dialog } from "evergreen-ui";

// @ts-ignore
import { ReactTinyLink } from "react-tiny-link";

import { useSelector } from "react-redux";
import { RootState } from "../reducers";

import { LazyLoadImage } from "react-lazy-load-image-component";

import imagePlaceholder from "../assets/placeholder.png";
import Lightbox from "react-image-lightbox";

interface UserMessage {
  embededFile: string;
  sender: string;
  recepient: string;
  id: string;
  content: string;
  read: boolean;
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
  const [containsImage, setContainsImage] = useState(false);
  const [link, setLink] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

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

  function checkIfMessageContainsImage() {
    if (message.embededFile != null) {
      setContainsImage(true);
      setImageUrl(message.embededFile);
    }
  }

  useEffect(() => {
    initSocketListener();
    checkIfMessageContainsLink();
    checkIfMessageContainsImage();
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
        border={read}
        borderRight
        transitionDuration="1s"
        borderColor={read ? "" : "royalblue"}
        marginY={5}
        marginX={15}
        display="flex"
        borderRadius={3}
        flexDirection="column"
        maxWidth="70%"
        wordWrap="break-word"
        wordBreak="break-word"
        whiteSpace="pre-wrap"
        background={
          message.sender === loggedInUser
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
        {containsImage && (
          <LazyLoadImage
            onClick={(event: any) => {
              setShowImageDialog(true);
            }}
            placeholderSrc={imagePlaceholder}
            // effect=""
            style={{
              borderRadius: 5,
              margin: 5,
              border: `1px solid ${defaultTheme.colors.border.default}`,
              cursor: "pointer",
            }}
            height={200}
            src={imageUrl}
            alt={imageUrl}
          />
        )}
        <Text margin={10}>{message.content}</Text>
        {showImageDialog && (
          <Lightbox
            onCloseRequest={() => setShowImageDialog(false)}
            mainSrc={imageUrl}
          />
        )}
      </Pane>
    </VizSensor>
  );
};

export default Message;
