import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { RootState } from ".";
import { State } from "@/utils/types";
import { FileTreeNode, FSOpenDTO } from "@/models/filesystem";
import { openDir } from "@/services/env";

type EnvState = {
  uuid: string;
  explorer: FileTreeNode;
  state: State;
};

const initialState: EnvState = {
  uuid: "",
  explorer: { name: "workspace", path: "/", type: "dir", children: [] },
  state: State.INIT,
};

export const envSlice = createSlice({
  name: "env",
  initialState,
  reducers: {
    setUuid: (state, action: PayloadAction<string>) => {
      state.uuid = action.payload;
    },
    setExplorer: (state, action: PayloadAction<FSOpenDTO[]>) => {
      action.payload.forEach((node) => ((node as FileTreeNode).children = []));
      state.explorer.children = action.payload as FileTreeNode[];
    },
  },
});

export const openDirectory = createAsyncThunk<void, { uuid: string; path: string }>(
  "env/dir-open",
  async ({ uuid, path }, { rejectWithValue, dispatch }) => {
    try {
      const res = await openDir(uuid, path);
      dispatch(setUuid(uuid));
      dispatch(setExplorer(res.data));
    } catch (error) {
      console.log(error);
      if (isAxiosError(error)) return rejectWithValue(error.code);
      return rejectWithValue("Unexpected");
    }
  }
);

export const { setUuid, setExplorer } = envSlice.actions;

export const selectExplorer = (state: RootState) => state.env.explorer;

export default envSlice.reducer;
