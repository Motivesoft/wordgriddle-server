# wordgriddle-server
Play area for the wordgriddle web server

# Database
## Tables
### Difficulty levels
Table name: ```difficulty```

| Column | Type | Description |
| ------ | ---- | ----------- |
| ```id``` | Integer | Primary key |
| ```name``` | Text | Not Null |

### Puzzles
Table name: ```puzzles```

| Column | Type | Description |
| ------ | ---- | ----------- |
| ```id``` | Integer | Primary key, Autoincrement |
| ```name``` | Text | Not Null |
| ```difficulty``` | Integer | Foreign key to [```difficulty```](#difficulty-levels) |


### Users
Table name: ```users```

| Column | Type | Description |
| ------ | ---- | ----------- |
| ```id``` | Integer | Primary key, Autoincrement |
| ```name``` | Text | Not Null |
| ```password``` | Text | Not Null |
| ```salt``` | Text | Not Null |
| ```email``` | Text | Not Null |
(#difficulty-levels) |

###  

# Tools
## SQL
Command line SQL utility:
```shell
sqlite3.exe <filename.db>
```
> NOTE: To exit the utility, type ```.quit``` and press Enter.

## Puzzle
### WordSearchSolver
### ```maker.js```
Takes a list of all words (e.g. from WordSearchSolver) and a list of correct or common words (e.g. copied from a completed puzzle) and list the differences,
which can be considered bonus words

# Wordlists and dictionaries
## Excluded words
* Each puzzle will have its own excluded words list.
* Ideally, each list will be empty
* The onus is on puzzle creation to check for excluded words and add them to the puzzle's list
* Any subsequent changes will need to be applied to all affected puzzles, but that can probably be scripted in need be