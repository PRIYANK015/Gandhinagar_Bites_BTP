const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;

// Define Recipe Schema
const recipeSchema = new mongoose.Schema({
    name: String,
    description: String,
    ingredients: [String],
    instructions: [String],
    youtube_link: String
});

// Create Recipe Model
const Recipe = mongoose.model('Recipe', recipeSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static('public'));

// Endpoint to add a new recipe
app.post('/recipes', async(req, res) => {
    const { name, description, ingredients, instructions, youtube_link } = req.body;

    const cred = { name, description, ingredients, instructions, youtube_link};

    let recipe = await Recipe.create(cred);
    
    // const newRecipe = new Recipe({
    //     name,
    //     description,
    //     ingredients,
    //     instructions,
    // });

    // newRecipe.save();

    // newRecipe.save((err, recipe) => {
    //     if (err) {
    //         console.error(err);
    //         res.status(500).send('Error saving recipe');
    //     } else {
    //         res.status(200).send('Recipe saved successfully');
    //     }
    // });
});

// Endpoint to get all recipes
app.get('/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching recipes');
    }
});

// Endpoint to get a single recipe by ID
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

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
