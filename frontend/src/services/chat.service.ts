import { SimulateChatResponse } from '../types/chat.types';
import { API_URL, publicApiClient } from '../lib/api';

export type UploadedAttachmentMeta = {
  id: string;
  kind: 'document' | 'image' | 'video' | 'screen';
  name: string;
  mimeType: string;
  size: number;
};

export class ChatService {
  static apiUrl() {
    return API_URL;
  }

  static async simulate(
    message: string,
    modelId?: string,
    files?: File[],
  ): Promise<SimulateChatResponse> {
    const hasFiles = (files?.length ?? 0) > 0;

    if (!hasFiles) {
      const response = await publicApiClient.post<SimulateChatResponse>(
        '/chat/simulate',
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
    const response = await publicApiClient.post<SimulateChatResponse>(
      '/chat/simulate',
      form,
      { timeout: 30000 },
    );
    return response.data;
  }

  static async uploadAttachments(files: File[]): Promise<UploadedAttachmentMeta[]> {
    const form = new FormData();
    for (const f of files) form.append('files', f, f.name);

    const res = await publicApiClient.post<{ attachments: UploadedAttachmentMeta[] }>(
      '/chat/upload',
      form,
      { timeout: 30000 },
    );
    return res.data.attachments ?? [];
  }
}
