import { NextResponse } from 'next/server';
import { getBackendToken } from '@/lib/server-token';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3003';

// Verifies the NextAuth JWT server-side; doubles as the staff bearer for upstream.
// async function requireStaff(req: Request) {
//   const token = await getBackendToken(req);
//   if (!token) {
//     return {
//       token: null,
//       unauthorized: NextResponse.json(
//         { success: false, error: 'Unauthenticated' },
//         { status: 401 }
//       ),
//     };
//   }
//   return {
//     token,
//     unauthorized: null,
//   };
// }

// GET /api/tokens/available-records - Fetch available medical records for token creation
export async function GET(req: Request) {
  // const { token, unauthorized } = await requireStaff(req);
  // if (unauthorized) return unauthorized;

  try {
    const res = await fetch(`${BACKEND_URL}/post-visit/available-records`, {
      cache: 'no-store',
      // headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
