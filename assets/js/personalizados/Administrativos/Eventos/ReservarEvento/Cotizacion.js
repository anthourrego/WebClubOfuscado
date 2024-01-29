let hayCambiosSinGuardar = false;
const cuerpos = {
	CT: [],
	OT: [],
	CO: [],
};
const tmpCuerpo = {
	Tipo: "",
	CuerpoId: -1,
	Nombre: "",
	Texto: "",
};

// CKEditor
if (CKEDITOR.env.ie && CKEDITOR.env.version < 9)
	CKEDITOR.tools.enableHtml5Elements(document);

// The trick to keep the editor in the sample quite small
// unless user specified own height.
CKEDITOR.config.height = 250;
CKEDITOR.config.width = "auto";

var initCKEditor = (function () {
	var wysiwygareaAvailable = isWysiwygareaAvailable();

	return function () {
		var editorElement = CKEDITOR.document.getById("editor");

		// Depending on the wysiwygare plugin availability initialize classic or inline editor.
		if (wysiwygareaAvailable) {
			CKEDITOR.replace("editor");
		} else {
			editorElement.setAttribute("contenteditable", "true");
			CKEDITOR.inline("editor");

			// TODO we can consider displaying some info box that
			// without wysiwygarea the classic editor may not work.
		}
	};

	function isWysiwygareaAvailable() {
		// If in development mode, then the wysiwygarea must be available.
		// Split REV into two strings so builder does not replace it :D.
		if (CKEDITOR.revision == "%RE" + "V%") {
			return true;
		}

		return !!CKEDITOR.plugins.get("wysiwygarea");
	}
})();

