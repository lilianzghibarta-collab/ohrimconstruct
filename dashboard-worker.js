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
    
    // Always show site selection modal at login (no session site check)
    // This allows workers to select a new site for each work session
    const username = sessionStorage.getItem('username');
    const today = new Date().toDateString();
    
    // Check if in guest mode
    const isGuestMode = sessionStorage.getItem('guestMode') === 'true';
    
    // Check if there's an active attendance record in allAttendance array
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    const activeRecord = allAttendance.find(r => 
        r.username === username && 
        r.date === today && 
        r.status === 'active' && 
        !r.clockOut
    );
    
    // If in guest mode, update UI accordingly
    if (isGuestMode) {
        updateUIForGuestMode();
    } else if (!activeRecord) {
        // If not clocked in yet or already clocked out, show site selection
        showSiteSelectionModal();
    } else {
        // Already clocked in and working, show timer
        checkAndShowTimer();
    }
    
    // Load timesheet and overview stats
    loadTodaysAttendance();
    loadMonthlyTimesheet();
    loadOverviewStats();
    
    // Auto-refresh tasks and equipment every 30 seconds for real-time sync
    setInterval(() => {
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
            const sectionId = activeSection.id;
            if (sectionId === 'tasks') {
                loadTasks();
            } else if (sectionId === 'equipment') {
                loadEquipment();
            }
        }
    }, 30000); // Refresh every 30 seconds
    
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
                
                // Load data for specific sections
                if (sectionId === 'tasks') {
                    loadTasks();
                } else if (sectionId === 'equipment') {
                    loadEquipment();
                }
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

// Check if worker has selected a site for today
function hasSelectedSiteToday() {
    const username = sessionStorage.getItem('username');
    const today = new Date().toISOString().slice(0, 10);
    const workerSiteSelection = localStorage.getItem(`workerSite_${username}_${today}`);
    return workerSiteSelection !== null;
}

