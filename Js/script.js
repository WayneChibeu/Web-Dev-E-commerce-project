console.log("MyShop is ready!");

// Application state
const appState = {
    cart: {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 5.99,
        total: 0,
        promoCode: '',
        promoDiscount: 0
    },
    checkout: {
        currentStep: 1,
        shippingInfo: {},
        paymentInfo: {},
        orderSummary: {
            subtotal: 0,
            shipping: 0,
            tax: 0,
            total: 0
        }
    },
    products: {
        currentSort: 'default',
        currentFilter: 'all',
        searchQuery: '',
        list: [
            {
                id: '1',
                name: 'Smart Watch Pro',
                price: 199.99,
                category: 'electronics',
                rating: 4.5,
                popularity: 95,
                description: 'Advanced fitness tracking, heart rate monitoring, and smart notifications.',
                images: [
                    'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
                    'https://images.unsplash.com/photo-1544866092-1677b00f868f',
                    'https://images.unsplash.com/photo-1617043786394-f977fa12eddf'
                ],
                features: [
                    'Heart rate monitoring',
                    'Sleep tracking',
                    'GPS',
                    'Water resistant',
                    '5-day battery life'
                ],
                stock: 15
            }
            // Add more products here
        ]
    },
    promoCodes: {
        'SAVE10': 0.10,
        'SAVE20': 0.20,
        'WELCOME': 0.15
    }
};

// DOM Elements
const domElements = {
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    sortSelect: document.getElementById('sort-select'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    productGrid: document.querySelector('.product-grid'),
    modal: document.getElementById('quick-view-modal'),
    modalClose: document.getElementById('quick-view-modal')?.querySelector('.close'),
    modalBody: document.getElementById('quick-view-modal')?.querySelector('.modal-body')
};

// Helper to safely retrieve cart from localStorage
function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        return validateAndCleanCart(cart);
    } catch (err) {
        console.error('Error reading cart from storage:', err);
        return [];
    }
}

// Save cart to localStorage
function saveCart(cartItems) {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

// Add to cart function
function addToCart(productId, name, price, image, category) {
    const cartItems = getCart();
    const existingItem = cartItems.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            id: productId,
            name,
            price,
            image,
            category,
            quantity: 1
        });
    }
    
    saveCart(cartItems);
    updateCartBadge();
    showNotification(`${name} added to cart!`);
}

// Update cart badge
function updateCartBadge() {
    const cartItems = getCart();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize dark mode
function initializeDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // Setup theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        updateThemeToggleIcon(isDarkMode);
        themeToggle.addEventListener('click', toggleDarkMode);
    }
}

// Toggle dark mode
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateThemeToggleIcon(isDarkMode);
}

// Update theme toggle icon
function updateThemeToggleIcon(isDarkMode) {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = `<i class="fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}"></i>`;
    }
}

// Filter products by category
function filterProducts(category) {
    appState.products.currentFilter = category;
    const products = document.querySelectorAll('.product-card');
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    products.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode
    initializeDarkMode();
    
    // Setup add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const product = e.target.closest('.product-card');
            const productId = product.dataset.productId;
            const name = product.dataset.name;
            const price = parseFloat(product.dataset.price);
            const image = product.dataset.image;
            const category = product.dataset.category;
            
            addToCart(productId, name, price, image, category);
        });
    });
    
    // Setup category filters
    domElements.categoryBtns.forEach(button => {
        button.addEventListener('click', () => {
            filterProducts(button.dataset.category);
        });
    });
    
    // Initialize cart badge
    updateCartBadge();
    
    // If we're on the cart page, load items and set up events
    if (window.location.pathname.includes('cart.html')) {
        initializeCartPage();
    }
    
    // If we're on the checkout page, initialize checkout
    if (window.location.pathname.includes('checkout.html')) {
        initializeCheckout();
    }
});

