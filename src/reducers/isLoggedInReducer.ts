
interface reduxAction {
  type: any,
}

const isLoggedInReducer = (state: boolean = false, action: reduxAction) => {
  switch(action.type) {
    case 'LOGIN':
      return true;
    case 'LOGOUT':
      return false;
    default:
      return state;
  };
};

export default isLoggedInReducer;
