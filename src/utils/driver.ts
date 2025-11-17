import { schemaChange } from "@/config/database";
import { deleteObject, getAll, getObject, storeExists, updateObject } from "@/config/database/ops";
import { UserNotificationPayload } from "@/models/notification";

export const storeSSHKey = async (uid: string, workspaceUUID: string, sshKey: string) => {
  await updateObject(`sshkeys:${uid}`, workspaceUUID, sshKey);
};

export const getSSHKey = async (uid: string, workspaceUUID: string) => {
  return await getObject<string>(`sshkeys:${uid}`, workspaceUUID);
};

export const storedUserExists = (uid: string) => {
  return storeExists(`sshkeys:${uid}`);
};

export const storeUser = async (uid: string) => {
  if (storedUserExists(uid)) return;
  await schemaChange(uid);
};

export const storePersistentNotification = async (uid: string, ntfn: UserNotificationPayload) => {
  await updateObject(`notifications:${uid}`, ntfn.id, ntfn);
};

export const getAllPersistentNotifications = async (uid: string) => {
  return await getAll<UserNotificationPayload>(`notifications:${uid}`);
};

export const deletePersistentNotification = async (uid: string, ntfnId: string) => {
  await deleteObject(`notifications:${uid}`, ntfnId);
};
