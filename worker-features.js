// Enhanced Worker Dashboard Features

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

function initializeDocuments() {
    loadDocuments();
    loadBankDetails();
    
    // Add event listener for document upload
    const uploadBtn = document.getElementById('uploadDocBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', showUploadDocumentModal);
    }
    
    // Add event listener for bank details
    const bankDetailsBtn = document.getElementById('addBankDetailsBtn');
    if (bankDetailsBtn) {
        bankDetailsBtn.addEventListener('click', showBankDetailsModal);
    }
}

// ============================================
// BANK DETAILS MANAGEMENT
// ============================================

function loadBankDetails() {
    const username = sessionStorage.getItem('username');
    const bankDetails = JSON.parse(localStorage.getItem(`bankDetails_${username}`) || 'null');
    const displayDiv = document.getElementById('bankDetailsDisplay');
    
    if (!displayDiv) return;
    
    if (bankDetails) {
        displayDiv.innerHTML = `
            <div style="background: #2a2a2a; border-radius: 8px; padding: 15px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; color: #fcd787;">
                    <div>
                        <strong style="color: #eaa350;">Bank Name:</strong><br>
                        ${bankDetails.bankName}
                    </div>
                    <div>
                        <strong style="color: #eaa350;">Account Holder:</strong><br>
                        ${bankDetails.accountHolder}
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <strong style="color: #eaa350;">IBAN:</strong><br>
                        ${bankDetails.iban}
                    </div>
                    ${bankDetails.swift ? `
                        <div>
                            <strong style="color: #eaa350;">SWIFT/BIC:</strong><br>
                            ${bankDetails.swift}
                        </div>
                    ` : ''}
                    <div style="grid-column: 1 / -1;">
                        <small style="color: #999;">Submitted: ${new Date(bankDetails.submittedAt).toLocaleDateString()}</small>
                        ${bankDetails.approvedByAdmin ? '<br><span style="color: #28a745;">✅ Verified by Admin</span>' : '<br><span style="color: #ffc107;">⏳ Pending verification</span>'}
                    </div>
                </div>
            </div>
        `;
    } else {
        displayDiv.innerHTML = `
            <p style="color: #fcd787;">No bank details provided yet. Please add your bank account information to receive salary payments.</p>
        `;
    }
}

