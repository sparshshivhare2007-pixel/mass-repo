import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserFromToken } from '@/utils/jwt';

export async function GET() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token');

  if (!authToken) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const user = getUserFromToken(authToken.value);

  if (!user) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  return NextResponse.json({ 
    success: true, 
    user: { 
      id: user.userId, 
      email: user.email,
      role: user.role
    } 
  });
}
