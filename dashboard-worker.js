// Dashboard Worker Logic

let timerInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (sessionStorage.getItem('loggedIn') !== 'true' || 
        sessionStorage.getItem('userType') !== 'worker') {
        window.location.href = 'login.html';
        return;
    }
    
    // Set worker name
    const workerName = sessionStorage.getItem('userFullName') || sessionStorage.getItem('username');
    document.getElementById('workerName').textContent = workerName;
    
    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Check if needs clock in
    if (sessionStorage.getItem('needsClockIn') === 'true') {
        showClockInModal();
    } else {
        // Check if already clocked in today and show timer
        checkAndShowTimer();
    }
    
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
            }
        });
    });
    
    // Load today's attendance if exists
    loadTodaysAttendance();
});

function checkAndShowTimer() {
    const username = sessionStorage.getItem('username');
    const today = new Date().toDateString();
    const attendanceKey = `attendance_${username}_${today}`;
    const record = JSON.parse(localStorage.getItem(attendanceKey));
    
    if (record && !record.clockOut) {
        // Show timer card
        const timerCard = document.getElementById('workTimerCard');
        timerCard.style.display = 'block';
        
        // Set clock in time
        document.getElementById('timerClockIn').textContent = record.clockInTime;
        
        // Start live timer
        startLiveTimer(new Date(record.clockIn));
    }
}

function startLiveTimer(clockInDate) {
    // Clear any existing interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    function updateTimer() {
        const now = new Date();
        const diff = now - clockInDate;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const timerDisplay = document.getElementById('liveTimer');
        if (timerDisplay) {
            timerDisplay.textContent = timeString;
        }
    }
    
    // Update immediately
    updateTimer();
    
    // Update every second
    timerInterval = setInterval(updateTimer, 1000);
}

function stopLiveTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Hide timer card
    const timerCard = document.getElementById('workTimerCard');
    if (timerCard) {
        timerCard.style.display = 'none';
    }
}

function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', timeOptions);
}

function showClockInModal() {
    const modal = document.createElement('div');
    modal.id = 'clockInModal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>📍 Clock In Required</h2>
                <p>Please clock in to start your workday. We need your location to verify you're at the construction site.</p>
                <div id="locationStatus">🔍 Requesting location access...</div>
                <button id="clockInBtn" class="btn-primary" disabled>⏰ Clock In</button>
                <button id="cancelBtn" class="btn-secondary">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Request geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                document.getElementById('locationStatus').innerHTML = `
                    ✅ Location acquired<br>
                    <small>Lat: ${locationData.latitude.toFixed(6)}, Lng: ${locationData.longitude.toFixed(6)}</small>
                `;
                document.getElementById('clockInBtn').disabled = false;
                
                document.getElementById('clockInBtn').onclick = () => clockInWithLocation(locationData);
            },
            (error) => {
                document.getElementById('locationStatus').innerHTML = `
                    ❌ Location access denied or unavailable<br>
                    <small>${error.message}</small>
                `;
                alert('Location access is required to clock in. Please enable location services.');
            }
        );
    } else {
        document.getElementById('locationStatus').textContent = '❌ Geolocation not supported by this browser';
        alert('Your browser does not support geolocation.');
    }
    
    document.getElementById('cancelBtn').onclick = () => {
        modal.remove();
        sessionStorage.removeItem('needsClockIn');
    };
}

function clockInWithLocation(locationData) {
    const now = new Date();
    const username = sessionStorage.getItem('username');
    const today = now.toDateString();
    
    const attendanceRecord = {
        username: username,
        date: today,
        clockIn: now.toISOString(),
        clockInTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        clockInLocation: locationData,
        clockOut: null,
        clockOutTime: null,
        clockOutLocation: null,
        totalHours: 0,
        status: 'active'
    };
    
    // Save to localStorage
    const attendanceKey = `attendance_${username}_${today}`;
    localStorage.setItem(attendanceKey, JSON.stringify(attendanceRecord));
    localStorage.setItem(`lastClockIn_${username}`, today);
    
    // Add to global attendance records for admin
    let allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    allAttendance.push(attendanceRecord);
    localStorage.setItem('allAttendance', JSON.stringify(allAttendance));
    
    // Remove modal
    document.getElementById('clockInModal').remove();
    sessionStorage.removeItem('needsClockIn');
    
    // Update UI
    updateStatusBadge('active');
    loadTodaysAttendance();
    
    alert('✅ Successfully clocked in at ' + attendanceRecord.clockInTime);
}

