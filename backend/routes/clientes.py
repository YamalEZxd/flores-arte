from flask import Blueprint, jsonify
from backend.database import get_connection

clientes_bp = Blueprint('clientes', __name__)

@clientes_bp.route('/api/clientes', methods=['GET'])
def listar_clientes():
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.id, c.nombre, c.telefono, c.direccion, c.fecha_registro,
               COUNT(p.id) as total_pedidos,
               COALESCE(SUM(p.total), 0) as total_gastado
        FROM clientes c
        LEFT JOIN pedidos p ON p.cliente_id = c.id
        GROUP BY c.id
        ORDER BY total_pedidos DESC
    ''')
    clientes = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(clientes)
