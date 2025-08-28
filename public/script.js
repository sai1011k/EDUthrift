document.addEventListener('DOMContentLoaded', () => {
    let books = [];
    let cart = [];

    const initialBooks = [
        { id: 1, title: "Physics Textbook", subject: "Physics", mrp: 550, price: 299, description: "NCERT Physics textbook, perfect for Class 12.", imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_p-eTAn-gyX7dY8L9L0uPp_GgY0w4Uh3h_w&s" },
        { id: 2, title: "Chemistry Manual", subject: "Chemistry", mrp: 400, price: 199, description: "Complete chemistry practical manual for Class 11.", imageUrl: "" }
    ];

    // --- DOM Element References ---
    const booksGrid = document.getElementById('booksGrid');
    const bookForm = document.getElementById('bookForm');
    const successMessage = document.getElementById('successMessage');
    const cartCountEl = document.getElementById('cartCount');
    const modal = document.getElementById('cartModal');
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const adminPanel = document.getElementById('adminPanel');
    const searchInput = document.getElementById('searchInput');
    const subjectFilter = document.getElementById('subjectFilter');
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');

    // --- Local Storage Functions ---
    const getBooksFromStorage = () => JSON.parse(localStorage.getItem('eduThriftBooks'));
    const saveBooksToStorage = () => localStorage.setItem('eduThriftBooks', JSON.stringify(books));

    // --- Core Rendering and Logic ---
    const renderBooks = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedSubject = subjectFilter.value;
        const filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(searchTerm) &&
            (selectedSubject === 'all' || book.subject === selectedSubject)
        );

        booksGrid.innerHTML = filteredBooks.length ? filteredBooks.map(book => {
            const bookInCart = cart.find(item => item.id === book.id);
            const cartControlsHTML = bookInCart
                ? `<div class="quantity-selector">
                     <button class="quantity-btn minus-btn" data-id="${book.id}">-</button>
                     <span class="quantity-display">${bookInCart.quantity}</span>
                     <button class="quantity-btn plus-btn" data-id="${book.id}">+</button>
                   </div>`
                : `<button class="add-to-cart" data-id="${book.id}">Add to Cart 🛒</button>`;

            return `<div class="book-card">
                        <button class="remove-book-btn" data-id="${book.id}" title="Remove Book">X</button>
                        <div class="book-image-container">
                            ${book.imageUrl ? `<img src="${book.imageUrl}" alt="${book.title}">` : `<div class="emoji-fallback">${getSubjectEmoji(book.subject)}</div>`}
                        </div>
                        <div class="book-card-content">
                            <h3 class="book-title">${book.title}</h3>
                            <div class="book-subject">${book.subject}</div>
                            <p>${book.description}</p>
                            <div class="price-container">
                                <span class="mrp-price">₹${book.mrp}</span>
                                <span class="selling-price">₹${book.price}</span>
                            </div>
                            ${cartControlsHTML}
                        </div>
                    </div>`;
        }).join('') : '<p style="grid-column: 1 / -1; text-align: center;">No books found.</p>';
    };

    const getSubjectEmoji = (subject) => {
        const emojis = { 'Physics': '⚡', 'Chemistry': '🧪', 'Mathematics': '📐', 'Biology': '🔬', 'English': '📖', 'Other': '📘' };
        return emojis[subject] || '📘';
    };

    const handleAddBook = (e) => { e.preventDefault(); const newBook = { id: Date.now(), title: document.getElementById('bookTitle').value, subject: document.getElementById('bookSubject').value, mrp: parseInt(document.getElementById('bookMrp').value), price: parseInt(document.getElementById('bookPrice').value), imageUrl: document.getElementById('bookImageUrl').value, description: document.getElementById('bookDescription').value || '' }; books.unshift(newBook); saveBooksToStorage(); renderBooks(); bookForm.reset(); adminPanel.classList.remove('active'); showSuccessMessage('Book added!'); };
    const removeBook = (bookId) => { if (confirm('Are you sure?')) { books = books.filter(b => b.id !== bookId); saveBooksToStorage(); renderBooks(); } };
    const showSuccessMessage = (message) => { successMessage.textContent = message; successMessage.classList.add('show'); setTimeout(() => successMessage.classList.remove('show'), 3000); };
    
    const updateCart = () => {
        cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p>Your cart is empty.</p>';
            cartTotalEl.textContent = '';
        } else {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartItemsEl.innerHTML = cart.map(item => ` <div class="cart-item"><span><strong>${item.title}</strong> (x${item.quantity})</span><span>₹${item.price * item.quantity} <button class="remove-from-cart-btn" data-id="${item.id}">X</button></span></div>`).join('');
            cartTotalEl.textContent = `Total: ₹${total}`;
        }
    };

    const addToCart = (bookId) => {
        const existingItem = cart.find(item => item.id === bookId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            const bookToAdd = books.find(b => b.id === bookId);
            if (bookToAdd) {
                cart.push({ ...bookToAdd, quantity: 1 });
            }
        }
        updateCart();
        renderBooks();
    };
    
    const incrementQuantity = (bookId) => {
        const itemInCart = cart.find(item => item.id === bookId);
        if (itemInCart) {
            itemInCart.quantity++;
        }
        updateCart();
        renderBooks();
    };

    const decrementQuantity = (bookId) => {
        const itemInCart = cart.find(item => item.id === bookId);
        if (itemInCart) {
            itemInCart.quantity--;
            if (itemInCart.quantity <= 0) {
                cart = cart.filter(item => item.id !== bookId);
            }
        }
        updateCart();
        renderBooks();
    };

    const removeFromCart = (bookId) => {
        cart = cart.filter(item => item.id !== bookId);
        updateCart();
    };

    const openCart = () => { updateCart(); modal.style.display = 'block'; };
    const closeCart = () => modal.style.display = 'none';

    const handleCheckout = async () => {
        if (cart.length === 0) return alert('Your cart is empty!');
        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        try {
            const orderResponse = await fetch('http://localhost:3000/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalAmount * 100, currency: 'INR' }),
            });

            if (!orderResponse.ok) throw new Error('Failed to create order.');
            const order = await orderResponse.json();

            const options = {
                key: 'PASTE_YOUR_KEY_ID_HERE',
                amount: order.amount,
                currency: order.currency,
                name: 'EDUthrift',
                description: 'Payment for Books',
                order_id: order.id,
                handler: function (response) {
                    alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
                    cart = [];
                    updateCart();
                    closeCart();
                    renderBooks();
                },
                prefill: { name: '', email: '', contact: '' },
                theme: { color: '#667eea' },
            };

            const rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', (response) => alert(`Payment failed: ${response.error.description}`));
            rzp1.open();

        } catch (error) {
            console.error(error);
            alert("Could not connect to payment server. Please ensure it is running.");
        }
    };
    
    const setupEventListeners = () => {
        bookForm.addEventListener('submit', handleAddBook);
        searchInput.addEventListener('input', renderBooks);
        subjectFilter.addEventListener('change', renderBooks);
        adminToggleBtn.addEventListener('click', () => {
            if (!adminPanel.classList.contains('active')) {
                const pass = prompt("Enter admin password:");
                if (pass === "chadkhironbitch1061011") {
                    adminPanel.classList.add('active');
                    document.body.classList.add('admin-mode');
                } else if (pass) {
                    alert("Incorrect password.");
                }
            } else {
                adminPanel.classList.remove('active');
                document.body.classList.remove('admin-mode');
            }
        });
        cartBtn.addEventListener('click', openCart);
        closeCartBtn.addEventListener('click', closeCart);
        checkoutBtn.addEventListener('click', handleCheckout);
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });
        navLinks.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });

        booksGrid.addEventListener('click', e => {
            const target = e.target;
            const bookId = parseInt(target.dataset.id);

            if (target.classList.contains('add-to-cart')) addToCart(bookId);
            else if (target.classList.contains('plus-btn')) incrementQuantity(bookId);
            else if (target.classList.contains('minus-btn')) decrementQuantity(bookId);
            else if (target.classList.contains('remove-book-btn')) removeBook(bookId);
        });

        cartItemsEl.addEventListener('click', e => {
            if (e.target.classList.contains('remove-from-cart-btn')) removeFromCart(parseInt(e.target.dataset.id));
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) closeCart();
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && e.target !== hamburgerBtn) {
                navLinks.classList.remove('active');
            }
        });
    };

    const init = () => {
        books = getBooksFromStorage() || initialBooks;
        saveBooksToStorage();
        renderBooks();
        setupEventListeners();
    };

    init();
});