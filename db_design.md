# Database Design

- Player(<u>PlayerID</u>, Name, Phone Number, Email, Win/Loss Ratio, Amount) 
- Game(<u>GameID</u>, Timestamp)
- Round(<u>GameID</u>, <u>Round Number</u>, Flop, Turn, River, winPlayerIDs, Pot)
- Round-Log(<u>PlayerID</u>, <u>GameID</u>, <u>Round Number</u>, isLittleBlind, isBigBlind, Hand, Pre-flop Bet, Flop Bet, Turn Bet, River Bet)
- Game-Log(<u>PlayerID</u>, <u>GameID</u>, Buy-in, Outcome)

## Entity and Attribute Explanations
- `Player` - stores the information of the poker player
    - `PlayerID` - unique ID for the player
    - `Name` - name of the player
    - `Phone Number` - phone number of the player
    - `Email` - email of the player
    - `Win/Loss Ratio` - win/loss ratio (still deciding whether to do based on number of games or rounds) of the player
    - `Amount` - the amount of "money" the player has
- `Game` - stores the information of a certain game session
    - `GameID` - unique ID for the game
    - `Timestamp` - contains the date and time of the game session
- `Round` - stores the round information of a certain game
    - `GameID` - unique ID for the game these round pertain to
    - `Round Number` - auto-incremented to uniquely identify a certain round
    - `Flop` - cards shown on the flop (3 community cards)
    - `Turn` - cards shown on the turn (4 community cards)
    - `River` - cards shown on the river (5 community cards)
    - `winPlayerIDs` - player IDs of those who won the round
- `Round-Log` - stores what the players do during a particular round
    - `PlayerID` - unique ID of the player in the round
    - `GameID` - unique ID of the game player is in
    - `Round Number` - round the player is in for a certain game
    - `isLittleBlind` - boolean value to see if the player is the little blind
    - `isBigBlind` - boolean value to see if the player is the big blidn
    - `Hand` - hand of the player (the 2 cards the player gets)
    - `Pre-flop Bet` - the player's bet before the flop is shown (before the community cards are shown)
    - `Flop Bet` - the player's bet once the flop is shown (the initial three community cards shown)
    - `Turn Bet` - the player's bet once the turn is shown (the four community cards shown)
    - `River Bet` - the player's bet once the river is shown (the five community cards shown at the end)
- `Game-Log` - stores which games a particular player plays (could potentially be a view)
    - `PlayerID` - unique ID of the player in the game
    - `GameID` - unique ID of the game
    - `Buy-in` - the buy in of the player for that game
    - `Outcome` - the outcome of the game for the player

## Assumptions
- We are only playing Texas Hold'em poker.
- A round could have multiple winning players, so the Round entity has attribute `winPlayerIDs` to store multiple players.
