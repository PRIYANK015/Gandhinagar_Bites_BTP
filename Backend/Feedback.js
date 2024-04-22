
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const app = express();
const port = 3001;

mongoose.connect('mongodb://127.0.0.1:27017/', {
    
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:')); 

const feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    paragraph: String,
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.use((req, res, next) => {
    console.log('Request body:', req.body);
    next();
});

const validateFormData = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('paragraph').isLength({ max: 50 }).withMessage('Paragraph must be at most 50 characters long'),
];

app.post('/submitFeedback', validateFormData, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, paragraph } = req.body;
        const feedbackData = { name, email, paragraph };
        
        const newFeedback = new Feedback(feedbackData);
        
        await newFeedback.save();
        
        res.status(200).send('Feedback saved successfully');
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).send('Error saving feedback');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


