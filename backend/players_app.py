from flask import Flask, request, jsonify
from flask_cors import CORS

import sqlite3
import os
import json

with open(os.path.realpath("../config/secrets.json"), "r") as secrets:
    config = json.load(secrets)

DB_FILE = config["DATABASE_PATH"]

app = Flask(__name__)
CORS(app)


def create_tables():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    with open(os.path.realpath("db/schema.sql"), "r") as f:
        c.executescript(f.read())

    conn.commit()
    conn.close()


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
    test_insertions()
    app.run(debug=True, port=3001)
