import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/utils/db';
import TelegramSession from '@/models/TelegramSession';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();

    await connectDB();
    const session = await TelegramSession.findOne({ _id: sessionId, userId: authToken.value });

    if (!session) {
      return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 });
    }

    const configPath = path.join(process.cwd(), 'python', 'check_session.json');
    await fs.writeFile(configPath, JSON.stringify({
      Session_String: session.sessionString
    }));

    try {
      const { stdout } = await execAsync('python python/check_session.py', { timeout: 10000 });
      
      const isValid = stdout.includes('VALID');
      
      await TelegramSession.findByIdAndUpdate(sessionId, {
        isActive: isValid,
        lastUsed: new Date()
      });

      return NextResponse.json({ 
        success: true, 
        isValid,
        message: isValid ? 'Session is active' : 'Session is invalid'
      });
    } catch (error) {
      await TelegramSession.findByIdAndUpdate(sessionId, { isActive: false });
      return NextResponse.json({ 
        success: false, 
        isValid: false,
        message: 'Session check failed'
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
