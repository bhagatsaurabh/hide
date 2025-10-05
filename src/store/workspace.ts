import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { WorkspaceCreateDTO, WorkspaceDTO, WorkspaceUpdateDTO } from "@/models/workspace";
import {
  acceptInvitation,
  createWorkspace,
  deleteAccess,
  deleteWorkspace,
  getAllWorkspaces,
  ignoreInvitation,
  requestAccess,
  updateWorkspace,
} from "@/services/workspace";
import { RootState } from ".";
import { auth } from "@/config/firebase";
import { storeSSHKey } from "@/utils/driver";
import { notify, removeNotification } from "./notifications";
import { InternalNotificationPayload, WorkspaceAccessRequest, WorkspaceInvite } from "@/models/notification";
import { isAxiosError } from "axios";

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

export const createNewWorkspace = createAsyncThunk<{ success: boolean; wait?: boolean }, WorkspaceCreateDTO>(
  "workspace/create",
  async (data, { dispatch }) => {
    try {
      const res = await createWorkspace(data);
      return { success: true, wait: res.data.wait };
    } catch (error) {
      dispatch(
        notify({
          title: "Failed to create new workspace",
          message: "Something went wrong when creating new workspace, please try again later",
          status: "error",
        } as InternalNotificationPayload)
      );
      console.log(error);
    }
    return { success: false };
  }
);
export const processNewWorkspace = createAsyncThunk<void, { workspace: WorkspaceDTO; privateKey: string }>(
  "workspace/process",
  async ({ workspace, privateKey }, { dispatch }) => {
    try {
      await storeSSHKey(auth.currentUser!.uid, workspace.uuid, privateKey);
      dispatch(addWorkspace(workspace));
    } catch (error) {
      dispatch(
        notify({
          title: "Failed to create new workspace",
          message: "Something went wrong when creating new workspace, please try again later.",
          status: "error",
        } as InternalNotificationPayload)
      );
      console.log(error);
    }
  }
);
export const updateExistingWorkspace = createAsyncThunk<boolean, WorkspaceUpdateDTO>(
  "workspace/update",
  async (data, { dispatch }) => {
    try {
      await updateWorkspace(data);
      await dispatch(fetchWorkspaces());
      return true;
    } catch (error) {
      dispatch(
        notify({
          title: "Failed to update workspace",
          message: "Something went wrong when updating the workspace, please try again later.",
          status: "error",
        } as InternalNotificationPayload)
      );
      console.log(error);
    }
    return false;
  }
);
export const deleteExistingWorkspace = createAsyncThunk<boolean, string>(
  "workspace/delete",
  async (uuid: string, { dispatch }) => {
    try {
      await deleteWorkspace(uuid);
      return true;
    } catch (error) {
      dispatch(
        notify({
          title: "Failed to delete workspace",
          message: "Something went wrong when deleting the workspace, please try again later.",
          status: "error",
        } as InternalNotificationPayload)
      );
      console.log(error);
    }
    return false;
  }
);
export const requestDedicatedAccess = createAsyncThunk<boolean, { reason?: string }>(
  "workspace/access",
  async ({ reason = "" }, { dispatch }) => {
    try {
      await requestAccess(reason);
      dispatch(
        notify({
          title: "Access request",
          message: "Request submitted successfully ! You'll get a notification with an access code soon",
          status: "success",
        } as InternalNotificationPayload)
      );
      return true;
    } catch (error) {
      if (isAxiosError(error)) {
        // TODO
        console.log(error.toJSON());
      } else {
        console.log(error);
      }
      dispatch(
        notify({
          title: "Failed to request access code",
          message: "Something went wrong when requesting the access code, please try again later.",
          status: "error",
        } as InternalNotificationPayload)
      );
    }
    return false;
  }
);
export const respondToInvitation = createAsyncThunk<void, { accept: boolean; ntfn: WorkspaceInvite }>(
  "workspace/respond-invite",
  async ({ accept, ntfn }, { dispatch }) => {
    try {
      if (accept) {
        const res = await acceptInvitation({ id: ntfn.id, token: ntfn.token });
        await storeSSHKey(auth.currentUser!.uid, ntfn.workspaceUUID, res.data.sshKey);
        await dispatch(fetchWorkspaces());
      } else {
        await ignoreInvitation({ id: ntfn.id, token: ntfn.token });
      }
      dispatch(removeNotification(ntfn.id));
    } catch (error) {
      if (!accept) return;
      dispatch(
        notify({
          title: "Failed to accept invitation",
          message: "Something went wrong while accepting the invitation, please try again.",
          status: "error",
        } as InternalNotificationPayload)
      );
      console.log(error);
    }
  }
);
export const deleteAccessCode = createAsyncThunk<void, WorkspaceAccessRequest>(
  "workspace/delete-access",
  async (ntfn, { dispatch }) => {
    try {
      await deleteAccess(ntfn.reqId, ntfn.id);
      dispatch(removeNotification(ntfn.id));
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
export const selectWorkspaceById = (state: RootState, id: number) => {
  return state.workspace.workspaces.find((workspace) => workspace.id === id);
};
export const selectDedicatedWorkspacesCount = (state: RootState) =>
  state.workspace.workspaces.filter((wrspc) => wrspc.dedicated).length;

export default wsSlice.reducer;
