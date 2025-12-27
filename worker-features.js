// Enhanced Worker Dashboard Features

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

function initializeDocuments() {
    loadDocuments();
    
    // Add event listener for document upload
    const uploadBtn = document.getElementById('uploadDocBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', showUploadDocumentModal);
    }
}

function showUploadDocumentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>📤 Upload Document</h2>
            <form id="uploadDocForm">
                <div class="form-group">
                    <label>Document Type:</label>
                    <select id="docType" required>
                        <option value="ID">ID Card</option>
                        <option value="Contract">Work Contract</option>
                        <option value="Certificate">Certificate</option>
                        <option value="Medical">Medical Certificate</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Document Name:</label>
                    <input type="text" id="docName" required placeholder="e.g. ID Card Front">
                </div>
                <div class="form-group">
                    <label>Upload File (Image):</label>
                    <input type="file" id="docFile" accept="image/*" required>
                    <small>Supported: JPG, PNG, PDF (will be converted to image)</small>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Upload</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('uploadDocForm').addEventListener('submit', handleDocumentUpload);
}

function handleDocumentUpload(e) {
    e.preventDefault();
    
    const username = sessionStorage.getItem('username');
    const docType = document.getElementById('docType').value;
    const docName = document.getElementById('docName').value;
    const fileInput = document.getElementById('docFile');
    
    if (fileInput.files.length === 0) {
        alert('Please select a file');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const document = {
            id: Date.now(),
            username: username,
            type: docType,
            name: docName,
            fileName: file.name,
            fileData: event.target.result,
            uploadDate: new Date().toISOString(),
            size: file.size,
            status: 'pending'
        };
        
        // Save to localStorage
        let documents = JSON.parse(localStorage.getItem('documents') || '[]');
        documents.push(document);
        localStorage.setItem('documents', JSON.stringify(documents));
        
        alert('✅ Document uploaded successfully!');
        closeModal();
        loadDocuments();
    };
    
    reader.readAsDataURL(file);
}

function loadDocuments() {
    const username = sessionStorage.getItem('username');
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const userDocs = documents.filter(doc => doc.username === username);
    
    const container = document.getElementById('documentsContainer');
    if (!container) return;
    
    if (userDocs.length === 0) {
        container.innerHTML = '<p>No documents uploaded yet. Click "Upload Document" to add one.</p>';
        return;
    }
    
    container.innerHTML = userDocs.map(doc => `
        <div class="document-card">
            <div class="doc-icon">${getDocIcon(doc.type)}</div>
            <div class="doc-info">
                <h4>${doc.name}</h4>
                <p>Type: ${doc.type}</p>
                <p>Uploaded: ${new Date(doc.uploadDate).toLocaleDateString()}</p>
                <p>Status: <span class="status-badge ${doc.status}">${doc.status}</span></p>
            </div>
            <div class="doc-actions">
                <button onclick="viewDocument('${doc.id}')" class="btn-small">👁️ View</button>
                <button onclick="deleteDocument('${doc.id}')" class="btn-small btn-danger">🗑️</button>
            </div>
        </div>
    `).join('');
}

function getDocIcon(type) {
    const icons = {
        'ID': '🪪',
        'Contract': '📄',
        'Certificate': '📜',
        'Medical': '🏥',
        'Other': '📎'
    };
    return icons[type] || '📎';
}

function viewDocument(docId) {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const doc = documents.find(d => d.id == docId);
    
    if (!doc) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content large">
            <h2>📄 ${doc.name}</h2>
            <div class="document-viewer">
                <img src="${doc.fileData}" alt="${doc.name}" style="max-width: 100%; max-height: 70vh;">
            </div>
            <div class="modal-actions">
                <button onclick="downloadDocument('${doc.id}')" class="btn-primary">💾 Download</button>
                <button onclick="closeModal()" class="btn-secondary">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function downloadDocument(docId) {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const doc = documents.find(d => d.id == docId);
    
    if (!doc) return;
    
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName;
    link.click();
}

function deleteDocument(docId) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    let documents = JSON.parse(localStorage.getItem('documents') || '[]');
    documents = documents.filter(d => d.id != docId);
    localStorage.setItem('documents', JSON.stringify(documents));
    
    loadDocuments();
}

// ============================================
// TASK MANAGEMENT
// ============================================

function initializeTasks() {
    loadTasks();
}

