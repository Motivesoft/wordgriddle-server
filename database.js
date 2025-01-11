const sqlite3 = require('sqlite3').verbose();

class Database {
    //const dbName = './wordgriddle.db';  // database file in current directory
    constructor(dbName) {
        this.db = new sqlite3.Database(dbName, (err) => {
            if (err) {
                console.error('Error opening database', err);
            } else {
                console.log('Connected to the SQLite database');
                this.createTables();
            }
        });
    }

    createTables() {
        // Create reference tables
        this.createDifficultyTable();

        // Create internally managed tables
        this.createPuzzleTable();
        
        // Create externally managed tables
        this.createUserTable();
    }
    
    // Replace this with whatever passport.js (https://www.passportjs.org/) needs
    createUserTable() {
        // salt is added to user password before hashing,
        // password is sha256 hash of salted user password 
        this.db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            salt TEXT NOT NULL,
            email TEXT UNIQUE
        )`, (err) => {
            if (err) {
                console.error('Error creating user table', err);
            } else {
                console.log('Users table created or already exists');
            }
        });
    }
    
    createDifficultyTable() {
        this.db.run(`CREATE TABLE IF NOT EXISTS difficulty (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating difficulty table', err);
            } else {
                console.log('Difficulty table created or already exists');
                this.insertDifficultyData();
            }
        });
    }
    
    createPuzzleTable() {
        this.db.run(`CREATE TABLE IF NOT EXISTS puzzles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            difficulty INTEGER,
            FOREIGN KEY (difficulty) REFERENCES difficulty(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating puzzles table', err);
            } else {
                console.log('Puzzles table created or already exists');
                this.insertPuzzleData();
            }
        });
    }

    insertDifficultyData() {
        const difficulties = [
            { id: 1, name: 'Easy' },
            { id: 2, name: 'Medium' },
            { id: 3, name: 'Hard' },
        ];

        const insertStatement = this.db.prepare('INSERT OR REPLACE INTO difficulty (id, name) VALUES (?, ?)');

        difficulties.forEach((difficulty) => {
            insertStatement.run(difficulty.id, difficulty.name, (err) => {
                if (err) {
                    console.error('Error inserting difficulty data', err);
                } else {
                    console.log(`Inserted difficulty: ${difficulty.name}`);
                }
            });
        });
    
        insertStatement.finalize((err) => {
            if (err) {
                console.error('Error finalizing insert statement', err);
            } else {
                console.log('All difficulties inserted');
            }
        });
    }

    insertPuzzleData() {
        const puzzles = [
            { id: 1, name: 'AAAA', difficulty: 1 },
            { id: 2, name: 'BBBB', difficulty: 3 },
            { id: 3, name: 'CCCC', difficulty: 2 },
        ];

        const insertStatement = this.db.prepare('INSERT OR REPLACE INTO puzzles (id, name, difficulty) VALUES (?, ?, ?)');

        puzzles.forEach((puzzle) => {
            insertStatement.run(puzzle.id, puzzle.name, puzzle.difficulty, (err) => {
                if (err) {
                    console.error('Error inserting puzzle data', err);
                } else {
                    console.log(`Inserted puzzle: ${puzzle.name}`);
                }
            });
        });
    
        insertStatement.finalize((err) => {
            if (err) {
                console.error('Error finalizing insert statement', err);
            } else {
                console.log('All difficulties inserted');
            }
        });
    }

    closeDatabase() {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database', err);
            } else {
                console.log('Closed the database connection');
            }
        });
    }
}

module.exports = Database;