document.addEventListener("DOMContentLoaded", () => {
    // 1. Back to Top Smooth Scroll
    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // 2. Elements Selection
    const menuBtn = document.querySelector(".panel-menu");
    const sideMenu = document.getElementById("side-menu");
    const closeMenu = document.getElementById("close-menu");
    const overlay = document.getElementById("overlay");

    const cartBtn = document.getElementById("cart-btn");
    const cartDrawer = document.getElementById("cart-drawer");
    const closeCart = document.getElementById("close-cart");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartCountEl = document.getElementById("cart-count");
    const cartTotalEl = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");

    // 3. Cart State (LocalStorage Persistence)
    let cart = JSON.parse(localStorage.getItem("amazon_cart")) || [];

    function saveCart() {
        localStorage.setItem("amazon_cart", JSON.stringify(cart));
    }

    // 4. Drawer & Overlay Handlers with Background Scroll Lock
    function openSidebar() {
        sideMenu.classList.add("active");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        sideMenu.classList.remove("active");
        if (!cartDrawer.classList.contains("active")) {
            overlay.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    }

    function openCart() {
        cartDrawer.classList.add("active");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeCartDrawer() {
        cartDrawer.classList.remove("active");
        if (!sideMenu.classList.contains("active")) {
            overlay.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    }

    if (menuBtn) menuBtn.addEventListener("click", openSidebar);
    if (closeMenu) closeMenu.addEventListener("click", closeSidebar);
    if (cartBtn) cartBtn.addEventListener("click", openCart);
    if (closeCart) closeCart.addEventListener("click", closeCartDrawer);

    if (overlay) {
        overlay.addEventListener("click", () => {
            closeSidebar();
            closeCartDrawer();
        });
    }

    // 5. Update Cart UI
    function updateCartUI() {
        const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItemsCount;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-msg">Your Cart is empty.</p>';
            cartTotalEl.textContent = "0.00";
            saveCart();
            return;
        }

        let totalPrice = 0;
        cartItemsContainer.innerHTML = "";

        cart.forEach((item, index) => {
            const itemSubtotal = item.price * item.quantity;
            totalPrice += itemSubtotal;

            const itemRow = document.createElement("div");
            itemRow.className = "cart-item-row";
            itemRow.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <div style="color: #555; font-size: 13px;">
                        $${item.price.toFixed(2)} x ${item.quantity} = <b>$${itemSubtotal.toFixed(2)}</b>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button onclick="decreaseItem(${index})" style="background: #e2e7e6; color: #111; padding: 2px 8px; border-radius: 2px; font-weight: bold;">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseItem(${index})" style="background: #e2e7e6; color: #111; padding: 2px 8px; border-radius: 2px; font-weight: bold;">+</button>
                    <button onclick="removeItem(${index})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(itemRow);
        });

        cartTotalEl.textContent = totalPrice.toFixed(2);
        saveCart();
    }

    // Global Functions for Cart Actions
    window.increaseItem = function(index) {
        cart[index].quantity += 1;
        updateCartUI();
    };

    window.decreaseItem = function(index) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCartUI();
    };

    window.removeItem = function(index) {
        cart.splice(index, 1);
        updateCartUI();
    };

    // 6. Clickable Cards/Products Add to Cart
    const productCards = document.querySelectorAll(".card, .box-content a");

    productCards.forEach((element) => {
        element.style.cursor = "pointer";
        element.addEventListener("click", (e) => {
            e.preventDefault();

            // Extract title and price from data-attributes or fallback
            let title = element.dataset.name;
            let price = parseFloat(element.dataset.price);

            if (!title) {
                const pTag = element.querySelector("p");
                if (pTag) {
                    title = pTag.textContent.trim();
                } else if (element.tagName.toLowerCase() === "a") {
                    title = element.textContent.trim();
                } else {
                    title = "Featured Product";
                }
            }

            if (isNaN(price)) {
                price = 29.99;
            }

            // Check if item already exists in cart
            const existingIndex = cart.findIndex((item) => item.name === title);
            if (existingIndex > -1) {
                cart[existingIndex].quantity += 1;
            } else {
                cart.push({
                    name: title,
                    price: price,
                    quantity: 1
                });
            }

            updateCartUI();
            openCart();
        });
    });

    // 7. Live Search Filter
    const searchInput = document.querySelector(".search-option");
    const searchIcon = document.querySelector(".search-icon");

    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const boxes = document.querySelectorAll(".shop-section .box");

        boxes.forEach((box) => {
            const text = box.innerText.toLowerCase();
            if (text.includes(query)) {
                box.style.display = "flex";
            } else {
                box.style.display = "none";
            }
        });
    }

    if (searchInput) searchInput.addEventListener("input", handleSearch);
    if (searchIcon) searchIcon.addEventListener("click", handleSearch);

    // 8. Checkout Button
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Your cart is empty! Please add some products.");
            } else {
                alert(`Thank you for ordering! Total Bill: $${cartTotalEl.textContent}`);
                cart = [];
                updateCartUI();
                closeCartDrawer();
            }
        });
    }

    // Initial render from localStorage on page load
    updateCartUI();
});