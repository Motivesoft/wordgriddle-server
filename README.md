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
Command line SQL utility:
```shell
sqlite3.exe <filename.db>
```
> NOTE: To exit the utility, type ```.quit``` and press Enter.
