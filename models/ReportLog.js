import mongoose from 'mongoose';

const ReportLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  target: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['channel', 'user', 'group'],
    default: 'channel'
  },
  reportReason: {
    type: String,
    required: true
  },
  reportMessage: {
    type: String,
    required: true
  },
  sessionsUsed: {
    type: Number,
    required: true
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  results: [{
    sessionName: String,
    status: String,
    message: String,
    timestamp: Date
  }]
}, {
  timestamps: true
});

export default mongoose.models.ReportLog || mongoose.model('ReportLog', ReportLogSchema);
