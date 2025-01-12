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

        // Create internally managed tables
        this.createPuzzleTable();
        this.createDailyInfoTable();

        // Create externally managed tables
        this.createUserTable();

        return true;
    }

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

    createPuzzleTable() {
        console.log("Create puzzle table");

        try {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS puzzles (
                    id INTEGER PRIMARY KEY UNIQUE,
                    name TEXT NOT NULL,
                    difficulty INTEGER,
                    letters TEXT NOT NULL,
                    FOREIGN KEY (difficulty) REFERENCES difficulty(id)
                )
            `).run();

            this.insertPuzzleData();
        } catch (error) {
            console.error(`Error ${error.code} creating puzzles table: ${error.message}`);
        }
    }

    createDailyInfoTable() {
        console.log("Create daily info table");

        try {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS daily (
                    datetime TEXT,
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
                    username TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    email TEXT UNIQUE
                )
            `).run();
        } catch (error) {
            console.error(`Error ${error.code} creating user table: ${error.message}`);
        }
    }

    insertDifficultyData() {
        console.log("Insert difficulty data");

        const items = [
            { id: 1, name: 'Easy' },
            { id: 2, name: 'Medium' },
            { id: 3, name: 'Hard' },
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

    insertPuzzleData() {
        console.log("Insert puzzle data");

        const items = [
            { id: 101, name: 'AAAA', difficulty: 1, letters: 'AAAAAAAAAAAAAAAA' },
            { id: 102, name: 'BBBB', difficulty: 3, letters: 'BBBBBBBBBBBBBBBB' },
            { id: 103, name: 'CCCC', difficulty: 2, letters: 'CCCCCCCCCCCCCCCC' },
            { id: 104, name: 'DDDD', difficulty: 3, letters: 'DDDDDDDDDDDDDDDD' },
            { id: 105, name: 'EEEE', difficulty: 2, letters: 'EEEEEEEEEEEEEEEE' },
        ];

        const insertStatement = this.db.prepare('INSERT INTO puzzles (id, name, difficulty, letters) VALUES (?, ?, ?, ?)');

        try {
            items.forEach((item) => {
                insertStatement.run(item.id, item.name, item.difficulty, item.letters);
            });
        } catch (error) {
            console.error(`Error ${error.code} inserting puzzles data: ${error.message}`);
        }
    }

    insertDailyInfoData() {
        console.log("Insert daily info data");

        const items = [
            { datetime: '2025-01-07 00:00:00.000', message: '', puzzle: 101 },
            { datetime: '2025-01-08 00:00:00.000', message: '', puzzle: 102 },
            { datetime: '2025-01-09 00:00:00.000', message: '', puzzle: 103 },
            { datetime: '2025-01-10 00:00:00.000', message: '', puzzle: 104 },
            { datetime: '2025-01-11 00:00:00.000', message: '', puzzle: 105 },
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

    getPuzzleList() {
        console.log("Get puzzle list");

        try {
            const statement = this.db.prepare('SELECT id, name, difficulty FROM puzzles ORDER BY id ASC');
            return statement.all();
        } catch (error) {
            console.error('Error querying database for puzzle list:', error.message);
        }
    }

    getPuzzle(id) {
        console.log("Get puzzle: ", id);

        try {
            const statement = this.db.prepare('SELECT letters FROM puzzles WHERE id = ?');
            return statement.get(id);
        } catch (error) {
            console.error('Error querying database for puzzle:', error.message);
        }
    }

    // Return the daily info record that immediately preceeds the provided date
    getDailyInfo(date) {
        console.log("Get daily info: ", date);

        try {
            // Order the data by datetime, compare with the provided datetime, acquire a single record only
            const statement = this.db.prepare('SELECT datetime, message, puzzle FROM daily WHERE datetime < ? ORDER BY datetime DESC LIMIT 1');
            return statement.get(date.toISOString());
        } catch (error) {
            console.error('Error querying database for daily info:', error.message);
        }
    }
}

module.exports = Database;