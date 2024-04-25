const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3006;

mongoose.connect('mongodb://127.0.0.1:27017/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;


const offerSchema = new mongoose.Schema({
    name: String,
    description: String,
    valid_till: String
});

const Offer = mongoose.model('Offer', offerSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.post('/offers', async (req, res) => {
    try {
        const { name, description, valid_till } = req.body;
        
        const offerData = { name, description, valid_till };
        
        const newOffer = new Offer(offerData);
        
        await newOffer.save();
        
        res.status(200).send('Offer saved successfully');
    } catch (error) {
        console.error('Error saving offer:', error);
        res.status(500).send('Error saving offer');
    }
});


app.get('/offers', async (req, res) => {
    try {
        const offers = await Offer.find();
        res.json(offers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching Offer');
    }
});


app.get('/offers/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const offer = await Offer.findById(id);
        if (!offer) {
            res.status(404).send('Offer not found');
        } else {
            res.json(offer);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching offer');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
