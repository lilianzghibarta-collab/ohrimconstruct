// Login Logic

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    // Demo credentials
    const users = {
        muncitor: {
            password: 'muncitor123',
            type: 'worker',
            redirect: 'dashboard-worker.html'
        },
        admin: {
            password: 'admin123',
            type: 'admin',
            redirect: 'dashboard-admin.html'
        }
    };
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;
        
        // Validate credentials
        if (users[username] && 
            users[username].password === password && 
            users[username].type === userType) {
            
            // Store user session
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('userType', userType);
            
            // Redirect to appropriate dashboard
            window.location.href = users[username].redirect;
        } else {
            errorMessage.textContent = '❌ Utilizator, parolă sau tip utilizator incorect!';
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
                if (text.includes('muncitor')) {
                    document.getElementById('username').value = 'muncitor';
                    document.getElementById('password').value = 'muncitor123';
                    document.getElementById('userType').value = 'worker';
                } else if (text.includes('admin')) {
                    document.getElementById('username').value = 'admin';
                    document.getElementById('password').value = 'admin123';
                    document.getElementById('userType').value = 'admin';
                }
            });
        });
    }
});
