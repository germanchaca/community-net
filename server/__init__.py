from flask import Flask
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)

import server.api

# if __name__ == '__main__':
#     app.run(threaded=True)