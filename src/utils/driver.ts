import { schemaChange } from "@/config/database";
import { getAll, getObject, updateObject } from "@/config/database/ops";
import { UserNotificationPayload } from "@/models/notification";

export const storeSSHKey = async (uid: string, workspaceUUID: string, sshKey: string) => {
  await updateObject(`sshkeys:${uid}`, workspaceUUID, sshKey);
};

export const getSSHKey = async (uid: string, workspaceUUID: string) => {
  return await getObject<string>(`sshkeys:${uid}`, workspaceUUID);
};

export const storeUser = async (uid: string) => {
  await schemaChange(uid);
};

export const storePersistentNotification = async (uid: string, ntfn: UserNotificationPayload) => {
  await updateObject(`notifications:${uid}`, ntfn.id, ntfn);
};

export const getAllPersistentNotifications = async (uid: string) => {
  return await getAll<UserNotificationPayload>(`notifications:${uid}`);
};
