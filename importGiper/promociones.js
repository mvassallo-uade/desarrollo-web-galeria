const productos = [    { id: '1', nombre: 'Vajilla de cerámica', precio: 15000 },
    { id: '2', nombre: 'Set de utensilios', precio: 8500 },
    { id: '3', nombre: 'Contenedores (set 3)', precio: 6000 },
    { id: '4', nombre: 'Jarra de vidrio', precio: 4500 },
    { id: '5', nombre: 'Sartén antiadherente', precio: 12000 },
    { id: '6', nombre: 'Set de cubiertos', precio: 9500 },
    { id: '7', nombre: 'Ensaladera', precio: 5500 },
    { id: '8', nombre: 'Tazas (set 6)', precio: 7000 }
];

function completarSelects() {
    const selects = document.querySelectorAll('.promo-select');
    
    selects.forEach(select => {
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} - ${producto.precio}`;
            select.appendChild(option);
        });
    });
}

function encontrarProducto(id) {
    return productos.find(p => p.id === id);
}

document.getElementById('promo1Form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const producto1Id = document.getElementById('promo1-product1').value;
    const producto2Id = document.getElementById('promo1-product2').value;
    
    const producto1 = encontrarProducto(producto1Id);
    const producto2 = encontrarProducto(producto2Id);
    console.log(producto1,producto1Id)
    const total = producto1.precio + producto2.precio;
    const precioMenor = Math.min(producto1.precio, producto2.precio);
    const descuento = precioMenor * 0.5;
    const resultado= total - descuento;

    document.getElementById('promo1-total').textContent = total;
    document.getElementById('promo1-discount').textContent = descuento;
    document.getElementById('promo1-final').textContent = resultado;
    document.getElementById('promo1-savings').textContent = `Ahorrás ${descuento} pesos!`;

    document.getElementById('promo1Result').classList.add('show');
});

document.getElementById('promo2Form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const producto1Id = document.getElementById('promo2-product1').value;
    const producto2Id = document.getElementById('promo2-product2').value;
    const producto3Id = document.getElementById('promo2-product3').value;
    
    const producto1 = encontrarProducto(producto1Id);
    const producto2 = encontrarProducto(producto2Id);
    const producto3 = encontrarProducto(producto3Id);
    
    const productosArray = [producto1, producto2, producto3];
    const total = productosArray.reduce((sum, p) => sum + p.precio, 0);
    

    productosArray.sort((a, b) => a.precio - b.precio);
    const descuento = productosArray[0].precio;
    const final = total - descuento;
    
    document.getElementById('promo2-total').textContent = total;
    document.getElementById('promo2-discount').textContent = descuento;
    document.getElementById('promo2-final').textContent = final;
    document.getElementById('promo2-savings').textContent = `Ahorrás ${descuento} pesos!`;

    document.getElementById('promo2Result').classList.add('show');
});


let promo3ItemCount = 1;

function agregarItemPromo3() {
    const container = document.getElementById('promo3ItemsContainer');
    const template = document.getElementById('promo3ItemTemplate');
    
    const newItem = template.cloneNode(true);
    newItem.style.display = ''; 
    newItem.id = `item-${promo3ItemCount}`;
    
    const select = newItem.querySelector('.promo3-product');
    const input = newItem.querySelector('.promo3-quantity');

    select.id = `promo3-product-${promo3ItemCount}`;
    input.id = `promo3-quantity-${promo3ItemCount}`;
    
    select.innerHTML = '<option value="">Seleccioná un producto</option>';
    productos.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.nombre} - ${p.precio}`;
        select.appendChild(option);
    });


    container.appendChild(newItem);
    promo3ItemCount++;
}
agregarItemPromo3();

document.getElementById('addItemBtn').addEventListener('click', agregarItemPromo3);
document.getElementById('promo3Form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productSelects = document.querySelectorAll('.promo3-product');
    const quantityInputs = document.querySelectorAll('.promo3-quantity');
    
    let total = 0;
    let hayProductos = false;
    
    for (let i = 0; i < productSelects.length; i++) {
        const productoId = productSelects[i].value;
        const cantidad = quantityInputs[i].value || 0;
        
        if (productoId && cantidad > 0) {
            hayProductos = true;
            const producto = encontrarProducto(productoId);
            if (producto) {
                total += producto.precio * cantidad;
            }
        }
    }
    
    const descuento = total >= 30000 ? total * 0.1 : 0;
    const final = total - descuento;
    
    document.getElementById('promo3-total').textContent = total;
    document.getElementById('promo3-discount').textContent = `-${descuento}`;
    document.getElementById('promo3-final').textContent = final;

    const resultBox = document.getElementById('promo3Result');
    const savingsBadge = document.getElementById('promo3-savings');
    
    if (descuento > 0) {
        savingsBadge.textContent = `Ahorrás ${descuento}!`;
    } else {
        const faltante = 30000 - total;
        savingsBadge.textContent = `Te faltan ${faltante} para obtener el 10% de descuento`;
    }
    resultBox.classList.add('show');
});

window.addEventListener('DOMContentLoaded', completarSelects);
