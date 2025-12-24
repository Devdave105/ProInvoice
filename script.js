// Navigation - Hamburger Menu
const hamburger = document.querySelector('.hamburger');
const navUl = document.querySelector('nav ul');

hamburger.addEventListener('click', () => {
    navUl.classList.toggle('show');
});

// Smooth scroll to sections on nav click
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
                // Close mobile menu
                navUl.classList.remove('show');
            }
        }
    });
});

// Show correct section on load or hash change
function showSection() {
    const sections = document.querySelectorAll('section');
    sections.forEach(sec => sec.style.display = 'none');
    const hash = window.location.hash.slice(1) || 'home';
    const target = document.getElementById(hash);
    if (target) target.style.display = 'block';
}
window.addEventListener('hashchange', showSection);
showSection();

// Local Storage Keys
const BIZ_KEY = 'proinvoice_biz';
const CLIENTS_KEY = 'proinvoice_clients';
const INVOICES_KEY = 'proinvoice_invoices';

// Load saved data
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

// Load business profile
if (biz.name) bizName.value = biz.name;
if (biz.address) bizAddress.value = biz.address;
if (biz.email) bizEmail.value = biz.email;
if (biz.phone) bizPhone.value = biz.phone;
if (biz.logo) {
    logoPreview.src = biz.logo;
    logoPreview.style.display = 'block';
}

// Load clients into dropdown
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

// Select client
clientSelect.addEventListener('change', (e) => {
    const idx = e.target.value;
    if (idx === '') return;
    const cl = clients[idx];
    clientName.value = cl.name;
    clientEmail.value = cl.email;
    clientAddress.value = cl.address;
});

// Save business profile
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

