
export const login = (userProfile: UserProfile): loginAction => ({
  type: 'LOGIN',
  userProfile,
});
