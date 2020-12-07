import { UserProfile } from "../types/global";

export const setCurrentChat = (userProfile: UserProfile) => ({
  type: "SET_CHAT",
  userProfile,
});

export const setSocket = (socket: SocketIOClient.Socket) => ({
  type: "SET_SOCKET",
  socket,
});

/*
export const sendMessage = (contactId: string, contents: string) => {
    type: 'SEND_MESSAGE',

}
*/
