// PRECIOS Y ENLACES DE WHATSAPP

// Usar céntimos evita errores al sumar precios decimales.
const centimos = (precio) =>
  Math.round(Number(precio) * 100);

const soles = (cantidadCentimos) =>
  "S/ " + (cantidadCentimos / 100).toLocaleString(
    "es-PE",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );

const enlaceWhatsApp = (mensaje) =>
  `https://wa.me/${TELEFONO_1.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;

const catalogoPorId = new Map(
  productos.map((producto) => [producto.id, producto])
);

const CLAVE_STORAGE = "mis-amigurumis-carrito-v1";
const CANTIDAD_MAXIMA = 999;

let carrito = Object.create(null);
let temporizadorToast;
let focoAnterior = null;
let carritoAbierto = false;

// PERSISTENCIA DEL CARRITO

function recuperarCarrito() {
  try {
    const datos = JSON.parse(
      localStorage.getItem(CLAVE_STORAGE) || "{}"
    );

    if (!datos ||
        typeof datos !== "object" ||
        Array.isArray(datos)) {
      return;
    }

    for (const producto of productos) {
      const cantidad = datos[producto.id];

      if (Number.isInteger(cantidad) && cantidad > 0) {
        carrito[producto.id] = Math.min(
          cantidad,
          CANTIDAD_MAXIMA
        );
      }
    }
  } catch (error) {
    // Si localStorage está bloqueado, el carrito
    // funciona temporalmente durante esta visita.
  }
}

function guardarCarrito() {
  try {
    localStorage.setItem(
      CLAVE_STORAGE,
      JSON.stringify(carrito)
    );
  } catch (error) {
    // Se mantiene el carrito en memoria.
  }
}

function articulos() {
  return Object.entries(carrito)
    .filter(([id, cantidad]) =>
      catalogoPorId.has(id) && cantidad > 0
    )
    .map(([id, cantidad]) => ({
      producto: catalogoPorId.get(id),
      cantidad
    }));
}

function unidades() {
  return articulos().reduce(
    (n, item) => n + item.cantidad,
    0
  );
}

function totalCentimos() {
  return articulos().reduce(
    (n, item) =>
      n + centimos(item.producto.precio) * item.cantidad,
    0
  );
}

// FOTOGRAFÍAS O PLACEHOLDERS

function crearVisual(producto) {
  const contenedor = document.createElement("div");
  contenedor.className = "visual-producto";
  contenedor.style.background = producto.color || "#f2efeb";

  const colocarPlaceholder = () => {
    const simbolo = document.createElement("span");
    simbolo.className = "marcador-foto";
    simbolo.textContent = producto.emoji || "🧶";
    simbolo.setAttribute("role", "img");
    simbolo.setAttribute(
      "aria-label",
      `Imagen de ejemplo de ${producto.nombre}`
    );
    contenedor.replaceChildren(simbolo);
  };

  if (typeof producto.imagen === "string" &&
      producto.imagen.trim()) {
    const foto = document.createElement("img");
    foto.src = producto.imagen;
    foto.alt = `${producto.nombre}, amigurumi tejido a crochet`;
    foto.loading = "lazy";
    foto.decoding = "async";
    foto.onerror = colocarPlaceholder;
    contenedor.append(foto);
  } else {
    colocarPlaceholder();
  }

  return contenedor;
}

// GENERAR CATÁLOGO AUTOMÁTICAMENTE

function pintarCatalogo() {
  const lista = document.getElementById("lista-productos");
  const fragmento = document.createDocumentFragment();

  productos.forEach((producto) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";
    tarjeta.setAttribute("data-revelar", "");

    const detalle = document.createElement("div");
    detalle.className = "producto-detalle";

    const nombre = document.createElement("h3");
    nombre.textContent = producto.nombre;

    const descripcion = document.createElement("p");
    descripcion.textContent = producto.descripcion;

    const precio = document.createElement("strong");
    precio.className = "precio";
    precio.textContent = soles(centimos(producto.precio));

    const acciones = document.createElement("div");
    acciones.className = "producto-acciones";

    // Compra individual por WhatsApp.
    const comprar = document.createElement("a");
    comprar.className = "btn btn-contorno";
    comprar.textContent = "Comprar ahora";

    comprar.href = enlaceWhatsApp(
      `Hola, me interesa el amigurumi ${producto.nombre} de ${soles(centimos(producto.precio))}. ¿Está disponible?`
    );

    comprar.target = "_blank";
    comprar.rel = "noopener noreferrer";
    comprar.setAttribute(
      "aria-label",
      `Comprar ${producto.nombre} por WhatsApp`
    );

    // Agregar al carrito sin salir de la tienda.
    const agregar = document.createElement("button");
    agregar.type = "button";
    agregar.className = "btn btn-oscuro";
    agregar.textContent = "Agregar al carrito";
    agregar.setAttribute(
      "aria-label",
      `Agregar ${producto.nombre} al carrito`
    );

    agregar.addEventListener("click", () =>
      agregarAlCarrito(producto.id)
    );

    acciones.append(agregar, comprar);

    const piezas = [];

    if (producto.etiqueta) {
      const insignia = document.createElement("span");
      insignia.className = "insignia";
      insignia.textContent = producto.etiqueta;
      piezas.push(insignia);
    }

    piezas.push(nombre, descripcion);

    if (producto.medidas) {
      const medidas = document.createElement("p");
      medidas.className = "medidas";
      medidas.textContent = producto.medidas;
      piezas.push(medidas);
    }

    piezas.push(precio, acciones);
    detalle.append(...piezas);
    tarjeta.append(crearVisual(producto), detalle);
    fragmento.append(tarjeta);
  });

  lista.replaceChildren(fragmento);

  // Mostrar el primer amigurumi en la portada.
  const portada = document.getElementById("hero-imagen");

  if (productos.length) {
    portada.prepend(crearVisual(productos[0]));
  }
}

// NOTIFICACIONES

function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");

  clearTimeout(temporizadorToast);
  toast.textContent = mensaje;
  toast.classList.add("mostrar");

  temporizadorToast = setTimeout(() => {
    toast.classList.remove("mostrar");
  }, 2200);
}

function anunciar(mensaje) {
  document.getElementById("anuncio-carrito").textContent =
    mensaje;
}

// AGREGAR Y MODIFICAR CANTIDADES

function actualizarCantidad(id, nuevaCantidad, opciones = {}) {
  if (!catalogoPorId.has(id)) return;

  if (nuevaCantidad <= 0) {
    delete carrito[id];
  } else {
    carrito[id] = Math.min(
      nuevaCantidad,
      CANTIDAD_MAXIMA
    );
  }

  guardarCarrito();
  pintarCarrito(opciones);

  anunciar(
    `${catalogoPorId.get(id).nombre}: ${carrito[id] || 0} unidades en el carrito.`
  );
}

function agregarAlCarrito(id) {
  const anterior = carrito[id] || 0;

  if (anterior >= CANTIDAD_MAXIMA) {
    mostrarToast(
      "Llegaste a la cantidad máxima de este producto"
    );
    return;
  }

  actualizarCantidad(id, anterior + 1);

  const badge = document.getElementById("contador-carrito");
  badge.classList.remove("salto");

  // Reinicia la animación del contador.
  void badge.offsetWidth;
  badge.classList.add("salto");

  mostrarToast("Agregado al carrito ✓");
}

// CONTROLES DE CANTIDAD

function crearBotonCantidad(simbolo, accion, item) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = simbolo;
  boton.dataset.accion = accion;
  boton.dataset.id = item.producto.id;

  boton.setAttribute(
    "aria-label",
    `${accion === "mas" ? "Aumentar" : "Disminuir"} cantidad de ${item.producto.nombre}`
  );

  if (accion === "mas" &&
      item.cantidad >= CANTIDAD_MAXIMA) {
    boton.disabled = true;
  }

  return boton;
}

// DIBUJAR CARRITO Y ACTUALIZAR TOTAL

function pintarCarrito(opciones = {}) {
  const items = articulos();
  const lista = document.getElementById("articulos-carrito");
  const fragmento = document.createDocumentFragment();

  if (!items.length) {
    const vacio = document.createElement("div");
    vacio.className = "carrito-vacio";

    const icono = document.createElement("span");
    icono.className = "icono-vacio";
    icono.textContent = "—";
    icono.setAttribute("aria-hidden", "true");

    const titulo = document.createElement("h3");
    titulo.textContent = "Tu carrito está vacío";

    const texto = document.createElement("p");
    texto.textContent =
      "Explora nuestros amigurumis y encuentra tus favoritos.";

    const irCatalogo = document.createElement("button");
    irCatalogo.type = "button";
    irCatalogo.className = "btn btn-oscuro";
    irCatalogo.textContent = "Ir al catálogo";

    irCatalogo.addEventListener("click", () => {
      cerrarCarrito();

      document.getElementById("catalogo").scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches ? "auto" : "smooth"
      });
    });

    vacio.append(icono, titulo, texto, irCatalogo);
    fragmento.append(vacio);

  } else {
    for (const item of items) {
      const fila = document.createElement("article");
      fila.className = "linea-carrito";

      const miniatura = document.createElement("div");
      miniatura.className = "miniatura-carrito";
      miniatura.append(crearVisual(item.producto));

      const detalle = document.createElement("div");
      detalle.className = "detalle-carrito";

      const titulo = document.createElement("h3");
      titulo.textContent = item.producto.nombre;

      const precio = document.createElement("p");
      precio.textContent =
        `${soles(centimos(item.producto.precio))} por unidad`;

      const controles = document.createElement("div");
      controles.className = "controles-carrito";

      const cantidad = document.createElement("div");
      cantidad.className = "cantidad";
      cantidad.setAttribute(
        "aria-label",
        `Cantidad de ${item.producto.nombre}`
      );

      const valor = document.createElement("span");
      valor.textContent = item.cantidad;
      valor.setAttribute(
        "aria-label",
        `${item.cantidad} unidades`
      );

      cantidad.append(
        crearBotonCantidad("−", "menos", item),
        valor,
        crearBotonCantidad("+", "mas", item)
      );

      const quitar = document.createElement("button");
      quitar.type = "button";
      quitar.className = "quitar";
      quitar.textContent = "Quitar";
      quitar.dataset.accion = "quitar";
      quitar.dataset.id = item.producto.id;

      quitar.setAttribute(
        "aria-label",
        `Quitar ${item.producto.nombre} del carrito`
      );

      controles.append(cantidad, quitar);
      detalle.append(titulo, precio, controles);
      fila.append(miniatura, detalle);
      fragmento.append(fila);
    }
  }

  lista.replaceChildren(fragmento);

  const numero = unidades();

  document.getElementById("contador-carrito").textContent =
    numero;

  document.getElementById("cantidad-titulo").textContent =
    `(${numero})`;

  document.getElementById("abrir-carrito").setAttribute(
    "aria-label",
    `Abrir carrito, ${numero} ${numero === 1 ? "producto" : "productos"}`
  );

  document.getElementById("total-carrito").textContent =
    soles(totalCentimos());

  document.getElementById("enviar-pedido").disabled =
    numero === 0;

  document.getElementById("vaciar-carrito").disabled =
    numero === 0;

  // Mantener el foco al modificar cantidades con teclado.
  if (carritoAbierto && opciones.id && opciones.accion) {
    const objetivo = Array.from(
      lista.querySelectorAll("button[data-accion]")
    ).find(
      (boton) =>
        boton.dataset.id === opciones.id &&
        boton.dataset.accion === opciones.accion &&
        !boton.disabled
    );

    (
      objetivo ||
      lista.querySelector("button:not(:disabled)") ||
      document.getElementById("cerrar-carrito")
    ).focus();
  }
}

// DATOS DE LA TIENDA, CONTACTO Y SEO

function prepararWhatsApp() {
  document.querySelectorAll("[data-nombre-tienda]")
    .forEach((nodo) => {
      nodo.textContent = NOMBRE_TIENDA;
    });

  document.title =
    `${NOMBRE_TIENDA} | Venta de amigurumis hechos a mano`;

  document.querySelector('meta[property="og:title"]').content =
    `${NOMBRE_TIENDA} | Amigurumis hechos a mano`;

  document.querySelector('meta[property="og:site_name"]').content =
    NOMBRE_TIENDA;

  document.querySelector('meta[property="og:url"]').content =
    URL_SITIO;

  document.getElementById("anio").textContent =
    new Date().getFullYear();

  document.getElementById("numero-visible").textContent =
    `+${TELEFONO_1.slice(0, 2)} ${TELEFONO_1.slice(2, 5)} ${TELEFONO_1.slice(5, 8)} ${TELEFONO_1.slice(8)}`;

  // Las redes sociales solo se muestran si tienen enlace.
  [
    ["enlace-instagram", INSTAGRAM_URL],
    ["enlace-facebook", FACEBOOK_URL]
  ].forEach(([id, url]) => {
    const enlace = document.getElementById(id);
    if (url) {
      enlace.href = url;
      enlace.hidden = false;
    }
  });

  document.getElementById("redes-contacto").hidden =
    !(INSTAGRAM_URL || FACEBOOK_URL);

  const mensajeGeneral =
    `Hola, vi la tienda ${NOMBRE_TIENDA} y quisiera consultar por sus amigurumis.`;

  [
    "whatsapp-hero",
    "whatsapp-contacto",
    "whatsapp-flotante",
    "whatsapp-pie"
  ].forEach((id) => {
    document.getElementById(id).href =
      enlaceWhatsApp(mensajeGeneral);
  });

  document.getElementById("whatsapp-personalizado").href =
    enlaceWhatsApp(
      "Hola, quiero consultar por un amigurumi personalizado. ¿Podemos conversar sobre mi idea?"
    );

  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: NOMBRE_TIENDA,
    description:
      "Venta de amigurumis hechos a mano y muñecos tejidos a crochet en Perú.",
    url: URL_SITIO,
    telephone: `+${TELEFONO_1}`,
    currenciesAccepted: "PEN",
    sameAs: [INSTAGRAM_URL, FACEBOOK_URL].filter(Boolean)
  };

  document.getElementById("datos-tienda").textContent =
    JSON.stringify(schema);
}

// PANEL MODAL ACCESIBLE

const modal = document.getElementById("modal-carrito");
const panel = document.getElementById("panel-carrito");

const fondoInerte = [
  document.querySelector("header"),
  document.querySelector("main"),
  document.querySelector("footer"),
  document.getElementById("whatsapp-flotante")
];

function abrirCarrito() {
  focoAnterior = document.activeElement;
  carritoAbierto = true;

  modal.classList.add("visible");
  modal.setAttribute("aria-hidden", "false");
  panel.removeAttribute("inert");

  document.body.classList.add("carrito-abierto");

  fondoInerte.forEach((elemento) => {
    if (elemento) elemento.inert = true;
  });

  document.getElementById("cerrar-carrito").focus();
}

function cerrarCarrito() {
  if (!carritoAbierto) return;

  carritoAbierto = false;
  modal.classList.remove("visible");

  document.body.classList.remove("carrito-abierto");

  fondoInerte.forEach((elemento) => {
    if (elemento) elemento.inert = false;
  });

  if (focoAnterior && focoAnterior.isConnected) {
    focoAnterior.focus();
  }

  panel.setAttribute("inert", "");
  modal.setAttribute("aria-hidden", "true");
}

// Escape y navegación con Tab dentro del panel.
function controlarTeclado(evento) {
  if (!carritoAbierto) return;

  if (evento.key === "Escape") {
    evento.preventDefault();
    cerrarCarrito();
    return;
  }

  if (evento.key !== "Tab") return;

  const controles = Array.from(
    panel.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );

  const disponibles = controles.filter(
    (elemento) => !elemento.closest("[inert]")
  );

  if (!disponibles.length) {
    evento.preventDefault();
    panel.focus();
    return;
  }

  const primero = disponibles[0];
  const ultimo = disponibles[disponibles.length - 1];

  if (
    evento.shiftKey &&
    (
      document.activeElement === primero ||
      !panel.contains(document.activeElement)
    )
  ) {
    evento.preventDefault();
    ultimo.focus();

  } else if (
    !evento.shiftKey &&
    (
      document.activeElement === ultimo ||
      !panel.contains(document.activeElement)
    )
  ) {
    evento.preventDefault();
    primero.focus();
  }
}

document.getElementById("abrir-carrito")
  .addEventListener("click", abrirCarrito);

document.getElementById("cerrar-carrito")
  .addEventListener("click", cerrarCarrito);

document.getElementById("fondo-modal")
  .addEventListener("click", cerrarCarrito);

document.addEventListener("keydown", controlarTeclado);

// BOTONES INTERNOS DEL CARRITO

document.getElementById("articulos-carrito")
  .addEventListener("click", (evento) => {
    const boton = evento.target.closest(
      "button[data-accion]"
    );

    if (!boton) return;

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;
    const actual = carrito[id] || 0;

    if (accion === "mas") {
      actualizarCantidad(
        id,
        actual + 1,
        { id, accion }
      );
    }

    if (accion === "menos") {
      actualizarCantidad(
        id,
        actual - 1,
        { id, accion }
      );
    }

    if (accion === "quitar") {
      actualizarCantidad(
        id,
        0,
        { id, accion }
      );
    }
  });

// VACIAR CARRITO

document.getElementById("vaciar-carrito")
  .addEventListener("click", () => {
    carrito = Object.create(null);

    guardarCarrito();
    pintarCarrito();

    anunciar("Carrito vaciado.");
    document.getElementById("cerrar-carrito").focus();
  });

// ENVIAR TODO EL PEDIDO POR WHATSAPP

document.getElementById("enviar-pedido")
  .addEventListener("click", () => {
    const items = articulos();

    if (!items.length) return;

    const lineas = items.map((item, indice) =>
      `${indice + 1}. ${item.producto.nombre} x${item.cantidad} - ${soles(centimos(item.producto.precio) * item.cantidad)}`
    );

    const mensaje = [
      "Hola, quiero hacer el siguiente pedido 🧶",
      "",
      ...lineas,
      "",
      `*Total: ${soles(totalCentimos())}*`,
      "",
      "¿Me confirmas disponibilidad, forma de pago y entrega? ¡Gracias!"
    ].join("\n");

    // enlaceWhatsApp utiliza encodeURIComponent,
    // incluyendo saltos de línea y caracteres especiales.
    window.open(
      enlaceWhatsApp(mensaje),
      "_blank",
      "noopener,noreferrer"
    );
  });

// MENÚ RESPONSIVE

const botonMenu = document.getElementById("boton-menu");
const navegacion = document.getElementById("navegacion");

function cerrarMenu() {
  navegacion.classList.remove("abierta");
  botonMenu.setAttribute("aria-expanded", "false");
  botonMenu.setAttribute("aria-label", "Abrir menú");
  botonMenu.textContent = "☰";
}

botonMenu.addEventListener("click", () => {
  const abierto = navegacion.classList.toggle("abierta");

  botonMenu.setAttribute(
    "aria-expanded",
    String(abierto)
  );

  botonMenu.setAttribute(
    "aria-label",
    abierto ? "Cerrar menú" : "Abrir menú"
  );

  botonMenu.textContent = abierto ? "✕" : "☰";
});

navegacion.querySelectorAll("a").forEach((enlace) => {
  enlace.addEventListener("click", cerrarMenu);
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && !carritoAbierto) {
    cerrarMenu();
  }
});

// ANIMACIONES SUAVES AL DESPLAZARSE

function prepararAnimaciones() {
  const secciones = document.querySelectorAll(
    "[data-revelar]"
  );

  const reducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducido || !("IntersectionObserver" in window)) {
    secciones.forEach((elemento) => {
      elemento.classList.add("revelado");
    });
    return;
  }

  const observador = new IntersectionObserver(
    (entradas, observadorActual) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("revelado");
          observadorActual.unobserve(entrada.target);
        }
      });
    },
    { threshold: .08 }
  );

  secciones.forEach((elemento) => {
    observador.observe(elemento);
  });
}

// INICIAR LA TIENDA

recuperarCarrito();
prepararWhatsApp();
pintarCatalogo();
pintarCarrito();

document.documentElement.classList.add("js-listo");
prepararAnimaciones();
