
// ===============================
// EFECTO DEL ENCABEZADO
// ===============================

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.classList.add("compact");
    } else {
        header.classList.remove("compact");
    }
});


// ===============================
// SERVICIOS DISPONIBLES
// ===============================

const servicios = [
    { nombre: "Reparación de computadoras", precio: 900 },
    { nombre: "Mantenimiento preventivo", precio: 600 },
    { nombre: "Instalación de sistemas operativos", precio: 750 },
    { nombre: "Eliminación de virus y protección informática", precio: 500 },
    { nombre: "Actualización de hardware", precio: 1200 }
];


// ===============================
// REFERENCIAS HTML
// ===============================

const quotationServices = document.getElementById("quotation-services");
const subtotalElement = document.getElementById("subtotal");
const taxElement = document.getElementById("tax");
const totalElement = document.getElementById("total");
const messageElement = document.getElementById("quotation-message");

const calculateButton = document.getElementById("calculate-button");
const clearButton = document.getElementById("clear-button");


// ===============================
// MOSTRAR SERVICIOS
// ===============================

function mostrarServicios() {

    servicios.forEach((servicio, index) => {

        const div = document.createElement("div");

        div.innerHTML = `
            <label>
                <input type="checkbox" class="servicio"
                value="${servicio.precio}" id="servicio${index}">
                ${servicio.nombre} - $${servicio.precio} MXN
            </label>
        `;

        quotationServices.appendChild(div);

    });

    const opciones = document.querySelectorAll(".servicio");

    opciones.forEach(opcion => {
        opcion.addEventListener("change", actualizarSubtotal);
    });

}


// ===============================
// ACTUALIZAR SUBTOTAL
// ===============================

function actualizarSubtotal() {

    const seleccionados = document.querySelectorAll(".servicio:checked");

    let subtotal = 0;

    seleccionados.forEach(servicio => {
        subtotal += Number(servicio.value);
    });

    subtotalElement.textContent = "$" + subtotal.toFixed(2);

    // Ocultar IVA y total hasta calcular
    taxElement.textContent = "$0.00";
    totalElement.textContent = "$0.00";

    messageElement.textContent = "";
}


// ===============================
// CALCULAR COTIZACIÓN
// ===============================

function calcularCotizacion() {

    const seleccionados = document.querySelectorAll(".servicio:checked");

    if (seleccionados.length === 0) {
        messageElement.textContent = "Selecciona al menos un servicio.";
        taxElement.textContent = "$0.00";
        totalElement.textContent = "$0.00";
        return;
    }

    let subtotal = 0;

    seleccionados.forEach(servicio => {
        subtotal += Number(servicio.value);
    });

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    subtotalElement.textContent = "$" + subtotal.toFixed(2);
    taxElement.textContent = "$" + iva.toFixed(2);
    totalElement.textContent = "$" + total.toFixed(2);

    messageElement.textContent = "Cotización calculada correctamente.";

}


// ===============================
// LIMPIAR COTIZACIÓN
// ===============================

function limpiarCotizacion() {

    const seleccionados = document.querySelectorAll(".servicio");

    seleccionados.forEach(servicio => {
        servicio.checked = false;
    });

    subtotalElement.textContent = "$0.00";
    taxElement.textContent = "$0.00";
    totalElement.textContent = "$0.00";

    messageElement.textContent = "";

}


// ===============================
// EVENTOS DE LOS BOTONES
// ===============================

calculateButton.addEventListener("click", calcularCotizacion);

clearButton.addEventListener("click", limpiarCotizacion);


// ===============================
// INICIAR SERVICIOS
// ===============================

mostrarServicios();
