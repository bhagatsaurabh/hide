import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from "@/utils/types";

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

export default envSlice.reducer;
