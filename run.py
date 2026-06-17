import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from backend.database import init_db
from backend.app import app

init_db()

if __name__ == '__main__':
    print("FloresArte corriendo en http://localhost:5000")
    app.run(debug=True, port=5000)