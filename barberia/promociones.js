function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function calculatePromo1() {
    const product1Value = parseInt(document.getElementById('promo1-product1').value) || 0;
    const product2Value = parseInt(document.getElementById('promo1-product2').value) || 0;

    if (product1Value === 0 || product2Value === 0) {
        alert('Por favor selecciona ambos productos para calcular el descuento.');
        return;
    }

    const originalTotal = product1Value + product2Value;
    const cheaperProduct = Math.min(product1Value, product2Value);
    const discount = cheaperProduct * 0.5;
    const finalTotal = originalTotal - discount;

    document.getElementById('promo1-original').textContent = formatCurrency(originalTotal);
    document.getElementById('promo1-discount').textContent = formatCurrency(discount);
    document.getElementById('promo1-final').textContent = formatCurrency(finalTotal);
    document.getElementById('promo1-results').classList.remove('hidden');
}

function calculatePromo2() {
    const service1Value = parseInt(document.getElementById('promo2-service1').value) || 0;
    const service2Value = parseInt(document.getElementById('promo2-service2').value) || 0;
    const service3Value = parseInt(document.getElementById('promo2-service3').value) || 0;

    if (service1Value === 0 || service2Value === 0 || service3Value === 0) {
        alert('Por favor selecciona los tres servicios para calcular el descuento.');
        return;
    }

    const services = [service1Value, service2Value, service3Value];
    services.sort((a, b) => b - a);

    const originalTotal = services.reduce((total, value) => total + value, 0);
    const discount = services[2];
    const finalTotal = originalTotal - discount;

    document.getElementById('promo2-original').textContent = formatCurrency(originalTotal);
    document.getElementById('promo2-discount').textContent = formatCurrency(discount);
    document.getElementById('promo2-final').textContent = formatCurrency(finalTotal);
    document.getElementById('promo2-results').classList.remove('hidden');
}

function calculatePromo3() {
    const checkboxes = document.querySelectorAll('.promo3-item:checked');

    if (checkboxes.length === 0) {
        alert('Por favor selecciona al menos un servicio o producto para calcular el descuento.');
        return;
    }

    let originalTotal = 0;

    checkboxes.forEach(checkbox => {
        const quantityInput = checkbox.parentElement.querySelector('input[type="number"]');
        if (quantityInput) {
            const basePrice = parseInt(checkbox.getAttribute('data-base-price') || checkbox.getAttribute('value'));
            const quantity = parseInt(quantityInput.value) || 1;
            originalTotal += basePrice * quantity;
        } else {
            const value = parseInt(checkbox.value);
            originalTotal += value;
        }
    });

    const threshold = 20000;
    const discountRate = 0.10;
    let discount = 0;
    let finalTotal = originalTotal;
    let message = '';

    if (originalTotal >= threshold) {
        discount = originalTotal * discountRate;
        finalTotal = originalTotal - discount;
        message = '¡Felicitaciones! Tu compra califica para el 10% de descuento.';
    } else {
        const remaining = threshold - originalTotal;
        message = `Te faltan ${formatCurrency(remaining)} para obtener el 10% de descuento.`;
    }

    document.getElementById('promo3-original').textContent = formatCurrency(originalTotal);
    document.getElementById('promo3-discount').textContent = formatCurrency(discount);
    document.getElementById('promo3-final').textContent = formatCurrency(finalTotal);

    const messageElement = document.getElementById('promo3-message');
    messageElement.textContent = message;
    messageElement.className = originalTotal >= threshold
        ? 'mt-4 p-3 rounded bg-green-900/50 text-green-300 text-sm'
        : 'mt-4 p-3 rounded bg-yellow-900/50 text-yellow-300 text-sm';
    messageElement.classList.remove('hidden');

    document.getElementById('promo3-results').classList.remove('hidden');
}

function updateQuantity(input, basePrice) {
    const checkbox = input.parentElement.querySelector('input[type="checkbox"]');
    const quantity = parseInt(input.value) || 1;
    
    checkbox.setAttribute('value', basePrice * quantity);
    
    if (checkbox.checked) {
        checkbox.value = basePrice * quantity;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const productCheckboxes = document.querySelectorAll('.promo3-item');

    productCheckboxes.forEach(checkbox => {
        const quantityInput = checkbox.parentElement.querySelector('input[type="number"]');

        if (quantityInput) {
            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    const basePrice = parseInt(this.getAttribute('value'));
                    const quantity = parseInt(quantityInput.value) || 1;
                    this.value = basePrice * quantity;
                }
            });

            quantityInput.addEventListener('change', function () {
                const basePrice = parseInt(checkbox.getAttribute('value'));
                const quantity = parseInt(this.value) || 1;

                if (checkbox.checked) {
                    checkbox.value = basePrice * quantity;
                }
            });
        }
    });
});
