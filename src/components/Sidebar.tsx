import React, { Ref } from "react";
import { Pane, defaultTheme } from "evergreen-ui";

import ContactList from "./ContactList";

import { ContactListRefObject } from "./ContactList";

interface Props {
  handleClickContact: Function;
  contactListRef: Ref<ContactListRefObject>;
  handleContactDeletion: (contact: any) => void;
}

const Sidebar: React.FC<Props> = ({ handleClickContact, contactListRef, handleContactDeletion }) => {
  return (
    <div id="sidebar">
      <Pane
        borderRight
        width="100%"
        background={defaultTheme.colors.background.tint1}
        style={{ height: "100vh" }}
      >
        <ContactList
          ref={contactListRef}
          handleContactDeletion={handleContactDeletion}
          handleClickContact={(user: any) => handleClickContact(user)}
        />
      </Pane>
    </div>
  );
};

export default Sidebar;
