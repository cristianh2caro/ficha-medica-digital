"use strict";

/* ========================================
   ELEMENTOS PRINCIPALES
======================================== */

const formularioPaciente =
  document.getElementById("formularioPaciente");

const formularioBusqueda =
  document.getElementById("formularioBusqueda");

const btnLimpiar =
  document.getElementById("btnLimpiar");

const btnCerrar =
  document.getElementById("btnCerrar");

const btnReabrir =
  document.getElementById("btnReabrir");

const resultadosBusqueda =
  document.getElementById("resultadosBusqueda");

const pantallaCerrada =
  document.getElementById("pantallaCerrada");

/* ========================================
   ALMACENAMIENTO TEMPORAL
======================================== */

const CLAVE_ALMACENAMIENTO =
  "fichaMedicaPacientes";

function obtenerPacientesGuardados() {
  const datosGuardados =
    localStorage.getItem(CLAVE_ALMACENAMIENTO);

  if (!datosGuardados) {
    return [];
  }

  try {
    return JSON.parse(datosGuardados);
  } catch (error) {
    console.error(
      "No fue posible leer los registros:",
      error
    );

    return [];
  }
}

function guardarListaPacientes(pacientes) {
  localStorage.setItem(
    CLAVE_ALMACENAMIENTO,
    JSON.stringify(pacientes)
  );
}

/* ========================================
   FUNCIONES AUXILIARES
======================================== */

function generarIdentificador() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return String(Date.now());
}

function obtenerFechaActual() {
  return new Date().toISOString();
}

function formularioTieneDatos() {
  const elementos =
    formularioPaciente.querySelectorAll(
      "input, select, textarea"
    );

  return Array.from(elementos).some((elemento) => {
    return elemento.value.trim() !== "";
  });
}

function reiniciarFormulario() {
  formularioPaciente.reset();

  limpiarTodosLosErrores();

  document.getElementById(
    "contadorComentarios"
  ).textContent = "0/500";

  setTimeout(function () {
    document.getElementById("rut").focus();
  }, 100);
}
  formularioPaciente.reset();

  limpiarTodosLosErrores();

  document.getElementById(
    "contadorComentarios"
  ).textContent = "0/500";

  document.getElementById("rut").focus();


