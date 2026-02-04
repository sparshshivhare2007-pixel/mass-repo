"use client";

import { useState, useEffect } from 'react';
import { FaPaperPlane, FaExclamationTriangle, FaUser, FaHashtag, FaLink, FaCheckCircle, FaRedo, FaBolt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const REPORT_REASONS = [
  "Report for child abuse",
  "Report for impersonation",
  "Report for copyrighted content",
  "Report an irrelevant geogroup",
  "Reason for Pornography",
  "Report an illegal durg",
  "Report for offensive person detail",
  "Report for spam",
  "Report for Violence"
];

const TARGET_EXAMPLES = [
  { icon: FaUser, text: '@username', desc: 'Username' },
  { icon: FaHashtag, text: '-1001234567890', desc: 'Channel ID' },
  { icon: FaLink, text: 't.me/channel', desc: 'Link' }
];

export default function ReportExecutor() {
  const [sessions, setSessions] = useState([]);
  const [formData, setFormData] = useState({
    target: '',
    reportReason: REPORT_REASONS[0],
    reportMessage: '',
    reportsPerSession: 1,
    sessionMode: 'all',
    selectedSessions: [],
    delayBetweenReports: 2
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions.filter(s => s.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const handleSessionToggle = (sessionId) => {
    setFormData(prev => ({
      ...prev,
      selectedSessions: prev.selectedSessions.includes(sessionId)
        ? prev.selectedSessions.filter(id => id !== sessionId)
        : [...prev.selectedSessions, sessionId]
    }));
  };

  const getTotalReports = () => {
    const sessionCount = formData.sessionMode === 'all' 
      ? sessions.length 
      : formData.selectedSessions.length;
    return sessionCount * formData.reportsPerSession;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.sessionMode === 'select' && formData.selectedSessions.length === 0) {
      alert('Please select at least one session');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      setResult(data);

      if (data.success) {
        setFormData({ 
          ...formData, 
          target: '', 
          reportMessage: '',
          selectedSessions: [] 
        });
      }
    } catch (error) {
      setResult({ success: false, message: 'Failed to execute report' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">⚡ Mass Report</h2>
          <p className="text-gray-400">Submit multiple reports using your sessions</p>
        </div>
        <div className="glass-strong rounded-xl px-6 py-3 border border-white/10">
          <p className="text-xs text-indigo-300 mb-1">Active Sessions</p>
          <p className="text-3xl font-bold text-indigo-400">{sessions.length}</p>
        </div>
      </motion.div>

      {/* Main Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              🎯 Target
            </label>
            <input
              type="text"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="w-full glass border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              placeholder="@username, user ID, channel ID, or t.me link"
              required
            />
            
            {/* Target Examples */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TARGET_EXAMPLES.map((example, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass rounded-lg p-3 border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer"
                  onClick={() => setFormData({ ...formData, target: example.text })}
                >
                  <div className="flex items-center gap-2 text-indigo-400 mb-1">
                    <example.icon className="text-xs" />
                    <span className="text-xs font-mono">{example.text}</span>
                  </div>
                  <p className="text-xs text-gray-500">{example.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Session Mode & Reports Per Session */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                📋 Session Mode
              </label>
              <select
                value={formData.sessionMode}
                onChange={(e) => setFormData({ ...formData, sessionMode: e.target.value })}
                className="w-full glass border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              >
                <option value="all">Use All Sessions</option>
                <option value="select">Select Specific</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                <FaRedo className="inline mr-2" />
                Reports Per Session
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.reportsPerSession}
                onChange={(e) => setFormData({ ...formData, reportsPerSession: parseInt(e.target.value) || 1 })}
                className="w-full glass border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                ⏱️ Delay (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.delayBetweenReports}
                onChange={(e) => setFormData({ ...formData, delayBetweenReports: parseInt(e.target.value) || 2 })}
                className="w-full glass border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          {/* Session Selection */}
          <AnimatePresence>
            {formData.sessionMode === 'select' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  ✅ Select Sessions ({formData.selectedSessions.length} selected)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto glass rounded-xl p-4 border border-white/10">
                  {sessions.map((session, idx) => (
                    <motion.label
                      key={session._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover-lift ${
                        formData.selectedSessions.includes(session._id)
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20'
                          : 'glass border-white/10 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedSessions.includes(session._id)}
                        onChange={() => handleSessionToggle(session._id)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{session.ownerName}</p>
                        {session.phoneNumber && (
                          <p className="text-gray-400 text-xs">{session.phoneNumber}</p>
                        )}
                      </div>
                    </motion.label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Total Reports Counter */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-indigo-500/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-300 text-sm font-semibold mb-1 flex items-center gap-2">
                  <FaBolt className="text-yellow-400" />
                  Total Reports to Execute
                </p>
                <p className="text-gray-400 text-xs">
                  {formData.sessionMode === 'all' ? sessions.length : formData.selectedSessions.length} sessions × {formData.reportsPerSession} reports each
                </p>
              </div>
              <motion.div 
                className="text-5xl font-bold gradient-text"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {getTotalReports()}
              </motion.div>
            </div>
          </motion.div>

          {/* Report Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              ⚠️ Report Reason
            </label>
            <select
              value={formData.reportReason}
              onChange={(e) => setFormData({ ...formData, reportReason: e.target.value })}
              className="w-full glass border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            >
              {REPORT_REASONS.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          {/* Report Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              💬 Report Message
            </label>
            <textarea
              value={formData.reportMessage}
              onChange={(e) => setFormData({ ...formData, reportMessage: e.target.value })}
              className="w-full glass border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 h-32 transition-all resize-none"
              placeholder="Describe the reason for reporting in detail..."
              required
            />
          </div>

          {/* Warning Box */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/50 rounded-xl p-5 flex items-start gap-4"
          >
            <FaExclamationTriangle className="text-yellow-400 text-2xl mt-1 flex-shrink-0 animate-pulse-slow" />
            <div className="text-sm text-yellow-100">
              <p className="font-bold mb-2">⚠️ Important Notice</p>
              <p className="text-yellow-200/90">
                This will submit {getTotalReports()} total reports. Each session will report {formData.reportsPerSession} time(s). Make sure you have verified the target.
              </p>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading || sessions.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-indigo-500/50 ripple"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Executing {getTotalReports()} Reports...</span>
              </>
            ) : (
              <>
                <FaPaperPlane className="text-xl" />
                <span>Execute {getTotalReports()} Mass Reports</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Result Display */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`mt-6 p-6 rounded-2xl border-2 ${
                result.success
                  ? 'bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/50'
                  : 'bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 border-red-500/50'
              }`}
            >
              <div className="flex items-start gap-4">
                {result.success ? (
                  <FaCheckCircle className="text-green-400 text-3xl mt-1 animate-bounce" />
                ) : (
                  <FaExclamationTriangle className="text-red-400 text-3xl mt-1 animate-pulse" />
                )}
                <div className="flex-1">
                  <p className={`font-bold text-xl mb-3 ${
                    result.success ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {result.success ? '✓ Reports Executed Successfully!' : '✗ Report Execution Failed'}
                  </p>
                  {result.success && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="glass rounded-xl p-4 border border-indigo-500/30">
                        <p className="text-indigo-200 text-sm font-semibold mb-1">Total Reports</p>
                        <p className="text-indigo-100 text-3xl font-bold">{result.totalReports || 0}</p>
                      </div>
                      <div className="glass rounded-xl p-4 border border-green-500/30">
                        <p className="text-green-200 text-sm font-semibold mb-1">Success</p>
                        <p className="text-green-100 text-3xl font-bold">{result.successCount}</p>
                      </div>
                      <div className="glass rounded-xl p-4 border border-red-500/30">
                        <p className="text-red-200 text-sm font-semibold mb-1">Failed</p>
                        <p className="text-red-100 text-3xl font-bold">{result.failureCount}</p>
                      </div>
                    </div>
                  )}
                  {!result.success && (
                    <p className="text-red-200 text-sm mt-2">{result.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
