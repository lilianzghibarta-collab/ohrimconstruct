// Site Management System for OHRIM CONSTRUCT

// Load all sites on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard-admin')) {
        loadSites();
    }
    if (window.location.pathname.includes('dashboard-worker')) {
        loadWorkerAssignedSite();
    }
});

// ==================== SITE CRUD OPERATIONS ====================

function loadSites() {
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    const container = document.getElementById('sitesContainer');
    
    if (!container) return;
    
    if (sites.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #fcd787; padding: 40px;">No sites added yet. Click "Add New Site" to create one.</p>';
        return;
    }
    
    container.innerHTML = sites.map(site => `
        <div class="site-card ${site.status}">
            <div class="site-header">
                <h4>${site.name}</h4>
                <span class="site-status ${site.status}">
                    ${site.status === 'active' ? '🟢 Active' : site.status === 'completed' ? '🔴 Completed' : '⏸️ Paused'}
                </span>
            </div>
            <p>📍 ${site.address}</p>
            ${site.manager ? `<p>👨‍💼 Manager: ${site.manager}</p>` : ''}
            ${site.phone ? `<p>📞 ${site.phone}</p>` : ''}
            ${site.schedule ? `<p>⏰ ${site.schedule}</p>` : ''}
            ${site.startDate ? `<p>📅 Start: ${new Date(site.startDate).toLocaleDateString()}</p>` : ''}
            <div class="site-actions">
                <button class="btn-small" onclick="editSite('${site.id}')">✏️ Edit</button>
                <button class="btn-small" onclick="deleteSite('${site.id}')">🗑️ Delete</button>
                <button class="btn-small" onclick="viewSiteOnMap('${site.address}')">🗺️ View Map</button>
            </div>
        </div>
    `).join('');
}

function showAddSiteModal() {
    document.getElementById('siteModal').style.display = 'block';
    document.getElementById('siteModalTitle').textContent = '➕ Add New Site';
    document.getElementById('siteForm').reset();
    document.getElementById('siteId').value = '';
}

function closeSiteModal() {
    document.getElementById('siteModal').style.display = 'none';
}

function saveSite(event) {
    event.preventDefault();
    
    const siteId = document.getElementById('siteId').value;
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    
    const siteData = {
        id: siteId || Date.now().toString(),
        name: document.getElementById('siteName').value,
        address: document.getElementById('siteAddress').value,
        manager: document.getElementById('siteManager').value,
        phone: document.getElementById('sitePhone').value,
        schedule: document.getElementById('siteSchedule').value,
        startDate: document.getElementById('siteStartDate').value,
        status: document.getElementById('siteStatus').value,
        createdAt: siteId ? sites.find(s => s.id === siteId)?.createdAt : new Date().toISOString()
    };
    
    if (siteId) {
        // Update existing site
        const index = sites.findIndex(s => s.id === siteId);
        if (index !== -1) {
            sites[index] = siteData;
        }
    } else {
        // Add new site
        sites.push(siteData);
    }
    
    localStorage.setItem('sites', JSON.stringify(sites));
    closeSiteModal();
    loadSites();
    alert('✅ Site saved successfully!');
}

function editSite(siteId) {
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    const site = sites.find(s => s.id === siteId);
    
    if (!site) return;
    
    document.getElementById('siteModalTitle').textContent = '✏️ Edit Site';
    document.getElementById('siteId').value = site.id;
    document.getElementById('siteName').value = site.name;
    document.getElementById('siteAddress').value = site.address;
    document.getElementById('siteManager').value = site.manager || '';
    document.getElementById('sitePhone').value = site.phone || '';
    document.getElementById('siteSchedule').value = site.schedule || '';
    document.getElementById('siteStartDate').value = site.startDate || '';
    document.getElementById('siteStatus').value = site.status;
    
    document.getElementById('siteModal').style.display = 'block';
}

function deleteSite(siteId) {
    if (!confirm('Are you sure you want to delete this site?')) return;
    
    let sites = JSON.parse(localStorage.getItem('sites') || '[]');
    sites = sites.filter(s => s.id !== siteId);
    
    // Remove assignments for this site
    let assignments = JSON.parse(localStorage.getItem('workerSiteAssignments') || '[]');
    assignments = assignments.filter(a => a.siteId !== siteId);
    localStorage.setItem('workerSiteAssignments', JSON.stringify(assignments));
    
    localStorage.setItem('sites', JSON.stringify(sites));
    loadSites();
    alert('🗑️ Site deleted successfully!');
}

