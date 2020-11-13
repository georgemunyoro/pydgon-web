import React, { useState } from "react";

import { useDispatch } from "react-redux";
import { setCurrentChat } from "../actions";

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
  toaster,
} from "evergreen-ui";

import Api from "../api";

interface UserContact {
  id: number;
  name: string;
  contact?: string;
}

interface Props {
  contact: UserContact;
  handleClickContact: (user: any) => void;
  handleContactDeleteEvent: () => void;
}

const Contact: React.FC<Props> = ({
  contact,
  handleClickContact,
  handleContactDeleteEvent,
}) => {
  const dispatch = useDispatch();

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
    handleContactDeleteEvent();
  };

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
        </Table.Row>
      </Pane>
    </Popover>
  );
};

export default Contact;
