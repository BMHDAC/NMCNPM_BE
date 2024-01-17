import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { alertsSlice } from "./alertsSlice";
import user from "./user";
const rootReducer = combineReducers({
  alerts: alertsSlice.reducer,
  user : user
});

const store = configureStore({
  reducer: rootReducer,
});
export default store;
