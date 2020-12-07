import React, { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { setCurrentChat } from "../actions";
import { RootState } from "../reducers";

import {
  Avatar,
  Table,
  Popover,
  Menu,
  Position,
  TrashIcon,
  Pane,
  EditIcon,
  Dialog,
  Text,
  Badge,
  Pill,
  toaster,
} from "evergreen-ui";

import Api from "../api";
import { UserProfile } from "../types/global";

interface UserContact {
  id: number;
  name: string;
  contact?: string;
  unread?: number;
}

interface Props {
  contact: UserContact;
  handleClickContact: (user: any) => void;
  handleContactDeleteEvent: (contact: any) => void;
  socket: SocketIOClient.Socket;
  authenticatedUser: UserProfile;
}

const Contact: React.FC<Props> = ({
  contact,
  handleClickContact,
  handleContactDeleteEvent,
  socket,
  authenticatedUser,
}) => {
  const dispatch = useDispatch();

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [unread, setUnread] = useState(0);

  const currentChatUser = useSelector(
    (state: RootState) => state.currentChatUser
  );

  const handleContextMenuEvent = (event: any) => {
    event.preventDefault();
    setShowContextMenu(true);
  };

  const deleteContact = async () => {
    setShowDeleteDialog(false);
    const jwt = localStorage.getItem("jwt");
    if (jwt != null) {
      try {
        const res = await Api.deleteContact(jwt, contact.contact);
        if (res.status === 200)
          toaster.warning(`Deleted contact ${contact.name}`);
        else {
          toaster.danger("An error ocurred while attempting to delete contact");
        }
      } catch (error) {
        console.error(error);
        toaster.danger(error);
      }
    }
    handleContactDeleteEvent(contact);
  };

  useEffect(() => {
    async function getUnreadMessages() {
      const jwt = localStorage.getItem("jwt");
      if (jwt != null) {
        const res = await Api.getUnreadMessages(jwt, contact.contact);
        if (res.status === 200) {
          const unreadMessages = res.data.data.messages.filter(
            (message: any) => message.sender !== authenticatedUser.uuid
          );
          setUnread(unreadMessages.length);
        }
      }
    }
    socket.on(authenticatedUser.uuid + "-new-message", (message: any) => {
      if (
        message.sender === contact.contact &&
        message.sender !== currentChatUser.uuid
      ) {
        setUnread((unread) => unread + 1);
      }
    });
    getUnreadMessages();
  }, [authenticatedUser.uuid, contact.contact]);

  return (
    <Popover
      position={Position.BOTTOM_RIGHT}
      isShown={showContextMenu}
      onClose={() => setShowContextMenu(false)}
      content={
        <Menu>
          <Menu.Group>
            <Menu.Item icon={EditIcon}>Rename</Menu.Item>
            <Menu.Divider />
            <Menu.Item
              icon={TrashIcon}
              onClick={(event: any) => setShowDeleteDialog(true)}
              intent="danger"
            >
              Delete
            </Menu.Item>
          </Menu.Group>
        </Menu>
      }
    >
      <Pane>
        <Dialog
          isShown={showDeleteDialog}
          intent="danger"
          onConfirm={deleteContact}
          onCloseComplete={() => setShowDeleteDialog(false)}
        >
          <Text>
            Are you sure you want to delete contact{" "}
            <Badge>{contact.name}</Badge>?
          </Text>
        </Dialog>
        <Table.Row
          key={contact.id}
          isSelectable
          height={60}
          onContextMenu={handleContextMenuEvent}
          onSelect={() => {
            dispatch(
              setCurrentChat({ username: contact.name, uuid: contact.contact })
            );
            setUnread(0);
            handleClickContact({
              username: contact.name,
              uuid: contact.contact,
            });
          }}
        >
          <Table.Cell flexBasis={70} flexShrink={0} flexGrow={0}>
            <Avatar name={contact.name} size={50} />
          </Table.Cell>
          <Table.TextCell>{contact.name}</Table.TextCell>
          <Table.Cell>
            <Pill
              marginLeft="auto"
              color="green"
              display={unread === 0 ? "none" : "block"}
            >
              {unread}
            </Pill>
          </Table.Cell>
        </Table.Row>
      </Pane>
    </Popover>
  );
};

export default Contact;
