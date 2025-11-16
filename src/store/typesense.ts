import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { notify } from "./notifications";
import { getUserError } from "@/utils";
import { UserSearchDTO } from "@/models/user";
import { search } from "@/services/user";

interface TypesenseState {
  _: "";
}
const initialState: TypesenseState = { _: "" };

export const authSlice = createSlice({
  name: "typesense",
  initialState,
  reducers: {},
});

export const searchUsers = createAsyncThunk<UserSearchDTO | null, { uid: string; query: string; page: number }>(
  "typesense/search-users",
  async ({ uid, query, page }, { dispatch }) => {
    try {
      return await search(uid, query, page);
    } catch (error) {
      console.log(error);
      dispatch(notify(getUserError(error, "APPERR_0010").ntfn));
    }
    return null;
  }
);

export const selectStatus = (state: RootState) => state.auth.status;

export default authSlice.reducer;
