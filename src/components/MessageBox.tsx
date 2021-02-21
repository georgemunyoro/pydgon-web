import React, { useEffect, useState } from "react";

import {
  Textarea,
  Pane,
  IconButton,
  CaretUpIcon,
  FilePicker,
  Dialog,
  CameraIcon,
  Spinner,
  Button,
} from "evergreen-ui";

import { useSelector } from "react-redux";
import { RootState } from "../reducers";

import { uuid } from "uuidv4";

import Api from "../api";
import { UnsentMessage } from "../types/global";

interface Props {
  socket: SocketIOClient.Socket;
  addMessageToChatView: (message: UnsentMessage) => void;
}

const MessageBox: React.FC<Props> = ({ socket, addMessageToChatView }) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showImageSelectionDialog, setShowImageSelectionDialog] = useState(
    false
  );

  const userId = useSelector((state: RootState) => state.user.uuid);
  const currentChat = useSelector(
    (state: RootState) => state.currentChatUser.uuid
  );

  const sendMessage = () => {
    if (message.trim() === "") return;
    if (socket != null && userId != null && currentChat != null) {
      const messageObject: UnsentMessage = {
        sender: userId,
        recepient: currentChat,
        content: message,
        read: false,
        id: uuid(),
      };
      socket.emit("chat-message", messageObject);
	  addMessageToChatView(messageObject)
      setMessage("");
    }
  };

  const sendImages = async () => {
    const images = files.map((file: any) => {
      const formData = new FormData();
      formData.append("image", file);
      return formData;
    });

    try {
      const res = await Api.uploadImage(images[0]);

      if (socket != null && userId != null && currentChat != null) {
        const messageObject: UnsentMessage = {
          sender: userId,
          recepient: currentChat,
          content: "",
          read: false,
          embededFile: res.data.data.link,
          id: uuid(),
        };
        socket.emit("chat-message", messageObject);
		addMessageToChatView(messageObject)
      }

      setUploading(false);
      setShowImageSelectionDialog(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTextareaKeyupEvent = (event: any) => {
    if (event.keyCode === 13 && !event.shiftKey) sendMessage();
  };

  return (
    <Pane borderTop display="flex" padding={5}>
      <Dialog
        isShown={showImageSelectionDialog}
        onCloseComplete={() => setShowImageSelectionDialog(false)}
        hasFooter={false}
      >
        <FilePicker
          multiple
          width={250}
          marginBottom={32}
          onChange={(addedFiles: any) => setFiles(addedFiles)}
          placeholder="Select the file(s) here!"
        />
        {uploading && <Spinner />}
        <Button
          onClick={async () => {
            setUploading(true);
            sendImages();
          }}
        >
          Send
        </Button>
      </Dialog>
      <Textarea
        onChange={(event: any) => {
          setMessage(event.target.value);
        }}
        value={message}
        onKeyUp={(event: any) => handleTextareaKeyupEvent(event)}
        minHeight="2.2rem"
        height="2.2rem"
        marginRight={5}
      />
      <IconButton
        appearance="minimal"
        height="2.2rem"
        onClick={sendMessage}
        icon={CaretUpIcon}
      />
      <IconButton
        appearance="minimal"
        height="2.2rem"
        onClick={() => setShowImageSelectionDialog(true)}
        icon={CameraIcon}
      />
    </Pane>
  );
};

export default MessageBox;
