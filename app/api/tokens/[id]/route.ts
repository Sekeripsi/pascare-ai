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

// PATCH /api/tokens/[id] - Toggle token isActive status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // const { token, unauthorized } = await requireStaff(req);
  // if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND_URL}/post-visit/toggle/${id}`, {
      method: 'PATCH',
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

// DELETE /api/tokens/[id] - Delete a post-visit token
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // const { token, unauthorized } = await requireStaff(req);
  // if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND_URL}/post-visit/${id}`, {
      method: 'DELETE',
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