// Update cart total with animation
function updateCartTotal() {
    const cart = getCart();
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const tax = subtotal * 0.10;
    const shipping = subtotal > 0 ? 5.99 : 0;
    const total = subtotal + tax + shipping;
    
    animateValue('subtotal', subtotal);
    animateValue('tax', tax);
    animateValue('shipping', shipping);
    animateValue('total', total);
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// Animate value change
function animateValue(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseFloat(element.textContent.replace('$', ''));
    const duration = 500; // Animation duration in milliseconds
    const start = performance.now();
    
    element.parentElement.classList.add('updating');
    
    requestAnimationFrame(function animate(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        const value = currentValue + (newValue - currentValue) * progress;
        element.textContent = formatPrice(value);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.parentElement.classList.remove('updating');
        }
    });
}

// Update quantity with animation
function updateQuantity(input, newValue) {
    input.classList.add('updating');
    input.value = newValue;
    
    setTimeout(() => {
        input.classList.remove('updating');
    }, 300);
}

// Format price
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

// Load cart items into the cart page
function loadCartItems() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;
    
    if (appState.cart.items.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    cartContainer.innerHTML = appState.cart.items.map((item, index) => `
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
            appState.cart.items = appState.cart.items.filter((_, i) => i !== index);
            saveCart(appState.cart.items);
            loadCartItems();
            updateCartTotal();
        }
    });

    // Quantity change event
    cartContainer.addEventListener('change', (e) => {
        if (e.target.type === 'number') {
            const index = e.target.dataset.index;
            appState.cart.items[index].quantity = Math.max(1, parseInt(e.target.value) || 1);
            saveCart(appState.cart.items);
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

// Load cart items with animation
async function loadCart() {
    showLoading(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        const cart = getCart();
        appState.cart.items = cart;
        updateCartDisplay();
    } catch (error) {
        console.error('Error loading cart:', error);
        showError('Failed to load cart items');
    } finally {
        showLoading(false);
    }
}

// Show/hide loading spinner
function showLoading(show) {
    const loadingSpinner = document.getElementById('loading');
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
        const cartItemsContainer = document.getElementById('cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.style.opacity = show ? '0.5' : '1';
        }
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.prepend(errorDiv);
    }
    setTimeout(() => errorDiv.remove(), 3000);
}

// Update cart display with animations
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    if (!cartItemsContainer) return;
    
    if (appState.cart.items.length === 0) {
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
        }
        cartItemsContainer.innerHTML = '';
    } else {
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'none';
        }
        renderCartItems();
    }
    
    updateCartTotal();
}

// Render cart items with a new, cleaner structure
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    const cart = appState.cart.items;
    if (!cart || cart.length === 0) {
        cartItemsContainer.innerHTML = ''; // Empty message handled by updateCartDisplay
        return;
    }

    cartItemsContainer.innerHTML = cart.map((item, index) => {
        const imageUrl = item.image ? item.image : 'https://via.placeholder.com/80'; // Fallback image
        return `
            <div class="cart-item" data-item-id="${item.id}" data-index="${index}">
                <img src="${imageUrl}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease" aria-label="Decrease quantity of ${item.name}">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" aria-label="Quantity for ${item.name}">
                            <button class="quantity-btn increase" aria-label="Increase quantity of ${item.name}">+</button>
                        </div>
                    </div>
                </div>
                <div class="cart-item-remove">
                    <button class="remove-item-btn" aria-label="Remove ${item.name} from cart">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Update cart totals
function updateCartTotals() {
    appState.cart.subtotal = appState.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    appState.cart.tax = appState.cart.subtotal * 0.10; // 10% tax
    appState.cart.total = appState.cart.subtotal + appState.cart.tax + appState.cart.shipping - appState.cart.promoDiscount;
    
    const subtotalElement = document.getElementById('subtotal');
    if (subtotalElement) {
        subtotalElement.textContent = formatPrice(appState.cart.subtotal);
    }
    
    const taxElement = document.getElementById('tax');
    if (taxElement) {
        taxElement.textContent = formatPrice(appState.cart.tax);
    }
    
    const shippingElement = document.getElementById('shipping');
    if (shippingElement) {
        shippingElement.textContent = formatPrice(appState.cart.shipping);
    }
    
    const totalElement = document.getElementById('total');
    if (totalElement) {
        totalElement.textContent = formatPrice(appState.cart.total);
    }
    
    // Save cart to localStorage
    saveCart(appState.cart.items);
}

// Update setupEventListeners for the new cart item structure
function setupEventListeners() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    cartItemsContainer.addEventListener('click', (e) => {
        const cartItemElement = e.target.closest('.cart-item');
        if (!cartItemElement) return;

        const itemId = cartItemElement.dataset.itemId;
        const itemIndex = appState.cart.items.findIndex(item => item.id === itemId);

        if (itemIndex === -1) {
            console.warn('Cart item not found in appState:', itemId);
            return;
        }

        const item = appState.cart.items[itemIndex];

        // Handle remove item button
        if (e.target.closest('.remove-item-btn')) {
            appState.cart.items.splice(itemIndex, 1);
            saveCart(appState.cart.items);
            updateCartDisplay();
            updateCartBadge();
            showNotification(`${item.name} removed from cart`, 'info');
        }
        // Handle quantity changes
        else if (e.target.classList.contains('quantity-btn')) {
            const input = cartItemElement.querySelector('.quantity-input');
            let quantity = parseInt(input.value, 10);

            if (e.target.classList.contains('increase')) {
                quantity++;
            } else if (e.target.classList.contains('decrease') && quantity > 1) {
                quantity--;
            }
            item.quantity = quantity;
            input.value = quantity;
            updateQuantity(input, quantity); // For visual feedback/animation
            saveCart(appState.cart.items);
            updateCartTotal();
            updateCartBadge();
        }
    });

    cartItemsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const cartItemElement = e.target.closest('.cart-item');
            if (!cartItemElement) return;

            const itemId = cartItemElement.dataset.itemId;
            const itemIndex = appState.cart.items.findIndex(item => item.id === itemId);

            if (itemIndex === -1) return;

            let newQuantity = parseInt(e.target.value, 10);
            if (isNaN(newQuantity) || newQuantity < 1) {
                newQuantity = 1;
            }
            appState.cart.items[itemIndex].quantity = newQuantity;
            e.target.value = newQuantity;
            updateQuantity(e.target, newQuantity); // For visual feedback/animation
            saveCart(appState.cart.items);
            updateCartTotal();
            updateCartBadge();
        }
    });

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (appState.cart.items.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                showNotification('Your cart is empty. Add items to proceed.', 'error');
            }
        });
    }
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.prepend(successDiv);
    }
    setTimeout(() => successDiv.remove(), 3000);
}

