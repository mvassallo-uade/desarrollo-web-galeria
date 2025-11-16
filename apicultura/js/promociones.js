function calcularPromocion() {
    var precio = parseFloat(document.getElementById('producto').value);
    var cantidad = parseInt(document.getElementById('cantidad').value);
    var promocion = document.getElementById('promocion').value;
    
    if (precio === 0) {
        alert('Por favor seleccioná un producto');
        return;
    }
    
    if (cantidad < 1) {
        alert('La cantidad debe ser mayor a 0');
        return;
    }
    
    var totalSinDescuento = precio * cantidad;
    var descuento = 0;
    var mensaje = '';
    
    if (promocion === '2x1') {
        if (cantidad >= 2) {
            var pares = Math.floor(cantidad / 2);
            descuento = pares * (precio * 0.5);
            mensaje = '¡Ahorraste con el 2x1!';
        } else {
            mensaje = 'Necesitás al menos 2 productos para esta promo';
        }
    } else if (promocion === '3x2') {
        if (cantidad >= 3) {
            var grupos = Math.floor(cantidad / 3);
            descuento = grupos * precio;
            mensaje = '¡Ahorraste con el 3x2!';
        } else {
            mensaje = 'Necesitás al menos 3 productos para esta promo';
        }
    } else if (promocion === 'descuento') {
        if (totalSinDescuento >= 30000) {
            descuento = totalSinDescuento * 0.10;
            mensaje = '¡Aplicaste el 10% de descuento!';
        } else {
            mensaje = 'El total debe superar los $30.000 para aplicar esta promo';
        }
    } else {
        mensaje = 'Sin descuento aplicado';
    }
    
    var totalFinal = totalSinDescuento - descuento;
    
    document.getElementById('totalSin').textContent = '$' + totalSinDescuento.toLocaleString('es-AR');
    document.getElementById('descuento').textContent = '-$' + descuento.toLocaleString('es-AR');
    document.getElementById('totalFinal').textContent = '$' + totalFinal.toLocaleString('es-AR');
    document.getElementById('mensajeAhorro').textContent = mensaje;
    
    document.getElementById('resultado').style.display = 'block';
}