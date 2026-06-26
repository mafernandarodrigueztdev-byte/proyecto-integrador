/*============================================================================
             SPA: Control de vistas (CORREGIDO PARA USAR DISPLAY)
=============================================================================*/
// Mapeamos las vistas principales usando sus IDs para sincronizar con el flujo de abajo
const vistaLogin = document.getElementById('vista-login');
const vistaRegistro = document.getElementById('vista-registro');
const vistaMiCuenta = document.getElementById('vista-mi-cuenta');

function mostrarVista(id) {
  // En lugar de usar clases que pueden chocar con los estilos de visualización,
  // controlamos directamente el display de las 3 pantallas principales.
  if (vistaLogin) vistaLogin.style.display = (id === "vista-login") ? "block" : "none";
  if (vistaRegistro) vistaRegistro.style.display = (id === "vista-registro") ? "block" : "none";
  if (vistaMiCuenta) vistaMiCuenta.style.display = (id === "vista-mi-cuenta") ? "block" : "none";
}

// Mostrar login por defecto al cargar la página
mostrarVista("vista-login");

// Links de navegación entre vistas
document.getElementById("ir-a-registro")
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarVista("vista-registro");
  });

document.getElementById("ir-a-login")
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarVista("vista-login");
  });



/* ==========================================================================
   MI CUENTA - PUNTOS ACUMULADOS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const totalUserPoints = document.querySelector("#totalUserPoints");
  const userForumPointsList = document.querySelector("#userForumPointsList");

  const USER_STORAGE_KEY = "mel_logged_user";
  const MEMBERSHIPS_STORAGE_KEY = "mel_forum_memberships";

  function getLoggedUser() {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Error leyendo usuario desde localStorage:", error);
      return null;
    }
  }

  function getAllMemberships() {
    const storedMemberships = localStorage.getItem(MEMBERSHIPS_STORAGE_KEY);

    if (!storedMemberships) return {};

    try {
      return JSON.parse(storedMemberships);
    } catch (error) {
      console.error("Error leyendo membresías desde localStorage:", error);
      return {};
    }
  }

  function formatNumber(number) {
    return Number(number || 0).toLocaleString("es-MX");
  }

  function formatDate(dateString) {
    if (!dateString) return "fecha no disponible";

    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  async function getForumsData() {
    try {
      const response = await fetch("/data/forums.json");

      if (!response.ok) {
        throw new Error(`Error al cargar forums.json: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error cargando foros:", error);
      return [];
    }
  }

  function findForumById(forums, forumId) {
    return forums.find((forum) => forum.id === forumId);
  }

  function renderEmptyState(message) {
    if (totalUserPoints) {
      totalUserPoints.textContent = "0";
    }

    if (userForumPointsList) {
      userForumPointsList.innerHTML = `
        <p class="empty-points-message">
          ${message}
        </p>
      `;
    }
  }

  function sortMembershipsByPoints(memberships) {
    return memberships.sort((a, b) => {
      return Number(b.points || 0) - Number(a.points || 0);
    });
  }

  async function renderUserPoints() {
    const loggedUser = getLoggedUser();

    if (!loggedUser) {
      renderEmptyState(
        "Inicia sesión para consultar tus puntos acumulados y tus foros activos."
      );
      return;
    }

    const memberships = getAllMemberships();
    const userMemberships = memberships[loggedUser.id] || {};
    const userForumMemberships = Object.values(userMemberships);

    if (userForumMemberships.length === 0) {
      renderEmptyState(
        "Aún no tienes puntos acumulados. Suscríbete a un foro, crea una publicación o responde para comenzar a ganar puntos."
      );
      return;
    }

    const forums = await getForumsData();

    const sortedMemberships = sortMembershipsByPoints(userForumMemberships);

    const totalPoints = sortedMemberships.reduce((total, membership) => {
      return total + Number(membership.points || 0);
    }, 0);

    if (totalUserPoints) {
      totalUserPoints.textContent = formatNumber(totalPoints);
    }

    if (!userForumPointsList) return;

    userForumPointsList.innerHTML = sortedMemberships
      .map((membership) => {
        const forum = findForumById(forums, membership.forumId);

        const forumName = forum?.nombre || "Foro desconocido";
        const forumIcon = forum?.icono || "📚";
        const joinedAt = formatDate(membership.joinedAt);
        const points = Number(membership.points || 0);

        return `
          <article class="forum-points-item">
            <div class="forum-points-icon">
              ${forumIcon}
            </div>

            <div class="forum-points-info">
              <h4>${forumName}</h4>
              <p>Te uniste el ${joinedAt}</p>
            </div>

            <div class="forum-points-value">
              ${formatNumber(points)}
              <small>puntos</small>
            </div>
          </article>
        `;
      })
      .join("");
  }

  // Hacer que renderUserPoints esté disponible globalmente para poder llamarlo tras el login exitoso
  window.renderUserPointsGlobal = renderUserPoints;
  renderUserPoints();
});

/*👁*/


