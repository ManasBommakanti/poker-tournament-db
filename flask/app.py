from flask import Flask, render_template

import os
import json

app = Flask(__name__)

with open("../config/secrets.json") as secrets:
    config = json.load(secrets)

FLASK_APP = config["FLASK_APP"]
FLASK_ENV = config["FLASK_ENV"]

app.config["FLASK_APP"] = FLASK_APP
app.config["FLASK_ENV"] = FLASK_ENV


# @app.route("/")
# def hello():
#     return "Hello, World!"


@app.route("/")
def index():
    return render_template("templates/index.html")


if __name__ == "__main__":
    app.run()
