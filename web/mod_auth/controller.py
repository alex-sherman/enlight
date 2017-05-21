from flask import Flask, render_template, Blueprint, request, redirect, flash, url_for
from fakedict import JSONFile
from flask_login import login_required, login_user, logout_user
from binascii import hexlify
import os, time

from Crypto.Hash import SHA256
mod = Blueprint("auth", __name__, url_prefix="/auth", template_folder="templates")

users = JSONFile("users.json")
one_time_passes = JSONFile("one_time.json")

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

def one_time_pass(key):
    if key in one_time_passes.dict():
        del one_time_passes[key]
        return User("one-time-pass")
    return None

@mod.route('/gen_otp', methods=['GET'])
@login_required
def gen_otp():
    key = hexlify(os.urandom(32))
    one_time_passes[key] = time.time()
    return key

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