// Add sample items (for testing)
function addSampleItems() {
    appState.cart.items = [
        {
            id: '1',
            name: 'Sample Product 1',
            price: 29.99,
            quantity: 1,
            image: 'https://via.placeholder.com/100'
        },
        {
            id: '2',
            name: 'Sample Product 2',
            price: 49.99,
            quantity: 2,
            image: 'https://via.placeholder.com/100'
        }
    ];
    updateCartDisplay();
}

// Uncomment to add sample items for testing
// addSampleItems();

// Product data (in a real app, this would come from a database)
const products = [
    {
        id: '1',
        name: 'Smart Watch Pro',
        price: 199.99,
        category: 'electronics',
        rating: 4.5,
        popularity: 95,
        description: 'Advanced fitness tracking, heart rate monitoring, and smart notifications.',
        images: [
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
            'https://images.unsplash.com/photo-1544866092-1677b00f868f',
            'https://images.unsplash.com/photo-1617043786394-f977fa12eddf'
        ],
        features: [
            'Heart rate monitoring',
            'Sleep tracking',
            'GPS',
            'Water resistant',
            '5-day battery life'
        ],
        stock: 15
    },
    // Add more product data here
];

// Initialize state
let currentSort = 'default';
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const sortSelect = document.getElementById('sort-select');
const categoryBtns = document.querySelectorAll('.category-btn');
const productGrid = document.querySelector('.product-grid');
const modal = document.getElementById('quick-view-modal');
const modalClose = modal?.querySelector('.close');
const modalBody = modal?.querySelector('.modal-body');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize existing functionality
    initializeCart();
    setupEventListeners();
    
    // Initialize new functionality
    if (window.location.pathname.includes('products.html')) {
        initializeProducts();
    }
});

