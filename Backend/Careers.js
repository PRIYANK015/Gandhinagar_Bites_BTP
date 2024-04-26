const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
const port = 3004;


mongoose.connect('mongodb://127.0.0.1:27017/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const careerSchema = new mongoose.Schema({
  name: String,
  email: String,
  gender: String,
  contact: String,
  branch: String,
  jobType: String,
});

const Career = mongoose.model('Career', careerSchema);


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pitliyapriyank@gmail.com',
        pass: 'qzwy iplu qtnj qajl'
  },
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post('/submitCareer', async (req, res) => {
  try {
    const { name, email, gender, contact, branch, jobType } = req.body;

    const careerApplication = new Career({
      name,
      email,
      gender,
      contact,
      branch,
      jobType,
    });
    await careerApplication.save();

    await sendConfirmationEmail(email);

    res.send('Career application submitted successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error submitting career application.');
  }
});

async function sendConfirmationEmail(email) {
  const mailOptions = {
    from: 'pitliyapriyank@gmail.com',
    to: email,
    subject: 'Career Application Confirmation',
    text: 'Thank you for submitting your career application. We will review your application shortly.',
  };

  await transporter.sendMail(mailOptions);
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
