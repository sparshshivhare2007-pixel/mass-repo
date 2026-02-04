"use client";

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaChevronDown, FaChevronUp, FaFilter, FaSearch, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500 text-xl" />;
      case 'failed':
        return <FaTimesCircle className="text-red-500 text-xl" />;
      default:
        return <FaClock className="text-yellow-500 text-xl animate-pulse" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'from-green-600/20 to-emerald-600/20 border-green-500/30';
      case 'failed':
        return 'from-red-600/20 to-rose-600/20 border-red-500/30';
      default:
        return 'from-yellow-600/20 to-orange-600/20 border-yellow-500/30';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = report.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportReason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton h-48 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">📜 Report History</h2>
          <p className="text-gray-400">View all your past mass reports</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-xl px-4 py-2 border border-white/10">
            <p className="text-xs text-gray-400">Total Reports</p>
            <p className="text-2xl font-bold text-white">{reports.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-4 border border-white/10"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by target or reason..."
              className="w-full glass border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {['all', 'completed', 'failed', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-3 rounded-xl font-semibold transition-all capitalize ${
                  filter === status
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'glass hover:bg-white/10 text-gray-300 border border-white/10'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredReports.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 glass-strong rounded-2xl border border-white/10"
            >
              <FaClock className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No reports found</p>
              <p className="text-gray-500 text-sm">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Execute your first mass report to see history'}
              </p>
            </motion.div>
          ) : (
            filteredReports.map((report, idx) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="relative"
              >
                {/* Timeline Line */}
                {idx !== filteredReports.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/50 to-transparent"></div>
                )}

                <div className={`glass-strong rounded-2xl overflow-hidden border hover-lift ${getStatusColor(report.status)}`}>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        {getStatusIcon(report.status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                              {report.target}
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                report.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                report.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {report.status}
                              </span>
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">{report.reportReason}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                              <FaClock />
                              {new Date(report.createdAt).toLocaleString()}
                            </p>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all"
                          >
                            {expandedReport === report._id ? <FaChevronUp /> : <FaChevronDown />}
                          </motion.button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="glass rounded-xl p-3 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Sessions</p>
                            <p className="text-2xl font-bold text-indigo-400">{report.sessionsUsed}</p>
                          </div>
                          <div className="glass rounded-xl p-3 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Success</p>
                            <p className="text-2xl font-bold text-green-400">{report.successCount}</p>
                          </div>
                          <div className="glass rounded-xl p-3 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Failed</p>
                            <p className="text-2xl font-bold text-red-400">{report.failureCount}</p>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {expandedReport === report._id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 pt-4 border-t border-white/10"
                            >
                              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                📝 Report Message
                              </h4>
                              <p className="text-sm text-gray-300 glass rounded-xl p-4 mb-4 border border-white/10">
                                {report.reportMessage}
                              </p>

                              {report.results && report.results.length > 0 && (
                                <>
                                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    🎯 Session Results
                                  </h4>
                                  <div className="space-y-2">
                                    {report.results.map((result, idx) => (
                                      <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex items-center justify-between glass rounded-xl p-3 border border-white/10"
                                      >
                                        <span className="text-sm text-gray-300 font-medium">{result.sessionName}</span>
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                          result.status === 'success'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                        }`}>
                                          {result.status}
                                        </span>
                                      </motion.div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
