import { redirect } from 'next/navigation'
import { ChatRoom } from '@/components/chat/chat-room'

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3003";
const VERIFY_BASE_URL = `${BACKEND_URL}/post-visit/verify`;

async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${VERIFY_BASE_URL}/${token}`, { cache: 'no-store' })
    return res.ok
  } catch {
    return false
  }
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  if (!(await verifyToken(token))) {
    redirect('/')
  }

  return <ChatRoom token={token} />
}
