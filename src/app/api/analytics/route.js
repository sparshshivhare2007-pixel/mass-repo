import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/utils/db';
import ReportLog from '@/models/ReportLog';
import TelegramSession from '@/models/TelegramSession';

export async function GET() {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const reports = await ReportLog.find({ userId: authToken.value });
    const sessions = await TelegramSession.find({ userId: authToken.value });

    const totalReports = reports.length;
    const totalSuccess = reports.reduce((sum, r) => sum + (r.successCount || 0), 0);
    const totalFailure = reports.reduce((sum, r) => sum + (r.failureCount || 0), 0);
    const successRate = totalReports > 0 ? ((totalSuccess / (totalSuccess + totalFailure)) * 100).toFixed(1) : 0;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayReports = reports.filter(r => {
        const reportDate = new Date(r.createdAt);
        return reportDate >= date && reportDate < nextDate;
      });
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        success: dayReports.reduce((sum, r) => sum + (r.successCount || 0), 0),
        failed: dayReports.reduce((sum, r) => sum + (r.failureCount || 0), 0)
      });
    }

    const sessionStats = {};
    reports.forEach(report => {
      report.results?.forEach(result => {
        if (!sessionStats[result.sessionName]) {
          sessionStats[result.sessionName] = { success: 0, failed: 0 };
        }
        if (result.status === 'success') {
          sessionStats[result.sessionName].success++;
        } else {
          sessionStats[result.sessionName].failed++;
        }
      });
    });

    const topSessions = Object.entries(sessionStats)
      .map(([name, stats]) => ({
        name,
        success: stats.success,
        failed: stats.failed,
        total: stats.success + stats.failed,
        rate: ((stats.success / (stats.success + stats.failed)) * 100).toFixed(1)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalReports,
          totalSuccess,
          totalFailure,
          successRate,
          activeSessions: sessions.filter(s => s.isActive).length,
          totalSessions: sessions.length
        },
        chartData: last7Days,
        topSessions
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
