import axios from 'axios';
import { SimulateChatResponse } from '../types/chat.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ChatService {
  static async simulate(message: string, modelId?: string): Promise<SimulateChatResponse> {
    const response = await axios.post<SimulateChatResponse>(
      `${API_URL}/chat/simulate`,
      { message, modelId },
    );
    return response.data;
  }
}
