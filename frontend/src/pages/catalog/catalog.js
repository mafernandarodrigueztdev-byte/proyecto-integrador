/* =====================================
   CATÁLOGO - MUNDO ENTRE LIBROS
   ===================================== */

/* =====================================
   VARIABLES GLOBALES
   ===================================== */

let todosLosLibros = [];
let todasLasSagas = [];

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
        "fantasia": "Fantasía",
        "terror": "Terror",
        "desarrollo-personal": "Desarrollo personal",
        "ciencia-ficcion": "Ciencia Ficción",
        "educacion-financiera": "Educación financiera",
        "psicologia": "Psicología"
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
   CARD SAGA
   ===================================== */

function crearCardSaga(saga, libros) {
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
   CATEGORÍAS
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
   CARD LIBRO
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
   EVENTO VER DETALLES LIBRO
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
   EVENTO VER DETALLES SAGAS
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
   CARD LIBRO DENTRO DEL MODAL DE SAGA
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
   AGREGAR AL CARRITO
   ===================================== */

document.addEventListener("click", function (evento) {
    const botonCarrito = evento.target.closest(".btn-carrito");

    if (botonCarrito) {
        const producto = {
            id: String(botonCarrito.dataset.id),
            titulo: botonCarrito.dataset.titulo,
            precio: Number(botonCarrito.dataset.precio),
            portada: botonCarrito.dataset.portada,
            cantidad: 1
        };

        if (!producto.id || !producto.titulo || Number.isNaN(producto.precio) || !producto.portada) {
            console.error("Producto incompleto:", producto);
            return;
        }

        agregarProductoAlCarrito(producto);
        return;
    }

    const botonSaga = evento.target.closest(".btn-carrito-saga");

    if (botonSaga) {
        const idSaga = botonSaga.dataset.saga;
        const saga = todasLasSagas.find((item) => item.id === idSaga);

        if (!saga) {
            console.error("Saga no encontrada:", idSaga);
            return;
        }

        const librosDeSaga = todosLosLibros.filter((libro) => saga.libros.includes(libro.id));

        librosDeSaga.forEach((libro) => {
            agregarProductoAlCarrito(
                {
                    id: String(libro.id),
                    titulo: libro.titulo,
                    precio: Number(libro.precio),
                    portada: libro.portada,
                    cantidad: 1
                },
                false
            );
        });

        mostrarAlertaCarrito(
            "Saga agregada",
            `Se agregaron ${librosDeSaga.length} libros de ${saga.nombre} al carrito.`
        );
    }
});

function obtenerCarrito() {
    try {
        return JSON.parse(localStorage.getItem("carrito")) || [];
    } catch (error) {
        console.error("Error leyendo carrito:", error);
        return [];
    }
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function agregarProductoAlCarrito(producto, mostrarAlerta = true) {
    const carrito = obtenerCarrito();

    const productoExiste = carrito.find((item) => String(item.id) === String(producto.id));

    if (productoExiste) {
        productoExiste.cantidad = Number(productoExiste.cantidad || 1) + 1;
    } else {
        carrito.push(producto);
    }

    guardarCarrito(carrito);
    actualizarContadorCarrito();

    if (mostrarAlerta) {
        mostrarAlertaCarrito(
            "Libro agregado",
            `${producto.titulo} se agregó correctamente al carrito.`
        );
    }
}

function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");

    if (!contador) return;

    const carrito = obtenerCarrito();

    const total = carrito.reduce((suma, producto) => {
        return suma + Number(producto.cantidad || 1);
    }, 0);

    contador.textContent = total;
}

function mostrarAlertaCarrito(titulo, texto) {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon: "success",
            title: titulo,
            text: texto,
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#4B1D13",
            background: "#F6EBD9",
            color: "#521F12"
        });

        return;
    }

    alert(texto);
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
    actualizarContadorCarrito();
});