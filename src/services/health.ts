import api, { actApi } from "@/config/axios";
import { ActivationResponse } from "@/models/health";

export const status = async () => {
  const response = await actApi.get<ActivationResponse>("/status");
  if (response.status !== 200) {
    throw new Error(`Status API failed (${response.status})`);
  }
  return response.data;
};

export const start = async (): Promise<ActivationResponse> => {
  const response = await actApi.post("/start");
  if (response.status !== 200) {
    throw new Error(`Activation failed (${response.status})`);
  }
  return response.data;
};

export const health = async (): Promise<boolean> => {
  try {
    const response = await api.get("/api/health");
    return response.status === 200;
  } catch {
    return false;
  }
};
