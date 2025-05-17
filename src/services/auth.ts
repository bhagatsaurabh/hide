import { publicApi } from "@/config/axios";
import { UsernameAvailabilityDTO } from "@/models/user";

export const checkUsername = async (username: string) => {
  return await publicApi.get<UsernameAvailabilityDTO>("/check-username", {
    params: {
      username,
    },
  });
};
