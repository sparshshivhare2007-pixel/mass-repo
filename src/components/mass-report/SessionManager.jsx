"use client";

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaCheckCircle, FaTimesCircle, FaSync, FaPhone, FaUser, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function SessionManager() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [checkingSession, setCheckingSession] = useState(null);
  const [formData, setFormData] = useState({
    sessionString: '',
    ownerName: '',
    phoneNumber: ''
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setSessions([data.session, ...sessions]);
        setFormData({ sessionString: '', ownerName: '', phoneNumber: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add session:', error);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const res = await fetch(`/api/sessions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions(sessions.filter(s => s._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleCheckSession = async (sessionId) => {
    setCheckingSession(sessionId);
    try {
      const res = await fetch('/api/session-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      
      setSessions(sessions.map(s => 
        s._id === sessionId ? { ...s, isActive: data.isValid } : s
      ));
      
      alert(data.message);
    } catch (error) {
      alert('Failed to check session');
    } finally {
      setCheckingSession(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="skeleton h-40 rounded-2xl"></div>
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
          <h2 className="text-4xl font-bold gradient-text mb-2">🔐 Telegram Sessions</h2>
          <p className="text-gray-400">Manage your reporting accounts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all font-semibold shadow-lg hover:shadow-indigo-500/50 ripple"
        >
          <FaPlus />
          Add Session
        </motion.button>
      </motion.div>

      {/* Stats Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        <div className="glass-strong rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Total Sessions</p>
          <p className="text-3xl font-bold text-white">{sessions.length}</p>
        </div>
        <div className="glass-strong rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Active</p>
          <p className="text-3xl font-bold text-green-400">{sessions.filter(s => s.isActive).length}</p>
        </div>
        <div className="glass-strong rounded-xl p-4 border border-white/10 col-span-2 sm:col-span-1">
          <p className="text-gray-400 text-sm mb-1">Inactive</p>
          <p className="text-3xl font-bold text-red-400">{sessions.filter(s => !s.isActive).length}</p>
        </div>
      </motion.div>

      {/* Add Session Modal */}
      <Transition appear show={showAddForm} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowAddForm(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl glass-strong border border-white/10 p-6 shadow-2xl transition-all">
                  <Dialog.Title className="text-2xl font-bold text-white mb-6 gradient-text">
                    ➕ Add New Session
                  </Dialog.Title>
                  
                  <form onSubmit={handleAddSession} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                        <FaUser className="text-indigo-400" />
                        Owner Name
                      </label>
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                        placeholder="Enter owner name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                        <FaPhone className="text-indigo-400" />
                        Phone Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                        placeholder="+1234567890"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Session String
                      </label>
                      <textarea
                        value={formData.sessionString}
                        onChange={(e) => setFormData({ ...formData, sessionString: e.target.value })}
                        className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 h-32 transition-all resize-none font-mono text-sm"
                        placeholder="Paste your Pyrogram session string here..."
                        required
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50 ripple"
                      >
                        Add Session
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 glass hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all border border-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Sessions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {sessions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full text-center py-20 glass-strong rounded-2xl border border-white/10"
            >
              <FaUser className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No sessions added yet</p>
              <p className="text-gray-500 text-sm">Add your first session to get started</p>
            </motion.div>
          ) : (
            sessions.map((session, idx) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className="glass-strong rounded-2xl p-6 border border-white/10 hover-lift group"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  {session.isActive ? (
                    <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs text-green-400 font-semibold">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-xs text-red-400 font-semibold">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Inactive
                    </span>
                  )}
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCheckSession(session._id)}
                      disabled={checkingSession === session._id}
                      className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-all disabled:opacity-50"
                      title="Check session health"
                    >
                      <FaSync className={checkingSession === session._id ? 'animate-spin' : ''} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteSession(session._id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </div>

                {/* Session Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xl font-bold">
                      {session.ownerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {session.ownerName}
                      </h3>
                      {session.phoneNumber && (
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <FaPhone className="text-xs" />
                          {session.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <FaClock />
                      Added {new Date(session.createdAt).toLocaleDateString()}
                    </p>
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
