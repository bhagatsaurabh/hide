import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { WorkspaceCreateDTO, WorkspaceDTO } from "@/models/workspace";
import { createWorkspace, getAllWorkspaces } from "@/services/workspace";
import { RootState } from ".";
import { auth } from "@/config/firebase";
import { storeSSHKey } from "@/utils/driver";

type WorkspaceState = {
  workspaces: WorkspaceDTO[];
  recent: WorkspaceDTO[];
  connected: boolean;
};

const initialState: WorkspaceState = {
  workspaces: [],
  recent: [],
  connected: false,
};

export const wsSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspaces: (state, action: PayloadAction<WorkspaceDTO[]>) => {
      state.workspaces = action.payload;
    },
    setRecent: (state, action: PayloadAction<WorkspaceDTO[]>) => {
      state.recent = action.payload;
    },
    addWorkspace: (state, action: PayloadAction<WorkspaceDTO>) => {
      state.workspaces.push(action.payload);
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
  },
});

export const fetchWorkspaces = createAsyncThunk("workspace/get-all", async (_, { dispatch }) => {
  try {
    const res = await getAllWorkspaces();
    const recentUuids = JSON.parse(localStorage.getItem(`recent:${auth.currentUser!.uid}`) ?? "[]") as string[];
    const recent = recentUuids
      .map((uuid) => res.data.find((workspace) => workspace.uuid === uuid))
      .filter((recentWorkspace) => !!recentWorkspace);
    dispatch(setRecent(recent));
    dispatch(setWorkspaces(res.data));
  } catch (error) {
    console.log(error);
  }
});

export const createNewWorkspace = createAsyncThunk<void, WorkspaceCreateDTO>("workspace/create", async (data) => {
  try {
    await createWorkspace(data);
  } catch (error) {
    console.log(error);
  }
});
export const processNewWorkspace = createAsyncThunk<void, { workspace: WorkspaceDTO; privateKey: string }>(
  "workspace/process",
  async ({ workspace, privateKey }, { dispatch }) => {
    try {
      await storeSSHKey(auth.currentUser!.uid, workspace.uuid, privateKey);
      dispatch(addWorkspace(workspace));
    } catch (error) {
      console.log(error);
    }
  }
);

export const { setWorkspaces, addWorkspace, setConnected, setRecent } = wsSlice.actions;

export const selectConnected = (state: RootState) => state.workspace.connected;
export const selectWorkspaces = (state: RootState) => state.workspace;
export const selectRecent = (state: RootState) => state.workspace.recent;
export const selectWorkspace = (state: RootState, uuid: string) => {
  return state.workspace.workspaces.find((workspace) => workspace.uuid === uuid);
};

export default wsSlice.reducer;
