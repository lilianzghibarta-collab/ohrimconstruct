// Site Management System for OHR BUILD

// Load all sites on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard-admin')) {
        loadSites();
    }
    if (window.location.pathname.includes('dashboard-worker')) {
        loadWorkerAssignedSite();
    }
});

// ==================== LOCATION PICKER FUNCTIONS ====================

let mapPickerInstance = null;
let mapMarker = null;

function toggleMapPicker() {
    const container = document.getElementById('mapPickerContainer');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        
        // Initialize map if not already initialized
        if (!mapPickerInstance) {
            setTimeout(() => {
                initializeMapPicker();
            }, 100);
        }
    } else {
        container.style.display = 'none';
    }
}

function closeMapPicker() {
    document.getElementById('mapPickerContainer').style.display = 'none';
}

function initializeMapPicker() {
    const mapDiv = document.getElementById('mapPicker');
    
    if (!mapDiv || mapPickerInstance) return;
    
    // Default to Dublin, Ireland
    const defaultLat = 53.3498;
    const defaultLng = -6.2603;
    
    // Initialize map
    mapPickerInstance = L.map('mapPicker').setView([defaultLat, defaultLng], 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(mapPickerInstance);
    
    // Try to center on user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                mapPickerInstance.setView([lat, lng], 15);
            },
            () => {
                // Ignore errors, keep default location
            }
        );
    }
    
    // Add click event to map
    mapPickerInstance.on('click', async function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        // Remove existing marker
        if (mapMarker) {
            mapPickerInstance.removeLayer(mapMarker);
        }
        
        // Add new marker
        mapMarker = L.marker([lat, lng]).addTo(mapPickerInstance);
        
        // Get address using reverse geocoding
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
            const data = await response.json();
            
            let address = '';
            if (data && data.display_name) {
                address = data.display_name;
            } else {
                address = `Lat: ${lat.toFixed(6)}, Lon: ${lng.toFixed(6)}`;
            }
            
            // Update selected location display
            document.getElementById('selectedLocation').textContent = address;
            
            // Update address input
            document.getElementById('siteAddress').value = address;
            
        } catch (error) {
            const coords = `Lat: ${lat.toFixed(6)}, Lon: ${lng.toFixed(6)}`;
            document.getElementById('selectedLocation').textContent = coords;
            document.getElementById('siteAddress').value = coords;
        }
    });
}

function useCurrentLocation() {
    if (!navigator.geolocation) {
        alert('❌ Geolocation is not supported by your browser');
        return;
    }
    
    const addressInput = document.getElementById('siteAddress');
    addressInput.value = 'Loading location...';
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Use reverse geocoding to get address
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
                const data = await response.json();
                
                if (data && data.display_name) {
                    addressInput.value = data.display_name;
                } else {
                    addressInput.value = `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`;
                }
            } catch (error) {
                // Fallback to coordinates if geocoding fails
                addressInput.value = `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`;
            }
        },
        (error) => {
            addressInput.value = '';
            alert('❌ Cannot get location: ' + error.message + '\n\nPlease allow location access or enter address manually.');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

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
                <button class="btn-small" onclick="viewSiteOnMap('${site.id}')">🗺️ View Map</button>
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
    const address = document.getElementById('siteAddress').value;
    
    // Extract coordinates from address if it contains "Lat:" and "Lon:"
    let coordinates = null;
    const latMatch = address.match(/Lat:\s*([-\d.]+)/i);
    const lonMatch = address.match(/Lon:\s*([-\d.]+)/i);
    
    if (latMatch && lonMatch) {
        coordinates = {
            latitude: parseFloat(latMatch[1]),
            longitude: parseFloat(lonMatch[1])
        };
    }
    
    const siteData = {
        id: siteId || Date.now().toString(),
        name: document.getElementById('siteName').value,
        address: address,
        coordinates: coordinates,
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
    
    // Also update allSites for compatibility
    const allSites = JSON.parse(localStorage.getItem('allSites') || '[]');
    const allSiteIndex = allSites.findIndex(s => s.id === siteData.id);
    
    if (allSiteIndex !== -1) {
        allSites[allSiteIndex] = {
            id: siteData.id,
            name: siteData.name,
            address: siteData.address,
            coordinates: siteData.coordinates,
            status: siteData.status
        };
    } else {
        allSites.push({
            id: siteData.id,
            name: siteData.name,
            address: siteData.address,
            coordinates: siteData.coordinates,
            status: siteData.status
        });
    }
    
    localStorage.setItem('allSites', JSON.stringify(allSites));
    
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

function viewSiteOnMap(siteId) {
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    const site = sites.find(s => s.id === siteId);
    
    if (!site) {
        alert('Site not found');
        return;
    }
    
    let googleMapsUrl;
    
    // Check if site has coordinates
    if (site.coordinates && site.coordinates.latitude && site.coordinates.longitude) {
        // Use exact coordinates
        const lat = site.coordinates.latitude;
        const lng = site.coordinates.longitude;
        googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else {
        // Fallback to address search
        const encodedAddress = encodeURIComponent(site.address);
        googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    }
    
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
    const address = window.currentSiteAddress || 'Construction Site, Dublin 1, Ireland';
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
