// controllers/reportController.js
import Report from '../models/Report.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new report
const createReport = async (req, res) => {
  try {
    // Process uploaded files
    const mediaUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadDir = path.join(__dirname, '../uploads/reports');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Save each file
      for (const file of req.files) {
        const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        const filePath = path.join(uploadDir, fileName);
        
        fs.writeFileSync(filePath, file.buffer);
        mediaUrls.push(`/uploads/reports/${fileName}`);
      }
    }
    
    // Create the report
    const report = new Report({
      userId: req.user._id, // Use the authenticated user's ID
      fullName: req.body.fullName,
      contactNumber: req.body.contactNumber,
      location: req.body.location,
      nearestLandmark: req.body.nearestLandmark,
      issueType: req.body.issueType,
      dateObserved: req.body.dateObserved,
      description: req.body.description,
      additionalComments: req.body.additionalComments,
      mediaUrls: mediaUrls
    });
    
    const savedReport = await report.save();
    res.status(201).json({ success: true, report: savedReport });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reports (for admin)
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).populate('userId', 'firstName lastName email');
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reports by user ID (for residents)
const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update report status (for admin)
const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminComments } = req.body;
    
    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      { 
        status, 
        adminComments, 
        updatedAt: Date.now() 
      },
      { new: true }
    );
    
    if (!updatedReport) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    
    res.status(200).json({ success: true, report: updatedReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add resident feedback (for residents)
const addResidentFeedback = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { satisfied, comments } = req.body;
    
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    
    // Verify the report belongs to the requesting user
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    report.residentFeedback = { satisfied, comments };
    report.updatedAt = Date.now();
    
    const updatedReport = await report.save();
    res.status(200).json({ success: true, report: updatedReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createReport, getAllReports, getUserReports, updateReportStatus, addResidentFeedback };