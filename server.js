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

    console.log("Puzzle list (count): ", puzzleList.length);
    res.json(puzzleList);
});

// API endpoint - get list of puzzles
app.get('/api/latestpuzzle', (req, res) => {
    console.debug(`Calling /api/latestpuzzle`);

    // Get the daily for 'today'
    const daily = db.getDailyInfo(new Date());

    if (daily === undefined) {
        return res.status(404).json({ message: 'Daily information not available' });
    } 

    console.log("Daily puzzle: ", daily.puzzle);
    res.json({ id: daily.puzzle });
});

// API endpoint - get specific puzzle
app.get('/api/puzzle/:name', (req, res) => {
    const puzzleName = req.params.name;
    const puzzle = db.getPuzzle(puzzleName);

    if (puzzle === undefined ) {
        return res.status(404).json({ message: 'Puzzle not found' });
    }

    console.log("Puzzle: ", puzzle.letters);
    res.json( {name: puzzle.name, difficulty: puzzle.difficulty, letters: puzzle.letters} );
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