// Save client
saveClient.addEventListener('click', () => {
    if (!clientName.value.trim()) {
        showMessage('Client name is required.', true);
        return;
    }
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

// Add invoice item row
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

    row.querySelectorAll('.item-desc, .item-qty, .item-price').forEach(inp => {
        inp.addEventListener('input', updatePreview);
    });
}
addItem.addEventListener('click', () => addItemRow());

// Auto-update preview on input
[tax, discount, shipping, terms, notes, thankyou, paymentDetails, issueDate, dueDate, currency, status].forEach(el => el.addEventListener('input', updatePreview));
[bizName, bizAddress, bizEmail, bizPhone, clientName, clientEmail, clientAddress].forEach(el => el.addEventListener('input', updatePreview));

// Generate invoice number
function generateInvoiceNumber() {
    const num = String(invoices.length + 1).padStart(4, '0');
    return `INV-${num}-${new Date().getFullYear()}`;
}
invoiceNumber.value = generateInvoiceNumber();

// Update invoice preview
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
        if (desc || qty || price) items.push({ desc, qty, price, sub });
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
        <div style="display:flex; flex-direction:column; gap:2rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:2rem;">
                <div>
                    <h2 style="font-size:2rem;">${biz.name || 'Your Business'}</h2>
                    <p style="line-height:1.7;">${biz.address || ''}<br>${biz.email || ''}<br>${biz.phone || ''}</p>
                </div>
                ${biz.logo ? `<img src="${biz.logo}" alt="Logo" style="max-height:120px;">` : ''}
            </div>
            <hr style="border-top:1px solid #ccc;">
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:2rem;">
                <div>
                    <h3 style="font-size:1.5rem;">Bill To:</h3>
                    <p style="line-height:1.7;"><strong>${clientName.value || 'Client'}</strong><br>${clientAddress.value || ''}<br>${clientEmail.value || ''}</p>
                </div>
                <div style="text-align:left;">
                    <p><strong>Invoice #:</strong> ${invoiceNumber.value}</p>
                    <p><strong>Issue Date:</strong> ${issueDate.value || '—'}</p>
                    <p><strong>Due Date:</strong> ${dueDate.value || '—'}</p>
                    <p><strong>Status:</strong> ${status.value || 'Draft'}</p>
                </div>
            </div>
            <hr style="border-top:1px solid #ccc;">
            <table style="width:100%; border-collapse:collapse; margin:2rem 0;">
                <thead>
                    <tr style="background:#f5f5f5;">
                        <th style="text-align:left; padding:0.8rem;">Description</th>
                        <th style="text-align:center; padding:0.8rem;">Qty</th>
                        <th style="text-align:right; padding:0.8rem;">Price</th>
                        <th style="text-align:right; padding:0.8rem;">Amount</th>
                    </tr>
                </thead>
                <tbody>
    `;
    items.forEach(item => {
        html += `
            <tr>
                <td style="padding:0.8rem; border-bottom:1px solid #eee;">${item.desc}</td>
                <td style="text-align:center; padding:0.8rem; border-bottom:1px solid #eee;">${item.qty}</td>
                <td style="text-align:right; padding:0.8rem; border-bottom:1px solid #eee;">${curr}${item.price.toFixed(2)}</td>
                <td style="text-align:right; padding:0.8rem; border-bottom:1px solid #eee;">${curr}${item.sub.toFixed(2)}</td>
            </tr>
        `;
    });
    html += `
                </tbody>
            </table>
            <hr style="border-top:1px solid #ccc;">
            <div style="text-align:right; max-width:450px; margin-left:auto;">
                <p style="margin:0.8rem 0;">Subtotal: <strong>${curr}${subtotal.toFixed(2)}</strong></p>
                ${taxRate > 0 ? `<p>Tax (${taxRate}%): <strong>${curr}${taxAmount.toFixed(2)}</strong></p>` : ''}
                ${discAmount > 0 ? `<p>Discount: <strong>-${curr}${discAmount.toFixed(2)}</strong></p>` : ''}
                ${ship > 0 ? `<p>Shipping: <strong>${curr}${ship.toFixed(2)}</strong></p>` : ''}
                <p style="font-size:1.8rem; margin-top:1.5rem; padding-top:1rem; border-top:3px solid #000;">Grand Total: <strong>${curr}${grandTotal.toFixed(2)}</strong></p>
            </div>
            ${terms.value ? `<p style="margin-top:3rem;"><strong>Terms:</strong> ${terms.value}</p>` : ''}
            ${notes.value ? `<p><strong>Notes:</strong> ${notes.value}</p>` : ''}
            ${paymentDetails.value ? `<p style="margin-top:2rem;"><strong>Payment Details:</strong><br>${paymentDetails.value.replace(/\n/g, '<br>')}</p>` : ''}
            ${thankyou.value ? `<p style="margin-top:4rem; font-style:italic; text-align:center;">${thankyou.value}</p>` : ''}
        </div>
    `;
    preview.innerHTML = html;
}

// Save invoice
saveInvoice.addEventListener('click', () => {
    if (!bizName.value.trim() || !clientName.value.trim() || !issueDate.value || !dueDate.value) {
        showMessage('Please fill required fields.', true);
        return;
    }

    const inv = {
        number: invoiceNumber.value,
        issueDate: issueDate.value,
        dueDate: dueDate.value,
        currency: currency.value,
        status: status.value,
        biz: { ...biz },
        client: {
            name: clientName.value.trim(),
            email: clientEmail.value.trim(),
            address: clientAddress.value.trim()
        },
        items: Array.from(document.querySelectorAll('.item-row')).map(row => ({
            desc: row.querySelector('.item-desc').value.trim(),
            qty: parseFloat(row.querySelector('.item-qty').value) || 0,
            price: parseFloat(row.querySelector('.item-price').value) || 0
        })).filter(i => i.desc || i.qty || i.price),
        tax: parseFloat(tax.value) || 0,
        discount: discount.value.trim(),
        shipping: parseFloat(shipping.value) || 0,
        terms: terms.value,
        notes: notes.value,
        thankyou: thankyou.value,
        paymentDetails: paymentDetails.value
    };

    invoices.push(inv);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    loadDashboard();
    showMessage('Invoice saved successfully.');
    invoiceNumber.value = generateInvoiceNumber();
    updatePreview();
});

// Load dashboard stats
function loadDashboard() {
    totalInvoices.textContent = invoices.length;
    let revenue = 0;
    invoices.forEach(inv => {
        let sub = inv.items.reduce((acc, item) => acc + item.qty * item.price, 0);
        let taxAmt = sub * (inv.tax / 100);
        let discAmt = 0;
        if (inv.discount) {
            if (inv.discount.endsWith('%')) {
                discAmt = sub * (parseFloat(inv.discount.slice(0, -1)) / 100);
            } else {
                discAmt = parseFloat(inv.discount) || 0;
            }
        }
        revenue += sub + taxAmt - discAmt + (inv.shipping || 0);
    });
    totalRevenue.textContent = `${invoices[0]?.currency || '₦'}${revenue.toFixed(2)}`;

    recentInvoices.innerHTML = '';
    invoices.slice(-5).reverse().forEach(inv => {
        const li = document.createElement('li');
        li.textContent = `${inv.number} - ${inv.client.name} (${inv.status})`;
        recentInvoices.appendChild(li);
    });
}
loadDashboard();

// Download PDF (with watermark for free)
downloadPdf.addEventListener('click', async () => {
    if (preview.innerHTML.trim() === '') {
        showMessage('Create an invoice first.', true);
        return;
    }

    const canvas = await html2canvas(preview, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const width = doc.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    doc.addImage(imgData, 'PNG', 0, 0, width, height);
    doc.setFontSize(40);
    doc.setTextColor(200, 200, 200);
    doc.text('ProInvoice Free Version', width / 2, height / 2, { align: 'center', angle: 45 });

    doc.save(`invoice-${invoiceNumber.value || 'draft'}.pdf`);
});

// Print
printInvoice.addEventListener('click', () => {
    window.print();
});

// Duplicate invoice
duplicate.addEventListener('click', () => {
    invoiceNumber.value = generateInvoiceNumber();
    status.value = 'Draft';
    showMessage('New invoice ready.');
    updatePreview();
});

// Copy link
copyLink.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    showMessage('Link copied!');
});

// Premium download button
premiumDownload.addEventListener('click', () => {
    showMessage('Upgrade to Premium to remove watermark', false);
    window.location.hash = '#pricing';
});

// Buy premium button
document.getElementById('buy-premium')?.addEventListener('click', () => {
    showMessage('Contact support@proinvoice.com to purchase Premium (₦2,000 one-time)', false);
});

// Show message
function showMessage(text, error = false) {
    message.textContent = text;
    message.style.backgroundColor = error ? '#440000' : '#004400';
    message.style.color = error ? '#ffaaaa' : '#aaffaa';
    message.style.display = 'block';
    setTimeout(() => message.style.display = 'none', 4000);
}

// Initialize
addItemRow();
updatePreview();