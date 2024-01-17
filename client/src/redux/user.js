import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null
  },
  reducers: {
    setUser: (state , action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      localStorage.clear()
      state.user = null
    }
  },
});

export const { setUser , reloadUserData, logout} = userSlice.actions;
export default userSlice.reducer