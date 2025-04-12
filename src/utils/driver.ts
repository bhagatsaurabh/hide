import { getObject, updateObject } from "@/config/database/ops";

export const storeSSHKey = async (uid: string, workspaceUUID: string, sshKey: string) => {
  await updateObject(`sshkeys:${uid}`, workspaceUUID, sshKey);
};

export const getSSHKey = async (uid: string, workspaceUUID: string) => {
  await getObject(`sshkeys:${uid}`, workspaceUUID);
};