function showBankDetailsModal() {
    const username = sessionStorage.getItem('username');
    const existingDetails = JSON.parse(localStorage.getItem(`bankDetails_${username}`) || 'null');
    
    const modal = document.createElement('div');
    modal.id = 'bankDetailsModal';
    modal.innerHTML = `
        <div class="modal-overlay" style="background: rgba(0,0,0,0.9);">
            <div class="modal-content" style="max-width: 600px; background: #1a1a1a; border: 3px solid #eaa350;">
                <h2 style="color: #fcd787; text-align: center; margin-bottom: 20px;">💳 Bank Account Details</h2>
                <p style="color: #fcd787; text-align: center; margin-bottom: 30px;">Enter your bank account information to receive salary payments</p>
                
                <form id="bankDetailsForm">
                    <div style="margin-bottom: 20px;">
                        <label style="color: #fcd787; display: block; margin-bottom: 10px; font-weight: 600;">Bank Name: *</label>
                        <input type="text" id="bankName" required value="${existingDetails?.bankName || ''}" placeholder="e.g., AIB (Allied Irish Banks)" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #eaa350;
                            border-radius: 8px;
                            background: #2a2a2a;
                            color: #fcd787;
                            font-size: 1em;
                        ">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="color: #fcd787; display: block; margin-bottom: 10px; font-weight: 600;">Account Holder Name: *</label>
                        <input type="text" id="accountHolder" required value="${existingDetails?.accountHolder || ''}" placeholder="Full name as on bank account" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #eaa350;
                            border-radius: 8px;
                            background: #2a2a2a;
                            color: #fcd787;
                            font-size: 1em;
                        ">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="color: #fcd787; display: block; margin-bottom: 10px; font-weight: 600;">IBAN: *</label>
                        <input type="text" id="iban" required value="${existingDetails?.iban || ''}" placeholder="IE29 AIBK 9311 5212 3456 78" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #eaa350;
                            border-radius: 8px;
                            background: #2a2a2a;
                            color: #fcd787;
                            font-size: 1em;
                            text-transform: uppercase;
                        ">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="color: #fcd787; display: block; margin-bottom: 10px; font-weight: 600;">SWIFT/BIC Code: (optional)</label>
                        <input type="text" id="swift" value="${existingDetails?.swift || ''}" placeholder="e.g., BTRLRO22" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #eaa350;
                            border-radius: 8px;
                            background: #2a2a2a;
                            color: #fcd787;
                            font-size: 1em;
                            text-transform: uppercase;
                        ">
                    </div>
                    
                    <div style="background: #2a2a2a; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                        <p style="color: #fcd787; margin: 0; font-size: 0.9em;">
                            ⚠️ <strong>Important:</strong> Please verify all information carefully. These details will be used for salary payments.
                        </p>
                    </div>
                    
                    <div style="display: flex; gap: 15px;">
                        <button type="submit" class="btn-primary" style="flex: 1; padding: 15px; font-size: 1.1em;">💾 Save Bank Details</button>
                        <button type="button" onclick="closeBankDetailsModal()" class="btn-secondary" style="flex: 1; padding: 15px; font-size: 1.1em;">❌ Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('bankDetailsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveBankDetails();
    });
}

function saveBankDetails() {
    const username = sessionStorage.getItem('username');
    const fullName = sessionStorage.getItem('userFullName') || username;
    
    const bankDetails = {
        username: username,
        fullName: fullName,
        bankName: document.getElementById('bankName').value.trim(),
        accountHolder: document.getElementById('accountHolder').value.trim(),
        iban: document.getElementById('iban').value.trim().toUpperCase(),
        swift: document.getElementById('swift').value.trim().toUpperCase(),
        submittedAt: new Date().toISOString(),
        approvedByAdmin: false
    };
    
    // Validate IBAN format (basic check)
    if (bankDetails.iban.length < 15) {
        alert('❌ Invalid IBAN format. Please check and try again.');
        return;
    }
    
    // Save to worker's localStorage
    localStorage.setItem(`bankDetails_${username}`, JSON.stringify(bankDetails));
    
    // Save to global bank details for admin access
    let allBankDetails = JSON.parse(localStorage.getItem('allBankDetails') || '[]');
    const existingIndex = allBankDetails.findIndex(bd => bd.username === username);
    
    if (existingIndex !== -1) {
        allBankDetails[existingIndex] = bankDetails;
    } else {
        allBankDetails.push(bankDetails);
    }
    
    localStorage.setItem('allBankDetails', JSON.stringify(allBankDetails));
    
    // Close modal
    closeBankDetailsModal();
    
    // Reload display
    loadBankDetails();
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a1a;
            border: 3px solid #28a745;
            border-radius: 15px;
            padding: 40px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 10px 50px rgba(40, 167, 69, 0.5);
            z-index: 10001;
        ">
            <h2 style="color: #28a745; margin-bottom: 20px; font-size: 2em;">✅ Bank Details Saved</h2>
            <p style="color: #fcd787; font-size: 1.2em; line-height: 1.6;">Your bank account information has been submitted to admin for verification.</p>
        </div>
    `;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.remove();
    }, 3000);
}

function closeBankDetailsModal() {
    const modal = document.getElementById('bankDetailsModal');
    if (modal) {
        modal.remove();
    }
}

// ============================================
// DOCUMENT UPLOAD
// ============================================


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
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('❌ File size must be less than 10MB');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        // Get existing documents for this user
        let documents = JSON.parse(localStorage.getItem(`documents_${username}`) || '[]');
        
        const newDocument = {
            id: Date.now().toString(),
            type: docType,
            name: docName,
            notes: '', // Can be added later if needed
            fileName: file.name,
            fileType: file.type,
            size: file.size,
            data: event.target.result,
            uploadedAt: new Date().toISOString(),
            uploadedBy: username
        };
        
        // Add to documents array
        documents.push(newDocument);
        
        // Save back to localStorage with username-specific key
        localStorage.setItem(`documents_${username}`, JSON.stringify(documents));
        
        alert('✅ Document uploaded successfully!');
        closeModal();
        loadDocuments();
    };
    
    reader.readAsDataURL(file);
}

