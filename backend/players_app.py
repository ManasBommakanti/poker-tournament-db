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

    conn.commit()
    conn.close()


@app.route("/api/players", methods=["GET"])
def get_courses():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT * FROM Player;")
    players = c.fetchall()
    conn.close()
    return jsonify(players)


@app.route("/api/games", methods=["GET"])
def get_games():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT * FROM Game;")
    games = c.fetchall()
    conn.close()
    return jsonify(games)


@app.route("/api/addPlayer", methods=["POST"])
def add_player():
    player_data = request.json
    name = player_data.get("Name")
    phone_number = player_data.get("PhoneNumber")
    email = player_data.get("Email")
    amount = player_data.get("Amount")

    # Insert player data into the database
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO Player (Name, PhoneNumber, Email, WinLossRatio, Amount) 
                   VALUES (?, ?, ?, ?, ?)""",
        (name, phone_number, email, 0, amount),
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Player added successfully"})


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
        cursor.execute(
            """
            UPDATE Player 
            SET Name=?, PhoneNumber=?, Email=?, Amount=?
            WHERE PlayerID=?
        """,
            (name, phone_number, email, amount, player_id),
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Player updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/players/<int:player_id>", methods=["DELETE"])
def delete_player(player_id):
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute(
            """
            DELETE FROM Player WHERE PlayerID=?
        """,
            (player_id,),
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Player deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# @app.route("/api/course_sections", methods=["GET"])
# def get_course_sections():
#     conn = sqlite3.connect(DB_FILE)
#     c = conn.cursor()
#     c.execute("SELECT * FROM course_section")
#     sections = c.fetchall()
#     conn.close()
#     return jsonify(sections)


# @app.route("/api/teaching_assistants", methods=["GET"])
# def get_teaching_assistants():
#     conn = sqlite3.connect(DB_FILE)
#     c = conn.cursor()
#     c.execute("SELECT * FROM teaching_assistant")
#     tas = c.fetchall()
#     conn.close()
#     return jsonify(tas)


# @app.route("/api/office_hours", methods=["GET"])
# def get_office_hours():
#     conn = sqlite3.connect(DB_FILE)
#     c = conn.cursor()
#     c.execute("SELECT * FROM office_hour")
#     office_hours = c.fetchall()
#     conn.close()
#     return jsonify(office_hours)


if __name__ == "__main__":
    create_tables()
    # test_insertions()
    app.run(debug=True, port=3001)
