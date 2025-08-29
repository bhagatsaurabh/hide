import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";
import { getPendingNotifications } from "@/services/notifications";
import { uuidv4 as uuid } from "lib0/random.js";
import {
  ExclusionData,
  InternalNotificationPayload,
  UserNotificationPayload,
  WorkspaceInvite,
} from "@/models/notification";
import { getAllPersistentNotifications, storePersistentNotification } from "@/utils/driver";
import { auth } from "@/config/firebase";
import { persistentNtfnsTypes } from "@/utils/constants";
import { getDetails } from "@/services/user";

type NotificationsState = {
  pending: UserNotificationPayload[];
  active: UserNotificationPayload[];
};

const initialState: NotificationsState = {
  pending: [],
  active: [],
};

export const ntfnsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setPending: (state, action: PayloadAction<UserNotificationPayload[]>) => {
      const map = new Map<string, UserNotificationPayload>();
      for (const ntfn of state.pending) {
        map.set(ntfn.id, ntfn);
      }
      for (const ntfn of action.payload) {
        map.set(ntfn.id, ntfn);
      }
      state.pending = [...map.values()];
    },
    pushNotification: (state, action: PayloadAction<UserNotificationPayload>) => {
      const newActive = [...state.active];
      if (newActive.length === 3) {
        newActive.shift();
      }
      newActive.push(action.payload);
      state.active = newActive;
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      const ntfn = state.active.find((ntfn) => ntfn.id === action.payload);
      if (!ntfn) return;
      const newActive = [...state.active];
      newActive.splice(state.active.indexOf(ntfn), 1);
      state.active = newActive;
      const newPending = [ntfn, ...state.pending];
      state.pending = newPending;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      let ntfn = state.pending.find((ntfn) => ntfn.id === action.payload);
      if (ntfn) {
        const updatedPending = [...state.pending];
        updatedPending.splice(
          state.pending.findIndex((ntfn) => ntfn.id === action.payload),
          1
        );
        state.pending = updatedPending;
      }
      ntfn = state.active.find((ntfn) => ntfn.id === action.payload);
      if (ntfn) {
        const updatedActive = [...state.active];
        updatedActive.splice(
          state.active.findIndex((ntfn) => ntfn.id === action.payload),
          1
        );
        state.active = updatedActive;
      }
    },
    removeAllNotifications: (state) => {
      state.pending = state.pending.filter((ntfn) => ntfn.isPersistent);
      state.active = state.active.filter((ntfn) => ntfn.isPersistent);
    },
  },
});

export const fetchNotifications = createAsyncThunk<void, UserNotificationPayload[] | undefined>(
  "notifications/fetch-all",
  async (loadedNtfns, { dispatch }) => {
    try {
      let notifications: UserNotificationPayload[];
      if (!loadedNtfns) {
        notifications = (await getPendingNotifications()).data;
      } else {
        notifications = loadedNtfns;
      }
      const ntfns = await Promise.all(notifications.map((ntfn) => dispatch(process(ntfn)).unwrap()));
      await Promise.allSettled(
        ntfns
          .filter((ntfn) => ntfn.isPersistent)
          .map((ntfn) => storePersistentNotification(auth.currentUser!.uid, ntfn))
      );
      dispatch(setPending(ntfns));
    } catch (error) {
      console.log(error);
      dispatch(
        notify({
          status: "warning",
          title: "Could not fetch latest notifications",
          message: "Something went wrong while getting recent notifications",
        } as InternalNotificationPayload)
      );
    }
  }
);
export const loadNotifications = createAsyncThunk("notifications/load-all", async (_, { dispatch }) => {
  try {
    const ntfns = await getAllPersistentNotifications(auth.currentUser!.uid);
    dispatch(setPending(ntfns));
  } catch (error) {
    console.log(error);
    dispatch(
      notify({
        status: "warning",
        title: "Could not load notifications",
        message: "Something went wrong while loading notifications",
      } as InternalNotificationPayload)
    );
  }
});
export const notify = createAsyncThunk<void, InternalNotificationPayload | UserNotificationPayload>(
  "notifications/notify",
  async (ntfn, { dispatch }) => {
    if (typeof ntfn.type === "string") {
      ntfn = await dispatch(process(ntfn)).unwrap();
      if (ntfn.isPersistent) {
        await storePersistentNotification(auth.currentUser!.uid, ntfn);
      }
      dispatch(pushNotification(ntfn));
    } else {
      dispatch(
        pushNotification({
          id: uuid(),
          type: "user",
          message: ntfn.message,
          status: ntfn.status,
          title: ntfn.title,
          createdOn: new Date().toISOString(),
        })
      );
    }
  }
);
const process = createAsyncThunk<UserNotificationPayload, UserNotificationPayload>(
  "notifications/process",
  async (notification) => {
    if (persistentNtfnsTypes.includes(notification.type)) {
      notification.isPersistent = true;
    }
    if (notification.type === "workspace-invite") {
      const ntfn = notification as WorkspaceInvite;
      try {
        const res = await getDetails(ntfn.inviterId);
        ntfn.inviterName = res.data.name;
        ntfn.inviterUsername = res.data.username;
      } catch (error) {
        console.log(error);
        ntfn.inviterName = "Unknown";
        ntfn.inviterUsername = "Unknown";
      }
    } else if (notification.type === "workspace-membership-removed") {
      const ntfn = notification as InternalNotificationPayload;
      ntfn.status = "info";
      ntfn.title = "Membership removed";
      ntfn.message = `You've been removed from workspace: ${(notification as ExclusionData).name}`;
      ntfn.type = "user";
    }
    return notification;
  }
);

export const { setPending, pushNotification, dismissNotification, removeNotification, removeAllNotifications } =
  ntfnsSlice.actions;

export const selectNotifications = (state: RootState) => state.notifications.pending;
export const selectActiveNotifications = (state: RootState) => state.notifications.active;

export default ntfnsSlice.reducer;
