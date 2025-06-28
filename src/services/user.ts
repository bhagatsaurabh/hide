import api from "@/config/axios";
import { CreateUserDTO } from "@/models/user";

export const register = async (data: CreateUserDTO) => {
  return await api.post("/user/register", data);
};
