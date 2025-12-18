document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for inputs that affect duration fields
    document.getElementById('baseCount').addEventListener('input', renderDurationFields);
    document.getElementById('optCount').addEventListener('input', renderDurationFields);
    document.querySelectorAll('input[name="unitType"]').forEach(el => el.addEventListener('change', renderDurationFields));

    renderDurationFields();
    addManpowerRow();
    initMaterials(5);
});

function initMaterials(count) {
    const container = document.getElementById('materialContainer');
    if(container.children.length === 0) {
        for(let i=0; i<count; i++) {
            addMaterialRow();
        }
    }
}

// --- SCREENSHOT GENERATION LOGIC ---
function takeScreenshot() {
    const element = document.getElementById('proposalCard');
    const clone = element.cloneNode(true);
    
    // Hide specific elements for the screenshot
    const hiddenElements = clone.querySelectorAll('.export-hide');
    hiddenElements.forEach(el => el.remove());

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0'; 
    container.style.left = '0';
    container.style.zIndex = '-50'; 
    
    clone.style.width = '800px'; 
    clone.style.maxWidth = 'none';
    clone.style.height = 'auto';
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';
    clone.style.backgroundColor = '#ffffff';
    clone.style.margin = '0';
    clone.style.padding = '40px'; 
    clone.style.borderRadius = '0'; 
    clone.style.boxShadow = 'none';
    
    container.appendChild(clone);
    document.body.appendChild(container);

    html2canvas(clone, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollY: 0
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'BidBase_Costing_Breakdown.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(container);
    }).catch(err => {
        console.error("Screenshot failed:", err);
        alert("Could not generate screenshot.");
        document.body.removeChild(container);
    });
}

// --- RESET LOGIC ---
function openResetModal() {
    document.getElementById('resetModal').classList.remove('hidden');
}

function closeResetModal() {
    document.getElementById('resetModal').classList.add('hidden');
}

