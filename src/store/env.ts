import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from "@/utils/types";
import { RootState } from ".";
import { close, open } from "@/services/env";
import { notify } from "./notifications";
import { EnvCloseDTO, EnvOpenDTO } from "@/models/env";

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

export const openEnv = createAsyncThunk<boolean, EnvOpenDTO>("env/open", async (data, { dispatch }) => {
  try {
    await open(data);
    return true;
  } catch (error) {
    console.log(error);
    dispatch(
      notify({
        title: "Failed to open workspace",
        message: "Could not open workspace, please try again later",
        status: "error",
      })
    );
  }
  return false;
});
export const closeEnv = createAsyncThunk<void, EnvCloseDTO>("env/close", async (data) => {
  try {
    await close(data);
  } catch (error) {
    console.log(error);
  }
});

export const { setUuid } = envSlice.actions;

export const selectActiveUuid = (state: RootState) => state.env.uuid;

export default envSlice.reducer;