// Show site selection modal
function showSiteSelectionModal() {
    const username = sessionStorage.getItem('username');
    const sites = JSON.parse(localStorage.getItem('allSites') || '[]');
    
    // Get all active sites (no assignment needed)
    const activeSites = sites.filter(s => s.status === 'active');
    
    if (activeSites.length === 0) {
        alert('⚠️ No active construction sites available. Please contact your administrator.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'siteSelectionModal';
    modal.innerHTML = `
        <div class="modal-overlay" style="background: rgba(0,0,0,0.9);">
            <div class="modal-content" style="max-width: 600px; background: #1a1a1a; border: 3px solid #eaa350;">
                <h2 style="color: #fcd787; text-align: center; margin-bottom: 20px;">🏗️ Select Today's Work Site</h2>
                <p style="color: #fcd787; text-align: center; margin-bottom: 30px;">Choose the site where you'll work today or enter as Guest to view your data:</p>
                <div id="sitesList" style="max-height: 400px; overflow-y: auto;">
                    <!-- Guest Mode Option -->
                    <div class="site-selection-card" onclick="selectGuestMode()" style="
                        background: linear-gradient(145deg, #2d3436 0%, #1e272e 100%);
                        border: 2px solid #6c5ce7;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 20px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
                    " onmouseover="this.style.background='linear-gradient(145deg, #3d4446 0%, #2e373e 100%)'; this.style.borderColor='#a29bfe'; this.style.boxShadow='0 6px 20px rgba(162, 155, 254, 0.5)';" onmouseout="this.style.background='linear-gradient(145deg, #2d3436 0%, #1e272e 100%)'; this.style.borderColor='#6c5ce7'; this.style.boxShadow='0 4px 15px rgba(108, 92, 231, 0.3)';">
                        <h3 style="color: #a29bfe; margin-bottom: 10px; font-size: 1.4em;">👤 Guest Mode - View Data</h3>
                        <p style="color: #dfe6e9; margin: 5px 0;">📊 View your work hours, salary and statistics</p>
                        <p style="color: #dfe6e9; margin: 5px 0;">⚠️ No clock in/out - data access only</p>
                        <p style="color: #74b9ff; margin: 10px 0 0 0; font-size: 0.9em; font-style: italic;">💡 Use this option to check your information without logging into a site</p>
                    </div>
                    
                    <!-- Active Sites List -->
                    ${activeSites.map(site => `
                        <div class="site-selection-card" onclick="selectWorkSite('${site.id}', '${site.name}')" style="
                            background: #2a2a2a;
                            border: 2px solid #eaa350;
                            border-radius: 12px;
                            padding: 20px;
                            margin-bottom: 15px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.background='#3a3a3a'; this.style.borderColor='#fcd787';" onmouseout="this.style.background='#2a2a2a'; this.style.borderColor='#eaa350';">
                            <h3 style="color: #fcd787; margin-bottom: 10px; font-size: 1.3em;">🏗️ ${site.name}</h3>
                            <p style="color: #fcd787; margin: 5px 0;">📍 ${site.address}</p>
                            ${site.manager ? `<p style="color: #fcd787; margin: 5px 0;">👷 Manager: ${site.manager}</p>` : ''}
                            ${site.schedule ? `<p style="color: #fcd787; margin: 5px 0;">⏰ Schedule: ${site.schedule}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Select Guest Mode - view data only, no site assignment
function selectGuestMode() {
    const username = sessionStorage.getItem('username');
    
    // Set guest mode flag
    sessionStorage.setItem('guestMode', 'true');
    sessionStorage.removeItem('currentSiteId');
    sessionStorage.removeItem('currentSiteName');
    
    // Remove modal
    const modal = document.getElementById('siteSelectionModal');
    if (modal) {
        modal.remove();
    }
    
    // Show info message
    const infoMsg = document.createElement('div');
    infoMsg.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(145deg, #2d3436 0%, #1e272e 100%);
            border: 3px solid #6c5ce7;
            border-radius: 15px;
            padding: 30px;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(108, 92, 231, 0.5);
            text-align: center;
            max-width: 400px;
        ">
            <div style="font-size: 3em; margin-bottom: 15px;">👤</div>
            <h3 style="color: #a29bfe; margin-bottom: 15px;">Guest Mode Activated</h3>
            <p style="color: #dfe6e9; line-height: 1.6;">
                You can view your work hours, salary and statistics.
                <br><br>
                To clock in/out, select a work site.
            </p>
        </div>
    `;
    document.body.appendChild(infoMsg);
    
    setTimeout(() => {
        infoMsg.remove();
        // Update UI to hide clock in button
        updateUIForGuestMode();
    }, 3000);
}

// Update UI when in Guest Mode
function updateUIForGuestMode() {
    // Add info banner
    const clockSection = document.querySelector('#overview');
    if (clockSection) {
        const infoBanner = document.createElement('div');
        infoBanner.id = 'guestModeBanner';
        infoBanner.style.cssText = `
            background: linear-gradient(145deg, #6c5ce7 0%, #a29bfe 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
        `;
        infoBanner.innerHTML = `
            <div style="font-size: 2em; margin-bottom: 10px;">👤</div>
            <h3 style="margin: 10px 0;">Guest Mode - View Data</h3>
            <p style="margin: 10px 0; opacity: 0.9;">
                You can view your work hours, salary and statistics.
            </p>
            <p style="margin: 10px 0;">
                <button onclick="sessionStorage.removeItem('guestMode'); showSiteSelectionModal();" style="
                    background: white;
                    color: #6c5ce7;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    🏗️ Select Site for Clock In/Out
                </button>
            </p>
        `;
        
        const overviewContent = clockSection.querySelector('.stats-grid') || clockSection.firstElementChild;
        if (overviewContent && overviewContent.parentElement) {
            overviewContent.parentElement.insertBefore(infoBanner, overviewContent);
        }
    }
}

// Select work site for current work session
function selectWorkSite(siteId, siteName) {
    const username = sessionStorage.getItem('username');
    
    // Clear guest mode
    sessionStorage.removeItem('guestMode');
    
    // Save site selection in sessionStorage (only for current session, not whole day)
    sessionStorage.setItem('currentSiteId', siteId);
    sessionStorage.setItem('currentSiteName', siteName);
    
    // Remove modal
    const modal = document.getElementById('siteSelectionModal');
    if (modal) {
        modal.remove();
    }
    
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
            padding: 30px;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 5px 30px rgba(40, 167, 69, 0.5);
        ">
            <h3 style="color: #28a745; margin-bottom: 10px; font-size: 1.5em;">✅ Site Selected</h3>
            <p style="color: #fcd787; font-size: 1.2em;">Working at: <strong>${siteName}</strong></p>
        </div>
    `;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.remove();
        // Show clock in modal
        showClockInModal();
    }, 2000);
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
    const siteId = sessionStorage.getItem('currentSiteId');
    const siteName = sessionStorage.getItem('currentSiteName');
    
    const attendanceRecord = {
        username: username,
        date: today,
        clockIn: now.toISOString(),
        clockInTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        clockInLocation: locationData,
        siteId: siteId,
        siteName: siteName,
        clockOut: null,
        clockOutTime: null,
        clockOutLocation: null,
        totalHours: 0,
        status: 'active'
    };
    
    // Save to localStorage (each clock in creates a new record)
    const attendanceKey = `attendance_${username}_${today}_${Date.now()}`;
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
    
    // Start live timer
    startLiveTimer(now);
    
    // Show success message with translation
    let title, message;
    if (typeof translations !== 'undefined') {
        const lang = localStorage.getItem('selectedLanguage') || 'ro';
        const t = translations[lang];
        title = t.clockin_success_title;
        message = t.clockin_success_message
            .replace('{time}', attendanceRecord.clockInTime)
            .replace('{site}', siteName);
    } else {
        title = '✅ Pontaj Intrare Reușit';
        message = `Ai pontat intrarea la ora ${attendanceRecord.clockInTime} pentru <strong>${siteName}</strong>. O zi productivă!`;
    }
    showSuccessMessage(title, message);
}

function loadTodaysAttendance() {
    const username = sessionStorage.getItem('username');
    const today = new Date().toDateString();
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    
    // Get all records for today (can be multiple)
    const todayRecords = allAttendance.filter(r => r.username === username && r.date === today);
    
    if (todayRecords.length > 0) {
        // Show the most recent record
        const latestRecord = todayRecords[todayRecords.length - 1];
        
        document.getElementById('clockInTime').textContent = latestRecord.clockInTime;
        
        if (latestRecord.clockOut) {
            // Calculate total hours for all completed sessions today
            const totalHoursToday = todayRecords
                .filter(r => r.status === 'completed')
                .reduce((sum, r) => sum + (parseFloat(r.totalHours) || 0), 0);
            document.getElementById('hoursWorked').textContent = totalHoursToday.toFixed(1) + 'h';
        } else {
            // Calculate current hours worked in active session
            const clockInDate = new Date(latestRecord.clockIn);
            const now = new Date();
            const hours = (now - clockInDate) / (1000 * 60 * 60);
            document.getElementById('hoursWorked').textContent = hours.toFixed(1) + 'h';
        }
        
        // Update status badge
        updateStatusBadge(latestRecord.status || 'active');
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
    const grossSalary = totalHours * hourlyRate;
    const taxes = grossSalary * 0.20; // 20% taxes
    const netSalary = grossSalary - taxes;
    
    // Update UI
    const hoursElement = document.getElementById('hoursThisMonth');
    const salaryElement = document.getElementById('estimatedSalaryOverview');
    
    if (hoursElement) {
        hoursElement.textContent = totalHours.toFixed(1);
    }
    
    if (salaryElement) {
        salaryElement.innerHTML = `
            <div style="text-align: left;">
                <div style="font-size: 0.7em; color: #fcd787; margin-bottom: 3px;">Gross: ${grossSalary.toFixed(2)} EUR</div>
                <div style="font-size: 0.7em; color: #dc3545; margin-bottom: 3px;">Taxes (20%): -${taxes.toFixed(2)} EUR</div>
                <div style="font-size: 1em; color: #28a745; font-weight: 700;">Net: ${netSalary.toFixed(2)} EUR</div>
            </div>
        `;
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

// Close mobile menu when clicking nav items (add to existing DOMContentLoaded)
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


function clockIn() {
    // Check if in guest mode
    if (sessionStorage.getItem('guestMode') === 'true') {
        // Show site selection modal
        showSiteSelectionModal();
        return;
    }
    
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
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    
    // Find the active (not completed) record for today
    const activeRecordIndex = allAttendance.findIndex(r => 
        r.username === username && 
        r.date === today && 
        r.status === 'active' && 
        !r.clockOut
    );
    
    if (activeRecordIndex === -1) {
        alert('❌ No active clock in found for today');
        return;
    }
    
    const activeRecord = allAttendance[activeRecordIndex];
    
    // Show modal to ask for work hours
    showClockOutModal(activeRecord, activeRecordIndex);
}

function showClockOutModal(record, recordIndex) {
    const modal = document.createElement('div');
    modal.id = 'clockOutModal';
    modal.innerHTML = `
        <div class="modal-overlay" style="background: rgba(0,0,0,0.9);">
            <div class="modal-content" style="max-width: 500px; background: #1a1a1a; border: 3px solid #eaa350;">
                <h2 style="color: #fcd787; text-align: center; margin-bottom: 20px;">⏰ Clock Out - Enter Work Hours</h2>
                <p style="color: #fcd787; text-align: center; margin-bottom: 30px;">Please confirm your work hours for today:</p>
                
                <div style="margin-bottom: 20px;">
                    <label style="color: #fcd787; display: block; margin-bottom: 10px; font-weight: 600;">Start Time: *</label>
                    <input type="time" id="startTime" required style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #eaa350;
                        border-radius: 8px;
                        background: #2a2a2a;
                        color: #fcd787;
                        font-size: 1.1em;
                        text-align: center;
                    " placeholder="HH:MM">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="color: #fcd787; display: block; margin-bottom: 10px; font-weight: 600;">End Time: *</label>
                    <input type="time" id="endTime" required style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #eaa350;
                        border-radius: 8px;
                        background: #2a2a2a;
                        color: #fcd787;
                        font-size: 1.1em;
                        text-align: center;
                    " placeholder="HH:MM">
                </div>
                
                <div style="background: #2a2a2a; border: 2px solid #eaa350; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <p style="color: #fcd787; margin: 5px 0; font-size: 0.95em;">🕒 <strong>Total Hours:</strong> <span id="calculatedHours" style="color: #28a745; font-weight: 700;">0.0h</span></p>
                    <p style="color: #fcd787; margin: 5px 0; font-size: 0.9em;">☕ Break Time: <strong>30 minutes</strong> (automatically deducted)</p>
                </div>
                
                <div style="display: flex; gap: 15px;">
                    <button onclick="confirmClockOut()" class="btn-primary" style="flex: 1; padding: 15px; font-size: 1.1em;">✅ Confirm Clock Out</button>
                    <button onclick="cancelClockOut()" class="btn-secondary" style="flex: 1; padding: 15px; font-size: 1.1em;">❌ Cancel</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add event listeners to calculate hours in real-time
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    
    function calculateHours() {
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        
        if (startTime && endTime) {
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            
            let totalMinutes = endMinutes - startMinutes;
            if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight work
            
            // Subtract 30 minutes for break
            totalMinutes -= 30;
            
            const hours = (totalMinutes / 60).toFixed(1);
            document.getElementById('calculatedHours').textContent = hours + 'h';
            document.getElementById('calculatedHours').style.color = hours > 0 ? '#28a745' : '#dc3545';
        }
    }
    
    startTimeInput.addEventListener('change', calculateHours);
    endTimeInput.addEventListener('change', calculateHours);
    calculateHours(); // Initial calculation
}

function confirmClockOut() {
    const username = sessionStorage.getItem('username');
    const today = new Date().toDateString();
    const allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    
    // Find active record
    const activeRecordIndex = allAttendance.findIndex(r => 
        r.username === username && 
        r.date === today && 
        r.status === 'active' && 
        !r.clockOut
    );
    
    if (activeRecordIndex === -1) {
        alert('❌ No active session found');
        return;
    }
    
    const record = allAttendance[activeRecordIndex];
    
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    if (!startTime || !endTime) {
        alert('❌ Please enter both start and end times');
        return;
    }
    
    // Calculate total hours
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    let totalMinutes = endMinutes - startMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    
    // Subtract 30 minutes for break
    totalMinutes -= 30;
    
    if (totalMinutes <= 0) {
        alert('❌ Invalid time range. End time must be after start time.');
        return;
    }
    
    const totalHours = totalMinutes / 60;
    
    // Update record with manual times
    const now = new Date();
    record.clockOut = now.toISOString();
    record.clockOutTime = endTime;
    record.manualStartTime = startTime;
    record.manualEndTime = endTime;
    record.totalHours = parseFloat(totalHours.toFixed(2));
    record.breakDeduction = 0.5; // 30 minutes = 0.5 hours
    record.status = 'completed';
    
    // If geolocation available, add it
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                record.clockOutLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                finalizeClockOut(record, activeRecordIndex);
            },
            () => {
                // If geolocation fails, continue without it
                finalizeClockOut(record, activeRecordIndex);
            }
        );
    } else {
        finalizeClockOut(record, activeRecordIndex);
    }
}

