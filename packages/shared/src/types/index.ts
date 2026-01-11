// Shared types for J-address application

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum InboxStatus {
  RECEIVED = "RECEIVED",
  ACTION_REQUESTED = "ACTION_REQUESTED",
  COMPLETED = "COMPLETED",
}

export enum ActionType {
  NONE = "NONE", // そのまま
  SEND = "SEND", // 転送
  SCAN = "SCAN", // スキャン
  DISCARD = "DISCARD", // 廃棄
}

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inbox {
  id: number;
  imageUrl?: string;
  status: InboxStatus;
  requestedAction: ActionType;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
