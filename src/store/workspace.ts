import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { WorkspaceCreateDTO, WorkspaceDTO } from "@/models/workspace";
import { createWorkspace, getAllWorkspaces } from "@/services/workspace";
import { RootState } from ".";
import { State } from "@/utils/types";
import { updateObject } from "@/config/database/ops";
import { auth } from "@/config/firebase";
import { storeSSHKey } from "@/utils/driver";

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
    addWorkspace: (state, action: PayloadAction<WorkspaceDTO>) => {
      state.workspaces.push(action.payload);
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

export const createNewWorkspace = createAsyncThunk<void, WorkspaceCreateDTO>(
  "workspace/create",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const { workspace, privateKey } = (await createWorkspace(data)).data;
      await storeSSHKey(auth.currentUser!.uid, workspace.uuid, privateKey);
      dispatch(addWorkspace(workspace));
    } catch (error) {
      console.log(error);
      if (isAxiosError(error)) return rejectWithValue(error.code);
      return rejectWithValue("Unexpected");
    }
  }
);

export const { setWorkspaces, addWorkspace } = wsSlice.actions;

export const selectWorkspaces = (state: RootState) => ({
  workspaces: state.workspace.workspaces,
  state: state.workspace.state,
});

export default wsSlice.reducer;
