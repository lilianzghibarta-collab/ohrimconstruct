// Admin Dashboard Features

// ============================================
// WORKERS MANAGEMENT
// ============================================

function initializeWorkers() {
    loadWorkers();
    
    const addWorkerBtn = document.getElementById('addWorkerBtn');
    if (addWorkerBtn) {
        addWorkerBtn.addEventListener('click', showAddWorkerModal);
    }
}

function loadWorkers() {
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const container = document.getElementById('workersContainer');
    
    if (!container) return;
    
    if (workers.length === 0) {
        // Add demo worker if none exist
        const demoWorker = {
            id: Date.now(),
            username: 'worker',
            fullName: 'Worker Demo',
            position: 'Construction Worker',
            phone: '+353 1 234 5678',
            email: 'worker@ohrbuild.ro',
            hireDate: '2025-01-01',
            hourlyRate: 25,
            status: 'active'
        };
        workers.push(demoWorker);
        localStorage.setItem('workers', JSON.stringify(workers));
    }
    
    container.innerHTML = `
        <div class="workers-grid">
            ${workers.map(worker => `
                <div class="worker-card">
                    <div class="worker-avatar">👷</div>
                    <h4>${worker.fullName}</h4>
                    <p>${worker.position}</p>
                    <p>� ${worker.username}</p>
                    <p>📱 ${worker.phone}</p>
                    <p>📧 ${worker.email}</p>
                    <p>💰 ${worker.hourlyRate} EUR/h</p>
                    <span class="status-badge ${worker.status}">${worker.status}</span>
                    <div class="worker-actions" style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center;">
                        <button onclick="viewWorkerDetails('${worker.id}')" class="btn-small" title="View Details">👁️</button>
                        <button onclick="editWorker('${worker.id}')" class="btn-small" title="Edit">✏️</button>
                        <button onclick="toggleWorkerStatus('${worker.id}')" class="btn-small" title="${worker.status === 'active' ? 'Freeze' : 'Activate'}" style="background: ${worker.status === 'active' ? '#ffc107' : '#28a745'};">❄️</button>
                        <button onclick="deleteWorker('${worker.id}')" class="btn-small" title="Delete" style="background: #dc3545;">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function showAddWorkerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-height: 85vh; overflow-y: auto; max-width: 600px;">
            <h2 style="position: sticky; top: 0; background: #2a2a2a; padding: 20px; margin: -20px -20px 20px -20px; border-bottom: 2px solid #eaa350; z-index: 10;">👷 Add New Worker</h2>
            <form id="addWorkerForm" style="padding: 0 5px;">
                <div class="form-group">
                    <label>Full Name: *</label>
                    <input type="text" id="workerName" required placeholder="John Smith">
                </div>
                <div class="form-group">
                    <label>Username (Login): *</label>
                    <input type="text" id="workerUsername" required placeholder="johnsmith" pattern="[a-zA-Z0-9_]+" title="Only letters, numbers and underscore">
                    <small style="color: #999;">Used for login. Only letters, numbers and underscore.</small>
                </div>
                <div class="form-group">
                    <label>Password: *</label>
                    <input type="password" id="workerPassword" required minlength="6" placeholder="Minimum 6 characters">
                    <small style="color: #999;">Minimum 6 characters. Worker will use this to login.</small>
                </div>
                <div class="form-group">
                    <label>Confirm Password: *</label>
                    <input type="password" id="workerPasswordConfirm" required minlength="6" placeholder="Confirm password">
                </div>
                <div class="form-group">
                    <label>Position: *</label>
                    <select id="workerPosition" required>
                        <option value="Construction Worker">Construction Worker</option>
                        <option value="Foreman">Foreman</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Carpenter">Carpenter</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Phone: *</label>
                    <input type="tel" id="workerPhone" required placeholder="+353 1 234 5678">
                </div>
                <div class="form-group">
                    <label>Email: *</label>
                    <input type="email" id="workerEmail" required placeholder="worker@example.com">
                </div>
                <div class="form-group">
                    <label>Hourly Rate (EUR): *</label>
                    <input type="number" id="workerRate" value="25" step="0.01" min="0" required>
                </div>
                <div class="modal-actions" style="position: sticky; bottom: 0; background: #2a2a2a; padding: 20px; margin: 20px -20px -20px -20px; border-top: 2px solid #eaa350; z-index: 10;">
                    <button type="submit" class="btn-primary">➕ Add Worker</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('addWorkerForm').addEventListener('submit', handleAddWorker);
}