// Initialize products page
function initializeProducts() {
    // Search functionality
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
    
    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
    
    // Category filter
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.category;
            updateActiveCategory();
            filterAndSortProducts();
        });
    });
    
    // Quick view
    const quickViewBtns = document.querySelectorAll('.quick-view');
    quickViewBtns.forEach(btn => {
        btn.addEventListener('click', () => openQuickView(btn.dataset.productId));
    });
    
    // Modal close
    if (modalClose) {
        modalClose.addEventListener('click', closeQuickView);
    }
    
    // Close modal on outside click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeQuickView();
        });
    }
}

// Search functionality
function handleSearch() {
    if (!searchInput) return;
    searchQuery = searchInput.value.toLowerCase().trim();
    filterAndSortProducts();
}

// Sort functionality
function handleSort(e) {
    currentSort = e.target.value;
    filterAndSortProducts();
}

// Filter and sort products
function filterAndSortProducts() {
    const products = Array.from(document.querySelectorAll('.product-card'));
    
    products.forEach(product => {
        const matchesFilter = currentFilter === 'all' || product.dataset.category === currentFilter;
        const matchesSearch = product.dataset.name.toLowerCase().includes(searchQuery) ||
                            product.dataset.category.toLowerCase().includes(searchQuery);
        
        product.style.display = matchesFilter && matchesSearch ? 'block' : 'none';
    });
    
    // Sort visible products
    const visibleProducts = products.filter(p => p.style.display !== 'none');
    sortProducts(visibleProducts);
}

// Sort products
function sortProducts(products) {
    const sortedProducts = [...products].sort((a, b) => {
        const priceA = parseFloat(a.dataset.price);
        const priceB = parseFloat(b.dataset.price);
        const nameA = a.dataset.name.toLowerCase();
        const nameB = b.dataset.name.toLowerCase();
        const popularityA = parseInt(a.dataset.popularity);
        const popularityB = parseInt(b.dataset.popularity);
        
        switch (currentSort) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'name-asc':
                return nameA.localeCompare(nameB);
            case 'name-desc':
                return nameB.localeCompare(nameA);
            case 'popular':
                return popularityB - popularityA;
            default:
                return 0;
        }
    });
    
    const parent = productGrid;
    sortedProducts.forEach(product => parent.appendChild(product));
}

// Update active category
function updateActiveCategory() {
    categoryBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === currentFilter);
    });
}

