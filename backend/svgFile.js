/*const fs = require('fs');
const path = require('path');
const potrace = require('potrace');
const cheerio = require('cheerio');

// Get the absolute path to the image file (assuming it's in the same directory as convert.js)
const imageFilePath = path.join(__dirname, 'img','rec.jpg');

// Read the input image file
const imageBuffer = fs.readFileSync(imageFilePath);

// Potrace options
const options = {
  color: 'black', // Output SVG color
  background: 'white', // Output SVG background color
  turnpolicy: 'black', // Set turnpolicy to 'black' to get only the borders
  turndetect: 1, // Set turndetect to 1 to turn off curve detection
};

// Convert the image buffer to SVG path data
potrace.trace(imageBuffer, options, (err, svg) => {
  if (err) {
    console.error('Error:', err);
  } else {
    // Parse the SVG string using Cheerio
    const $ = cheerio.load(svg);

    // Extract the 'd' attribute value from the 'path' element
    const dAttributeValue = $('path').attr('d');

    // Create a JavaScript file and store the 'd' attribute value in a variable
    const jsCode = `const svgPath = '${dAttributeValue}';\nmodule.exports = svgPath;`;

    // Save the JavaScript code to a .js file
    const outputPath = path.join(__dirname, 'svgPath.js');
    fs.writeFileSync(outputPath, jsCode);

    console.log('SVG path data (d attribute) saved to svgPath.js');
  }
});*/

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const potrace = require('potrace');
const cheerio = require('cheerio');
const cors = require('cors'); // Import cors module

const app = express();
const port = 3001;

// Set up Multer to handle file uploads
//storage engine
const storage=multer.diskStorage({
  destination:"./upload/images",
  filename:(req,file,cb)=>{
    return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({ 
  storage:storage,
 });
console.log(upload);

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

app.post('/api/generate-svg', upload.single('image'), (req, res) => {
  console.log(req.file);
  try {
     const imagePath = req.file.path;
    // Access the uploaded image buffer from req.file.buffer
    const imageBuffer = fs.readFileSync(imagePath);

    // Potrace options
    const options = {
      color: 'black',
      background: 'white',
      turnpolicy: 'black',
      turndetect: 1,
    };

    // Convert the image buffer to SVG path data
    potrace.trace(imageBuffer, options, (err, svg) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        // Parse the SVG string using Cheerio
        const $ = cheerio.load(svg);

        // Extract the 'd' attribute value from the 'path' element
        const dAttributeValue = $('path').attr('d');

        // Send the SVG path back to the frontend
        res.json({ svgPath: dAttributeValue });
      }
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
