require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const FormData = require('form-data');

// Enhanced logging function
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    if (typeof data === 'object') {
      // Handle sensitive data by showing only partial values
      const safeData = {};
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string' && 
            (key.toLowerCase().includes('key') || 
             key.toLowerCase().includes('secret') || 
             key.toLowerCase().includes('token') || 
             key.toLowerCase().includes('password'))) {
          // Show only first 4 chars of sensitive data
          safeData[key] = data[key].substring(0, 4) + '...' + 
                         (data[key].length > 8 ? data[key].substring(data[key].length - 4) : '');
        } else {
          safeData[key] = data[key];
        }
      });
      console.log(safeData);
    } else {
      console.log(data);
    }
  }
};

const app = express();
const port = process.env.PORT || 3000;

// Log environment variables (safely)
log('Environment variables loaded', {
  PHAXIOKEY: process.env.PHAXIOKEY || 'not set',
  PHAXIOSECRET: process.env.PHAXIOSECRET || 'not set',
  PHAXIO_FAX_NUMBER: process.env.PHAXIO_FAX_NUMBER || 'not set',
  NODE_ENV: process.env.NODE_ENV || 'development'
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync('uploads')){
      log('Creating uploads directory');
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    log('Generated filename for upload', { originalName: file.originalname, newFilename: filename });
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });
log('File upload middleware configured');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
log('Express middleware configured');

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fax history endpoint
app.get('/api/fax-history', async (req, res) => {
  try {
    log('Retrieving fax history');
    
    // Project ID for Sinch Fax API
    const projectId = '7850c42f-597c-40cc-9567-8bad3ac7d58f';
    
    // Get fax history from Sinch API
    const historyResponse = await axios({
      method: 'get',
      url: `https://fax.api.sinch.com/v3/projects/${projectId}/faxes`,
      auth: {
        username: process.env.PHAXIOKEY,
        password: process.env.PHAXIOSECRET
      }
    });
    
    log('Fax history retrieved', {
      count: historyResponse.data.faxes ? historyResponse.data.faxes.length : 0
    });
    
    res.json(historyResponse.data);
  } catch (error) {
    log('Error retrieving fax history', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: `Error retrieving fax history: ${error.message}`
    });
  }
});

