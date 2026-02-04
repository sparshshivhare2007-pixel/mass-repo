"use client";

import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaPlus, FaHistory, FaCog, FaSignOutAlt, FaChartBar, FaMoon, FaSun, FaUsers } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SessionManager from './SessionManager';
import ReportExecutor from './ReportExecutor';
import ReportHistory from './ReportHistory';
import AnalyticsDashboard from './AnalyticsDashboard';
import UserManagement from './UserManagement';

export default function MassReportDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('analytics');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (data.success && data.user) {
        setUserRole(data.user.role);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/mass-report/login');
  };

  const tabs = [
    { id: 'analytics', label: 'Dashboard', icon: FaChartBar, color: 'from-blue-500 to-cyan-500' },
    { id: 'report', label: 'Mass Report', icon: FaPlus, color: 'from-indigo-500 to-purple-500' },
    { id: 'sessions', label: 'Sessions', icon: FaCog, color: 'from-purple-500 to-pink-500' },
    { id: 'history', label: 'History', icon: FaHistory, color: 'from-pink-500 to-rose-500' },
    ...(userRole === 'admin' ? [{ id: 'users', label: 'Users', icon: FaUsers, color: 'from-rose-500 to-orange-500' }] : [])
  ];

  return (
    <div className="min-h-screen animated-bg text-white">
      {/* Header with Glassmorphism */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass-strong sticky top-0 z-50 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-all ripple"
              >
                {drawerOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
              <motion.h1 
                className="text-xl font-bold gradient-text"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⚡ Mass Report System
              </motion.h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl glass hover:bg-white/10 transition-all ripple"
              >
                {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-indigo-400" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl transition-all text-sm font-semibold shadow-lg hover:shadow-red-500/50 ripple"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar - Desktop with Glassmorphism */}
        <motion.aside 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden lg:block w-72 glass-strong border-r border-white/10 min-h-[calc(100vh-4rem)] sticky top-16"
        >
          <nav className="p-4 space-y-2">
            {tabs.map((tab, idx) => (
              <motion.button
                key={tab.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all font-medium group relative overflow-hidden ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg glow`
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <tab.icon size={20} className={activeTab === tab.id ? 'animate-pulse-slow' : ''} />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="glass rounded-xl p-4 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">System Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-semibold">All Systems Operational</span>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Mobile Drawer with Animation */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" 
                onClick={() => setDrawerOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-72 glass-strong border-r border-white/10 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="mb-6 p-2 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <FaTimes size={20} />
                  </button>
                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setDrawerOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all font-medium ${
                          activeTab === tab.id
                            ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                            : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <tab.icon size={20} />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content with Animation */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'analytics' && <AnalyticsDashboard />}
                {activeTab === 'report' && <ReportExecutor />}
                {activeTab === 'sessions' && <SessionManager />}
                {activeTab === 'history' && <ReportHistory />}
                {activeTab === 'users' && userRole === 'admin' && <UserManagement />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Floating Action Button - Mobile */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveTab('report')}
        className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center z-40 glow-strong"
      >
        <FaPlus size={24} />
      </motion.button>
    </div>
  );
}
