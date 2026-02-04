import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/utils/db';
import TelegramSession from '@/models/TelegramSession';

export async function GET() {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const sessions = await TelegramSession.find({ userId: authToken.value, isActive: true }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { sessionString, ownerName, phoneNumber } = await request.json();

    if (!sessionString || !ownerName) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const session = await TelegramSession.create({
      userId: authToken.value,
      sessionString,
      ownerName,
      phoneNumber
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'Session ID required' }, { status: 400 });
    }

    await connectDB();
    await TelegramSession.findOneAndUpdate(
      { _id: sessionId, userId: authToken.value },
      { isActive: false }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
