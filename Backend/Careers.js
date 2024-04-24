const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
const port = 3004;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a schema for career applications
const careerSchema = new mongoose.Schema({
  name: String,
  email: String,
  gender: String,
  contact: String,
  branch: String,
  jobType: String,
});

// Create a model for career applications
const Career = mongoose.model('Career', careerSchema);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pitliyapriyank@gmail.com',
        pass: 'qzwy iplu qtnj qajl'
  },
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route for submitting career application
app.post('/submitCareer', async (req, res) => {
  try {
    const { name, email, gender, contact, branch, jobType } = req.body;

    // Save the career application to MongoDB
    const careerApplication = new Career({
      name,
      email,
      gender,
      contact,
      branch,
      jobType,
    });
    await careerApplication.save();

    // Send confirmation email
    await sendConfirmationEmail(email);

    res.send('Career application submitted successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error submitting career application.');
  }
});

// Function to send confirmation email
async function sendConfirmationEmail(email) {
  const mailOptions = {
    from: 'pitliyapriyank@gmail.com',
    to: email,
    subject: 'Career Application Confirmation',
    text: 'Thank you for submitting your career application. We will review your application shortly.',
  };

  await transporter.sendMail(mailOptions);
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
