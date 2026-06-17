const ETIQ = { registrado:'Registrado', preparacion:'En preparación', enviado:'Enviado', entregado:'Entregado' };
const PASOS = ['registrado','preparacion','enviado','entregado'];

async function renderPedidos(q = '') {
  const el = document.getElementById('lista-pedidos');
  el.innerHTML = `<div class="text-center py-4 text-muted">
    <div class="spinner-border spinner-border-sm text-success" role="status"><span class="visually-hidden">Cargando...</span></div>
    Cargando pedidos...
  </div>`;
  try {
    const pedidos = await API.get(`/pedidos?q=${encodeURIComponent(q)}`);
    if (!pedidos.length) {
      el.innerHTML = `<div class="vacio"><i class="bi bi-truck" aria-hidden="true"></i><p>${q ? 'Sin resultados para esa búsqueda.' : 'No hay pedidos registrados.'}</p></div>`;
      return;
    }
    el.innerHTML = pedidos.map(p => {
      const idx  = PASOS.indexOf(p.estado);
      const items = p.items.map(it => `${it.emoji} ${it.nombre} ×${it.cantidad}`).join(', ');
      return `
        <article class="card border-0 shadow-sm mb-3">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between flex-wrap gap-2 mb-2">
              <div>
                <h2 class="h6 fw-semibold mb-0">${p.nombre}</h2>
                <p class="text-muted small mb-0">${p.codigo} · ${p.fecha}</p>
              </div>
              <span class="estado-badge estado-${p.estado}" role="status">${ETIQ[p.estado]}</span>
            </div>
            <div class="barra-pasos" role="progressbar" aria-valuenow="${idx+1}" aria-valuemin="1" aria-valuemax="4" aria-label="Paso ${idx+1} de 4: ${ETIQ[p.estado]}">
              ${PASOS.map((_,i) => `<div class="paso ${i<=idx?'hecho':''}"></div>`).join('')}
            </div>
            <div class="d-flex justify-content-between" style="font-size:.7rem;color:#9ca3af" aria-hidden="true">
              <span>Registrado</span><span>Preparación</span><span>Enviado</span><span>Entregado</span>
            </div>
            <hr class="my-3">
            <dl class="row g-1 small mb-0">
              <dt class="col-sm-3 text-muted">Productos:</dt><dd class="col-sm-9">${items}</dd>
              <dt class="col-sm-3 text-muted">Dirección:</dt><dd class="col-sm-9">${p.direccion}</dd>
              <dt class="col-sm-3 text-muted">Total:</dt><dd class="col-sm-9 fw-semibold text-success">S/ ${p.total.toFixed(2)}</dd>
              ${p.nota ? `<dt class="col-sm-3 text-muted">Nota:</dt><dd class="col-sm-9 fst-italic">${p.nota}</dd>` : ''}
            </dl>
          </div>
        </article>`;
    }).join('');
  } catch(e) {
    el.innerHTML = `<div class="alert alert-danger">Error al cargar pedidos. Verifica que el servidor esté activo.</div>`;
  }
}