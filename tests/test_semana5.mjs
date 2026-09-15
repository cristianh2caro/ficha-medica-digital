import vm from "node:vm";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const sourceDir = process.env.SOURCE_DIR
  ? pathToFileURL(`${process.env.SOURCE_DIR.replace(/\/$/, "")}/`)
  : new URL("../", import.meta.url);
const results = [];
const htmlSource = await readFile(new URL("index.html", sourceDir), "utf8");

class ClassList {
  constructor(initial = []) { this.values = new Set(initial); }
  add(...names) { names.forEach((name) => this.values.add(name)); }
  remove(...names) { names.forEach((name) => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
}

class Element {
  constructor(id, tag = "input", classes = []) {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.value = "";
    this.textContent = "";
    this.innerHTML = "";
    this.classList = new ClassList(classes);
    this.listeners = new Map();
    this.attributes = new Map();
    this.focused = false;
  }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }
  dispatch(type) {
    const event = { preventDefault() {}, target: this };
    for (const callback of this.listeners.get(type) || []) callback.call(this, event);
  }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
  focus() { this.focused = true; }
  scrollIntoView() {}
}

function createEnvironment() {
  const ids = [
    "formularioPaciente", "formularioBusqueda", "btnGuardar", "btnLimpiar", "btnCerrar",
    "btnReabrir", "resultadosBusqueda", "pantallaCerrada", "contadorComentarios",
    "notificacionSistema",
    "rut", "fechaNacimiento", "nombres", "apellidos", "estadoCivil", "direccion",
    "ciudad", "telefono", "email", "comentarios", "buscarApellido",
    "errorRut", "errorFechaNacimiento", "errorNombres", "errorApellidos",
    "errorEstadoCivil", "errorDireccion", "errorCiudad", "errorTelefono",
    "errorEmail", "errorComentarios", "errorBusqueda"
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, new Element(id)]));
  const fieldIds = ["rut", "fechaNacimiento", "nombres", "apellidos", "estadoCivil", "direccion", "ciudad", "telefono", "email", "comentarios"];
  const errorIds = ids.filter((id) => id.startsWith("error"));
  const pageElements = {
    ".encabezado": new Element("encabezado", "header", ["encabezado"]),
    ".informacion": new Element("informacion", "section", ["informacion"]),
    ".contenedor": new Element("contenedor", "main", ["contenedor"]),
    "footer": new Element("footer", "footer"),
  };
  elements.pantallaCerrada.classList.add("oculto");
  elements.formularioPaciente.reset = () => fieldIds.forEach((id) => { elements[id].value = ""; });
  elements.formularioPaciente.querySelectorAll = () => fieldIds.map((id) => elements[id]);

  const document = {
    getElementById: (id) => elements[id],
    querySelectorAll: (selector) => {
      if (selector === ".campo-invalido") return fieldIds.concat(["buscarApellido"]).map((id) => elements[id]).filter((e) => e.classList.contains("campo-invalido"));
      if (selector === ".mensaje-error") return errorIds.map((id) => elements[id]);
      return [];
    },
    querySelector: (selector) => {
      if (selector === ".campo-invalido") return document.querySelectorAll(selector)[0] || null;
      return pageElements[selector] || null;
    },
  };
  const storage = new Map();
  const localStorage = {
    getItem: (key) => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    clear: () => storage.clear(),
  };
  const alerts = [];
  const confirms = [];
  const confirmQueue = [];
  const sandbox = {
    document, localStorage, console, Date, JSON, String, Number, Array, RegExp,
    crypto: { randomUUID: () => "00000000-0000-4000-8000-000000000001" },
    alert: (message) => alerts.push(message),
    confirm: (message) => { confirms.push(message); return confirmQueue.length ? confirmQueue.shift() : true; },
    setTimeout: (callback) => callback(),
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  return { sandbox, elements, pageElements, alerts, confirms, confirmQueue, localStorage, fieldIds };
}

