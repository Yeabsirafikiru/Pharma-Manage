// Common functionality across all pages
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Update current date
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElements = document.querySelectorAll('.current-date');
    if (dateElements.length > 0) {
        dateElements.forEach(el => {
            el.textContent = today.toLocaleDateString('en-US', options);
        });
    }
    
    // Search functionality
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('keyup', function() {
            const searchText = this.value.toLowerCase();
            const tableId = this.getAttribute('data-table');
            const rows = document.querySelectorAll(`#${tableId} tbody tr`);
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchText)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });
    
    // Filter functionality
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            const filterValue = this.value;
            const tableId = this.getAttribute('data-table');
            const columnIndex = parseInt(this.getAttribute('data-column'));
            const rows = document.querySelectorAll(`#${tableId} tbody tr`);
            
            rows.forEach(row => {
                if (!filterValue || row.cells[columnIndex].textContent === filterValue) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });
    
    // Print functionality
    const printButtons = document.querySelectorAll('.print-btn');
    printButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            window.print();
        });
    });
    
    // Initialize dashboard if on dashboard page
    if (document.querySelector('.dashboard-stats')) {
        initDashboard();
    }
    
    // Initialize sales page if on sales page
    if (document.getElementById('cartItems')) {
        initSalesPage();
    }
});

// Dashboard specific functionality
function initDashboard() {
    // Simulate live data updates
    setInterval(() => {
        const salesElement = document.querySelector('.stat-number.text-success');
        if (salesElement) {
            const currentSales = parseInt(salesElement.textContent.replace('₱', '').replace(',', ''));
            salesElement.textContent = '₱' + (currentSales + Math.floor(Math.random() * 10)).toLocaleString();
        }
    }, 60000);
}

// Sales page specific functionality
function initSalesPage() {
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const productName = row.cells[0].textContent;
            const price = row.cells[3].textContent;
            
            // Check if product already in cart
            const cartItems = document.querySelectorAll('#cartItems tr');
            let alreadyInCart = false;
            
            cartItems.forEach(item => {
                if (item.cells[0].textContent === productName) {
                    alreadyInCart = true;
                    const qtyInput = item.querySelector('input');
                    qtyInput.value = parseInt(qtyInput.value) + 1;
                    updateCartItemTotal(item);
                }
            });
            
            if (!alreadyInCart) {
                // Add new item to cart
                const newRow = document.createElement('tr');
                newRow.className = 'cart-item';
                newRow.innerHTML = `
                    <td>${productName}</td>
                    <td>
                        <div class="input-group input-group-sm" style="width: 80px;">
                            <button class="btn btn-outline-secondary">-</button>
                            <input type="text" class="form-control text-center" value="1">
                            <button class="btn btn-outline-secondary">+</button>
                        </div>
                    </td>
                    <td>${price}</td>
                    <td>${price}</td>
                `;
                document.getElementById('cartItems').appendChild(newRow);
                
                // Add event listeners to the new quantity controls
                const minusBtn = newRow.querySelector('.btn-outline-secondary:first-child');
                const plusBtn = newRow.querySelector('.btn-outline-secondary:last-child');
                const qtyInput = newRow.querySelector('input');
                
                minusBtn.addEventListener('click', function() {
                    if (parseInt(qtyInput.value) > 1) {
                        qtyInput.value = parseInt(qtyInput.value) - 1;
                        updateCartItemTotal(newRow);
                    }
                });
                
                plusBtn.addEventListener('click', function() {
                    qtyInput.value = parseInt(qtyInput.value) + 1;
                    updateCartItemTotal(newRow);
                });
                
                qtyInput.addEventListener('change', function() {
                    if (parseInt(this.value) < 1) this.value = 1;
                    updateCartItemTotal(newRow);
                });
            }
            
            updateOrderSummary();
        });
    });
    
    // Update cart item total
    function updateCartItemTotal(row) {
        const price = parseFloat(row.cells[2].textContent.replace('₱', ''));
        const qty = parseInt(row.querySelector('input').value);
        const total = price * qty;
        row.cells[3].textContent = '₱' + total.toFixed(2);
        updateOrderSummary();
    }
    
    // Update order summary
    function updateOrderSummary() {
        const cartItems = document.querySelectorAll('#cartItems tr');
        let subtotal = 0;
        
        cartItems.forEach(item => {
            const total = parseFloat(item.cells[3].textContent.replace('₱', ''));
            subtotal += total;
        });
        
        const tax = subtotal * 0.12;
        const total = subtotal + tax;
        
        // Update summary values
        const subtotalEl = document.querySelector('[data-subtotal]');
        const taxEl = document.querySelector('[data-tax]');
        const totalEl = document.querySelector('[data-total]');
        
        if (subtotalEl) subtotalEl.textContent = '₱' + subtotal.toFixed(2);
        if (taxEl) taxEl.textContent = '₱' + tax.toFixed(2);
        if (totalEl) totalEl.textContent = '₱' + total.toFixed(2);
    }
    
    // Clear cart button
    const clearCartBtn = document.getElementById('clearCart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            document.getElementById('cartItems').innerHTML = '';
            updateOrderSummary();
        });
    }
    
    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            paymentMethods.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
        });
    });
}
// User management specific functionality
function initUserManagement() {
    // Edit user buttons
    const editButtons = document.querySelectorAll('.btn-outline-primary');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const editModal = new bootstrap.Modal(document.getElementById('editUserModal'));
            editModal.show();
        });
    });
    
    // Delete user buttons
    const deleteButtons = document.querySelectorAll('.btn-outline-danger');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this user?')) {
                // In a real application, this would send a request to the server
                const row = this.closest('tr');
                row.style.opacity = '0.5';
                setTimeout(() => {
                    row.remove();
                    // Update stats
                    const totalUsers = document.querySelector('.stat-number.text-primary');
                    totalUsers.textContent = parseInt(totalUsers.textContent) - 1;
                }, 1000);
            }
        });
    });
}

// Initialize user management if on users page
if (document.getElementById('usersTable')) {
    initUserManagement();
}
