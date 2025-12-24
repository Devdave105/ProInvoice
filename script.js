// Navigation
const hamburger = document.querySelector('.hamburger');
const navUl = document.querySelector('nav ul');

hamburger.addEventListener('click', () => {
    navUl.classList.toggle('show');
});

function showSection() {
    const sections = document.querySelectorAll('section');
    sections.forEach(sec => sec.style.display = 'none');
    const hash = window.location.hash.slice(1) || 'home';
    document.getElementById(hash).style.display = 'block';
}

window.addEventListener('hashchange', showSection);
showSection();

// Local Storage Keys
const BIZ_KEY = 'proinvoice_biz';
const CLIENTS_KEY = 'proinvoice_clients';
const INVOICES_KEY = 'proinvoice_invoices';

// Load Data
let biz = JSON.parse(localStorage.getItem(BIZ_KEY)) || {};
let clients = JSON.parse(localStorage.getItem(CLIENTS_KEY)) || [];
let invoices = JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];

// Elements
const bizName = document.getElementById('biz-name');
const bizAddress = document.getElementById('biz-address');
const bizEmail = document.getElementById('biz-email');
const bizPhone = document.getElementById('biz-phone');
const bizLogo = document.getElementById('biz-logo');
const logoPreview = document.getElementById('logo-preview');
const saveBiz = document.getElementById('save-biz');

const clientSelect = document.getElementById('client-select');
const clientName = document.getElementById('client-name');
const clientEmail = document.getElementById('client-email');
const clientAddress = document.getElementById('client-address');
const saveClient = document.getElementById('save-client');

const invoiceNumber = document.getElementById('invoice-number');
const issueDate = document.getElementById('issue-date');
const dueDate = document.getElementById('due-date');
const currency = document.getElementById('currency');
const status = document.getElementById('status');

const itemsContainer = document.getElementById('items-container');
const addItem = document.getElementById('add-item');
const tax = document.getElementById('tax');
const discount = document.getElementById('discount');
const shipping = document.getElementById('shipping');

const terms = document.getElementById('terms');
const notes = document.getElementById('notes');
const thankyou = document.getElementById('thankyou');
const paymentDetails = document.getElementById('payment-details');

const preview = document.getElementById('preview');
const downloadPdf = document.getElementById('download-pdf');
const printInvoice = document.getElementById('print-invoice');
const duplicate = document.getElementById('duplicate');
const copyLink = document.getElementById('copy-link');
const premiumDownload = document.getElementById('premium-download');
const saveInvoice = document.getElementById('save-invoice');
const message = document.getElementById('message');

const totalInvoices = document.getElementById('total-invoices');
const totalRevenue = document.getElementById('total-revenue');
const recentInvoices = document.getElementById('recent-invoices');

// Load Business Profile
if (biz.name) bizName.value = biz.name;
if (biz.address) bizAddress.value = biz.address;
if (biz.email) bizEmail.value = biz.email;
if (biz.phone) bizPhone.value = biz.phone;
if (biz.logo) { logoPreview.src = biz.logo; logoPreview.style.display = 'block'; }

// Load Clients
function loadClients() {
    clientSelect.innerHTML = '<option value="">Select Client</option>';
    clients.forEach((cl, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = cl.name;
        clientSelect.appendChild(opt);
    });
}
loadClients();

clientSelect.addEventListener('change', (e) => {
    const idx = e.target.value;
    if (idx === '') return;
    const cl = clients[idx];
    clientName.value = cl.name;
    clientEmail.value = cl.email;
    clientAddress.value = cl.address;
});

// Save Business
saveBiz.addEventListener('click', () => {
    if (bizLogo.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            biz.logo = ev.target.result;
            logoPreview.src = biz.logo;
            logoPreview.style.display = 'block';
            saveBizData();
        };
        reader.readAsDataURL(bizLogo.files[0]);
    } else {
        saveBizData();
    }
});

