const productos = [
  { id: 1, nombre: 'CPLMMW Malbec', precio: 8500 },
  { id: 2, nombre: 'El Enemigo Malbec', precio: 12000 },
  { id: 3, nombre: 'El Enemigo Cabernet Franc', precio: 15000 },
  { id: 4, nombre: 'MMW Blend', precio: 9500 },
  { id: 5, nombre: 'SPPMMW Blend', precio: 18000 }
];

function formatearNumero(numero) {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
}

function poblarSelect(select) {
  while (select.options.length > 1) {
    select.remove(1);
  }
  

  productos.forEach(producto => {
    const option = document.createElement('option');
    option.value = producto.id;
    option.textContent = `${producto.nombre} - $${formatearNumero(producto.precio)}`;
    select.appendChild(option);
  });
}

function poblarSelects() {
  
  const selects = document.querySelectorAll('select[id^="promo1-producto"], select[id^="promo2-producto"], select.promo3-producto');
  
  selects.forEach(select => {
    poblarSelect(select);
  });
}

function obtenerPrecio(productoId) {
  const producto = productos.find(p => p.id === parseInt(productoId));
  return producto ? producto.precio : 0;
}

function obtenerNombre(productoId) {
  const producto = productos.find(p => p.id === parseInt(productoId));
  return producto ? producto.nombre : '';
}

document.addEventListener('DOMContentLoaded', function() {
  poblarSelects();
});

document.getElementById('promo1-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const producto1Id = document.getElementById('promo1-producto1').value;
  const producto2Id = document.getElementById('promo1-producto2').value;
  
  if (!producto1Id || !producto2Id) {
    alert('Por favor seleccioná ambos productos');
    return;
  }
  
  const precio1 = obtenerPrecio(producto1Id);
  const precio2 = obtenerPrecio(producto2Id);
  
  const totalSinDescuento = precio1 + precio2;
  
  const menorPrecio = Math.min(precio1, precio2);
  const descuento = menorPrecio * 0.5;
  const totalFinal = totalSinDescuento - descuento;
  const ahorro = descuento;
  
  document.getElementById('promo1-sin-descuento').textContent = formatearNumero(totalSinDescuento);
  document.getElementById('promo1-descuento').textContent = formatearNumero(descuento);
  document.getElementById('promo1-total').textContent = formatearNumero(totalFinal);
  document.getElementById('promo1-ahorro').textContent = formatearNumero(ahorro);
  
  document.getElementById('promo1-resultado').style.display = 'block';
});

document.getElementById('promo2-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const producto1Id = document.getElementById('promo2-producto1').value;
  const producto2Id = document.getElementById('promo2-producto2').value;
  const producto3Id = document.getElementById('promo2-producto3').value;
  
  if (!producto1Id || !producto2Id || !producto3Id) {
    alert('Por favor seleccioná los tres productos');
    return;
  }
  
  const precio1 = obtenerPrecio(producto1Id);
  const precio2 = obtenerPrecio(producto2Id);
  const precio3 = obtenerPrecio(producto3Id);
  
  const precios = [precio1, precio2, precio3];
  const menorPrecio = Math.min(...precios);
  
  const totalSinDescuento = precio1 + precio2 + precio3;
  const descuento = menorPrecio; // El producto más barato es gratis
  const totalFinal = totalSinDescuento - descuento;
  const ahorro = descuento;
 
  document.getElementById('promo2-sin-descuento').textContent = formatearNumero(totalSinDescuento);
  document.getElementById('promo2-descuento').textContent = formatearNumero(descuento);
  document.getElementById('promo2-total').textContent = formatearNumero(totalFinal);
  document.getElementById('promo2-ahorro').textContent = formatearNumero(ahorro);
  
  document.getElementById('promo2-resultado').style.display = 'block';
});

function agregarProductoPromo3() {
  const container = document.getElementById('promo3-productos-container');
  const nuevoProducto = document.createElement('div');
  nuevoProducto.className = 'producto-row';
  
  nuevoProducto.innerHTML = `
    <div class="form-group">
      <label>Producto</label>
      <select class="promo3-producto" name="producto" required>
        <option value="">Seleccioná un producto</option>
      </select>
    </div>
    <div class="form-group">
      <label>Cantidad</label>
      <input type="number" class="promo3-cantidad" name="cantidad" min="1" value="1" required>
    </div>
    <button type="button" class="btn-eliminar" onclick="this.parentElement.remove()">Eliminar</button>
  `;
  
  const select = nuevoProducto.querySelector('.promo3-producto');
  poblarSelect(select);
  
  container.appendChild(nuevoProducto);
}

document.getElementById('promo3-agregar-producto').addEventListener('click', function() {
  agregarProductoPromo3();
});

document.getElementById('promo3-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const productosSeleccionados = document.querySelectorAll('.promo3-producto');
  const cantidades = document.querySelectorAll('.promo3-cantidad');
  
  let totalSinDescuento = 0;
  
  productosSeleccionados.forEach((select, index) => {
    const productoId = select.value;
    const cantidad = parseInt(cantidades[index].value) || 0;
    
    if (productoId) {
      const precio = obtenerPrecio(productoId);
      totalSinDescuento += precio * cantidad;
    }
  });
  
  const montoMinimo = 30000;
  let descuento = 0;
  let totalFinal = totalSinDescuento;
  let ahorro = 0;
  
  const resultadoDiv = document.getElementById('promo3-resultado');
  const mensajeMinimo = document.getElementById('promo3-mensaje-minimo');
  const descuentoInfo = document.getElementById('promo3-descuento-info');
  const ahorroText = document.getElementById('promo3-ahorro-text');
  
  if (totalSinDescuento >= montoMinimo) {
    descuento = totalSinDescuento * 0.1;
    totalFinal = totalSinDescuento - descuento;
    ahorro = descuento;
    
    mensajeMinimo.style.display = 'none';
    descuentoInfo.style.display = 'block';
    ahorroText.style.display = 'block';
  } else {
    mensajeMinimo.style.display = 'block';
    descuentoInfo.style.display = 'none';
    ahorroText.style.display = 'none';
    totalFinal = totalSinDescuento;
  }
  
  // Mostrar resultados
  document.getElementById('promo3-sin-descuento').textContent = formatearNumero(totalSinDescuento);
  document.getElementById('promo3-descuento').textContent = formatearNumero(descuento);
  document.getElementById('promo3-total-final').textContent = formatearNumero(totalFinal);
  document.getElementById('promo3-ahorro').textContent = formatearNumero(ahorro);
  
  resultadoDiv.style.display = 'block';
});
