import { combineReducers } from 'redux';
import loggedInUserReducer from './loggedInUserReducer';

export const allReducers = combineReducers({
  loggedInUserReducer
});