// Quick view functionality
function openQuickView(productId) {
    if (!modal || !modalBody) return;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    modalBody.innerHTML = `
        <div class="product-images">
            <img src="${product.images[0]}" alt="${product.name}" class="main-image">
            <div class="product-gallery">
                ${product.images.map((img, i) => `
                    <img src="${img}" alt="${product.name} view ${i + 1}" 
                         class="gallery-thumbnail ${i === 0 ? 'active' : ''}"
                         onclick="changeMainImage(this)">
                `).join('')}
            </div>
        </div>
        <div class="product-details">
            <h2>${product.name}</h2>
            <div class="rating">
                ${generateStarRating(product.rating)}
                <span>(${product.rating})</span>
            </div>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p class="description">${product.description}</p>
            <div class="features">
                <h3>Key Features:</h3>
                <ul>
                    ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            <div class="stock-status">
                <p class="stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </p>
            </div>
            <button class="add-to-cart" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.images[0]}', '${product.category}')">
                <i class="fas fa-shopping-cart"></i>
                Add to Cart
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close quick view
function closeQuickView() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return `
        ${Array(fullStars).fill('<i class="fas fa-star"></i>').join('')}
        ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
        ${Array(emptyStars).fill('<i class="far fa-star"></i>').join('')}
    `;
}

// Change main image in quick view
function changeMainImage(thumbnail) {
    const mainImage = thumbnail.closest('.product-images').querySelector('.main-image');
    mainImage.src = thumbnail.src;
    
    // Update active state
    thumbnail.closest('.product-gallery').querySelectorAll('.gallery-thumbnail')
        .forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
}

// Checkout functionality
let checkoutState = {
    currentStep: 1,
    shippingInfo: {},
    paymentInfo: {},
    orderSummary: {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0
    }
};

// Initialize checkout page
function initializeCheckout() {
    if (!window.location.pathname.includes('checkout.html')) return;
    
    loadCartReview();
    updateOrderSummary();
    setupCheckoutEvents();
}

// Load cart review
function loadCartReview() {
    const cartReview = document.querySelector('.cart-review');
    const summaryItemsContainer = document.querySelector('.order-summary .summary-items');
    if (!cartReview || !summaryItemsContainer) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        cartReview.innerHTML = '<p>Your cart is empty. Please add items to proceed.</p>';
        summaryItemsContainer.innerHTML = '';
        return;
    }
    
    let cartHtml = '';
    let summaryHtml = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const imageUrl = item.image ? item.image : 'https://via.placeholder.com/60';
        
        cartHtml += `
            <div class="cart-item" data-item-id="${item.id}">
                <img src="${imageUrl}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <p>Total: $${itemTotal.toFixed(2)}</p>
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
        
        summaryHtml += `
            <div class="summary-item">
                <img src="${imageUrl}" alt="${item.name}">
                <div class="summary-item-details">
                    <p class="summary-item-name">${item.name}</p>
                    <p class="summary-item-price">$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
            </div>
        `;
    });
    
    cartReview.innerHTML = cartHtml;
    summaryItemsContainer.innerHTML = summaryHtml;
    
    cartReview.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            const currentCart = getCart();
            currentCart.splice(index, 1);
            saveCart(currentCart);
            loadCartReview();
            updateCartBadge();
            
            if (currentCart.length === 0) {
                window.location.href = 'cart.html';
            }
        });
    });
    
    appState.checkout.orderSummary.subtotal = subtotal;
    appState.checkout.orderSummary.tax = subtotal * 0.10;
    updateOrderSummary();
}

// Update order summary
function updateOrderSummary() {
    const { subtotal, shipping, tax } = checkoutState.orderSummary;
    const total = subtotal + shipping + tax;
    
    document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('summary-shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('summary-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
}

// Setup checkout events
function setupCheckoutEvents() {
    // Navigation buttons
    document.querySelectorAll('.next-step').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const nextStep = parseInt(btn.dataset.next);
            if (validateStep(checkoutState.currentStep)) {
                navigateToStep(nextStep);
            }
        });
    });
    
    document.querySelectorAll('.prev-step').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = parseInt(btn.dataset.prev);
            navigateToStep(prevStep);
        });
    });

    // Shipping method change
    const shippingMethod = document.getElementById('shipping-method');
    if (shippingMethod) {
        shippingMethod.addEventListener('change', (e) => {
            const method = e.target.value;
            checkoutState.orderSummary.shipping = getShippingCost(method);
            updateOrderSummary();
        });
    }
    
    // Form submissions
    setupFormValidation();
}

// Get shipping cost
function getShippingCost(method) {
    switch (method) {
        case 'express':
            return 9.99;
        case 'overnight':
            return 19.99;
        default:
            return 0;
    }
}

// Navigate between steps
function navigateToStep(step) {
    const currentStep = document.querySelector(`.checkout-step[id="step-${checkoutState.currentStep}"]`);
    const nextStep = document.querySelector(`.checkout-step[id="step-${step}"]`);
    const progressSteps = document.querySelectorAll('.progress-step');
    
    if (currentStep && nextStep) {
        currentStep.classList.remove('active');
        nextStep.classList.add('active');
        
        progressSteps.forEach(progressStep => {
            const stepNum = parseInt(progressStep.dataset.step);
            if (stepNum < step) {
                progressStep.classList.add('completed');
            }
            if (stepNum === step) {
                progressStep.classList.add('active');
            } else {
                progressStep.classList.remove('active');
            }
        });
        
        checkoutState.currentStep = step;
    }
}

