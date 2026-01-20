import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Simple admin authentication
// In production, use proper auth like NextAuth.js
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'macdaddy2024';
const AUTH_COOKIE = 'macdaddy_admin_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// POST - Login
export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      // Create a simple token (in production, use JWT or proper session)
      const token = Buffer.from(`admin:${Date.now()}`).toString('base64');

      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

// GET - Check auth status
export async function GET() {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(AUTH_COOKIE);

    if (authCookie?.value) {
      return NextResponse.json({ success: true, authenticated: true });
    }

    return NextResponse.json({ success: true, authenticated: false });
  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json(
      { success: false, error: 'Auth check failed' },
      { status: 500 }
    );
  }
}

// DELETE - Logout
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
