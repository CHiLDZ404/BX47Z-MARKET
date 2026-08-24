// Database Produk Awal
const initialCatalog = [
    { id: 'p1', cat: 'panel', title: 'Panel 1GB RAM', price: 2000 },
    { id: 'p2', cat: 'panel', title: 'Panel 2GB RAM', price: 3000 },
    { id: 'p3', cat: 'panel', title: 'Panel 3GB RAM', price: 4000 },
    { id: 'p4', cat: 'panel', title: 'Panel 5GB RAM', price: 5000 },
    { id: 'p5', cat: 'panel', title: 'Panel 10GB RAM', price: 10000 },
    
    { id: 'b1', cat: 'bot', title: 'Sewa Bot WhatsApp 1 Hari', price: 2000 },
    { id: 'b2', cat: 'bot', title: 'Sewa Bot WhatsApp 1 Minggu', price: 10000 },
    { id: 'b3', cat: 'bot', title: 'Sewa Bot WhatsApp Permanen', price: 20000 },

    { id: 's1', cat: 'script', title: 'Jasa Rename Script Bot', price: 10000 },
    { id: 's2', cat: 'script', title: 'Jasa Update & Fix Error Script', price: 10000 }
];

const initialVouchers = [
    { code: 'BXDISKON10', type: 'percent', val: 10, min: 0 },
    { code: 'POTONGAN2K', type: 'flat', val: 2000, min: 5000 }
];

const ADMIN_ACCOUNT = {
    username: "bx47z",
    password: "AbyGanz1933",
    name: "Owner BX47Z",
    phone: "087890768114",
    role: "admin"
};

const state = {
    theme: localStorage.getItem('bx_theme') || 'light',
    currentUser: JSON.parse(localStorage.getItem('bx_user')) || null,
    usersDB: JSON.parse(localStorage.getItem('bx_users_db')) || [],
    cart: JSON.parse(localStorage.getItem('bx_cart')) || [],
    ticketsDB: JSON.parse(localStorage.getItem('bx_tickets_db')) || [],
    catalogDB: JSON.parse(localStorage.getItem('bx_catalog_db')) || initialCatalog,
    vouchersDB: JSON.parse(localStorage.getItem('bx_vouchers_db')) || initialVouchers,
    appliedCartVoucher: null
};

function formatRp(num) {
    return 'Rp' + Number(num).toLocaleString('id-ID');
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    startRealtimeClock();
    renderAllCatalog();
    updateAuthUI();
    updateCartBadge();
    checkActiveTicket();
    
    setTimeout(() => {
        const welcomeModal = document.getElementById('welcome-modal');
        if (welcomeModal) welcomeModal.classList.add('active');
    }, 300);
});

// FITUR REAL-TIME WAKTU PERANGKAT PENGGUNA
function startRealtimeClock() {
    const clockEl = document.getElementById('live-device-clock');
    if (!clockEl) return;

    setInterval(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockEl.innerText = `${hours}:${minutes}:${seconds} WIB`;
    }, 1000);
}