function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function escaparHTML(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function enfocarPrimerError() {
  const primerCampoInvalido =
    document.querySelector(".campo-invalido");

  if (primerCampoInvalido) {
    primerCampoInvalido.focus();

    primerCampoInvalido.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

/* ========================================
   GUARDAR Y SOBRESCRIBIR
======================================== */

formularioPaciente.addEventListener(
  "submit",
  function (evento) {
    evento.preventDefault();

    const formularioValido =
      validarFormularioCompleto();

    if (!formularioValido) {
      alert(
        "Revise los campos destacados antes de guardar."
      );

      enfocarPrimerError();

      return;
    }

    const paciente = obtenerDatosFormulario();

    const pacientes =
      obtenerPacientesGuardados();

    const indiceExistente =
      pacientes.findIndex((registro) => {
        return (
          limpiarRut(registro.rut) ===
          limpiarRut(paciente.rut)
        );
      });

    if (indiceExistente !== -1) {
      const confirmarSobrescritura = confirm(
        "El RUT ya está registrado. " +
        "¿Desea sobrescribir la ficha existente?"
      );

      if (!confirmarSobrescritura) {
        alert(
          "La operación fue cancelada. " +
          "La ficha anterior no fue modificada."
        );

        return;
      }

      paciente.id =
        pacientes[indiceExistente].id;

      paciente.fechaRegistro =
        pacientes[indiceExistente].fechaRegistro;

      paciente.fechaActualizacion =
        obtenerFechaActual();

      pacientes[indiceExistente] = paciente;

      guardarListaPacientes(pacientes);

      alert(
        "La ficha médica fue actualizada correctamente."
      );

      reiniciarFormulario();

      return;
    }

    paciente.id = generarIdentificador();
    paciente.fechaRegistro = obtenerFechaActual();
    paciente.fechaActualizacion =
      obtenerFechaActual();

    pacientes.push(paciente);

    guardarListaPacientes(pacientes);

    alert(
      "La ficha médica fue guardada correctamente."
    );

    reiniciarFormulario();
  }
);

/* ========================================
   BOTÓN LIMPIAR
======================================== */

btnLimpiar.addEventListener(
  "click",
  function () {
    if (!formularioTieneDatos()) {
      reiniciarFormulario();

      alert(
        "El formulario ya se encontraba vacío."
      );

      return;
    }

    const confirmarLimpieza = confirm(
      "¿Desea limpiar todos los datos ingresados?"
    );

    if (!confirmarLimpieza) {
      return;
    }

    reiniciarFormulario();

    alert(
      "El formulario fue limpiado correctamente."
    );
  }
);

/* ========================================
   BOTÓN CERRAR
======================================== */

btnCerrar.addEventListener(
  "click",
  function () {
    let mensaje =
      "¿Desea cerrar la aplicación?";

    if (formularioTieneDatos()) {
      mensaje +=
        "\n\nHay datos escritos sin guardar " +
        "que se perderán.";
    }

    const confirmarCierre = confirm(mensaje);

    if (!confirmarCierre) {
      return;
    }

    document
      .querySelector(".encabezado")
      .classList.add("oculto");

    document
      .querySelector(".informacion")
      .classList.add("oculto");

    document
      .querySelector(".contenedor")
      .classList.add("oculto");

    document
      .querySelector("footer")
      .classList.add("oculto");

    pantallaCerrada.classList.remove("oculto");
  }
);

btnReabrir.addEventListener(
  "click",
  function () {
    pantallaCerrada.classList.add("oculto");

    document
      .querySelector(".encabezado")
      .classList.remove("oculto");

    document
      .querySelector(".informacion")
      .classList.remove("oculto");

    document
      .querySelector(".contenedor")
      .classList.remove("oculto");

    document
      .querySelector("footer")
      .classList.remove("oculto");

    document.getElementById("rut").focus();
  }
);

/* ========================================
   BÚSQUEDA POR APELLIDO
======================================== */

formularioBusqueda.addEventListener(
  "submit",
  function (evento) {
    evento.preventDefault();

    const campoBusqueda =
      document.getElementById("buscarApellido");

    const errorBusqueda =
      document.getElementById("errorBusqueda");

    const apellidoBuscado =
      campoBusqueda.value.trim();

    if (apellidoBuscado.length < 2) {
      campoBusqueda.classList.add(
        "campo-invalido"
      );

      errorBusqueda.textContent =
        "Ingrese al menos 2 letras del apellido.";

      resultadosBusqueda.innerHTML = `
        <div class="sin-resultados">
          <h3>Búsqueda no realizada</h3>

          <p>
            Debe ingresar un apellido válido.
          </p>
        </div>
      `;

      campoBusqueda.focus();

      return;
    }

    campoBusqueda.classList.remove(
      "campo-invalido"
    );

    errorBusqueda.textContent = "";

    const pacientes =
      obtenerPacientesGuardados();

    const textoBuscado =
      normalizarTexto(apellidoBuscado);

    const coincidencias =
      pacientes.filter((paciente) => {
        const apellidosNormalizados =
          normalizarTexto(paciente.apellidos);

        return apellidosNormalizados.includes(
          textoBuscado
        );
      });

    mostrarResultados(coincidencias);
  }
);

document
  .getElementById("buscarApellido")
  .addEventListener("input", function () {
    this.classList.remove("campo-invalido");

    document.getElementById(
      "errorBusqueda"
    ).textContent = "";
  });

/* ========================================
   MOSTRAR RESULTADOS
======================================== */

function mostrarResultados(pacientes) {
  if (pacientes.length === 0) {
    resultadosBusqueda.innerHTML = `
      <div class="sin-resultados">
        <h3>Sin coincidencias</h3>

        <p>
          No se encontraron pacientes
          con ese apellido.
        </p>
      </div>
    `;

    return;
  }

  const filas = pacientes
    .map((paciente) => {
      return `
        <tr>
          <td>
            ${escaparHTML(paciente.nombres)}
            ${escaparHTML(paciente.apellidos)}
          </td>

          <td>
            ${escaparHTML(paciente.rut)}
          </td>

          <td>
            ${escaparHTML(paciente.ciudad)}
          </td>

          <td>
            ${escaparHTML(paciente.telefono)}

            <br>

            ${escaparHTML(paciente.email)}
          </td>
        </tr>
      `;
    })
    .join("");

  resultadosBusqueda.innerHTML = `
    <p class="resumen-resultados">
      ${pacientes.length}
      ${
        pacientes.length === 1
          ? "paciente encontrado"
          : "pacientes encontrados"
      }
    </p>

    <table class="tabla-resultados">
      <thead>
        <tr>
          <th>Paciente</th>
          <th>RUT</th>
          <th>Ciudad</th>
          <th>Contacto</th>
        </tr>
      </thead>

      <tbody>
        ${filas}
      </tbody>
    </table>
  `;
}