const express = require('express');
const path = require('path');
const fs = require('fs');

const Database = require('./database');

const app = express();
const PORT = 8998;

const dbName = './wordgriddle.db';
fs.rmSync(dbName, {
    force: true,
});
const db = new Database(dbName);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'site')));

// API endpoint - get list of puzzles
app.get('/api/puzzles/:category', (req, res) => {
    console.debug(`Calling /api/puzzles`);

    const category = req.params.category;
    const puzzleList = db.getPuzzleList(category);

    if (puzzleList === undefined) {
        return res.status(404).json({ message: 'Puzzle list not available' });
    } 

    console.log("Puzzle list (count): ", puzzleList.length);
    res.json(puzzleList);
});

// API endpoint - get default puzzle
app.get('/api/defaultpuzzle', (req, res) => {
    console.debug(`Calling /api/defaultpuzzle`);

    const id = db.getDefaultPuzzle();

    if (id === undefined) {
        return res.status(404).json({ message: 'Default puzzle list not available' });
    } 

    console.log("Puzzle : ", id);
    res.json(id);
});

// API endpoint - get list of puzzles
app.get('/api/allpuzzles', (req, res) => {
    console.debug(`Calling /api/puzzles`);

    const puzzleList = db.getAllPuzzles();

    if (puzzleList === undefined) {
        return res.status(404).json({ message: 'Puzzle list not available' });
    } 

    console.log("Puzzle list (count): ", puzzleList.length);
    res.json(puzzleList);
});

// API endpoint - get list of puzzles
app.get('/api/progress/:user/:puzzle', (req, res) => {
    console.debug(`Calling /api/progress`);

    const user = req.params.user;
    const puzzle = req.params.puzzle;
    const progressWords = db.getProgressData(user, puzzle);

    if (progressWords === undefined) {
        return res.status(404).json({ message: 'Progress words list not available' });
    } 

    console.log("Progress words (count): ", progressWords.length);
    res.json({words: progressWords.map((item) => item.word)});
});

// API endpoint - get list of puzzles
app.put('/api/progress/:user/:puzzle/:word', (req, res) => {
    console.debug(`Calling /api/progress`);
  
    const user = req.params.user;
    const puzzle = req.params.puzzle;
    const word = req.params.word;
    db.insertProgressData(user, puzzle, word);

    console.log("Progress recorded");
    return res.status(200).json({ message: 'Progress recorded' });
});

// API endpoint - get specific puzzle
app.get('/api/puzzle/:id', (req, res) => {
    console.debug(`Calling /api/puzzle`);

    const id = req.params.id;
    const puzzle = db.getPuzzle(id);

    if (puzzle === undefined ) {
        return res.status(404).json({ message: 'Puzzle not found' });
    }

    console.log("Puzzle: ", id, puzzle.name);
    
    const [wordList, bonusWordList, excludedWordList] = db.getWordList(id);
    
    if (wordList === undefined) {
        return res.status(404).json({ message: 'Puzzle words not available' });
    } 

    res.json( {name: puzzle.name, difficulty: puzzle.difficulty, author: puzzle.author, letters: puzzle.letters, wordList: wordList, bonusWordList: bonusWordList, excludedWordList: excludedWordList} );
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'site', '404.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

process.on('SIGINT', () => {
    console.log("SIGINt");

    db.closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log("SIGTERM");

    db.closeDatabase();
    process.exit(0);
});
