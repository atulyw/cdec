# Tiny web app — one page that says hello

from flask import Flask

app = Flask(__name__)


@app.route("/")
def hello():
    return "Hello World"


# host="0.0.0.0" lets traffic from outside the container reach the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
