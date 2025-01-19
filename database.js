const path = require('path');
const fs = require('fs');
const sqlite3 = require('better-sqlite3');

class Database {
    constructor(dbName) {
        try {
            this.db = new sqlite3(dbName);
            this.createTables();
        }
        catch (error) {
            console.error(`Error ${error.code} opening database: ${error.message}`);
            this.connected = false;
        }
    }

    createTables() {
        // Create reference tables
        this.createDifficultyTable();
        this.createCategoryTable();
        this.createClassificationTable();
        this.createPuzzleWordsTable();

        // Create externally managed tables
        this.createUserTable();

        // Create internally managed tables
        this.createPuzzleTable();
        this.createProgressTable();

        this.importPuzzleData("./puzzles");

        return true;
    }

    // Create and populate a table of puzzle difficulties (0.5-6 star)
    createDifficultyTable() {
        console.log("Create difficulty table");

        try {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS difficulty (
                    id INTEGER PRIMARY KEY UNIQUE,
                    name TEXT NOT NULL
                )
            `).run();

            this.insertDifficultyData();
        } catch (error) {
            console.error(`Error ${error.code} creating difficulty table: ${error.message}`);
        }
    }

    // Create and populate a table of puzzle categories (express, daily, weekly, special)
    createCategoryTable() {
        console.log("Create category table");

        try {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS category (
                    id INTEGER PRIMARY KEY UNIQUE,
                    name TEXT NOT NULL
                )
            `).run();

            this.insertCategoryData();
        } catch (error) {
            console.error(`Error ${error.code} creating difficulty table: ${error.message}`);
        }
    }

    // Create and populate a table of word classification (normal, bonus, excluded)
    createClassificationTable() {
        console.log("Create classification table");

        try {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS classification (
                    id INTEGER PRIMARY KEY UNIQUE,
                    name TEXT NOT NULL
                )
            `).run();

            this.insertClassificationData();
        } catch (error) {
            console.error(`Error ${error.code} creating difficulty table: ${error.message}`);
        }
    }

    createPuzzleTable() {
        console.log("Create puzzle table");

        try {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS puzzles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    difficulty INTEGER,
                    category INTEGER,
                    author INTEGER,
                    letters TEXT NOT NULL,
                    created INTEGER,
                    FOREIGN KEY (difficulty) REFERENCES difficulty(id),
                    FOREIGN KEY (category) REFERENCES category(id)
                    FOREIGN KEY (author) REFERENCES users(id)
                )
            `).run();
        } catch (error) {
            console.error(`Error ${error.code} creating puzzles table: ${error.message}`);
        }
    }

    createPuzzleWordsTable() {
        console.log("Create puzzle words table");

        try {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS words (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    puzzle INTEGER,
                    word TEXT NOT NULL,
                    path TEXT,
                    classification INTEGER,
                    FOREIGN KEY (puzzle) REFERENCES puzzles(id),
                    FOREIGN KEY (classification) REFERENCES classification(id)
                )
            `).run();
        } catch (error) {
            console.error(`Error ${error.code} creating puzzles table: ${error.message}`);
        }
    }

    // Replace this with whatever passport.js (https://www.passportjs.org/) needs
    createUserTable() {
        console.log("Create users table");

        try {
            // salt is added to user password before hashing,
            // password is sha256 hash of salted user password 
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    email TEXT UNIQUE,
                    enrolled INTEGER
                )
            `).run();

            this.insertUserData();
        } catch (error) {
            console.error(`Error ${error.code} creating user table: ${error.message}`);
        }
    }

    createProgressTable() {
        console.log("Create user's attempt at a puzzle table");

        try {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS progress (
                    user INTEGER,
                    puzzle INTEGER,
                    word TEXT NOT NULL,
                    FOREIGN KEY (user) REFERENCES users(id),
                    FOREIGN KEY (puzzle) REFERENCES puzzles(id)
                )
            `).run();
        } catch (error) {
            console.error(`Error ${error.code} creating progress table: ${error.message}`);
        }
    }

    // Populate the table with difficulty identifiers
    insertDifficultyData() {
        console.log("Insert difficulty data");

        // A table of stars, with each line having more filled stars than the line before
        const items = [
            { id: 0, name: '&#x2606;&#x2606;&#x2606;&#x2606;&#x2606;' }, // No stars
            { id: 1, name: '&#x2605;&#x2606;&#x2606;&#x2606;&#x2606;' },
            { id: 2, name: '&#x2605;&#x2605;&#x2606;&#x2606;&#x2606;' },
            { id: 3, name: '&#x2605;&#x2605;&#x2605;&#x2606;&#x2606;' },
            { id: 4, name: '&#x2605;&#x2605;&#x2605;&#x2605;&#x2606;' },
            { id: 5, name: '&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;' }, // 5 stars
        ];

        const insertStatement = this.db.prepare('INSERT INTO difficulty (id, name) VALUES (?, ?)');

        try {
            items.forEach((item) => {
                insertStatement.run(item.id, item.name);
            });
        } catch (error) {
            console.error(`Error ${error.code} inserting difficulty data: ${error.message}`);
        }
    }

    // Populate the table with category types
    insertCategoryData() {
        console.log("Insert category data");

        const items = [
            { id: 0, name: 'Test' },
            { id: 1, name: 'Express' },
            { id: 2, name: 'Daily' },
            { id: 3, name: 'Weekly' },
            { id: 4, name: 'Special' },
        ];

        const insertStatement = this.db.prepare('INSERT INTO category (id, name) VALUES (?, ?)');

        try {
            items.forEach((item) => {
                insertStatement.run(item.id, item.name);
            });
        } catch (error) {
            console.error(`Error ${error.code} inserting category data: ${error.message}`);
        }
    }

    // Populate the table with classifications
    insertClassificationData() {
        console.log("Insert classification data");

        const items = [
            { id: 0, name: 'Test' },
            { id: 1, name: 'Normal' },
            { id: 2, name: 'Bonus' },
            { id: 3, name: 'Excluded' },
        ];

        const insertStatement = this.db.prepare('INSERT INTO classification (id, name) VALUES (?, ?)');

        try {
            items.forEach((item) => {
                insertStatement.run(item.id, item.name);
            });
        } catch (error) {
            console.error(`Error ${error.code} inserting classification data: ${error.message}`);
        }
    }

    // Import all json puzzle files in the provided directory
    importPuzzleData(directoryPath) {
        console.log("Import puzzle data");

        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return;
            }

            const insertPuzzle = this.db.prepare('INSERT INTO puzzles (name, difficulty, category, author, created, letters) VALUES (?, ?, ?, ?, ?, ?)');
            const insertWords = this.db.prepare('INSERT INTO words (puzzle, classification, word, path) VALUES (?, ?, ?, ?)');

            files.forEach(file => {
                if (path.extname(file) === '.json') {
                    const filePath = path.join(directoryPath, file);
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) {
                            console.error('Error reading file:', err);
                            return;
                        }

                        try {
                            const item = JSON.parse(data);

                            const id = insertPuzzle.run(item.name, item.difficulty, item.category, item.author, item.created, item.letters);

                            item.words.forEach(([word,path]) => {
                                insertWords.run(id.lastInsertRowid, 1, word, path);
                            });

                            item.bonusWords.forEach(([word,path]) => {
                                insertWords.run(id.lastInsertRowid, 2, word, path);
                            });

                            item.excludedWords.forEach(([word,path]) => {
                                insertWords.run(id.lastInsertRowid, 3, word, path);
                            });
                        } catch (error) {
                            console.error(`Error ${error.code} importing puzzles data: ${error.message}`);
                        }
                    });
                }
            });
        });
    }

    // Install an admin user and any others required
    insertUserData() {
        console.log("Insert user data");

        // Define at least one system/admin user
        // We will want to manually populate the credentials for this once we have a general scheme
        // Use 'squaredle' as author of test data we obtain from there so we don't accidentally release them
        const items = [
            { id: 0, name: 'admin', password: '', salt: '', enrolled: new Date().getTime() },
            { id: 1, name: 'squaredle', password: '', salt: '', enrolled: new Date().getTime() },
            { id: 2, name: 'tester', password: '', salt: '', enrolled: new Date().getTime() },
        ];

        const insertStatement = this.db.prepare('INSERT INTO users (id, name, password, salt, email, enrolled) VALUES (?, ?, ?, ?, ?, ?)');

        try {
            items.forEach((item) => {
                insertStatement.run(item.id, item.name, item.password, item.salt, item.email, item.enrolled);
            });
        } catch (error) {
            console.error(`Error ${error.code} inserting puzzles data: ${error.message}`);
        }
    }

    closeDatabase() {
        console.log("Close database");

        // Silently ignore if we're not connected
        if (this.db.open) {
            try {
                this.db.close();
            } catch (error) {
                console.error(`Error ${error.code} closing database: ${error.message}`);
            }
        }
    }

    // Public functions

    // Return the default puzzle, to be the most recently added
    getDefaultPuzzle() {
        console.log("Get a puzzle");

        try {
            const statement = this.db.prepare(`
                SELECT id 
                    FROM puzzles 
                    ORDER BY id DESC
                    LIMIT 1
            `);

            return statement.get();
        } catch (error) {
            console.error('Error querying database for default puzzle:', error.message);
        }
    }

    getAllPuzzles() {
        console.log("Get puzzle list");

        try {
            const statement = this.db.prepare(`
                SELECT puzzles.id, puzzles.name, difficulty.name as difficulty, category.name as category 
                    FROM puzzles 
                    JOIN difficulty on difficulty = difficulty.id  
                    JOIN category on category = category.id  
                    ORDER BY category.id, puzzles.id ASC
            `);
            return statement.all();
        } catch (error) {
            console.error('Error querying database for puzzle list:', error.message);
        }
    }

    // Return all the puzzles for a specific category
    getPuzzleList(category) {
        console.log("Get puzzle list");

        try {
            const statement = this.db.prepare(`
                SELECT puzzles.id, puzzles.name, difficulty.name as difficulty 
                    FROM puzzles 
                    JOIN difficulty on difficulty = difficulty.id  
                    WHERE puzzles.category = ? 
                    ORDER BY puzzles.id ASC
            `);
            return statement.all(category);
        } catch (error) {
            console.error('Error querying database for puzzle list:', error.message);
        }
    }

    // Get a puzzle by its ID. We don't care what category it is here
    getPuzzle(id) {
        console.log("Get puzzle: ", id);

        try {
            const statement = this.db.prepare(`
                SELECT puzzles.name, difficulty.name as difficulty, users.name as author, puzzles.letters 
                    FROM puzzles
                    JOIN difficulty on difficulty = difficulty.id  
                    JOIN users on author = users.id  
                    WHERE puzzles.id = ?
            `);
            return statement.get(id);
        } catch (error) {
            console.error('Error querying database for puzzle:', error.message);
        }
    }

    // Ideally, this will return only the valid (non-bonus, non-excluded) words possible in this puzzle
    getWordList(id) {
        console.log("Get puzzle words: ", id);

        try {
            // Get all the words in the puzzle
            const statement = this.db.prepare(`
                SELECT classification, word, path 
                    FROM words
                    WHERE puzzle = ?
            `);

            // Arrays of [word,path]
            var wordList = [];
            var bonusWordList = [];
            var excludedWordList = [];

            // Split the words into three groups: words, bonus words, excluded words
            const results = statement.all(id);
            results.forEach((result) => {
                if (result.classification === 1) {
                    wordList.push([result.word,result.path]);
                }
                if (result.classification === 2) {
                    bonusWordList.push([result.word,result.path]);
                }
                else if (result.classification === 3) {
                    excludedWordList.push([result.word,result.path]);
                }
            });

            // Return the groups through the API for the web page to handle
            return [wordList, bonusWordList, excludedWordList];
        } catch (error) {
            console.error('Error querying database for puzzle:', error.message);
        }
    }

    insertProgressData(user, puzzle, word) {
        console.log("Insert progress data");

        const insertStatement = this.db.prepare('INSERT INTO progress (user, puzzle, word) VALUES (?, ?, ?)');

        try {
            insertStatement.run(user, puzzle, word);
        } catch (error) {
            console.error(`Error ${error.code} inserting progress data: ${error.message}`);
        }
    }

    getProgressData(user, puzzle) {
        console.log("Get progress data");

        try {
            const statement = this.db.prepare(`
                SELECT word 
                    FROM progress
                    WHERE user = ? AND puzzle = ?
            `);

            var words = [];

            const results = statement.all(user, puzzle);

            results.forEach((word)=>{
                words.push(word);
            });

            return words.flat();
        } catch (error) {
            console.error('Error querying database for puzzle:', error.message);
        }
    }
}

module.exports = Database;