function viewSiteOnMap(address) {
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
}

// ==================== WORKER-SITE ASSIGNMENT ====================

function showAssignModal() {
    const modal = document.getElementById('assignWorkerModal');
    modal.style.display = 'block';
    
    // Load workers
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const workerSelect = document.getElementById('assignWorkerSelect');
    workerSelect.innerHTML = '<option value="">-- Select Worker --</option>' +
        workers.map(w => `<option value="${w.username}">${w.fullName || w.username}</option>`).join('');
    
    // Load sites
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    const siteSelect = document.getElementById('assignSiteSelect');
    siteSelect.innerHTML = '<option value="">-- Select Site --</option>' +
        sites.filter(s => s.status === 'active').map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function closeAssignModal() {
    document.getElementById('assignWorkerModal').style.display = 'none';
}

function assignWorkerToSite(event) {
    event.preventDefault();
    
    const username = document.getElementById('assignWorkerSelect').value;
    const siteId = document.getElementById('assignSiteSelect').value;
    
    if (!username || !siteId) {
        alert('❌ Please select both worker and site');
        return;
    }
    
    const assignments = JSON.parse(localStorage.getItem('workerSiteAssignments') || '[]');
    
    // Check if worker already assigned
    const existingIndex = assignments.findIndex(a => a.username === username);
    
    const assignment = {
        username: username,
        siteId: siteId,
        assignedAt: new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
        // Update existing assignment
        assignments[existingIndex] = assignment;
    } else {
        // Add new assignment
        assignments.push(assignment);
    }
    
    localStorage.setItem('workerSiteAssignments', JSON.stringify(assignments));
    closeAssignModal();
    
    const worker = JSON.parse(localStorage.getItem('workers') || '[]').find(w => w.username === username);
    const site = JSON.parse(localStorage.getItem('sites') || '[]').find(s => s.id === siteId);
    
    alert(`✅ ${worker.fullName || username} assigned to ${site.name}!`);
}

// ==================== WORKER DASHBOARD INTEGRATION ====================

function loadWorkerAssignedSite() {
    const username = sessionStorage.getItem('username');
    if (!username) return;
    
    const assignments = JSON.parse(localStorage.getItem('workerSiteAssignments') || '[]');
    const assignment = assignments.find(a => a.username === username);
    
    if (!assignment) {
        // No site assigned - show default message
        return;
    }
    
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    const site = sites.find(s => s.id === assignment.siteId);
    
    if (!site) return;
    
    // Update location card with assigned site
    const locationCard = document.querySelector('.location-card');
    if (locationCard) {
        locationCard.innerHTML = `
            <h4>${site.name}</h4>
            <p>📍 ${site.address}</p>
            ${site.manager ? `<p>👷 Site Manager: ${site.manager}</p>` : ''}
            ${site.phone ? `<p>📞 Phone: ${site.phone}</p>` : ''}
            ${site.schedule ? `<p>⏰ Schedule: ${site.schedule}</p>` : ''}
            <button class="btn-primary" onclick="openWorkerGoogleMaps()">🗺️ Open in Maps</button>
        `;
    }
    
    // Store site address for maps function
    window.currentSiteAddress = site.address;
    
    // Update site history
    loadWorkerSiteHistory(username);
}

function loadWorkerSiteHistory(username) {
    const assignments = JSON.parse(localStorage.getItem('workerSiteAssignments') || '[]');
    const userAssignments = assignments.filter(a => a.username === username);
    
    if (userAssignments.length === 0) return;
    
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    const historyList = document.querySelector('.location-history .location-list');
    
    if (!historyList) return;
    
    historyList.innerHTML = userAssignments.map(assignment => {
        const site = sites.find(s => s.id === assignment.siteId);
        if (!site) return '';
        
        const assignedDate = new Date(assignment.assignedAt).toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
        
        return `
            <li>
                <strong>${site.name}</strong>
                <span>${assignedDate} - ${site.status === 'active' ? 'Present' : 'Ended'}</span>
            </li>
        `;
    }).join('');
}

function openWorkerGoogleMaps() {
    const address = window.currentSiteAddress || 'Constructorilor St. 45, Chișinău, Moldova';
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
