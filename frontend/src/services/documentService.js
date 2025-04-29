const generatePdf = async (documentType, formData, purpose) => {
    try {
      // Create a fetch request with appropriate data
      const response = await fetch('http://localhost:3002/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType,
          formData,
          purpose
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element
      const a = document.createElement('a');
      
      // Set link properties
      a.href = url;
      a.download = `${documentType}_${Date.now()}.pdf`;
      
      // Append to the body
      document.body.appendChild(a);
      
      // Trigger the download
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  };
  
  export default { generatePdf };