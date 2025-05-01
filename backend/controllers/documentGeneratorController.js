// controllers/documentGeneratorController.js
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate document based on template and data (DOCX only)
export const generateDocument = async (req, res) => {
  try {
    const { documentType, formData, purpose, clearanceNumber } = req.body;
    
    // Determine which template to use based on document type
    let templatePath;
    switch(documentType) {
      case 'certificate_of_residency':
        templatePath = path.resolve(__dirname, '../templates/certificate_of_residency_template.docx');
        break;
      case 'barangay_clearance':
        templatePath = path.resolve(__dirname, '../templates/barangay_clearance_template.docx');
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
    let data = {
      signedDate: signedDate,
      purpose: purpose || '',
    };
    
    // Add document type specific data
    if (documentType === 'certificate_of_residency') {
      data = {
        ...data,
        fullName: formData.fullName?.toUpperCase() || '',
        address: formData.address || '',
        age: formData.age || '',
        dateOfBirth: formatDate(formData.dateOfBirth) || '',
        placeOfBirth: formData.placeOfBirth || '',
        nationality: formData.nationality || '',
        civilStatus: formData.civilStatus || '',
        motherName: formData.motherName || '',
        fatherName: formData.fatherName || '',
        yearsOfStay: formData.yearsOfStay || '',
      };
    } 
    else if (documentType === 'barangay_clearance') {
      // Determine pronoun based on gender
      const gender = formData.gender?.toLowerCase() || 'male';
      const genderPronoun = gender === 'male' ? 'he' : 'she';
      const genderPossessive = gender === 'male' ? 'his' : 'her';
      const genderObject = gender === 'male' ? 'him' : 'her';
      
      data = {
        ...data,
        clearanceNumber: clearanceNumber || '', // Use admin-provided clearance number
        fullName: formData.fullName?.toUpperCase() || '',
        address: formData.address || '',
        gender: genderObject, // For pronoun in template (him/her)
        genderPronoun: genderPronoun, // For pronoun in template (he/she)
        genderPossessive: genderPossessive, // For possessive pronoun in template (his/her)
      };
    }
    
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
    
    // Send the DOCX file directly to the client
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${docxFilename}`);
    res.send(outputDocx);
    
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating document',
      error: error.message
    });
  }
};