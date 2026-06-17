const PAGINAS = ['catalogo','carrito','seguimiento','admin'];

function showPage(pagina) {
  PAGINAS.forEach(p => {
    document.getElementById(`page-${p}`).classList.add('d-none');
    document.getElementById(`page-${p}`).classList.remove('active');
    const nav = document.getElementById(`nav-${p}`);
    nav.classList.remove('active');
    nav.removeAttribute('aria-current');
  });

  const page = document.getElementById(`page-${pagina}`);
  page.classList.remove('d-none');
  page.classList.add('active');
  const nav = document.getElementById(`nav-${pagina}`);
  nav.classList.add('active');
  nav.setAttribute('aria-current','page');

  const nb = document.getElementById('menuNavbar');
  if (nb.classList.contains('show')) bootstrap.Collapse.getInstance(nb)?.hide();

  if (pagina === 'catalogo')    inicializarCatalogo();
  if (pagina === 'carrito')     renderCarrito();
  if (pagina === 'seguimiento') renderPedidos();
  if (pagina === 'admin')       inicializarAdmin();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarToast(msg, tipo = 'success') {
  const el = document.getElementById('toast-msg');
  el.className = `toast align-items-center border-0 text-white bg-${tipo}`;
  document.getElementById('toast-texto').textContent = msg;
  bootstrap.Toast.getOrCreateInstance(el, { delay: 3000 }).show();
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarCatalogo();
});