function finalizeClockOut(record, recordIndex) {
    const username = sessionStorage.getItem('username');
    const today = new Date().toDateString();
    
    // Update in allAttendance array
    let allAttendance = JSON.parse(localStorage.getItem('allAttendance') || '[]');
    allAttendance[recordIndex] = record;
    localStorage.setItem('allAttendance', JSON.stringify(allAttendance));
    
    // Remove modal
    const modal = document.getElementById('clockOutModal');
    if (modal) {
        modal.remove();
    }
    
    // Stop timer
    stopLiveTimer();
    
    // Update status badge immediately
    updateStatusBadge('completed');
    
    loadTodaysAttendance();
    loadMonthlyTimesheet();
    loadOverviewStats();
    
    // Show success message with translation
    let title, message;
    if (typeof translations !== 'undefined') {
        const lang = localStorage.getItem('selectedLanguage') || 'ro';
        const t = translations[lang];
        title = t.clockout_success_title;
        message = t.clockout_success_message
            .replace('{start}', record.manualStartTime)
            .replace('{end}', record.manualEndTime)
            .replace('{hours}', record.totalHours);
    } else {
        title = '✅ Pontaj Ieșire Reușit';
        message = `Ore lucrate: ${record.manualStartTime} - ${record.manualEndTime}<br>Total: <strong>${record.totalHours}h</strong> (30 min pauză deduse)<br><br>Pontajul tău a fost trimis la administrator.`;
    }
    showSuccessMessage(title, message);
    
    // After 3 seconds, show site selection modal for next work session
    setTimeout(() => {
        showSiteSelectionModal();
    }, 3000);
}

