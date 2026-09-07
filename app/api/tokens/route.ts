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

// GET /api/tokens - Fetch all post-visit tokens
export async function GET(req: Request) {
  // const { token, unauthorized } = await requireStaff(req);
  // if (unauthorized) return unauthorized;

  try {
    const res = await fetch(`${BACKEND_URL}/post-visit`, {
      cache: 'no-store',
      // headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { success: false, error: errorText || 'Failed to fetch tokens from backend' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/tokens - Dispatch generate or create-test
export async function POST(req: Request) {
  // const { token, unauthorized } = await requireStaff(req);
  // if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const action = body.action || 'create-test';

    const endpoint =
      action === 'generate'
        ? `${BACKEND_URL}/post-visit/generate`
        : `${BACKEND_URL}/post-visit/create-test`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Action failed' },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
