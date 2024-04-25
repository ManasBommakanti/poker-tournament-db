from flask import Flask, request, jsonify
from flask_cors import CORS

import sqlite3
import os
import json

with open(os.path.realpath("../config/secrets.json"), "r") as secrets:
    config = json.load(secrets)

DB_FILE = config["DATABASE"]["POKER_DB_REL_PATH"]

app = Flask(__name__)
CORS(app)


def create_tables():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    with open(os.path.realpath(config["DATABASE"]["SCHEMA_REL_PATH"]), "r") as f:
        c.executescript(f.read())

    conn.commit()
    conn.close()


# used to test insertions into table
def test_insertions():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    with open(os.path.realpath("db/insertions.sql"), "r") as f:
        c.executescript(f.read())

    # conn.commit()
    conn.close()


@app.route("/api/players", methods=["GET"])
def get_players():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    # Set isolation level to READ UNCOMMITTED
    c.execute("PRAGMA read_uncommitted = true;")

    c.execute("BEGIN TRANSACTION;")

    try:
        c.execute("SELECT * FROM Player;")
        players = c.fetchall()

        c.execute("COMMIT TRANSACTION;")

        # conn.commit()
        c.close()
        conn.close()

        return jsonify(players), 200
    except Exception as e:
        c.execute("ROLLBACK;")

        c.close()
        conn.close()


@app.route("/api/games", methods=["GET"])
def get_games():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    # Set isolation level to READ UNCOMMITTED
    c.execute("PRAGMA read_uncommitted = true;")

    c.execute("BEGIN TRANSACTION;")

    # Get the player who won each game
    c.execute(
        f"""
                         SELECT g.GameID AS GameID,
                            g.Timestamp AS Time,
                            g.Location AS Location,
                            p.Name AS PlayerName,
                            MAX(gl.Outcome - gl.BuyIn)
                         FROM Player p
                         INNER JOIN GameLog gl ON p.PlayerID = gl.PlayerID
                         INNER JOIN Game g ON g.GameID = gl.GameID
                         GROUP BY g.GameID;        
    """
    )

    playerWins = c.fetchall()
    print(playerWins)

    c.execute("COMMIT TRANSACTION;")

    c.close()
    conn.close()
    return jsonify(playerWins)


@app.route("/api/startGame", methods=["POST"])
def start_game():
    game_data = request.json
    timestamp = game_data.get("timestamp")
    location = game_data.get("location")
    buy_ins = game_data.get("buyIns")

    conn = sqlite3.connect(DB_FILE)

    cursor = conn.cursor()

    # Set isolation level to READ UNCOMMITTED
    cursor.execute("PRAGMA read_uncommitted = true;")

    # Begin transaction
    cursor.execute("BEGIN TRANSACTION;")

    # Insert new game
    cursor.execute(
        "INSERT INTO Game (Timestamp, Location) VALUES (?, ?)",
        (timestamp, location),
    )

    game_id = cursor.lastrowid

    players = dict()
    commit = True

    # Add players to game-log with initial buy-in
    for dic in buy_ins:
        player_id = dic["playerID"]
        buy_in = dic["buyIn"]
        print("player_id: ", player_id)
        print("type(player): ", type(player_id))

        cursor.execute("SELECT Amount FROM Player WHERE PlayerID = ?", (player_id))
        curr_amount = cursor.fetchone()

        if buy_in > curr_amount[0]:
            commit = False

        players[int(player_id)] = buy_in

    if commit:
        print(players)
        # for thing in players:
        #     cursor.execute(
        #         "INSERT INTO GameLog (PlayerID, GameID, BuyIn) VALUES (?, ?, ?)", thing
        #     )

        cursor.execute("COMMIT TRANSACTION;")
        conn.commit()

        cursor.close()
        conn.close()

        return (
            jsonify(
                {
                    "message": "Game started successfully",
                    "GameID": game_id,
                    "PlayerBuyIns": players,
                }
            ),
            200,
        )
    else:
        cursor.execute("ROLLBACK;")
        conn.commit()

        cursor.close()
        conn.close()

        return "Higher buy in", 404


