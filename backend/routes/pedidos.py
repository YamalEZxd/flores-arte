from flask import Blueprint, jsonify, request
from backend.database import get_connection
import time

pedidos_bp = Blueprint('pedidos', __name__)

@pedidos_bp.route('/api/pedidos', methods=['POST'])
def crear_pedido():
    data      = request.get_json()
    nombre    = data.get('nombre', '').strip()
    telefono  = data.get('telefono', '').strip()
    direccion = data.get('direccion', '').strip()
    nota      = data.get('nota', '').strip()
    items     = data.get('items', [])

    if not nombre or not telefono or not direccion or not items:
        return jsonify({'error': 'Faltan datos requeridos'}), 400

    conn   = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO clientes (nombre, telefono, direccion) VALUES (?,?,?) "
        "ON CONFLICT(telefono) DO UPDATE SET nombre=excluded.nombre, direccion=excluded.direccion",
        (nombre, telefono, direccion)
    )
    cursor.execute("SELECT id FROM clientes WHERE telefono = ?", (telefono,))
    cliente_id = cursor.fetchone()['id']

    total    = 15.0
    detalles = []
    for item in items:
        cursor.execute("SELECT precio, stock, nombre FROM productos WHERE id = ?", (item['producto_id'],))
        prod = cursor.fetchone()
        if not prod or not prod['stock']:
            conn.close()
            return jsonify({'error': 'Producto no disponible'}), 400
        total += prod['precio'] * item['cantidad']
        detalles.append((item['producto_id'], item['cantidad'], prod['precio']))

    codigo = f"PED-{int(time.time())}"
    cursor.execute(
        "INSERT INTO pedidos (codigo, cliente_id, direccion, nota, total) VALUES (?,?,?,?,?)",
        (codigo, cliente_id, direccion, nota, round(total, 2))
    )
    pedido_id = cursor.lastrowid
    cursor.executemany(
        "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unit) VALUES (?,?,?,?)",
        [(pedido_id, d[0], d[1], d[2]) for d in detalles]
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'codigo': codigo, 'total': round(total, 2)}), 201

@pedidos_bp.route('/api/pedidos', methods=['GET'])
def listar_pedidos():
    q      = request.args.get('q', '').strip()
    conn   = get_connection()
    cursor = conn.cursor()
    like   = f'%{q}%'
    cursor.execute('''
        SELECT p.id, p.codigo, p.direccion, p.nota, p.total, p.estado, p.fecha,
               c.nombre, c.telefono
        FROM pedidos p
        JOIN clientes c ON p.cliente_id = c.id
        WHERE p.codigo LIKE ? OR c.nombre LIKE ?
        ORDER BY p.fecha DESC
    ''', (like, like))
    pedidos = []
    for row in cursor.fetchall():
        pedido = dict(row)
        cursor.execute('''
            SELECT dp.cantidad, dp.precio_unit, pr.nombre, pr.emoji
            FROM detalle_pedido dp
            JOIN productos pr ON dp.producto_id = pr.id
            WHERE dp.pedido_id = ?
        ''', (row['id'],))
        pedido['items'] = [dict(r) for r in cursor.fetchall()]
        pedidos.append(pedido)
    conn.close()
    return jsonify(pedidos)

@pedidos_bp.route('/api/pedidos/stats', methods=['GET'])
def stats():
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as total FROM pedidos")
    total = cursor.fetchone()['total']
    cursor.execute("SELECT COUNT(*) as c FROM pedidos WHERE estado != 'entregado'")
    en_curso = cursor.fetchone()['c']
    cursor.execute("SELECT COALESCE(SUM(total),0) as s FROM pedidos")
    ingresos = cursor.fetchone()['s']
    cursor.execute("SELECT COUNT(*) as c FROM clientes")
    clientes = cursor.fetchone()['c']
    conn.close()
    return jsonify({'total': total, 'en_curso': en_curso, 'ingresos': round(ingresos,2), 'clientes': clientes})

@pedidos_bp.route('/api/pedidos/<string:codigo>/estado', methods=['PATCH'])
def actualizar_estado(codigo):
    data         = request.get_json()
    nuevo_estado = data.get('estado')
    validos      = ['registrado', 'preparacion', 'enviado', 'entregado']
    if nuevo_estado not in validos:
        return jsonify({'error': 'Estado invalido'}), 400
    conn = get_connection()
    conn.execute("UPDATE pedidos SET estado = ? WHERE codigo = ?", (nuevo_estado, codigo))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

@pedidos_bp.route('/api/pedidos/<string:codigo>', methods=['DELETE'])
def eliminar_pedido(codigo):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM pedidos WHERE codigo = ?", (codigo,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'No encontrado'}), 404
    cursor.execute("DELETE FROM detalle_pedido WHERE pedido_id = ?", (row['id'],))
    cursor.execute("DELETE FROM pedidos WHERE codigo = ?", (codigo,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
