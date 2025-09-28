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

export type NotificationType = "workspace-invite" | "workspace-membership-removed" | "workspace-access-code" | "user";

export interface UserNotificationPayload extends InSocketMessagePayload {
  type: NotificationType;
  id: string;
  createdOn: string;
  actedOn?: string;
  isPersistent?: boolean;
}

export interface WorkspaceInvite extends UserNotificationPayload {
  inviterId: string;
  workspaceUUID: string;
  token: string;
}

export interface WorkspaceAccessRequest extends UserNotificationPayload {
  success: boolean;
  code: string;
  reqId: string;
}

export interface ExclusionData extends UserNotificationPayload {
  actorId: string;
  workspaceUUID: string;
  name: string;
}

export type NotificationReadDTO = {
  id: string;
};

export interface InternalNotificationPayload extends UserNotificationPayload {
  status: InternalNotificationType;
  title: string;
  message: string;
}

export type InternalNotificationType = "info" | "info-warning" | "warning" | "success" | "error";