function executeReset() {
    document.getElementById('baseCount').value = "1";
    document.getElementById('optCount').value = "0";
    
    const unitPkg = document.getElementById('unitPkg');
    if (unitPkg) unitPkg.checked = true;
    
    document.getElementById('gstToggle').checked = false;

    // FIX: Force clear the container first so renderDurationFields doesn't preserve old values
    document.getElementById('durationInputs').innerHTML = '';
    
    renderDurationFields();

    const manpowerContainer = document.getElementById('manpowerContainer');
    manpowerContainer.innerHTML = '';
    addManpowerRow(); 

    const materialContainer = document.getElementById('materialContainer');
    materialContainer.innerHTML = '';
    initMaterials(5); 

    hideError();
    closeModal();
    closeResetModal();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Error Handling ---
function showError(msg) {
    const banner = document.getElementById('errorBanner');
    const msgEl = document.getElementById('errorMessage');
    msgEl.innerText = msg;
    banner.classList.remove('-translate-y-full');
    setTimeout(hideError, 5000);
}

function hideError() {
    document.getElementById('errorBanner').classList.add('-translate-y-full');
}

// --- Render Logic for Periods ---
function renderDurationFields() {
    const baseCount = parseInt(document.getElementById('baseCount').value) || 1;
    const optCount = parseInt(document.getElementById('optCount').value) || 0;
    
    const container = document.getElementById('durationInputs');
    
    let html = '';
    
    let periods = [];
    for(let i=1; i<=baseCount; i++) periods.push({id: `base${i}`, label: `Base Period ${i}`});
    for(let i=1; i<=optCount; i++) periods.push({id: `opt${i}`, label: `Option Period ${i}`});

    periods.forEach(p => {
        // Feature: Preserve values if they exist in the DOM (unless we just cleared it in reset)
        const existingHr = document.getElementById(`hrs_${p.id}`)?.value || '';
        const existingPax = document.getElementById(`pax_${p.id}`)?.value || '';

        html += `
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 fade-in">
            <div class="text-xs font-bold text-slate-500 uppercase mb-2">${p.label}</div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Total Hours</label>
                    <input type="number" inputmode="decimal" id="hrs_${p.id}" value="${existingHr}" class="w-full bg-white border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none hours-input" placeholder="0">
                </div>
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Participants</label>
                    <input type="number" inputmode="decimal" id="pax_${p.id}" value="${existingPax}" class="w-full bg-white border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="0">
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

// --- Row Management ---
function addManpowerRow() {
    const container = document.getElementById('manpowerContainer');
    const div = document.createElement('div');
    div.className = 'grid grid-cols-12 gap-2 items-center manpower-row fade-in';
    div.innerHTML = `
        <div class="col-span-5 role-wrapper">
            <select onchange="handleRoleSelect(this)" class="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-700 m-role-select">
                <option value="Main Instructor">Main Instructor</option>
                <option value="Assistant Instructor">Assistant Instructor</option>
                <option value="Others">Others...</option>
            </select>
        </div>
        <div class="col-span-2">
            <input type="number" inputmode="decimal" placeholder="1" class="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-center focus:ring-1 focus:ring-blue-500 focus:outline-none m-qty" value="1">
        </div>
        <div class="col-span-4">
            <input type="number" inputmode="decimal" placeholder="0.00" class="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-right focus:ring-1 focus:ring-blue-500 focus:outline-none m-rate">
        </div>
        <div class="col-span-1 text-center">
            <button onclick="removeRow(this)" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `;
    container.appendChild(div);
}

function handleRoleSelect(selectElem) {
    if(selectElem.value === 'Others') {
        const wrapper = selectElem.parentElement;
        wrapper.innerHTML = `
            <input type="text" placeholder="Specify Role" class="w-full bg-white border border-blue-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-sm m-role-input" autoFocus>
        `;
        wrapper.querySelector('input').focus();
    }
}

function addMaterialRow() {
    const container = document.getElementById('materialContainer');
    const div = document.createElement('div');
    div.className = 'grid grid-cols-12 gap-2 items-center material-row fade-in';
    div.innerHTML = `
        <div class="col-span-5">
            <input type="text" placeholder="Item Name" class="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" onkeydown="handleEnter(event, this)">
        </div>
        <div class="col-span-2">
            <input type="number" inputmode="decimal" placeholder="1" class="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-center focus:ring-1 focus:ring-blue-500 focus:outline-none mat-qty" value="1">
        </div>
        <div class="col-span-4">
            <input type="number" inputmode="decimal" placeholder="0.00" class="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-right focus:ring-1 focus:ring-blue-500 focus:outline-none mat-cost">
        </div>
        <div class="col-span-1 text-center">
            <button onclick="removeRow(this)" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `;
    container.appendChild(div);
}

function removeRow(btn) {
    btn.parentElement.parentElement.remove();
}

function handleEnter(e, input) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const row = input.parentElement.parentElement;
        const costInput = row.querySelector('.mat-cost');
        costInput.focus();
    }
}

document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('mat-cost') && e.key === 'Enter') {
        addMaterialRow();
        setTimeout(() => {
            const rows = document.querySelectorAll('.material-row');
            const lastRow = rows[rows.length-1];
            lastRow.querySelector('input[type=text]').focus();
        }, 50);
    }
});

// --- Calculation Logic ---
function calculate() {
    hideError();

    const baseCount = parseInt(document.getElementById('baseCount').value) || 1;
    const optCount = parseInt(document.getElementById('optCount').value) || 0;
    const unitType = document.querySelector('input[name="unitType"]:checked').value;
    const useGst = document.getElementById('gstToggle').checked;

    let periods = [];
    for(let i=1; i<=baseCount; i++) periods.push(`base${i}`);
    for(let i=1; i<=optCount; i++) periods.push(`opt${i}`);

    let manpowerHourlyRate = 0;
    let manpowerDetails = [];
    let validManpowerFound = false;

    document.querySelectorAll('.manpower-row').forEach(row => {
        const qtyInput = row.querySelector('.m-qty');
        const rateInput = row.querySelector('.m-rate');
        
        let roleName = "Unknown Role";
        const roleSelect = row.querySelector('.m-role-select');
        const roleInput = row.querySelector('.m-role-input');
        
        if (roleSelect) roleName = roleSelect.value;
        if (roleInput) roleName = roleInput.value;
        if (roleName === 'Others') roleName = "Other Role"; 

        const qty = parseFloat(qtyInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        
        if (qty > 0 && rate > 0) {
            validManpowerFound = true;
            manpowerHourlyRate += (qty * rate);
            manpowerDetails.push({
                role: roleName,
                qty: qty,
                rate: rate,
                totalRate: qty * rate
            });
        }
    });

    if (!validManpowerFound) {
        showError("Please enter at least one instructor with a valid Quantity and Hourly Rate.");
        return;
    }

    let totalHoursRecorded = 0;
    periods.forEach(p => {
        const hEl = document.getElementById(`hrs_${p}`);
        const hours = hEl ? (parseFloat(hEl.value) || 0) : 0;
        totalHoursRecorded += hours;
    });

    if (totalHoursRecorded === 0) {
        showError("Please enter Total Hours for at least one period to calculate costs.");
        return;
    }

    let materialBaseCost = 0;
    let materialDetails = [];

    document.querySelectorAll('.material-row').forEach(row => {
        const qtyInput = row.querySelector('.mat-qty');
        const costInput = row.querySelector('.mat-cost');
        const nameInput = row.querySelector('input[type="text"]');
        
        const qty = parseFloat(qtyInput.value) || 0;
        const cost = parseFloat(costInput.value) || 0;
        
        if (qty > 0 && cost > 0) {
            const lineTotal = qty * cost;
            materialBaseCost += lineTotal;
            materialDetails.push({
                name: nameInput.value || "Item",
                qty: qty,
                unitCost: cost,
                total: lineTotal
            });
        }
    });

    let periodResults = {};
    let totalProjectCost = 0;

    periods.forEach(p => {
        const hEl = document.getElementById(`hrs_${p}`);
        const hours = hEl ? (parseFloat(hEl.value) || 0) : 0;
        const pEl = document.getElementById(`pax_${p}`);
        const pax = pEl ? (parseFloat(pEl.value) || 0) : 0;

        const pManpower = manpowerHourlyRate * hours;
        const pMaterial = materialBaseCost; 
        const pProjectCost = pManpower + pMaterial;
        const pTotalBase = pProjectCost > 0 ? (pProjectCost / 0.30) : 0;
        
        totalProjectCost += pProjectCost;

        periodResults[p] = {
            projectCost: pProjectCost,
            totalBase: pTotalBase,
            hours: hours,
            pax: pax,
            manpowerCost: pManpower,
            materialCost: pMaterial
        };
    });

    const grandProjectCost = Object.values(periodResults).reduce((acc, curr) => acc + curr.projectCost, 0);
    const grandTotalBase = grandProjectCost > 0 ? (grandProjectCost / 0.30) : 0;
    
    const enterprise = grandTotalBase * 0.30;
    const innovation = grandTotalBase * 0.30;
    const profit = grandTotalBase * 0.10;

    const gstAmt = useGst ? (grandTotalBase * 0.09) : 0;
    const finalTotal = grandTotalBase + gstAmt;

    document.getElementById('resTotalValue').innerText = formatCurrency(finalTotal);
    document.getElementById('resGstNote').innerText = useGst ? '(Includes 9% GST)' : '(No GST Applied)';
    document.getElementById('resProjectCost').innerText = formatCurrency(grandProjectCost);
    
    let totalManpower = Object.values(periodResults).reduce((acc, curr) => acc + curr.manpowerCost, 0);
    let totalMaterial = Object.values(periodResults).reduce((acc, curr) => acc + curr.materialCost, 0);
    
    document.getElementById('resManpower').innerText = formatCurrency(totalManpower);
    document.getElementById('resMaterial').innerText = formatCurrency(totalMaterial);
    
    const manpowerListEl = document.getElementById('manpowerDetailsList');
    manpowerListEl.innerHTML = '';
    if (manpowerDetails.length > 0) {
        manpowerDetails.forEach(d => {
            const roleTotalCost = d.totalRate * totalHoursRecorded;
            manpowerListEl.innerHTML += `
                <div class="flex justify-between items-center">
                    <span>${d.qty}x ${d.role} <span class="text-slate-400">@ ${formatCurrency(d.rate)}/hr</span></span>
                    <span>${formatCurrency(roleTotalCost)}</span>
                </div>
            `;
        });
        manpowerListEl.innerHTML += `
            <div class="text-[10px] text-right text-slate-400 mt-1 border-t border-slate-200 pt-1">
                Total Hours: ${totalHoursRecorded} hrs
            </div>
        `;
    } else {
        manpowerListEl.innerHTML = '<div class="italic text-slate-400">No manpower data</div>';
    }

    const materialListEl = document.getElementById('materialDetailsList');
    materialListEl.innerHTML = '';
    if (materialDetails.length > 0) {
        const periodCount = periods.length;
        materialDetails.forEach(d => {
            const itemPerPeriod = d.total;
            const itemTotal = itemPerPeriod * periodCount;
            
            materialListEl.innerHTML += `
                <div class="flex justify-between items-center">
                    <span>${d.qty}x ${d.name} <span class="text-slate-400">@ ${formatCurrency(d.unitCost)}</span></span>
                    <span>${formatCurrency(itemTotal)}</span>
                </div>
            `;
        });
        materialListEl.innerHTML += `
            <div class="text-[10px] text-right text-slate-400 mt-1 border-t border-slate-200 pt-1">
                Applied across ${periodCount} period(s)
            </div>
        `;
    } else {
        materialListEl.innerHTML = '<div class="italic text-slate-400">No material data</div>';
    }

    document.getElementById('resEnterprise').innerText = formatCurrency(enterprise);
    document.getElementById('resInnovation').innerText = formatCurrency(innovation);
    document.getElementById('resProfit').innerText = formatCurrency(profit);

    const breakdownContent = document.getElementById('unitBreakdownContent');
    breakdownContent.innerHTML = '';
    
    periods.forEach(p => {
        const data = periodResults[p];
        const periodTotalWithGst = data.totalBase + (useGst ? (data.totalBase * 0.09) : 0);
        
        let periodLabel = p.startsWith('base') 
            ? `Base Period ${p.replace('base','')}` 
            : `Option Period ${p.replace('opt','')}`;
        
        let html = `<div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-slate-700 text-xs uppercase">${periodLabel}</span>
                <span class="text-xs text-slate-500 font-medium">Total: ${formatCurrency(periodTotalWithGst)}</span>
            </div>
            <div class="bg-white border border-slate-200 rounded p-2 text-sm space-y-1">`;
        
        if (unitType === 'hour') {
            if (data.hours > 0) {
                const rate = periodTotalWithGst / data.hours;
                html += `<div class="flex justify-between font-bold text-blue-700"><span>Price Per Hour</span> <span>${formatCurrency(rate)}</span></div>`;
                html += `<div class="text-[10px] text-slate-400 text-right">based on ${data.hours} hours</div>`;
            } else {
                html += `<div class="text-xs text-red-400 italic">Enter hours to calculate rate</div>`;
            }
        } else if (unitType === 'pax') {
            if (data.pax > 0) {
                const rate = periodTotalWithGst / data.pax;
                html += `<div class="flex justify-between font-bold text-blue-700"><span>Price Per Pax</span> <span>${formatCurrency(rate)}</span></div>`;
                html += `<div class="text-[10px] text-slate-400 text-right">based on ${data.pax} pax</div>`;
            } else {
                html += `<div class="text-xs text-red-400 italic">Enter pax to calculate rate</div>`;
            }
        } else {
            html += `<div class="flex justify-between font-bold text-blue-700"><span>Lump Sum Package</span> <span>${formatCurrency(periodTotalWithGst)}</span></div>`;
        }

        html += `</div></div>`;
        breakdownContent.innerHTML += html;
    });

    openModal();
}

function openModal() {
    document.body.classList.add('modal-open');
    document.getElementById('resultsModal').classList.remove('hidden');
}

function closeModal() {
    document.body.classList.remove('modal-open');
    document.getElementById('resultsModal').classList.add('hidden');
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}