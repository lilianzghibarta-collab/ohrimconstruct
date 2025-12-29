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
                
                loadTodaysAttendance();
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
    alert('☕ Break recorded');
}

function openRequestForm() {
    alert('📝 New request form (in development)');
}
