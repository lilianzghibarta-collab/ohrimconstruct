// Dashboard Admin Logic

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (sessionStorage.getItem('loggedIn') !== 'true' || 
        sessionStorage.getItem('userType') !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
    
    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Load and refresh dashboard statistics
    updateDashboardStats();
    setInterval(updateDashboardStats, 5000); // Refresh every 5 seconds
    
    // Load attendance data
    loadAttendanceData();
    setInterval(loadAttendanceData, 30000); // Refresh every 30 seconds
    
    // Setup attendance filters
    setupAttendanceFilters();
    
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.dataset.section;
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
                
                // Update title
                const title = this.textContent.trim();
                document.getElementById('sectionTitle').textContent = title;
                
                // Reload attendance if viewing attendance section
                if (sectionId === 'attendance') {
                    loadAttendanceData();
                }
            }
        });
    });
});

function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', timeOptions);
}

function updateDashboardStats() {
    // Get data from localStorage
    const allWorkers = JSON.parse(localStorage.getItem('workers') || '[]');
    const allSites = JSON.parse(localStorage.getItem('allSites') || '[]');
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const allRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    
    const today = new Date().toDateString();
    
    // Calculate Total Workers
    const totalWorkers = allWorkers.length;
    const activeWorkers = allWorkers.filter(w => w.status === 'active').length;
    
    // Calculate Active Sites
    const activeSites = allSites.filter(s => s.status === 'active').length;
    const inProgressSites = allSites.filter(s => s.status === 'active' && s.progress < 100).length;
    const finishingSites = allSites.filter(s => s.status === 'active' && s.progress >= 90).length;
    
    // Calculate Attendance Today
    const todaysAttendance = allAttendance.filter(record => record.date === today);
    const presentToday = todaysAttendance.length;
    const attendancePercent = totalWorkers > 0 ? ((presentToday / totalWorkers) * 100).toFixed(1) : 0;
    
    // Calculate Pending Requests
    const pendingRequests = allRequests.filter(r => r.status === 'pending').length;
    
    // Update UI with IDs
    // Total Workers
    const workerNumber = document.getElementById('totalWorkersCount');
    const workerChange = document.getElementById('totalWorkersChange');
    if (workerNumber) workerNumber.textContent = totalWorkers;
    if (workerChange) workerChange.textContent = `${activeWorkers} active workers`;
    
    // Active Sites
    const siteNumber = document.getElementById('activeSitesCount');
    const siteChange = document.getElementById('activeSitesChange');
    if (siteNumber) siteNumber.textContent = activeSites;
    if (siteChange) siteChange.textContent = `${inProgressSites} in progress, ${finishingSites} finishing`;
    
    // Attendance Today
    const attendanceNumber = document.getElementById('attendanceTodayCount');
    const attendanceChange = document.getElementById('attendanceTodayChange');
    if (attendanceNumber) attendanceNumber.textContent = `${presentToday}/${totalWorkers}`;
    if (attendanceChange) {
        attendanceChange.textContent = `${attendancePercent}% attendance`;
        // Update color class based on percentage
        attendanceChange.classList.remove('positive', 'warning');
        if (attendancePercent >= 90) {
            attendanceChange.classList.add('positive');
        } else if (attendancePercent < 75) {
            attendanceChange.classList.add('warning');
        }
    }
    
    // Pending Requests
    const requestNumber = document.getElementById('pendingRequestsCount');
    const requestChange = document.getElementById('pendingRequestsChange');
    if (requestNumber) requestNumber.textContent = pendingRequests;
    if (requestChange) {
        if (pendingRequests > 0) {
            requestChange.textContent = 'Requires action';
            requestChange.classList.add('warning');
        } else {
            requestChange.textContent = 'All clear';
            requestChange.classList.remove('warning');
        }
    }
}