@app.route("/api/updateOutcomes", methods=["POST"])
def update_game_log():
    # try:
    game_data = request.json
    game_id = game_data.get("game_id")
    outcomes = game_data.get("outcomes")
    buyins = game_data.get("buyIns")

    conn = sqlite3.connect(DB_FILE)

    cursor = conn.cursor()

    # Set isolation level to READ UNCOMMITTED
    cursor.execute("PRAGMA read_uncommitted = true;")

    # Begin transaction
    cursor.execute("BEGIN TRANSACTION;")

    for player_id, outcome in outcomes.items():
        buy_in = buyins[player_id]

        cursor.execute(
            """
            INSERT INTO GameLog (PlayerID, GameID, BuyIn, Outcome)
            VALUES (?, ?, ?, ?)
            """,
            (player_id, game_id, buy_in, outcome),
        )

        game_profit = outcome - buy_in
        cursor.execute(
            "SELECT Profit, Amount FROM Player WHERE PlayerID = ?", player_id
        )

        items = cursor.fetchone()
        profit = items[0]
        amount = items[1]

        # Execute query
        cursor.execute(
            """
            UPDATE Player 
            SET Profit = ?, Amount=?
            WHERE PlayerID=?
        """,
            (profit + game_profit, amount + game_profit, player_id),
        )

    cursor.execute("COMMIT TRANSACTION;")

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Game log updated successfully"})


# except Exception as e:
#  return jsonify({"error": str(e)}), 500


@app.route("/api/addPlayer", methods=["POST"])
def add_player():
    try:
        player_data = request.json
        name = player_data.get("Name")
        phone_number = player_data.get("PhoneNumber")
        email = player_data.get("Email")
        amount = player_data.get("Amount")

        # Insert player data into the database
        conn = sqlite3.connect(DB_FILE)

        cursor = conn.cursor()

        # Set isolation level to READ UNCOMMITTED
        cursor.execute("PRAGMA read_uncommitted = true;")

        # Begin transaction
        cursor.execute("BEGIN TRANSACTION;")

        # Execute query
        cursor.execute(
            """INSERT INTO Player (Name, PhoneNumber, Email, Profit, Amount) 
                        VALUES (?, ?, ?, ?, ?)""",
            (name, phone_number, email, 0, amount),
        )

        # End transaction
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Player added successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/players/<int:player_id>", methods=["PUT"])
def update_player(player_id):
    try:
        player_data = request.json
        name = player_data["Name"]
        phone_number = player_data["PhoneNumber"]
        email = player_data["Email"]
        amount = player_data["Amount"]

        conn = sqlite3.connect(DB_FILE)

        cursor = conn.cursor()

        # Set isolation level to READ UNCOMMITTED
        cursor.execute("PRAGMA read_uncommitted = true;")

        # Begin transaction
        cursor.execute("BEGIN TRANSACTION;")

        # Execute query
        cursor.execute(
            """
            UPDATE Player 
            SET Name=?, PhoneNumber=?, Email=?, Amount=?
            WHERE PlayerID=?
        """,
            (name, phone_number, email, amount, player_id),
        )

        cursor.execute("COMMIT TRANSACTION;")

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Player updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/players/<int:player_id>", methods=["DELETE"])
def delete_player(player_id):
    try:
        conn = sqlite3.connect(DB_FILE)

        cursor = conn.cursor()

        # Set isolation level to READ UNCOMMITTED
        cursor.execute("PRAGMA read_uncommitted = true;")

        # Start transaction
        cursor.execute("BEGIN TRANSACTION;")

        # Execute query
        cursor.execute(
            """
            DELETE FROM Player WHERE PlayerID=?
        """,
            (player_id,),
        )

        cursor.execute("COMMIT TRANSACTION;")

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Player deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    create_tables()
    # test_insertions()
    app.run(debug=True, port=3001)
