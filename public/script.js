document.addEventListener('DOMContentLoaded', () => {
    let books = [];
    let cart = [];

    const initialBooks = [
        { id: 1, title: "Physics Textbook", subject: "Physics", mrp: 550, price: 299, stock: 5, description: "Condition: Very Good\nPages: 450\nMarkings: None", imageUrls: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_p-eTAn-gyX7dY8L9L0uPp_GgY0w4Uh3h_w&s", "https://via.placeholder.com/400/aabbcc/ffffff?text=Page+5", "https://via.placeholder.com/400/bbaacc/ffffff?text=Back+Cover"] },
        { id: 2, title: "Chemistry Manual", subject: "Chemistry", mrp: 400, price: 199, stock: 0, description: "Condition: Good\nPages: 300\nDamage: Minor tear on back cover", imageUrls: [] },
        { id: 3, title: "Mathematics Guide", subject: "Mathematics", mrp: 600, price: 350, stock: 3, description: "Condition: Brand New\nAuthor: R.D. Sharma\nEdition: 2023", imageUrls: ["https://via.placeholder.com/400/ccbbaa/ffffff?text=Math+Book"] }
    ];

    // --- DOM Element References ---
    const booksGrid = document.getElementById('booksGrid');
    const booksSection = document.getElementById('booksSection');
    const productDetailSection = document.getElementById('productDetailSection');
    const backToBooksBtn = document.getElementById('backToBooksBtn');
    const bookForm = document.getElementById('bookForm');
    const successMessage = document.getElementById('successMessage');
    const cartCountEl = document.getElementById('cartCount');
    const searchInput = document.getElementById('searchInput');
    const subjectFilter = document.getElementById('subjectFilter');
    const adminPanel = document.getElementById('adminPanel');
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    
    const cartModal = document.getElementById('cartModal');
    const editBookModal = document.getElementById('editBookModal');
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const editBookForm = document.getElementById('editBookForm');

    const getBooksFromStorage = () => JSON.parse(localStorage.getItem('eduThriftBooks'));
    const saveBooksToStorage = () => localStorage.setItem('eduThriftBooks', JSON.stringify(books));

    const renderBooks = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedSubject = subjectFilter.value;
        const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm) && (selectedSubject === 'all' || b.subject === selectedSubject));

        booksGrid.innerHTML = filteredBooks.length ? filteredBooks.map(book => {
            const isOutOfStock = book.stock <= 0;
            return `<div class="book-card ${isOutOfStock ? 'out-of-stock' : ''}" data-book-id="${book.id}">
                <button class="edit-book-btn" data-id="${book.id}" title="Edit Book">✏️</button>
                <button class="remove-book-btn" data-id="${book.id}" title="Remove Book">X</button>
                <div class="book-image-container">
                    ${(book.imageUrls && book.imageUrls[0]) ? `<img src="${book.imageUrls[0]}" alt="${book.title}">` : `<div class="emoji-fallback">${getSubjectEmoji(book.subject)}</div>`}
                </div>
                <div class="book-card-content">
                    <h3 class="book-title">${book.title}</h3>
                    <div class="book-subject">${book.subject}</div>
                    ${(book.stock > 0 && book.stock < 10) ? `<p class="low-stock-warning">Hurry! Only ${book.stock} left.</p>` : ''}
                    <div class="price-container">
                        <span class="mrp-price">₹${book.mrp}</span>
                        <span class="selling-price">₹${book.price}</span>
                    </div>
                    ${renderCartControls(book)}
                </div>
            </div>`;
        }).join('') : '<p style="grid-column: 1 / -1; text-align: center;">No books found.</p>';
    };

    const renderCartControls = (book) => {
        const bookInCart = cart.find(item => item.id === book.id);
        if (book.stock <= 0) {
            return `<button class="out-of-stock-btn" disabled>Out of Stock</button>`;
        }
        if (bookInCart) {
            const maxStockReached = bookInCart.quantity >= book.stock;
            return `<div class="quantity-selector" data-id="${book.id}">
                        <button class="quantity-btn minus-btn">-</button>
                        <span class="quantity-display">${bookInCart.quantity}</span>
                        <button class="quantity-btn plus-btn" ${maxStockReached ? 'disabled' : ''}>+</button>
                    </div>`;
        }
        return `<button class="add-to-cart" data-id="${book.id}">Add to Cart 🛒</button>`;
    };

    const getSubjectEmoji = (subject) => ({ 'Physics': '⚡', 'Chemistry': '🧪', 'Mathematics': '📐', 'Biology': '🔬', 'English': '📖', 'Other': '📘' }[subject] || '📘');
    
    const openProductDetailPage = (bookId) => {
        const book = books.find(b => b.id === bookId);
        if (!book) return;
        booksSection.style.display = 'none';
        productDetailSection.style.display = 'block';
        document.getElementById('productDetailTitle').textContent = book.title;
        document.getElementById('productDetailMrp').textContent = `₹${book.mrp}`;
        document.getElementById('productDetailPrice').textContent = `₹${book.price}`;
        const mainImage = document.getElementById('mainProductImage');
        const thumbnailContainer = document.getElementById('thumbnailContainer');
        mainImage.src = (book.imageUrls && book.imageUrls[0]) ? book.imageUrls[0] : 'https://via.placeholder.com/400/f0f2f5/333333?text=No+Image';
        thumbnailContainer.innerHTML = (book.imageUrls || []).map((url, index) => `<img src="${url}" alt="Thumbnail ${index+1}" class="thumbnail ${index === 0 ? 'active' : ''}">`).join('');
        const descriptionContainer = document.getElementById('productDetailDescription');
        descriptionContainer.innerHTML = book.description.split('\n').map(line => {
            const parts = line.split(':');
            return parts.length === 2 ? `<div class="description-item"><span class="key">${parts[0].trim()}:</span><span class="value">${parts[1].trim()}</span></div>` : `<div class="description-item">${line}</div>`;
        }).join('');
        document.getElementById('productDetailCartControls').innerHTML = renderCartControls(book);
        productDetailSection.dataset.bookId = book.id;
        window.scrollTo(0, 0);
    };
    
    const closeProductDetailPage = () => {
        productDetailSection.style.display = 'none';
        booksSection.style.display = 'block';
        renderBooks();
    };

    const handleAddBook = (e) => {
        e.preventDefault();
        const imageUrls = document.getElementById('bookImageUrls').value.split(',').map(url => url.trim()).filter(url => url);
        const newBook = { id: Date.now(), title: document.getElementById('bookTitle').value, subject: document.getElementById('bookSubject').value, mrp: parseInt(document.getElementById('bookMrp').value), price: parseInt(document.getElementById('bookPrice').value), stock: parseInt(document.getElementById('bookStock').value), imageUrls, description: document.getElementById('bookDescription').value || '' };
        books.unshift(newBook);
        saveBooksToStorage(); renderBooks(); bookForm.reset(); adminPanel.classList.remove('active'); showSuccessMessage('Book added!');
    };

    const removeBook = (bookId) => { if (confirm('Are you sure?')) { books = books.filter(b => b.id !== bookId); saveBooksToStorage(); renderBooks(); } };
    
    const openEditModal = (bookId) => {
        const book = books.find(b => b.id === bookId);
        if (!book) return;
        document.getElementById('editBookId').value = book.id;
        document.getElementById('editBookTitle').value = book.title;
        document.getElementById('editBookSubject').value = book.subject;
        document.getElementById('editBookMrp').value = book.mrp;
        document.getElementById('editBookPrice').value = book.price;
        document.getElementById('editBookStock').value = book.stock;
        document.getElementById('editBookImageUrls').value = (book.imageUrls || []).join(', ');
        document.getElementById('editBookDescription').value = book.description;
        editBookModal.style.display = 'block';
    };
    
    const handleEditBook = (e) => {
        e.preventDefault();
        const bookId = parseInt(document.getElementById('editBookId').value);
        const bookIndex = books.findIndex(b => b.id === bookId);
        if (bookIndex === -1) return;
        const imageUrls = document.getElementById('editBookImageUrls').value.split(',').map(url => url.trim()).filter(url => url);
        books[bookIndex] = { ...books[bookIndex], title: document.getElementById('editBookTitle').value, subject: document.getElementById('editBookSubject').value, mrp: parseInt(document.getElementById('editBookMrp').value), price: parseInt(document.getElementById('editBookPrice').value), stock: parseInt(document.getElementById('editBookStock').value), imageUrls, description: document.getElementById('editBookDescription').value };
        saveBooksToStorage(); 
        renderBooks(); 
        updateCart();
        editBookModal.style.display = 'none'; 
        showSuccessMessage('Book updated!');
    };

    const showSuccessMessage = (message) => { successMessage.textContent = message; successMessage.classList.add('show'); setTimeout(() => successMessage.classList.remove('show'), 3000); };
    
    const updateCart = () => {
        cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p>Your cart is empty.</p>';
            cartTotalEl.textContent = '';
        } else {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartItemsEl.innerHTML = cart.map(item => {
                const bookInStore = books.find(b => b.id === item.id) || item; // Use original item data if book is deleted
                return `<div class="cart-item"><span><strong>${bookInStore.title}</strong> (x${item.quantity})</span><span>₹${bookInStore.price * item.quantity} <button class="remove-from-cart-btn" data-id="${item.id}">X</button></span></div>`;
            }).join('');
            cartTotalEl.textContent = `Total: ₹${total}`;
        }
    };

    const addToCart = (bookId) => {
        const bookInStore = books.find(b => b.id === bookId);
        if (!bookInStore) return;
        if (bookInStore.stock <= 0) { alert("Sorry, this item is out of stock."); return; }
        const existingItem = cart.find(item => item.id === bookId);
        if (existingItem) { 
            if (existingItem.quantity < bookInStore.stock) { 
                existingItem.quantity++;
            } else { 
                alert("No more stock available for this item.");
            }
        } else { 
            cart.push({ ...bookInStore, quantity: 1 });
            cartBtn.classList.add('cart-shake');
            setTimeout(() => cartBtn.classList.remove('cart-shake'), 500);
        }
        updateCart();
    };
    
    const incrementQuantity = (bookId) => {
        const itemInCart = cart.find(item => item.id === bookId);
        const bookInStore = books.find(b => b.id === bookId);
        if (itemInCart && bookInStore) { if (itemInCart.quantity < bookInStore.stock) { itemInCart.quantity++; } else { alert("No more stock available for this item."); } }
        updateCart();
    };

    const decrementQuantity = (bookId) => {
        const itemInCart = cart.find(item => item.id === bookId);
        if (itemInCart) { itemInCart.quantity--; if (itemInCart.quantity <= 0) { cart = cart.filter(item => item.id !== bookId); } }
        updateCart();
    };

    const removeFromCart = (bookId) => { 
        cart = cart.filter(item => item.id !== bookId); 
        updateCart();
        renderBooks();
    };

    const handleCheckout = async () => { /* ... Your checkout code ... */ };
    
    const setupEventListeners = () => {
        bookForm.addEventListener('submit', handleAddBook);
        editBookForm.addEventListener('submit', handleEditBook);
        searchInput.addEventListener('input', renderBooks);
        subjectFilter.addEventListener('change', renderBooks);
        backToBooksBtn.addEventListener('click', closeProductDetailPage);
        adminToggleBtn.addEventListener('click', () => {
            if (!adminPanel.classList.contains('active')) {
                const pass = prompt("Enter admin password:");
                if (pass === "chadkhironbitch1061011") { adminPanel.classList.add('active'); document.body.classList.add('admin-mode'); } 
                else if (pass) { alert("Incorrect password."); }
            } else { adminPanel.classList.remove('active'); document.body.classList.remove('admin-mode'); }
        });
        
        cartBtn.addEventListener('click', () => { updateCart(); cartModal.style.display = 'block'; });
        closeCartBtn.addEventListener('click', () => cartModal.style.display = 'none');
        closeEditModalBtn.addEventListener('click', () => editBookModal.style.display = 'none');
        checkoutBtn.addEventListener('click', handleCheckout);
        hamburgerBtn.addEventListener('click', (e) => { e.stopPropagation(); navLinks.classList.toggle('active'); });
        navLinks.addEventListener('click', () => {navLinks.classList.remove('active'); });

        booksGrid.addEventListener('click', e => {
            const bookCard = e.target.closest('.book-card');
            if (!bookCard) return;
            const bookId = parseInt(bookCard.dataset.bookId);

            if (e.target.classList.contains('edit-book-btn')) { openEditModal(parseInt(e.target.dataset.id)); return; }
            if (e.target.classList.contains('remove-book-btn')) { removeBook(parseInt(e.target.dataset.id)); return; }
            
            if (e.target.classList.contains('add-to-cart')) { addToCart(bookId); renderBooks(); return; }
            if (e.target.closest('.quantity-selector')) {
                const qBookId = parseInt(e.target.closest('.quantity-selector').dataset.id);
                if (e.target.classList.contains('plus-btn')) incrementQuantity(qBookId);
                if (e.target.classList.contains('minus-btn')) decrementQuantity(qBookId);
                renderBooks();
                return;
            }
            openProductDetailPage(bookId);
        });

        productDetailSection.addEventListener('click', e => {
            const bookId = parseInt(productDetailSection.dataset.bookId);
            if (!bookId) return;

            if (e.target.classList.contains('thumbnail')) {
                document.getElementById('mainProductImage').src = e.target.src;
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            } else if (e.target.classList.contains('add-to-cart')) { 
                addToCart(bookId); 
                openProductDetailPage(bookId);
            } else if (e.target.closest('.quantity-selector')) {
                const qBookId = parseInt(e.target.closest('.quantity-selector').dataset.id);
                if (e.target.classList.contains('plus-btn')) incrementQuantity(qBookId);
                if (e.target.classList.contains('minus-btn')) decrementQuantity(qBookId);
                openProductDetailPage(qBookId);
            }
        });

        cartItemsEl.addEventListener('click', e => { if (e.target.classList.contains('remove-from-cart-btn')) removeFromCart(parseInt(e.target.dataset.id)); });

        window.addEventListener('click', (e) => {
            if (e.target === cartModal) cartModal.style.display = 'none';
            if (e.target === editBookModal) editBookModal.style.display = 'none';
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && e.target !== hamburgerBtn) { navLinks.classList.remove('active'); }
        });
    };

    const init = () => {
        // Show skeleton loaders immediately
        const skeletonHTML = Array(6).fill('').map(() => `
            <div class="book-card">
                <div class="skeleton skeleton-image"></div>
                <div class="book-card-content">
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text skeleton-text-short"></div>
                    <div class="skeleton skeleton-price"></div>
                    <div class="skeleton skeleton-button"></div>
                </div>
            </div>
        `).join('');
        booksGrid.innerHTML = skeletonHTML;
    
        // Simulate loading data
        setTimeout(() => {
            books = getBooksFromStorage() || initialBooks;
            cart = JSON.parse(localStorage.getItem('eduThriftCart')) || []; // Also load cart from storage
            saveBooksToStorage();
            renderBooks();
            updateCart();
            setupEventListeners();
        }, 800); // Wait 0.8 seconds
    };

    init();
});