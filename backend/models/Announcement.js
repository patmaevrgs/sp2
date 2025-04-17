import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  content: String,
  postedBy: String,
  images: [String], // Example for storing image URLs
  files: [String],  // Example for storing file paths
  links: [String],  // Example for storing links
  postedAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
