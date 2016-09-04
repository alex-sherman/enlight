from flask import Flask, render_template, Blueprint, request, redirect, flash, url_for
from fakedict import JSONFile
from flask_login import login_required, login_user, logout_user

from Crypto.Hash import SHA256
mod = Blueprint("auth", __name__, url_prefix="/auth", template_folder="templates")

users = JSONFile("users.json")

class User:
    def __init__(self, username):
        self.username = username
    #flask-login required methods
    def is_authenticated(self):
        return True
    def is_active(self):
        return True
    def is_anonymous(self):
        return False
    def get_id(self):
        return unicode(self.username)

def get(userid):
    if userid in users.dict():
        return User(users[userid])
    return None


@mod.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if "username" in request.form:
        username = request.form["username"]
        password = request.form["password"]
        if username in users.dict():
            hash = SHA256.new()
            hash.update(password)
            if users[username] == hash.hexdigest():
                login_user(User(username), remember = True) # Log in the user using the login module
                return redirect(request.args.get("next") or url_for("dashboard.index"))
        error = "Invalid user/password"
    return render_template("auth.login.html", error=error)

@mod.route('/logout')
@login_required
def logout():
    logout_user()
    flash("You have been logged out")
    return redirect(url_for('index'))