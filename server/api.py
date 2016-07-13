from server import app

from flask import make_response, jsonify, request,Response

# RESTful API
@app.route('/')
def index():
    return "Flask Webapp"
    # return app.send_static_file('index.html')
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