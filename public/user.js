// Verificar si el usuario está logeado
function checkAuth() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  
  if (username && role) {
    // Mostrar perfil
    const profile = document.querySelector('.profile');
    if (profile) {
      profile.style.display = 'flex';
      const usernameSpan = profile.querySelector('.username');
      if (usernameSpan) {
        usernameSpan.textContent = username;
      }
    }
    
    // Ocultar botones de login
    const loginButtons = document.querySelectorAll('.login-buttons');
    loginButtons.forEach(button => {
      button.style.display = 'none';
    });
  } else {
    // Mostrar botones de login
    const loginButtons = document.querySelectorAll('.login-buttons');
    loginButtons.forEach(button => {
      button.style.display = 'flex';
    });
    
    // Ocultar perfil
    const profile = document.querySelector('.profile');
    if (profile) {
      profile.style.display = 'none';
    }
  }
}

// Manejar logout
document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.querySelector('.logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      location.reload();
    });
  }

  // Verificar autenticación
  checkAuth();
});
