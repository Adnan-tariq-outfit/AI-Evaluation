export type ChatAttachmentKind = 'document' | 'image' | 'video' | 'screen';

export interface ChatAttachment {
  id: string;
  kind: ChatAttachmentKind;
  name: string;
  mimeType: string;
  size: number;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
}

export interface SimulateChatResponse {
  reply: string;
  model: {
    id: string;
    name: string;
    provider: string;
  } | null;
  timestamp: string;
}