// Validate current step
function validateStep(step) {
    switch (step) {
        case 1:
            return true; // Cart review
        case 2:
            return validateShippingForm();
        case 3:
            return validatePaymentForm();
        default:
            return true;
    }
}

// Setup form validation
function setupFormValidation() {
    const shippingForm = document.getElementById('shipping-form');
    const paymentForm = document.getElementById('payment-form');
    
    if (shippingForm) {
        shippingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateShippingForm()) {
                saveShippingInfo();
                navigateToStep(3);
            }
        });
    }
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validatePaymentForm()) {
                savePaymentInfo();
                processOrder();
            }
        });
    }
}

// Validate shipping form
function validateShippingForm() {
    const form = document.getElementById('shipping-form');
    if (!form) return false;
    
    const requiredFields = ['full-name', 'email', 'phone', 'address', 'city', 'state', 'zip'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            showFieldError(input, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(input);
        }
    });
    
    // Validate email format
    const email = document.getElementById('email');
    if (email && !isValidEmail(email.value)) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

// Validate payment form
function validatePaymentForm() {
    const form = document.getElementById('payment-form');
    if (!form) return false;
    
    const requiredFields = ['card-name', 'card-number', 'card-expiry', 'card-cvv'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            showFieldError(input, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(input);
            
            // Additional validation
            switch (field) {
                case 'card-number':
                    if (!isValidCardNumber(input.value)) {
                        showFieldError(input, 'Please enter a valid card number');
                        isValid = false;
                    }
                    break;
                case 'card-expiry':
                    if (!isValidExpiry(input.value)) {
                        showFieldError(input, 'Please enter a valid expiry date (MM/YY)');
                        isValid = false;
                    }
                    break;
                case 'card-cvv':
                    if (!isValidCVV(input.value)) {
                        showFieldError(input, 'Please enter a valid CVV');
                        isValid = false;
                    }
                    break;
            }
        }
    });
    
    return isValid;
}

// Save shipping information
function saveShippingInfo() {
    const form = document.getElementById('shipping-form');
    if (!form) return;
    
    checkoutState.shippingInfo = {
        fullName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value,
        method: document.getElementById('shipping-method').value
    };
}

// Save payment information
function savePaymentInfo() {
    const form = document.getElementById('payment-form');
    if (!form) return;
    
    checkoutState.paymentInfo = {
        cardName: document.getElementById('card-name').value,
        cardNumber: document.getElementById('card-number').value,
        cardExpiry: document.getElementById('card-expiry').value,
        saveCard: document.getElementById('save-card').checked
    };
}

// Process order
function processOrder() {
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Calculate estimated delivery date
    const deliveryDate = calculateDeliveryDate(checkoutState.shippingInfo.method);
    
    // Update confirmation page
    document.getElementById('order-number').textContent = orderNumber;
    document.getElementById('delivery-date').textContent = deliveryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Navigate to confirmation
    navigateToStep(4);
}

// Helper functions
function showFieldError(input, message) {
    const errorDiv = input.parentElement.querySelector('.field-error') ||
                    createErrorElement(message);
    input.parentElement.appendChild(errorDiv);
    input.classList.add('error');
}

function clearFieldError(input) {
    const errorDiv = input.parentElement.querySelector('.field-error');
    if (errorDiv) errorDiv.remove();
    input.classList.remove('error');
}

function createErrorElement(message) {
    const div = document.createElement('div');
    div.className = 'field-error';
    div.textContent = message;
    return div;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidCardNumber(number) {
    return /^[0-9]{16}$/.test(number.replace(/\s/g, ''));
}

function isValidExpiry(expiry) {
    return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry);
}

function isValidCVV(cvv) {
    return /^[0-9]{3,4}$/.test(cvv);
}

function generateOrderNumber() {
    return 'ORD-' + Date.now().toString(36).toUpperCase();
}

function calculateDeliveryDate(shippingMethod) {
    const date = new Date();
    switch (shippingMethod) {
        case 'overnight':
            date.setDate(date.getDate() + 1);
            break;
        case 'express':
            date.setDate(date.getDate() + 3);
            break;
        default:
            date.setDate(date.getDate() + 5);
    }
    return date;
}

