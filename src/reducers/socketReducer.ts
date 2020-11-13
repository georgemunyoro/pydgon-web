
interface Action {
  type: string,
  socket: SocketIOClient.Socket,
}

const socketReducer = (state: SocketIOClient.Socket | null = null, action: Action) => {
  switch(action.type) {
    case 'SET_SOCKET':
      return action.socket;
    default:
      return state;
  };
};

export default socketReducer;
