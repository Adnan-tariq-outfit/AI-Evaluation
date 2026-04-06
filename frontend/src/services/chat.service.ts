import axios from 'axios';
import { SimulateChatResponse } from '../types/chat.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ChatService {
  static async simulate(
    message: string,
    modelId?: string,
    files?: File[],
  ): Promise<SimulateChatResponse> {
    const hasFiles = (files?.length ?? 0) > 0;

    if (!hasFiles) {
      const response = await axios.post<SimulateChatResponse>(
        `${API_URL}/chat/simulate`,
        { message, modelId },
      );
      return response.data;
    }

    const form = new FormData();
    form.append('message', message);
    if (modelId) form.append('modelId', modelId);
    for (const f of files ?? []) {
      form.append('files', f, f.name);
    }

    // Important: don't manually set multipart Content-Type; axios will set the
    // correct boundary header automatically. Manually setting it can cause
    // requests to hang on some setups.
    const response = await axios.post<SimulateChatResponse>(`${API_URL}/chat/simulate`, form, {
      timeout: 30000,
    });
    return response.data;
  }
}
