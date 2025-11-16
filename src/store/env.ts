import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from "@/utils/types";
import { RootState } from ".";
import { close, getTemplates, open } from "@/services/env";
import { notify } from "./notifications";
import { EnvCloseDTO, EnvOpenDTO, Template } from "@/models/env";
import { InternalNotificationPayload } from "@/models/notification";
import { getUserError } from "@/utils";

type EnvState = {
  uuid: string;
  state: State;
  templates: Template[];
};

const initialState: EnvState = {
  uuid: "",
  state: State.INIT,
  templates: [],
};

export const envSlice = createSlice({
  name: "env",
  initialState,
  reducers: {
    setUuid: (state, action: PayloadAction<string>) => {
      state.uuid = action.payload;
    },
    setTemplates: (state, action: PayloadAction<Template[]>) => {
      state.templates = action.payload;
    },
  },
});

export const openEnv = createAsyncThunk<{ success: boolean; wait?: boolean }, EnvOpenDTO>(
  "env/open",
  async (data, { dispatch }) => {
    try {
      const res = await open(data);
      return { success: true, wait: res.data.wait };
    } catch (error) {
      console.log(error);
      dispatch(notify(getUserError(error, "APPERR_0020").ntfn));
    }
    return { success: false };
  }
);
export const closeEnv = createAsyncThunk<void, EnvCloseDTO>("env/close", async (data) => {
  try {
    await close(data);
  } catch (error) {
    console.log(error);
  }
});
export const fetchTemplates = createAsyncThunk<Template[], void>("fetch/templates", async (_, { dispatch }) => {
  try {
    const res = await getTemplates();
    dispatch(setTemplates(res.data));
    return res.data;
  } catch (error) {
    console.log(error);
  }
  return [];
});

export const { setUuid, setTemplates } = envSlice.actions;

export const selectActiveUuid = (state: RootState) => state.env.uuid;
export const selectTemplates = (state: RootState) => state.env.templates;

export default envSlice.reducer;
