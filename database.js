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
        } catch(error) {
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
        } catch(error) {
            console.error(`Error ${error.code} inserting puzzles data: ${error.message}`);
        }
    }

    insertDailyInfoData() {
        console.log("Insert daily info data");

        const items = [
            { datetime: '2024-01-07 00:00:00.000', message: '', puzzle: 101 },
            { datetime: '2024-01-08 00:00:00.000', message: '', puzzle: 102 },
            { datetime: '2024-01-09 00:00:00.000', message: '', puzzle: 103 },
            { datetime: '2024-01-10 00:00:00.000', message: '', puzzle: 104 },
            { datetime: '2024-01-11 00:00:00.000', message: '', puzzle: 105 },
        ];

        const insertStatement = this.db.prepare('INSERT INTO daily (datetime, message, puzzle) VALUES (?, ?, ?)');

        try {
            items.forEach((item) => {
                insertStatement.run(item.datetime, item.message, item.puzzle);
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
            const statement = this.db.prepare(query);
            return statement.get(params);
        } catch (error) {
            console.error(`Error ${error.code} executing query: ${error.message}`);
            throw error;
        }
    } 

    // Public functions

    getPuzzleList() {
        console.log("Get puzzle list");

        return this.executeQuery(`SELECT id, name, difficulty FROM puzzles`);
    }

    getDailyInfo(date) {
        console.log("Get daily info");


        try {
            const stmt = this.db.prepare('SELECT datetime, message, puzzle FROM daily ORDER BY datetime');
            
            for (const user of stmt.iterate()) {
              console.log(`User created at: ${user.puzzle}`);
            }
          } catch (error) {
            console.error('Error querying database:', error.message);
          } 




        const items = this.executeQuery(`SELECT * FROM daily ORDER BY daily.datetime`);

        console.log("Items: ",items);
        console.log(" 0 : ",items[0]);
        if (items.length > 0) {
            let selected = items[ 0 ];
            items.forEach((item) => {
                if (new Date(item.datetime) < date) {
                    selected = item;
                }
            });

            console.log("Daily: ", selected);
            return selected;
        }

        return {datetime: date.toISOString(), message: '', puzzle: 105}
    }
}

module.exports = Database;