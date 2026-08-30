"use strict";

/* ========================================
   FUNCIONES GENERALES
======================================== */

function obtenerElemento(id) {
  return document.getElementById(id);
}

function mostrarError(campoId, errorId, mensaje) {
  const campo = obtenerElemento(campoId);
  const contenedorError = obtenerElemento(errorId);

  campo.classList.add("campo-invalido");
  campo.setAttribute("aria-invalid", "true");

  contenedorError.textContent = mensaje;
}

function limpiarError(campoId, errorId) {
  const campo = obtenerElemento(campoId);
  const contenedorError = obtenerElemento(errorId);

  campo.classList.remove("campo-invalido");
  campo.removeAttribute("aria-invalid");

  contenedorError.textContent = "";
}

function limpiarTodosLosErrores() {
  document
    .querySelectorAll(".campo-invalido")
    .forEach((campo) => {
      campo.classList.remove("campo-invalido");
      campo.removeAttribute("aria-invalid");
    });

  document
    .querySelectorAll(".mensaje-error")
    .forEach((mensaje) => {
      mensaje.textContent = "";
    });
}

/* ========================================
   VALIDACIÓN DEL RUT
======================================== */

function limpiarRut(rut) {
  return rut
    .replace(/\./g, "")
    .replace(/-/g, "")
    .replace(/\s/g, "")
    .toUpperCase();
}

function validarRutChileno(rutIngresado) {
  const rut = limpiarRut(rutIngresado);

  if (!/^\d{7,8}[0-9K]$/.test(rut)) {
    return false;
  }

  const cuerpo = rut.slice(0, -1);
  const digitoIngresado = rut.slice(-1);

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;

    multiplicador =
      multiplicador === 7
        ? 2
        : multiplicador + 1;
  }

  const resultado = 11 - (suma % 11);

  let digitoEsperado;

  if (resultado === 11) {
    digitoEsperado = "0";
  } else if (resultado === 10) {
    digitoEsperado = "K";
  } else {
    digitoEsperado = String(resultado);
  }

  return digitoIngresado === digitoEsperado;
}

function formatearRut(rutIngresado) {
  const rut = limpiarRut(rutIngresado);

  if (rut.length < 2) {
    return rut;
  }

  function formatearRutAutomaticamente(valor) {
  let rut = limpiarRut(valor);

  // Permite únicamente números y la letra K
  rut = rut.replace(/[^0-9K]/g, "");

  // Máximo: 8 números y un dígito verificador
  rut = rut.slice(0, 9);

  if (rut.length <= 1) {
    return rut;
  }

  const cuerpo = rut.slice(0, -1);
  const digitoVerificador = rut.slice(-1);

  const cuerpoFormateado = cuerpo.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    "."
  );

  return `${cuerpoFormateado}-${digitoVerificador}`;
}
  const cuerpo = rut.slice(0, -1);
  const digitoVerificador = rut.slice(-1);

  const cuerpoFormateado = cuerpo.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    "."
  );

  return `${cuerpoFormateado}-${digitoVerificador}`;
}

function validarCampoRut() {
  const campo = obtenerElemento("rut");
  const rut = campo.value.trim();

  if (rut === "") {
    mostrarError(
      "rut",
      "errorRut",
      "El RUT es obligatorio."
    );

    return false;
  }

  if (!validarRutChileno(rut)) {
    mostrarError(
      "rut",
      "errorRut",
      "Ingrese un RUT chileno válido."
    );

    return false;
  }

  campo.value = formatearRut(rut);

  limpiarError("rut", "errorRut");

  return true;
}

/* ========================================
   VALIDACIÓN DE NOMBRES Y APELLIDOS
======================================== */

