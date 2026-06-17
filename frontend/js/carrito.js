let carrito = [];

function addCart(id, nombre, precio, emoji) {
  const ex = carrito.find(x => x.id === id);
  if (ex) ex.qty++;
  else carrito.push({ id, nombre, precio, emoji, qty: 1 });
  actualizarBadge();
  mostrarToast(`${emoji} ${nombre} agregado`);
}

function actualizarBadge() {
  const t = carrito.reduce((s, x) => s + x.qty, 0);
  const b = document.getElementById('cart-badge');
  if (t > 0) { b.classList.remove('d-none'); b.textContent = t; }
  else b.classList.add('d-none');
}

function renderCarrito() {
  const c = document.getElementById('contenido-carrito');
  if (!carrito.length) {
    c.innerHTML = `<div class="vacio">
      <i class="bi bi-cart3" aria-hidden="true"></i>
      <p>Tu carrito está vacío.<br>
        <button class="btn btn-link text-success p-0" onclick="showPage('catalogo')">Ver catálogo</button>
      </p></div>`;
    return;
  }
  const total = carrito.reduce((s, x) => s + x.precio * x.qty, 0);
  c.innerHTML = `
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body p-3">
        ${carrito.map(it => `
          <div class="cart-row">
            <span style="font-size:2rem" role="img" aria-label="${it.nombre}">${it.emoji}</span>
            <div class="flex-fill">
              <div class="fw-semibold" style="font-size:.9rem">${it.nombre}</div>
              <div class="text-muted" style="font-size:.8rem">S/ ${it.precio} × ${it.qty} = <b>S/ ${(it.precio*it.qty).toFixed(2)}</b></div>
            </div>
            <div class="d-flex align-items-center gap-1">
              <button class="qty-btn" onclick="cambiarQty(${it.id},-1)" aria-label="Quitar uno de ${it.nombre}"><i class="bi bi-dash"></i></button>
              <span style="min-width:1.2rem;text-align:center;font-weight:600">${it.qty}</span>
              <button class="qty-btn" onclick="cambiarQty(${it.id},1)" aria-label="Agregar uno más de ${it.nombre}"><i class="bi bi-plus"></i></button>
            </div>
          </div>`).join('')}
        <div class="d-flex justify-content-between fw-bold fs-5 pt-3 border-top mt-2">
          <span>Total (incl. envío S/15)</span>
          <span class="text-success">S/ ${(total + 15).toFixed(2)}</span>
        </div>
      </div>
    </div>
    <button class="btn btn-success btn-lg w-100 fw-semibold" onclick="mostrarCheckout()">
      <i class="bi bi-arrow-right-circle" aria-hidden="true"></i> Continuar con el pedido
    </button>`;
}

function cambiarQty(id, delta) {
  const it = carrito.find(x => x.id === id);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) carrito = carrito.filter(x => x.id !== id);
  actualizarBadge();
  renderCarrito();
}

function mostrarCheckout() {
  document.getElementById('vista-carrito').classList.add('d-none');
  document.getElementById('vista-checkout').classList.remove('d-none');
  renderResumen();
  document.getElementById('c-nombre').focus();
}

function renderResumen() {
  const total = carrito.reduce((s, x) => s + x.precio * x.qty, 0);
  document.getElementById('resumen-checkout').innerHTML =
    carrito.map(it => `
      <div class="d-flex justify-content-between small mb-1">
        <span>${it.emoji} ${it.nombre} ×${it.qty}</span>
        <span>S/ ${(it.precio*it.qty).toFixed(2)}</span>
      </div>`).join('') +
    `<hr class="my-2">
     <div class="d-flex justify-content-between small text-muted mb-1"><span>Envío</span><span>S/ 15.00</span></div>
     <div class="d-flex justify-content-between fw-bold"><span>Total</span><span class="text-success">S/ ${(total+15).toFixed(2)}</span></div>`;
}

function volverCarrito() {
  document.getElementById('vista-checkout').classList.add('d-none');
  document.getElementById('vista-carrito').classList.remove('d-none');
}

async function confirmarPedido() {
  const nombre    = document.getElementById('c-nombre').value.trim();
  const telefono  = document.getElementById('c-telefono').value.trim();
  const direccion = document.getElementById('c-direccion').value.trim();
  const nota      = document.getElementById('c-nota').value.trim();

  if (!nombre || !telefono || !direccion) {
    mostrarToast('Completa los campos obligatorios (*)','warning');
    return;
  }

  const btn = document.querySelector('[onclick="confirmarPedido()"]');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Procesando...`;

  try {
    const res = await API.post('/pedidos', {
      nombre, telefono, direccion, nota,
      items: carrito.map(x => ({ producto_id: x.id, cantidad: x.qty }))
    });
    carrito = [];
    actualizarBadge();
    document.getElementById('vista-checkout').classList.add('d-none');
    document.getElementById('vista-exito').classList.remove('d-none');
    document.getElementById('msg-exito').innerHTML =
      `Código: <strong>${res.codigo}</strong> — Total: <strong>S/ ${res.total.toFixed(2)}</strong><br>
       Te contactaremos al <strong>${telefono}</strong> para coordinar la entrega.`;
  } catch(e) {
    mostrarToast(e.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-check-circle"></i> Confirmar pedido`;
  }
}

function nuevoCarrito() {
  document.getElementById('vista-exito').classList.add('d-none');
  document.getElementById('vista-carrito').classList.remove('d-none');
  showPage('catalogo');
}