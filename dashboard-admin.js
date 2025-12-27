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
    
    // Load attendance data
    loadAttendanceData();
    setInterval(loadAttendanceData, 30000); // Refresh every 30 seconds
    
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

function loadAttendanceData() {
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const today = new Date().toDateString();
    
    // Filter today's attendance
    const todaysAttendance = allAttendance.filter(record => record.date === today);
    
    // Update attendance table if exists
    const tbody = document.querySelector('#attendance table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        
        if (todaysAttendance.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No attendance records for today</td></tr>';
        } else {
            todaysAttendance.forEach(record => {
                const row = document.createElement('tr');
                
                // Calculate total hours if still active
                let totalHours = record.totalHours;
                if (record.status === 'active' && !record.clockOut) {
                    const clockInDate = new Date(record.clockIn);
                    const now = new Date();
                    totalHours = (now - clockInDate) / (1000 * 60 * 60);
                }
                
                const statusBadge = record.clockOut 
                    ? '<span class="status-badge completed">✅ Completed</span>'
                    : '<span class="status-badge active">🟢 Active</span>';
                
                row.innerHTML = `
                    <td>${record.username.charAt(0).toUpperCase() + record.username.slice(1)}</td>
                    <td>Construction Site A3</td>
                    <td>${record.clockInTime}</td>
                    <td>${record.clockOutTime || '-'}</td>
                    <td>30m</td>
                    <td>${totalHours.toFixed(1)}h</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn-small" onclick="viewLocationDetails('${record.username}', '${today}')">📍 Location</button>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        }
    }
}

function viewLocationDetails(username, date) {
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const record = allAttendance.find(r => r.username === username && r.date === date);
    
    if (!record) {
        alert('No attendance record found');
        return;
    }
    
    let locationInfo = `
        📍 Attendance Location Details for ${username.charAt(0).toUpperCase() + username.slice(1)}
        
        ⏰ CLOCK IN:
        Time: ${record.clockInTime}
        Location: ${record.clockInLocation.latitude.toFixed(6)}, ${record.clockInLocation.longitude.toFixed(6)}
        Accuracy: ${record.clockInLocation.accuracy.toFixed(0)}m
        View on Maps: https://www.google.com/maps?q=${record.clockInLocation.latitude},${record.clockInLocation.longitude}
    `;
    
    if (record.clockOut && record.clockOutLocation) {
        locationInfo += `
        
        🏁 CLOCK OUT:
        Time: ${record.clockOutTime}
        Location: ${record.clockOutLocation.latitude.toFixed(6)}, ${record.clockOutLocation.longitude.toFixed(6)}
        Accuracy: ${record.clockOutLocation.accuracy.toFixed(0)}m
        View on Maps: https://www.google.com/maps?q=${record.clockOutLocation.latitude},${record.clockOutLocation.longitude}
        
        ⏱️ TOTAL HOURS: ${record.totalHours.toFixed(2)} hours
        `;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content location-modal">
            <h2>📍 Location Details</h2>
            <div style="text-align: left; white-space: pre-line; padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                ${locationInfo}
            </div>
            <button class="btn-primary" onclick="this.closest('.modal-overlay').remove()">Close</button>
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
