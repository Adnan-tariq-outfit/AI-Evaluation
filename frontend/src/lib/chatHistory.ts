export const CHAT_HISTORY_STORAGE_KEY = "nexusai.chatHub.messages.v1";

export function clearChatHistory(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
}
