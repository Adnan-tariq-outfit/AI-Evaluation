'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatInputBar from './ChatInputBar';
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
        setPendingChat({ text: trimmed, uploads });
        setSending(false);

        router.push('/chat-hub');
      }}
      disabled={sending}
    />
  );
}

