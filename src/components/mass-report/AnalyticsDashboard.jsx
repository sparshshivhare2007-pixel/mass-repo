"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaChartLine, FaCheckCircle, FaTimesCircle, FaUsers, FaDownload, FaRocket, FaTrophy } from 'react-icons/fa';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      
      if (data.success) {
        const csv = [
          ['Date', 'Target', 'Reason', 'Success', 'Failed', 'Status'],
          ...data.reports.map(r => [
            new Date(r.createdAt).toLocaleString(),
            r.target,
            r.reportReason,
            r.successCount || 0,
            r.failureCount || 0,
            r.status
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports_${Date.now()}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton h-32 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 glass rounded-2xl"
      >
        <FaChartLine className="text-6xl text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No data available yet</p>
        <p className="text-gray-500 text-sm mt-2">Start reporting to see analytics</p>
      </motion.div>
    );
  }

  const { overview, chartData, topSessions } = analytics;

  const statCards = [
    { 
      icon: FaRocket, 
      label: 'Total Reports', 
      value: overview.totalReports, 
      color: 'from-blue-600 to-cyan-600',
      iconColor: 'text-cyan-400'
    },
    { 
      icon: FaCheckCircle, 
      label: 'Success', 
      value: overview.totalSuccess, 
      color: 'from-green-600 to-emerald-600',
      iconColor: 'text-emerald-400'
    },
    { 
      icon: FaTimesCircle, 
      label: 'Failed', 
      value: overview.totalFailure, 
      color: 'from-red-600 to-rose-600',
      iconColor: 'text-rose-400'
    },
    { 
      icon: FaTrophy, 
      label: 'Success Rate', 
      value: `${overview.successRate}%`, 
      color: 'from-purple-600 to-pink-600',
      iconColor: 'text-pink-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">📊 Analytics Dashboard</h2>
          <p className="text-gray-400">Track your reporting performance in real-time</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportToCSV}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all font-semibold shadow-lg hover:shadow-indigo-500/50 ripple"
        >
          <FaDownload />
          Export CSV
        </motion.button>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className={`glass-strong rounded-2xl p-6 border border-white/10 hover-lift cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`text-3xl ${card.iconColor} group-hover:scale-110 transition-transform`} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">{card.label}</p>
            <motion.p 
              className="text-4xl font-bold text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 + 0.2, type: "spring" }}
            >
              {card.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Over Time */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-2xl p-6 border border-white/10 hover-lift"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <FaChartLine className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Reports Timeline</h3>
              <p className="text-sm text-gray-400">Last 7 days performance</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                  border: '1px solid rgba(99, 102, 241, 0.3)', 
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="success" 
                stroke="#10b981" 
                strokeWidth={3} 
                name="Success" 
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="failed" 
                stroke="#ef4444" 
                strokeWidth={3} 
                name="Failed"
                dot={{ fill: '#ef4444', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Sessions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-2xl p-6 border border-white/10 hover-lift"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <FaTrophy className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Top Sessions</h3>
              <p className="text-sm text-gray-400">Best performing accounts</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSessions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                  border: '1px solid rgba(99, 102, 241, 0.3)', 
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Legend />
              <Bar dataKey="success" fill="url(#successBar)" name="Success" radius={[8, 8, 0, 0]} />
              <Bar dataKey="failed" fill="url(#failedBar)" name="Failed" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="successBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="failedBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Session Stats Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-strong rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaUsers className="text-indigo-400" />
          Session Performance Details
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Session Name</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold">Total Reports</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold">Success</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold">Failed</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {topSessions.map((session, idx) => (
                <motion.tr 
                  key={idx} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4 text-white font-medium">{session.name}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg font-semibold">
                      {session.total}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg font-semibold">
                      {session.success}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg font-semibold">
                      {session.failed}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
                      parseFloat(session.rate) >= 80 ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' :
                      parseFloat(session.rate) >= 50 ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white' :
                      'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                    }`}>
                      {session.rate}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