function saveBizData() {
    biz = {
        name: bizName.value.trim(),
        address: bizAddress.value.trim(),
        email: bizEmail.value.trim(),
        phone: bizPhone.value.trim(),
        logo: logoPreview.src
    };
    localStorage.setItem(BIZ_KEY, JSON.stringify(biz));
    showMessage('Business profile saved.');
}

// Save Client
saveClient.addEventListener('click', () => {
    if (!clientName.value.trim()) return;
    const cl = {
        name: clientName.value.trim(),
        email: clientEmail.value.trim(),
        address: clientAddress.value.trim()
    };
    clients.push(cl);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    loadClients();
    showMessage('Client saved.');
});

// Add Item Row
function addItemRow(desc = '', qty = 1, price = 0) {
    const row = document.createElement('div');
    row.classList.add('item-row');
    row.innerHTML = `
        <input type="text" class="item-desc" placeholder="Description" value="${desc}">
        <input type="number" class="item-qty" placeholder="Qty" min="1" value="${qty}">
        <input type="number" class="item-price" placeholder="Unit Price" min="0" value="${price}">
        <input type="text" class="item-subtotal" readonly placeholder="Subtotal">
        <button type="button" class="remove-item"><span class="material-icons">delete</span></button>
    `;
    itemsContainer.appendChild(row);
    row.querySelector('.remove-item').addEventListener('click', () => {
        row.remove();
        updatePreview();
    });
    row.querySelectorAll('.item-desc, .item-qty, .item-price').forEach(inp => inp.addEventListener('input', updatePreview));
}
addItem.addEventListener('click', () => addItemRow());

// Update Preview on Input
[tax, discount, shipping, terms, notes, thankyou, paymentDetails, issueDate, dueDate, currency, status].forEach(el => el.addEventListener('input', updatePreview));
[bizName, bizAddress, bizEmail, bizPhone, clientName, clientEmail, clientAddress].forEach(el => el.addEventListener('input', updatePreview));

// Generate Invoice Number
function generateInvoiceNumber() {
    const num = String(invoices.length + 1).padStart(4, '0');
    return `INV-${num}-${new Date().getFullYear()}`;
}
invoiceNumber.value = generateInvoiceNumber();

