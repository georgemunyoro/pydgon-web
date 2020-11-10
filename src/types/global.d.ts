
interface loginAction {
  type: string,
  userProfile: UserProfile,
}

interface UserProfile {
  username: string,
  id: string,
  avatarImageUrl?: string,
  apiKey?: string,
}
