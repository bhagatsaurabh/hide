import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";
import { getPendingNotifications } from "@/services/notifications";
import { uuidv4 as uuid } from "lib0/random.js";
import { UserNotificationPayload } from "@/models/notification";

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
  },
});

export const fetchNotifications = createAsyncThunk("notifications/fetch-all", async (_, { dispatch }) => {
  try {
    const res = await getPendingNotifications();
    dispatch(setPending(res.data));
  } catch (error) {
    console.log(error);
    // TODO: Notify
  }
});
export const notify = createAsyncThunk<
  void,
  {
    status: "info" | "info-warning" | "warning" | "success" | "error";
    title: string;
    message: string;
  }
>("notifications/notify", async ({ status, message, title }, { dispatch }) => {
  dispatch(
    pushNotification({ id: uuid(), type: "user", message, status, title, createdOn: new Date().toISOString() })
  );
});

export const { setPending, pushNotification, dismissNotification, removeNotification } = ntfnsSlice.actions;

export const selectNotifications = (state: RootState) => state.notifications.pending;
export const selectActiveNotifications = (state: RootState) => state.notifications.active;

export default ntfnsSlice.reducer;
