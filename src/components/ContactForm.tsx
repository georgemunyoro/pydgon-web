import React, { useState } from "react";

import { setLoggedIn, setLoggedInUser } from "../actions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../reducers";

import { Pane, TextInputField, Button } from "evergreen-ui";

import Api from "../api";

interface Props {
  handleNewContactEvent: (contact: any) => void,
}

const ContactForm: React.FC<Props> = ({ handleNewContactEvent }) => {
  const [contactId, setContactId] = useState("");
  const [name, setName] = useState("");

  const addContact = async () => {
    try {
      const res = await Api.addContact(localStorage.getItem('jwt'), contactId, name);
      handleNewContactEvent(res.data);
    } catch(error) {
      console.error(error);
    }
  };

  return (
    <Pane margin={10}>
      <TextInputField
        onChange={(event: any) => setName(event.target.value)}
        label="Name"
        name="name"
        placeholder="John"
      />
      <TextInputField
        onChange={(event: any) => setContactId(event.target.value)}
        label="User ID"
        placeholder="..."
      />
      <Button onClick={addContact}>Add</Button>
    </Pane>
  );
}

export default ContactForm;
