import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from "@/utils/types";
import { RootState } from ".";

type EnvState = {
  uuid: string;
  state: State;
};

const initialState: EnvState = {
  uuid: "",
  state: State.INIT,
};

export const envSlice = createSlice({
  name: "env",
  initialState,
  reducers: {
    setUuid: (state, action: PayloadAction<string>) => {
      state.uuid = action.payload;
    },
  },
});

export const { setUuid } = envSlice.actions;

export const selectActiveUuid = (state: RootState) => state.env.uuid;

export default envSlice.reducer;