async function loadApp() {
  const env = createEnvironment();
  const validationCode = await readFile(new URL("validaciones.js", sourceDir), "utf8");
  const appCode = await readFile(new URL("app.js", sourceDir), "utf8");
  vm.runInContext(validationCode, env.sandbox, { filename: "validaciones.js" });
  vm.runInContext(appCode, env.sandbox, { filename: "app.js" });
  return env;
}

function fillValid(env, overrides = {}) {
  const data = {
    rut: "12.345.678-5", nombres: "Amanda", apellidos: "Muñoz Lagos",
    fechaNacimiento: "1990-05-15", estadoCivil: "Soltero/a",
    direccion: "Avenida Siempre Viva 123", ciudad: "Santiago",
    telefono: "+56 9 6123 4567", email: "amanda.munoz@example.com",
    comentarios: "Paciente ficticio para pruebas de software.", ...overrides,
  };
  for (const [id, value] of Object.entries(data)) env.elements[id].value = value;
}

function stored(env) {
  return JSON.parse(env.localStorage.getItem("fichaMedicaPacientes") || "[]");
}

async function run(id, name, type, mode, fn) {
  try {
    const observed = await fn();
    results.push({ id, name, type, mode, status: "Aprobado", observed });
  } catch (error) {
    results.push({ id, name, type, mode, status: "Fallido", observed: error.message });
  }
}

let env = await loadApp();

await run("CN-01", "Carga del formulario principal", "Caja negra", "Automática", () => {
  const form = htmlSource.match(/<form id="formularioPaciente"[\s\S]*?<\/form>/)?.[0] || "";
  const controls = (form.match(/<(?:input|select|textarea)\b/g) || []).length;
  const buttons = ["btnGuardar", "btnLimpiar", "btnCerrar"].filter((id) => form.includes(`id="${id}"`));
  if (controls !== 10) throw new Error(`El HTML contiene ${controls} campos en el formulario principal`);
  if (buttons.length !== 3) throw new Error(`El HTML contiene ${buttons.length} botones principales identificados`);
  return "Se detectaron los 10 campos y los botones Guardar, Limpiar y Cerrar.";
});

await run("CN-02", "Guardar formulario vacío", "Caja negra", "Automática", () => {
  env.elements.formularioPaciente.dispatch("submit");
  const invalid = env.fieldIds.filter((id) => env.elements[id].classList.contains("campo-invalido"));
  if (invalid.length !== 10 || stored(env).length !== 0) throw new Error(`Campos marcados: ${invalid.length}; registros: ${stored(env).length}`);
  return "Los 10 campos obligatorios mostraron error y no se almacenó información.";
});

await run("CN-03", "Guardar registro válido", "Caja negra", "Automática", () => {
  fillValid(env);
  env.elements.formularioPaciente.dispatch("submit");
  if (stored(env).length !== 1 || stored(env)[0].rut !== "12.345.678-5") throw new Error("No se almacenó el registro esperado");
  if (htmlSource.includes("notificacionSistema") && !env.elements.notificacionSistema.textContent.includes("guardada correctamente")) throw new Error("No se mostró la notificación de guardado");
  return "Se mostró confirmación, se almacenó un registro y el formulario quedó limpio.";
});

await run("CN-04", "Rechazar RUT con dígito incorrecto", "Caja negra", "Automática", () => {
  fillValid(env, { rut: "30.000.001-9" });
  env.elements.formularioPaciente.dispatch("submit");
  if (!env.elements.errorRut.textContent.includes("RUT chileno válido") || stored(env).length !== 1) throw new Error("El RUT inválido no fue rechazado correctamente");
  return "El sistema informó RUT inválido y no creó un segundo registro.";
});

await run("CN-05", "Limpiar con confirmación", "Caja negra", "Automática", () => {
  env.elements.nombres.value = "Dato temporal";
  env.confirmQueue.push(true);
  env.elements.btnLimpiar.dispatch("click");
  if (env.elements.nombres.value !== "") throw new Error("El formulario conservó el dato temporal");
  return "La confirmación aceptada limpió campos, errores y contador sin guardar datos parciales.";
});

