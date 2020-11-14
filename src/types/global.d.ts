interface loginAction {
  type: string;
  userProfile: UserProfile;
}

interface UserProfile {
  username?: string | null;
  id?: string | null | number;
  uuid?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  email?: string | null;
  password?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface UnsentMessage {
  sender: string;
  recepient: string;
  content: string;
}
