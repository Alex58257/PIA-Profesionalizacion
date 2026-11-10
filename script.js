// ===============================
// EFECTO DEL ENCABEZADO
// ===============================

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
    header.classList.toggle("compact", window.scrollY > 50);
});


// ===============================
// CONFIGURACIÓN
// ===============================

const IVA = 0.16;
const CANTIDAD_MAXIMA = 99;

const formatoMoneda = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
});

const dinero = (valor) => formatoMoneda.format(valor);


// ===============================
// REFERENCIAS HTML
// ===============================

const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const subtotalElement = document.getElementById("subtotal");
const checkoutButton = document.getElementById("checkout-button");
const clearButton = document.getElementById("clear-button");
const cartSection = document.getElementById("carrito");

const quoteBar = document.getElementById("quote-bar");
const barCount = document.getElementById("bar-count");
const barSubtotal = document.getElementById("bar-subtotal");
const navCount = document.getElementById("nav-count");

const dialog = document.getElementById("confirm-dialog");
const reviewStep = document.getElementById("confirm-review");
const doneStep = document.getElementById("confirm-done");
const confirmList = document.getElementById("confirm-list");
const confirmSubtotal = document.getElementById("confirm-subtotal");
const confirmTax = document.getElementById("confirm-tax");
const confirmTotal = document.getElementById("confirm-total");
const doneTitle = document.getElementById("done-title");
const doneTotal = document.getElementById("done-total");
const acceptButton = document.getElementById("accept-button");
const cancelButton = document.getElementById("cancel-button");
const closeButton = document.getElementById("close-button");


// ===============================
// SERVICIOS
// Se leen de las tarjetas del HTML (data-id, data-name, data-price):
// así cada servicio existe en un solo lugar.
// ===============================

const tarjetas = document.querySelectorAll(".service-card");

const servicios = Array.from(tarjetas).map((tarjeta) => ({
    id: tarjeta.dataset.id,
    nombre: tarjeta.dataset.name,
    precio: Number(tarjeta.dataset.price),
    tarjeta
}));

// id del servicio -> cantidad elegida
const carrito = new Map();

// Se vuelve true cuando el cliente acepta la cotización
let compraProcesada = false;


// ===============================
// CÁLCULOS
// ===============================

function calcularSubtotal() {
    let subtotal = 0;

    servicios.forEach((servicio) => {
        if (carrito.has(servicio.id)) {
            subtotal += servicio.precio * carrito.get(servicio.id);
        }
    });

    return subtotal;
}

function totalDeServicios() {
    let total = 0;
    carrito.forEach((cantidad) => { total += cantidad; });
    return total;
}

function textoServicios(cantidad) {
    return cantidad === 1 ? "1 servicio" : cantidad + " servicios";
}


// ===============================
// CONTROLES REUTILIZABLES
// ===============================

function crearSelectorCantidad(servicio, origen) {
    const contenedor = document.createElement("div");
    contenedor.className = "stepper";
    contenedor.setAttribute("role", "group");
    contenedor.setAttribute("aria-label", "Cantidad de " + servicio.nombre);

    const menos = document.createElement("button");
    menos.type = "button";
    menos.textContent = "−";
    menos.setAttribute("aria-label", "Quitar una unidad de " + servicio.nombre);
    menos.addEventListener("click", () => cambiarCantidad(servicio.id, -1, origen));

    const salida = document.createElement("output");
    salida.textContent = carrito.get(servicio.id);

    const mas = document.createElement("button");
    mas.type = "button";
    mas.textContent = "+";
    mas.setAttribute("aria-label", "Agregar una unidad de " + servicio.nombre);
    mas.disabled = carrito.get(servicio.id) >= CANTIDAD_MAXIMA;
    mas.addEventListener("click", () => cambiarCantidad(servicio.id, 1, origen));

    contenedor.append(menos, salida, mas);
    return contenedor;
}


// ===============================
// CAMBIOS EN EL CARRITO
// ===============================

function agregarServicio(id) {
    if (!carrito.has(id)) {
        carrito.set(id, 1);
        actualizarTodo(id, "tarjeta");
    }
}

function cambiarCantidad(id, cambio, origen) {
    const nueva = (carrito.get(id) || 0) + cambio;

    if (nueva <= 0) {
        carrito.delete(id);
    } else {
        carrito.set(id, Math.min(nueva, CANTIDAD_MAXIMA));
    }

    actualizarTodo(id, origen);
}

function quitarServicio(id) {
    carrito.delete(id);
    actualizarTodo();
    cartItems.focus({ preventScroll: true });
}

function vaciarCarrito() {
    carrito.clear();
    actualizarTodo();
}


// ===============================
// DIBUJAR TARJETAS
// ===============================

function dibujarTarjetas(idEnfocado, origen) {
    servicios.forEach((servicio) => {
        const { tarjeta, id, nombre } = servicio;
        const acciones = tarjeta.querySelector(".card-actions");
        const elegido = carrito.has(id);

        tarjeta.classList.toggle("selected", elegido);
        acciones.replaceChildren();

        if (elegido) {
            acciones.appendChild(crearSelectorCantidad(servicio, "tarjeta"));
        } else {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "add-button";
            boton.textContent = "Agregar al carrito";
            boton.setAttribute("aria-label", "Agregar " + nombre + " al carrito");
            boton.addEventListener("click", () => agregarServicio(id));
            acciones.appendChild(boton);
        }

        // Si la persona estaba usando los botones de esta tarjeta, se conserva el foco
        if (origen === "tarjeta" && idEnfocado === id) {
            const destino = acciones.querySelector("button:not(:disabled)");
            if (destino) destino.focus({ preventScroll: true });
        }
    });
}