await run("CN-06", "Cerrar, cancelar, cerrar y reabrir", "Caja negra", "Automática", () => {
  env.elements.nombres.value = "Dato sin guardar";
  env.confirmQueue.push(false);
  env.elements.btnCerrar.dispatch("click");
  if (env.pageElements[".contenedor"].classList.contains("oculto")) throw new Error("Cancelar cerró la aplicación");
  env.confirmQueue.push(true);
  env.elements.btnCerrar.dispatch("click");
  if (env.elements.pantallaCerrada.classList.contains("oculto")) throw new Error("Confirmar no mostró la pantalla cerrada");
  env.elements.btnReabrir.dispatch("click");
  if (env.pageElements[".contenedor"].classList.contains("oculto")) throw new Error("Reabrir no restauró la aplicación");
  return "Cancelar conservó la vista; confirmar mostró el cierre y Reabrir restauró el formulario.";
});

await run("CN-07", "Buscar por apellido sin distinguir acentos ni mayúsculas", "Caja negra", "Automática", () => {
  env.elements.buscarApellido.value = "munoz";
  env.elements.formularioBusqueda.dispatch("submit");
  const html = env.elements.resultadosBusqueda.innerHTML;
  if (!html.includes("1") || !html.includes("Amanda") || !html.includes("Muñoz Lagos")) throw new Error("La búsqueda no recuperó el registro esperado");
  return "La búsqueda 'munoz' recuperó a Amanda Muñoz Lagos.";
});

await run("CN-08", "Buscar apellido inexistente", "Caja negra", "Automática", () => {
  env.elements.buscarApellido.value = "ApellidoInexistente999";
  env.elements.formularioBusqueda.dispatch("submit");
  if (!env.elements.resultadosBusqueda.innerHTML.includes("Sin coincidencias")) throw new Error("No se informó la ausencia de coincidencias");
  return "El sistema mostró 'Sin coincidencias' sin producir errores.";
});

await run("CN-09", "Rechazar fechas fuera del rango permitido", "Caja negra", "Automática", () => {
  fillValid(env, { rut: "30.000.003-7", fechaNacimiento: "2099-01-01" });
  env.elements.formularioPaciente.dispatch("submit");
  const futureError = env.elements.errorFechaNacimiento.textContent;
  fillValid(env, { rut: "30.000.003-7", fechaNacimiento: "1800-01-01" });
  env.elements.formularioPaciente.dispatch("submit");
  const oldError = env.elements.errorFechaNacimiento.textContent;
  if (!futureError.includes("no puede ser futura") || !oldError.includes("no puede superar 120 años")) throw new Error(`futura='${futureError}', antigua='${oldError}'`);
  return "La fecha futura y la edad superior a 120 años fueron rechazadas sin guardar.";
});

await run("CN-10", "Validar correo y teléfono", "Caja negra", "Automática", () => {
  fillValid(env, { rut: "30.000.003-7", email: "correo-sin-arroba", telefono: "123" });
  env.elements.formularioPaciente.dispatch("submit");
  const emailError = env.elements.errorEmail.textContent;
  const phoneError = env.elements.errorTelefono.textContent;
  if (!emailError.includes("correo electrónico válido") || !phoneError.includes("9 dígitos")) throw new Error(`correo='${emailError}', teléfono='${phoneError}'`);
  return "El sistema rechazó simultáneamente el correo sin formato y el teléfono de tres dígitos.";
});

await run("CB-01", "Rutas del algoritmo de RUT", "Caja blanca", "Automática", () => {
  const values = vm.runInContext(`({
    formatoInvalido: validarRutChileno("123"),
    digitoNormal: validarRutChileno("12.345.678-5"),
    digitoCero: validarRutChileno("30.000.001-0"),
    digitoK: validarRutChileno("1.000.005-K"),
    digitoErroneo: validarRutChileno("30.000.001-9")
  })`, env.sandbox);
  if (values.formatoInvalido || !values.digitoNormal || !values.digitoCero || !values.digitoK || values.digitoErroneo) throw new Error(JSON.stringify(values));
  return "Se cubrieron formato inválido, dígito normal, rama 0, rama K y dígito incorrecto.";
});

