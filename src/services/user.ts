import api from "@/config/axios";

export const register = async (data: { name: string; username: string }) => {
  await api.post("/user/register", { name: data.name, username: data.username });
};
