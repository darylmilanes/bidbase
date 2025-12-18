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

    // FIX: Force clear the container first
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

    // 1. Identify all periods
    let periods = [];
    for(let i=1; i<=baseCount; i++) periods.push(`base${i}`);
    for(let i=1; i<=optCount; i++) periods.push(`opt${i}`);

    // 2. Aggregate Duration Data (Hours & Pax) across ALL periods
    let totalProjectHours = 0;
    let totalProjectPax = 0; // Not used for calculation, but for verification
    let periodData = {}; // Store individual period data for later breakdown

    let missingHours = false;

    periods.forEach(p => {
        const hEl = document.getElementById(`hrs_${p}`);
        const pEl = document.getElementById(`pax_${p}`);
        
        const hours = hEl ? (parseFloat(hEl.value) || 0) : 0;
        const pax = pEl ? (parseFloat(pEl.value) || 0) : 0;

        if (hours === 0) missingHours = true;

        totalProjectHours += hours;
        totalProjectPax += pax;

        periodData[p] = { hours, pax };
    });

    if (totalProjectHours === 0) {
        showError("Please enter Total Hours for at least one period to calculate costs.");
        return;
    }

    // 3. Calculate Manpower INTERNAL Cost (Base Rate * Total Hours)
    let manpowerHourlyBase = 0;
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
            // Internal Cost/Hr for this role = qty * base_rate
            manpowerHourlyBase += (qty * rate); 
            manpowerDetails.push({
                role: roleName,
                qty: qty,
                rate: rate, // Internal Base Rate
                totalRate: qty * rate
            });
        }
    });

    if (!validManpowerFound) {
        showError("Please enter at least one instructor with a valid Quantity and Hourly Rate.");
        return;
    }

    const totalManpowerInternalCost = manpowerHourlyBase * totalProjectHours;

    // 4. Calculate Material INTERNAL Cost
    // Assumption: Material inputs are "Unit Cost * Qty". 
    // Is this recurring per period? Usually yes.
    // We calculate cost per period, then multiply by number of periods.
    let materialPerPeriodCost = 0;
    let materialDetails = [];

    document.querySelectorAll('.material-row').forEach(row => {
        const qtyInput = row.querySelector('.mat-qty');
        const costInput = row.querySelector('.mat-cost');
        const nameInput = row.querySelector('input[type="text"]');
        
        const qty = parseFloat(qtyInput.value) || 0;
        const cost = parseFloat(costInput.value) || 0;
        
        if (qty > 0 && cost > 0) {
            const lineTotal = qty * cost;
            materialPerPeriodCost += lineTotal;
            materialDetails.push({
                name: nameInput.value || "Item",
                qty: qty,
                unitCost: cost,
                total: lineTotal
            });
        }
    });

    const totalMaterialInternalCost = materialPerPeriodCost * periods.length;

    // 5. Calculate Project Totals
    const grandProjectCost = totalManpowerInternalCost + totalMaterialInternalCost;
    
    // Revenue Requirement (30% Rule)
    // Grand Project Cost is 30% of Total Value
    const grandTotalRevenue = grandProjectCost / 0.30;
    
    // 6. Calculate LOAD FACTOR for Hourly Rates
    // Formula: Total Revenue / Total Manpower Internal Cost
    // This scales the hourly rate to cover materials + overhead + profit
    const loadFactor = totalManpowerInternalCost > 0 ? (grandTotalRevenue / totalManpowerInternalCost) : 0;

    // 7. Breakdown Components
    const enterprise = grandTotalRevenue * 0.30;
    const innovation = grandTotalRevenue * 0.30;
    const profit = grandTotalRevenue * 0.10;
    const gstAmt = useGst ? (grandTotalRevenue * 0.09) : 0;
    const finalTotalWithGst = grandTotalRevenue + gstAmt;

    // --- RENDER RESULTS ---

    document.getElementById('resTotalValue').innerText = formatCurrency(finalTotalWithGst);
    document.getElementById('resGstNote').innerText = useGst ? '(Includes 9% GST)' : '(No GST Applied)';
    document.getElementById('resProjectCost').innerText = formatCurrency(grandProjectCost);
    
    document.getElementById('resManpower').innerText = formatCurrency(totalManpowerInternalCost);
    document.getElementById('resMaterial').innerText = formatCurrency(totalMaterialInternalCost);
    
    // Internal Breakdown - Manpower List
    const manpowerListEl = document.getElementById('manpowerDetailsList');
    manpowerListEl.innerHTML = '';
    if (manpowerDetails.length > 0) {
        manpowerDetails.forEach(d => {
            const roleTotalCost = d.totalRate * totalProjectHours;
            manpowerListEl.innerHTML += `
                <div class="flex justify-between items-center">
                    <span>${d.qty}x ${d.role} <span class="text-slate-400">@ ${formatCurrency(d.rate)}/hr</span></span>
                    <span>${formatCurrency(roleTotalCost)}</span>
                </div>
            `;
        });
        manpowerListEl.innerHTML += `
            <div class="text-[10px] text-right text-slate-400 mt-1 border-t border-slate-200 pt-1">
                Total Hours: ${totalProjectHours} hrs
            </div>
        `;
    }

    // Internal Breakdown - Material List
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

    // --- RENDER QUOTATIONS (CLIENT FACING) ---
    const breakdownContent = document.getElementById('unitBreakdownContent');
    breakdownContent.innerHTML = '';
    
    periods.forEach(p => {
        const pData = periodData[p];
        let periodLabel = p.startsWith('base') 
            ? `Base Period ${p.replace('base','')}` 
            : `Option Period ${p.replace('opt','')}`;
        
        // Calculate Total Revenue allocated to this period 
        // This is tricky because we calculated Revenue globally based on 30/30/30/10.
        // We can reverse it: 
        // Period Internal Cost = (ManpowerHr * pHours) + MaterialPerPeriod
        // Period Revenue = Period Internal Cost / 0.30
        
        const periodInternalManpower = manpowerHourlyBase * pData.hours;
        const periodInternalCost = periodInternalManpower + materialPerPeriodCost;
        const periodRevenueBase = periodInternalCost / 0.30;
        const periodRevenueWithGst = periodRevenueBase + (useGst ? (periodRevenueBase * 0.09) : 0);

        let html = `<div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-slate-700 text-xs uppercase">${periodLabel}</span>
                <span class="text-xs text-slate-500 font-medium">Total: ${formatCurrency(periodRevenueWithGst)}</span>
            </div>
            <div class="bg-white border border-slate-200 rounded p-2 text-sm space-y-1">`;
        
        if (unitType === 'hour') {
            if (pData.hours > 0) {
                html += `<div class="mb-2 font-bold text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Client Hourly Rates (Loaded)</div>`;
                
                // Show Loaded Rate for EACH Role
                manpowerDetails.forEach(role => {
                    const loadedRate = role.rate * loadFactor;
                    const loadedRateWithGst = loadedRate + (useGst ? (loadedRate * 0.09) : 0);
                    
                    html += `<div class="flex justify-between font-bold text-blue-700 items-center mb-1">
                        <span>${role.qty}x ${role.role}</span> 
                        <span>${formatCurrency(loadedRateWithGst)}/hr</span>
                    </div>`;
                });
                
                html += `<div class="text-[10px] text-slate-400 text-right mt-1">Includes materials & overheads</div>`;
            } else {
                html += `<div class="text-xs text-red-400 italic">Enter hours to calculate rate</div>`;
            }
        } else if (unitType === 'pax') {
            if (pData.pax > 0) {
                const ratePerPax = periodRevenueWithGst / pData.pax;
                html += `<div class="flex justify-between font-bold text-blue-700"><span>Price Per Pax</span> <span>${formatCurrency(ratePerPax)}</span></div>`;
                html += `<div class="text-[10px] text-slate-400 text-right">based on ${pData.pax} pax</div>`;
            } else {
                html += `<div class="text-xs text-red-400 italic">Enter pax to calculate rate</div>`;
            }
        } else {
            html += `<div class="flex justify-between font-bold text-blue-700"><span>Lump Sum Package</span> <span>${formatCurrency(periodRevenueWithGst)}</span></div>`;
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
