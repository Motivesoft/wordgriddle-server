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

    createPuzzleTable() {
        console.log("Create puzzle table");

        try {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS puzzles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    difficulty INTEGER,
                    FOREIGN KEY (difficulty) REFERENCES difficulty(id)
                )
            `).run();

            this.insertPuzzleData();
        } catch (error) {
            console.error(`Error ${error.code} creating puzzles table: ${error.message}`);
        }
    }

    insertDifficultyData() {
        console.log("Insert difficulty data");

        const difficulties = [
            { id: 1, name: 'Easy' },
            { id: 2, name: 'Medium' },
            { id: 3, name: 'Hard' },
            { id: 2, name: 'Average' },
        ];

        const insertStatement = this.db.prepare('INSERT OR REPLACE INTO difficulty (id, name) VALUES (?, ?)');

        try {
            difficulties.forEach((difficulty) => {
                insertStatement.run(difficulty.id, difficulty.name);
            });
        } catch(error) {
            console.error(`Error ${error.code} inserting difficulty data: ${error.message}`);
        }
    }

    insertPuzzleData() {
        console.log("Insert puzzle data");

        const puzzles = [
            { id: 1, name: 'AAAA', difficulty: 1 },
            { id: 2, name: 'BBBB', difficulty: 3 },
            { id: 3, name: 'CCCC', difficulty: 2 },
        ];

        const insertStatement = this.db.prepare('INSERT OR REPLACE INTO puzzles (id, name, difficulty) VALUES (?, ?, ?)');

        try {
            puzzles.forEach((puzzle) => {
                insertStatement.run(puzzle.id, puzzle.name, puzzle.difficulty);
            });
        } catch(error) {
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

    // Helper functions

    executeQuery(query, params = []) {
        console.log("execute query: ", query);

        try {
            const statement = db.prepare(query);
            return statement.run(params);
        } catch (error) {
            console.error(`Error ${error.code} executing query: ${error.message}`);
            throw error;
        }
    }
}

module.exports = Database;