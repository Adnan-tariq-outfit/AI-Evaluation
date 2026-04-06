'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatInputBar from './ChatInputBar';
import { ChatService } from '../services/chat.service';
import { setPendingChat } from '../lib/pendingChat';

export default function ChatInputBarLanding() {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();

  return (
    <ChatInputBar
      value={value}
      onChange={setValue}
      submitBehavior="submit"
      tabRedirectToChatHub={true}
      onSubmit={async (text, uploads) => {
        if (sending) return;
        setSending(true);

        const trimmed = text.trim();
        const files = uploads.map((u) => u.file);

        try {
          const result = await ChatService.simulate(trimmed, undefined, files);

          setPendingChat({
            text: trimmed,
            uploads,
            assistantReply: { reply: result.reply, timestamp: result.timestamp },
            model: result.model,
          });
        } catch {
          setPendingChat({
            text: trimmed,
            uploads,
            assistantReply: {
              reply:
                "I couldn't reach the chatbot API right now, but I did receive your message and attachments. Please try again in a moment.",
              timestamp: new Date().toISOString(),
            },
            model: null,
          });
        } finally {
          setSending(false);
        }

        router.push('/chat-hub');
      }}
      disabled={sending}
    />
  );
}

