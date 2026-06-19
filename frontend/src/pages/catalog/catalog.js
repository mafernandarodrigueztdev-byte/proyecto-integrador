/* =====================================
   CATÁLOGO - MUNDO ENTRE LIBROS
   Este archivo:
   - Carga libros y sagas desde catalog.json
   - Renderiza sagas
   - Renderiza categorías de libros
   - Abre modal de libro
   - Abre modal de saga
   - NO maneja el carrito directamente
   ===================================== */

/* =====================================
   VARIABLES GLOBALES
   ===================================== */

let todosLosLibros = [];
let todasLasSagas = [];

/* Se exponen en window para que carrito.js pueda usarlas si las necesita */
window.todosLosLibros = todosLosLibros;
window.todasLasSagas = todasLasSagas;

/* =====================================
   CARGAR JSON
   ===================================== */

async function cargarCatalogo() {
  try {
    const respuesta = await fetch("/data/catalog.json");

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar catalog.json. Status: ${respuesta.status}`);
    }

    const data = await respuesta.json();

    todosLosLibros = Array.isArray(data.libros) ? data.libros : [];
    todasLasSagas = Array.isArray(data.sagas) ? data.sagas : [];

    window.todosLosLibros = todosLosLibros;
    window.todasLasSagas = todasLasSagas;

    const contenedor = document.getElementById("contenedor-categorias");

    if (!contenedor) {
      console.error("No existe #contenedor-categorias en catalog.html");
      return;
    }

    contenedor.innerHTML = "";

    generarSagas(todasLasSagas, todosLosLibros);
    generarCategorias(todosLosLibros);

    setTimeout(() => {
      igualarAlturasTarjetas();
    }, 100);

    console.log("Catálogo cargado correctamente:", data);
  } catch (error) {
    console.error("Error cargando catálogo:", error);

    const contenedor = document.getElementById("contenedor-categorias");

    if (contenedor) {
      contenedor.innerHTML = `
        <p class="catalog-error">
          No pudimos cargar el catálogo por el momento.
        </p>
      `;
    }
  }
}

/* =====================================
   FORMATEADORES
   ===================================== */

function formatearPrecio(precio) {
  return Number(precio || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatearCategoria(categoria) {
  const nombres = {
    "novela-juvenil": "Novela Juvenil",
    fantasia: "Fantasía",
    terror: "Terror",
    "desarrollo-personal": "Desarrollo personal",
    "ciencia-ficcion": "Ciencia Ficción",
    "educacion-financiera": "Educación financiera",
    psicologia: "Psicología"
  };

  return nombres[categoria] || categoria;
}

/* =====================================
   SAGAS
   ===================================== */

function generarSagas(sagas, libros) {
  if (!sagas || sagas.length === 0) return;

  const contenedor = document.getElementById("contenedor-categorias");

  const section = document.createElement("section");
  section.classList.add("categoria", "categoria-sagas");

  const titulo = `<h2 class="categoria-titulo">📚 Sagas</h2>`;

  const wrapper = document.createElement("div");
  wrapper.classList.add("carrusel-contenedor");

  const carruselDiv = document.createElement("div");
  carruselDiv.classList.add("carrusel-libros");

  carruselDiv.innerHTML = sagas
    .map((saga) => crearCardSaga(saga, libros))
    .join("");

  const btnIzq = document.createElement("button");
  btnIzq.classList.add("carrusel-btn", "carrusel-btn-izq");
  btnIzq.type = "button";
  btnIzq.innerHTML = "&lt;";
  btnIzq.setAttribute("aria-label", "Ver sagas anteriores");

  const btnDer = document.createElement("button");
  btnDer.classList.add("carrusel-btn", "carrusel-btn-der");
  btnDer.type = "button";
  btnDer.innerHTML = "&gt;";
  btnDer.setAttribute("aria-label", "Ver más sagas");

  btnIzq.addEventListener("click", () => moverCarrusel(carruselDiv, "izq"));
  btnDer.addEventListener("click", () => moverCarrusel(carruselDiv, "der"));

  wrapper.appendChild(carruselDiv);
  wrapper.appendChild(btnIzq);
  wrapper.appendChild(btnDer);

  section.innerHTML = titulo;
  section.appendChild(wrapper);

  contenedor.appendChild(section);
}

/* =====================================
   CARD DE SAGA
   ===================================== */

function crearCardSaga(saga) {
  const cantidadLibros = Array.isArray(saga.libros) ? saga.libros.length : 0;

  return `
    <article class="card card-libro card-saga">
      <img src="${saga.portada}" alt="${saga.nombre}" loading="lazy">

      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${saga.nombre}</h5>

        <p class="dato-libro">
          <strong>${cantidadLibros}</strong> libros
        </p>

        <div class="precio-container">
          <span class="texto-precio">Precio saga</span>
          <p class="precio">$${formatearPrecio(saga.precioSaga)}</p>
        </div>

        <button
          class="btn btn-sagas mt-auto"
          type="button"
          data-saga="${saga.id}"
        >
          Ver más
        </button>
      </div>
    </article>
  `;
}

/* =====================================
   CATEGORÍAS DE LIBROS
   ===================================== */

function generarCategorias(libros) {
  const contenedor = document.getElementById("contenedor-categorias");

  const categorias = [...new Set(libros.map((libro) => libro.categoria))];

  categorias.forEach((categoria) => {
    const librosCategoria = libros.filter((libro) => libro.categoria === categoria);
    crearCategoria(categoria, librosCategoria, contenedor);
  });
}

/* =====================================
   CREAR CATEGORÍA
   ===================================== */

function crearCategoria(categoria, libros, contenedor) {
  const section = document.createElement("section");
  section.classList.add("categoria");

  const titulo = `<h2 class="categoria-titulo">${formatearCategoria(categoria)}</h2>`;

  const wrapper = document.createElement("div");
  wrapper.classList.add("carrusel-contenedor");

  const carruselDiv = document.createElement("div");
  carruselDiv.classList.add("carrusel-libros");

  carruselDiv.innerHTML = libros
    .map((libro) => crearCardLibro(libro))
    .join("");

  const btnIzq = document.createElement("button");
  btnIzq.classList.add("carrusel-btn", "carrusel-btn-izq");
  btnIzq.type = "button";
  btnIzq.innerHTML = "&lt;";
  btnIzq.setAttribute("aria-label", "Ver libros anteriores");

  const btnDer = document.createElement("button");
  btnDer.classList.add("carrusel-btn", "carrusel-btn-der");
  btnDer.type = "button";
  btnDer.innerHTML = "&gt;";
  btnDer.setAttribute("aria-label", "Ver más libros");

  btnIzq.addEventListener("click", () => moverCarrusel(carruselDiv, "izq"));
  btnDer.addEventListener("click", () => moverCarrusel(carruselDiv, "der"));

  wrapper.appendChild(carruselDiv);
  wrapper.appendChild(btnIzq);
  wrapper.appendChild(btnDer);

  section.innerHTML = titulo;
  section.appendChild(wrapper);

  contenedor.appendChild(section);
}

/* =====================================
   CARD DE LIBRO
   ===================================== */

function crearCardLibro(libro) {
  return `
    <article class="card card-libro">
      <img src="${libro.portada}" alt="${libro.titulo}" loading="lazy">

      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${libro.titulo}</h5>

        <p class="dato-libro">
          <strong>Autor:</strong> ${libro.autor}
        </p>

        <p class="dato-libro">
          <strong>Editorial:</strong> ${libro.editorial}
        </p>

        <div class="precio-container">
          <span class="texto-precio">Precio</span>
          <p class="precio">$${formatearPrecio(libro.precio)}</p>
        </div>

        <button
          class="btn btn-libro mt-auto"
          type="button"
          data-id="${libro.id}"
        >
          Ver detalles
        </button>
      </div>
    </article>
  `;
}

/* =====================================
   MOVER CARRUSEL
   ===================================== */

function moverCarrusel(carruselDiv, direccion) {
  const paso = 280;

  if (direccion === "izq") {
    if (carruselDiv.scrollLeft <= 0) {
      carruselDiv.scrollTo({
        left: carruselDiv.scrollWidth - carruselDiv.clientWidth,
        behavior: "smooth"
      });
    } else {
      carruselDiv.scrollBy({
        left: -paso,
        behavior: "smooth"
      });
    }

    return;
  }

  const estaAlFinal =
    carruselDiv.scrollLeft + carruselDiv.clientWidth >= carruselDiv.scrollWidth - 5;

  if (estaAlFinal) {
    carruselDiv.scrollTo({
      left: 0,
      behavior: "smooth"
    });
  } else {
    carruselDiv.scrollBy({
      left: paso,
      behavior: "smooth"
    });
  }
}

/* =====================================
   EVENTO: VER DETALLES DE LIBRO
   ===================================== */

document.addEventListener("click", function (evento) {
  const btnLibro = evento.target.closest(".btn-libro");

  if (!btnLibro) return;

  const idLibro = Number(btnLibro.dataset.id);

  if (!idLibro) return;

  const libro = todosLosLibros.find((item) => item.id === idLibro);

  if (libro) {
    abrirModalLibro(libro);
  }
});

/* =====================================
   EVENTO: VER DETALLES DE SAGA
   ===================================== */

document.addEventListener("click", function (evento) {
  const btnSagas = evento.target.closest(".btn-sagas");

  if (!btnSagas) return;

  const idSaga = btnSagas.dataset.saga;

  if (!idSaga) return;

  const saga = todasLasSagas.find((item) => item.id === idSaga);

  if (saga) {
    abrirModalSagas(saga);
  }
});

/* =====================================
   ABRIR MODAL LIBRO
   ===================================== */

function abrirModalLibro(libro) {
  document.getElementById("tituloModal").textContent = libro.titulo;
  document.getElementById("imagenModal").src = libro.portada;
  document.getElementById("imagenModal").alt = libro.titulo;
  document.getElementById("autorModal").textContent = libro.autor;
  document.getElementById("cantidadModal").textContent = libro.saga || "Libro independiente";
  document.getElementById("editorialModal").textContent = libro.editorial;
  document.getElementById("edicionModal").textContent = libro.edicion;
  document.getElementById("isbnModal").textContent = libro.isbn;
  document.getElementById("precioModal").textContent = formatearPrecio(libro.precio);
  document.getElementById("sinopsisModal").textContent =
    libro.sinopsis || "Sinopsis disponible próximamente.";

  const botonCarrito = document.getElementById("btnCarrito");

  if (botonCarrito) {
    botonCarrito.dataset.id = String(libro.id);
    botonCarrito.dataset.titulo = libro.titulo;
    botonCarrito.dataset.precio = String(libro.precio);
    botonCarrito.dataset.portada = libro.portada;
  }
/*Wishlist */ 
  const btnWishlist = document.getElementById("btnWishlist");

if (btnWishlist) {
  btnWishlist.dataset.id = String(libro.id);
  btnWishlist.dataset.titulo = libro.titulo;
  btnWishlist.dataset.precio = String(libro.precio);
  btnWishlist.dataset.imagen = libro.portada;
  btnWishlist.dataset.descripcion = libro.sinopsis || "";
}

  const modal = new bootstrap.Modal(document.getElementById("modalLibro"));
  modal.show();
}


/* =====================================
   ABRIR MODAL SAGAS
   ===================================== */

function abrirModalSagas(saga) {
  document.getElementById("tituloModals").textContent = saga.nombre;
  document.getElementById("nombreSagaModal").textContent = saga.nombre;
  document.getElementById("imagenModals").src = saga.portada || "";
  document.getElementById("imagenModals").alt = saga.nombre;
  document.getElementById("isbnModals").textContent = saga.isbnSaga;
  document.getElementById("precioModals").textContent = formatearPrecio(saga.precioSaga);
  document.getElementById("descripcionModals").textContent =
    saga.descripcion || "Descripción disponible próximamente.";

  const contenedor = document.getElementById("carruselSaga");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.classList.add("carrusel-contenedor");

  const carruselDiv = document.createElement("div");
  carruselDiv.classList.add("carrusel-libros");

  const librosDeSaga = todosLosLibros.filter((libro) => {
    return Array.isArray(saga.libros) && saga.libros.includes(libro.id);
  });

  carruselDiv.innerHTML = librosDeSaga
    .map((libro) => crearCardLibroSagaModal(libro))
    .join("");

  const btnIzq = document.createElement("button");
  btnIzq.classList.add("carrusel-btn", "carrusel-btn-izq");
  btnIzq.type = "button";
  btnIzq.innerHTML = "&lt;";
  btnIzq.setAttribute("aria-label", "Ver libros anteriores de la saga");

  const btnDer = document.createElement("button");
  btnDer.classList.add("carrusel-btn", "carrusel-btn-der");
  btnDer.type = "button";
  btnDer.innerHTML = "&gt;";
  btnDer.setAttribute("aria-label", "Ver más libros de la saga");

  btnIzq.addEventListener("click", () => moverCarrusel(carruselDiv, "izq"));
  btnDer.addEventListener("click", () => moverCarrusel(carruselDiv, "der"));

  wrapper.appendChild(carruselDiv);
  wrapper.appendChild(btnIzq);
  wrapper.appendChild(btnDer);

  contenedor.appendChild(wrapper);

  const botonSagaCarrito = document.getElementById("btnAgregarSagaCarrito");

  if (botonSagaCarrito) {
    botonSagaCarrito.dataset.saga = saga.id;
  }

  /*Wishlist*/

const btnWishlistSaga = document.getElementById("btnWishlistSaga");

if (btnWishlistSaga) {
  btnWishlistSaga.dataset.id = String(saga.id);
  btnWishlistSaga.dataset.titulo = saga.nombre;
  btnWishlistSaga.dataset.precio = String(saga.precioSaga);
  btnWishlistSaga.dataset.imagen = saga.portada;
  btnWishlistSaga.dataset.descripcion = saga.descripcion || "Saga completa";
  btnWishlistSaga.dataset.tipo = "saga";
}

  const modalElement = document.getElementById("modalSagas");
  const modal = new bootstrap.Modal(modalElement);

  modalElement.addEventListener(
    "shown.bs.modal",
    () => {
      igualarAlturasTarjetasModalSaga();
    },
    { once: true }
  );

  modal.show();
}

/* =====================================
   CARD DE LIBRO DENTRO DEL MODAL DE SAGA
   ===================================== */

function crearCardLibroSagaModal(libro) {
  return `
    <article class="card card-libro card-libro-saga-modal">
      <img src="${libro.portada}" alt="${libro.titulo}" loading="lazy">

      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${libro.titulo}</h5>

        <p class="dato-libro">
          <strong>Autor:</strong> ${libro.autor}
        </p>

        <div class="precio-container">
          <span class="texto-precio">Precio</span>
          <p class="precio">$${formatearPrecio(libro.precio)}</p>
        </div>

        <button
          class="btn btn-libro mt-auto"
          type="button"
          data-id="${libro.id}"
        >
          Ver detalles
        </button>

        <button
          class="btn btn-carrito mt-2"
          type="button"
          data-id="${libro.id}"
          data-titulo="${libro.titulo}"
          data-precio="${libro.precio}"
          data-portada="${libro.portada}"
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  `;
}

/* =====================================
   IGUALAR ALTURAS DE CARDS
   ===================================== */

function igualarAlturasTarjetas() {
  const carruseles = document.querySelectorAll("#contenedor-categorias .carrusel-libros");

  carruseles.forEach((carrusel) => {
    const tarjetas = carrusel.querySelectorAll(".card-libro");

    if (tarjetas.length === 0) return;

    tarjetas.forEach((tarjeta) => {
      tarjeta.style.height = "auto";
    });

    let maxAltura = 0;

    tarjetas.forEach((tarjeta) => {
      const altura = tarjeta.offsetHeight;

      if (altura > maxAltura) {
        maxAltura = altura;
      }
    });

    tarjetas.forEach((tarjeta) => {
      tarjeta.style.height = `${maxAltura}px`;
    });
  });
}

function igualarAlturasTarjetasModalSaga() {
  const tarjetas = document.querySelectorAll("#modalSagas .card-libro");

  if (tarjetas.length === 0) return;

  tarjetas.forEach((tarjeta) => {
    tarjeta.style.height = "auto";
  });

  let maxAltura = 0;

  tarjetas.forEach((tarjeta) => {
    const altura = tarjeta.offsetHeight;

    if (altura > maxAltura) {
      maxAltura = altura;
    }
  });

  tarjetas.forEach((tarjeta) => {
    tarjeta.style.height = `${maxAltura}px`;
  });
}

/* =====================================
   RESPONSIVE / RESIZE
   ===================================== */

window.addEventListener("resize", () => {
  igualarAlturasTarjetas();
});

/* =====================================
   INICIO
   ===================================== */

document.addEventListener("DOMContentLoaded", () => {
  cargarCatalogo();
});

/* =====================================
   AGREGAR A WISHLIST
   ===================================== */
/*Libros */ 

document.addEventListener("DOMContentLoaded", () => {
  const btnWishlist = document.getElementById("btnWishlist");

  if (!btnWishlist) return;

  btnWishlist.addEventListener("click", () => {
    const libroWishlist = {
      id: btnWishlist.dataset.id,
      titulo: btnWishlist.dataset.titulo,
      precio: Number(btnWishlist.dataset.precio),
      imagen: btnWishlist.dataset.imagen,
      descripcion: btnWishlist.dataset.descripcion
    };

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const existe = wishlist.some((libro) => libro.id === libroWishlist.id);

    if (!existe) {
      wishlist.push(libroWishlist);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }

    btnWishlist.classList.add("activo");
    btnWishlist.setAttribute("title", "Guardado en wishlist");
  });
});

/* Sagas*/ 

const btnWishlistSaga = document.getElementById("btnWishlistSaga");

if (btnWishlistSaga) {
  btnWishlistSaga.addEventListener("click", () => {
    const itemWishlist = {
      id: btnWishlistSaga.dataset.id,
      titulo: btnWishlistSaga.dataset.titulo,
      precio: Number(btnWishlistSaga.dataset.precio),
      imagen: btnWishlistSaga.dataset.imagen,
      descripcion: btnWishlistSaga.dataset.descripcion,
      tipo: btnWishlistSaga.dataset.tipo
    };

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const existe = wishlist.some(
      item => String(item.id) === String(itemWishlist.id)
    );

    if (!existe) {
      wishlist.push(itemWishlist);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }

    btnWishlistSaga.classList.add("activo");
  });
}