function cancelClockOut() {
    const modal = document.getElementById('clockOutModal');
    if (modal) {
        modal.remove();
    }
}

// Helper function to show success messages
function showSuccessMessage(title, message) {
    const successModal = document.createElement('div');
    successModal.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.92);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease-out;
        ">
            <div style="
                background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);
                border: 3px solid #28a745;
                border-radius: 20px;
                padding: 50px;
                max-width: 500px;
                text-align: center;
                box-shadow: 
                    0 10px 50px rgba(40, 167, 69, 0.6),
                    0 0 100px rgba(40, 167, 69, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                transform: scale(1);
                animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 25px;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3em;
                    box-shadow: 0 5px 20px rgba(40, 167, 69, 0.5);
                    animation: pulse 2s infinite;
                ">
                    ✓
                </div>
                <h2 style="
                    color: #28a745; 
                    margin-bottom: 20px; 
                    font-size: 2em;
                    text-shadow: 0 2px 10px rgba(40, 167, 69, 0.5);
                ">${title}</h2>
                <p style="
                    color: #fcd787; 
                    font-size: 1.2em; 
                    line-height: 1.8;
                    margin: 0;
                ">${message}</p>
            </div>
        </div>
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes popIn {
                0% { transform: scale(0.5); opacity: 0; }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); box-shadow: 0 5px 30px rgba(40, 167, 69, 0.8); }
            }
        </style>
    `;
    document.body.appendChild(successModal);
    
    setTimeout(() => {
        successModal.style.opacity = '0';
        successModal.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => {
            successModal.remove();
        }, 300);
    }, 4000);
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

// Google Maps function moved to site-management.js