// Update Preview - now fully mobile-responsive with flex-wrap
function updatePreview() {
    const curr = currency.value || '₦';
    let subtotal = 0;
    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const desc = row.querySelector('.item-desc').value.trim() || 'Item';
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const sub = qty * price;
        row.querySelector('.item-subtotal').value = sub > 0 ? `${curr}${sub.toFixed(2)}` : '';
        subtotal += sub;
        if (desc || qty || price) items.push({desc, qty, price, sub});
    });

    const taxRate = parseFloat(tax.value) || 0;
    const taxAmount = subtotal * (taxRate / 100);

    let discAmount = 0;
    const discVal = discount.value.trim();
    if (discVal) {
        if (discVal.endsWith('%')) {
            discAmount = subtotal * (parseFloat(discVal.slice(0, -1)) / 100);
        } else {
            discAmount = parseFloat(discVal) || 0;
        }
    }

    const ship = parseFloat(shipping.value) || 0;
    const grandTotal = subtotal + taxAmount - discAmount + ship;

    let html = `
        <div style="display:flex; flex-direction:column; gap:2rem; margin-bottom:2.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:2rem;">
                <div>
                    <h2 style="font-size:2rem; margin-bottom:0.8rem;">${biz.name || 'Your Business Name'}</h2>
                    <p style="line-height:1.7; font-size:1rem;">${biz.address || ''}<br>${biz.email || ''}<br>${biz.phone || ''}</p>
                </div>
                ${biz.logo ? `<img src="${biz.logo}" alt="Logo" style="max-height:120px; max-width:220px;">` : ''}
            </div>
        </div>
        <hr style="border:0; border-top:1px solid #ccc; margin:2.5rem 0;">
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:2rem; margin-bottom:2.5rem;">
            <div>
                <h3 style="font-size:1.5rem; margin-bottom:0.8rem;">Bill To:</h3>
                <p style="line-height:1.7; font-size:1rem;"><strong>${clientName.value || 'Client Name'}</strong><br>${clientAddress.value || ''}<br>${clientEmail.value || ''}</p>
            </div>
            <div style="text-align:left; min-width:200px;">
                <p style="font-size:1rem;"><strong>Invoice #:</strong> ${invoiceNumber.value}</p>
                <p style="font-size:1rem;"><strong>Issue Date:</strong> ${issueDate.value || 'YYYY-MM-DD'}</p>
                <p style="font-size:1rem;"><strong>Due Date:</strong> ${dueDate.value || 'YYYY-MM-DD'}</p>
                <p style="font-size:1rem;"><strong>Status:</strong> ${status.value || 'Draft'}</p>
            </div>
        </div>
        <hr style="border:0; border-top:1px solid #ccc; margin:2.5rem 0;">
        <table style="width:100%; border-collapse:collapse; margin:2rem 0; font-size:0.95rem;">
            <thead>
                <tr style="background:#f5f5f5;">
                    <th style="text-align:left; padding:0.8rem;">Description</th>
                    <th style="text-align:center; padding:0.8rem;">Qty</th>
                    <th style="text-align:right; padding:0.8rem;">Unit Price</th>
                    <th style="text-align:right; padding:0.8rem;">Amount</th>
                </tr>
            </thead>
            <tbody>
    `;
    items.forEach(item => {
        html += `
            <tr>
                <td style="padding:0.8rem; border-bottom:1px solid #eee; word-wrap:break-word;">${item.desc}</td>
                <td style="text-align:center; padding:0.8rem; border-bottom:1px solid #eee;">${item.qty}</td>
                <td style="text-align:right; padding:0.8rem; border-bottom:1px solid #eee;">${curr}${item.price.toFixed(2)}</td>
                <td style="text-align:right; padding:0.8rem; border-bottom:1px solid #eee;">${curr}${item.sub.toFixed(2)}</td>
            </tr>
        `;
    });
    html += `
            </tbody>
        </table>
        <hr style="border:0; border-top:1px solid #ccc; margin:2.5rem 0;">
        <div style="text-align:right; max-width:100%; margin-left:auto;">
            <p style="margin:0.8rem 0; font-size:1.1rem;">Subtotal: <strong>${curr}${subtotal.toFixed(2)}</strong></p>
            ${taxRate > 0 ? `<p style="margin:0.8rem 0; font-size:1.1rem;">Tax (${taxRate}%): <strong>${curr}${taxAmount.toFixed(2)}</strong></p>` : ''}
            ${discAmount > 0 ? `<p style="margin:0.8rem 0; font-size:1.1rem;">Discount: <strong>-${curr}${discAmount.toFixed(2)}</strong></p>` : ''}
            ${ship > 0 ? `<p style="margin:0.8rem 0; font-size:1.1rem;">Shipping: <strong>${curr}${ship.toFixed(2)}</strong></p>` : ''}
            <p style="font-size:1.7rem; margin-top:2rem; padding-top:1.5rem; border-top:3px solid #000;">Grand Total: <strong>${curr}${grandTotal.toFixed(2)}</strong></p>
        </div>
        ${terms.value ? `<p style="margin-top:3rem; font-size:1rem;"><strong>Terms:</strong> ${terms.value}</p>` : ''}
        ${notes.value ? `<p style="margin-top:1.5rem; font-size:1rem;"><strong>Notes:</strong> ${notes.value}</p>` : ''}
        ${paymentDetails.value ? `<p style="margin-top:2.5rem; font-size:1rem;"><strong>Payment Details:</strong><br>${paymentDetails.value.replace(/\n/g, '<br>')}</p>` : ''}
        ${thankyou.value ? `<p style="margin-top:4rem; font-style:italic; text-align:center; font-size:1.1rem;">${thankyou.value}</p>` : ''}
    `;
    preview.innerHTML = html;
}

// Rest of script remains the same (save, dashboard, PDF, etc.)
// ... [same as previous version]

addItemRow();
updatePreview();