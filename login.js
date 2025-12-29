// Login Logic

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    // Demo credentials
    const users = {
        worker: {
            password: 'worker123',
            type: 'worker',
            redirect: 'dashboard-worker.html',
            name: 'John Worker'
        },
        admin: {
            password: 'admin123',
            type: 'admin',
            redirect: 'dashboard-admin.html',
            name: 'Admin User'
        }
    };
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.toLowerCase().trim();
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;
        
        let validLogin = false;
        let userFullName = '';
        let redirectUrl = '';
        
        // Check hardcoded demo users first
        if (users[username] && 
            users[username].password === password && 
            users[username].type === userType) {
            validLogin = true;
            userFullName = users[username].name;
            redirectUrl = users[username].redirect;
        } else {
            // Check users created by admin from localStorage
            const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const foundUser = storedUsers.find(u => 
                u.username.toLowerCase() === username && 
                u.password === password && 
                u.type === userType
            );
            
            if (foundUser) {
                validLogin = true;
                userFullName = foundUser.fullName || username;
                redirectUrl = userType === 'worker' ? 'dashboard-worker.html' : 'dashboard-admin.html';
                
                // Check if user is inactive (frozen)
                if (userType === 'worker') {
                    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
                    const worker = workers.find(w => w.username.toLowerCase() === username);
                    if (worker && worker.status === 'inactive') {
                        errorMessage.textContent = '❌ Your account has been deactivated. Please contact administrator.';
                        errorMessage.style.display = 'block';
                        setTimeout(() => {
                            errorMessage.style.display = 'none';
                        }, 4000);
                        return;
                    }
                }
            }
        }
        
        if (validLogin) {
            // Store user session
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('userType', userType);
            sessionStorage.setItem('userFullName', userFullName);
            
            // For workers, check if they need to clock in today
            if (userType === 'worker') {
                const today = new Date().toDateString();
                const lastClockIn = localStorage.getItem(`lastClockIn_${username}`);
                
                if (lastClockIn !== today) {
                    sessionStorage.setItem('needsClockIn', 'true');
                }
            }
            
            // Redirect to appropriate dashboard
            window.location.href = redirectUrl;
        } else {
            errorMessage.textContent = '❌ Invalid username, password or user type!';
            errorMessage.style.display = 'block';
            
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });
    
    // Auto-fill demo credentials on click
    const demoCredentials = document.querySelector('.demo-credentials');
    if (demoCredentials) {
        demoCredentials.querySelectorAll('p').forEach(p => {
            p.style.cursor = 'pointer';
            p.addEventListener('click', function() {
                const text = this.textContent;
                if (text.includes('Worker')) {
                    document.getElementById('username').value = 'worker';
                    document.getElementById('password').value = 'worker123';
                    document.getElementById('userType').value = 'worker';
                } else if (text.includes('Admin')) {
                    document.getElementById('username').value = 'admin';
                    document.getElementById('password').value = 'admin123';
                    document.getElementById('userType').value = 'admin';
                }
            });
        });
    }
});