app.post('/send-fax', upload.single('faxDocument'), async (req, res) => {
  console.log('Received fax request');
  try {
    let { to, faxText } = req.body;
    const faxDocument = req.file;
    
    // Format phone number: convert (XXX) XXX-XXXX to +1XXXXXXXXXX
    if (to && to.match(/\(\d{3}\) \d{3}-\d{4}/)) {
      // Extract digits only
      const digits = to.replace(/\D/g, '');
      // Add +1 country code for US
      to = `+1${digits}`;
      log('Formatted phone number', { original: req.body.to, formatted: to });
    }
    
    console.log('Request parameters:', { 
      to, 
      hasText: !!faxText, 
      hasDocument: !!faxDocument 
    });
    
    if (!to) {
      console.log('Error: Fax number is required');
      return res.status(400).json({ error: 'Fax number is required' });
    }
    
    if (!faxText && !faxDocument) {
      console.log('Error: No content provided');
      return res.status(400).json({ error: 'Either text content or a document is required' });
    }
    
    let mediaPath;
    
    // If text content is provided, create a PDF
    if (faxText) {
      console.log('Creating PDF from text content');
      const timestamp = Date.now();
      const pdfPath = `uploads/text-fax-${timestamp}.pdf`;
      console.log(`PDF path: ${pdfPath}`);
      
      // Create a PDF from the text
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(pdfPath);
      
      doc.pipe(stream);
      
      // Add a title
      doc.fontSize(16).text('Fax Document', { align: 'center' });
      doc.moveDown();
      
      // Add the text content
      doc.fontSize(12).text(faxText);
      
      // Add timestamp and page number at the bottom
      doc.moveDown(2);
      const date = new Date().toLocaleString();
      doc.fontSize(10).text(`Sent: ${date}`, { align: 'right' });
      
      doc.end();
      
      log('Waiting for PDF creation to complete');
      await new Promise((resolve) => {
        stream.on('finish', () => {
          log('PDF creation completed');
          resolve();
        });
      });
      
      mediaPath = pdfPath;
      log('PDF created at:', { path: mediaPath });
    } else {
      // Use the uploaded document
      log('Using uploaded file...', { 
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
      mediaPath = `uploads/${req.file.filename}`;
    }

    // Log API credentials (safely)
    log('Preparing Phaxio API request...', {
      keyLength: process.env.PHAXIOKEY ? process.env.PHAXIOKEY.length : 0,
      secretLength: process.env.PHAXIOSECRET ? process.env.PHAXIOSECRET.length : 0,
      keyFirstChars: process.env.PHAXIOKEY ? process.env.PHAXIOKEY.substring(0, 4) : 'null',
      keyLastChars: process.env.PHAXIOKEY ? process.env.PHAXIOKEY.substring(process.env.PHAXIOKEY.length - 4) : 'null',
      secretFirstChars: process.env.PHAXIOSECRET ? process.env.PHAXIOSECRET.substring(0, 4) : 'null',
      secretLastChars: process.env.PHAXIOSECRET ? process.env.PHAXIOSECRET.substring(process.env.PHAXIOSECRET.length - 4) : 'null'
    });
    
    // Declare variables outside the try block to make them available in the outer scope
    let faxResponse;
    let faxData;
    
    try {
      // Read the file
      log('Reading file:', { path: mediaPath });
      const fileStream = fs.createReadStream(mediaPath);
      log('File stream created successfully');
      
      // Create FormData object for multipart/form-data request
      const formData = new FormData();
      
      // Add fax parameters using Sinch parameter names
      formData.append('to', to);
      formData.append('file', fileStream, { filename: path.basename(mediaPath) });
      
      // Add header text
      formData.append('headerText', 'Sent via Sinch Fax Sender');
      
      // Log the request parameters
      log('Request parameters:', {
        to,
        filename: path.basename(mediaPath),
        endpoint: `https://fax.api.sinch.com/v3/projects/7850c42f-597c-40cc-9567-8bad3ac7d58f/faxes`
      });
      
      log('Using Sinch Fax API with HTTP Basic Auth...');
      
      // Project ID for Sinch Fax API
      const projectId = '7850c42f-597c-40cc-9567-8bad3ac7d58f';
      
      // Send the fax using axios with Basic Auth to Sinch Fax API
      log('Sending fax via Sinch Fax API with HTTP Basic Auth...');
      faxResponse = await axios({
        method: 'post',
        url: `https://fax.api.sinch.com/v3/projects/${projectId}/faxes`,
        data: formData,
        auth: {
          username: process.env.PHAXIOKEY,
          password: process.env.PHAXIOSECRET
        },
        headers: formData.getHeaders()
      });
      
      log('Phaxio API response received', { 
        responseStatus: faxResponse.status, 
        responseSize: JSON.stringify(faxResponse.data).length,
        responseData: JSON.stringify(faxResponse.data).substring(0, 100) + '...'
      });
      
      // Extract the response data from Sinch API format
      faxData = faxResponse.data;
      log('Fax data extracted', { 
        id: faxData.id, 
        status: faxData.status,
        direction: faxData.direction,
        createTime: faxData.createTime
      });
    } catch (clientError) {
      log('Error creating Phaxio client or sending fax', { 
        message: clientError.message, 
        stack: clientError.stack,
        name: clientError.name,
        code: clientError.code || 'unknown',
        response: clientError.response ? {
          status: clientError.response.status,
          statusText: clientError.response.statusText,
          data: JSON.stringify(clientError.response.data).substring(0, 200)
        } : 'No response data'
      });
      throw clientError; // Re-throw to be caught by the outer try/catch
    }
    
    log('API request successful', {
      responseStatus: faxResponse ? faxResponse.status : 'unknown',
      id: faxData.id,
      status: faxData.status,
      direction: faxData.direction,
      createTime: faxData.createTime
    });
    
    // Send success response to client
    log('Sending success response to client');
    res.json({
      success: true,
      message: 'Fax sent successfully',
      faxId: faxData.id,
      status: faxData.status
    });
  } catch (error) {
    // Detailed error logging
    log('Error sending fax', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code || 'unknown',
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: JSON.stringify(error.response.data || {}).substring(0, 500)
      } : 'No response data'
    });
    
    // If it's an API authentication error
    if (error.message && error.message.includes('api credentials') || 
        (error.response && error.response.status === 401)) {
      log('API authentication error detected');
      
      // Log the exact API keys being used (first and last few characters only)
      log('API credentials being used', {
        keyLength: process.env.PHAXIOKEY ? process.env.PHAXIOKEY.length : 0,
        secretLength: process.env.PHAXIOSECRET ? process.env.PHAXIOSECRET.length : 0,
        keyFirstChars: process.env.PHAXIOKEY ? process.env.PHAXIOKEY.substring(0, 4) : 'null',
        keyLastChars: process.env.PHAXIOKEY ? process.env.PHAXIOKEY.substring(process.env.PHAXIOKEY.length - 4) : 'null',
        secretFirstChars: process.env.PHAXIOSECRET ? process.env.PHAXIOSECRET.substring(0, 4) : 'null',
        secretLastChars: process.env.PHAXIOSECRET ? process.env.PHAXIOSECRET.substring(process.env.PHAXIOSECRET.length - 4) : 'null'
      });
    }
    
    // Check if there's an issue with the URL
    if (error.message && error.message.includes('404')) {
      log('URL access error detected', {
        message: 'This might be due to using a URL that Phaxio cannot access.',
        suggestion: 'Consider using a publicly accessible URL for your media.'
      });
    }
    
    // Check for authentication issues
    if (error.message && (error.message.includes('authenticate') || 
                         error.message.includes('auth') || 
                         error.message.includes('credentials') || 
                         (error.response && error.response.status === 401))) {
      log('Authentication error detected', {
        message: 'Authentication failed. Verify your Phaxio API credentials.',
        suggestion: 'Double-check PHAXIOKEY and PHAXIOSECRET in your .env file.'
      });
    }
    
    // Send error response to client
    log('Sending error response to client');
    res.status(500).json({
      success: false,
      message: `Error sending fax: ${error.message}`
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
