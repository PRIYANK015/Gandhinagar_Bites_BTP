const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;


const recipeSchema = new mongoose.Schema({
    name: String,
    description: String,
    ingredients: [String],
    instructions: [String],
    youtube_link: String
});

const Recipe = mongoose.model('Recipe', recipeSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.post('/recipes', async (req, res) => {
    try {
        const { name, description, ingredients, instructions, youtube_link } = req.body;
        
        const recipeData = { name, description, ingredients, instructions, youtube_link };
        
        const newRecipe = new Recipe(recipeData);
        
        await newRecipe.save();
        
        res.status(200).send('Recipe saved successfully');
    } catch (error) {
        console.error('Error saving recipe:', error);
        res.status(500).send('Error saving recipe');
    }
});


app.get('/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching recipes');
    }
});


app.get('/recipes/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const recipe = await Recipe.findById(id);
        if (!recipe) {
            res.status(404).send('Recipe not found');
        } else {
            res.json(recipe);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching recipe');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