function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('bx_theme', state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

function switchModal(closeId, openId) {
    closeModal(closeId);
    setTimeout(() => openModal(openId), 150);
}

function switchWelcomeToAuth(authModalId) {
    closeModal('welcome-modal');
    setTimeout(() => openModal(authModalId), 150);
}

function renderAllCatalog() {
    const panelGrid = document.getElementById('panel-pricing-grid');
    if (panelGrid) {
        panelGrid.innerHTML = state.catalogDB.filter(i => i.cat === 'panel').map(p => `
            <div class="price-card">
                <div>
                    <div class="ram-size">${p.title}</div>
                    <div class="price-tag">${formatRp(p.price)}</div>
                </div>
                <button type="button" onclick="addToCart('${p.id}')" class="btn btn-primary btn-block" style="font-size:0.8rem;">
                    <i class="fa-solid fa-cart-plus"></i> Tambah
                </button>
            </div>
        `).join('');
    }

    const botGrid = document.getElementById('bot-pricing-grid');
    if (botGrid) {
        botGrid.innerHTML = state.catalogDB.filter(i => i.cat === 'bot').map(b => `
            <div class="price-item-row">
                <div>
                    <strong>${b.title}</strong><br>
                    <small style="color:var(--primary); font-weight:700;">${formatRp(b.price)}</small>
                </div>
                <button type="button" onclick="addToCart('${b.id}')" class="btn btn-outline-sm">
                    <i class="fa-solid fa-cart-plus"></i> Tambah
                </button>
            </div>
        `).join('');
    }

    const scriptGrid = document.getElementById('script-pricing-grid');
    if (scriptGrid) {
        scriptGrid.innerHTML = state.catalogDB.filter(i => i.cat === 'script').map(s => `
            <div class="price-item-row">
                <div>
                    <strong>${s.title}</strong><br>
                    <small style="color:var(--primary); font-weight:700;">${formatRp(s.price)}</small>
                </div>
                <button type="button" onclick="addToCart('${s.id}')" class="btn btn-outline-sm">
                    <i class="fa-solid fa-cart-plus"></i> Tambah
                </button>
            </div>
        `).join('');
    }
}

function addToCart(itemId) {
    if (!state.currentUser) {
        showToast("Wajib Sign-Up / Sign-In terlebih dahulu untuk belanja!", "warning");
        openModal('signup-modal');
        return;
    }

    const item = state.catalogDB.find(i => i.id === itemId);
    if (!item) return;

    state.cart.push({ ...item, cartUniqueId: 'cart_' + Date.now() });
    localStorage.setItem('bx_cart', JSON.stringify(state.cart));

    updateCartBadge();
    showToast(`"${item.title}" ditambahkan ke Keranjang!`);
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge-count');
    if (badge) badge.innerText = state.cart.length;
}

function openCartModal() {
    if (!state.currentUser) {
        showToast("Silakan Sign-Up / Sign-In terlebih dahulu untuk melihat keranjang!", "warning");
        openModal('signup-modal');
        return;
    }
    renderCartList();
    openModal('cart-modal');
}

function renderCartList() {
    const container = document.getElementById('cart-items-list');
    if (!container) return;

    if (state.cart.length === 0) {
        container.innerHTML = `<p class="text-center text-muted" style="padding:15px;">Keranjang belanja Anda masih kosong.</p>`;
        document.getElementById('cart-subtotal-price').innerText = "Rp0";
        document.getElementById('cart-final-price').innerText = "Rp0";
        return;
    }

    let subtotal = 0;
    container.innerHTML = state.cart.map((item, idx) => {
        subtotal += item.price;
        return `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <h5>${item.title}</h5>
                    <small>${formatRp(item.price)}</small>
                </div>
                <button type="button" onclick="removeFromCart(${idx})" class="btn btn-outline-sm btn-danger" style="padding:2px 8px;">
                    <i class="fa-solid fa-trash"></i> Hapus
                </button>
            </div>
        `;
    }).join('');

    updateCartPriceSummary(subtotal);
}

function removeFromCart(index) {
    state.cart.splice(index, 1);
    localStorage.setItem('bx_cart', JSON.stringify(state.cart));
    updateCartBadge();
    renderCartList();
}

function updateCartPriceSummary(subtotal) {
    let discountAmount = 0;
    if (state.appliedCartVoucher) {
        const v = state.appliedCartVoucher;
        if (subtotal >= v.min) {
            discountAmount = v.type === 'percent' ? Math.round(subtotal * (v.val / 100)) : v.val;
            if (discountAmount > subtotal) discountAmount = subtotal;
        } else {
            state.appliedCartVoucher = null;
            document.getElementById('cart-voucher-status').innerText = `Voucher dibatalkan: Min. Order ${formatRp(v.min)}`;
            document.getElementById('cart-voucher-status').style.color = '#ef4444';
        }
    }

    const finalPrice = subtotal - discountAmount;
    document.getElementById('cart-subtotal-price').innerText = formatRp(subtotal);
    
    const discountContainer = document.getElementById('cart-discount-container');
    if (discountAmount > 0) {
        discountContainer.classList.remove('hidden');
        document.getElementById('cart-discount-amount').innerText = `-${formatRp(discountAmount)}`;
    } else {
        discountContainer.classList.add('hidden');
    }

    document.getElementById('cart-final-price').innerText = formatRp(finalPrice);
}

function applyCartVoucher() {
    const input = document.getElementById('cart-voucher-input');
    const code = input.value.trim().toUpperCase();
    const statusText = document.getElementById('cart-voucher-status');

    if (!code) {
        statusText.innerText = "Masukkan kode voucher!";
        statusText.style.color = "#ef4444";
        return;
    }

    const voucher = state.vouchersDB.find(v => v.code === code);
    if (!voucher) {
        statusText.innerText = "Kode voucher tidak ditemukan.";
        statusText.style.color = "#ef4444";
        state.appliedCartVoucher = null;
        renderCartList();
        return;
    }

    state.appliedCartVoucher = voucher;
    statusText.innerText = `Voucher ${voucher.code} berhasil dipasang!`;
    statusText.style.color = "#10b981";
    renderCartList();
}

function processCartCheckout() {
    if (!state.currentUser) {
        showToast("Wajib Sign-In untuk checkout!", "error");
        return;
    }
    if (state.cart.length === 0) {
        showToast("Keranjang Anda masih kosong!", "warning");
        return;
    }

    const notes = document.getElementById('cart-checkout-notes').value.trim();
    const finalPriceText = document.getElementById('cart-final-price').innerText;
    const itemListText = state.cart.map(i => i.title).join(', ');

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketID = `BX47Z-${randomNum}`;

    const newTicket = {
        id: ticketID,
        userName: state.currentUser.name,
        userPhone: state.currentUser.phone,
        service: `[Marketplace Order] ${itemListText}`,
        finalPrice: finalPriceText,
        voucherUsed: state.appliedCartVoucher ? state.appliedCartVoucher.code : '-',
        notes: notes,
        status: 'PENDING',
        createdAt: new Date().getTime()
    };

    state.ticketsDB.push(newTicket);
    localStorage.setItem('bx_tickets_db', JSON.stringify(state.ticketsDB));

    state.cart = [];
    localStorage.removeItem('bx_cart');
    updateCartBadge();

    showToast(`Checkout Berhasil! Ticket ${ticketID} telah dibuat.`);
    closeModal('cart-modal');
    checkActiveTicket();
    window.location.hash = '#ticket';
}

function calculateCustomEstimate() {
    const ramPrice = parseInt(document.getElementById('calc-ram').value) || 0;
    const botPrice = parseInt(document.getElementById('calc-bot').value) || 0;
    const scriptPrice = parseInt(document.getElementById('calc-script').value) || 0;

    const total = ramPrice + botPrice + scriptPrice;

    document.getElementById('calc-subtotal').innerText = formatRp(total);
    document.getElementById('calc-total').innerText = formatRp(total);
}

function addCalculatorToCart() {
    if (!state.currentUser) {
        showToast("Silakan Sign-Up / Sign-In terlebih dahulu!", "warning");
        openModal('signup-modal');
        return;
    }

    const ramSelect = document.getElementById('calc-ram');
    const botSelect = document.getElementById('calc-bot');
    const scriptSelect = document.getElementById('calc-script');

    const ramText = ramSelect.options[ramSelect.selectedIndex].text;
    const botText = botSelect.options[botSelect.selectedIndex].text;
    const scriptText = scriptSelect.options[scriptSelect.selectedIndex].text;

    const ramPrice = parseInt(ramSelect.value) || 0;
    const botPrice = parseInt(botSelect.value) || 0;
    const scriptPrice = parseInt(scriptSelect.value) || 0;

    const total = ramPrice + botPrice + scriptPrice;

    if (total === 0) {
        showToast("Pilih minimal 1 item spesifikasi pada kalkulator!", "warning");
        return;
    }

    const calcItem = {
        id: 'calc_' + Date.now(),
        cat: 'custom',
        title: `[Racikan Custom] ${ramPrice ? ramText : ''} ${botPrice ? '| ' + botText : ''} ${scriptPrice ? '| ' + scriptText : ''}`,
        price: total,
        cartUniqueId: 'cart_' + Date.now()
    };

    state.cart.push(calcItem);
    localStorage.setItem('bx_cart', JSON.stringify(state.cart));

    updateCartBadge();
    showToast("Racikan kalkulator berhasil ditambahkan ke Keranjang!");
}

function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

    event.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function openAdminDashboard() {
    openModal('admin-dashboard-modal');
    renderAdminTickets();
    renderAdminProducts();
    renderAdminUsers();
}

function renderAdminTickets() {
    const container = document.getElementById('admin-tickets-list');
    if (!container) return;

    if (state.ticketsDB.length === 0) {
        container.innerHTML = `<p class="text-muted text-center" style="padding:10px;">Belum ada tiket order masuk.</p>`;
        return;
    }

    container.innerHTML = state.ticketsDB.slice().reverse().map((t, idx) => `
        <div class="admin-item-card">
            <div>
                <strong>[${t.id}] ${t.userName} (${t.userPhone})</strong><br>
                <small>${t.service} | Total: ${t.finalPrice}</small>
            </div>
            <button onclick="handleDeleteTicket(${idx})" class="btn btn-outline-sm btn-danger" style="padding:2px 8px;">Hapus</button>
        </div>
    `).join('');
}

function handleDeleteTicket(idx) {
    if (!confirm("Hapus tiket ini?")) return;
    state.ticketsDB.splice(idx, 1);
    localStorage.setItem('bx_tickets_db', JSON.stringify(state.ticketsDB));
    renderAdminTickets();
    showToast("Tiket berhasil dihapus!");
}

function handleAddNewProduct(e) {
    e.preventDefault();
    const cat = document.getElementById('admin-prod-cat').value;
    const title = document.getElementById('admin-prod-title').value.trim();
    const price = parseInt(document.getElementById('admin-prod-price').value);

    const newProd = {
        id: 'p_' + Date.now(),
        cat,
        title,
        price
    };

    state.catalogDB.push(newProd);
    localStorage.setItem('bx_catalog_db', JSON.stringify(state.catalogDB));

    document.getElementById('admin-prod-title').value = '';
    document.getElementById('admin-prod-price').value = '';

    renderAllCatalog();
    renderAdminProducts();
    showToast(`Produk "${title}" berhasil ditambahkan!`);
}

function renderAdminProducts() {
    const container = document.getElementById('admin-products-list');
    if (!container) return;

    container.innerHTML = state.catalogDB.map((p, idx) => `
        <div class="admin-item-card">
            <div>
                <strong>${p.title}</strong> (${p.cat.toUpperCase()})<br>
                <small style="color:var(--primary); font-weight:700;">${formatRp(p.price)}</small>
            </div>
            <button onclick="handleDeleteProduct(${idx})" class="btn btn-outline-sm btn-danger" style="padding:2px 8px;">Hapus</button>
        </div>
    `).join('');
}

function handleDeleteProduct(idx) {
    if (!confirm("Hapus produk ini dari katalog?")) return;
    state.catalogDB.splice(idx, 1);
    localStorage.setItem('bx_catalog_db', JSON.stringify(state.catalogDB));
    renderAllCatalog();
    renderAdminProducts();
    showToast("Produk berhasil dihapus!");
}

function renderAdminUsers() {
    const container = document.getElementById('admin-users-list');
    if (!container) return;

    if (state.usersDB.length === 0) {
        container.innerHTML = `<p class="text-muted text-center" style="padding:10px;">Belum ada pengguna terdaftar.</p>`;
        return;
    }

    container.innerHTML = state.usersDB.map(u => `
        <div class="admin-item-card">
            <div>
                <strong>${u.name}</strong> (${u.phone})<br>
                <small>Role: ${u.role || 'user'}</small>
            </div>
        </div>
    `).join('');
}

function updateAuthUI() {
    const container = document.getElementById('auth-buttons-container');
    const warning = document.getElementById('ticket-auth-warning');

    if (!container) return;

    if (state.currentUser) {
        const isPhoto = state.currentUser.photo || 'https://via.placeholder.com/32/0284c7/ffffff?text=User';
        const isAdmin = state.currentUser.role === 'admin';

        container.innerHTML = `
            <div class="user-profile-badge" onclick="${isAdmin ? 'openAdminDashboard()' : 'openModal(\'profile-modal\'); populateProfileForm();'}">
                <img src="${isPhoto}" alt="Avatar">
                <span>${state.currentUser.name}</span>
            </div>
            <button type="button" onclick="handleLogout()" class="btn btn-outline-sm"><i class="fa-solid fa-right-from-bracket"></i></button>
        `;

        if (warning) warning.classList.add('hidden');
    } else {
        container.innerHTML = `
            <button type="button" class="btn btn-outline-sm" onclick="openModal('signin-modal')">Sign-In</button>
            <button type="button" class="btn btn-primary" onclick="openModal('signup-modal')" style="padding: 6px 10px; font-size: 0.8rem;">Sign-Up</button>
        `;

        if (warning) warning.classList.remove('hidden');
    }
}

function handleSignUp(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        showToast("Konfirmasi kata sandi tidak cocok!", "error");
        return;
    }

    const newUser = {
        name,
        phone,
        password,
        role: 'user',
        photo: 'https://via.placeholder.com/100/0284c7/ffffff?text=' + encodeURIComponent(name.charAt(0))
    };

    state.usersDB.push(newUser);
    state.currentUser = newUser;
    localStorage.setItem('bx_users_db', JSON.stringify(state.usersDB));
    localStorage.setItem('bx_user', JSON.stringify(newUser));

    showToast("Pendaftaran berhasil! Selamat datang.");
    closeModal('signup-modal');
    updateAuthUI();
}

