import api from "@/config/axios";

export const register = async () => {
  await api.post("/user/register");
};