function handleAddWorker(e) {
    e.preventDefault();
    
    const username = document.getElementById('workerUsername').value.toLowerCase().trim();
    const password = document.getElementById('workerPassword').value;
    const passwordConfirm = document.getElementById('workerPasswordConfirm').value;
    
    // Validate passwords match
    if (password !== passwordConfirm) {
        alert('❌ Passwords do not match!');
        return;
    }
    
    // Check if username already exists
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    if (workers.some(w => w.username.toLowerCase() === username)) {
        alert('❌ Username already exists! Please choose a different username.');
        return;
    }
    
    const worker = {
        id: Date.now(),
        username: username,
        fullName: document.getElementById('workerName').value,
        position: document.getElementById('workerPosition').value,
        phone: document.getElementById('workerPhone').value,
        email: document.getElementById('workerEmail').value,
        hourlyRate: parseFloat(document.getElementById('workerRate').value),
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active'
    };
    
    workers.push(worker);
    localStorage.setItem('workers', JSON.stringify(workers));
    
    // Save login credentials
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({
        username: username,
        password: password,
        type: 'worker',
        fullName: worker.fullName,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('users', JSON.stringify(users));
    
    alert(`✅ Worker added successfully!\n\nLogin Credentials:\nUsername: ${username}\nPassword: ${password}\n\nWorker can now login to the system.`);
    closeModal();
    loadWorkers();
}

// ============================================
// REQUESTS MANAGEMENT
// ============================================

function initializeAdminRequests() {
    loadAdminRequests();
}

function loadAdminRequests() {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const container = document.getElementById('adminRequestsContainer');
    
    if (!container) return;
    
    if (requests.length === 0) {
        container.innerHTML = '<p>No requests submitted yet.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="admin-requests-list">
            ${requests.map(req => `
                <div class="admin-request-card ${req.status}">
                    <div class="request-header">
                        <div>
                            <h4>${req.fullName} - ${getRequestTypeLabel(req.type)}</h4>
                            <p>📅 ${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}</p>
                        </div>
                        <span class="status-badge ${req.status}">${req.status}</span>
                    </div>
                    <p><strong>Reason:</strong> ${req.reason}</p>
                    <p><small>Submitted: ${new Date(req.submittedDate).toLocaleDateString()}</small></p>
                    ${req.adminComment ? `<p class="admin-comment">💬 ${req.adminComment}</p>` : ''}
                    ${req.status === 'pending' ? `
                        <div class="request-actions">
                            <button onclick="approveRequest('${req.id}')" class="btn-small btn-success">✅ Approve</button>
                            <button onclick="rejectRequest('${req.id}')" class="btn-small btn-danger">❌ Reject</button>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function approveRequest(requestId) {
    const comment = prompt('Add a comment (optional):');
    updateRequestStatus(requestId, 'approved', comment || 'Approved');
}

function rejectRequest(requestId) {
    const comment = prompt('Reason for rejection:');
    if (!comment) return;
    updateRequestStatus(requestId, 'rejected', comment);
}

function updateRequestStatus(requestId, status, comment) {
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const index = requests.findIndex(r => r.id == requestId);
    
    if (index !== -1) {
        requests[index].status = status;
        requests[index].adminComment = comment;
        requests[index].processedDate = new Date().toISOString();
        localStorage.setItem('requests', JSON.stringify(requests));
        loadAdminRequests();
        alert(`✅ Request ${status}!`);
    }
}

function getRequestTypeLabel(type) {
    const labels = {
        'vacation': '🏖️ Vacation Leave',
        'sick': '🏥 Sick Leave',
        'personal': '👤 Personal Leave',
        'unpaid': '📭 Unpaid Leave'
    };
    return labels[type] || type;
}

// ============================================
// UTILITY - NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
    const colors = {
        success: '#4caf50',
        error: '#dc3545',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// PAYROLL MANAGEMENT - Real-time with Weekly/Monthly modes
// ============================================

// Initialize payroll mode (default: weekly)
let payrollMode = localStorage.getItem('payrollMode') || 'weekly';

function switchPayrollMode(mode) {
    payrollMode = mode;
    localStorage.setItem('payrollMode', mode);
    
    // Update button styles
    const weeklyBtn = document.getElementById('weeklyModeBtn');
    const monthlyBtn = document.getElementById('monthlyModeBtn');
    
    if (mode === 'weekly') {
        weeklyBtn.style.background = '#eaa350';
        weeklyBtn.style.color = '#000';
        weeklyBtn.style.border = 'none';
        monthlyBtn.style.background = '#2a2a2a';
        monthlyBtn.style.color = '#fcd787';
        monthlyBtn.style.border = '1px solid #eaa350';
    } else {
        monthlyBtn.style.background = '#eaa350';
        monthlyBtn.style.color = '#000';
        monthlyBtn.style.border = 'none';
        weeklyBtn.style.background = '#2a2a2a';
        weeklyBtn.style.color = '#fcd787';
        weeklyBtn.style.border = '1px solid #eaa350';
    }
    
    loadPayroll();
}

function initializePayroll() {
    loadPayroll();
    
    const generatePayrollBtn = document.getElementById('generatePayrollBtn');
    if (generatePayrollBtn) {
        generatePayrollBtn.addEventListener('click', generatePayroll);
    }
    
    // Initialize mode buttons
    const mode = localStorage.getItem('payrollMode') || 'weekly';
    switchPayrollMode(mode);
}

function loadPayroll() {
    const payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    const container = document.getElementById('payrollContainer');
    
    if (!container) return;
    
    const mode = payrollMode || 'weekly';
    const currentPeriod = mode === 'weekly' ? getCurrentWeek() : getCurrentMonth();
    
    // Separate paid and pending
    const paidPayroll = payroll.filter(p => p.status === 'paid' && p.mode === mode);
    const pendingPayroll = payroll.filter(p => p.status === 'pending' && p.mode === mode);
    const currentPeriodPayroll = payroll.filter(p => (p.week === currentPeriod || p.month === currentPeriod) && p.mode === mode);
    
    // Calculate totals
    const totalPaid = paidPayroll.reduce((sum, p) => sum + parseFloat(p.netPay || 0), 0);
    const totalPending = pendingPayroll.reduce((sum, p) => sum + parseFloat(p.netPay || 0), 0);
    const currentTotal = currentPeriodPayroll.reduce((sum, p) => sum + parseFloat(p.netPay || 0), 0);
    
    container.innerHTML = `
        <div class="payroll-summary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div class="summary-card" style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); border: 2px solid #eaa350; border-radius: 15px; padding: 25px; text-align: center;">
                <h4 style="color: #fcd787; margin-bottom: 15px; font-size: 1.1em;">📊 ${mode === 'weekly' ? 'This Week' : 'This Month'}</h4>
                <p class="big-number" style="color: #eaa350; font-size: 2.2em; font-weight: bold; margin: 0;">${currentTotal.toFixed(2)} EUR</p>
                <p style="color: #999; font-size: 0.9em; margin-top: 10px;">${currentPeriodPayroll.length} employees</p>
            </div>
            
            <div class="summary-card" style="background: linear-gradient(135deg, #1a4d1a 0%, #2a6d2a 100%); border: 2px solid #4caf50; border-radius: 15px; padding: 25px; text-align: center;">
                <h4 style="color: #a8e6a1; margin-bottom: 15px; font-size: 1.1em;">✅ Paid</h4>
                <p class="big-number" style="color: #4caf50; font-size: 2.2em; font-weight: bold; margin: 0;">${totalPaid.toFixed(2)} EUR</p>
                <p style="color: #a8e6a1; font-size: 0.9em; margin-top: 10px;">${paidPayroll.length} payments completed</p>
            </div>
            
            <div class="summary-card" style="background: linear-gradient(135deg, #4d3d1a 0%, #6d5d2a 100%); border: 2px solid #ff9800; border-radius: 15px; padding: 25px; text-align: center;">
                <h4 style="color: #ffd54f; margin-bottom: 15px; font-size: 1.1em;">⏳ Pending</h4>
                <p class="big-number" style="color: #ff9800; font-size: 2.2em; font-weight: bold; margin: 0;">${totalPending.toFixed(2)} EUR</p>
                <p style="color: #ffd54f; font-size: 0.9em; margin-top: 10px;">${pendingPayroll.length} awaiting payment</p>
            </div>
        </div>
        
        ${pendingPayroll.length > 0 ? `
        <div class="payroll-section" style="margin-bottom: 30px;">
            <h3 style="color: #ff9800; margin-bottom: 20px; padding: 15px; background: #2a2a2a; border-left: 5px solid #ff9800; border-radius: 5px;">
                ⏳ Pending Payments (${pendingPayroll.length})
            </h3>
            <div class="payroll-table" style="background: #1a1a1a; border: 2px solid #ff9800; border-radius: 10px; padding: 20px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #ff9800;">
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Employee</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Period</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Hours</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Gross Pay</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Deductions</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Net Pay</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Status</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pendingPayroll.map(pay => `
                        <tr style="border-bottom: 1px solid #2a2a2a;">
                            <td style="color: #fcd787; padding: 12px; font-weight: 600;">${pay.fullName}</td>
                            <td style="color: #fcd787; padding: 12px;">
                                <div style="font-weight: 600;">${pay.week || pay.month}</div>
                                ${pay.weekStart && pay.weekEnd ? `<div style="font-size: 0.85em; color: #999;">${new Date(pay.weekStart).toLocaleDateString('ro-RO')} - ${new Date(pay.weekEnd).toLocaleDateString('ro-RO')}</div>` : ''}
                            </td>
                            <td style="color: #fcd787; padding: 12px;">${pay.hours ? pay.hours.toFixed(2) + 'h' : '-'}</td>
                            <td style="color: #fcd787; padding: 12px;">${pay.grossPay} EUR</td>
                            <td style="color: #ff9800; padding: 12px;">${pay.deductions} EUR</td>
                            <td style="color: #ff9800; padding: 12px; font-weight: bold; font-size: 1.15em;">${pay.netPay} EUR</td>
                            <td style="padding: 12px;">
                                <span class="status-badge pending" style="background: #ff9800; color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.9em; font-weight: 600;">⏳ Pending</span>
                            </td>
                            <td style="padding: 12px;">
                                <button onclick="markAsPaid('${pay.id}')" class="btn-small" style="background: #4caf50; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">✅ Mark Paid</button>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}
        
        ${paidPayroll.length > 0 ? `
        <div class="payroll-section">
            <h3 style="color: #4caf50; margin-bottom: 20px; padding: 15px; background: #2a2a2a; border-left: 5px solid #4caf50; border-radius: 5px;">
                ✅ Payment History (${paidPayroll.length})
            </h3>
            <div class="payroll-table" style="background: #1a1a1a; border: 2px solid #4caf50; border-radius: 10px; padding: 20px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #4caf50;">
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Employee</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Period</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Hours</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Gross Pay</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Deductions</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Net Pay</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Paid Date</th>
                            <th style="color: #fcd787; padding: 15px; text-align: left;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paidPayroll.map(pay => `
                        <tr style="border-bottom: 1px solid #2a2a2a;">
                            <td style="color: #fcd787; padding: 12px; font-weight: 600;">${pay.fullName}</td>
                            <td style="color: #fcd787; padding: 12px;">
                                <div style="font-weight: 600;">${pay.week || pay.month}</div>
                                ${pay.weekStart && pay.weekEnd ? `<div style="font-size: 0.85em; color: #999;">${new Date(pay.weekStart).toLocaleDateString('ro-RO')} - ${new Date(pay.weekEnd).toLocaleDateString('ro-RO')}</div>` : ''}
                            </td>
                            <td style="color: #fcd787; padding: 12px;">${pay.hours ? pay.hours.toFixed(2) + 'h' : '-'}</td>
                            <td style="color: #fcd787; padding: 12px;">${pay.grossPay} EUR</td>
                            <td style="color: #999; padding: 12px;">${pay.deductions} EUR</td>
                            <td style="color: #4caf50; padding: 12px; font-weight: bold; font-size: 1.15em;">${pay.netPay} EUR</td>
                            <td style="color: #999; padding: 12px; font-size: 0.9em;">${pay.paidDate ? new Date(pay.paidDate).toLocaleDateString('ro-RO') : '-'}</td>
                            <td style="padding: 12px;">
                                <span class="status-badge paid" style="background: #4caf50; color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.9em; font-weight: 600;">✅ Paid</span>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}
        
        ${payroll.length === 0 ? `
        <div style="text-align: center; padding: 60px 20px; background: #1a1a1a; border: 2px dashed #eaa350; border-radius: 15px;">
            <div style="font-size: 4em; margin-bottom: 20px;">💰</div>
            <h3 style="color: #fcd787; margin-bottom: 15px;">No Payroll Generated Yet</h3>
            <p style="color: #999; margin-bottom: 25px;">Click "Generate Payroll" to create ${mode === 'weekly' ? 'weekly' : 'monthly'} payments based on attendance records.</p>
            <button onclick="generatePayroll()" class="btn-primary" style="background: linear-gradient(135deg, #eaa350 0%, #fcd787 100%); color: #000; border: none; padding: 15px 35px; border-radius: 30px; cursor: pointer; font-weight: 700; font-size: 1.1em;">💰 Generate Payroll Now</button>
        </div>
        ` : ''}
    `;
}

// Helper functions for weekly and monthly payroll
function getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getWeekDateRange(weekString) {
    const [year, week] = weekString.split('-W');
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (parseInt(week) - 1) * 7;
    const weekStart = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset - firstDayOfYear.getDay() + 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { start: weekStart, end: weekEnd };
}

function getMonthDateRange(monthString) {
    const [year, month] = monthString.split('-');
    const start = new Date(year, parseInt(month) - 1, 1);
    const end = new Date(year, parseInt(month), 0); // Last day of month
    return { start, end };
}

function isDateInWeek(dateString, weekString) {
    const date = new Date(dateString);
    const { start, end } = getWeekDateRange(weekString);
    return date >= start && date <= end;
}

function isDateInMonth(dateString, monthString) {
    return dateString.startsWith(monthString);
}

function calculateTotalPayroll() {
    const mode = payrollMode || 'weekly';
    const currentPeriod = mode === 'weekly' ? getCurrentWeek() : getCurrentMonth();
    const payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    return payroll
        .filter(p => (p.week === currentPeriod || p.month === currentPeriod) && p.mode === mode)
        .reduce((sum, p) => sum + p.netPay, 0);
}

function generatePayroll() {
    const mode = payrollMode || 'weekly';
    const currentPeriod = mode === 'weekly' ? getCurrentWeek() : getCurrentMonth();
    const dateRange = mode === 'weekly' ? getWeekDateRange(currentPeriod) : getMonthDateRange(currentPeriod);
    const { start, end } = dateRange;
    
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    
    let newPayrollCount = 0;
    let allPayroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    
    workers.forEach(worker => {
        // Calculate hours for current period
        const workerAttendance = allAttendance.filter(att => {
            if (att.username !== worker.username || att.status !== 'completed') return false;
            return mode === 'weekly' ? isDateInWeek(att.date, currentPeriod) : isDateInMonth(att.date, currentPeriod);
        });
        
        const totalHours = workerAttendance.reduce((sum, att) => 
            sum + (parseFloat(att.totalHours) || 0), 0
        );
        
        // Skip if no hours worked
        if (totalHours === 0) return;
        
        const hourlyRate = worker.hourlyRate || 25;
        const grossPay = totalHours * hourlyRate;
        const deductions = grossPay * 0.15; // 15% deductions
        const netPay = grossPay - deductions;
        
        const payroll = {
            id: Date.now() + Math.random(),
            username: worker.username,
            fullName: worker.fullName,
            mode: mode,
            hours: totalHours,
            grossPay: parseFloat(grossPay.toFixed(2)),
            deductions: parseFloat(deductions.toFixed(2)),
            netPay: parseFloat(netPay.toFixed(2)),
            status: 'pending',
            generatedDate: new Date().toISOString()
        };
        
        if (mode === 'weekly') {
            payroll.week = currentPeriod;
            payroll.weekStart = start.toISOString().split('T')[0];
            payroll.weekEnd = end.toISOString().split('T')[0];
        } else {
            payroll.month = currentPeriod;
            payroll.monthStart = start.toISOString().split('T')[0];
            payroll.monthEnd = end.toISOString().split('T')[0];
        }
        
        // Check if payroll for this period already exists
        const exists = allPayroll.find(p => 
            p.username === worker.username && 
            p.mode === mode &&
            (mode === 'weekly' ? p.week === currentPeriod : p.month === currentPeriod)
        );
        
        if (!exists) {
            allPayroll.push(payroll);
            newPayrollCount++;
        }
    });
    
    if (newPayrollCount > 0) {
        localStorage.setItem('payroll', JSON.stringify(allPayroll));
        showNotification(`✅ Generated ${newPayrollCount} ${mode} payroll records for ${currentPeriod}`, 'success');
        loadPayroll();
    } else {
        showNotification(`ℹ️ Payroll for ${currentPeriod} already exists or no hours worked`, 'info');
    }
}

function markAsPaid(payId) {
    let payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    const pay = payroll.find(p => p.id == payId);
    
    if (pay) {
        pay.status = 'paid';
        pay.paidDate = new Date().toISOString();
        localStorage.setItem('payroll', JSON.stringify(payroll));
        showNotification(`✅ Payment marked as paid for ${pay.fullName}`, 'success');
        loadPayroll();
    }
}

// ============================================
// REPORTS GENERATION
// ============================================

function initializeReports() {
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
}

function generateReport() {
    const reportType = prompt('Report Type:\n1. Attendance Report\n2. Payroll Summary\n3. Equipment Report\n\nEnter number (1-3):');
    
    if (reportType === '1') {
        generateAttendanceReport();
    } else if (reportType === '2') {
        generatePayrollReport();
    } else if (reportType === '3') {
        generateEquipmentReport();
    }
}

function generateAttendanceReport() {
    const attendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthAttendance = attendance.filter(a => a.date.startsWith(currentMonth));
    
    // Create printable HTML report
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Attendance Report - ${currentMonth}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: white; }
                .header { text-align: center; border-bottom: 3px solid #eaa350; padding-bottom: 20px; margin-bottom: 30px; }
                .header img { max-width: 200px; margin-bottom: 15px; }
                .header h1 { color: #2a2a2a; font-size: 28px; margin-bottom: 10px; }
                .header .company { color: #eaa350; font-size: 20px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #2a2a2a; color: white; padding: 12px; text-align: left; }
                td { padding: 10px 12px; border-bottom: 1px solid #ddd; }
                tr:nth-child(even) { background: #f8f8f8; }
                .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #eaa350; text-align: center; color: #666; font-size: 12px; }
                .summary { background: #f8f8f8; padding: 20px; border-radius: 8px; border: 2px solid #eaa350; margin-bottom: 30px; text-align: center; }
                .summary-value { font-size: 36px; color: #eaa350; font-weight: bold; }
                @media print { body { padding: 20px; } @page { margin: 20mm; } }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="logo.png" alt="OHR BUILD">
                <div class="company">OHR BUILD</div>
                <h1>📅 Attendance Report</h1>
                <p style="color: #666; margin-top: 10px;">${currentMonth}</p>
            </div>
            
            <div class="summary">
                <p style="color: #666; margin-bottom: 10px;">Total Records</p>
                <div class="summary-value">${monthAttendance.length}</div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Employee</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Total Hours</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${monthAttendance.map(att => `
                        <tr>
                            <td>${new Date(att.date).toLocaleDateString()}</td>
                            <td>${att.fullName}</td>
                            <td>${att.clockInTime || '-'}</td>
                            <td>${att.clockOutTime || '-'}</td>
                            <td style="font-weight: bold;">${att.totalHours ? att.totalHours.toFixed(1) + 'h' : '-'}</td>
                            <td>${att.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p><strong>OHR BUILD</strong></p>
                <p>Generated: ${new Date().toLocaleString('ro-RO')}</p>
            </div>
            
            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); }, 500);
                };
            </script>
        </body>
        </html>
    `);
    reportWindow.document.close();
}

function generatePayrollReport() {
    const payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    const currentWeek = getCurrentWeek();
    const weekPayroll = payroll.filter(p => p.week === currentWeek || p.month);
    
    const totalGross = weekPayroll.reduce((sum, p) => sum + p.grossPay, 0);
    const totalNet = weekPayroll.reduce((sum, p) => sum + p.netPay, 0);
    
    // Create printable HTML report
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Weekly Payroll Report - ${currentWeek}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: white; }
                .header { text-align: center; border-bottom: 3px solid #eaa350; padding-bottom: 20px; margin-bottom: 30px; }
                .header img { max-width: 200px; margin-bottom: 15px; }
                .header h1 { color: #2a2a2a; font-size: 28px; margin-bottom: 10px; }
                .header .company { color: #eaa350; font-size: 20px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #2a2a2a; color: white; padding: 12px; text-align: left; }
                td { padding: 10px 12px; border-bottom: 1px solid #ddd; }
                tr:nth-child(even) { background: #f8f8f8; }
                .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #eaa350; text-align: center; color: #666; font-size: 12px; }
                .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                .summary-card { background: #f8f8f8; padding: 20px; border-radius: 8px; border: 2px solid #eaa350; text-align: center; }
                .summary-value { font-size: 28px; color: #eaa350; font-weight: bold; margin: 10px 0; }
                .summary-label { color: #666; font-size: 14px; }
                @media print { body { padding: 20px; } @page { margin: 20mm; } }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="logo.png" alt="OHR BUILD">
                <div class="company">OHR BUILD</div>
                <h1>💰 Weekly Payroll Report</h1>
                <p style="color: #666; margin-top: 10px;">Week: ${currentWeek}</p>
            </div>
            
            <div class="summary">
                <div class="summary-card">
                    <div class="summary-label">Total Employees</div>
                    <div class="summary-value">${weekPayroll.length}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Total Gross Pay</div>
                    <div class="summary-value">${totalGross.toFixed(2)} €</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Total Net Pay</div>
                    <div class="summary-value" style="color: #4caf50;">${totalNet.toFixed(2)} €</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Gross Pay</th>
                        <th>Deductions</th>
                        <th>Net Pay</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${weekPayroll.map(pay => `
                        <tr>
                            <td>${pay.fullName}</td>
                            <td>${pay.grossPay} EUR</td>
                            <td style="color: #f44336;">${pay.deductions} EUR</td>
                            <td style="font-weight: bold; color: #4caf50;">${pay.netPay} EUR</td>
                            <td>${pay.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p><strong>OHR BUILD</strong></p>
                <p>Generated: ${new Date().toLocaleString('ro-RO')}</p>
            </div>
            
            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); }, 500);
                };
            </script>
        </body>
        </html>
    `);
    reportWindow.document.close();
}

function generateEquipmentReport() {
    const equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    const assigned = equipment.filter(e => e.status === 'assigned').length;
    const available = equipment.filter(e => e.status === 'available').length;
    
    // Create printable HTML report
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Equipment Report</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: white; }
                .header { text-align: center; border-bottom: 3px solid #eaa350; padding-bottom: 20px; margin-bottom: 30px; }
                .header img { max-width: 200px; margin-bottom: 15px; }
                .header h1 { color: #2a2a2a; font-size: 28px; margin-bottom: 10px; }
                .header .company { color: #eaa350; font-size: 20px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #2a2a2a; color: white; padding: 12px; text-align: left; }
                td { padding: 10px 12px; border-bottom: 1px solid #ddd; }
                tr:nth-child(even) { background: #f8f8f8; }
                .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #eaa350; text-align: center; color: #666; font-size: 12px; }
                .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                .summary-card { background: #f8f8f8; padding: 20px; border-radius: 8px; border: 2px solid #eaa350; text-align: center; }
                .summary-value { font-size: 28px; color: #eaa350; font-weight: bold; margin: 10px 0; }
                .summary-label { color: #666; font-size: 14px; }
                @media print { body { padding: 20px; } @page { margin: 20mm; } }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="logo.png" alt="OHR BUILD">
                <div class="company">OHR BUILD</div>
                <h1>🔧 Equipment Inventory Report</h1>
                <p style="color: #666; margin-top: 10px;">${new Date().toLocaleDateString('ro-RO')}</p>
            </div>
            
            <div class="summary">
                <div class="summary-card">
                    <div class="summary-label">Total Equipment</div>
                    <div class="summary-value">${equipment.length}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Assigned</div>
                    <div class="summary-value" style="color: #ff9800;">${assigned}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Available</div>
                    <div class="summary-value" style="color: #4caf50;">${available}</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                        <th>Condition</th>
                    </tr>
                </thead>
                <tbody>
                    ${equipment.map(eq => `
                        <tr>
                            <td>${eq.id}</td>
                            <td>${eq.name}</td>
                            <td><span style="color: ${eq.status === 'assigned' ? '#ff9800' : '#4caf50'}; font-weight: bold;">${eq.status}</span></td>
                            <td>${eq.assignedTo || '-'}</td>
                            <td>${eq.condition}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p><strong>OHR BUILD</strong></p>
                <p>Generated: ${new Date().toLocaleString('ro-RO')}</p>
            </div>
            
            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); }, 500);
                };
            </script>
        </body>
        </html>
    `);
    reportWindow.document.close();
}

function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// ============================================
// REPORTS & ANALYTICS
// ============================================

function generateReport(reportType) {
    const reportDisplay = document.getElementById('reportDisplay');
    const reportTitle = document.getElementById('reportTitle');
    const reportContent = document.getElementById('reportContent');
    
    // Show report display
    reportDisplay.style.display = 'block';
    reportDisplay.scrollIntoView({ behavior: 'smooth' });
    
    let content = '';
    const currentDate = new Date().toLocaleDateString('ro-RO', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    switch(reportType) {
        case 'attendance':
            reportTitle.textContent = '📊 Raport Pontaj Lunar';
            content = generateAttendanceReport();
            break;
        case 'sites':
            reportTitle.textContent = '🏗️ Raport Progres Șantiere';
            content = generateSitesReport();
            break;
        case 'payroll':
            reportTitle.textContent = '💰 Raport Financiar';
            content = generatePayrollReport();
            break;
        case 'equipment':
            reportTitle.textContent = '🔧 Raport Echipamente';
            content = generateEquipmentReport();
            break;
        case 'productivity':
            reportTitle.textContent = '✅ Raport Productivitate';
            content = generateProductivityReport();
            break;
        case 'requests':
            reportTitle.textContent = '📝 Raport Cereri Angajați';
            content = generateRequestsReport();
            break;
    }
    
    reportContent.innerHTML = `
        <div class="report-meta">
            <p><strong>Generat:</strong> ${currentDate}</p>
            <p><strong>Companie:</strong> OHR BUILD</p>
        </div>
        ${content}
    `;
}

function generateAttendanceReport() {
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    
    // Calculate stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyAttendance = allAttendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    const workerStats = {};
    monthlyAttendance.forEach(record => {
        if (!workerStats[record.username]) {
            workerStats[record.username] = {
                days: 0,
                totalHours: 0
            };
        }
        workerStats[record.username].days++;
        workerStats[record.username].totalHours += record.totalHours || 0;
    });
    
    return `
        <h3>Prezență Luna Curentă</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Muncitor</th>
                    <th>Zile Lucrate</th>
                    <th>Total Ore</th>
                    <th>Medie Ore/Zi</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${Object.keys(workerStats).map(username => {
                    const stats = workerStats[username];
                    const avgHours = (stats.totalHours / stats.days).toFixed(1);
                    return `
                        <tr>
                            <td>${username.charAt(0).toUpperCase() + username.slice(1)}</td>
                            <td>${stats.days}</td>
                            <td>${stats.totalHours.toFixed(1)}h</td>
                            <td>${avgHours}h</td>
                            <td><span class="status-badge active">✅ Activ</span></td>
                        </tr>
                    `;
                }).join('') || '<tr><td colspan="5">Nu există date pentru luna curentă</td></tr>'}
            </tbody>
        </table>
        
        <div class="report-summary">
            <h4>Rezumat</h4>
            <p>📊 Total zile lucrate: ${Object.values(workerStats).reduce((sum, s) => sum + s.days, 0)}</p>
            <p>⏰ Total ore lucrate: ${Object.values(workerStats).reduce((sum, s) => sum + s.totalHours, 0).toFixed(1)}h</p>
            <p>👷 Muncitori activi: ${Object.keys(workerStats).length}</p>
        </div>
    `;
}

function generateSitesReport() {
    return `
        <h3>Progres Șantiere</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Șantier</th>
                    <th>Locație</th>
                    <th>Progres</th>
                    <th>Muncitori</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Bloc Rezidențial A3</td>
                    <td>Dublin 2, Ireland</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 75%">75%</div>
                        </div>
                    </td>
                    <td>12</td>
                    <td><span class="status-badge active">🟢 În Progres</span></td>
                </tr>
                <tr>
                    <td>Casă Individuală Durlești</td>
                    <td>Durlești</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 45%">45%</div>
                        </div>
                    </td>
                    <td>6</td>
                    <td><span class="status-badge active">🟢 În Progres</span></td>
                </tr>
                <tr>
                    <td>Renovare Complex B</td>
                    <td>Dublin 1, Ireland</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 90%">90%</div>
                        </div>
                    </td>
                    <td>8</td>
                    <td><span class="status-badge warning">🟡 Finalizare</span></td>
                </tr>
            </tbody>
        </table>
        
        <div class="report-summary">
            <h4>Rezumat</h4>
            <p>🏗️ Total șantiere: 5 (3 afișate)</p>
            <p>👷 Total muncitori: 24</p>
            <p>📊 Progres mediu: 70%</p>
        </div>
    `;
}

function generatePayrollReport() {
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const attendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyAttendance = attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    const payroll = workers.map(worker => {
        const workerHours = monthlyAttendance
            .filter(r => r.username === worker.username)
            .reduce((sum, r) => sum + (r.totalHours || 0), 0);
        
        const salary = workerHours * (worker.hourlyRate || 25);
        
        return {
            name: worker.fullName || worker.username,
            hours: workerHours.toFixed(1),
            rate: worker.hourlyRate || 25,
            salary: salary.toFixed(2)
        };
    });
    
    const totalSalaries = payroll.reduce((sum, p) => sum + parseFloat(p.salary), 0);
    
    return `
        <h3>Raport Salarizare Luna Curentă</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Angajat</th>
                    <th>Ore Lucrate</th>
                    <th>Tarif Orar</th>
                    <th>Salariu</th>
                </tr>
            </thead>
            <tbody>
                ${payroll.map(p => `
                    <tr>
                        <td>${p.name}</td>
                        <td>${p.hours}h</td>
                        <td>${p.rate} EUR/h</td>
                        <td><strong>${p.salary} EUR</strong></td>
                    </tr>
                `).join('') || '<tr><td colspan="4">Nu există date</td></tr>'}
            </tbody>
            <tfoot>
                <tr style="background: #f8f6f0; font-weight: bold;">
                    <td colspan="3">TOTAL</td>
                    <td>${totalSalaries.toFixed(2)} EUR</td>
                </tr>
            </tfoot>
        </table>
        
        <div class="report-summary">
            <h4>Rezumat Financiar</h4>
            <p>💰 Total cheltuieli salariale: ${totalSalaries.toFixed(2)} EUR</p>
            <p>👥 Număr angajați: ${payroll.length}</p>
            <p>📊 Salariu mediu: ${(totalSalaries / payroll.length || 0).toFixed(2)} EUR</p>
        </div>
    `;
}

function generateEquipmentReport() {
    return `
        <h3>Inventar Echipamente</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Cod</th>
                    <th>Echipament</th>
                    <th>Cantitate</th>
                    <th>Stare</th>
                    <th>Următoarea Mentenanță</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>EQ-2301</td>
                    <td>Betonieră Profesională</td>
                    <td>3</td>
                    <td><span class="status-badge warning">⚠️ Mentenanță</span></td>
                    <td>15 Ian 2026</td>
                </tr>
                <tr>
                    <td>EQ-2302</td>
                    <td>Macara Mobilă</td>
                    <td>2</td>
                    <td><span class="status-badge active">✅ Bună</span></td>
                    <td>01 Feb 2026</td>
                </tr>
                <tr>
                    <td>EQ-2303</td>
                    <td>Scule Electrice Set</td>
                    <td>15</td>
                    <td><span class="status-badge active">✅ Bună</span></td>
                    <td>20 Ian 2026</td>
                </tr>
                <tr>
                    <td>EQ-2304</td>
                    <td>Schele Metalice</td>
                    <td>50</td>
                    <td><span class="status-badge active">✅ Bună</span></td>
                    <td>10 Feb 2026</td>
                </tr>
            </tbody>
        </table>
        
        <div class="report-summary">
            <h4>Rezumat</h4>
            <p>🔧 Total echipamente: 70 bucăți</p>
            <p>✅ În stare bună: 67</p>
            <p>⚠️ Necesită mentenanță: 3</p>
        </div>
    `;
}

function generateProductivityReport() {
    return `
        <h3>Productivitate & Performanță</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Echipă/Muncitor</th>
                    <th>Sarcini Atribuite</th>
                    <th>Sarcini Complete</th>
                    <th>Progres</th>
                    <th>Rating</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Echipa A - Bloc A3</td>
                    <td>45</td>
                    <td>38</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 84%">84%</div>
                        </div>
                    </td>
                    <td>⭐⭐⭐⭐⭐</td>
                </tr>
                <tr>
                    <td>Echipa B - Durlești</td>
                    <td>28</td>
                    <td>21</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 75%">75%</div>
                        </div>
                    </td>
                    <td>⭐⭐⭐⭐</td>
                </tr>
                <tr>
                    <td>Echipa C - Renovare</td>
                    <td>32</td>
                    <td>29</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 91%">91%</div>
                        </div>
                    </td>
                    <td>⭐⭐⭐⭐⭐</td>
                </tr>
            </tbody>
        </table>
        
        <div class="report-summary">
            <h4>Rezumat</h4>
            <p>✅ Total sarcini complete: 88</p>
            <p>📋 Total sarcini: 105</p>
            <p>📊 Rata de finalizare: 84%</p>
        </div>
    `;
}

function generateRequestsReport() {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    const pending = requests.filter(r => r.status === 'pending').length;
    
    return `
        <h3>Cereri Angajați</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Angajat</th>
                    <th>Tip Cerere</th>
                    <th>Perioada</th>
                    <th>Status</th>
                    <th>Data Depunerii</th>
                </tr>
            </thead>
            <tbody>
                ${requests.slice(0, 10).map(req => `
                    <tr>
                        <td>${req.fullName}</td>
                        <td>${getRequestTypeLabel(req.type)}</td>
                        <td>${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}</td>
                        <td><span class="status-badge ${req.status}">${req.status === 'approved' ? '✅ Aprobat' : req.status === 'rejected' ? '❌ Respins' : '⏳ În Așteptare'}</span></td>
                        <td>${new Date(req.submittedDate).toLocaleDateString()}</td>
                    </tr>
                `).join('') || '<tr><td colspan="5">Nu există cereri</td></tr>'}
            </tbody>
        </table>
        
        <div class="report-summary">
            <h4>Rezumat</h4>
            <p>✅ Cereri aprobate: ${approved}</p>
            <p>❌ Cereri respinse: ${rejected}</p>
            <p>⏳ Cereri în așteptare: ${pending}</p>
            <p>📊 Total cereri: ${requests.length}</p>
        </div>
    `;
}

function closeReport() {
    document.getElementById('reportDisplay').style.display = 'none';
}

function printReport() {
    const reportContent = document.getElementById('reportDisplay').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Raport OHR BUILD</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .report-header { text-align: center; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #eaa350; color: white; }
                .report-summary { margin-top: 30px; padding: 20px; background: #f8f6f0; }
                .progress-bar { width: 100%; height: 20px; background: #e0e0e0; border-radius: 10px; }
                .progress-fill { height: 100%; background: #eaa350; border-radius: 10px; text-align: center; color: white; }
                @media print {
                    .report-actions { display: none; }
                }
            </style>
        </head>
        <body>
            ${reportContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

function downloadReport() {
    alert('📥 Funcția de descărcare PDF va fi implementată cu o librărie dedicată (jsPDF). Pentru moment, folosiți butonul de printare.');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.remove());
}

// ============================================
// WORKER DETAILS VIEW
// ============================================

function viewWorkerDetails(workerId) {
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const worker = workers.find(w => w.id == workerId);
    
    if (!worker) {
        alert('Worker not found');
        return;
    }
    
    // Get worker statistics
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const workerAttendance = allAttendance.filter(a => a.username === worker.username);
    
    // Calculate statistics
    const totalDays = workerAttendance.length;
    const totalHours = workerAttendance.reduce((sum, a) => sum + (parseFloat(a.totalHours) || 0), 0);
    const avgHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;
    
    // Current month stats
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthAttendance = workerAttendance.filter(a => a.date.startsWith(currentMonth));
    const monthHours = monthAttendance.reduce((sum, a) => sum + (parseFloat(a.totalHours) || 0), 0);
    const monthGross = monthHours * worker.hourlyRate;
    const monthTaxes = monthGross * 0.20;
    const monthNet = monthGross - monthTaxes;
    
    // Get bank details
    const bankDetails = JSON.parse(localStorage.getItem(`bankDetails_${worker.username}`) || 'null');
    
    // Get payroll history
    const payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    const workerPayroll = payroll.filter(p => p.username === worker.username).slice(0, 6);
    
    // Create detailed modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content worker-details-modal" style="max-width: 1200px; max-height: 90vh; overflow-y: auto;">
            <div style="position: sticky; top: 0; background: #2a2a2a; padding: 20px; border-bottom: 2px solid #eaa350; z-index: 10;">
                <h2 style="color: #fcd787; margin: 0;">👷 ${worker.fullName} - Complete Profile</h2>
                <button onclick="closeModal()" style="position: absolute; top: 20px; right: 20px; background: transparent; border: none; color: #fcd787; font-size: 24px; cursor: pointer;">✖</button>
            </div>
            
            <div style="padding: 20px;">
                <!-- Personal Information -->
                <div class="info-section" style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #eaa350;">
                    <h3 style="color: #fcd787; margin-top: 0;">📋 Personal Information</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div>
                            <p style="color: #999; margin: 5px 0;">Username:</p>
                            <p style="color: #fcd787; margin: 5px 0; font-weight: 600;">${worker.username}</p>
                        </div>
                        <div>
                            <p style="color: #999; margin: 5px 0;">Full Name:</p>
                            <p style="color: #fcd787; margin: 5px 0; font-weight: 600;">${worker.fullName}</p>
                        </div>
                        <div>
                            <p style="color: #999; margin: 5px 0;">Position:</p>
                            <p style="color: #fcd787; margin: 5px 0; font-weight: 600;">${worker.position}</p>
                        </div>
                        <div>
                            <p style="color: #999; margin: 5px 0;">📱 Phone:</p>
                            <p style="color: #fcd787; margin: 5px 0; font-weight: 600;">${worker.phone}</p>
                        </div>
                        <div>
                            <p style="color: #999; margin: 5px 0;">📧 Email:</p>
                            <p style="color: #fcd787; margin: 5px 0; font-weight: 600;">${worker.email}</p>
                        </div>
                        <div>
                            <p style="color: #999; margin: 5px 0;">💰 Hourly Rate:</p>
                            <p style="color: #28a745; margin: 5px 0; font-weight: 600;">${worker.hourlyRate} EUR/h</p>
                        </div>
                        <div>
                            <p style="color: #999; margin: 5px 0;">📅 Hire Date:</p>
                            <p style="color: #fcd787; margin: 5px 0; font-weight: 600;">${worker.hireDate}</p>
                        </div>
                        <div>
                            <p style="color: #999; margin: 5px 0;">Status:</p>
                            <p><span class="status-badge ${worker.status}">${worker.status}</span></p>
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <button onclick="editWorker('${worker.id}')" class="btn-primary">✏️ Edit Information</button>
                    </div>
                </div>
                
                <!-- Statistics Overview -->
                <div class="info-section" style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #eaa350;">
                    <h3 style="color: #fcd787; margin-top: 0;">📊 Work Statistics</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #eaa350;">
                            <p style="color: #999; margin: 5px 0;">Total Days Worked</p>
                            <p style="color: #fcd787; font-size: 2em; margin: 10px 0; font-weight: 700;">${totalDays}</p>
                        </div>
                        <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #eaa350;">
                            <p style="color: #999; margin: 5px 0;">Total Hours</p>
                            <p style="color: #fcd787; font-size: 2em; margin: 10px 0; font-weight: 700;">${totalHours.toFixed(1)}h</p>
                        </div>
                        <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #eaa350;">
                            <p style="color: #999; margin: 5px 0;">Avg Hours/Day</p>
                            <p style="color: #fcd787; font-size: 2em; margin: 10px 0; font-weight: 700;">${avgHoursPerDay}h</p>
                        </div>
                        <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #eaa350;">
                            <p style="color: #999; margin: 5px 0;">This Month Hours</p>
                            <p style="color: #28a745; font-size: 2em; margin: 10px 0; font-weight: 700;">${monthHours.toFixed(1)}h</p>
                        </div>
                    </div>
                </div>
                
                <!-- Current Month Salary -->
                <div class="info-section" style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #eaa350;">
                    <h3 style="color: #fcd787; margin-top: 0;">💰 Current Month Salary (${currentMonth})</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; border: 1px solid #eaa350;">
                            <p style="color: #999; margin: 5px 0;">Gross Salary</p>
                            <p style="color: #fcd787; font-size: 1.5em; margin: 10px 0; font-weight: 700;">${monthGross.toFixed(2)} EUR</p>
                            <small style="color: #999;">${monthHours.toFixed(1)}h × ${worker.hourlyRate} EUR/h</small>
                        </div>
                        <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; border: 1px solid #eaa350;">
                            <p style="color: #999; margin: 5px 0;">Taxes (20%)</p>
                            <p style="color: #dc3545; font-size: 1.5em; margin: 10px 0; font-weight: 700;">-${monthTaxes.toFixed(2)} EUR</p>
                        </div>
                        <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; border: 1px solid #28a745;">
                            <p style="color: #999; margin: 5px 0;">Net Salary</p>
                            <p style="color: #28a745; font-size: 1.5em; margin: 10px 0; font-weight: 700;">${monthNet.toFixed(2)} EUR</p>
                        </div>
                    </div>
                </div>
                
                <!-- Bank Details -->
                <div class="info-section" style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #eaa350;">
                    <h3 style="color: #fcd787; margin-top: 0;">🏦 Bank Account Details</h3>
                    ${bankDetails ? `
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                            <div>
                                <p style="color: #999; margin: 5px 0;">Bank Name:</p>
                                <p style="color: #fcd787; margin: 5px 0; font-weight: 600;">${bankDetails.bankName}</p>
                            </div>
                            <div>
                                <p style="color: #999; margin: 5px 0;">Account Holder:</p>
                                <p style="color: #fcd787; margin: 5px 0; font-weight: 600;">${bankDetails.accountHolder}</p>
                            </div>
                            <div>
                                <p style="color: #999; margin: 5px 0;">IBAN:</p>
                                <p style="color: #fcd787; margin: 5px 0; font-weight: 600; font-family: monospace;">${bankDetails.iban}</p>
                            </div>
                            <div>
                                <p style="color: #999; margin: 5px 0;">SWIFT/BIC:</p>
                                <p style="color: #fcd787; margin: 5px 0; font-weight: 600; font-family: monospace;">${bankDetails.swift}</p>
                            </div>
                            <div>
                                <p style="color: #999; margin: 5px 0;">Submitted:</p>
                                <p style="color: #fcd787; margin: 5px 0; font-weight: 600;">${new Date(bankDetails.submittedAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p style="color: #999; margin: 5px 0;">Status:</p>
                                <p><span class="status-badge ${bankDetails.approvedByAdmin ? 'completed' : 'pending'}">${bankDetails.approvedByAdmin ? '✅ Verified' : '⏳ Pending'}</span></p>
                            </div>
                        </div>
                        ${!bankDetails.approvedByAdmin ? `
                            <div style="margin-top: 15px;">
                                <button onclick="approveBankDetails('${worker.username}')" class="btn-primary">✅ Verify Bank Details</button>
                            </div>
                        ` : ''}
                    ` : `
                        <p style="color: #999;">No bank details submitted yet.</p>
                    `}
                </div>
                
                <!-- Payroll History -->
                <div class="info-section" style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #eaa350;">
                    <h3 style="color: #fcd787; margin-top: 0;">📈 Payroll History (Last 6 Months)</h3>
                    ${workerPayroll.length > 0 ? `
                        <div style="overflow-x: auto;">
                            <table class="data-table" style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Hours</th>
                                        <th>Gross</th>
                                        <th>Taxes</th>
                                        <th>Net Pay</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${workerPayroll.map(pay => `
                                        <tr>
                                            <td>${pay.month}</td>
                                            <td>${pay.hours}h</td>
                                            <td>${pay.grossPay} EUR</td>
                                            <td style="color: #dc3545;">-${pay.deductions} EUR</td>
                                            <td style="color: #28a745; font-weight: 700;">${pay.netPay} EUR</td>
                                            <td><span class="status-badge ${pay.status}">${pay.status}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <p style="color: #999;">No payroll history available yet.</p>
                    `}
                </div>
                
                <!-- Recent Attendance -->
                <div class="info-section" style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #eaa350;">
                    <h3 style="color: #fcd787; margin-top: 0;">📅 Recent Attendance (Last 10 Days)</h3>
                    ${workerAttendance.length > 0 ? `
                        <div style="overflow-x: auto;">
                            <table class="data-table" style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Clock In</th>
                                        <th>Clock Out</th>
                                        <th>Break</th>
                                        <th>Total Hours</th>
                                        <th>Status</th>
                                        <th>Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${workerAttendance.slice(-10).reverse().map(att => `
                                        <tr>
                                            <td>${new Date(att.date).toLocaleDateString()}</td>
                                            <td>${att.clockInTime || att.manualStartTime || '-'}</td>
                                            <td>${att.clockOutTime || att.manualEndTime || '-'}</td>
                                            <td>${att.breakDeduction ? (att.breakDeduction * 60) + 'm' : '30m'}</td>
                                            <td style="font-weight: 700;">${att.totalHours ? att.totalHours.toFixed(1) + 'h' : '-'}</td>
                                            <td><span class="status-badge ${att.status}">${att.status}</span></td>
                                            <td>
                                                ${att.clockInLocation ? `
                                                    <button class="btn-small" onclick="viewLocationDetails('${worker.username}', '${att.date}')">📍 View</button>
                                                ` : '-'}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <p style="color: #999;">No attendance records available yet.</p>
                    `}
                </div>
                
                <!-- Uploaded Documents -->
                <div class="info-section" style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #eaa350;">
                    <h3 style="color: #fcd787; margin-top: 0;">📎 Worker Documents</h3>
                    <p style="color: #999; font-size: 0.9em; margin-bottom: 15px;">Documents uploaded by the worker. Admin can view, download and delete.</p>
                    ${(() => {
                        const documents = JSON.parse(localStorage.getItem(`documents_${worker.username}`) || '[]');
                        if (documents.length > 0) {
                            return `
                                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                                    ${documents.map(doc => `
                                        <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; border: 1px solid #eaa350;">
                                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                                <span style="font-size: 2em; margin-right: 10px;">
                                                    ${doc.type === 'ID' ? '🪪' : 
                                                      doc.type === 'Contract' ? '📄' : 
                                                      doc.type === 'Certificate' ? '📜' : 
                                                      doc.type === 'Medical' ? '🏥' :
                                                      doc.type === 'Photo' ? '📸' : '📋'}
                                                </span>
                                                <div style="flex: 1;">
                                                    <p style="color: #fcd787; margin: 0; font-weight: 600; font-size: 0.9em;">${doc.type}</p>
                                                    <p style="color: #999; margin: 0; font-size: 0.8em;">${doc.name}</p>
                                                </div>
                                            </div>
                                            <p style="color: #999; margin: 5px 0; font-size: 0.8em;">
                                                📅 Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()} ${new Date(doc.uploadedAt).toLocaleTimeString()}
                                            </p>
                                            <p style="color: #999; margin: 5px 0; font-size: 0.8em;">
                                                📦 Size: ${doc.size ? (doc.size / 1024).toFixed(1) + ' KB' : 'N/A'}
                                            </p>
                                            ${doc.notes ? `
                                                <p style="color: #74b9ff; margin: 5px 0; font-size: 0.8em; font-style: italic;">
                                                    📝 ${doc.notes}
                                                </p>
                                            ` : ''}
                                            <div style="margin-top: 10px; display: flex; gap: 5px;">
                                                <button onclick="viewDocument('${worker.username}', '${doc.id}')" class="btn-small" style="flex: 1; padding: 8px; font-size: 0.85em;">👁️ View</button>
                                                <button onclick="downloadDocument('${worker.username}', '${doc.id}')" class="btn-small" style="flex: 1; padding: 8px; font-size: 0.85em;">⬇️ Download</button>
                                                <button onclick="adminDeleteDocument('${worker.username}', '${doc.id}', '${worker.id}')" class="btn-small" style="background: #dc3545; padding: 8px; font-size: 0.85em;">🗑️ Delete</button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <div style="margin-top: 15px; padding: 15px; background: #2a2a2a; border-radius: 8px; border: 1px solid #6c5ce7;">
                                    <p style="color: #a29bfe; margin: 0; font-size: 0.9em;">
                                        ℹ️ <strong>Admin Note:</strong> Workers can upload documents from their dashboard. You can view, download and delete documents here.
                                    </p>
                                </div>
                            `;
                        } else {
                            return `
                                <div style="padding: 30px; text-align: center; background: #2a2a2a; border-radius: 8px; border: 1px dashed #eaa350;">
                                    <p style="color: #999; font-size: 1.1em; margin: 0;">📭 No documents uploaded yet</p>
                                    <p style="color: #999; font-size: 0.9em; margin: 10px 0;">The worker can upload documents from their dashboard.</p>
                                </div>
                            `;
                        }
                    })()}
                </div>
                
                <!-- Actions -->
                <div style="display: flex; gap: 10px; justify-content: center; padding: 20px 0;">
                    <button onclick="editWorker('${worker.id}')" class="btn-primary">✏️ Edit Worker</button>
                    <button onclick="generateWorkerReport('${worker.username}')" class="btn-secondary">📊 Generate Report</button>
                    <button onclick="closeModal()" class="btn-secondary">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function editWorker(workerId) {
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const worker = workers.find(w => w.id == workerId);
    
    if (!worker) {
        alert('Worker not found');
        return;
    }
    
    // Close existing modals
    closeModal();
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-height: 85vh; overflow-y: auto; max-width: 600px;">
            <h2 style="position: sticky; top: 0; background: #2a2a2a; padding: 20px; margin: -20px -20px 20px -20px; border-bottom: 2px solid #eaa350; z-index: 10;">✏️ Edit Worker Information</h2>
            <form id="editWorkerForm" style="padding: 0 5px;">
                <div class="form-group">
                    <label>Full Name: *</label>
                    <input type="text" id="editWorkerName" value="${worker.fullName}" required>
                </div>
                <div class="form-group">
                    <label>Username (Login): *</label>
                    <input type="text" id="editWorkerUsername" value="${worker.username}" required pattern="[a-zA-Z0-9_]+" title="Only letters, numbers and underscore">
                    <small style="color: #999;">Used for login. Only letters, numbers and underscore.</small>
                </div>
                <div class="form-group">
                    <label>🔐 Change Password:</label>
                    <input type="password" id="editWorkerPassword" minlength="6" placeholder="Leave empty to keep current password">
                    <small style="color: #999;">Leave empty if you don't want to change the password.</small>
                </div>
                <div class="form-group">
                    <label>Confirm New Password:</label>
                    <input type="password" id="editWorkerPasswordConfirm" placeholder="Confirm new password">
                </div>
                <div class="form-group">
                    <label>Position: *</label>
                    <select id="editWorkerPosition" required>
                        <option value="Construction Worker" ${worker.position === 'Construction Worker' ? 'selected' : ''}>Construction Worker</option>
                        <option value="Foreman" ${worker.position === 'Foreman' ? 'selected' : ''}>Foreman</option>
                        <option value="Electrician" ${worker.position === 'Electrician' ? 'selected' : ''}>Electrician</option>
                        <option value="Plumber" ${worker.position === 'Plumber' ? 'selected' : ''}>Plumber</option>
                        <option value="Carpenter" ${worker.position === 'Carpenter' ? 'selected' : ''}>Carpenter</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Phone: *</label>
                    <input type="tel" id="editWorkerPhone" value="${worker.phone}" required>
                </div>
                <div class="form-group">
                    <label>Email: *</label>
                    <input type="email" id="editWorkerEmail" value="${worker.email}" required>
                </div>
                <div class="form-group">
                    <label>Hourly Rate (EUR): *</label>
                    <input type="number" id="editWorkerRate" value="${worker.hourlyRate}" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label>Status: *</label>
                    <select id="editWorkerStatus" required>
                        <option value="active" ${worker.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${worker.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="modal-actions" style="position: sticky; bottom: 0; background: #2a2a2a; padding: 20px; margin: 20px -20px -20px -20px; border-top: 2px solid #eaa350; z-index: 10;">
                    <button type="submit" class="btn-primary">💾 Save Changes</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('editWorkerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('editWorkerPassword').value;
        const newPasswordConfirm = document.getElementById('editWorkerPasswordConfirm').value;
        const newUsername = document.getElementById('editWorkerUsername').value.toLowerCase().trim();
        const oldUsername = worker.username;
        
        // Validate passwords match if changing password
        if (newPassword && newPassword !== newPasswordConfirm) {
            alert('❌ Passwords do not match!');
            return;
        }
        
        // Check if new username already exists (but allow same username)
        if (newUsername !== oldUsername) {
            const allWorkers = JSON.parse(localStorage.getItem('workers') || '[]');
            if (allWorkers.some(w => w.username.toLowerCase() === newUsername && w.id !== worker.id)) {
                alert('❌ Username already exists! Please choose a different username.');
                return;
            }
        }
        
        // Update worker data
        worker.fullName = document.getElementById('editWorkerName').value;
        worker.username = newUsername;
        worker.position = document.getElementById('editWorkerPosition').value;
        worker.phone = document.getElementById('editWorkerPhone').value;
        worker.email = document.getElementById('editWorkerEmail').value;
        worker.hourlyRate = parseFloat(document.getElementById('editWorkerRate').value);
        worker.status = document.getElementById('editWorkerStatus').value;
        
        // Save to localStorage
        localStorage.setItem('workers', JSON.stringify(workers));
        
        // Update login credentials
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.username === oldUsername && u.type === 'worker');
        
        if (userIndex !== -1) {
            // Update existing user
            users[userIndex].username = newUsername;
            users[userIndex].fullName = worker.fullName;
            if (newPassword) {
                users[userIndex].password = newPassword;
            }
            localStorage.setItem('users', JSON.stringify(users));
        } else if (newPassword) {
            // Create new user if doesn't exist and password is provided
            users.push({
                username: newUsername,
                password: newPassword,
                type: 'worker',
                fullName: worker.fullName,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        let successMsg = '✅ Worker information updated successfully!';
        if (newPassword) {
            successMsg += `\n\n🔐 New Password: ${newPassword}`;
        }
        
        alert(successMsg);
        closeModal();
        loadWorkers();
    });
}

function approveBankDetails(username) {
    const bankDetails = JSON.parse(localStorage.getItem(`bankDetails_${username}`) || 'null');
    
    if (!bankDetails) {
        alert('Bank details not found');
        return;
    }
    
    // Update approval status
    bankDetails.approvedByAdmin = true;
    bankDetails.approvedAt = new Date().toISOString();
    
    // Save to individual storage
    localStorage.setItem(`bankDetails_${username}`, JSON.stringify(bankDetails));
    
    // Update in global array
    let allBankDetails = JSON.parse(localStorage.getItem('allBankDetails') || '[]');
    const index = allBankDetails.findIndex(b => b.username === username);
    if (index !== -1) {
        allBankDetails[index] = bankDetails;
        localStorage.setItem('allBankDetails', JSON.stringify(allBankDetails));
    }
    
    alert('✅ Bank details verified successfully!');
    closeModal();
    
    // Reopen worker details to show updated status
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const worker = workers.find(w => w.username === username);
    if (worker) {
        viewWorkerDetails(worker.id);
    }
}

function generateWorkerReport(username) {
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const worker = workers.find(w => w.username === username);
    
    if (!worker) {
        alert('❌ Worker not found');
        return;
    }
    
    // Get all worker data
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const workerAttendance = allAttendance.filter(a => a.username === worker.username);
    const bankDetails = JSON.parse(localStorage.getItem(`bankDetails_${worker.username}`) || 'null');
    const documents = JSON.parse(localStorage.getItem(`documents_${worker.username}`) || '[]');
    const payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    const workerPayroll = payroll.filter(p => p.username === worker.username);
    
    // Calculate statistics
    const totalDays = workerAttendance.length;
    const totalHours = workerAttendance.reduce((sum, a) => sum + (parseFloat(a.totalHours) || 0), 0);
    const avgHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;
    
    // Current month stats
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthAttendance = workerAttendance.filter(a => a.date.startsWith(currentMonth));
    const monthHours = monthAttendance.reduce((sum, a) => sum + (parseFloat(a.totalHours) || 0), 0);
    const monthGross = monthHours * worker.hourlyRate;
    const monthTaxes = monthGross * 0.20;
    const monthNet = monthGross - monthTaxes;
    
    // Create printable report window
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Worker Report - ${worker.fullName}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    color: #333;
                    background: white;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #eaa350;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #2a2a2a;
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                .header .company {
                    color: #eaa350;
                    font-size: 20px;
                    font-weight: bold;
                }
                .header .date {
                    color: #666;
                    font-size: 14px;
                    margin-top: 10px;
                }
                .section {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .section-title {
                    background: #eaa350;
                    color: white;
                    padding: 10px 15px;
                    font-size: 18px;
                    margin-bottom: 15px;
                    border-radius: 5px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin-bottom: 15px;
                }
                .info-item {
                    padding: 10px;
                    background: #f8f8f8;
                    border-left: 4px solid #eaa350;
                }
                .info-label {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 5px;
                }
                .info-value {
                    font-size: 16px;
                    color: #2a2a2a;
                    font-weight: bold;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .stat-card {
                    text-align: center;
                    padding: 20px;
                    background: #f8f8f8;
                    border: 2px solid #eaa350;
                    border-radius: 8px;
                }
                .stat-label {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 10px;
                }
                .stat-value {
                    font-size: 28px;
                    color: #eaa350;
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                th {
                    background: #2a2a2a;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-size: 14px;
                }
                td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #ddd;
                    font-size: 13px;
                }
                tr:nth-child(even) {
                    background: #f8f8f8;
                }
                .salary-highlight {
                    background: #e8f5e9;
                    padding: 20px;
                    border-radius: 8px;
                    border: 2px solid #4caf50;
                    text-align: center;
                }
                .salary-amount {
                    font-size: 36px;
                    color: #4caf50;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 2px solid #eaa350;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                }
                .no-data {
                    color: #999;
                    font-style: italic;
                    padding: 20px;
                    text-align: center;
                    background: #f8f8f8;
                }
                @media print {
                    body { padding: 20px; }
                    .section { page-break-inside: avoid; }
                    @page { margin: 20mm; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="logo.png" alt="OHR BUILD" style="max-width: 200px; margin-bottom: 15px;">
                <div class="company">OHR BUILD</div>
                <h1>📊 Worker Detailed Report</h1>
                <div class="date">Generated: ${new Date().toLocaleDateString('ro-RO', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</div>
            </div>
            
            <!-- Personal Information -->
            <div class="section">
                <div class="section-title">📋 Personal Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Full Name</div>
                        <div class="info-value">${worker.fullName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Username</div>
                        <div class="info-value">${worker.username}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Position</div>
                        <div class="info-value">${worker.position}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Hourly Rate</div>
                        <div class="info-value">${worker.hourlyRate} EUR/h</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">📱 Phone</div>
                        <div class="info-value">${worker.phone}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">📧 Email</div>
                        <div class="info-value">${worker.email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">📅 Hire Date</div>
                        <div class="info-value">${worker.hireDate}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value" style="color: ${worker.status === 'active' ? '#4caf50' : '#f44336'};">
                            ${worker.status === 'active' ? '✅ Active' : '❌ Inactive'}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Work Statistics -->
            <div class="section">
                <div class="section-title">📊 Work Statistics (All Time)</div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Total Days Worked</div>
                        <div class="stat-value">${totalDays}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Hours</div>
                        <div class="stat-value">${totalHours.toFixed(1)}h</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Avg Hours/Day</div>
                        <div class="stat-value">${avgHoursPerDay}h</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Earned</div>
                        <div class="stat-value">${(totalHours * worker.hourlyRate).toFixed(2)} €</div>
                    </div>
                </div>
            </div>
            
            <!-- Current Month Salary -->
            <div class="section">
                <div class="section-title">💰 Current Month Salary (${currentMonth})</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Hours Worked</div>
                        <div class="info-value">${monthHours.toFixed(1)} hours</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Gross Salary</div>
                        <div class="info-value">${monthGross.toFixed(2)} EUR</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Taxes (20%)</div>
                        <div class="info-value" style="color: #f44336;">-${monthTaxes.toFixed(2)} EUR</div>
                    </div>
                </div>
                <div class="salary-highlight">
                    <div class="stat-label">NET SALARY TO PAY</div>
                    <div class="salary-amount">${monthNet.toFixed(2)} EUR</div>
                </div>
            </div>
            
            ${bankDetails ? `
            <!-- Bank Details -->
            <div class="section">
                <div class="section-title">🏦 Bank Account Details</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Bank Name</div>
                        <div class="info-value">${bankDetails.bankName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Account Holder</div>
                        <div class="info-value">${bankDetails.accountHolder}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">IBAN</div>
                        <div class="info-value" style="font-family: monospace; font-size: 14px;">${bankDetails.iban}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">SWIFT/BIC</div>
                        <div class="info-value" style="font-family: monospace;">${bankDetails.swift}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value" style="color: ${bankDetails.approvedByAdmin ? '#4caf50' : '#ff9800'};">
                            ${bankDetails.approvedByAdmin ? '✅ Verified' : '⏳ Pending Verification'}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Submitted</div>
                        <div class="info-value">${new Date(bankDetails.submittedAt).toLocaleDateString('ro-RO')}</div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            ${documents.length > 0 ? `
            <!-- Documents -->
            <div class="section">
                <div class="section-title">📎 Uploaded Documents</div>
                <table>
                    <thead>
                        <tr>
                            <th>Document Type</th>
                            <th>Name</th>
                            <th>Upload Date</th>
                            <th>File Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${documents.map(doc => `
                            <tr>
                                <td>${doc.type}</td>
                                <td>${doc.name}</td>
                                <td>${new Date(doc.uploadedAt).toLocaleDateString('ro-RO')}</td>
                                <td>${(doc.size / 1024).toFixed(1)} KB</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}
            
            ${workerPayroll.length > 0 ? `
            <!-- Payroll History -->
            <div class="section">
                <div class="section-title">📈 Payroll History</div>
                <table>
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Hours</th>
                            <th>Gross Pay</th>
                            <th>Taxes</th>
                            <th>Net Pay</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${workerPayroll.map(pay => `
                            <tr>
                                <td>${pay.month}</td>
                                <td>${pay.hours}h</td>
                                <td>${pay.grossPay} EUR</td>
                                <td style="color: #f44336;">-${pay.deductions} EUR</td>
                                <td style="color: #4caf50; font-weight: bold;">${pay.netPay} EUR</td>
                                <td>${pay.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}
            
            <!-- Attendance History -->
            <div class="section">
                <div class="section-title">📅 Attendance History (Last 20 Days)</div>
                ${workerAttendance.length > 0 ? `
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Clock In</th>
                                <th>Clock Out</th>
                                <th>Break</th>
                                <th>Total Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${workerAttendance.slice(-20).reverse().map(att => `
                                <tr>
                                    <td>${new Date(att.date).toLocaleDateString('ro-RO')}</td>
                                    <td>${att.clockInTime || att.manualStartTime || '-'}</td>
                                    <td>${att.clockOutTime || att.manualEndTime || '-'}</td>
                                    <td>${att.breakDeduction ? (att.breakDeduction * 60) + 'm' : '30m'}</td>
                                    <td style="font-weight: bold;">${att.totalHours ? att.totalHours.toFixed(1) + 'h' : '-'}</td>
                                    <td>${att.status || 'completed'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<div class="no-data">No attendance records available</div>'}
            </div>
            
            <div class="footer">
                <p><strong>OHR BUILD</strong></p>
                <p>Confidential Worker Report - Generated by Admin Dashboard</p>
                <p>Report Date: ${new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <script>
                // Auto-print when page loads
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    
    reportWindow.document.close();
}

function toggleWorkerStatus(workerId) {
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const worker = workers.find(w => w.id == workerId);
    
    if (!worker) {
        alert('❌ Worker not found');
        return;
    }
    
    const action = worker.status === 'active' ? 'freeze' : 'activate';
    const confirmMsg = worker.status === 'active' 
        ? `❄️ Freeze worker "${worker.fullName}"?\n\nThe worker will not be able to login and will be marked as inactive.`
        : `✅ Activate worker "${worker.fullName}"?\n\nThe worker will be able to login again and will be marked as active.`;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    // Toggle status
    worker.status = worker.status === 'active' ? 'inactive' : 'active';
    localStorage.setItem('workers', JSON.stringify(workers));
    
    alert(`✅ Worker ${action}d successfully!`);
    loadWorkers();
}

function deleteWorker(workerId) {
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const worker = workers.find(w => w.id == workerId);
    
    if (!worker) {
        alert('❌ Worker not found');
        return;
    }
    
    const confirmMsg = `🗑️ DELETE worker "${worker.fullName}"?\n\n⚠️ WARNING: This action CANNOT be undone!\n\nAll data will be removed:\n✓ Worker profile\n✓ Login credentials\n✓ Attendance history\n✓ Bank details\n✓ Payroll records\n\nType "DELETE" to confirm:`;
    
    const userInput = prompt(confirmMsg);
    
    if (userInput !== 'DELETE') {
        alert('❌ Deletion cancelled. Worker was not deleted.');
        return;
    }
    
    // Remove worker from workers array
    const updatedWorkers = workers.filter(w => w.id != workerId);
    localStorage.setItem('workers', JSON.stringify(updatedWorkers));
    
    // Remove login credentials
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users = users.filter(u => u.username !== worker.username || u.type !== 'worker');
    localStorage.setItem('users', JSON.stringify(users));
    
    // Remove attendance records
    let allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    allAttendance = allAttendance.filter(a => a.username !== worker.username);
    localStorage.setItem('allAttendance', JSON.stringify(allAttendance));
    
    // Remove bank details
    localStorage.removeItem(`bankDetails_${worker.username}`);
    let allBankDetails = JSON.parse(localStorage.getItem('allBankDetails') || '[]');
    allBankDetails = allBankDetails.filter(b => b.username !== worker.username);
    localStorage.setItem('allBankDetails', JSON.stringify(allBankDetails));
    
    // Remove payroll records
    let payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    payroll = payroll.filter(p => p.username !== worker.username);
    localStorage.setItem('payroll', JSON.stringify(payroll));
    
    alert(`✅ Worker "${worker.fullName}" has been permanently deleted from the system.`);
    loadWorkers();
}

// Document Management Functions for Admin (View & Delete Only)

function viewDocument(username, docId) {
    const documents = JSON.parse(localStorage.getItem(`documents_${username}`) || '[]');
    const doc = documents.find(d => d.id === docId);
    
    if (!doc) {
        alert('❌ Document not found');
        return;
    }
    
    // Open document in new window
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <html>
            <head>
                <title>${doc.name}</title>
                <style>
                    body { 
                        margin: 0; 
                        display: flex; 
                        flex-direction: column;
                        justify-content: center; 
                        align-items: center; 
                        min-height: 100vh; 
                        background: #1a1a1a;
                        font-family: Arial, sans-serif;
                    }
                    .header {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        background: #2a2a2a;
                        color: #fcd787;
                        padding: 15px;
                        text-align: center;
                        border-bottom: 2px solid #eaa350;
                        z-index: 1000;
                    }
                    .content {
                        margin-top: 80px;
                        max-width: 100%;
                        max-height: calc(100vh - 100px);
                        overflow: auto;
                    }
                    img { 
                        max-width: 100%; 
                        max-height: calc(100vh - 100px);
                        box-shadow: 0 4px 20px rgba(234, 163, 80, 0.3);
                    }
                    iframe {
                        width: 90vw;
                        height: calc(100vh - 100px);
                        border: 2px solid #eaa350;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h3 style="margin: 0;">📄 ${doc.type} - ${doc.name}</h3>
                    <small>Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()} at ${new Date(doc.uploadedAt).toLocaleTimeString()}</small>
                </div>
                <div class="content">
    `);
    
    if (doc.fileType.includes('image')) {
        newWindow.document.write(`<img src="${doc.data}" alt="${doc.name}">`);
    } else if (doc.fileType.includes('pdf')) {
        newWindow.document.write(`<iframe src="${doc.data}"></iframe>`);
    } else {
        newWindow.document.write(`
            <div style="text-align: center; color: #fcd787; padding: 50px;">
                <p style="font-size: 3em;">📄</p>
                <p>Preview not available for this file type.</p>
                <p><strong>${doc.fileName}</strong></p>
                <p>Size: ${(doc.size / 1024).toFixed(1)} KB</p>
            </div>
        `);
    }
    
    newWindow.document.write(`
                </div>
            </body>
        </html>
    `);
    newWindow.document.close();
}

function adminDeleteDocument(username, docId, workerId) {
    const documents = JSON.parse(localStorage.getItem(`documents_${username}`) || '[]');
    const doc = documents.find(d => d.id === docId);
    
    if (!doc) {
        alert('❌ Document not found');
        return;
    }
    
    const confirmMsg = `🗑️ Delete this document?\n\nDocument: ${doc.name}\nType: ${doc.type}\nUploaded: ${new Date(doc.uploadedAt).toLocaleDateString()}\n\n⚠️ This action cannot be undone!`;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    // Delete document
    const updatedDocuments = documents.filter(d => d.id !== docId);
    localStorage.setItem(`documents_${username}`, JSON.stringify(updatedDocuments));
    
    // Show success message
    alert(`✅ Document "${doc.name}" deleted successfully!`);
    
    // Refresh worker details in real-time
    viewWorkerDetails(workerId);
}

function downloadDocument(username, docId) {
    const documents = JSON.parse(localStorage.getItem(`documents_${username}`) || '[]');
    const doc = documents.find(d => d.id === docId);
    
    if (!doc) {
        alert('❌ Document not found');
        return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.fileName || `${doc.type}_${doc.name}.${doc.fileType.split('/')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(145deg, #28a745, #20c997);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
        z-index: 10000;
        font-weight: bold;
    `;
    notification.innerHTML = `⬇️ Downloading: ${doc.name}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Initialize admin features on section change
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            setTimeout(() => {
                if (section === 'workers') initializeWorkers();
                if (section === 'requests-admin') initializeAdminRequests();
                if (section === 'payroll') initializePayroll();
                if (section === 'tasks-admin') initializeAdminTasks();
                if (section === 'equipment-admin') initializeEquipmentManagement();
            }, 100);
        });
    });
    
    // Initialize on load if section is active
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        const sectionId = activeSection.id;
        if (sectionId === 'tasks-admin') initializeAdminTasks();
        if (sectionId === 'equipment-admin') initializeEquipmentManagement();
    }
});

// ============================================
// TASKS MANAGEMENT
// ============================================

function initializeAdminTasks() {
    // Scroll to top of the page when opening Assign Tasks
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    loadAdminTasks();
    
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.onclick = showAddTaskModal;
    }
}

function loadAdminTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const container = document.getElementById('adminTasksContainer');
    
    if (!container) return;
    
    if (tasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No tasks created yet. Click "Add Task" to create one.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="tasks-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${tasks.map(task => {
                const worker = workers.find(w => w.username === task.assignedTo);
                const workerName = worker ? worker.fullName : task.assignedTo || 'Unassigned';
                const statusColor = task.status === 'completed' ? '#4caf50' : 
                                   task.status === 'in-progress' ? '#ff9800' : '#666';
                const statusIcon = task.status === 'completed' ? '✅' : 
                                  task.status === 'in-progress' ? '🔄' : '📋';
                
                return `
                    <div class="task-card" style="background: #1a1a1a; border: 2px solid #eaa350; border-radius: 10px; padding: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                            <h4 style="color: #fcd787; margin: 0;">${task.title}</h4>
                            <span style="background: ${statusColor}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.85em;">
                                ${statusIcon} ${task.status}
                            </span>
                        </div>
                        <p style="color: #999; margin: 10px 0;">${task.description}</p>
                        <div style="margin: 15px 0; padding: 10px; background: #2a2a2a; border-radius: 5px;">
                            <p style="color: #fcd787; margin: 5px 0;"><strong>👷 Assigned:</strong> ${workerName}</p>
                            <p style="color: #fcd787; margin: 5px 0;"><strong>📍 Location:</strong> ${task.location || 'Not specified'}</p>
                            <p style="color: #fcd787; margin: 5px 0;"><strong>⏰ Due:</strong> ${new Date(task.dueDate).toLocaleDateString('ro-RO')}</p>
                            <p style="color: #fcd787; margin: 5px 0;"><strong>📌 Priority:</strong> ${task.priority}</p>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn-small" onclick="editTask('${task.id}')" style="flex: 1;">✏️ Edit</button>
                            <button class="btn-small" onclick="deleteTask('${task.id}')" style="flex: 1; background: #dc3545;">🗑️ Delete</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function showAddTaskModal() {
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const activeWorkers = workers.filter(w => w.status === 'active');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h2 style="color: #fcd787; margin-bottom: 20px;">➕ Add New Task</h2>
            <form id="taskForm" onsubmit="saveTask(event)">
                <input type="hidden" id="taskId">
                
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Task Title *</label>
                <input type="text" id="taskTitle" required placeholder="e.g., Install electrical wiring" 
                       style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;">
                
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Description *</label>
                <textarea id="taskDescription" required placeholder="Detailed description of the task..." rows="3"
                       style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;"></textarea>
                
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Assign to Worker *</label>
                <select id="taskAssignedTo" required style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;">
                    <option value="">-- Select Worker --</option>
                    ${activeWorkers.map(w => `<option value="${w.username}">${w.fullName} (${w.position})</option>`).join('')}
                </select>
                
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Location *</label>
                <input type="text" id="taskLocation" required placeholder="e.g., Building A - Floor 2" 
                       style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;">
                
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Due Date *</label>
                <input type="date" id="taskDueDate" required 
                       style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;">
                
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Priority *</label>
                <select id="taskPriority" required style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;">
                    <option value="low">🟢 Low</option>
                    <option value="medium" selected>🟡 Medium</option>
                    <option value="high">🔴 High</option>
                </select>
                
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Status</label>
                <select id="taskStatus" style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;">
                    <option value="pending">📋 Pending</option>
                    <option value="in-progress">🔄 In Progress</option>
                    <option value="completed">✅ Completed</option>
                </select>
                
                <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 25px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">💾 Save Task</button>
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="flex: 1;">Cancel</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('taskDueDate').value = tomorrow.toISOString().split('T')[0];
}

function saveTask(event) {
    event.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    const taskData = {
        id: taskId || Date.now().toString(),
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        assignedTo: document.getElementById('taskAssignedTo').value,
        location: document.getElementById('taskLocation').value,
        dueDate: document.getElementById('taskDueDate').value,
        priority: document.getElementById('taskPriority').value,
        status: document.getElementById('taskStatus').value,
        createdAt: taskId ? tasks.find(t => t.id === taskId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (taskId) {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) tasks[index] = taskData;
    } else {
        tasks.push(taskData);
    }
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    document.querySelector('.modal-overlay').remove();
    loadAdminTasks();
    alert('✅ Task saved successfully!');
}

function editTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const task = tasks.find(t => t.id == taskId);
    
    if (!task) {
        alert('❌ Task not found!');
        return;
    }
    
    showAddTaskModal();
    
    setTimeout(() => {
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskAssignedTo').value = task.assignedTo;
        document.getElementById('taskLocation').value = task.location || '';
        document.getElementById('taskDueDate').value = task.dueDate;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskStatus').value = task.status;
        document.querySelector('.modal-content h2').textContent = '✏️ Edit Task';
    }, 100);
}

function deleteTask(taskId) {
    if (!confirm('🗑️ Delete this task?\n\nThis action cannot be undone.')) return;
    
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id != taskId);
    
    if (tasks.length === initialLength) {
        alert('❌ Task not found!');
        return;
    }
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    loadAdminTasks();
    alert('✅ Task deleted successfully!');
}

// ============================================
// EQUIPMENT MANAGEMENT
// ============================================

function initializeEquipmentManagement() {
    loadEquipment();
    
    const addEquipmentBtn = document.querySelector('#equipment-admin .btn-primary');
    if (addEquipmentBtn) {
        addEquipmentBtn.onclick = showAddEquipmentModal;
    }
}

function loadEquipment() {
    const equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const tbody = document.querySelector('#equipment-admin table tbody');
    
    if (!tbody) return;
    
    // Update stats
    const totalEq = equipment.length;
    const inUse = equipment.filter(e => e.status === 'in-use').length;
    const available = equipment.filter(e => e.status === 'available').length;
    const maintenance = equipment.filter(e => e.status === 'maintenance').length;
    
    const statCards = document.querySelectorAll('#equipment-admin .eq-stat-card');
    if (statCards.length >= 4) {
        statCards[0].querySelector('.big-number').textContent = totalEq;
        statCards[1].querySelector('.big-number').textContent = inUse;
        statCards[2].querySelector('.big-number').textContent = available;
        statCards[3].querySelector('.big-number').textContent = maintenance;
    }
    
    if (equipment.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999; padding: 30px;">No equipment added yet. Click "New Equipment" to add one.</td></tr>';
        return;
    }
    
    tbody.innerHTML = equipment.map(eq => {
        const worker = workers.find(w => w.username === eq.assignedTo);
        const workerName = worker ? worker.fullName : '-';
        
        const statusBadges = {
            'available': '✅ Available',
            'in-use': '🟢 In Use',
            'maintenance': '⚠️ Maintenance',
            'retired': '❌ Retired'
        };
        
        const statusClasses = {
            'available': 'success',
            'in-use': 'active',
            'maintenance': 'warning',
            'retired': 'inactive'
        };
        
        return `
            <tr>
                <td><strong>${eq.id}</strong></td>
                <td>${eq.name}</td>
                <td>${eq.category}</td>
                <td>${workerName}</td>
                <td>${eq.location || '-'}</td>
                <td><span class="status-badge ${statusClasses[eq.status]}">${statusBadges[eq.status]}</span></td>
                <td>
                    <button class="btn-small" onclick="editEquipment('${eq.id}')" title="Edit">✏️</button>
                    ${eq.status === 'available' ? 
                        `<button class="btn-small" onclick="assignEquipment('${eq.id}')" title="Assign">📤</button>` :
                        eq.status === 'in-use' ?
                        `<button class="btn-small" onclick="returnEquipment('${eq.id}')" title="Return">↩️</button>` :
                        `<button class="btn-small" onclick="markAvailable('${eq.id}')" title="Mark Available">✅</button>`
                    }
                    <button class="btn-small" onclick="deleteEquipment('${eq.id}')" title="Delete" style="background: #dc3545;">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function showAddEquipmentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h2 style="color: #fcd787; margin-bottom: 20px;">➕ Add New Equipment</h2>
            <form id="equipmentForm" onsubmit="saveEquipment(event)">
                <input type="hidden" id="equipmentId">
                
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Equipment Name *</label>
                <input type="text" id="equipmentName" required placeholder="e.g., Electric Drill" 
                       style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;">
                
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Category *</label>
                <select id="equipmentCategory" required style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;">
                    <option value="">-- Select Category --</option>
                    <option value="Power Tools">Power Tools</option>
                    <option value="Hand Tools">Hand Tools</option>
                    <option value="Safety Equipment">Safety Equipment</option>
                    <option value="Measuring Tools">Measuring Tools</option>
                    <option value="Heavy Machinery">Heavy Machinery</option>
                    <option value="Other">Other</option>
                </select>
                
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Location</label>
                <input type="text" id="equipmentLocation" placeholder="e.g., Warehouse, Site A" 
                       style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;">
                
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Status *</label>
                <select id="equipmentStatus" required style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;">
                    <option value="available">✅ Available</option>
                    <option value="in-use">🟢 In Use</option>
                    <option value="maintenance">⚠️ Maintenance</option>
                    <option value="retired">❌ Retired</option>
                </select>
                
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Notes</label>
                <textarea id="equipmentNotes" placeholder="Additional notes..." rows="2"
                       style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;"></textarea>
                
                <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 25px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">💾 Save Equipment</button>
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="flex: 1;">Cancel</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveEquipment(event) {
    event.preventDefault();
    
    const equipmentId = document.getElementById('equipmentId').value;
    const equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    
    const eqData = {
        id: equipmentId || `EQ-${Date.now()}`,
        name: document.getElementById('equipmentName').value,
        category: document.getElementById('equipmentCategory').value,
        location: document.getElementById('equipmentLocation').value,
        status: document.getElementById('equipmentStatus').value,
        notes: document.getElementById('equipmentNotes').value,
        assignedTo: null,
        createdAt: equipmentId ? equipment.find(e => e.id === equipmentId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (equipmentId) {
        const index = equipment.findIndex(e => e.id === equipmentId);
        if (index !== -1) equipment[index] = eqData;
    } else {
        equipment.push(eqData);
    }
    
    localStorage.setItem('equipment', JSON.stringify(equipment));
    document.querySelector('.modal-overlay').remove();
    loadEquipment();
    alert('✅ Equipment saved successfully!');
}

function editEquipment(eqId) {
    const equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    const eq = equipment.find(e => e.id == eqId);
    
    if (!eq) {
        alert('❌ Equipment not found!');
        return;
    }
    
    showAddEquipmentModal();
    
    setTimeout(() => {
        document.getElementById('equipmentId').value = eq.id;
        document.getElementById('equipmentName').value = eq.name;
        document.getElementById('equipmentCategory').value = eq.category;
        document.getElementById('equipmentLocation').value = eq.location || '';
        document.getElementById('equipmentStatus').value = eq.status;
        document.getElementById('equipmentNotes').value = eq.notes || '';
        document.querySelector('.modal-content h2').textContent = '✏️ Edit Equipment';
    }, 100);
}

function assignEquipment(eqId) {
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const activeWorkers = workers.filter(w => w.status === 'active');
    
    if (activeWorkers.length === 0) {
        alert('❌ No active workers available');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <h2 style="color: #fcd787; margin-bottom: 20px;">📤 Assign Equipment</h2>
            <form onsubmit="confirmAssignEquipment(event, '${eqId}')">
                <label style="color: #fcd787; display: block; margin: 15px 0 5px;">Assign to Worker *</label>
                <select id="assignWorker" required style="width: 100%; padding: 10px; border: 2px solid #eaa350; border-radius: 5px; background: #2a2a2a; color: #fcd787;">
                    <option value="">-- Select Worker --</option>
                    ${activeWorkers.map(w => `<option value="${w.username}">${w.fullName} (${w.position})</option>`).join('')}
                </select>
                
                <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 25px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">✅ Assign</button>
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="flex: 1;">Cancel</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmAssignEquipment(event, eqId) {
    event.preventDefault();
    
    const equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    const eq = equipment.find(e => e.id === eqId);
    const workerUsername = document.getElementById('assignWorker').value;
    
    if (eq) {
        eq.assignedTo = workerUsername;
        eq.status = 'in-use';
        eq.assignedAt = new Date().toISOString();
        localStorage.setItem('equipment', JSON.stringify(equipment));
    }
    
    document.querySelector('.modal-overlay').remove();
    loadEquipment();
    alert('✅ Equipment assigned successfully!');
}

function returnEquipment(eqId) {
    if (!confirm('↩️ Return this equipment to available status?')) return;
    
    const equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    const eq = equipment.find(e => e.id === eqId);
    
    if (eq) {
        eq.assignedTo = null;
        eq.status = 'available';
        eq.returnedAt = new Date().toISOString();
        localStorage.setItem('equipment', JSON.stringify(equipment));
    }
    
    loadEquipment();
    alert('✅ Equipment returned successfully!');
}

function markAvailable(eqId) {
    const equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    const eq = equipment.find(e => e.id === eqId);
    
    if (eq) {
        eq.status = 'available';
        eq.assignedTo = null;
        localStorage.setItem('equipment', JSON.stringify(equipment));
    }
    
    loadEquipment();
    alert('✅ Equipment marked as available!');
}

function deleteEquipment(eqId) {
    if (!confirm('🗑️ Delete this equipment?\n\nThis action cannot be undone.')) return;
    
    let equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    const initialLength = equipment.length;
    equipment = equipment.filter(e => e.id != eqId);
    
    if (equipment.length === initialLength) {
        alert('❌ Equipment not found!');
        return;
    }
    
    localStorage.setItem('equipment', JSON.stringify(equipment));
    
    loadEquipment();
    alert('✅ Equipment deleted successfully!');
}

// ============================================
// GLOBAL EXPORTS FOR INLINE ONCLICK HANDLERS
// ============================================
window.switchPayrollMode = switchPayrollMode;
window.markAsPaid = markAsPaid;
window.generatePayroll = generatePayroll;