$(function () {
	$(window).on("beforeunload", () => {
		if (hayCambiosSinGuardar) {
			return "¿Estás segur@ que quieres salir? Hay cambios sin guardar";
		}
	});

	if (!nuevaReserva.disponibilidad) {
		window.location.href =
			base_url() + "Administrativos/Eventos/ReservarEvento/Disponibilidad";
	} else if (!nuevaReserva.datosBasicos) {
		window.location.href =
			base_url() + "Administrativos/Eventos/ReservarEvento/DatosBasicos";
	} else if (!nuevaReserva.complementos) {
		window.location.href =
			base_url() + "Administrativos/Eventos/ReservarEvento/Complementos";
	}

	if (nuevaReserva.datosBasicos.manejalista) {
		if (!nuevaReserva.invitados) {
			window.location.href =
				base_url() + "Administrativos/Eventos/ReservarEvento/Invitados";
		}
	}

	$(".chosen-select").chosen({ width: "100%" });
	initCKEditor();

	// Event Listeners

	$(document)
		.on("init.detalleComponent", function () {
			$("#divContenido").html($("#modalDetalle").find(".modal-body").html());

			const primerNombre =
				nuevaReserva.datosBasicos.tercero.nombre.split(" ")[0];

			$("#divContenido").prepend(
				`
			<p class="pNombre">Hola, ${primerNombre}</p>
			<p class="h5">Revisa tu cotización pendiente de ${$NombreEmpresa}</p>
			`
			);

			$.ajax({
				url: base_url() + "reportes/cotizacionEvento",
				type: "POST",
				data: {
					evento: JSON.stringify(nuevaReserva),
				},
				success: (res) => {
					const html = $(`<div>${res}</div>`);

					$("#plantilla").append(html.find(".salto").html());
				},
			});

			$.ajax({
				url: rutaGeneral + "cotizacionHTMLPost",
				type: "POST",
				data: {
					evento: JSON.stringify(nuevaReserva),
				},
				success: (res) => {
					$("#divCotizacion")
						.html(res)
						.find(".divAplicacion")
						.each(function () {
							$(this).remove();
						});
				},
			});

			$.ajax({
				url: rutaGeneral + "cargarCuerpos",
				type: "POST",
				data: {
					tipoEventoId: nuevaReserva.disponibilidad.tipoevento,
				},
				success: (res) => {
					const { CT, OT, CO } = JSON.parse(res);
					cuerpos.CT = CT;
					cuerpos.OT = OT;
					cuerpos.CO = CO;

					Object.keys(cuerpos).forEach((tipo) => {
						if (cuerpos[tipo].length > 0) {
							cuerpos[tipo].forEach((cuerpo) => {
								$(`#cuerpos${tipo}`).append(
									`<option
									selected
									value="${cuerpo.CuerpoId}"
									data-orden="${cuerpo.Orden}"
								>
									${cuerpo.Nombre}
								</option>`
								);
							});

							cuerpos[tipo]
								.sort((a, b) => a.Orden < b.Orden)
								.forEach((cuerpo) => {
									$(`#cuerpos${tipo}`).closest("tr").next().after(`<tr
										data-cuerpoid="${cuerpo.CuerpoId}"
										data-tipocuerpo="${tipo}"
									>
									<th colspan="2">
										<div class="d-flex justify-content-between align-items-center">
											<span class="mr-auto">${cuerpo.Nombre}</span>
											<button
												class="btn btn-sm btn-primary rounded-circle btnEditarCuerpo"
												title="Editar cuerpo"
											>
												<i class="fas fa-pencil-alt"></i>
											</button>
										</div>
									</th>
								</tr><tr>
									<td colspan="2">${cuerpo.Texto}</td>
								</tr>
								<tr>
									<td colspan="2"></td>
								</tr>`);
								});
							$(`#cuerpos${tipo}`).trigger("chosen:updated").change();
						}
					});
				},
			});
		})
		.on("click", ".btnEditarCuerpo", function () {
			const Tipo = $(this).closest("[data-cuerpoid]").attr("data-tipocuerpo"),
				CuerpoId = $(this).closest("[data-cuerpoid]").attr("data-cuerpoid"),
				Nombre = $(this)
					.closest("[data-cuerpoid]")
					.find("span.mr-auto")
					.text()
					.trim(),
				Texto = $(this).closest("[data-cuerpoid]").next().find("td").html();

			tmpCuerpo.Tipo = Tipo;
			tmpCuerpo.CuerpoId = CuerpoId;
			tmpCuerpo.Nombre = Nombre;
			tmpCuerpo.Texto = Texto;
			$("#modalCuerpo").modal("show");
		})
		.on("hidden.bs.modal", function () {
			tmpCuerpo.Tipo = "";
			tmpCuerpo.CuerpoId = -1;
			tmpCuerpo.Nombre = "";
			tmpCuerpo.Texto = "";
		})
		.on("shown.bs.modal", function () {
			$("#Nombre").val(tmpCuerpo.Nombre);
			CKEDITOR.instances.editor.setData(tmpCuerpo.Texto);
		})
		.on("submit", "#formCuerpo", function (e) {
			e.preventDefault();
			tmpCuerpo.Texto = CKEDITOR.instances.editor.getData();
			$(
				`[data-tipocuerpo=${tmpCuerpo.Tipo}][data-cuerpoid=${tmpCuerpo.CuerpoId}]`
			)
				.next()
				.find("td")
				.html(tmpCuerpo.Texto);

			alertify.success(`Cuerpo ${tmpCuerpo.Nombre} actualizado éxitosamente.`);
			const index = cuerpos[tmpCuerpo.Tipo].findIndex(
				(cuerpo) => cuerpo.CuerpoId == tmpCuerpo.CuerpoId
			);
			cuerpos[tmpCuerpo.Tipo][index].Texto = tmpCuerpo.Texto;
			$("#formCuerpo").trigger("reset");
			$("#modalCuerpo").modal("hide");
		});

	$("#frmCotizacion").on("submit", function (e) {
		e.preventDefault();

		nuevaReserva.datosBasicos.tercero.email = $("#Email").val().trim();
		const cuerposFiltrados = {
			CT: cuerpos.CT.filter((cuerpo) => cuerpo.Estado === "A"),
			OT: cuerpos.OT.filter((cuerpo) => cuerpo.Estado === "A"),
			CO: cuerpos.CO.filter((cuerpo) => cuerpo.Estado === "A"),
		};

		if (nuevaReserva.cotizacion === null) {
			nuevaReserva.cotizacion = {
				cuerpos: cuerposFiltrados,
			};
		} else {
			nuevaReserva.cotizacion.cuerpos = cuerposFiltrados;
		}

		alertify.confirm(
			"Enviar cotización de evento",
			`¿Está seguro de registrar y enviar la cotización al correo ${nuevaReserva.datosBasicos.tercero.email}?`,
			function () {
				sessionStorage.setItem(
					"newRESDatosBasicos",
					JSON.stringify(nuevaReserva.datosBasicos)
				);

				const dataAJAX = { ...nuevaReserva };

				const htmlCotizacion = JSON.stringify($("#plantilla").html().trim());
				const htmlDetalle = $("#divContenido").html().trim();

				$.ajax({
					url: rutaGeneral + "enviarCotizacion",
					type: "POST",
					data: {
						data: JSON.stringify(dataAJAX),
						htmlCotizacion,
						htmlDetalle,
					},
					success: (res) => {
						res = JSON.parse(res);
						if (res.error) {
							if (typeof res.eventoId !== undefined) {
								let msg = `<label class="mb-4">El evento se ha cotizado satisfactoriamente.</label>`;
								if (!res.pdf1) {
									msg += `<div class="alert alert-warning">
										No fue posible crear el adjunto de la cotización.
									</div>`;
								}
								if (!res.pdf2) {
									msg += `<div class="alert alert-warning">
										No fue posible crear el adjunto del detalle.
									</div>`;
								}
								if (res.email != 1) {
									msg += `<div class="alert alert-warning">
										No fue posible enviar el correo.
									</div>`;
								}

								alertify.alert("Evento cotizado", msg, function () {
									sessionStorage.removeItem("newRESDisponibilidad");
									sessionStorage.removeItem("newRESDatosBasicos");
									sessionStorage.removeItem("newRESComplementos");
									sessionStorage.removeItem("newRESInvitados");
									sessionStorage.removeItem("newRESCotizacion");

									hayCambiosSinGuardar = false;

									location.href = `${base_url()}Administrativos/Eventos/ListaEventos`;
								});
							} else {
								alertify.error(
									"Ocurrió un problema al registrar la cotización del evento"
								);
							}
						} else {
							alertify.alert(
								"Evento cotizado",
								"El evento se ha cotizado satisfactoriamente",
								function () {
									sessionStorage.removeItem("newRESDisponibilidad");
									sessionStorage.removeItem("newRESDatosBasicos");
									sessionStorage.removeItem("newRESComplementos");
									sessionStorage.removeItem("newRESInvitados");
									sessionStorage.removeItem("newRESCotizacion");

									hayCambiosSinGuardar = false;

									location.href = `${base_url()}Administrativos/Eventos/ListaEventos`;
								}
							);
						}
					},
				});
			},
			function () {}
		);
	});

	$("#Email").on("change", function () {
		hayCambiosSinGuardar = true;
	});

	$(".chosen-select")
		.on("change", function () {
			const cuerposSeleccionados = $(this).val();
			const tipo = $(this).attr("id").slice(-2);
			$(`[data-tipocuerpo=${tipo}]`).each(function () {
				const index = cuerpos[tipo].findIndex(
					(cuerpo) => cuerpo.CuerpoId == $(this).attr("data-cuerpoid")
				);

				if (cuerposSeleccionados.includes($(this).attr("data-cuerpoid"))) {
					$(this).removeClass("d-none");
					$(this).next().removeClass("d-none");
					$(this).next().next().removeClass("d-none");

					cuerpos[tipo][index].Estado = "A";
				} else {
					$(this).addClass("d-none");
					$(this).next().addClass("d-none");
					$(this).next().next().addClass("d-none");

					cuerpos[tipo][index].Estado = "I";
				}
			});

			$(this).trigger("chosen:updated");
		})
		.on("chosen:updated", function () {
			const selectedOptions = $(this)
				.closest("td")
				.find(".chosen-choices")
				.find(".search-choice")
				.toArray();
			selectedOptions.sort((a, b) => {
				const ordenA = parseInt($(a).find("a").attr("data-option-array-index"));
				const ordenB = parseInt($(b).find("a").attr("data-option-array-index"));
				return ordenA - ordenB;
			});
		});

	// Métodos

	// Procedimientos

	$("#Email").val(nuevaReserva.datosBasicos.tercero.email);

	// Procedimientos

	if (
		nuevaReserva.cotizacion &&
		typeof nuevaReserva.cotizacion.edicion !== "undefined"
	) {
		// Si está en modo edición
		if (
			typeof nuevaReserva.cotizacion.cambiosEvento !== "undefined" &&
			nuevaReserva.cotizacion.cambiosEvento
		) {
			$("#btnSiguiente").html(
				$("#btnSiguiente")
					.html()
					.replace("Enviar Cotización", "Guardar Edición")
			);
		} else {
			// Si está en modo edición y no se ha editado nada
			$("#btnSiguiente").remove();
		}
	}
});

function clonarObjeto(objeto) {
	let clon = {};
	for (let clave in objeto) {
		if (typeof objeto[clave] === "object" && objeto[clave] !== null) {
			clon[clave] = clonarObjeto(objeto[clave]);
		} else {
			clon[clave] = objeto[clave];
		}
	}
	return clon;
}
