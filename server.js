const express = require('express');
const path = require('path');

const app = express();
const PORT = 8998;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'site')));

// API endpoint - get list of puzzles
app.get('/api/puzzles', (req, res) => {
    console.debug(`Calling /api/puzzles`);
    //    res.json({ message: '20241231' });

    const puzzleList = {
        puzzles: [
            { id: 101, difficulty: 2, name: 'Puzzle 1' },
            { id: 102, difficulty: 1, name: 'Puzzle 2' },
            { id: 103, difficulty: 1, name: 'Puzzle 3' },
            { id: 104, difficulty: 1, name: 'Puzzle 4' },
            { id: 105, difficulty: 1, name: 'Puzzle 5' }
        ]
    };

    res.json(puzzleList);
});

// API endpoint - get list of puzzles
app.get('/api/latestpuzzle', (req, res) => {
    console.debug(`Calling /api/latestpuzzle`);

    res.json({id: 105});
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
