document.addEventListener("DOMContentLoaded", () => {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const contadorCarrito = document.querySelector("#contador-carrito");

    const listaCarrito = document.querySelector("#lista-carrito");
    const resumenProductos = document.querySelector("#resumen-productos");
    const resumenSubtotal = document.querySelector("#resumen-subtotal");
    const resumenTotal = document.querySelector("#resumen-total");

    const listaOffcanvas = document.querySelector(".carrito-productos-lista");
    const totalOffcanvas = document.querySelector("#total-offcanvas");

    const offcanvas = document.querySelector("#offcanvasCarrito");
    const contenedorIconoCarrito = document.querySelector(".contenedor-carrito-offcanvas");

    if (offcanvas) {
        offcanvas.addEventListener("show.bs.offcanvas", () => {
            carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            renderizarCarrito();
        });
    }

    document.addEventListener("click", (e) => {
        const botonCarrito = e.target.closest(".btn-carrito");

        if (botonCarrito) {
            const producto = {
                id: botonCarrito.dataset.id,
                titulo: botonCarrito.dataset.titulo,
                precio: Number(botonCarrito.dataset.precio),
                portada: botonCarrito.dataset.portada,
                cantidad: 1
            };

            if (
                !producto.id ||
                !producto.titulo ||
                isNaN(producto.precio) ||
                !producto.portada
            ) {
                console.error("Producto incompleto:", producto);
                return;
            }

            agregarProducto(producto);
        }

        const botonSaga = e.target.closest(".btn-carrito-saga");

        if (botonSaga) {
            const idSaga = botonSaga.dataset.saga;

            const saga = window.todasLasSagas?.find(s => s.id === idSaga);

            if (!saga) {
                console.error("Saga no encontrada:", idSaga);
                return;
            }

            const cantidadLibros = Array.isArray(saga.libros) ? saga.libros.length : 0;

            const productoSaga = {
                id: `saga-${saga.id}`,
                titulo: `Saga: ${saga.nombre} (${cantidadLibros} libros)`,
                precio: Number(saga.precioSaga),
                portada: saga.portada,
                cantidad: 1
            };

            if (
                !productoSaga.id ||
                !productoSaga.titulo ||
                isNaN(productoSaga.precio) ||
                !productoSaga.portada
            ) {
                console.error("Saga incompleta:", productoSaga);
                return;
            }

            agregarProducto(productoSaga);
        }

        const botonEliminar = e.target.closest(".btn-eliminar-producto");

        if (botonEliminar) {
            eliminarProducto(botonEliminar.dataset.id);
        }

        const botonRestar = e.target.closest(".btn-restar-producto");

        if (botonRestar) {
            restarProducto(botonRestar.dataset.id);
        }

        const botonSumar = e.target.closest(".btn-sumar-producto");

        if (botonSumar) {
            sumarProducto(botonSumar.dataset.id);
        }
    });

    function agregarProducto(producto) {
        const productoExiste = carrito.find(item => item.id == producto.id);

        if (productoExiste) {
            productoExiste.cantidad++;
        } else {
            carrito.push({
                id: String(producto.id),
                titulo: producto.titulo,
                precio: Number(producto.precio),
                portada: producto.portada,
                cantidad: producto.cantidad
            });
        }

        guardarCarrito();
        renderizarCarrito();
        
        // 1. Disparamos la animación visual del número
        if (typeof animarContadorCarrito === 'function') {
            animarContadorCarrito(); 
        }
        
        // 2. Mostramos el mensaje flotante de éxito
        mostrarToastCarrito();
    }

    function mostrarToastCarrito() {
        const toast = document.getElementById("toast-carrito");
        if (!toast) return; // Si no encuentra el toast en el HTML, no hace nada

        // 1. Le agregamos la clase que lo hace visible
        toast.classList.add("mostrar");

        // 2. Usamos setTimeout para quitarle la clase después de 3 segundos (3000 ms)
        setTimeout(() => {
            toast.classList.remove("mostrar");
        }, 3000);
    }

    function sumarProducto(id) {
        const producto = carrito.find(item => item.id == id);

        if (producto) {
            producto.cantidad++;
        }

        guardarCarrito();
        renderizarCarrito();

        // Excelente idea agregar la animación aquí también
        if (typeof animarContadorCarrito === 'function') {
            animarContadorCarrito(); 
        }
    }

    function restarProducto(id) {
        const producto = carrito.find(item => item.id == id);

        if (producto) {
            producto.cantidad--;

            if (producto.cantidad <= 0) {
                carrito = carrito.filter(item => item.id != id);
            }
        }

        guardarCarrito();
        renderizarCarrito();
    }

    function eliminarProducto(id) {
        carrito = carrito.filter(item => item.id != id);

        guardarCarrito();
        renderizarCarrito();
    }

    function guardarCarrito() {
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    function calcularTotal() {
        return carrito.reduce((total, producto) => {
            return total + producto.precio * producto.cantidad;
        }, 0);
    }

    function calcularCantidadProductos() {
        return carrito.reduce((total, producto) => {
            return total + producto.cantidad;
        }, 0);
    }

    function actualizarContador() {
        if (!contadorCarrito) return;

        const cantidadProductos = calcularCantidadProductos();

        contadorCarrito.textContent = cantidadProductos > 99 ? "99+" : cantidadProductos;
    }

    function animarContadorCarrito() {
        if (!contadorCarrito) return;

        // 1. Quitamos la clase por si el usuario hace clics muy rápidos
        contadorCarrito.classList.remove("animacion-pop");
        
        // 2. Este pequeño truco fuerza al navegador a reiniciar la animación
        void contadorCarrito.offsetWidth; 
        
        // 3. Agregamos la clase de CSS que hace el "salto"
        contadorCarrito.classList.add("animacion-pop");

        // 4. La retiramos después de 300ms para que esté lista para la próxima vez
        setTimeout(() => {
            contadorCarrito.classList.remove("animacion-pop");
        }, 300);
    }

    function actualizarTotales() {
        const total = calcularTotal();
        const cantidadProductos = calcularCantidadProductos();

        if (resumenProductos) resumenProductos.textContent = cantidadProductos;
        if (resumenSubtotal) resumenSubtotal.textContent = `$${total}.00`;
        if (resumenTotal) resumenTotal.textContent = `$${total}.00`;
        if (totalOffcanvas) totalOffcanvas.textContent = `$${total}.00`;
    }

    function renderizarPaginaCarrito() {
        if (!listaCarrito) return;

        listaCarrito.innerHTML = "";

        if (carrito.length === 0) {
            listaCarrito.innerHTML = `
                <li class="carrito-vacio" id="mensaje-vacio">
                    Carrito vacío
                </li>
            `;
            return;
        }

        carrito.forEach(producto => {
            const li = document.createElement("li");
            li.classList.add("producto-carrito");

            li.innerHTML = `
                <img src="${producto.portada}" alt="${producto.titulo}" class="producto-carrito-img">

                <div class="producto-carrito-info">
                    <h3>${producto.titulo}</h3>
                    <p>Precio: $${producto.precio}.00</p>

                    <div class="producto-cantidad">
                        <button class="btn-restar-producto" data-id="${producto.id}">-</button>
                        <span>${producto.cantidad}</span>
                        <button class="btn-sumar-producto" data-id="${producto.id}">+</button>
                    </div>
                </div>

                <div class="producto-carrito-total">
                    <strong>$${producto.precio * producto.cantidad}.00</strong>

                    <button class="btn-eliminar-producto" data-id="${producto.id}">
                        Eliminar
                    </button>
                </div>
            `;

            listaCarrito.appendChild(li);
        });
    }

    function renderizarOffcanvas() {
        if (!listaOffcanvas) return;

        listaOffcanvas.innerHTML = "";

        if (carrito.length === 0) {
            listaOffcanvas.innerHTML = `
                <p class="text-muted text-center my-5">
                    Tu carrito está vacío actualmente.
                </p>
            `;
            return;
        }

        carrito.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("producto-offcanvas");

            div.innerHTML = `
                <img src="${producto.portada}" alt="${producto.titulo}" class="producto-offcanvas-img">

                <div class="producto-offcanvas-info">
                    <h6>${producto.titulo}</h6>
                    <p>$${producto.precio}.00 x ${producto.cantidad}</p>

                    <div class="producto-cantidad">
                        <button class="btn-restar-producto" data-id="${producto.id}">-</button>
                        <span>${producto.cantidad}</span>
                        <button class="btn-sumar-producto" data-id="${producto.id}">+</button>
                    </div>
                </div>

                <button class="btn-eliminar-producto" data-id="${producto.id}">
                    ×
                </button>
            `;

            listaOffcanvas.appendChild(div);
        });
    }

    function renderizarCarrito() {
        carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        renderizarPaginaCarrito();
        renderizarOffcanvas();
        actualizarTotales();
        actualizarContador();
    }

    if (contenedorIconoCarrito && offcanvas && typeof bootstrap !== "undefined") {
        const miOffcanvas = new bootstrap.Offcanvas(offcanvas, {
            backdrop: true,
            scroll: true
        });

        let tiempoEspera;

        contenedorIconoCarrito.addEventListener("mouseenter", () => {
            clearTimeout(tiempoEspera);

            tiempoEspera = setTimeout(() => {
                miOffcanvas.show();
            }, 200);
        });

        contenedorIconoCarrito.addEventListener("mouseleave", () => {
            clearTimeout(tiempoEspera);
        });

        offcanvas.addEventListener("mouseleave", () => {
            miOffcanvas.hide();
        });
    }

    setTimeout(() => {
        renderizarCarrito();
    }, 100);
});
document.addEventListener("click", (e) => {

    if (e.target.classList.contains("resumenbtn")) {
        realizarCompra();
    }

});

function realizarCompra() {

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    let historialCompras =
        JSON.parse(localStorage.getItem("historialCompras")) || [];

    const total = carrito.reduce((acumulado, producto) => {
        return acumulado + (producto.precio * producto.cantidad);
    }, 0);

    const compra = {
        idCompra: historialCompras.length + 1,
        fecha: new Date().toLocaleDateString(),
        total: total,
        productos: [...carrito]
    };

    historialCompras.push(compra);

    localStorage.setItem(
        "historialCompras",
        JSON.stringify(historialCompras)
    );

    localStorage.setItem(
        "carrito",
        JSON.stringify([])
    );

    alert("Compra realizada correctamente");

    console.log(
        JSON.parse(localStorage.getItem("historialCompras"))
    );
}