function handleSignIn(e) {
    e.preventDefault();
    const phone = document.getElementById('signin-phone').value.trim();
    const password = document.getElementById('signin-password').value;

    const user = state.usersDB.find(u => u.phone === phone && u.password === password);
    if (!user) {
        showToast("Nomor WA atau Password salah!", "error");
        return;
    }

    state.currentUser = user;
    localStorage.setItem('bx_user', JSON.stringify(user));
    showToast(`Selamat datang kembali, ${user.name}!`);
    closeModal('signin-modal');
    updateAuthUI();
}

function handleAdminSignIn(e) {
    e.preventDefault();
    const user = document.getElementById('admin-username').value.trim();
    const pass = document.getElementById('admin-password').value;

    if (user === ADMIN_ACCOUNT.username && pass === ADMIN_ACCOUNT.password) {
        state.currentUser = ADMIN_ACCOUNT;
        localStorage.setItem('bx_user', JSON.stringify(ADMIN_ACCOUNT));
        showToast("Login Admin Berhasil!");
        closeModal('admin-login-modal');
        updateAuthUI();
        openAdminDashboard();
    } else {
        showToast("Kredensial Admin Salah!", "error");
    }
}

function handleLogout() {
    state.currentUser = null;
    localStorage.removeItem('bx_user');
    showToast("Anda telah keluar akun.");
    updateAuthUI();
    checkActiveTicket();
}

