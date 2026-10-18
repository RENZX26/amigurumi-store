/* =========================================================
   ZONA EDITABLE
   Cambia aquí los datos de la tienda y los productos.

   El teléfono se escribe con código de país 51,
   sin espacios ni signo +.

   Para añadir fotografías:
   imagen: "fotos/osito.jpg"

   Cada producto debe tener un ID único.

   Campos opcionales por producto (si no existen, no se muestran):
   medidas: "Alto: 22 cm · Algodón"
   etiqueta: "Más pedido"
   ========================================================= */

const TELEFONO_1 = "51941501956";
const NOMBRE_TIENDA = "Mis Amigurumis";
// Déjalo vacío ("") hasta tener la red lista: el enlace se oculta solo.
const INSTAGRAM_URL = "";
const FACEBOOK_URL = "";
const URL_SITIO = "https://misamigurumis.netlify.app/";

const productos = [
  {
    id: "osito",
    nombre: "Osito de ternura",
    descripcion: "Un compañero suave y perfecto para regalar.",
    precio: 45,
    imagen: "",
    emoji: "🧸",
    color: "#f2efeb"
  },
  {
    id: "conejita",
    nombre: "Conejita dulce",
    descripcion: "Un detalle delicado y lleno de cariño.",
    precio: 55,
    imagen: "",
    emoji: "🐰",
    color: "#f2efeb"
  },
  {
    id: "unicornio",
    nombre: "Unicornio mágico",
    descripcion: "Un toque de fantasía tejido a mano.",
    precio: 75,
    imagen: "",
    emoji: "🦄",
    color: "#f2efeb"
  },
  {
    id: "pulpo",
    nombre: "Pulpo sonriente",
    descripcion: "Pequeño, divertido y encantador.",
    precio: 30,
    imagen: "",
    emoji: "🐙",
    color: "#f2efeb"
  },
  {
    id: "gatito",
    nombre: "Gatito dormilón",
    descripcion: "Un gatito tierno para acompañarte.",
    precio: 48,
    imagen: "",
    emoji: "🐱",
    color: "#f2efeb"
  },
  {
    id: "dinosaurio",
    nombre: "Dinosaurio bebé",
    descripcion: "Un pequeño dinosaurio muy especial.",
    precio: 65,
    imagen: "",
    emoji: "🦕",
    color: "#f2efeb"
  },
  {
    id: "flor",
    nombre: "Flor tejida",
    descripcion: "Una flor bonita que no se marchita.",
    precio: 28,
    imagen: "",
    emoji: "🌷",
    color: "#f2efeb"
  },
  {
    id: "llavero",
    nombre: "Llavero mini",
    descripcion: "Un detalle práctico para llevar contigo.",
    precio: 20,
    imagen: "",
    emoji: "🔑",
    color: "#f2efeb"
  }
];

/* ================= FIN ZONA EDITABLE ================= */
