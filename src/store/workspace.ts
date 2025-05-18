import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { WorkspaceCreateDTO, WorkspaceDTO } from "@/models/workspace";
import { createWorkspace, getAllWorkspaces } from "@/services/workspace";
import { RootState } from ".";
import { auth } from "@/config/firebase";
import { storeSSHKey } from "@/utils/driver";

type WorkspaceState = {
  workspaces: WorkspaceDTO[];
  connected: boolean;
};

const initialState: WorkspaceState = {
  workspaces: [],
  connected: false,
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
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
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

export const { setWorkspaces, addWorkspace, setConnected } = wsSlice.actions;

export const selectConnected = (state: RootState) => state.workspace.connected;
export const selectWorkspaces = (state: RootState) => state.workspace;
export const selectWorkspace = (state: RootState, uuid: string) => {
  return state.workspace.workspaces.find((workspace) => workspace.uuid === uuid);
};

export default wsSlice.reducer;
