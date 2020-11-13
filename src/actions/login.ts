
export const setLoggedInUser = (userProfile: UserProfile): loginAction => ({
  type: 'SET_USER',
  userProfile,
});

export const setLoggedIn = () => ({
    type: 'LOGIN',
});

export const setLoggedOut = () => ({
    type: 'LOGOUT',
});
