from flask import make_response, jsonify, request,Response

from server import app
import server.clustering as cls
import json

# RESTful API
@app.route('/')
def index():
    return "Flask webapp"
    # return app.send_static_file('index.html')
    # return make_response(open(os.path.join(DIR, 'index.html')).read())


@app.route('/clustering')
def detect():
    method= request.args.get('method', '')
    year= int(request.args.get('year', ''))
    cluster= int(request.args.get('cluster', ''))

    try:
        data=cls.set_method(method,year,cluster)
        # data="clustering"
    except ValueError:
        data="error"
    return json.dumps(data)