// Track order
function trackOrder() {
    // In a real app, this would redirect to an order tracking page
    alert('Order tracking feature coming soon!');
}

// Initialize checkout when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCheckout();
});

// Validate and clean cart
function validateAndCleanCart(cart) {
    if (!cart || !Array.isArray(cart)) return [];

    // Get valid product IDs from our products list
    const validProductIds = appState.products.list.map(p => p.id);
    
    // Filter out any items that don't exist in our current products list
    const validCart = cart.filter(item => validProductIds.includes(item.id));
    
    // If we removed any items, save the cleaned cart
    if (validCart.length !== cart.length) {
        saveCart(validCart);
        showNotification('Your cart has been updated to remove discontinued items.', 'info');
    }
    
    return validCart;
}

// Add more products to the list
appState.products.list = [
    {
        id: '1',
        name: 'Smart Watch Pro',
        price: 199.99,
        category: 'electronics',
        rating: 4.5,
        popularity: 95,
        description: 'Advanced fitness tracking, heart rate monitoring, and smart notifications.',
        images: [
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
            'https://images.unsplash.com/photo-1544866092-1677b00f868f',
            'https://images.unsplash.com/photo-1617043786394-f977fa12eddf'
        ],
        features: [
            'Heart rate monitoring',
            'Sleep tracking',
            'GPS',
            'Water resistant',
            '5-day battery life'
        ],
        stock: 15
    },
    {
        id: '2',
        name: 'Wireless Earbuds Pro',
        price: 149.99,
        category: 'electronics',
        rating: 4.8,
        popularity: 88,
        description: 'Premium sound quality with active noise cancellation.',
        images: [
            'https://images.unsplash.com/photo-1590658268037-6bf12165a8df'
        ],
        stock: 20
    },
    {
        id: '3',
        name: 'Premium Cotton T-Shirt',
        price: 29.99,
        category: 'clothing',
        rating: 4.3,
        popularity: 82,
        description: '100% organic cotton, comfortable fit, multiple colors available.',
        images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'
        ],
        stock: 50
    },
    {
        id: '4',
        name: 'Yoga Mat Premium',
        price: 49.99,
        category: 'sports',
        rating: 4.7,
        popularity: 78,
        description: 'Eco-friendly material, non-slip surface, perfect thickness for comfort.',
        images: [
            'https://images.unsplash.com/photo-1592432678016-e910b452f9a2'
        ],
        stock: 30
    },
    {
        id: '5',
        name: 'Natural Face Serum',
        price: 34.99,
        category: 'beauty',
        rating: 4.6,
        popularity: 85,
        description: 'Organic ingredients, hydrating formula, suitable for all skin types.',
        images: [
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be'
        ],
        stock: 25
    },
    {
        id: '6',
        name: 'Educational Robot Kit',
        price: 79.99,
        category: 'toys',
        rating: 4.4,
        popularity: 72,
        description: 'Build and program your own robot, perfect for learning STEM skills.',
        images: [
            'https://images.unsplash.com/photo-1589254065878-42c9da997008'
        ],
        stock: 15
    }
];

// Function to clear the entire cart
function clearCart() {
    localStorage.removeItem('cart');
    appState.cart.items = []; // Also clear from appState
    updateCartDisplay();
    updateCartBadge(); // Ensure badge updates after clearing
    showNotification('Your cart has been cleared.', 'info');
}

// Initialize cart page
function initializeCartPage() {
    // const cartContainer = document.querySelector('.cart-container'); // Not strictly needed here anymore if button is static
    // if (!cartContainer) return;

    // Setup clear cart button (assuming it exists in HTML now)
    const clearCartButtonHTML = document.querySelector('.cart-header .clear-cart-btn');
    if (clearCartButtonHTML) {
        clearCartButtonHTML.addEventListener('click', clearCart);
    }
    
    loadCart(); // Load cart items
    setupEventListeners(); // Setup listeners for items, quantity, etc.
}