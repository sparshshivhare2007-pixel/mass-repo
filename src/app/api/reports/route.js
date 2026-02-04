import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/utils/db';
import TelegramSession from '@/models/TelegramSession';
import ReportLog from '@/models/ReportLog';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const reports = await ReportLog.find({ userId: authToken.value }).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json({ success: true, reports });
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

    const { target, reportReason, reportMessage, reportsPerSession = 1, sessionMode = 'all', selectedSessions = [], delayBetweenReports = 2 } = await request.json();

    if (!target || !reportReason || !reportMessage) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    
    // Get sessions based on mode
    let sessions;
    if (sessionMode === 'select' && selectedSessions.length > 0) {
      sessions = await TelegramSession.find({ 
        userId: authToken.value, 
        isActive: true,
        _id: { $in: selectedSessions }
      });
    } else {
      sessions = await TelegramSession.find({ userId: authToken.value, isActive: true });
    }

    if (sessions.length === 0) {
      return NextResponse.json({ success: false, message: 'No active sessions found' }, { status: 400 });
    }

    const reportLog = await ReportLog.create({
      userId: authToken.value,
      target,
      reportReason,
      reportMessage,
      sessionsUsed: sessions.length,
      status: 'processing'
    });

    const configPath = path.join(process.cwd(), 'python', 'config.json');
    const config = {
      Target: target,
      accounts: sessions.map(s => ({
        Session_String: s.sessionString,
        OwnerName: s.ownerName
      }))
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    try {
      const { stdout, stderr } = await execAsync(
        `python python/mass_report.py "${reportReason}" ${reportsPerSession} ${delayBetweenReports}`
      );

      const results = [];
      let successCount = 0;
      let failureCount = 0;

      // Parse structured output
      const lines = stdout.split('\n');
      lines.forEach(line => {
        if (line.startsWith('SUCCESS|')) {
          const [, name, message] = line.split('|');
          successCount++;
          results.push({
            sessionName: name,
            status: 'success',
            message: message || 'Report submitted',
            timestamp: new Date()
          });
        } else if (line.startsWith('FAILED|')) {
          const [, name, error] = line.split('|');
          failureCount++;
          results.push({
            sessionName: name,
            status: 'failed',
            message: error || 'Failed to submit',
            timestamp: new Date()
          });
        }
      });

      // If no structured output, fallback to session count
      if (results.length === 0) {
        sessions.forEach(session => {
          results.push({
            sessionName: session.ownerName,
            status: 'unknown',
            message: 'No response',
            timestamp: new Date()
          });
        });
      }

      const totalReports = sessions.length * reportsPerSession;

      await ReportLog.findByIdAndUpdate(reportLog._id, {
        status: 'completed',
        successCount,
        failureCount,
        results
      });

      return NextResponse.json({ 
        success: true, 
        reportId: reportLog._id,
        totalReports,
        successCount,
        failureCount
      });
    } catch (error) {
      await ReportLog.findByIdAndUpdate(reportLog._id, {
        status: 'failed'
      });

      return NextResponse.json({ 
        success: false, 
        message: 'Failed to execute report: ' + error.message 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