function loadTodaysAttendance() {
    const username = sessionStorage.getItem('username');
    const today = new Date().toDateString();
    const attendanceKey = `attendance_${username}_${today}`;
    const record = JSON.parse(localStorage.getItem(attendanceKey));
    
    if (record) {
        document.getElementById('clockInTime').textContent = record.clockInTime;
        
        if (record.clockOut) {
            document.getElementById('hoursWorked').textContent = record.totalHours.toFixed(1) + 'h';
        } else {
            // Calculate current hours worked
            const clockInDate = new Date(record.clockIn);
            const now = new Date();
            const hours = (now - clockInDate) / (1000 * 60 * 60);
            document.getElementById('hoursWorked').textContent = hours.toFixed(1) + 'h';
        }
        
        // Update status badge
        updateStatusBadge(record.status || 'active');
    }
    
    // Load monthly timesheet
    loadMonthlyTimesheet();
    
    // Load overview stats
    loadOverviewStats();
}

function loadOverviewStats() {
    const username = sessionStorage.getItem('username');
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    
    // Calculate current month stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyRecords = allAttendance.filter(record => {
        if (record.username !== username) return false;
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    // Calculate total hours worked (only completed shifts)
    const totalHours = monthlyRecords
        .filter(r => r.status === 'completed' && r.totalHours)
        .reduce((sum, record) => sum + (parseFloat(record.totalHours) || 0), 0);
    
    // Calculate estimated salary
    const hourlyRate = 25; // EUR per hour
    const estimatedSalary = (totalHours * hourlyRate).toFixed(2);
    
    // Update UI
    const hoursElement = document.getElementById('hoursThisMonth');
    const salaryElement = document.getElementById('estimatedSalaryOverview');
    
    if (hoursElement) {
        hoursElement.textContent = totalHours.toFixed(1);
    }
    
    if (salaryElement) {
        salaryElement.textContent = estimatedSalary + ' EUR';
    }
}

function loadMonthlyTimesheet() {
    const username = sessionStorage.getItem('username');
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    
    // Filter records for current user and current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyRecords = allAttendance.filter(record => {
        if (record.username !== username) return false;
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    // Sort by date descending (most recent first)
    monthlyRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Populate table
    const tbody = document.getElementById('timesheetTableBody');
    if (!tbody) return;
    
    if (monthlyRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #fcd787;">No attendance records for this month</td></tr>';
        return;
    }
    
    tbody.innerHTML = monthlyRecords.map(record => {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        const clockIn = record.clockInTime || '-';
        const clockOut = record.clockOutTime || '-';
        const hours = record.totalHours ? record.totalHours.toFixed(1) + 'h' : '-';
        
        let statusBadge = '';
        switch(record.status) {
            case 'active':
                statusBadge = '<span class="status-badge active">🟢 Active</span>';
                break;
            case 'completed':
                statusBadge = '<span class="status-badge completed">🔴 Completed</span>';
                break;
            case 'pause':
                statusBadge = '<span class="status-badge pause">⏸️ Pause</span>';
                break;
            case 'inactive':
                statusBadge = '<span class="status-badge inactive">🔵 Inactive</span>';
                break;
            case 'holiday':
                statusBadge = '<span class="status-badge holiday">🎉 Holiday</span>';
                break;
            default:
                statusBadge = '<span class="status-badge inactive">🔵 Inactive</span>';
        }
        
        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${clockIn}</td>
                <td>${clockOut}</td>
                <td>${hours}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join('');
}

function updateStatusBadge(status) {
    const statusBadge = document.querySelector('.current-shift .status-badge');
    if (!statusBadge) return;
    
    // Remove all status classes
    statusBadge.classList.remove('active', 'inactive', 'completed', 'pause');
    
    // Add new status class and update text
    switch(status) {
        case 'active':
            statusBadge.classList.add('active');
            statusBadge.textContent = '🟢 Active';
            break;
        case 'inactive':
            statusBadge.classList.add('inactive');
            statusBadge.textContent = '🔵 Inactive';
            break;
        case 'completed':
            statusBadge.classList.add('completed');
            statusBadge.textContent = '🔴 Completed';
            break;
        case 'pause':
            statusBadge.classList.add('pause');
            statusBadge.textContent = '⏸️ Pause';
            break;
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const body = document.body;
    
    sidebar.classList.toggle('mobile-open');
    mobileBtn.classList.toggle('active');
    
    // Create or toggle overlay
    let overlay = document.querySelector('.mobile-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.onclick = toggleMobileMenu;
        document.body.appendChild(overlay);
    }
    overlay.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (sidebar.classList.contains('mobile-open')) {
        body.style.overflow = 'hidden';
    } else {
        body.style.overflow = '';
    }
}

// Close mobile menu when clicking nav items (add to existing DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const originalClick = item.onclick;
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar.classList.contains('mobile-open')) {
                    toggleMobileMenu();
                }
            }
        });
    });
});


