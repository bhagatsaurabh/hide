import { schemaChange } from "@/config/database";
import { getObject, updateObject } from "@/config/database/ops";

export const storeSSHKey = async (uid: string, workspaceUUID: string, sshKey: string) => {
  await updateObject(`sshkeys:${uid}`, workspaceUUID, sshKey);
};

export const getSSHKey = async (uid: string, workspaceUUID: string) => {
  return await getObject(`sshkeys:${uid}`, workspaceUUID);
};

export const storeUser = async (uid: string) => {
  await schemaChange(uid);
};
