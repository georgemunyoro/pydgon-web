import React, { useState } from "react";

import { setLoggedIn, setLoggedInUser } from "../actions";
import { useDispatch } from "react-redux";

import {
  Pane,
  TextInputField,
  Button,
  Tablist,
  Tab,
  toaster,
} from "evergreen-ui";

import Api from "../api";

interface Props {
  handleLoggedInEvent: (user: any) => void;
}

const LoginPopup: React.FC<Props> = ({ handleLoggedInEvent }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [isLoginView, setIsLoginView] = useState(true);

  const dispatch = useDispatch();

  const login = async () => {
    const res = await Api.login(email, password);
    localStorage.setItem("jwt", res.data.data.token);
    if (res.status === 200) {
      dispatch(setLoggedIn());
      const userInfo = await Api.getLoggedInUserInfo(res.data.data.token);
      dispatch(setLoggedInUser(userInfo.data.data.authenticatedUser));
      handleLoggedInEvent(userInfo);
      toaster.success("Login successful");
    } else {
      toaster.danger("An error ocurred while trying to login");
    }
  };

  const signup = async () => {
    const res = await Api.register({
      email,
      password,
      confirmPassword,
      firstname,
      lastname,
      username,
    });
    if (res.status === 200) {
      toaster.success(
        "Your account was created successfully, you can now login"
      );
      setIsLoginView(true);
    } else {
      res.data.error.forEach((error: any) => toaster.danger(error));
    }
  };

  return (
    <Pane margin={10}>
      <Tablist marginBottom={20}>
        <Tab isSelected={isLoginView} onSelect={() => setIsLoginView(true)}>
          Login
        </Tab>
        <Tab isSelected={!isLoginView} onSelect={() => setIsLoginView(false)}>
          Signup
        </Tab>
      </Tablist>
      {!isLoginView && (
        <TextInputField
          onChange={(event: any) => setUsername(event.target.value)}
          label="Username"
          placeholder="johndoe12"
          margin={5}
        />
      )}
      {!isLoginView && (
        <Pane width="100%" display="flex">
          <TextInputField
            onChange={(event: any) => setFirstname(event.target.value)}
            label="Firstname"
            placeholder="John"
            width="100%"
            margin={5}
          />
          <TextInputField
            onChange={(event: any) => setLastname(event.target.value)}
            label="Lastname"
            placeholder="Doe"
            width="100%"
            margin={5}
          />
        </Pane>
      )}
      <TextInputField
        onChange={(event: any) => setEmail(event.target.value)}
        label="Email"
        name="email"
        placeholder="gavin.belson@hooli.net"
        margin={5}
      />
      <TextInputField
        onChange={(event: any) => setPassword(event.target.value)}
        label="Password"
        type="password"
        placeholder="*******"
        margin={5}
      />
      {!isLoginView && (
        <TextInputField
          onChange={(event: any) => setConfirmPassword(event.target.value)}
          label="Confirm Password"
          type="password"
          placeholder="*******"
          margin={5}
        />
      )}
      {!isLoginView ? (
        <Button margin={5} onClick={signup}>
          Signup
        </Button>
      ) : (
        <Button margin={5} onClick={login}>
          Login
        </Button>
      )}
    </Pane>
  );
};

export default LoginPopup;