function populateProfileForm() {
    if (!state.currentUser) return;

    document.getElementById('profile-name').value = state.currentUser.name || '';
    document.getElementById('profile-phone').value = state.currentUser.phone || '';
    document.getElementById('profile-store-name').value = state.currentUser.storeName || '';
    document.getElementById('profile-bio').value = state.currentUser.bio || '';
    document.getElementById('profile-new-password').value = '';

    const isPhoto = state.currentUser.photo || 'https://via.placeholder.com/100/0284c7/ffffff?text=User';
    document.getElementById('profile-img-preview').src = isPhoto;
}

function previewProfilePhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-img-preview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function handleSaveProfile(e) {
    e.preventDefault();
    if (!state.currentUser) return;

    state.currentUser.name = document.getElementById('profile-name').value.trim();
    state.currentUser.phone = document.getElementById('profile-phone').value.trim();
    state.currentUser.photo = document.getElementById('profile-img-preview').src;

    localStorage.setItem('bx_user', JSON.stringify(state.currentUser));
    closeModal('profile-modal');
    updateAuthUI();
    showToast("Profil berhasil diperbarui!");
}

function checkActiveTicket() {
    const container = document.getElementById('active-ticket-display');
    if (!container) return;

    if (!state.currentUser) {
        container.innerHTML = `<p class="text-muted text-center" style="padding:15px;">Silakan login terlebih dahulu untuk melihat ticket pemesanan Anda.</p>`;
        return;
    }

    const userTicket = state.ticketsDB.slice().reverse().find(t => t.userPhone === state.currentUser.phone);

    if (userTicket) {
        container.innerHTML = `
            <div style="background:var(--bg-primary); border:1px solid var(--border-color); padding:15px; border-radius:12px;">
                <span class="badge badge-sky" style="float:right;">${userTicket.status}</span>
                <h4>ID Tiket: ${userTicket.id}</h4>
                <p style="font-size:0.88rem; margin-top:5px;"><strong>Detail Belanja:</strong> ${userTicket.service}</p>
                <p style="font-size:0.88rem;"><strong>Total Bayar:</strong> <span class="text-primary-bold">${userTicket.finalPrice}</span> (Voucher: ${userTicket.voucherUsed})</p>
                
                <button type="button" onclick="redirectTicketToWA('${userTicket.id}', '${userTicket.service}', '${userTicket.finalPrice}')" class="btn btn-outline-sm btn-block" style="margin-top: 12px;">
                    <i class="fa-brands fa-whatsapp"></i> Konfirmasi Pemesanan via WhatsApp Admin
                </button>
            </div>
        `;
    } else {
        container.innerHTML = `<p class="text-muted text-center" style="padding:15px;">Belum ada ticket pemesanan aktif.</p>`;
    }
}

