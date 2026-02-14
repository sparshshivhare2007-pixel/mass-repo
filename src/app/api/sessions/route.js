import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import TelegramSession from '@/models/TelegramSession';

const STATIC_USER_ID = "admin-user"; // fixed user id

export async function GET() {
  try {
    await connectDB();
    const sessions = await TelegramSession.find({
      userId: STATIC_USER_ID,
      isActive: true
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { sessionString, ownerName, phoneNumber } = await request.json();

    if (!sessionString || !ownerName) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const session = await TelegramSession.create({
      userId: STATIC_USER_ID,
      sessionString,
      ownerName,
      phoneNumber,
      isActive: true
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'Session ID required' }, { status: 400 });
    }

    await connectDB();

    await TelegramSession.findOneAndUpdate(
      { _id: sessionId, userId: STATIC_USER_ID },
      { isActive: false }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
