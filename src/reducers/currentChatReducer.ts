import { loginAction, UserProfile } from "../types/global";

const initialState: UserProfile = {};

const currentChatReducer = (
  state: UserProfile = initialState,
  action: loginAction
) => {
  switch (action.type) {
    case "SET_CHAT":
      return Object.assign(state, action.userProfile);
    default:
      return state;
  }
};

export default currentChatReducer;