// ===============================
// DIBUJAR EL CARRITO
// ===============================

function dibujarCarrito(idEnfocado, origen) {
    cartItems.replaceChildren();

    if (carrito.size === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-state";
        vacio.textContent = "Tu carrito está vacío. Agrega servicios desde las tarjetas.";
        cartItems.appendChild(vacio);
        return;
    }

    servicios.forEach((servicio) => {
        if (!carrito.has(servicio.id)) return;

        const cantidad = carrito.get(servicio.id);

        const fila = document.createElement("div");
        fila.className = "cart-item";

        const info = document.createElement("div");

        const titulo = document.createElement("h4");
        titulo.textContent = servicio.nombre;

        const unitario = document.createElement("span");
        unitario.className = "unit-price";
        unitario.textContent = dinero(servicio.precio) + " c/u";

        info.append(titulo, unitario);

        const quitar = document.createElement("button");
        quitar.type = "button";
        quitar.className = "remove-button";
        quitar.textContent = "Quitar";
        quitar.setAttribute("aria-label", "Quitar " + servicio.nombre + " del carrito");
        quitar.addEventListener("click", () => quitarServicio(servicio.id));

        const importe = document.createElement("span");
        importe.className = "line-total";
        importe.textContent = dinero(servicio.precio * cantidad);

        fila.append(info, quitar, crearSelectorCantidad(servicio, "carrito"), importe);
        cartItems.appendChild(fila);

        if (origen === "carrito" && idEnfocado === servicio.id) {
            const destino = fila.querySelector(".stepper button:not(:disabled)");
            if (destino) destino.focus({ preventScroll: true });
        }
    });
}


// ===============================
// SUBTOTAL, BOTONES Y BARRA FLOTANTE
// ===============================

function dibujarResumen() {
    const subtotal = calcularSubtotal();
    const cantidad = totalDeServicios();
    const hayServicios = carrito.size > 0;

    subtotalElement.textContent = dinero(subtotal);
    cartCount.textContent = textoServicios(cantidad);

    checkoutButton.disabled = !hayServicios;
    clearButton.disabled = !hayServicios;

    barCount.textContent = textoServicios(cantidad);
    barSubtotal.textContent = "Subtotal " + dinero(subtotal);

    navCount.textContent = cantidad;
    navCount.hidden = !hayServicios;

    actualizarBarra();
}

let carritoVisible = false;

function actualizarBarra() {
    // La barra solo aparece si hay servicios y el carrito no está en pantalla
    quoteBar.hidden = carrito.size === 0 || carritoVisible;
}

if ("IntersectionObserver" in window) {
    new IntersectionObserver((entradas) => {
        carritoVisible = entradas[0].isIntersecting;
        actualizarBarra();
    }, { threshold: 0.15 }).observe(cartSection);
}

function actualizarTodo(idEnfocado, origen) {
    dibujarTarjetas(idEnfocado, origen);
    dibujarCarrito(idEnfocado, origen);
    dibujarResumen();
}


// ===============================
// VENTANA DE CONFIRMACIÓN
// ===============================

function abrirDialogo() {
    if (typeof dialog.showModal === "function") {
        dialog.showModal();
    } else {
        dialog.setAttribute("open", "");
    }
}

function cerrarDialogo() {
    if (typeof dialog.close === "function") {
        dialog.close();
    } else {
        dialog.removeAttribute("open");
        alCerrarDialogo();
    }
}

function solicitarCotizacion() {
    if (carrito.size === 0) return;

    const subtotal = calcularSubtotal();
    const iva = subtotal * IVA;
    const total = subtotal + iva;

    confirmList.replaceChildren();

    servicios.forEach((servicio) => {
        if (!carrito.has(servicio.id)) return;

        const cantidad = carrito.get(servicio.id);
        const linea = document.createElement("li");

        const nombre = document.createElement("span");
        nombre.textContent = cantidad > 1
            ? servicio.nombre + " × " + cantidad
            : servicio.nombre;

        const importe = document.createElement("span");
        importe.textContent = dinero(servicio.precio * cantidad);

        linea.append(nombre, importe);
        confirmList.appendChild(linea);
    });

    confirmSubtotal.textContent = dinero(subtotal);
    confirmTax.textContent = dinero(iva);
    confirmTotal.textContent = dinero(total);
    doneTotal.textContent = dinero(total);

    compraProcesada = false;
    reviewStep.hidden = false;
    doneStep.hidden = true;

    abrirDialogo();
}

function aceptarCotizacion() {
    compraProcesada = true;
    reviewStep.hidden = true;
    doneStep.hidden = false;
    doneTitle.focus();
}

function alCerrarDialogo() {
    // Si la compra ya se procesó, el carrito se vacía al cerrar la ventana
    if (compraProcesada) {
        compraProcesada = false;
        vaciarCarrito();
    }
}


// ===============================
// EVENTOS
// ===============================

checkoutButton.addEventListener("click", solicitarCotizacion);
clearButton.addEventListener("click", vaciarCarrito);

acceptButton.addEventListener("click", aceptarCotizacion);
cancelButton.addEventListener("click", cerrarDialogo);
closeButton.addEventListener("click", cerrarDialogo);
dialog.addEventListener("close", alCerrarDialogo);

// Clic fuera de la ventana = cerrar
dialog.addEventListener("click", (evento) => {
    // Los clics en botones (también con el teclado) no cuentan
    if (evento.target !== dialog) return;

    const caja = dialog.getBoundingClientRect();
    const dentro = evento.clientX >= caja.left && evento.clientX <= caja.right &&
                   evento.clientY >= caja.top && evento.clientY <= caja.bottom;

    if (!dentro) cerrarDialogo();
});


// ===============================
// INICIAR
// ===============================

actualizarTodo();
