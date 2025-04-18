import mongoose from 'mongoose';

const userLogSchema = new mongoose.Schema({
  adminName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Optional reference to the related entity (like announcement ID)
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement'
  }
});

const UserLog = mongoose.model('UserLog', userLogSchema);
export default UserLog;