function loadAttendanceData() {
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const allSites = JSON.parse(localStorage.getItem('allSites') || '[]');
    
    // Get filter values
    const dateInput = document.getElementById('attendanceDate');
    const siteFilter = document.getElementById('siteFilter');
    
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    const selectedSite = siteFilter ? siteFilter.value : '';
    
    // Set today's date in filter if empty
    if (dateInput && !dateInput.value) {
        dateInput.value = selectedDate;
    }
    
    // Populate sites filter
    if (siteFilter && siteFilter.options.length === 1) {
        allSites.forEach(site => {
            const option = document.createElement('option');
            option.value = site.id;
            option.textContent = site.name;
            siteFilter.appendChild(option);
        });
    }
    
    // Filter attendance by date
    let filteredAttendance = allAttendance.filter(record => record.date === selectedDate);
    
    // Filter by site if selected
    if (selectedSite) {
        filteredAttendance = filteredAttendance.filter(record => record.siteId === selectedSite);
    }
    
    // Calculate statistics
    const totalWorkers = workers.filter(w => w.status === 'active').length;
    const presentToday = filteredAttendance.length;
    const presentPercent = totalWorkers > 0 ? ((presentToday / totalWorkers) * 100).toFixed(1) : 0;
    
    // Calculate total hours (including ongoing work)
    let totalHours = 0;
    filteredAttendance.forEach(record => {
        if (record.totalHours) {
            totalHours += parseFloat(record.totalHours);
        } else if (record.clockIn && !record.clockOut) {
            // Calculate ongoing hours
            const clockInDate = new Date(record.clockIn);
            const now = new Date();
            const hours = (now - clockInDate) / (1000 * 60 * 60);
            totalHours += hours;
        }
    });
    
    // Calculate late arrivals (after 8:30 AM)
    const lateArrivals = filteredAttendance.filter(record => {
        if (record.clockInTime) {
            const [hours, minutes] = record.clockInTime.split(':').map(Number);
            return hours > 8 || (hours === 8 && minutes > 30);
        }
        return false;
    }).length;
    
    // Calculate absences (only for today's date)
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const absences = isToday ? (totalWorkers - presentToday) : 0;
    
    // Update summary cards
    const presentCount = document.getElementById('presentTodayCount');
    const presentPercentEl = document.getElementById('presentTodayPercent');
    const totalHoursEl = document.getElementById('totalHoursToday');
    const lateArrivalsEl = document.getElementById('lateArrivalsCount');
    const absencesEl = document.getElementById('absencesCount');
    
    if (presentCount) presentCount.textContent = `${presentToday}/${totalWorkers}`;
    if (presentPercentEl) presentPercentEl.textContent = `${presentPercent}%`;
    if (totalHoursEl) totalHoursEl.textContent = `${totalHours.toFixed(1)}h`;
    if (lateArrivalsEl) lateArrivalsEl.textContent = lateArrivals;
    if (absencesEl) absencesEl.textContent = absences;
    
    // Update attendance table
    const tbody = document.querySelector('#attendance table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        
        if (filteredAttendance.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999; padding: 30px;">No attendance records found for selected date and filters</td></tr>';
        } else {
            filteredAttendance.forEach(record => {
                const row = document.createElement('tr');
                
                // Get worker full name
                const worker = workers.find(w => w.username === record.username);
                const fullName = worker ? worker.fullName : record.fullName || record.username;
                
                // Get site name
                const site = allSites.find(s => s.id === record.siteId);
                const siteName = site ? site.name : (record.siteName || 'Unknown Site');
                
                // Calculate total hours if still active
                let totalHours = record.totalHours || 0;
                let status = record.status || 'completed';
                
                if (!record.clockOut && record.clockIn) {
                    const clockInDate = new Date(record.clockIn);
                    const now = new Date();
                    totalHours = (now - clockInDate) / (1000 * 60 * 60);
                    status = 'active';
                }
                
                const statusBadge = status === 'active'
                    ? '<span class="status-badge active">🟢 Active</span>'
                    : '<span class="status-badge completed">✅ Completed</span>';
                
                const breakTime = record.breakDeduction ? `${(record.breakDeduction * 60).toFixed(0)}m` : '30m';
                
                row.innerHTML = `
                    <td style="font-weight: 600;">${fullName}</td>
                    <td>${siteName}</td>
                    <td>${record.clockInTime || '-'}</td>
                    <td>${record.clockOutTime || '<span style="color: #999;">-</span>'}</td>
                    <td>${breakTime}</td>
                    <td style="font-weight: 700; color: #eaa350;">${totalHours.toFixed(1)}h</td>
                    <td>${statusBadge}</td>
                    <td>
                        ${record.clockInLocation ? 
                            `<button class="btn-small" onclick="viewLocationDetails('${record.username}', '${selectedDate}')">📍 View</button>` : 
                            '<span style="color: #999;">-</span>'}
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        }
    }
}

function exportAttendanceReport() {
    const dateInput = document.getElementById('attendanceDate');
    const siteFilter = document.getElementById('siteFilter');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    const selectedSite = siteFilter ? siteFilter.value : '';
    
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const allSites = JSON.parse(localStorage.getItem('allSites') || '[]');
    
    // Filter attendance
    let filteredAttendance = allAttendance.filter(record => record.date === selectedDate);
    
    if (selectedSite) {
        filteredAttendance = filteredAttendance.filter(record => record.siteId === selectedSite);
    }
    
    if (filteredAttendance.length === 0) {
        alert('No attendance records found for the selected date and filters.');
        return;
    }
    
    // Calculate summary statistics
    const totalWorkers = workers.filter(w => w.status === 'active').length;
    const presentCount = filteredAttendance.length;
    const totalHours = filteredAttendance.reduce((sum, r) => sum + (parseFloat(r.totalHours) || 0), 0);
    const lateCount = filteredAttendance.filter(r => {
        if (r.clockInTime) {
            const [hours, minutes] = r.clockInTime.split(':').map(Number);
            return hours > 8 || (hours === 8 && minutes > 30);
        }
        return false;
    }).length;
    
    const siteName = selectedSite 
        ? allSites.find(s => s.id === selectedSite)?.name || 'Selected Site'
        : 'All Sites';
    
    // Generate HTML report
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Attendance Report - ${selectedDate}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: white; }
                .header { text-align: center; border-bottom: 3px solid #eaa350; padding-bottom: 20px; margin-bottom: 30px; }
                .header img { max-width: 200px; margin-bottom: 15px; }
                .header h1 { color: #2a2a2a; font-size: 28px; margin-bottom: 10px; }
                .header .company { color: #eaa350; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
                .header .subtitle { color: #666; font-size: 16px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #2a2a2a; color: white; padding: 12px; text-align: left; font-size: 14px; }
                td { padding: 10px 12px; border-bottom: 1px solid #ddd; font-size: 13px; }
                tr:nth-child(even) { background: #f8f8f8; }
                .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #eaa350; text-align: center; color: #666; font-size: 12px; }
                .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                .summary-card { background: #f8f8f8; padding: 20px; border-radius: 8px; border: 2px solid #eaa350; text-align: center; }
                .summary-value { font-size: 28px; color: #eaa350; font-weight: bold; margin: 10px 0; }
                .summary-label { color: #666; font-size: 14px; }
                .status-active { color: #4caf50; font-weight: bold; }
                .status-completed { color: #2196f3; font-weight: bold; }
                @media print { body { padding: 20px; } @page { margin: 20mm; } }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="logo.png" alt="OHR BUILD">
                <div class="company">OHR BUILD</div>
                <h1>📅 Attendance Report</h1>
                <div class="subtitle">Date: ${new Date(selectedDate).toLocaleDateString('ro-RO', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })} | ${siteName}</div>
            </div>
            
            <div class="summary">
                <div class="summary-card">
                    <div class="summary-label">Present</div>
                    <div class="summary-value">${presentCount}/${totalWorkers}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Total Hours</div>
                    <div class="summary-value">${totalHours.toFixed(1)}h</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Late Arrivals</div>
                    <div class="summary-value">${lateCount}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">On Time</div>
                    <div class="summary-value">${presentCount - lateCount}</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Worker Name</th>
                        <th>Site</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Break</th>
                        <th>Total Hours</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredAttendance.map((record, index) => {
                        const worker = workers.find(w => w.username === record.username);
                        const fullName = worker ? worker.fullName : record.fullName || record.username;
                        const site = allSites.find(s => s.id === record.siteId);
                        const siteName = site ? site.name : (record.siteName || 'Unknown');
                        const breakTime = record.breakDeduction ? `${(record.breakDeduction * 60).toFixed(0)}m` : '30m';
                        const status = record.clockOut ? 'Completed' : 'Active';
                        const statusClass = status === 'Active' ? 'status-active' : 'status-completed';
                        
                        return `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${fullName}</strong></td>
                                <td>${siteName}</td>
                                <td>${record.clockInTime || '-'}</td>
                                <td>${record.clockOutTime || '-'}</td>
                                <td>${breakTime}</td>
                                <td><strong>${(record.totalHours || 0).toFixed(1)}h</strong></td>
                                <td class="${statusClass}">${status}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p><strong>OHR BUILD</strong></p>
                <p>Generated: ${new Date().toLocaleString('ro-RO', {
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
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

function setupAttendanceFilters() {
    const dateInput = document.getElementById('attendanceDate');
    const siteFilter = document.getElementById('siteFilter');
    
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            loadAttendanceData();
        });
    }
    
    if (siteFilter) {
        siteFilter.addEventListener('change', function() {
            loadAttendanceData();
        });
    }
}

function viewLocationDetails(username, date) {
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const record = allAttendance.find(r => r.username === username && r.date === date);
    
    if (!record || !record.clockInLocation) {
        alert('No location data available for this attendance record');
        return;
    }
    
    const worker = workers.find(w => w.username === username);
    const fullName = worker ? worker.fullName : username;
    
    // Create modal with enhanced location details
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <h2 style="color: #fcd787; margin-bottom: 20px;">📍 Location Details</h2>
            
            <div style="background: #2a2a2a; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #eaa350; margin-bottom: 10px;">👷 ${fullName}</h3>
                <p style="color: #999; font-size: 0.9em;">Date: ${new Date(date).toLocaleDateString('ro-RO', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; border: 2px solid #4caf50;">
                    <h4 style="color: #4caf50; margin-bottom: 15px;">⏰ Clock In</h4>
                    <p style="color: #fcd787; margin: 8px 0;"><strong>Time:</strong> ${record.clockInTime}</p>
                    <p style="color: #fcd787; margin: 8px 0; font-size: 0.85em;">
                        <strong>Coordinates:</strong><br>
                        Lat: ${record.clockInLocation.latitude.toFixed(6)}<br>
                        Lng: ${record.clockInLocation.longitude.toFixed(6)}
                    </p>
                    <p style="color: #fcd787; margin: 8px 0;"><strong>Accuracy:</strong> ±${record.clockInLocation.accuracy.toFixed(0)}m</p>
                    <a href="https://www.google.com/maps?q=${record.clockInLocation.latitude},${record.clockInLocation.longitude}" 
                       target="_blank" 
                       class="btn-secondary" 
                       style="display: inline-block; margin-top: 10px; text-decoration: none;">
                        🗺️ Open in Google Maps
                    </a>
                </div>
                
                ${record.clockOut && record.clockOutLocation ? `
                <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; border: 2px solid #f44336;">
                    <h4 style="color: #f44336; margin-bottom: 15px;">🏁 Clock Out</h4>
                    <p style="color: #fcd787; margin: 8px 0;"><strong>Time:</strong> ${record.clockOutTime}</p>
                    <p style="color: #fcd787; margin: 8px 0; font-size: 0.85em;">
                        <strong>Coordinates:</strong><br>
                        Lat: ${record.clockOutLocation.latitude.toFixed(6)}<br>
                        Lng: ${record.clockOutLocation.longitude.toFixed(6)}
                    </p>
                    <p style="color: #fcd787; margin: 8px 0;"><strong>Accuracy:</strong> ±${record.clockOutLocation.accuracy.toFixed(0)}m</p>
                    <a href="https://www.google.com/maps?q=${record.clockOutLocation.latitude},${record.clockOutLocation.longitude}" 
                       target="_blank" 
                       class="btn-secondary" 
                       style="display: inline-block; margin-top: 10px; text-decoration: none;">
                        🗺️ Open in Google Maps
                    </a>
                </div>
                ` : `
                <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; border: 2px solid #999;">
                    <h4 style="color: #999; margin-bottom: 15px;">🏁 Clock Out</h4>
                    <p style="color: #999; text-align: center; padding: 20px;">Worker still active<br>No clock out location yet</p>
                </div>
                `}
            </div>
            
            ${record.totalHours ? `
            <div style="background: #1a1a1a; padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #eaa350;">
                <p style="color: #999; margin: 0;">Total Work Duration</p>
                <p style="color: #eaa350; font-size: 2em; font-weight: bold; margin: 10px 0;">${record.totalHours.toFixed(2)} hours</p>
            </div>
            ` : ''}
            
            <div class="modal-actions" style="margin-top: 20px;">
                <button class="btn-primary" onclick="this.closest('.modal-overlay').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const sidebar = document.getElementById('dashboardSidebar');
    const hamburger = document.getElementById('hamburgerMenu');
    const overlay = document.getElementById('mobileOverlay');
    const body = document.body;
    
    if (!sidebar || !hamburger || !overlay) return;
    
    // Toggle classes
    sidebar.classList.toggle('mobile-active');
    hamburger.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (sidebar.classList.contains('mobile-active')) {
        body.style.overflow = 'hidden';
    } else {
        body.style.overflow = '';
    }
}

// Close mobile menu when clicking nav items
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('dashboardSidebar');
                if (sidebar && sidebar.classList.contains('mobile-active')) {
                    toggleMobileMenu();
                }
            }
        });
    });
});
