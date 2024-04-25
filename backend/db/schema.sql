CREATE TABLE IF NOT EXISTS Player (
    PlayerID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    PhoneNumber INTEGER NOT NULL,
    Email TEXT,
    Profit REAL NOT NULL,
    Amount REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS Game (
    GameID INTEGER PRIMARY KEY AUTOINCREMENT,
    Timestamp TEXT NOT NULL,
    Location TEXT NOT NULL,
    WinningPlayerID INTEGER,
    WinningPlayer TEXT,
    WinningAmount REAL
);

CREATE TABLE IF NOT EXISTS GameLog (
    PlayerID INTEGER,
    GameID INTEGER,
    BuyIn REAL,
    Outcome REAL,
    PRIMARY KEY (PlayerID, GameID),
    FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID),
    FOREIGN KEY (GameID) REFERENCES Game(GameID)
);