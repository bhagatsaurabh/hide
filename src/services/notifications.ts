import api from "@/config/axios";
import { NotificationReadDTO, UserNotificationPayload } from "@/models/notification";

export const getPendingNotifications = async () => {
  return await api.get<UserNotificationPayload[]>("/notification/all");
};

export const readNotification = async (data: NotificationReadDTO) => {
  return await api.post<NotificationReadDTO>("/notification/read", data);
};
