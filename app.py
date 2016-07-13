import os
from flask import Flask, make_response, jsonify, request,Response
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
DIR = os.path.dirname(os.path.abspath(__file__))


# 
@app.route('/')
def index():
    # return "Flask Webapp"
    return app.send_static_file('index.html')
    # return make_response(open(os.path.join(DIR, 'index.html')).read())


@app.route('/clustering')
def detect():
    method= request.args.get('method', '')

    try:
        method_selected=method;
    except ValueError:
        method=""

    val = {"method":method_selected}
    return jsonify(val)


if __name__ == '__main__':
    app.run()
