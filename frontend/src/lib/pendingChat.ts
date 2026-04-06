export type PendingUpload = {
  id: string;
  file: File;
  type: "document" | "image" | "video" | "screen";
};

export type PendingChatPayload = {
  text: string;
  uploads: PendingUpload[];
  assistantReply?: { reply: string; timestamp: string };
  model?: { id: string; name: string; provider: string } | null;
};

let pending: PendingChatPayload | null = null;

export function setPendingChat(next: PendingChatPayload) {
  pending = next;
}

export function consumePendingChat(): PendingChatPayload | null {
  const current = pending;
  pending = null;
  return current;
}

