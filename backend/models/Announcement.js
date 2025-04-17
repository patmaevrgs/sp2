import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  content: String,
  postedBy: String,
  images: [String],
  videos: [String], // Added videos array
  files: [{ 
    name: String,
    path: String
  }],
  links: [String],
  postedAt: { type: Date, default: Date.now },
  editedAt: { type: Date },
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;