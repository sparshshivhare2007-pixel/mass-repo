import mongoose from 'mongoose';

const TelegramSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionString: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.TelegramSession || mongoose.model('TelegramSession', TelegramSessionSchema);
