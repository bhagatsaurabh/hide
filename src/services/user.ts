import api from "@/config/axios";
import { typesenseClient } from "@/config/typesense";
import { CreateUserDTO, User, UserSearchDTO } from "@/models/user";
import { SearchParams } from "typesense/lib/Typesense/Documents";

export const register = async (data: CreateUserDTO) => {
  return await api.post("/user/register", data);
};

export const update = async (data: Partial<User>) => {
  return await api.patch("/user/update", data);
};

export const search = async (uid: string, q: string, page: number) => {
  const searchParams: SearchParams<Partial<User>> = {
    q,
    query_by: ["name", "username"],
    filter_by: `uid:!=${uid}`,
    infix: ["always", "always"],
    per_page: 5,
    page: page || 1,
  };
  const res = await typesenseClient.collections<Partial<User>>("users").documents().search(searchParams);

  const result: UserSearchDTO = { data: [], page: res.page };
  if (res.hits) {
    result.data = res.hits.map((hit) => ({
      doc: hit.document,
      highlights: hit.highlights!.map((highlight) => ({
        field: highlight.field,
        snippet: highlight.snippet!,
      })),
    }));
  }
  return result;
};

export const getDetails = async (uid: string) => {
  return await api.get<User>(`/user/${uid}`);
};

export const deleteUser = async () => {
  return await api.delete("/user/delete");
};