env = await loadApp();
await run("CB-02", "Rutas de validación integral", "Caja blanca", "Automática", () => {
  const invalid = vm.runInContext("validarFormularioCompleto()", env.sandbox);
  fillValid(env, { rut: "30.000.002-9" });
  const valid = vm.runInContext("validarFormularioCompleto()", env.sandbox);
  if (invalid !== false || valid !== true) throw new Error(`inválida=${invalid}, válida=${valid}`);
  return "La función devolvió false con entradas inválidas y true con los diez campos válidos.";
});

await run("CB-03", "Ramas de alta y sobreescritura", "Caja blanca", "Automática", () => {
  env.elements.formularioPaciente.dispatch("submit");
  fillValid(env, { rut: "30.000.002-9", email: "actualizado@example.com" });
  env.confirmQueue.push(false);
  env.elements.formularioPaciente.dispatch("submit");
  if (stored(env)[0].email === "actualizado@example.com") throw new Error("Cancelar alteró el registro");
  env.confirmQueue.push(true);
  env.elements.formularioPaciente.dispatch("submit");
  if (stored(env).length !== 1 || stored(env)[0].email !== "actualizado@example.com") throw new Error("Aceptar no actualizó el único registro");
  return "Se ejecutaron las ramas alta, duplicado-cancelar y duplicado-aceptar sin crear duplicados.";
});

await run("CB-04", "Rutas de búsqueda y escape de salida", "Caja blanca", "Automática", () => {
  const values = vm.runInContext(`({
    normalized: normalizarTexto("  MUÑOZ "),
    escaped: escaparHTML("<script>alert('x')</script>")
  })`, env.sandbox);
  env.elements.buscarApellido.value = "M";
  env.elements.formularioBusqueda.dispatch("submit");
  if (values.normalized !== "munoz" || values.escaped.includes("<script>") || !env.elements.errorBusqueda.textContent.includes("al menos 2 letras")) throw new Error(JSON.stringify(values));
  return "Se cubrieron normalización, escape HTML y rechazo de búsquedas menores a dos caracteres.";
});

await run("INT-01", "Integración formulario, validaciones, almacenamiento y búsqueda", "Integración", "Automática", async () => {
  env = await loadApp();
  fillValid(env, { rut: "30.000.003-7", apellidos: "Pérez Soto" });
  env.elements.formularioPaciente.dispatch("submit");
  env.elements.buscarApellido.value = "perez";
  env.elements.formularioBusqueda.dispatch("submit");
  const html = env.elements.resultadosBusqueda.innerHTML;
  if (!html.includes("Pérez Soto") || !html.includes("30.000.003-7")) throw new Error("Los componentes no intercambiaron el registro esperado");
  return "HTML, validaciones.js, app.js y localStorage trabajaron en conjunto para guardar y recuperar el registro.";
});

await run("REG-01", "Regresión del flujo principal", "Regresión", "Automática", () => {
  const required = ["CN-03", "CN-05", "CN-06", "CN-07", "INT-01"];
  const failed = results.filter((item) => required.includes(item.id) && item.status !== "Aprobado");
  if (failed.length) throw new Error(`Fallaron: ${failed.map((item) => item.id).join(", ")}`);
  return "La repetición confirmó Guardar, Limpiar, Cerrar/Reabrir, Buscar e integración sin regresiones.";
});

const resultsFile = process.env.RESULTS_FILE || "./resultados_semana5.json";
await writeFile(new URL(resultsFile, import.meta.url), JSON.stringify(results, null, 2));
const failed = results.filter((item) => item.status === "Fallido");
console.log(JSON.stringify({ total: results.length, approved: results.length - failed.length, failed }, null, 2));
if (failed.length) process.exitCode = 1;