/*==========================================================================*/
         //*!Formulario de registro*/
/*==========================================================================*/
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formregister");

    form.addEventListener("submit", (e) => {
        // Evita que el formulario se envíe automáticamente y recargue la página
        e.preventDefault(); 
        
        // Captura los valores actuales de los inputs eliminando espacios vacíos al inicio/final
        const nombre = document.getElementById("regisNombres").value.trim();
        const apellidos = document.getElementById("regisApellidos").value.trim();
        const phone = document.getElementById("regisphone").value.trim();
        const email = document.getElementById("regisEmail").value.trim();
        const emailconf = document.getElementById("regisEmailconf").value.trim();
        const password = document.getElementById("regisPassword").value.trim();
        const passwordconf = document.getElementById("regisPasswordconf").value.trim();

        let errores = [];

        // 1. Valida campos vacíos
        if (!nombre || !apellidos || !phone || !email || !emailconf || !password || !passwordconf) {
            errores.push("Todos los campos son obligatorios.");
        }

        // 2. Valida formato de Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errores.push("Ingresa un correo válido.");
        }

        // 3. Valida coincidencia de correos
        if (email !== emailconf) {
            errores.push("Los correos no coinciden.");
        }

        // 4. Valida longitud de la contraseña
        if (password && password.length < 8) {
            errores.push("La contraseña debe tener al menos 8 caracteres.");
        }

        // 5. Valida coincidencia de contraseñas
        if (password !== passwordconf) {
            errores.push("Las contraseñas no coinciden.");
        }

        // 6. Evalua resultados
        if (errores.length > 0) {
          // Unir errores con salto de linea de HTML para el cuerpo de la alerta
          const mensajeErrores = errores.join("<br>");

          Swal.fire({
                title: 'Error de registro',
                html: mensajeErrores, // Se usa 'html' en lugar de 'text' para que interprete los <br>
                icon: 'error',
                confirmButtonText: 'Entendido',
                background: "#F6EBD9",
                confirmButtonColor: '#4b1d13'
            }); 
        } else {

          //Construcción de modelo de usuario
          const nuevoUsuario = {
            id: crypto.randomUUID(),
            nombre: nombre,
            apellidos: apellidos,
            telefono: phone,
            email: email,
            password: password,
            rol: "usuario",
            activo: true,
            };
            // Guardar usuario logueado
            localStorage.setItem(
                "mel_logged_user",
                JSON.stringify(nuevoUsuario)
            );
            Swal.fire({
                title: '¡Registro Exitoso!',
                text: 'Tu cuenta ha sido creada correctamente.',
                icon: 'success',
                confirmButtonText: 'Continuar',
                background: "#F6EBD9",
                confirmButtonColor: '#4b1d13'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Si el usuario da clic en 'Continuar', lo mandamos al login para que entre
                    mostrarVista("vista-mi-cuenta");
                      if (window.renderUserPointsGlobal) {
                          window.renderUserPointsGlobal();
                      };
                  }
            });
        }
    });
});


