import api from "@/config/axios";
import { CreateUserDTO, UserSearchDTO } from "@/models/user";

export const register = async (data: CreateUserDTO) => {
  return await api.post("/user/register", data);
};

export const search = async (q: string, page: number) => {
  return await api.get<UserSearchDTO>(`/user/search?q=${q}&page=${page}`);
};