function loadTasks() {
    const username = sessionStorage.getItem('username');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const userTasks = tasks.filter(task => task.assignedTo === username);
    
    const container = document.getElementById('tasksContainer');
    if (!container) return;
    
    if (userTasks.length === 0) {
        container.innerHTML = '<p>No tasks assigned yet.</p>';
        return;
    }
    
    // Group by status
    const pending = userTasks.filter(t => t.status === 'pending');
    const inProgress = userTasks.filter(t => t.status === 'in-progress');
    const completed = userTasks.filter(t => t.status === 'completed');
    
    container.innerHTML = `
        <div class="tasks-board">
            <div class="task-column">
                <h3>📋 Pending (${pending.length})</h3>
                ${pending.map(renderTaskCard).join('')}
            </div>
            <div class="task-column">
                <h3>🔄 In Progress (${inProgress.length})</h3>
                ${inProgress.map(renderTaskCard).join('')}
            </div>
            <div class="task-column">
                <h3>✅ Completed (${completed.length})</h3>
                ${completed.map(renderTaskCard).join('')}
            </div>
        </div>
    `;
}

function renderTaskCard(task) {
    return `
        <div class="task-card" data-task-id="${task.id}">
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <p><small>📍 ${task.location}</small></p>
            <p><small>📅 Due: ${new Date(task.dueDate).toLocaleDateString()}</small></p>
            <div class="task-actions">
                ${task.status !== 'completed' ? `
                    <button onclick="updateTaskStatus('${task.id}', '${getNextStatus(task.status)}')" class="btn-small">
                        ${getNextStatus(task.status) === 'in-progress' ? '▶️ Start' : '✅ Complete'}
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function getNextStatus(currentStatus) {
    if (currentStatus === 'pending') return 'in-progress';
    if (currentStatus === 'in-progress') return 'completed';
    return 'completed';
}

function updateTaskStatus(taskId, newStatus) {
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex(t => t.id == taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        if (newStatus === 'completed') {
            tasks[taskIndex].completedDate = new Date().toISOString();
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
    }
}

// ============================================
// EQUIPMENT MANAGEMENT
// ============================================

function initializeEquipment() {
    loadEquipment();
}

function loadEquipment() {
    const username = sessionStorage.getItem('username');
    const equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    const userEquipment = equipment.filter(eq => eq.assignedTo === username && eq.status === 'assigned');
    
    const container = document.getElementById('equipmentContainer');
    if (!container) return;
    
    if (userEquipment.length === 0) {
        container.innerHTML = '<p>No equipment assigned to you.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="equipment-grid">
            ${userEquipment.map(eq => `
                <div class="equipment-card">
                    <div class="eq-icon">🔧</div>
                    <h4>${eq.name}</h4>
                    <p>ID: ${eq.id}</p>
                    <p>Condition: <span class="badge ${eq.condition}">${eq.condition}</span></p>
                    <p>Assigned: ${new Date(eq.assignedDate).toLocaleDateString()}</p>
                    <button onclick="reportEquipmentIssue('${eq.id}')" class="btn-small">⚠️ Report Issue</button>
                </div>
            `).join('')}
        </div>
    `;
}

function reportEquipmentIssue(equipmentId) {
    const issue = prompt('Describe the issue with this equipment:');
    if (!issue) return;
    
    let equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    const eqIndex = equipment.findIndex(e => e.id == equipmentId);
    
    if (eqIndex !== -1) {
        equipment[eqIndex].issues = equipment[eqIndex].issues || [];
        equipment[eqIndex].issues.push({
            date: new Date().toISOString(),
            description: issue,
            reportedBy: sessionStorage.getItem('username')
        });
        localStorage.setItem('equipment', JSON.stringify(equipment));
        alert('✅ Issue reported successfully!');
    }
}

// ============================================
// LEAVE REQUESTS
// ============================================

function initializeRequests() {
    loadRequests();
    
    const newRequestBtn = document.getElementById('newRequestBtn');
    if (newRequestBtn) {
        newRequestBtn.addEventListener('click', showNewRequestModal);
    }
}

function showNewRequestModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>📝 New Leave Request</h2>
            <form id="newRequestForm">
                <div class="form-group">
                    <label>Request Type:</label>
                    <select id="requestType" required>
                        <option value="vacation">Vacation Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="personal">Personal Leave</option>
                        <option value="unpaid">Unpaid Leave</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Start Date:</label>
                    <input type="date" id="startDate" required>
                </div>
                <div class="form-group">
                    <label>End Date:</label>
                    <input type="date" id="endDate" required>
                </div>
                <div class="form-group">
                    <label>Reason:</label>
                    <textarea id="requestReason" rows="4" required placeholder="Please explain..."></textarea>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Submit Request</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('newRequestForm').addEventListener('submit', handleNewRequest);
}

function handleNewRequest(e) {
    e.preventDefault();
    
    const request = {
        id: Date.now(),
        username: sessionStorage.getItem('username'),
        fullName: sessionStorage.getItem('userFullName'),
        type: document.getElementById('requestType').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        reason: document.getElementById('requestReason').value,
        status: 'pending',
        submittedDate: new Date().toISOString()
    };
    
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');
    requests.push(request);
    localStorage.setItem('requests', JSON.stringify(requests));
    
    alert('✅ Request submitted successfully!');
    closeModal();
    loadRequests();
}

function loadRequests() {
    const username = sessionStorage.getItem('username');
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const userRequests = requests.filter(req => req.username === username);
    
    const container = document.getElementById('requestsContainer');
    if (!container) return;
    
    if (userRequests.length === 0) {
        container.innerHTML = '<p>No requests submitted yet. Click "New Request" to create one.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="requests-list">
            ${userRequests.map(req => `
                <div class="request-card ${req.status}">
                    <div class="request-header">
                        <h4>${getRequestTypeLabel(req.type)}</h4>
                        <span class="status-badge ${req.status}">${req.status}</span>
                    </div>
                    <p>📅 ${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}</p>
                    <p>Reason: ${req.reason}</p>
                    <p><small>Submitted: ${new Date(req.submittedDate).toLocaleDateString()}</small></p>
                    ${req.adminComment ? `<p class="admin-comment">💬 Admin: ${req.adminComment}</p>` : ''}
                </div>
            `).join('')}
        </div>
    `;
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
// SALARY & PAYROLL
// ============================================

function initializeSalary() {
    loadSalaryInfo();
}

function loadSalaryInfo() {
    const username = sessionStorage.getItem('username');
    const payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    const userPayroll = payroll.filter(p => p.username === username);
    
    const container = document.getElementById('salaryContainer');
    if (!container) return;
    
    // Calculate current month stats
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    // Get attendance for current month
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const monthAttendance = allAttendance.filter(att => 
        att.username === username && 
        att.date.startsWith(currentMonth) &&
        att.status === 'completed'
    );
    
    const totalHours = monthAttendance.reduce((sum, att) => sum + (parseFloat(att.totalHours) || 0), 0);
    const hourlyRate = 25; // MDL per hour
    const estimatedSalary = (totalHours * hourlyRate).toFixed(2);
    
    container.innerHTML = `
        <div class="salary-overview">
            <div class="salary-card">
                <h3>💰 Current Month</h3>
                <p class="big-number">${estimatedSalary} MDL</p>
                <p>Hours Worked: ${totalHours.toFixed(2)}h</p>
                <p>Hourly Rate: ${hourlyRate} MDL</p>
            </div>
        </div>
        
        <h3>📊 Payment History</h3>
        <div class="payroll-history">
            ${userPayroll.length === 0 ? '<p>No payment history yet.</p>' : 
                userPayroll.map(pay => `
                    <div class="payroll-card">
                        <h4>${pay.month}</h4>
                        <p>Gross: ${pay.grossPay} MDL</p>
                        <p>Deductions: ${pay.deductions} MDL</p>
                        <p>Net Pay: <strong>${pay.netPay} MDL</strong></p>
                        <p>Status: <span class="status-badge ${pay.status}">${pay.status}</span></p>
                        <button onclick="downloadPayslip('${pay.id}')" class="btn-small">📥 Download Payslip</button>
                    </div>
                `).join('')
            }
        </div>
    `;
}

function downloadPayslip(payId) {
    const payroll = JSON.parse(localStorage.getItem('payroll') || '[]');
    const pay = payroll.find(p => p.id == payId);
    
    if (!pay) return;
    
    // Generate a simple text payslip
    const payslip = `
========================================
        OHRIM CONSTRUCT
    PAYSLIP - ${pay.month}
========================================

Employee: ${pay.fullName}
Employee ID: ${pay.username}

Gross Pay: ${pay.grossPay} MDL
Deductions: ${pay.deductions} MDL
----------------------------
NET PAY: ${pay.netPay} MDL
========================================
Payment Date: ${new Date(pay.paymentDate).toLocaleDateString()}
Status: ${pay.status}

Thank you for your hard work!
========================================
    `;
    
    const blob = new Blob([payslip], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payslip_${pay.month}_${pay.username}.txt`;
    link.click();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.remove());
}

// Initialize all features when section changes
document.addEventListener('DOMContentLoaded', function() {
    // Listen for section changes
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            setTimeout(() => {
                if (section === 'documents') initializeDocuments();
                if (section === 'tasks') initializeTasks();
                if (section === 'equipment') initializeEquipment();
                if (section === 'requests') initializeRequests();
                if (section === 'salary') initializeSalary();
            }, 100);
        });
    });
});
