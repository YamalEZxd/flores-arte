const API_BASE = '/api';

const API = {
  async get(ruta) {
    const r = await fetch(API_BASE + ruta);
    if (!r.ok) throw new Error(`Error ${r.status}`);
    return r.json();
  },
  async post(ruta, body) {
    const r = await fetch(API_BASE + ruta, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || `Error ${r.status}`);
    return data;
  },
  async patch(ruta, body = {}) {
    const r = await fetch(API_BASE + ruta, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(`Error ${r.status}`);
    return r.json();
  },
  async delete(ruta) {
    const r = await fetch(API_BASE + ruta, { method: 'DELETE' });
    if (!r.ok) throw new Error(`Error ${r.status}`);
    return r.json();
  }
};