function clockIn() {
    const username = sessionStorage.getItem('username');
    const today = new Date().toDateString();
    const attendanceKey = `attendance_${username}_${today}`;
    const record = JSON.parse(localStorage.getItem(attendanceKey));
    
    // If already clocked in today and status is pause, resume to active
    if (record && !record.clockOut && record.status === 'pause') {
        record.status = 'active';
        localStorage.setItem(attendanceKey, JSON.stringify(record));
        
        // Update global attendance
        let allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
        const index = allAttendance.findIndex(a => 
            a.username === username && a.date === today
        );
        if (index !== -1) {
            allAttendance[index] = record;
            localStorage.setItem('allAttendance', JSON.stringify(allAttendance));
        }
        
        updateStatusBadge('active');
        alert('✅ Break ended - Back to Active status');
        return;
    }
    
    // Normal clock in with geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                clockInWithLocation(locationData);
            },
            (error) => {
                alert('❌ Cannot clock in without location access: ' + error.message);
            }
        );
    } else {
        alert('❌ Geolocation is not supported by this browser');
    }
}

function clockOut() {
    const username = sessionStorage.getItem('username');
    const today = new Date().toDateString();
    const attendanceKey = `attendance_${username}_${today}`;
    const record = JSON.parse(localStorage.getItem(attendanceKey));
    
    if (!record || record.clockOut) {
        alert('❌ No active clock in found for today');
        return;
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const now = new Date();
                const clockInDate = new Date(record.clockIn);
                const totalHours = (now - clockInDate) / (1000 * 60 * 60);
                
                record.clockOut = now.toISOString();
                record.clockOutTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                record.clockOutLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                record.totalHours = totalHours;
                record.status = 'completed';
                
                // Update localStorage
                localStorage.setItem(attendanceKey, JSON.stringify(record));
                
                // Update global attendance for admin
                let allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
                const index = allAttendance.findIndex(a => 
                    a.username === username && a.date === today
                );
                if (index !== -1) {
                    allAttendance[index] = record;
                    localStorage.setItem('allAttendance', JSON.stringify(allAttendance));
                }
                
                // Stop timer
                stopLiveTimer();
                
                // Update status badge immediately
                updateStatusBadge('completed');
                
                loadTodaysAttendance();
                loadOverviewStats(); // Update overview after clock out
                alert('✅ Successfully clocked out at ' + record.clockOutTime);
            },
            (error) => {
                alert('❌ Cannot clock out without location access: ' + error.message);
            }
        );
    } else {
        alert('❌ Geolocation is not supported by this browser');
    }
}

function addBreak() {
    const username = sessionStorage.getItem('username');
    const today = new Date().toDateString();
    const attendanceKey = `attendance_${username}_${today}`;
    const record = JSON.parse(localStorage.getItem(attendanceKey));
    
    if (!record || record.clockOut) {
        alert('❌ No active clock in found for today');
        return;
    }
    
    // Update status to pause
    record.status = 'pause';
    localStorage.setItem(attendanceKey, JSON.stringify(record));
    
    // Update global attendance
    let allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const index = allAttendance.findIndex(a => 
        a.username === username && a.date === today
    );
    if (index !== -1) {
        allAttendance[index] = record;
        localStorage.setItem('allAttendance', JSON.stringify(allAttendance));
    }
    
    // Update status badge
    updateStatusBadge('pause');
    loadMonthlyTimesheet();
    
    alert('⏸️ Break started - Status changed to Pause');
}

function openRequestForm() {
    alert('📝 New request form (in development)');
}
