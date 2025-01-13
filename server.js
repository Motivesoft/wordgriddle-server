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
app.get('/api/dailypuzzle', (req, res) => {
    console.debug(`Calling /api/dailypuzzle`);

    // Get the daily for the current datetime in UTC
    const daily = db.getDailyInfo(new Date());

    if (daily === undefined) {
        return res.status(404).json({ message: 'Daily information not available' });
    } 

    console.log("Daily puzzle: ", daily.puzzle);
    res.json({ id: daily.puzzle });
});

// API endpoint - get specific puzzle
app.get('/api/puzzle/:id', (req, res) => {
    console.debug(`Calling /api/dailypuzzle`);

    const id = req.params.id;
    const puzzle = db.getPuzzle(id);

    if (puzzle === undefined ) {
        return res.status(404).json({ message: 'Puzzle not found' });
    }

    console.log("Puzzle: ", id, puzzle.name);
    
    const [words, bonusWords, excludedWords] = db.getWordList(id);
    
    if (words === undefined) {
        return res.status(404).json({ message: 'Puzzle words not available' });
    } 

    res.json( {name: puzzle.name, difficulty: puzzle.difficulty, author: puzzle.author, letters: puzzle.letters, words: words, bonusWords: bonusWords, excludedWords: excludedWords} );
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
