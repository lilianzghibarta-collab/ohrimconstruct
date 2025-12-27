// Dashboard Worker Logic

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (sessionStorage.getItem('loggedIn') !== 'true' || 
        sessionStorage.getItem('userType') !== 'worker') {
        window.location.href = 'login.html';
        return;
    }
    
    // Set worker name
    const workerName = sessionStorage.getItem('username');
    document.getElementById('workerName').textContent = workerName.charAt(0).toUpperCase() + workerName.slice(1);
    
    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
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
});

function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    
    document.getElementById('currentDate').textContent = now.toLocaleDateString('ro-RO', dateOptions);
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('ro-RO', timeOptions);
}

function logout() {
    if (confirm('Sigur doriți să vă deconectați?')) {
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
}

function clockIn() {
    const now = new Date();
    const time = now.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('clockInTime').textContent = time;
    alert('✅ Pontaj intrare înregistrat: ' + time);
}

function clockOut() {
    const time = new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    if (confirm('Confirmați pontaj ieșire la ' + time + '?')) {
        alert('✅ Pontaj ieșire înregistrat: ' + time);
    }
}

function addBreak() {
    alert('☕ Pauză înregistrată');
}

function openRequestForm() {
    alert('📝 Formular cerere nouă (în dezvoltare)');
}
