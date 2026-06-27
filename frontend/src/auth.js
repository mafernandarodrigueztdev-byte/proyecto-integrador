const usuarioActivo = localStorage.getItem("mel_logged_user");

// Mostrar/ocultar cerrar sesión en cualquier página
const liCerrarSesion = document.getElementById("li-cerrar-sesion");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

if (liCerrarSesion && usuarioActivo) {
    liCerrarSesion.classList.remove("d-none");
}

if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("mel_logged_user");
        window.location.href = "/";
    });
}