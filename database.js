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

        // Create externally managed tables
        this.createUserTable();

        // Create internally managed tables
        this.createPuzzleTable();
        this.createPuzzleWordsTable();
        this.createDailyInfoTable();

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
                    id INTEGER PRIMARY KEY UNIQUE,
                    name TEXT NOT NULL,
                    difficulty INTEGER,
                    category INTEGER,
                    author INTEGER,
                    letters TEXT NOT NULL,
                    added INTEGER,
                    FOREIGN KEY (difficulty) REFERENCES difficulty(id),
                    FOREIGN KEY (category) REFERENCES category(id)
                    FOREIGN KEY (author) REFERENCES users(id)
                )
            `).run();

            this.insertPuzzleData();
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
                    classification INTEGER,
                    FOREIGN KEY (puzzle) REFERENCES puzzles(id),
                    FOREIGN KEY (classification) REFERENCES classification(id)
                )
            `).run();

            this.insertPuzzleWordsData();
        } catch (error) {
            console.error(`Error ${error.code} creating puzzles table: ${error.message}`);
        }
    }

    // Table of information about each day that brings a new daily puzzle
    // Use datetime as an integer (UTC millis from epoch) for ease of use
    createDailyInfoTable() {
        console.log("Create daily info table");

        try {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS daily (
                    datetime INTEGER,
                    message TEXT,
                    puzzle INTEGER,
                    FOREIGN KEY (puzzle) REFERENCES puzzles(id)
                )
            `).run();

            this.insertDailyInfoData();
        } catch (error) {
            console.error(`Error ${error.code} creating user table: ${error.message}`);
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

    // Insert the puzzles into the table
    // A puzzle is a list of letters with the following properties:
    // - the number of letters will be a square number as the number of rows/columns must match
    // - a space in the grid means a deliberate hole in the puzzle. The UI will manage this.
    // - Letters should be capitals for legibility and for consistent performance elsewhere
    // - non-letter characters (other than space and special characters) may work but shouldn't be used
    insertPuzzleData() {
        console.log("Insert puzzle data");

        // Currently the IDs are hard-coded so that we can update the 'daily' easily as we know all the values
        // When we have a nice UI for management, we can change this to autoincrement

        // Daily puzzles - use meaningfule dates when we have genuine puzzles
        const items = [
            // Puzzles copied from Squaredle for testing purposes
            { id: 1001, difficulty: 0, category: 1, author: 1, added: new Date().getTime(), name: '12-Jan-2025', letters: 'ATEPREOAV' },
            { id: 1002, difficulty: 0, category: 1, author: 1, added: new Date().getTime(), name: '13-Jan-2025', letters: 'TEDOICNQU' },

            // Test puzzles
            // Genuine puzzles
        ];

        const insertStatement = this.db.prepare('INSERT INTO puzzles (id, name, difficulty, category, author, added, letters) VALUES (?, ?, ?, ?, ?, ?, ?)');

        try {
            items.forEach((item) => {
                insertStatement.run(item.id, item.name, item.difficulty, item.category, item.author, item.added, item.letters);
            });
        } catch (error) {
            console.error(`Error ${error.code} inserting puzzles data: ${error.message}`);
        }
    }

    insertPuzzleWordsData() {
        console.log("Insert puzzle words data");

        // Maybe we need to redesign this to use a dictionary with IDs here, not the words themselves 

        // Daily puzzles - use meaningfule dates when we have genuine puzzles
        const items = [
            { puzzle: 1001, classification: 1, word: 'rate' },
            { puzzle: 1001, classification: 1, word: 'tree' },
            { puzzle: 1001, classification: 1, word: 'part' },
            { puzzle: 1001, classification: 2, word: 'paver' },
            { puzzle: 1001, classification: 2, word: 'tare' },
            { puzzle: 1001, classification: 2, word: 'vapor' },
            { puzzle: 1001, classification: 3, word: 'prat' },
            { puzzle: 1001, classification: 3, word: 'rapa' },

            { puzzle: 1002, classification: 1, word: 'cite' },
            { puzzle: 1002, classification: 1, word: 'dice' },
            { puzzle: 1002, classification: 1, word: 'diet' },
            { puzzle: 1002, classification: 1, word: 'dino' },
            { puzzle: 1002, classification: 1, word: 'edit' },
            { puzzle: 1002, classification: 1, word: 'iced' },
            { puzzle: 1002, classification: 1, word: 'nice' },
            { puzzle: 1002, classification: 1, word: 'note' },
            { puzzle: 1002, classification: 1, word: 'quid' },
            { puzzle: 1002, classification: 1, word: 'quit' },
            { puzzle: 1002, classification: 1, word: 'tide' },
            { puzzle: 1002, classification: 1, word: 'tied' },
            { puzzle: 1002, classification: 1, word: 'toed' },
            { puzzle: 1002, classification: 1, word: 'cited' },
            { puzzle: 1002, classification: 1, word: 'noted' },
            { puzzle: 1002, classification: 1, word: 'quiet' },
            { puzzle: 1002, classification: 1, word: 'quite' },
            { puzzle: 1002, classification: 1, word: 'tonic' },
            { puzzle: 1002, classification: 1, word: 'notice' },
            { puzzle: 1002, classification: 1, word: 'noticed' },
            { puzzle: 1002, classification: 2, word: 'cedi' },
            { puzzle: 1002, classification: 2, word: 'cinq' },
            { puzzle: 1002, classification: 2, word: 'cion' },
            { puzzle: 1002, classification: 2, word: 'dite' },
            { puzzle: 1002, classification: 2, word: 'etic' },
            { puzzle: 1002, classification: 2, word: 'nide' },
            { puzzle: 1002, classification: 2, word: 'nite' },
            { puzzle: 1002, classification: 2, word: 'otic' },
            { puzzle: 1002, classification: 2, word: 'quin' },
            { puzzle: 1002, classification: 2, word: 'tein' },
            { puzzle: 1002, classification: 2, word: 'noetic' },

        ];

        const insertStatement = this.db.prepare('INSERT INTO words (puzzle, classification, word) VALUES (?, ?, ?)');

        try {
            items.forEach((item) => {
                insertStatement.run(item.puzzle, item.classification, item.word);
            });
        } catch (error) {
            console.error(`Error ${error.code} inserting puzzle words data: ${error.message}`);
        }
    }

    insertDailyInfoData() {
        console.log("Insert daily info data");

        // Datetime here is when (in UTC) a puzzle becomes the current one
        // In theory, we could keep this to a single row as the currently active one, but 
        // doing it this way keeps historical info and allows us to put in future ones that
        // will automatically become current with the passage of time
        const items = [
            { datetime: new Date('2025-01-12 00:00:00.000').getTime(), message: '', puzzle: 1001 },
            { datetime: new Date('2025-01-13 00:00:00.000').getTime(), message: '', puzzle: 1002 },
        ];

        const insertStatement = this.db.prepare('INSERT INTO daily (datetime, message, puzzle) VALUES (?, ?, ?)');

        try {
            items.forEach((item) => {
                insertStatement.run(item.datetime, item.message, item.puzzle);
            });
        } catch (error) {
            console.error(`Error ${error.code} inserting puzzles data: ${error.message}`);
        }
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

    // Return all the puzzles
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
                SELECT classification, word 
                    FROM words
                    WHERE puzzle = ?
            `);

            var words = [];
            var bonus = [];
            var excluded = [];
            
            // Split the words into three groups: words, bonus words, excluded words
            const results = statement.all(id);
            results.forEach((result) => { 
                if (result.classification === 1) {
                    words.push(result.word);
                }
                if (result.classification === 2) {
                    bonus.push(result.word);
                }
                else if (result.classification === 3) {
                    excluded.push(result.word);
                }
            });

            // Return the groups through the API for the web page to handle
            return [words, bonus, excluded];
        } catch (error) {
            console.error('Error querying database for puzzle:', error.message);
        }
    }

    // Ideally, this will return only the bonus words possible in this puzzle
    getBonusWordList(id) {

    }

    // Ideally, this will return only the excluded words possible in this puzzle
    getExcludedWordList(id) {

    }

    // Return the daily info record that immediately preceeds the provided date
    getDailyInfo(date) {
        console.log("Get daily info: ", date.toISOString());

        try {
            // Order the data by datetime, compare with the provided datetime, acquire a single record only
            const statement = this.db.prepare('SELECT datetime, message, puzzle FROM daily WHERE datetime < ? ORDER BY datetime DESC LIMIT 1');
            return statement.get(date.getTime());
        } catch (error) {
            console.error('Error querying database for daily info:', error.message);
        }
    }
}

module.exports = Database;