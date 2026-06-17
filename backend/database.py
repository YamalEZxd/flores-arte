import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'flores_arte.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS productos (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre      TEXT    NOT NULL,
            descripcion TEXT,
            precio      REAL    NOT NULL,
            categoria   TEXT    NOT NULL,
            emoji       TEXT    DEFAULT '🌸',
            stock       INTEGER DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS clientes (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre         TEXT NOT NULL,
            telefono       TEXT NOT NULL UNIQUE,
            direccion      TEXT,
            fecha_registro TEXT DEFAULT (date('now'))
        );
        CREATE TABLE IF NOT EXISTS pedidos (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo     TEXT    NOT NULL UNIQUE,
            cliente_id INTEGER NOT NULL,
            direccion  TEXT    NOT NULL,
            nota       TEXT,
            total      REAL    NOT NULL,
            estado     TEXT    DEFAULT 'registrado',
            fecha      TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        );
        CREATE TABLE IF NOT EXISTS detalle_pedido (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id   INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            cantidad    INTEGER NOT NULL,
            precio_unit REAL    NOT NULL,
            FOREIGN KEY (pedido_id)   REFERENCES pedidos(id),
            FOREIGN KEY (producto_id) REFERENCES productos(id)
        );
    ''')

    cursor.execute("SELECT COUNT(*) FROM productos")
    if cursor.fetchone()[0] == 0:
        datos = [
            ('Arreglo funebre clasico',   'Corona de rosas blancas artificiales. Ideal para homenajes.',         85.0,  'Funebre',    '🌹', 1),
            ('Ramo de aniversario',        'Ramo mixto en tonos rosados y blancos para momentos especiales.',     65.0,  'Aniversario', '💐', 1),
            ('Decoracion de cumpleanos',   'Arreglo festivo con flores de colores vibrantes e incluye base.',     55.0,  'Cumpleanos',  '🌸', 1),
            ('Centro de mesa empresarial', 'Arreglo formal para eventos corporativos. Colores neutros.',         120.0,  'Empresarial', '🌺', 1),
            ('Girasoles artificiales',     'Ramo de girasoles de alta calidad para decorar el hogar.',            45.0,  'Decoracion',  '🌻', 1),
            ('Arreglo navideno',           'Flores rojas y verdes con cintas y detalles dorados.',                70.0,  'Decoracion',  '🎄', 0),
            ('Bonsai decorativo',          'Bonsai artificial artesanal con maceta de ceramica.',                 90.0,  'Decoracion',  '🪴', 1),
            ('Cesta primaveral',           'Cesta de flores variadas en tonos pastel para cualquier ocasion.',    75.0,  'Aniversario', '🌼', 1),
        ]
        cursor.executemany(
            "INSERT INTO productos (nombre, descripcion, precio, categoria, emoji, stock) VALUES (?,?,?,?,?,?)",
            datos
        )

    conn.commit()
    conn.close()
    print("Base de datos lista.")
