import { updateObject } from "@/config/database/ops";

export const storeSSHKey = async (uid: string, workspaceUUID: string, sshKey: string) => {
  await updateObject(`sshkeys:${uid}`, workspaceUUID, sshKey);
};
