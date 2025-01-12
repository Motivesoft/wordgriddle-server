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

        // Create externally managed tables
        this.createUserTable();

        // Create internally managed tables
        this.createPuzzleTable();
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
                    email TEXT UNIQUE
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

        // Daily puzzles
        const items = [
            { id: 101, difficulty: 1, category: 2, author: 0, name: 'AAAA', letters: 'AAAAAAAAAAAAAAAA' },
            { id: 102, difficulty: 3, category: 1, author: 0, name: 'BBBB', letters: 'BBBBBBBBBBBBBBBB' },
            { id: 103, difficulty: 4, category: 2, author: 0, name: 'My Waffle Tribute', letters: 'ABCDEF H JKLMNOP R TUVWXY' },
            { id: 104, difficulty: 3, category: 3, author: 0, name: 'DDDD', letters: 'DDDDDDDDDDDDDDDD' },
            { id: 105, difficulty: 2, category: 2, author: 0, name: 'EEEE', letters: 'EEEEEE EEEEEEEEE' },
            { id: 106, difficulty: 3, category: 4, author: 0, name: 'FFFF', letters: 'F F F F F F F F ' },
            { id: 107, difficulty: 2, category: 2, author: 0, name: 'GGGG', letters: 'G    G   G G G G' },
        ];

        const insertStatement = this.db.prepare('INSERT INTO puzzles (id, name, difficulty, category, author, letters) VALUES (?, ?, ?, ?, ?, ?)');

        try {
            items.forEach((item) => {
                insertStatement.run(item.id, item.name, item.difficulty, item.category, item.author, item.letters);
            });
        } catch (error) {
            console.error(`Error ${error.code} inserting puzzles data: ${error.message}`);
        }
    }

    insertDailyInfoData() {
        console.log("Insert daily info data");

        // Datetime here is when (in UTC) a puzzle becomes the current one
        // In theory, we could keep this to a single row as the currently active one, but 
        // doing it this way keeps historical info and allows us to put in future ones that
        // will automatically become current with the passage of time
        const items = [
            { datetime: new Date('2025-01-07 00:00:00.000').getTime(), message: '', puzzle: 101 },
            { datetime: new Date('2025-01-08 00:00:00.000').getTime(), message: '', puzzle: 102 },
            { datetime: new Date('2025-01-09 00:00:00.000').getTime(), message: '', puzzle: 103 },
            { datetime: new Date('2025-01-14 00:00:00.000').getTime(), message: '', puzzle: 104 },
            { datetime: new Date('2025-01-15 00:00:00.000').getTime(), message: '', puzzle: 105 },
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

        // Datetime here is when (in UTC) a puzzle becomes the current one
        // In theory, we could keep this to a single row as the currently active one, but 
        // doing it this way keeps historical info and allows us to put in future ones that
        // will automatically become current with the passage of time
        const items = [
            { id: 0, name: 'admin', password: '', salt: '', email: 'support@motivesoft.co.uk' },
        ];

        const insertStatement = this.db.prepare('INSERT INTO users (id, name, password, salt, email) VALUES (?, ?, ?, ?, ?)');

        try {
            items.forEach((item) => {
                insertStatement.run(item.id, item.name, item.password, item.salt, item.email);
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

    // Return all the puzzles for a specific category
    getPuzzleList(category) {
        console.log("Get puzzle list");

        try {
            const statement = this.db.prepare('SELECT id, name, difficulty FROM puzzles WHERE category = ? ORDER BY id ASC');
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
                    WHERE puzzles.id = ?`);
            return statement.get(id);
        } catch (error) {
            console.error('Error querying database for puzzle:', error.message);
        }
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