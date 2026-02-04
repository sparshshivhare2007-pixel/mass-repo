import { NextResponse } from 'next/server';
import { getUserFromToken } from './jwt';

export function authMiddleware(handler, requireAdmin = false) {
  return async (request) => {
    try {
      const token = request.cookies.get('auth_token')?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        );
      }

      const user = getUserFromToken(token);

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Invalid token' },
          { status: 401 }
        );
      }

      if (requireAdmin && user.role !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Admin access required' },
          { status: 403 }
        );
      }

      request.user = user;
      return handler(request);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}
