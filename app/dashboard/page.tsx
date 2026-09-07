import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import DashboardClient from './dashboard-client'

// Server component: resolves the NextAuth session before anything renders.
export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <DashboardClient
      user={{
        id: session.user.id,
        name: session.user.name ?? '',
        username: session.user.username,
        role: session.user.role,
      }}
    />
  )
}
