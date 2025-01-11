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
app.get('/api/puzzles', (req, res) => {
    console.debug(`Calling /api/puzzles`);
    //    res.json({ message: '20241231' });

    const puzzleList = {
        puzzles: [
            { id: 101, name: 'Puzzle 1', difficulty: 2 },
            { id: 102, name: 'Puzzle 2', difficulty: 1 },
            { id: 103, name: 'Puzzle 3', difficulty: 1 },
            { id: 104, name: 'Puzzle 4', difficulty: 1 },
            { id: 105, name: 'Puzzle 5', difficulty: 1 }
        ]
    };

    res.json(puzzleList);
});

// API endpoint - get list of puzzles
app.get('/api/latestpuzzle', (req, res) => {
    console.debug(`Calling /api/latestpuzzle`);

    // Get the daily for 'today'
    const daily = db.getDailyInfo(new Date());

    res.json({ id: daily.puzzle });
});

// API endpoint - get specific puzzle
app.get('/api/puzzle/:name', (req, res) => {
    const puzzleName = req.params.name;
    if (puzzleName === '101') {
        res.json({ letters: "AAAABBBBCCCCDDDD" });
    } else if (puzzleName === '102') {
        res.json({ letters: "EEEEFFFFGGGGHHHH" });
    } else if (puzzleName === '103') {
        res.json({ letters: "IIIIJJJJKKKKLLLL" });
    } else if (puzzleName === '104') {
        res.json({ letters: "MMMMNNNNOOOOPPPP" });
    } else if (puzzleName === '105') {
        res.json({ letters: "QQQQRRRRSSSSTTTT" });
    } else {
        return res.status(404).json({ message: 'Puzzle not found' });
    }
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
