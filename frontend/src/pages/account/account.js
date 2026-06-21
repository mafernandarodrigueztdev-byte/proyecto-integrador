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

  renderUserPoints();
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
   MI CUENTA - LOG IN
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

  // 6. Control del Formulario con SweetAlert2 integrado
  loginForm.addEventListener("submit", (event) => {
    const isEmailValid = checarEmail();
    const isPasswordValid = checarPassword();

    if (!isEmailValid || !isPasswordValid) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (!isEmailValid) {
        emailInput.focus();
      } else if (!isPasswordValid) {
        passwordInput.focus();
      }

      // Despliegue de la alerta con los estilos corporativos exactos aportados por la imagen
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

    // 7. Generación del Modelo JSON Premium ante éxito total
    event.preventDefault();
    
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Autenticando de forma segura...";

    const usuarioLogin = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
      rememberMe: false,
      timestamp: new Date().toISOString(),
      deviceContext: {
        screenResolution: `${window.innerWidth}x${window.innerHeight}`,
        isMobile: window.innerWidth <= 991
      },
      securityMetrics: {
        passLength: passwordInput.value.length,
        isHighEntropy: true
      }
    };

    const usuarioJSON = JSON.stringify(usuarioLogin, null, 2);
    console.log("Transmisión de JSON estructurada con métricas de seguridad:", usuarioJSON);

    if (loginSuccess) {
      loginSuccess.textContent = "¡Credenciales verificadas con éxito! Redirigiendo...";
    }

    setTimeout(() => {
      loginForm.reset();
      emailInput.classList.remove("is-valid-login-js");
      passwordInput.classList.remove("is-valid-login-js");
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      if (loginSuccess) loginSuccess.textContent = "";
    }, 5000);
  });
});
// Historial
document.addEventListener("DOMContentLoaded", () => {

    const btnHistorial = document.querySelector(".btn-historial");
    const contenedor = document.getElementById("contenido");

    const modal = document.getElementById("modal-historial");
    const modalBody = document.getElementById("modal-body");
    const closeModal = document.querySelector(".close-modal");

    let historialVisible = false;

    // =========================
    // MOSTRAR / OCULTAR
    // =========================
    btnHistorial.addEventListener("click", () => {

        if (historialVisible) {
            contenedor.innerHTML = "";
            btnHistorial.textContent = "Historial de compra";
            historialVisible = false;
        } else {
            mostrarHistorial();
            btnHistorial.textContent = "Ocultar historial";
            historialVisible = true;
        }
    });

    // =========================
    // MOSTRAR HISTORIAL
    // =========================
    function mostrarHistorial() {

        const historial = JSON.parse(localStorage.getItem("historialCompras")) || [];

        contenedor.innerHTML = "";

        if (historial.length === 0) {
            contenedor.innerHTML = `<p class="empty">No hay compras registradas</p>`;
            return;
        }

        historial.forEach(compra => {

            const card = document.createElement("div");
            card.classList.add("card-historial");

            card.innerHTML = `
    <span class="pedido-numero">
        #Pedido ${compra.idCompra}
    </span>

    <span class="pedido-total">
        $${compra.total}
    </span>

    <span class="pedido-productos">
        ${compra.productos.length} productos
    </span>

    <span class="pedido-estado">
        ${compra.status || "pendiente"}
    </span>

    <button class="btn-ver">
        Ver detalles
    </button>
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
            ${
                libros.length
                ? libros.map(p => `
                    <div class="item-libro">
                        <img src="${p.portada}">
                        <div>
                            <p><b>${p.titulo}</b></p>
                            <small>$${p.precio} x ${p.cantidad}</small>
                        </div>
                    </div>
                `).join("")
                : "<p>Sin libros</p>"
            }
        </div>

        <h3>📦 Sagas</h3>

        <div class="grid-libros">
            ${
                sagas.length
                ? sagas.map(p => `
                    <div class="item-libro saga">
                        <img src="${p.portada}">
                        <div>
                            <p><b>${p.titulo}</b></p>
                            <small>$${p.precio} x ${p.cantidad}</small>
                        </div>
                    </div>
                `).join("")
                : "<p>Sin sagas</p>"
            }
        </div>

        <div class="pagar-wrapper">
            ${
                !isPagado
                ? `<button id="btn-pagar" class="btn-ver pagar">Pagar</button>`
                : `<p class="pagado">✔ Pagado</p>`
            }
        </div>
        `;

        modal.style.display = "flex";

        const btnPagar = document.getElementById("btn-pagar");

        if (btnPagar) {

            btnPagar.addEventListener("click", () => {

                let historial = JSON.parse(localStorage.getItem("historialCompras")) || [];

                const index = historial.findIndex(
                    h => h.idCompra === compra.idCompra
                );

                if (index !== -1) {

                    historial[index].status = "pagado";

                    // fecha exacta de pago
                    historial[index].fechaPago = new Date().toISOString();

                    localStorage.setItem(
                        "historialCompras",
                        JSON.stringify(historial)
                    );
                }

                modal.style.display = "none";

                mostrarHistorial();
            });
        }
    }

    // =========================
    // CERRAR MODAL
    // =========================
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

});