function redirectTicketToWA(ticketID, service, price) {
    const text = `Halo Admin BX47Z, Saya telah membuat Ticket Checkout Marketplace:%0A%0A- *ID Tiket*: ${ticketID}%0A- *Nama*: ${state.currentUser.name}%0A- *Layanan*: ${service}%0A- *Total Harga*: ${price}%0A%0AMohon segera diproses!`;
    window.open(`https://wa.me/6287890768114?text=${text}`, '_blank');
}

// GEMINI AI CS PRO ENGINE
function handleChatKeyPress(e) {
    if (e.key === 'Enter') sendChatMessage();
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    appendChatMessage('user', text);
    input.value = '';

    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'chat-message bot';
    typingDiv.innerHTML = `<div class="msg-avatar"><i class="fa-solid fa-robot"></i></div><div class="msg-content"><em>BX47Z Gemini AI CS sedang berpikir...</em></div>`;
    document.getElementById('chat-display').appendChild(typingDiv);

    setTimeout(() => {
        document.getElementById('typing-indicator')?.remove();
        let aiResponse = generateIntegratedGeminiResponse(text);
        appendChatMessage('bot', aiResponse);
    }, 500);
}

function generateIntegratedGeminiResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('voucher') || q.includes('diskon')) {
        return "Gunakan kode voucher promo **BXDISKON10** (Diskon 10%) atau **POTONGAN2K** saat checkout di Keranjang Belanja!";
    }
    if (q.includes('panel') || q.includes('pterodactyl')) {
        return "Panel Pterodactyl BX47Z tersedia dari 1GB RAM (Rp2.000) hingga 10GB RAM (Rp10.000). Silakan pilih dan tambahkan ke Keranjang Belanja!";
    }
    if (q.includes('bot')) {
        return "Sewa Bot WhatsApp tersedia paket Harian (Rp2.000), Mingguan (Rp10.000), dan Permanen (Rp20.000).";
    }
    if (q.includes('admin') || q.includes('owner') || q.includes('kontak')) {
        return "Owner resmi website ini adalah **BX47Z**. Kontak WhatsApp Admin CS: **087890768114**.";
    }

    return `Terima kasih atas pertanyaannya mengenai "${query}". BX47Z Gemini AI CS Pro siap membantu! Silakan tambahkan produk ke Keranjang Belanja dan lakukan Checkout Otomatis.`;
}

function appendChatMessage(sender, text) {
    const display = document.getElementById('chat-display');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.innerHTML = `
        <div class="msg-avatar">${sender === 'bot' ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>'}</div>
        <div class="msg-content">${text}</div>
    `;
    display.appendChild(msgDiv);
    display.scrollTop = display.scrollHeight;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3200);
}
