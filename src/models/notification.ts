import { InSocketMessagePayload } from "./common";

export type NotificationPayloadMap = {
  new: UserNotificationPayload;
  pending: UserNotificationPayload[];
};
export type NotificationPayload = {
  [K in keyof NotificationPayloadMap]: {
    action: K;
    payload: NotificationPayloadMap[K];
  };
}[keyof NotificationPayloadMap];

export type NotificationType = "workspace-invite" | "workspace-membership-removed";

export interface UserNotificationPayload extends InSocketMessagePayload {
  type: NotificationType;
  id: string;
}

export interface WorkspaceInvite extends UserNotificationPayload {
  inviterId: string;
  workspaceUUID: string;
  token: string;
}

export interface ExclusionData extends UserNotificationPayload {
  actorId: string;
  workspaceUUID: string;
}

export type NotificationReadDTO = {
  id: string;
};
