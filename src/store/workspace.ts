import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { WorkspaceDTO } from "@/models/workspace";
import { getAllWorkspaces } from "@/services/workspace";
import { RootState } from ".";
import { State } from "@/utils/types";

type WorkspaceState = {
  workspaces: WorkspaceDTO[];
  state: State;
};

const initialState: WorkspaceState = {
  workspaces: [],
  state: State.INIT,
};

export const wsSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspaces: (state, action: PayloadAction<WorkspaceDTO[]>) => {
      state.workspaces = action.payload;
    },
  },
});

export const fetchWorkspaces = createAsyncThunk("workspace/get-all", async (_, { rejectWithValue, dispatch }) => {
  try {
    const res = await getAllWorkspaces();
    dispatch(setWorkspaces(res.data));
  } catch (error) {
    console.log(error);
    if (isAxiosError(error)) return rejectWithValue(error.code);
    return rejectWithValue("Unexpected");
  }
});

export const { setWorkspaces } = wsSlice.actions;

export const selectWorkspaces = (state: RootState) => ({
  workspaces: state.workspace.workspaces,
  state: state.workspace.state,
});

export default wsSlice.reducer;
