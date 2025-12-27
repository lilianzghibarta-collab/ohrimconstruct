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
            phone: '+373 69 123 456',
            email: 'worker@ohrimconstruct.com',
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
                    <p>📱 ${worker.phone}</p>
                    <p>📧 ${worker.email}</p>
                    <p>💰 ${worker.hourlyRate} MDL/h</p>
                    <span class="status-badge ${worker.status}">${worker.status}</span>
                    <div class="worker-actions">
                        <button onclick="editWorker('${worker.id}')" class="btn-small">✏️ Edit</button>
                        <button onclick="viewWorkerDetails('${worker.id}')" class="btn-small">👁️ View</button>
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
        <div class="modal-content">
            <h2>👷 Add New Worker</h2>
            <form id="addWorkerForm">
                <div class="form-group">
                    <label>Full Name:</label>
                    <input type="text" id="workerName" required>
                </div>
                <div class="form-group">
                    <label>Username:</label>
                    <input type="text" id="workerUsername" required>
                </div>
                <div class="form-group">
                    <label>Position:</label>
                    <select id="workerPosition" required>
                        <option value="Construction Worker">Construction Worker</option>
                        <option value="Foreman">Foreman</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Carpenter">Carpenter</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Phone:</label>
                    <input type="tel" id="workerPhone" required>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="workerEmail" required>
                </div>
                <div class="form-group">
                    <label>Hourly Rate (MDL):</label>
                    <input type="number" id="workerRate" value="25" required>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Add Worker</button>
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
    
    const worker = {
        id: Date.now(),
        username: document.getElementById('workerUsername').value,
        fullName: document.getElementById('workerName').value,
        position: document.getElementById('workerPosition').value,
        phone: document.getElementById('workerPhone').value,
        email: document.getElementById('workerEmail').value,
        hourlyRate: parseFloat(document.getElementById('workerRate').value),
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active'
    };
    
    let workers = JSON.parse(localStorage.getItem('workers') || '[]');
    workers.push(worker);
    localStorage.setItem('workers', JSON.stringify(workers));
    
    alert('✅ Worker added successfully!');
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
// PAYROLL MANAGEMENT
// ============================================

function initializePayroll() {
    loadPayroll();
    
    const generatePayrollBtn = document.getElementById('generatePayrollBtn');
    if (generatePayrollBtn) {
        generatePayrollBtn.addEventListener('click', generatePayroll);
    }
}

function loadPayroll() {
    const payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    const container = document.getElementById('payrollContainer');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="payroll-summary">
            <div class="summary-card">
                <h4>📊 Total Payroll This Month</h4>
                <p class="big-number">${calculateTotalPayroll()} MDL</p>
            </div>
        </div>
        
        <div class="payroll-table">
            <table>
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Month</th>
                        <th>Hours</th>
                        <th>Gross Pay</th>
                        <th>Deductions</th>
                        <th>Net Pay</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${payroll.map(pay => `
                        <tr>
                            <td>${pay.fullName}</td>
                            <td>${pay.month}</td>
                            <td>${pay.hours || '-'}</td>
                            <td>${pay.grossPay} MDL</td>
                            <td>${pay.deductions} MDL</td>
                            <td><strong>${pay.netPay} MDL</strong></td>
                            <td><span class="status-badge ${pay.status}">${pay.status}</span></td>
                            <td>
                                ${pay.status === 'pending' ? `
                                    <button onclick="markAsPaid('${pay.id}')" class="btn-small">✅ Mark Paid</button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function calculateTotalPayroll() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    return payroll
        .filter(p => p.month === currentMonth)
        .reduce((sum, p) => sum + p.netPay, 0);
}

function generatePayroll() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    
    workers.forEach(worker => {
        // Calculate hours for current month
        const workerAttendance = allAttendance.filter(att => 
            att.username === worker.username && 
            att.date.startsWith(currentMonth) &&
            att.status === 'completed'
        );
        
        const totalHours = workerAttendance.reduce((sum, att) => 
            sum + (parseFloat(att.totalHours) || 0), 0
        );
        
        const grossPay = totalHours * worker.hourlyRate;
        const deductions = grossPay * 0.15; // 15% deductions
        const netPay = grossPay - deductions;
        
        const payroll = {
            id: Date.now() + Math.random(),
            username: worker.username,
            fullName: worker.fullName,
            month: currentMonth,
            hours: totalHours.toFixed(2),
            grossPay: parseFloat(grossPay.toFixed(2)),
            deductions: parseFloat(deductions.toFixed(2)),
            netPay: parseFloat(netPay.toFixed(2)),
            status: 'pending',
            generatedDate: new Date().toISOString()
        };
        
        let allPayroll = JSON.parse(localStorage.getItem('payroll') || '[]');
        
        // Check if payroll for this month already exists
        const exists = allPayroll.find(p => 
            p.username === worker.username && p.month === currentMonth
        );
        
        if (!exists) {
            allPayroll.push(payroll);
        }
        
        localStorage.setItem('payroll', JSON.stringify(allPayroll));
    });
    
    alert('✅ Payroll generated successfully!');
    loadPayroll();
}

function markAsPaid(payId) {
    let payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    const index = payroll.findIndex(p => p.id == payId);
    
    if (index !== -1) {
        payroll[index].status = 'paid';
        payroll[index].paymentDate = new Date().toISOString();
        localStorage.setItem('payroll', JSON.stringify(payroll));
        loadPayroll();
        alert('✅ Marked as paid!');
    }
}

// ============================================
// TASKS MANAGEMENT (ADMIN)
// ============================================

function initializeAdminTasks() {
    loadAdminTasks();
    
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', showAddTaskModal);
    }
}

function loadAdminTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const container = document.getElementById('adminTasksContainer');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="admin-tasks-list">
            ${tasks.map(task => `
                <div class="admin-task-card">
                    <h4>${task.title}</h4>
                    <p>${task.description}</p>
                    <p>👷 Assigned to: ${task.assignedTo}</p>
                    <p>📍 Location: ${task.location}</p>
                    <p>📅 Due: ${new Date(task.dueDate).toLocaleDateString()}</p>
                    <span class="status-badge ${task.status}">${task.status}</span>
                    <button onclick="deleteTask('${task.id}')" class="btn-small btn-danger">🗑️ Delete</button>
                </div>
            `).join('')}
        </div>
    `;
}

function showAddTaskModal() {
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>✅ Add New Task</h2>
            <form id="addTaskForm">
                <div class="form-group">
                    <label>Task Title:</label>
                    <input type="text" id="taskTitle" required>
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <textarea id="taskDescription" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label>Assign to Worker:</label>
                    <select id="taskWorker" required>
                        ${workers.map(w => `<option value="${w.username}">${w.fullName}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Location:</label>
                    <input type="text" id="taskLocation" required>
                </div>
                <div class="form-group">
                    <label>Due Date:</label>
                    <input type="date" id="taskDueDate" required>
                </div>
                <div class="form-group">
                    <label>Priority:</label>
                    <select id="taskPriority" required>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Add Task</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('addTaskForm').addEventListener('submit', handleAddTask);
}

function handleAddTask(e) {
    e.preventDefault();
    
    const task = {
        id: Date.now(),
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        assignedTo: document.getElementById('taskWorker').value,
        location: document.getElementById('taskLocation').value,
        dueDate: document.getElementById('taskDueDate').value,
        priority: document.getElementById('taskPriority').value,
        status: 'pending',
        createdDate: new Date().toISOString()
    };
    
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    alert('✅ Task added successfully!');
    closeModal();
    loadAdminTasks();
}

function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks = tasks.filter(t => t.id != taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    loadAdminTasks();
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
    
    let report = `
========================================
    OHRIM CONSTRUCT
ATTENDANCE REPORT - ${currentMonth}
========================================

Total Records: ${monthAttendance.length}

`;
    
    monthAttendance.forEach(att => {
        report += `
Date: ${att.date}
Employee: ${att.fullName}
Clock In: ${att.clockInTime}
Clock Out: ${att.clockOutTime || 'N/A'}
Total Hours: ${att.totalHours || 'N/A'}
Status: ${att.status}
----------------------------
`;
    });
    
    report += `\n========================================\nGenerated: ${new Date().toLocaleString()}\n========================================`;
    
    downloadTextFile(report, `attendance_report_${currentMonth}.txt`);
}

function generatePayrollReport() {
    const payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthPayroll = payroll.filter(p => p.month === currentMonth);
    
    const totalGross = monthPayroll.reduce((sum, p) => sum + p.grossPay, 0);
    const totalNet = monthPayroll.reduce((sum, p) => sum + p.netPay, 0);
    
    let report = `
========================================
    OHRIM CONSTRUCT
PAYROLL REPORT - ${currentMonth}
========================================

Total Employees: ${monthPayroll.length}
Total Gross Pay: ${totalGross.toFixed(2)} MDL
Total Net Pay: ${totalNet.toFixed(2)} MDL

`;
    
    monthPayroll.forEach(pay => {
        report += `
Employee: ${pay.fullName}
Gross Pay: ${pay.grossPay} MDL
Deductions: ${pay.deductions} MDL
Net Pay: ${pay.netPay} MDL
Status: ${pay.status}
----------------------------
`;
    });
    
    report += `\n========================================\nGenerated: ${new Date().toLocaleString()}\n========================================`;
    
    downloadTextFile(report, `payroll_report_${currentMonth}.txt`);
}

function generateEquipmentReport() {
    const equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    
    let report = `
========================================
    OHRIM CONSTRUCT
EQUIPMENT INVENTORY REPORT
========================================

Total Equipment: ${equipment.length}
Assigned: ${equipment.filter(e => e.status === 'assigned').length}
Available: ${equipment.filter(e => e.status === 'available').length}

`;
    
    equipment.forEach(eq => {
        report += `
ID: ${eq.id}
Name: ${eq.name}
Status: ${eq.status}
Assigned To: ${eq.assignedTo || 'N/A'}
Condition: ${eq.condition}
----------------------------
`;
    });
    
    report += `\n========================================\nGenerated: ${new Date().toLocaleString()}\n========================================`;
    
    downloadTextFile(report, `equipment_report_${new Date().toISOString().slice(0, 10)}.txt`);
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
// UTILITY FUNCTIONS
// ============================================

function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.remove());
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
                if (section === 'reports') initializeReports();
            }, 100);
        });
    });
});
