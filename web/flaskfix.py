from __future__ import print_function
from flask import Flask
import jinja2
import os
import pkgutil
import importlib

def fix(app):
    app.jinja_loader = jinja2.ChoiceLoader([
        app.jinja_loader,
        jinja2.PrefixLoader({}, delimiter = ".")
    ])

    def register_blueprint(bp):
        Flask.register_blueprint(app, bp)
        app.jinja_loader.loaders[1].mapping[bp.name] = bp.jinja_loader

    app.register_blueprint = register_blueprint
    return app

def register(app, path = None):
    if path is None:
        path = os.path.dirname(__file__) + "/"
    for _, package, _ in pkgutil.walk_packages([path]):
        if package[:4] == "mod_":
            for _, module, _ in pkgutil.iter_modules([path + package]):
                if module == "controller":
                    controller = importlib.import_module(package + "." + module)
                    if hasattr(controller, "mod"):
                        app.register_blueprint(controller.mod)
                        print("Registered:", package)