function validarTextoPersona(valor) {
  const patron = /^[\p{L}]+(?:[ '\-][\p{L}]+)*$/u;

  return patron.test(valor);
}

function validarCampoNombres() {
  const nombres = obtenerElemento("nombres").value.trim();

  if (nombres === "") {
    mostrarError(
      "nombres",
      "errorNombres",
      "Los nombres son obligatorios."
    );

    return false;
  }

  if (
    nombres.length < 2 ||
    !validarTextoPersona(nombres)
  ) {
    mostrarError(
      "nombres",
      "errorNombres",
      "Utilice al menos 2 letras y no ingrese números."
    );

    return false;
  }

  limpiarError("nombres", "errorNombres");

  return true;
}

function validarCampoApellidos() {
  const apellidos =
    obtenerElemento("apellidos").value.trim();

  if (apellidos === "") {
    mostrarError(
      "apellidos",
      "errorApellidos",
      "Los apellidos son obligatorios."
    );

    return false;
  }

  if (
    apellidos.length < 2 ||
    !validarTextoPersona(apellidos)
  ) {
    mostrarError(
      "apellidos",
      "errorApellidos",
      "Utilice al menos 2 letras y no ingrese números."
    );

    return false;
  }

  limpiarError("apellidos", "errorApellidos");

  return true;
}

/* ========================================
   VALIDACIÓN DE FECHA
======================================== */

function convertirFechaLocal(fechaTexto) {
  return new Date(`${fechaTexto}T12:00:00`);
}

function validarCampoFechaNacimiento() {
  const valor =
    obtenerElemento("fechaNacimiento").value;

  if (valor === "") {
    mostrarError(
      "fechaNacimiento",
      "errorFechaNacimiento",
      "La fecha de nacimiento es obligatoria."
    );

    return false;
  }

  const fechaNacimiento = convertirFechaLocal(valor);
  const fechaActual = new Date();

  const fechaMasAntigua = new Date();

  fechaMasAntigua.setFullYear(
    fechaActual.getFullYear() - 120
  );

  if (
    Number.isNaN(fechaNacimiento.getTime()) ||
    fechaNacimiento > fechaActual
  ) {
    mostrarError(
      "fechaNacimiento",
      "errorFechaNacimiento",
      "La fecha de nacimiento no puede ser futura."
    );

    return false;
  }

  if (fechaNacimiento < fechaMasAntigua) {
    mostrarError(
      "fechaNacimiento",
      "errorFechaNacimiento",
      "La edad registrada no puede superar 120 años."
    );

    return false;
  }

  limpiarError(
    "fechaNacimiento",
    "errorFechaNacimiento"
  );

  return true;
}

/* ========================================
   VALIDACIÓN DEL ESTADO CIVIL
======================================== */

function validarCampoEstadoCivil() {
  const estadoCivil =
    obtenerElemento("estadoCivil").value;

  if (estadoCivil === "") {
    mostrarError(
      "estadoCivil",
      "errorEstadoCivil",
      "Seleccione el estado civil."
    );

    return false;
  }

  limpiarError(
    "estadoCivil",
    "errorEstadoCivil"
  );

  return true;
}

/* ========================================
   VALIDACIÓN DE DIRECCIÓN Y CIUDAD
======================================== */

function validarCampoDireccion() {
  const direccion =
    obtenerElemento("direccion").value.trim();

  if (direccion === "") {
    mostrarError(
      "direccion",
      "errorDireccion",
      "La dirección es obligatoria."
    );

    return false;
  }

  if (direccion.length < 5) {
    mostrarError(
      "direccion",
      "errorDireccion",
      "Ingrese una dirección de al menos 5 caracteres."
    );

    return false;
  }

  limpiarError("direccion", "errorDireccion");

  return true;
}

function validarCampoCiudad() {
  const ciudad = obtenerElemento("ciudad").value;

  if (ciudad === "") {
    mostrarError(
      "ciudad",
      "errorCiudad",
      "Seleccione una ciudad."
    );

    return false;
  }

  limpiarError("ciudad", "errorCiudad");

  return true;
}

/* ========================================
   VALIDACIÓN DEL TELÉFONO
======================================== */

function limpiarTelefono(telefono) {
  return telefono.replace(/[\s()-]/g, "");
}

function validarCampoTelefono() {
  const telefono =
    obtenerElemento("telefono").value.trim();

  if (telefono === "") {
    mostrarError(
      "telefono",
      "errorTelefono",
      "El teléfono es obligatorio."
    );

    return false;
  }

  const telefonoLimpio = limpiarTelefono(telefono);

  const patronTelefono = /^(?:\+?56)?\d{9}$/;

  if (!patronTelefono.test(telefonoLimpio)) {
    mostrarError(
      "telefono",
      "errorTelefono",
      "Ingrese 9 dígitos, opcionalmente precedidos por +56."
    );

    return false;
  }

  limpiarError("telefono", "errorTelefono");

  return true;
}

/* ========================================
   VALIDACIÓN DEL CORREO
======================================== */

function validarCampoEmail() {
  const email =
    obtenerElemento("email").value.trim();

  const patronEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (email === "") {
    mostrarError(
      "email",
      "errorEmail",
      "El correo electrónico es obligatorio."
    );

    return false;
  }

  if (!patronEmail.test(email)) {
    mostrarError(
      "email",
      "errorEmail",
      "Ingrese un correo electrónico válido."
    );

    return false;
  }

  limpiarError("email", "errorEmail");

  return true;
}

/* ========================================
   VALIDACIÓN DE COMENTARIOS
======================================== */

function validarCampoComentarios() {
  const comentarios =
    obtenerElemento("comentarios").value.trim();

  if (comentarios === "") {
    mostrarError(
      "comentarios",
      "errorComentarios",
      "Los comentarios son obligatorios."
    );

    return false;
  }

  if (comentarios.length < 5) {
    mostrarError(
      "comentarios",
      "errorComentarios",
      "Ingrese un comentario de al menos 5 caracteres."
    );

    return false;
  }

  if (comentarios.length > 500) {
    mostrarError(
      "comentarios",
      "errorComentarios",
      "Los comentarios no pueden superar 500 caracteres."
    );

    return false;
  }

  limpiarError(
    "comentarios",
    "errorComentarios"
  );

  return true;
}

/* ========================================
   VALIDACIÓN COMPLETA DEL FORMULARIO
======================================== */

function validarFormularioCompleto() {
  const resultados = [
    validarCampoRut(),
    validarCampoNombres(),
    validarCampoApellidos(),
    validarCampoFechaNacimiento(),
    validarCampoEstadoCivil(),
    validarCampoDireccion(),
    validarCampoCiudad(),
    validarCampoTelefono(),
    validarCampoEmail(),
    validarCampoComentarios()
  ];

  return resultados.every(
    (resultado) => resultado === true
  );
}

/* ========================================
   OBTENER LOS DATOS DEL FORMULARIO
======================================== */

function obtenerDatosFormulario() {
  return {
    rut: formatearRut(
      obtenerElemento("rut").value
    ),

    nombres:
      obtenerElemento("nombres").value.trim(),

    apellidos:
      obtenerElemento("apellidos").value.trim(),

    direccion:
      obtenerElemento("direccion").value.trim(),

    ciudad:
      obtenerElemento("ciudad").value,

    telefono:
      obtenerElemento("telefono").value.trim(),

    email:
      obtenerElemento("email").value
        .trim()
        .toLowerCase(),

    fechaNacimiento:
      obtenerElemento("fechaNacimiento").value,

    estadoCivil:
      obtenerElemento("estadoCivil").value,

    comentarios:
      obtenerElemento("comentarios").value.trim()
  };
}

/* ========================================
   VALIDACIONES DURANTE LA ESCRITURA
======================================== */

obtenerElemento("rut").addEventListener(
  "blur",
  validarCampoRut
);

obtenerElemento("rut").addEventListener(
  "blur",
  validarCampoRut

);

obtenerElemento("nombres").addEventListener(
  "blur",
  validarCampoNombres
);

obtenerElemento("apellidos").addEventListener(
  "blur",
  validarCampoApellidos
);

obtenerElemento("fechaNacimiento").addEventListener(
  "change",
  validarCampoFechaNacimiento
);

obtenerElemento("estadoCivil").addEventListener(
  "change",
  validarCampoEstadoCivil
);

obtenerElemento("direccion").addEventListener(
  "blur",
  validarCampoDireccion
);

obtenerElemento("ciudad").addEventListener(
  "change",
  validarCampoCiudad
);

obtenerElemento("telefono").addEventListener(
  "blur",
  validarCampoTelefono
);

obtenerElemento("email").addEventListener(
  "blur",
  validarCampoEmail
);

obtenerElemento("comentarios").addEventListener(
  "input",
  function () {
    const cantidad = this.value.length;

    obtenerElemento(
      "contadorComentarios"
    ).textContent = `${cantidad}/500`;

    if (cantidad >= 5) {
      limpiarError(
        "comentarios",
        "errorComentarios"
      );
    }
  }
);

/* ========================================
   FECHA MÁXIMA PERMITIDA
======================================== */

const fechaActualTexto =
  new Date().toISOString().split("T")[0];

obtenerElemento("fechaNacimiento").max =
  fechaActualTexto;

  const campoRutAutomatico =
  document.getElementById("rut");

campoRutAutomatico.addEventListener(
  "input",
  function (evento) {
    let valor = evento.target.value;

    // Elimina puntos, guion y caracteres no permitidos
    valor = valor
      .replace(/\./g, "")
      .replace(/-/g, "")
      .replace(/[^0-9kK]/g, "")
      .toUpperCase()
      .slice(0, 9);

    if (valor.length <= 1) {
      evento.target.value = valor;
      return;
    }

    const cuerpo = valor.slice(0, -1);
    const digitoVerificador = valor.slice(-1);

    const cuerpoFormateado = cuerpo.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      "."
    );

    evento.target.value =
      `${cuerpoFormateado}-${digitoVerificador}`;

    limpiarError("rut", "errorRut");
  }
);