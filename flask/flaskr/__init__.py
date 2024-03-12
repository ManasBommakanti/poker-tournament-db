import os
import json

from flask import Flask


def create_app():
    with open(os.path.realpath("../config/secrets.json"), "r") as secrets:
        config = json.load(secrets)

    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY=config["FLASK_ENV"],
        DATABASE=os.path.join(app.instance_path, "flaskr.sqlite"),
    )

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route("/hello")
    def hello():
        return "Hello World!"

    from . import db

    db.init_app(app)

    return app
