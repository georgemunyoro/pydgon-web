import { combineReducers } from 'redux';
import loggedInUserReducer from './loggedInUserReducer';
import isLoggedInReducer from './isLoggedInReducer'
import currentChatReducer from './currentChatReducer';
import socketReducer from './socketReducer';

export const rootReducer = combineReducers({
  user: loggedInUserReducer,
  isLoggedIn: isLoggedInReducer,
  currentChatUser: currentChatReducer,
  socket: socketReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
