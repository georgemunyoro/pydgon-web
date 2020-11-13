
const initialState: UserProfile = {
};

const loggedInUserReducer = (state: UserProfile = initialState, action: loginAction) => {
  switch(action.type) {
    case 'SET_USER':
      return Object.assign(state, action.userProfile);
    default:
      return state;
  };
};

export default loggedInUserReducer;