function loadDocuments() {
    const username = sessionStorage.getItem('username');
    const documents = JSON.parse(localStorage.getItem(`documents_${username}`) || '[]');
    
    const container = document.getElementById('documentsContainer');
    if (!container) return;
    
    if (documents.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #2a2a2a; border-radius: 10px; border: 2px dashed #eaa350;">
                <p style="color: #999; font-size: 1.1em; margin: 0;">📭 No documents uploaded yet</p>
                <p style="color: #999; font-size: 0.9em; margin: 10px 0 0 0;">Click "📤 Upload Document" to add your first document</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = documents.map(doc => `
        <div class="document-card" style="background: #2a2a2a; border-radius: 10px; padding: 20px; border: 2px solid #eaa350;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div class="doc-icon" style="font-size: 3em; margin-right: 15px;">${getDocIcon(doc.type)}</div>
                <div class="doc-info" style="flex: 1;">
                    <h4 style="color: #fcd787; margin: 0 0 5px 0;">${doc.name}</h4>
                    <p style="color: #999; margin: 3px 0; font-size: 0.9em;">Type: ${doc.type}</p>
                    <p style="color: #999; margin: 3px 0; font-size: 0.9em;">📅 Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()} at ${new Date(doc.uploadedAt).toLocaleTimeString()}</p>
                    <p style="color: #999; margin: 3px 0; font-size: 0.9em;">📦 Size: ${(doc.size / 1024).toFixed(1)} KB</p>
                </div>
            </div>
            <div class="doc-actions" style="display: flex; gap: 10px;">
                <button onclick="viewWorkerDocument('${doc.id}')" class="btn-small" style="flex: 1; padding: 10px;">👁️ View</button>
                <button onclick="downloadWorkerDocument('${doc.id}')" class="btn-small" style="flex: 1; padding: 10px;">⬇️ Download</button>
                <button onclick="deleteWorkerDocument('${doc.id}')" class="btn-small" style="background: #dc3545; padding: 10px;">🗑️ Delete</button>
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
        'Photo': '📸',
        'Other': '📎'
    };
    return icons[type] || '📎';
}

function viewWorkerDocument(docId) {
    const username = sessionStorage.getItem('username');
    const documents = JSON.parse(localStorage.getItem(`documents_${username}`) || '[]');
    const doc = documents.find(d => d.id === docId);
    
    if (!doc) {
        alert('❌ Document not found');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content large" style="max-width: 90vw; max-height: 90vh;">
            <h2 style="color: #fcd787;">📄 ${doc.name}</h2>
            <div class="document-viewer" style="margin: 20px 0; text-align: center; max-height: 70vh; overflow: auto;">
                ${doc.fileType && doc.fileType.includes('image') ? 
                    `<img src="${doc.data}" alt="${doc.name}" style="max-width: 100%; max-height: 70vh; border-radius: 8px; box-shadow: 0 4px 20px rgba(234, 163, 80, 0.3);">` :
                    doc.fileType && doc.fileType.includes('pdf') ?
                    `<iframe src="${doc.data}" style="width: 100%; height: 70vh; border: 2px solid #eaa350; border-radius: 8px;"></iframe>` :
                    `<div style="padding: 50px; color: #fcd787;">
                        <p style="font-size: 3em;">📄</p>
                        <p>Preview not available for this file type</p>
                        <p><strong>${doc.fileName}</strong></p>
                        <p>Size: ${(doc.size / 1024).toFixed(1)} KB</p>
                    </div>`
                }
            </div>
            <div class="modal-actions">
                <button onclick="downloadWorkerDocument('${doc.id}')" class="btn-primary">⬇️ Download</button>
                <button onclick="closeModal()" class="btn-secondary">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function downloadWorkerDocument(docId) {
    const username = sessionStorage.getItem('username');
    const documents = JSON.parse(localStorage.getItem(`documents_${username}`) || '[]');
    const doc = documents.find(d => d.id === docId);
    
    if (!doc) {
        alert('❌ Document not found');
        return;
    }
    
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.fileName || `${doc.type}_${doc.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Downloading: ${doc.name}`);
}

function deleteWorkerDocument(docId) {
    const username = sessionStorage.getItem('username');
    
    if (!confirm('🗑️ Delete this document?\n\nThis action cannot be undone.')) {
        return;
    }
    
    let documents = JSON.parse(localStorage.getItem(`documents_${username}`) || '[]');
    documents = documents.filter(d => d.id !== docId);
    localStorage.setItem(`documents_${username}`, JSON.stringify(documents));
    
    alert('✅ Document deleted successfully!');
    loadDocuments();
}

// Keep old functions for backward compatibility
function viewDocument(docId) {
    viewWorkerDocument(docId);
}

function downloadDocument(docId) {
    downloadWorkerDocument(docId);
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
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">📋 No tasks assigned to you yet.<br>Check back later for new assignments.</p>';
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
    const priorityIcons = {
        'high': '🔴',
        'medium': '🟡',
        'low': '🟢'
    };
    
    return `
        <div class="task-card" data-task-id="${task.id}">
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <p><small>📍 ${task.location || 'Location not specified'}</small></p>
            <p><small>📅 Due: ${new Date(task.dueDate).toLocaleDateString('ro-RO')}</small></p>
            <p><small>${priorityIcons[task.priority] || '⚪'} Priority: ${task.priority || 'medium'}</small></p>
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
    const userEquipment = equipment.filter(eq => eq.assignedTo === username && eq.status === 'in-use');
    
    const container = document.getElementById('equipmentContainer');
    if (!container) return;
    
    if (userEquipment.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No equipment assigned to you yet.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="equipment-grid">
            ${userEquipment.map(eq => `
                <div class="equipment-card">
                    <div class="eq-icon">🔧</div>
                    <h4>${eq.name}</h4>
                    <p><strong>ID:</strong> ${eq.id}</p>
                    <p><strong>Category:</strong> ${eq.category}</p>
                    <p><strong>Location:</strong> ${eq.location || 'N/A'}</p>
                    <p><strong>Assigned:</strong> ${new Date(eq.assignedAt || Date.now()).toLocaleDateString('ro-RO')}</p>
                    ${eq.notes ? `<p style="color: #999; font-size: 0.9em;">${eq.notes}</p>` : ''}
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
    
    // Helper function to get current week
    function getCurrentWeek() {
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        return `${today.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
    }

    function isDateInWeek(dateString, weekString) {
        const date = new Date(dateString);
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        const dateWeek = `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
        return dateWeek === weekString;
    }

    // Calculate current week stats
    const currentWeek = getCurrentWeek();
    
    // Get attendance for current week
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const weekAttendance = allAttendance.filter(att => 
        att.username === username && 
        isDateInWeek(att.date, currentWeek) &&
        att.status === 'completed'
    );
    
    const totalHours = weekAttendance.reduce((sum, att) => sum + (parseFloat(att.totalHours) || 0), 0);
    const hourlyRate = 25; // EUR per hour (not MDL/lei)
    const grossSalary = totalHours * hourlyRate;
    const taxes = grossSalary * 0.20; // 20% taxes
    const netSalary = grossSalary - taxes;
    
    container.innerHTML = `
        <div class="salary-overview">
            <div class="salary-card">
                <h3 class="gold-title">💰 Estimated Weekly Salary</h3>
                <div style="background: #2a2a2a; border: 2px solid #eaa350; border-radius: 10px; padding: 20px; margin: 20px 0;">
                    <p style="color: #fcd787; margin: 10px 0; font-size: 1.1em;">Hours Worked: <strong>${totalHours.toFixed(2)}h</strong></p>
                    <p style="color: #fcd787; margin: 10px 0; font-size: 1.1em;">Hourly Rate: <strong>${hourlyRate} EUR/h</strong></p>
                    <hr style="border: 1px solid #eaa350; margin: 15px 0;">
                    <p style="color: #fcd787; margin: 10px 0; font-size: 1.2em;">💵 Gross Salary: <strong>${grossSalary.toFixed(2)} EUR</strong></p>
                    <p style="color: #dc3545; margin: 10px 0; font-size: 1.1em;">📉 Taxes (20%): <strong>-${taxes.toFixed(2)} EUR</strong></p>
                    <hr style="border: 1px solid #eaa350; margin: 15px 0;">
                    <p style="color: #28a745; margin: 10px 0; font-size: 1.4em; font-weight: 700;">💰 Net Salary: <strong>${netSalary.toFixed(2)} EUR</strong></p>
                </div>
            </div>
        </div>
        
        <h3 class="gold-title">📊 Payment History</h3>
        <div class="payroll-history">
            ${userPayroll.length === 0 ? '<p>No payment history yet.</p>' : 
                userPayroll.map(pay => `
                    <div class="payroll-card">
                        <h4>${pay.week || pay.month}</h4>
                        ${pay.weekStart && pay.weekEnd ? `<p style="color: #fcd787; font-size: 0.9em;">📅 ${new Date(pay.weekStart).toLocaleDateString()} - ${new Date(pay.weekEnd).toLocaleDateString()}</p>` : ''}
                        <p>Gross: ${pay.grossPay} EUR</p>
                        <p>Deductions: ${pay.deductions} EUR</p>
                        <p>Net Pay: <strong>${pay.netPay} EUR</strong></p>
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
    const weekDisplay = pay.week || pay.month;
    const periodDisplay = pay.weekStart && pay.weekEnd 
        ? `\nPeriod: ${new Date(pay.weekStart).toLocaleDateString()} - ${new Date(pay.weekEnd).toLocaleDateString()}`
        : '';
    const payslip = `
========================================
        OHR BUILD
    PAYSLIP - ${weekDisplay}
========================================
${periodDisplay}

Employee: ${pay.fullName}
Employee ID: ${pay.username}

Gross Pay: ${pay.grossPay} EUR
Deductions: ${pay.deductions} EUR
----------------------------
NET PAY: ${pay.netPay} EUR
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
    link.download = `payslip_${pay.week || pay.month}_${pay.username}.txt`;
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
