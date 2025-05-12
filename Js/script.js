console.log("MyShop is ready!");

// Helper to safely retrieve cart from localStorage
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (err) {
        console.error('Error reading cart from storage:', err);
        return [];
    }
}

// Initialize global cart
let cart = getCart();

// Save cart to localStorage and update global variable
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Add to cart function
function addToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, image, quantity: 1 });
    }
    saveCart();
    alert(`${name} added to cart!`);
}

// Update cart total using the global cart variable
function updateCartTotal() {
    const cart = getCart();
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    const totalElement = document.querySelector('.cart-summary h2');
    if (totalElement) {
        totalElement.textContent = `Total: $${total.toFixed(2)}`;
    }
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// Load cart items into the cart page
function loadCartItems() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    cartContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>Price: $${item.price.toFixed(2)}</p>
                <input type="number" value="${item.quantity}" min="1" data-index="${index}">
                <button class="remove-item" data-index="${index}">Remove</button>
            </div>
        </div>
    `).join('');

    updateCartTotal();
}

// Setup event listeners for cart page interactions
function setupCartEvents() {
    const cartContainer = document.getElementById('cart-items');
    const checkoutForm = document.getElementById('checkout-form');
    
    if (!cartContainer) return;

    // Handle checkout form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentCart = getCart();
            
            if (!currentCart || currentCart.length === 0) {
                alert('Your cart is empty! Add some items before checking out.');
                return;
            }
            
            // Proceed to checkout if cart has items
            window.location.href = 'checkout.html';
        });
    }

    // Remove item event
    cartContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const index = e.target.dataset.index;
            cart.splice(index, 1);
            saveCart();
            loadCartItems();
            updateCartTotal();
        }
    });

    // Quantity change event
    cartContainer.addEventListener('change', (e) => {
        if (e.target.type === 'number') {
            const index = e.target.dataset.index;
            cart[index].quantity = Math.max(1, parseInt(e.target.value) || 1);
            saveCart();
            updateCartTotal();
        }
    });
}

// Checkout validation function
function validateCheckout(event) {
    event.preventDefault();
    const currentCart = getCart();
    
    if (!currentCart || currentCart.length === 0) {
        alert('Your cart is empty! Add some items before checking out.');
        return false;
    }
    
    // Only proceed if cart has items
    window.location.href = 'checkout.html';
    return false;
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.add-to-cart');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            const image = button.dataset.image;
            addToCart(name, price, image);
        });
    });

    // If we're on the cart page, load items and set up events
    if (window.location.pathname.includes('cart.html')) {
        cart = getCart(); // Refresh cart from storage
        loadCartItems();
        setupCartEvents();
        updateCartTotal();
    }
});