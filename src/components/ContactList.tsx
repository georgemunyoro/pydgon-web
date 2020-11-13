import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  Ref,
} from "react";

import {
  Table,
  SearchInput,
  IconButton,
  AddIcon,
  Dialog,
  ShareIcon,
  Text,
  Spinner,
  Pane,
  toaster,
} from "evergreen-ui";
import Contact from "./Contact";
import ContactForm from "./ContactForm";

import { useSelector } from "react-redux";
import { RootState } from "../reducers";

import Api from "../api";

interface Props {
  handleClickContact: Function;
}

export interface ContactListRefObject {
  fetchContacts: () => void;
}

const ContactList: React.ForwardRefRenderFunction<
  ContactListRefObject,
  Props
> = ({ handleClickContact }, ref: Ref<ContactListRefObject>) => {
  const [contacts, setContacts] = useState([]);
  const [contactFilter, setContactFilter] = useState("");
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [showUserIdDialog, setShowUserIdDialog] = useState(false);
  const [fetchingContacts, setFetchingContacts] = useState(true);

  const user = useSelector((state: RootState) => state.user);

  async function fetchContacts(): Promise<void> {
    if (localStorage.hasOwnProperty("jwt")) {
      const res = await Api.getContacts(localStorage.getItem("jwt"));
      setContacts(res.data.data.contacts);
    }
  }

  useImperativeHandle(ref, () => ({
    fetchContacts,
  }));

  useEffect(() => {
    if (localStorage.hasOwnProperty("jwt")) fetchContacts();
    setFetchingContacts(false);
  }, []);

  return (
    <Table>
      <Dialog
        isShown={showAddContactDialog}
        title="Add a Contact"
        hasFooter={false}
        onCloseComplete={() => setShowAddContactDialog(false)}
      >
        <ContactForm
          handleNewContactEvent={(data: any) => {
            fetchContacts();
            setShowAddContactDialog(false);
            toaster.success(`Added user ${data.data.contact.name}`);
          }}
        />
      </Dialog>
      <Dialog
        isShown={showUserIdDialog}
        onCloseComplete={() => setShowUserIdDialog(false)}
        hasFooter={false}
        title="User Id"
      >
        <Pane display="flex" flexDirection="column">
          <Text>
            {user.firstname} {user.lastname}
          </Text>
          <Text>{user.username}</Text>
          <Text>{user.uuid}</Text>
        </Pane>
      </Dialog>
      <Table.Body>
        <Table.Row height={45}>
          <IconButton
            onClick={() => setShowAddContactDialog(true)}
            icon={AddIcon}
            margin={5}
            appearance="minimal"
          />
          <IconButton
            onClick={() => setShowUserIdDialog(true)}
            icon={ShareIcon}
            margin={5}
            appearance="minimal"
          />
          <SearchInput
            onChange={(event: any) => setContactFilter(event.target.value)}
            value={contactFilter}
            width="100%"
            margin={5}
          />
        </Table.Row>
        {fetchingContacts && (
          <Pane overflowY="hidden" width="100%">
            <Spinner margin="auto" marginTop="25%" />
          </Pane>
        )}
        {contacts
          ?.filter((contact: any) => contact.name.includes(contactFilter))
          .map((contact: any) => (
            <Contact
              handleClickContact={(user: any) => handleClickContact(user)}
              handleContactDeleteEvent={fetchContacts}
              key={contact.id}
              contact={contact}
            />
          ))}
      </Table.Body>
    </Table>
  );
};

export default forwardRef(ContactList);