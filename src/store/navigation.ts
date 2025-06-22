import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";

type NavState = {
  modal: string | null;
  prev: string | null;
};

const initialState: NavState = {
  modal: null,
  prev: null,
};

export const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    setModal: (state, action: PayloadAction<string | null>) => {
      state.modal = action.payload;
    },
    setPrev: (state, action: PayloadAction<string | null>) => {
      state.prev = action.payload;
    },
  },
});

export const { setModal, setPrev } = navSlice.actions;

export const selectNavigation = (state: RootState) => state.navigation;

export default navSlice.reducer;
