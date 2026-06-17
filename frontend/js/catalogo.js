let categoriaActiva = 'Todos';

async function inicializarCatalogo() {
  await cargarFiltros();
  await renderProductos();
}

async function cargarFiltros() {
  const cats = await API.get('/productos/categorias');
  document.getElementById('filtros').innerHTML = cats.map(c => `
    <button class="btn-filtro ${c === categoriaActiva ? 'activo' : ''}"
            onclick="cambiarCategoria('${c}')"
            aria-pressed="${c === categoriaActiva}">
      ${c}
    </button>`).join('');
}

async function cambiarCategoria(cat) {
  categoriaActiva = cat;
  await cargarFiltros();
  await renderProductos();
}

async function filtrarProductos() {
  await renderProductos();
}

async function renderProductos() {
  const q    = document.getElementById('buscador')?.value || '';
  const grid = document.getElementById('grid-productos');
  grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">
    <div class="spinner-border spinner-border-sm text-success" role="status">
      <span class="visually-hidden">Cargando...</span>
    </div> Cargando productos...
  </div>`;

  try {
    const prods = await API.get(`/productos?categoria=${encodeURIComponent(categoriaActiva)}&q=${encodeURIComponent(q)}`);

    if (!prods.length) {
      grid.innerHTML = `<div class="col-12">
        <div class="vacio">
          <i class="bi bi-search" aria-hidden="true"></i>
          <p>No se encontraron productos.
            <button class="btn btn-link p-0 text-success" onclick="cambiarCategoria('Todos')">Ver todos</button>
          </p>
        </div></div>`;
      return;
    }

    grid.innerHTML = prods.map(p => `
      <div class="col">
        <article class="producto-card" tabindex="0"
                 onclick="abrirProducto(${p.id})"
                 onkeydown="if(event.key==='Enter') abrirProducto(${p.id})"
                 aria-label="${p.nombre}, S/ ${p.precio}, ${p.stock ? 'disponible' : 'agotado'}">
          <div class="producto-img" role="img" aria-label="${p.emoji} ${p.nombre}">${p.emoji}</div>
          <div class="producto-body">
            <div class="producto-nombre">${p.nombre}</div>
            <div class="producto-cat mb-2">${p.categoria}</div>
            <div class="d-flex align-items-center justify-content-between mt-auto">
              <span class="producto-precio">S/ ${p.precio}</span>
              <div class="d-flex align-items-center gap-1">
                <span class="${p.stock ? 'badge-disp' : 'badge-agot'}">${p.stock ? 'Disponible' : 'Agotado'}</span>
                <button class="btn-add" ${p.stock ? '' : 'disabled'}
                        aria-label="Agregar ${p.nombre} al pedido"
                        onclick="event.stopPropagation(); addCart(${p.id},'${p.nombre}',${p.precio},'${p.emoji}')">
                  <i class="bi bi-plus" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>`).join('');

  } catch(e) {
    grid.innerHTML = `<div class="col-12">
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
        No se pudo conectar con el servidor. Ejecuta <code>python run.py</code>.
      </div></div>`;
  }
}

async function abrirProducto(id) {
  try {
    const p = await API.get(`/productos/${id}`);
    document.getElementById('modalProductoTitulo').textContent = p.nombre;
    document.getElementById('modal-emoji').textContent = p.emoji;
    document.getElementById('modal-precio').textContent = `S/ ${p.precio}`;
    document.getElementById('modal-desc').textContent   = p.descripcion;
    document.getElementById('modal-stock').innerHTML    = p.stock
      ? `<span class="badge-disp">✓ Disponible</span>`
      : `<span class="badge-agot">✗ Agotado</span>`;
    const btn = document.getElementById('modal-btn-agregar');
    btn.disabled = !p.stock;
    btn.onclick  = () => {
      addCart(p.id, p.nombre, p.precio, p.emoji);
      bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
    };
    new bootstrap.Modal(document.getElementById('modalProducto')).show();
  } catch(e) { mostrarToast('Error al cargar producto', 'danger'); }
}
