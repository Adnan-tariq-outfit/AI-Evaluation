import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

type AttachmentMeta = {
  id: string;
  kind: 'document' | 'image' | 'video' | 'screen';
  name: string;
  mimeType: string;
  size: number;
};

type ChatMessagePayload = {
  clientMessageId: string;
  text: string;
  modelId?: string;
  attachments?: AttachmentMeta[];
};

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('chat:message')
  async onMessage(
    @MessageBody() payload: ChatMessagePayload,
    @ConnectedSocket() socket: Socket,
  ) {
    const serverMessageId = uuidv4();

    // Acknowledge receipt so the frontend can stop "sending" state.
    socket.emit('chat:ack', {
      clientMessageId: payload.clientMessageId,
      serverMessageId,
      receivedAt: new Date().toISOString(),
    });

    // Simulate "typing" + delayed response.
    socket.emit('chat:typing', { typing: true });

    const delayMs = 600 + Math.floor(Math.random() * 700);
    await new Promise((r) => setTimeout(r, delayMs));

    const attachmentsLine =
      payload.attachments && payload.attachments.length > 0
        ? `\n\nAttachments received:\n${payload.attachments
            .map((a) => `- ${a.name} (${a.mimeType}, ${a.size} bytes)`)
            .join('\n')}`
        : '';

    const safeText = (payload.text ?? '').trim();
    const replyText =
      safeText.length > 0
        ? `Mock assistant reply:\n\nYou said: "${safeText}".${attachmentsLine}\n\n(When a real model is plugged in, this will be replaced.)`
        : `Mock assistant reply:\n\nI received your attachments.${attachmentsLine}\n\n(When a real model is plugged in, this will be replaced.)`;

    socket.emit('chat:typing', { typing: false });
    socket.emit('chat:response', {
      inReplyTo: payload.clientMessageId,
      id: uuidv4(),
      role: 'assistant',
      content: replyText,
      timestamp: new Date().toISOString(),
    });
  }
}

