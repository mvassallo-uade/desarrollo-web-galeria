function money(n) {
  try {
    return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  } catch {
    return `$${Math.round(n)}`;
  }
}

function getPrice(selectEl) {
  const opt = selectEl.options[selectEl.selectedIndex];
  const p = Number(opt.getAttribute('data-price')) || 0;
  return p;
}


function calcPromoA() {
  const prod = document.getElementById('productoA');
  const cant = Number(document.getElementById('cantidadA').value) || 0;
  const price = getPrice(prod);

  const subtotal = price * cant;
  const pares = Math.floor(cant / 2);
  const descuento = pares * (price * 0.5);
  const total = Math.max(0, subtotal - descuento);

  document.getElementById('subtotalA').textContent = money(subtotal);
  document.getElementById('descuentoA').textContent = `${money(descuento)}`;
  document.getElementById('totalA').textContent = money(total);
}


function calcPromoB() {
  const s1 = document.getElementById('productoB1');
  const s2 = document.getElementById('productoB2');
  const s3 = document.getElementById('productoB3');

  const prices = [s1, s2, s3].map(s => s ? getPrice(s) : 0);
  const valid  = prices.filter(p => p > 0);

  const subtotal  = prices.reduce((a, p) => a + p, 0);
  const descuento = (valid.length === 3) ? Math.min(...prices) : 0;
  const total     = Math.max(0, subtotal - descuento);

  const $ = id => document.getElementById(id);
  $('subtotalB').textContent  = money(subtotal);
  $('descuentoB').textContent = money(descuento);
  $('totalB').textContent     = money(total);
}

function calcPromoC() {
  const prod = document.getElementById('productoC');
  const cant = Number(document.getElementById('cantidadC').value) || 0;
  const price = getPrice(prod);

  const subtotal = price * cant;
  const descuento = subtotal >= 900000 ? subtotal * 0.10 : 0;
  const total = Math.max(0, subtotal - descuento);

  document.getElementById('subtotalC').textContent = money(subtotal);
  document.getElementById('descuentoC').textContent = descuento ? `${money(descuento)}` : money(0);
  document.getElementById('totalC').textContent = money(total);
}

function bindEvents() {
const sA = document.getElementById('productoA');
  const qA = document.getElementById('cantidadA');
  if (sA) sA.addEventListener('change', calcPromoA);
  if (qA) qA.addEventListener('input',  calcPromoA);
  calcPromoA();

  ['productoB1', 'productoB2', 'productoB3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', calcPromoB);
  });
  calcPromoB();

  const sC = document.getElementById('productoC');
  const qC = document.getElementById('cantidadC');
  if (sC) sC.addEventListener('change', calcPromoC);
  if (qC) qC.addEventListener('input',  calcPromoC);
  calcPromoC();
  };


document.addEventListener('DOMContentLoaded', bindEvents);
