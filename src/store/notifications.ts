import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";
import { UserNotificationPayload } from "@/models/notification";
import { getPendingNotifications } from "@/services/notifications";

type NotificationsState = {
  pending: UserNotificationPayload[];
};

const initialState: NotificationsState = {
  pending: [],
};

export const ntfnsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setPending: (state, action: PayloadAction<UserNotificationPayload[]>) => {
      state.pending = action.payload;
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

export const { setPending } = ntfnsSlice.actions;

export const selectNotifications = (state: RootState) => state.notifications.pending;

export default ntfnsSlice.reducer;
