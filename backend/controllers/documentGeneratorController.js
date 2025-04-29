// controllers/documentGeneratorController.js
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { fileURLToPath } from 'url';
import libre from 'libreoffice-convert';
import util from 'util';

// Convert libre's callback-based method to a Promise-based one
const convertAsync = util.promisify(libre.convert);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate document based on template and data
export const generateDocument = async (req, res) => {
  try {
    const { documentType, formData, purpose } = req.body;
    
    // Determine which template to use based on document type
    let templatePath;
    switch(documentType) {
      case 'certificate_of_residency':
        templatePath = path.resolve(__dirname, '../templates/certificate_of_residency_template.docx');
        break;
      // Add other document types here as needed
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported document type'
        });
    }
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document template not found'
      });
    }
    
    // Read the template file content
    const content = fs.readFileSync(templatePath, 'binary');
    
    // Create a zip of the loaded file
    const zip = new PizZip(content);
    
    // Create Docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    };
    
    // Get ordinal suffix for day of month
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    // Current date for signing
    const currentDate = new Date();
    const dayWithSuffix = `${currentDate.getDate()}${getOrdinalSuffix(currentDate.getDate())}`;
    const formattedMonth = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    const signedDate = `${dayWithSuffix} day of ${formattedMonth}, ${year}`;
    
    // Prepare data for template
    const data = {
      fullName: formData.fullName?.toUpperCase() || '',
      age: formData.age || '',
      dateOfBirth: formatDate(formData.dateOfBirth) || '',
      placeOfBirth: formData.placeOfBirth || '',
      nationality: formData.nationality || '',
      civilStatus: formData.civilStatus || '',
      motherName: formData.motherName || '',
      fatherName: formData.fatherName || '',
      yearsOfStay: formData.yearsOfStay || '',
      purpose: purpose || '',
      signedDate: signedDate,
      // Add any additional fields needed by your template
    };
    
    // Render document with data
    doc.render(data);
    
    // Generate output
    const outputDocx = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });
    
    // Create a unique filename
    const timestamp = Date.now();
    const docxFilename = `${documentType}_${timestamp}.docx`;
    const pdfFilename = `${documentType}_${timestamp}.pdf`;
    
    const docxOutputPath = path.resolve(__dirname, `../temp/${docxFilename}`);
    const pdfOutputPath = path.resolve(__dirname, `../temp/${pdfFilename}`);
    
    // Ensure temp directory exists
    const tempDir = path.resolve(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // Write the DOCX to a temp file
    fs.writeFileSync(docxOutputPath, outputDocx);
    
    // Convert DOCX to PDF
    try {
      const docxBuffer = fs.readFileSync(docxOutputPath);
      const pdfBuffer = await convertAsync(docxBuffer, '.pdf', undefined);
      
      // Write the PDF to a temp file
      fs.writeFileSync(pdfOutputPath, pdfBuffer);
      
      // Send the PDF file as a response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${pdfFilename}`);
      res.send(pdfBuffer);
      
      // Clean up temp files (optional - can be done by a scheduled task instead)
      setTimeout(() => {
        try {
          fs.unlinkSync(docxOutputPath);
          fs.unlinkSync(pdfOutputPath);
        } catch (err) {
          console.error('Error cleaning up temp files:', err);
        }
      }, 60000); // Clean up after 1 minute
      
    } catch (conversionError) {
      console.error('Error converting DOCX to PDF:', conversionError);
      
      // If PDF conversion fails, send the DOCX file as a fallback
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=${docxFilename}`);
      res.sendFile(docxOutputPath);
    }
    
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating document',
      error: error.message
    });
  }
};