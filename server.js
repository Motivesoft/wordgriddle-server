const express = require('express');
const path = require('path');

const app = express();
const PORT = 8998;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'site')));

// API endpoint - get list of puzzles
app.get('/api/puzzles', (req, res) => {
    console.debug(`Calling /api/puzzles`);
    res.json({ message: '20241231' });
});

// API endpoint - get specific puzzle
app.get('/api/puzzle/:name', (req, res) => {
    const puzzleName = req.params.name;
    if (puzzleName === '20241231') {
        res.json({ letters: "AAAABBBBCCCCDDDD" });
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
