// Configuración de Ant Design para cada tema (claro u oscuro).
// Traduce nuestra paleta (los colores de styles/base.css) a los "tokens" de antd, para que los
// botones, tablas, formularios, etc. se vean como el resto de la app.
// Si cambiás un color en base.css, cambialo también acá (son los mismos valores).
import { theme } from "antd";

const FUENTE = '"Space Grotesk", system-ui, sans-serif';

// Valores comunes a los dos temas.
const base = {
  fontFamily: FUENTE,
  fontSize: 15,
  borderRadius: 12,
  controlHeight: 42,
  motionDurationMid: "0.2s",
};

const oscuro = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...base,
    colorPrimary: "#8dbd5a", // verde hoja
    colorInfo: "#4fae9c",
    colorSuccess: "#8dbd5a",
    colorWarning: "#d8a24a",
    colorError: "#d9705f",
    colorBgBase: "#0a1510",
    colorTextBase: "#e9f0e2",
    colorBgContainer: "rgba(220, 245, 220, 0.07)", // cristal verdoso
    colorBgElevated: "#14281d", // menús desplegables y ventanas
    colorBorder: "rgba(220, 245, 220, 0.24)",
    colorBorderSecondary: "rgba(220, 245, 220, 0.14)",
    colorTextPlaceholder: "rgba(233, 240, 226, 0.45)",
  },
  components: {
    Button: { primaryColor: "#0b1a10", fontWeight: 700 },
    Table: {
      headerBg: "transparent",
      headerColor: "#93a58f",
      rowHoverBg: "rgba(220, 245, 220, 0.06)",
      borderColor: "rgba(220, 245, 220, 0.12)",
    },
    Modal: { contentBg: "rgba(14, 30, 22, 0.88)", headerBg: "transparent" },
    Segmented: { trackBg: "rgba(220, 245, 220, 0.08)", itemSelectedBg: "#8dbd5a", itemSelectedColor: "#0b1a10" },
    Menu: { itemBg: "transparent", itemSelectedBg: "#8dbd5a", itemSelectedColor: "#0b1a10", itemHoverBg: "rgba(220, 245, 220, 0.1)" },
    Collapse: { headerBg: "transparent", contentBg: "transparent" },
    Card: { colorBgContainer: "rgba(220, 245, 220, 0.07)" },
  },
};

const claro = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...base,
    colorPrimary: "#e3b324", // amarillo mostaza
    colorInfo: "#5d6f78",
    colorSuccess: "#6b7a2a",
    colorWarning: "#b0701a",
    colorError: "#b5472f",
    colorBgBase: "#f4efe0",
    colorTextBase: "#2a261b",
    colorBgContainer: "rgba(255, 252, 240, 0.65)", // cristal hueso
    colorBgElevated: "#fbf8ee",
    colorBorder: "rgba(60, 48, 20, 0.26)",
    colorBorderSecondary: "rgba(60, 48, 20, 0.14)",
    colorTextPlaceholder: "rgba(42, 38, 27, 0.4)",
  },
  components: {
    Button: { primaryColor: "#2a261b", fontWeight: 700 },
    Table: {
      headerBg: "transparent",
      headerColor: "#736c58",
      rowHoverBg: "rgba(227, 179, 36, 0.12)",
      borderColor: "rgba(60, 48, 20, 0.12)",
    },
    Modal: { contentBg: "rgba(252, 249, 238, 0.92)", headerBg: "transparent" },
    Segmented: { trackBg: "rgba(60, 48, 20, 0.07)", itemSelectedBg: "#e3b324", itemSelectedColor: "#2a261b" },
    Menu: { itemBg: "transparent", itemSelectedBg: "#e3b324", itemSelectedColor: "#2a261b", itemHoverBg: "rgba(60, 48, 20, 0.07)" },
    Collapse: { headerBg: "transparent", contentBg: "transparent" },
    Card: { colorBgContainer: "rgba(255, 252, 240, 0.65)" },
  },
};

// Devuelve la configuración de antd para "light" o "dark".
export const temaAnt = (tema) => (tema === "light" ? claro : oscuro);
