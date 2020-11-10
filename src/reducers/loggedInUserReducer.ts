
const initialState: UserProfile = {
  username: '',
  id: '',
};

const loggedInUserReducer = (state: UserProfile = initialState, action: loginAction) => {
  switch(action.type) {
    case 'LOGIN':
      return Object.assign(state, action.userProfile);
    default:
      return state;
  };
};

export default loggedInUserReducer;
