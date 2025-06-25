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
      state.pending = action.payload;
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
      const idx = state.active.findIndex((ntfn) => ntfn.id === action.payload);
      if (idx < 0) return;
      const newActive = [...state.active];
      newActive.splice(idx, 1);
      state.active = newActive;
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
  dispatch(pushNotification({ id: uuid(), type: "user", message, status, title }));
});

export const { setPending, pushNotification, dismissNotification } = ntfnsSlice.actions;

export const selectNotifications = (state: RootState) => state.notifications.pending;
export const selectActiveNotifications = (state: RootState) => state.notifications.active;

export default ntfnsSlice.reducer;
