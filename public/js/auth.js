document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check-auth');
        const data = await response.json();
        
        if (data.authenticated && window.location.pathname === '/') {
            window.location.href = data.user.rol === 'admin' ? '/users.html' : '/home';
        } else if (!data.authenticated && (window.location.pathname === '/home' || window.location.pathname === '/users.html')) {
            window.location.href = '/';
        }
    } catch (err) {
        console.error('Error checking auth:', err);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const mensaje = document.getElementById('mensaje');
    
    mensaje.textContent = '';
    mensaje.className = '';
    
    if (!email || !password) {
        mensaje.textContent = 'Por favor ingresa email y contraseña';
        mensaje.className = 'error';
        return;
    }

    mensaje.textContent = 'Verificando credenciales...';
    mensaje.className = 'success';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Importante para manejar sesiones
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error en la autenticación');
        }
        
        if (data.success) {
            mensaje.textContent = '¡Inicio de sesión exitoso! Redireccionando...';
            mensaje.className = 'success';
            
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userRol', data.user.rol);
            
            setTimeout(() => {
                window.location.href = data.user.rol === 'admin' ? '/users' : '/home';
            }, 1000);
        }
    } catch (error) {
        console.error('Error en login:', error);
        mensaje.textContent = error.message || 'Error de conexión. Por favor, inténtalo más tarde.';
        mensaje.className = 'error';
    }
}

function handleLogout() {
    fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRol');
            window.location.href = '/?logout=' + new Date().getTime();
        }
    })
    .catch(err => {
        console.error('Error al cerrar sesión:', err);
    });
}

window.onpageshow = function(event) {
    if (event.persisted) {
        window.location.reload();
    }
};