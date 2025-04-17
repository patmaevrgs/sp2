import Announcement from '../models/Announcement.js';

// Create a new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { content, postedBy, images, files, links } = req.body;
    const newAnnouncement = new Announcement({
      content,
      postedBy,
      images,
      files,
      links,
      postedAt: new Date(),
    });
    
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ message: 'Error creating announcement', error });
  }
};

// Get all announcements
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error });
  }
};

// Delete an announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
    if (!deletedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.status(200).json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement', error });
  }
};

// Update an announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, images, files, links } = req.body;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      {
        content,
        images,
        files,
        links,
        editedAt: new Date(), // Set edited time
      },
      { new: true } // Return updated doc
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: 'Error updating announcement', error });
  }
};
