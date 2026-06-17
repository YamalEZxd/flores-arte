from flask import Flask, send_from_directory
from flask_cors import CORS
import os, sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.database        import init_db
from backend.routes.productos import productos_bp
from backend.routes.pedidos   import pedidos_bp
from backend.routes.clientes  import clientes_bp

FRONTEND = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend')

app = Flask(__name__, static_folder=FRONTEND, static_url_path='')
CORS(app)

app.register_blueprint(productos_bp)
app.register_blueprint(pedidos_bp)
app.register_blueprint(clientes_bp)

@app.route('/')
def index():
    return send_from_directory(FRONTEND, 'index.html')

@app.route('/<path:path>')
def archivos(path):
    return send_from_directory(FRONTEND, path)

if __name__ == '__main__':
    init_db()
    print("Servidor en http://localhost:5000")
    app.run(debug=True, port=5000)
