export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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