/* ==========================================================================
   MI CUENTA - WISHLIST
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const wishlistContainer = document.querySelector("#wishlist-container");
  const wishlistVacia = document.querySelector("#wishlist-vacia");

  if (!wishlistContainer || !wishlistVacia) {
    console.error("No se encontró #wishlist-container o #wishlist-vacia");
    return;
  }

  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  function formatearPrecio(precio) {
    return Number(precio || 0).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function renderWishlist() {
    wishlistContainer.innerHTML = "";

    if (wishlist.length === 0) {
      wishlistVacia.style.display = "flex";
      return;
    }

    wishlistVacia.style.display = "none";

    wishlist.forEach((libro) => {
      const card = document.createElement("div");
      card.classList.add("wishlist-card");

      card.innerHTML = `
        <img 
          src="${libro.imagen}" 
          alt="${libro.titulo}" 
          class="wishlist-img"
        >

        <div class="wishlist-info">
          <div>
            <h3>${libro.titulo}</h3>

            <p>
              ${libro.descripcion || "Sin descripción disponible."}
            </p>

            <p class="wishlist-precio">
              $${formatearPrecio(libro.precio)}
            </p>
          </div>

          <div class="wishlist-actions">
            <button
              class="btn-carrito-wishlist"
              data-id="${libro.id}"
              data-titulo="${libro.titulo}"
              data-precio="${libro.precio}"
              data-portada="${libro.imagen}">
              Agregar al carrito
            </button>

            <button
              class="btn-eliminar-wishlist"
              data-id="${libro.id}">
              Eliminar
            </button>
          </div>
        </div>
      `;

      wishlistContainer.appendChild(card);
    });
  }

  wishlistContainer.addEventListener("click", (e) => {
    const botonCarrito = e.target.closest(".btn-carrito-wishlist");
    const botonEliminar = e.target.closest(".btn-eliminar-wishlist");

    if (botonEliminar) {
      const id = botonEliminar.dataset.id;

      wishlist = wishlist.filter((libro) => String(libro.id) !== String(id));

      localStorage.setItem("wishlist", JSON.stringify(wishlist));

      renderWishlist();

      return;
    }

    if (botonCarrito) {
      const producto = {
        id: botonCarrito.dataset.id,
        titulo: botonCarrito.dataset.titulo,
        precio: Number(botonCarrito.dataset.precio),
        portada: botonCarrito.dataset.portada,
        cantidad: 1
      };

      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

      const existe = carrito.find(
        (item) => String(item.id) === String(producto.id)
      );

      if (existe) {
        existe.cantidad++;
      } else {
        carrito.push(producto);
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));

      botonCarrito.textContent = "Agregado";

      return;
    }
  });

  renderWishlist();
});

document.addEventListener("DOMContentLoaded", () => {
  const btnWishlistSaga = document.getElementById("btnWishlistSaga");

  if (!btnWishlistSaga) return;

  btnWishlistSaga.addEventListener("click", () => {
    const sagaWishlist = {
      id: btnWishlistSaga.dataset.id,
      titulo: btnWishlistSaga.dataset.titulo,
      precio: Number(btnWishlistSaga.dataset.precio),
      imagen: btnWishlistSaga.dataset.imagen,
      descripcion: btnWishlistSaga.dataset.descripcion,
      tipo: "saga"
    };

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const existe = wishlist.some(
      item => String(item.id) === String(sagaWishlist.id)
    );

    if (!existe) {
      wishlist.push(sagaWishlist);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }

    btnWishlistSaga.classList.add("activo");
    btnWishlistSaga.title = "Saga guardada en wishlist";
  });
});

/* ==========================================================================
   MI CUENTA - LOG IN (UNIFICADO CON EL REDIRECCIONAMIENTO SPA)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  // 1. Inyección de Estilos Avanzados (Mantiene account.css intacto)
  const style = document.createElement("style");
  style.innerHTML = `
        .is-invalid-login-js { border-color: #b22222 !important; box-shadow: 0 0 0 3px rgba(178, 34, 34, 0.15) !important; }
        .is-valid-login-js { border-color: #2e5a44 !important; box-shadow: 0 0 0 3px rgba(46, 90, 68, 0.15) !important; }
        .toggle-password-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.1rem;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #521f12;
            opacity: 0.7;
            transition: opacity 0.2s;
            z-index: 10;
        }
        .toggle-password-icon:hover { opacity: 1; }
        .caps-warning-message {
            display: block;
            color: #a0653d;
            font-size: 0.85rem;
            font-weight: 700;
            margin-top: 4px;
            transition: all 0.2s ease;
        }
    `;
  document.head.appendChild(style);

  // Selector de elementos
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const capsLockWarning = document.getElementById("capsLockWarning");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const loginSuccess = document.getElementById("loginSuccess");
  const submitBtn = loginForm.querySelector(".login-btn");

  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // 2. PLUS: Alternar visibilidad de contraseña
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      togglePasswordBtn.textContent = isPassword ? "👁" : "👁";
      togglePasswordBtn.setAttribute("aria-label", isPassword ? "Ocultar contraseña" : "Mostrar contraseña");
    });
  }

  // 3. PLUS: Detección nativa de Caps Lock (Bloqueo de Mayúsculas)
  if (passwordInput && capsLockWarning) {
    passwordInput.addEventListener("keyup", (event) => {
      if (event.getModifierState && event.getModifierState("CapsLock")) {
        capsLockWarning.style.display = "block";
      } else {
        capsLockWarning.style.display = "none";
      }
    });
    
    // Asegurar que se oculte si el usuario sale del input
    passwordInput.addEventListener("blur", () => {
      capsLockWarning.style.display = "none";
    });
  }

  // 4. Algoritmo de Entropía Estructural y Análisis de Patrones Vulnerables
  function evaluarSeguridadPassword(password) {
    if (password.length === 0) return { isValid: false, msg: "La contraseña es obligatoria." };
    if (password.length < 8) return { isValid: false, msg: "La contraseña debe tener una longitud mínima de 8 caracteres." };
    if (password.length > 128) return { isValid: false, msg: "La contraseña excede el límite seguro permitido." };

    // Lista negra: Palabras de diccionarios comunes o contextos predecibles de la app
    const blacklist = ["12345678", "password", "contraseña", "admin1234", "mundoentrelibros", "libros2026"];
    if (blacklist.includes(password.toLowerCase())) {
      return { isValid: false, msg: "Contraseña extremadamente común y peligrosa. Utiliza una combinación más impredecible." };
    }

    // Detección de repeticiones continuas de un mismo carácter (ej: aaaaaa, 111111)
    if (/(\w)\1{3,}/.test(password)) {
      return { isValid: false, msg: "Evita usar caracteres o números repetidos consecutivamente." };
    }

    // Detección de secuencias lineales comunes de teclado (Keyboard walks)
    const keyboardPatterns = ["qwerty", "asdfgh", "zxcvbn", "12345", "54321"];
    const lowerPass = password.toLowerCase();
    const tienePatronTeclado = keyboardPatterns.some(pattern => lowerPass.includes(pattern));
    if (tienePatronTeclado) {
      return { isValid: false, msg: "La contraseña contiene patrones secuenciales de teclado fáciles de adivinar." };
    }

    return { isValid: true, msg: "" };
  }

  // 5. Validadores individuales integrados
  const checarEmail = () => {
    if (!emailInput || !emailError) return true;
    const value = emailInput.value.trim();
    let isValid = true;
    let mensaje = "";

    if (value.length === 0) {
      mensaje = "El correo electrónico es obligatorio.";
      isValid = false;
    } else if (!regexEmail.test(value)) {
      mensaje = "Por favor, ingresa un correo electrónico válido (ej. mail@example.com).";
      isValid = false;
    }

    if (isValid) {
      emailError.textContent = "";
      emailInput.classList.remove("is-invalid-login-js", "input-error");
      emailInput.classList.add("is-valid-login-js");
    } else {
      emailError.textContent = mensaje;
      emailInput.classList.remove("is-valid-login-js");
      emailInput.classList.add("is-invalid-login-js");
    }
    return isValid;
  };

  const checarPassword = () => {
    if (!passwordInput || !passwordError) return true;
    
    // Evaluamos la contraseña mediante el analizador heurístico
    const analisis = evaluarSeguridadPassword(passwordInput.value);

    if (analisis.isValid) {
      passwordError.textContent = "";
      passwordInput.classList.remove("is-invalid-login-js");
      passwordInput.classList.add("is-valid-login-js");
    } else {
      passwordError.textContent = analisis.msg;
      passwordInput.classList.remove("is-valid-login-js");
      passwordInput.classList.add("is-invalid-login-js");
    }
    return analisis.isValid;
  };

  // Escuchas en tiempo real
  if (emailInput) emailInput.addEventListener("input", checarEmail);
  if (passwordInput) passwordInput.addEventListener("input", checarPassword);

  // 6. Control del Formulario con SweetAlert2 e integración SPA
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Detenemos comportamiento original para validar primero

    const isEmailValid = checarEmail();
    const isPasswordValid = checarPassword();

    if (!isEmailValid || !isPasswordValid) {
      if (!isEmailValid) {
        emailInput.focus();
      } else if (!isPasswordValid) {
        passwordInput.focus();
      }

      // Despliegue de la alerta con los estilos corporativos
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "warning",
          title: "Datos incorrectos",
          text: "Por favor, corrige los campos marcados antes de enviar. Asegúrate de usar una contraseña con estructura segura y sin patrones predecibles.",
          confirmButtonText: "Corregir",
          confirmButtonColor: "#4B1D13",
          background: "#F6EBD9",
          color: "#521F12",
        });
      } else {
        alert("Por favor, corrige los campos marcados en rojo antes de continuar.");
      }
      return;
    }

    // FLUJO DE ÉXITO: Fusionado aquí para evitar la duplicación de listeners del submit
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Autenticando de forma segura...";

    // Simulamos respuesta exitosa del backend o validación de Israel
    setTimeout(() => {
      // 1. Redireccionamos usando la función SPA corregida
      mostrarVista("vista-mi-cuenta");
      
      // 2. Cargamos dinámicamente los puntos del usuario que se logueó
      if (window.renderUserPointsGlobal) {
         window.renderUserPointsGlobal();
      }

      // 3. Limpiamos campos de forma segura
      loginForm.reset();
      emailInput.classList.remove("is-valid-login-js");
      passwordInput.classList.remove("is-valid-login-js");
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 1000);
  });
});


// Historial
// Historial
document.addEventListener("DOMContentLoaded", () => {

    // CORREGIDO: Selecciona tu botón real usando el atributo data-target
    const btnHistorial = document.querySelector('button[data-target="historial"]');
    
    // Selecciona el contenedor que tienes dentro de #sec-historial
    const contenedor = document.getElementById("contenido");

    // Selectores del modal
    const modal = document.getElementById("modal-historial");
    const modalBody = document.getElementById("modal-body");
    const closeModal = document.querySelector(".close-modal");

    if (!btnHistorial || !contenedor) {
        console.warn("No se encontró el botón con data-target='historial' o el div '#contenido'.");
        return;
    }

    // ==========================================================================
    // EVENTO CLICK: Escucha tu botón del sidebar y pinta los datos fijamente
    // ==========================================================================
    btnHistorial.addEventListener("click", () => {
        // Asegura que la sección de historial sea visible activando la clase de tu CSS
        const seccionPadre = document.getElementById("sec-historial");
        if (seccionPadre) {
            seccionPadre.style.display = "block";
            seccionPadre.classList.add("active");
        }

        mostrarHistorial();
    });

    // =========================
    // MOSTRAR HISTORIAL
    // =========================
    function mostrarHistorial() {
        const historial = JSON.parse(localStorage.getItem("historialCompras")) || [];

        contenedor.innerHTML = "";

        if (historial.length === 0) {
            contenedor.innerHTML = `<p class="empty" style="padding: 20px; text-align: center; color: #521f12; font-weight: 700;">No hay compras registradas en tu historial.</p>`;
            return;
        }

        historial.forEach(compra => {
            const card = document.createElement("div");
            card.classList.add("card-historial");

            card.innerHTML = `
                <span class="pedido-numero">#Pedido ${compra.idCompra}</span>
                <span class="pedido-total">$${compra.total}</span>
                <span class="pedido-productos">${compra.productos.length} productos</span>
                <span class="pedido-estado">${compra.status || "pendiente"}</span>
                <button class="btn-ver">Ver detalles</button>
            `;

            contenedor.appendChild(card);

            card.querySelector(".btn-ver").addEventListener("click", () => {
                abrirModal(compra);
            });
        });
    }

    // =========================
    // PARSE FECHA DD/MM/YYYY
    // =========================
    function parseFecha(fecha) {
        if (!fecha) return null;
        const partes = fecha.split("/");
        if (partes.length !== 3) return null;
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;
        const anio = parseInt(partes[2], 10);
        const d = new Date(anio, mes, dia);
        return isNaN(d.getTime()) ? null : d;
    }

    // =========================
    // SUMAR DÍAS
    // =========================
    function sumarDias(fecha, dias) {
        const nuevaFecha = new Date(fecha);
        nuevaFecha.setDate(nuevaFecha.getDate() + dias);
        return nuevaFecha;
    }

    // =========================
    // MODAL
    // =========================
    function abrirModal(compra) {
        const fechaPedido = parseFecha(compra.fecha);
        const isPagado = compra.status === "pagado";
        const fechaPedidoTexto = compra.fecha || "Sin fecha";
        let entregaTexto = "Pendiente";

        if (isPagado) {
            let fechaBase = null;
            if (compra.fechaPago) {
                fechaBase = new Date(compra.fechaPago);
            } else {
                fechaBase = fechaPedido;
            }

            if (fechaBase) {
                const entrega = sumarDias(fechaBase, 15);
                entregaTexto = entrega.toLocaleDateString("es-MX");
            }
        }

        const libros = compra.productos.filter(p => p.cantidad === 1);
        const sagas = compra.productos.filter(p => p.cantidad > 1);

        if (modalBody) {
            modalBody.innerHTML = `
            <div class="tabla-info">
                <div class="col">
                    <p><b>Compra:</b> #${compra.idCompra}</p>
                    <p><b>Fecha:</b> ${fechaPedidoTexto}</p>
                    <p><b>Entrega:</b> ${entregaTexto}</p>
                </div>
                <div class="col">
                    <p><b>Estado:</b> ${compra.status || "pendiente"}</p>
                    <p><b>Total:</b> $${compra.total}</p>
                </div>
            </div>
            <hr>
            <h3>📚 Libros</h3>
            <div class="grid-libros">
                ${libros.length ? libros.map(p => `
                    <div class="item-libro">
                        <img src="${p.portada}">
                        <div>
                            <p><b>${p.titulo}</b></p>
                            <small>$${p.precio} x ${p.cantidad}</small>
                        </div>
                    </div>
                `).join("") : "<p>Sin libros</p>"}
            </div>
            <h3>📦 Sagas</h3>
            <div class="grid-libros">
                ${sagas.length ? sagas.map(p => `
                    <div class="item-libro saga">
                        <img src="${p.portada}">
                        <div>
                            <p><b>${p.titulo}</b></p>
                            <small>$${p.precio} x ${p.cantidad}</small>
                        </div>
                    </div>
                `).join("") : "<p>Sin sagas</p>"}
            </div>
            <div class="pagar-wrapper">
                ${!isPagado ? `<button id="btn-pagar" class="btn-ver pagar">Pagar</button>` : `<p class="pagado">✔ Pagado</p>`}
            </div>
            `;
        }

        if (modal) modal.style.display = "flex";

        const btnPagar = document.getElementById("btn-pagar");
        if (btnPagar) {
            btnPagar.addEventListener("click", () => {
                let historial = JSON.parse(localStorage.getItem("historialCompras")) || [];
                const index = historial.findIndex(h => h.idCompra === compra.idCompra);

                if (index !== -1) {
                    historial[index].status = "pagado";
                    historial[index].fechaPago = new Date().toISOString();
                    localStorage.setItem("historialCompras", JSON.stringify(historial));
                }

                if (modal) modal.style.display = "none";
                mostrarHistorial();
            });
        }
    }

    // =========================
    // CERRAR MODAL
    // =========================
    if (closeModal) {
        closeModal.addEventListener("click", () => {
            if (modal) modal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (modal && e.target === modal) {
            modal.style.display = "none";
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // === CONTROL DEL SIDEBAR INTERNO DE MI CUENTA (IZQUIERDO) ===
    // Eliminamos el bloque duplicado de vistas principales para que no choque con la sección SPA de arriba
    const botonesMenu = document.querySelectorAll('.sidebar-menu .menu-btn');
    const seccionesContenido = document.querySelectorAll('.main-content .content-section');

    botonesMenu.forEach(boton => {
        boton.addEventListener('click', () => {
            // Remover la clase active de todos los botones
            botonesMenu.forEach(btn => btn.classList.remove('active'));
            // Añadir active al botón presionado
            boton.classList.add('active');

            // Obtener el target del botón (actualizar, historial, puntos, wishlist)
            const target = boton.getAttribute('data-target');

            // Ocultar todas las sub-secciones del contenido principal
            seccionesContenido.forEach(seccion => {
                seccion.style.display = 'none';
            });

            // Mostrar la sección correspondiente emparejando el ID "sec-[target]"
            const seccionAMostrar = document.getElementById(`sec-${target}`);
            if (seccionAMostrar) {
                seccionAMostrar.style.display = 'block';
            }
        });
    });
    
    // Vinculación opcional: si tienes un botón de menú exterior para forzar la vista de cuenta
    const navMiCuentaBtn = document.getElementById('nav-mi-cuenta-btn');
    if (navMiCuentaBtn) {
        navMiCuentaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Si el storage tiene un usuario, va directo a cuenta, si no, al login
            const sessionActive = localStorage.getItem("mel_logged_user");
            mostrarVista(sessionActive ? "vista-mi-cuenta" : "vista-login");
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================================================
    // 1. Control del Menú Lateral / SPA (Mostrar/Ocultar Vistas)
    // ==========================================================================
    const menuButtons = document.querySelectorAll(".menu-btn");
    const contentSections = document.querySelectorAll(".content-section");

    menuButtons.forEach(button => {
        button.addEventListener("click", () => {
            menuButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            contentSections.forEach(section => section.style.display = "none");

            const targetSectionId = `sec-${button.getAttribute("data-target")}`;
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.style.display = "block";
                
                if(button.getAttribute("data-target") === "actualizar") {
                    cargarDatosUsuario();
                }
            }
        });
    });

    // ==========================================================================
    // 2. Carga Asíncrona de act.json con protección anti-errores
    // ==========================================================================
    function cargarDatosUsuario() {
        const datosLocales = localStorage.getItem("usuario_perfil");

        if (datosLocales) {
            inyectarDatosEnPantalla(JSON.parse(datosLocales));
        } else {
            fetch("/act.json") 
                .then(response => {
                    if (!response.ok) throw new Error("Error al abrir act.json");
                    return response.text(); 
                })
                .then(texto => {
                    // Si el archivo está vacío, pasa un objeto vacío sin romper el flujo
                    const datosDesdeJson = texto ? JSON.parse(texto) : {};
                    inyectarDatosEnPantalla(datosDesdeJson);
                })
                .catch(error => {
                    console.error("Aviso: act.json está vacío o no se encontró. Iniciando limpio.", error);
                    inyectarDatosEnPantalla({ nombre: "", apellido: "", telefono: "", email: "" });
                });
        }
    }

    function inyectarDatosEnPantalla(datos) {
        document.getElementById("update-nombre").value = datos.nombre || "";
        document.getElementById("update-apellido").value = datos.apellido || "";
        document.getElementById("update-telefono").value = datos.telefono || "";
        document.getElementById("update-email").value = datos.email || "";
        document.getElementById("update-email-confirm").value = datos.email || "";
    }

    // ==========================================================================
    // 3. Sistema de Restricciones y Validaciones (Submit del Formulario)
    // ==========================================================================
    const formUpdate = document.getElementById("form-update-profile");
    if (formUpdate) {
        formUpdate.addEventListener("submit", (e) => {
            e.preventDefault(); // Detiene la recarga de página

            // Captura de valores limpios sin espacios en los extremos
            const nombre = document.getElementById("update-nombre").value.trim();
            const apellido = document.getElementById("update-apellido").value.trim();
            const telefono = document.getElementById("update-telefono").value.trim();
            const email = document.getElementById("update-email").value.trim();
            const emailConfirm = document.getElementById("update-email-confirm").value.trim();
            const password = document.getElementById("update-password").value;
            const passwordConfirm = document.getElementById("update-password-confirm").value;

            // --- EXPRESIONES REGULARES (RESTRICCIONES) ---
            const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/; // Solo letras y acentos
            const regexTelefono = /^\d{10}$/; // Exactamente 10 números continuos
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Estructura válida de correo electrónico
            const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // Min 8 caracteres, 1 Mayús, 1 Minús, 1 Núm

            // Validación: Campos Obligatorios Base vacíos
            if (!nombre || !apellido || !telefono || !email || !emailConfirm) {
                mostrarAlerta("Campos incompletos", "Por favor, rellena todos los campos de tus datos personales.", "error");
                return;
            }

            // Restricción: Nombre y Apellido válidos
            if (!regexLetras.test(nombre) || !regexLetras.test(apellido)) {
                mostrarAlerta("Formato inválido", "El nombre y el apellido solo deben contener letras.", "warning");
                return;
            }

            //  Restricción: Teléfono de 10 dígitos
            if (!regexTelefono.test(telefono)) {
                mostrarAlerta("Teléfono inválido", "El número de teléfono debe tener exactamente 10 dígitos numéricos.", "warning");
                return;
            }

            // Restricción: Estructura del Email
            if (!regexEmail.test(email)) {
                mostrarAlerta("Correo inválido", "Por favor, ingresa una dirección de correo electrónico válida.", "warning");
                return;
            }

            // Validación: Coincidencia de correos
            if (email !== emailConfirm) {
                mostrarAlerta("Correos no coinciden", "El correo ingresado y su confirmación no son iguales.", "error");
                return;
            }

            // Restricciones de Contraseña (Solo si el usuario escribe algo en el campo)
            if (password || passwordConfirm) {
                // Validación: Coincidencia de contraseñas
                if (password !== passwordConfirm) {
                    mostrarAlerta("Contraseñas diferentes", "La nueva contraseña y su confirmación no coinciden.", "error");
                    return;
                }
                
                // Restricción: Formato y longitud de 8 dígitos seguros
                if (!regexPassword.test(password)) {
                    mostrarAlerta(
                        "Contraseña insegura", 
                        "La contraseña debe tener mínimo 8 caracteres, e incluir al menos una letra mayúscula, una minúscula y un número.", 
                        "info"
                    );
                    return;
                }
            }

            // ==========================================================================
            // 4. Guardado Exitoso con Limpieza y Cierre de Sección
            // ==========================================================================
            const datosActualizados = { nombre, apellido, telefono, email };
            
            // Guardamos localmente para persistencia inmediata en la SPA
            localStorage.setItem("usuario_perfil", JSON.stringify(datosActualizados));

            // Alerta de éxito con SweetAlert2
            Swal.fire({
                icon: 'success',
                title: '¡Datos guardados con éxito!',
                text: 'Tu perfil en Mundo Entre Libros ha sido actualizado.',
                confirmButtonColor: '#3B1A11'
            }).then((result) => {
                // Este bloque se ejecuta JUSTO CUANDO EL USUARIO LE DA CLIC AL BOTÓN "OK"
                if (result.isConfirmed) {
                    
                    // 1. Limpiamos por completo todos los campos del formulario
                    formUpdate.reset();

                    // 2. Escondemos la sección de actualizar datos para que no se vea más
                    const secActualizar = document.getElementById("sec-actualizar");
                    if (secActualizar) {
                        secActualizar.style.display = "none";
                    }

                    // 3. Quitamos la selección visual (clase active) del menú lateral
                    menuButtons.forEach(btn => btn.classList.remove("active"));
                }
            });
        });
    }
          
    // Función auxiliar para acortar las llamadas de alertas de SweetAlert2
    function mostrarAlerta(titulo, mensaje, tipo) {
        Swal.fire({
            icon: tipo,
            title: titulo,
            text: mensaje,
            confirmButtonColor: '#3B1A11'
        });
    }
});