from flask import Blueprint, jsonify, request
from backend.database import get_connection

productos_bp = Blueprint('productos', __name__)

@productos_bp.route('/api/productos', methods=['GET'])
def listar_productos():
    categoria = request.args.get('categoria', 'Todos')
    busqueda  = request.args.get('q', '').strip()
    conn = get_connection()
    cursor = conn.cursor()
    query  = "SELECT * FROM productos WHERE 1=1"
    params = []
    if categoria != 'Todos':
        query += " AND categoria = ?"
        params.append(categoria)
    if busqueda:
        query += " AND (nombre LIKE ? OR categoria LIKE ?)"
        params.extend([f'%{busqueda}%', f'%{busqueda}%'])
    cursor.execute(query, params)
    productos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(productos)

@productos_bp.route('/api/productos/<int:id>', methods=['GET'])
def obtener_producto(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM productos WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'No encontrado'}), 404
    return jsonify(dict(row))

@productos_bp.route('/api/productos/categorias', methods=['GET'])
def listar_categorias():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT categoria FROM productos ORDER BY categoria")
    cats = ['Todos'] + [row['categoria'] for row in cursor.fetchall()]
    conn.close()
    return jsonify(cats)

@productos_bp.route('/api/productos/<int:id>/stock', methods=['PATCH'])
def toggle_stock(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE productos SET stock = NOT stock WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
