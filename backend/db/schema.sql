DROP TABLE IF EXISTS Player;
DROP TABLE IF EXISTS Game;
DROP TABLE IF EXISTS Round;
DROP TABLE IF EXISTS RoundLog;
DROP TABLE IF EXISTS GameLog;

CREATE TABLE Player (
    PlayerID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    PhoneNumber TEXT,
    Email TEXT,
    WinLossRatio REAL NOT NULL,
    Amount REAL NOT NULL
);

CREATE TABLE Game (
    GameID INTEGER PRIMARY KEY AUTOINCREMENT,
    Time TIMESTAMP NOT NULL,
    Location TEXT NOT NULL
);

CREATE TABLE Round (
    GameID INTEGER,
    RoundNumber INTEGER PRIMARY KEY AUTOINCREMENT,
    Flop TEXT,
    Turn TEXT,
    River TEXT,
    WinPlayerIDs TEXT,
    Pot REAL,
    FOREIGN KEY (GameID) REFERENCES Game(GameID)
);

CREATE TABLE RoundLog (
    PlayerID INTEGER,
    GameID INTEGER,
    RoundNumber INTEGER,
    IsLittleBlind BOOLEAN,
    IsBigBlind BOOLEAN,
    Hand TEXT,
    PreFlopBet REAL,
    FlopBet REAL,
    TurnBet REAL,
    RiverBet REAL,
    PRIMARY KEY (PlayerID, GameID, RoundNumber),
    FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID),
    FOREIGN KEY (GameID, RoundNumber) REFERENCES Round(GameID, RoundNumber)
);

CREATE TABLE GameLog (
    PlayerID INTEGER,
    GameID INTEGER,
    BuyIn REAL,
    Outcome REAL,
    PRIMARY KEY (PlayerID, GameID),
    FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID),
    FOREIGN KEY (GameID) REFERENCES Game(GameID)
);