let hayCambiosSinGuardar = false,
	cuerposCargados = false,
	guardadoEnCurso = false;
const cuerpos = {
		CT: [],
		OT: [],
		CO: [],
	},
	tmpCuerpo = {
		Tipo: "",
		CuerpoId: -1,
		Nombre: "",
		Texto: "",
		actividades: [],
		strActividades: "",
	},
	TipoDocSelect = {
		CT: 0,
		DT: 0,
		OT: 0,
		CO: 0,
		RD: 0,
		ED: 0,
	};

let actividadComponent;
let cuerposDependencias = false;
let alertifyConfirm = null;

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
	validarExisteReportes();

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

			// Carga los cuerpos pero sólo carga los de OT y Contratos al confirmar el evento
			// Y también al consultar un evento confirmado
			const tipos = ["CT"];
			if (
				typeof nuevaReserva.cotizacion !== "undefined" &&
				nuevaReserva.cotizacion !== null &&
				((typeof nuevaReserva.cotizacion.edicion !== "undefined" &&
					(nuevaReserva.cotizacion.edicion === 2 ||
						nuevaReserva.cotizacion.edicion === 3)) ||
					nuevaReserva.cotizacion.estado == "CO")
			) {
				tipos.push("OT");
				tipos.push("CO");
			}
			cuerposCargados = false;
			$.ajax({
				url: rutaGeneral + "cargarCuerpos",
				type: "POST",
				data: {
					tipoEventoId: nuevaReserva.disponibilidad.tipoevento,
					tipos: JSON.stringify(tipos),
				},
				success: (res) => {
					const { CT, OT, CO } = JSON.parse(res);

					cuerpos.CT = CT;
					cuerpos.OT = OT;
					cuerpos.CO = CO;

					if (
						typeof nuevaReserva.cotizacion !== "undefined" &&
						nuevaReserva.cotizacion !== null &&
						((typeof nuevaReserva.cotizacion.edicion !== "undefined" &&
							nuevaReserva.cotizacion.edicion === 3) ||
							nuevaReserva.cotizacion.estado == "CO")
					) {
						cuerpos.OT.forEach((cuerpo) => {
							const cuerpoIndex = nuevaReserva.cotizacion.cuerpos.OT.findIndex(
								(cuerpo2) => cuerpo.CuerpoId == cuerpo2.CuerpoId
							);
							if (cuerpoIndex !== -1) {
								Object.assign(
									cuerpo,
									nuevaReserva.cotizacion.cuerpos.OT[cuerpoIndex]
								);
							}
						});
					}

					Object.keys(cuerpos).forEach((tipo) => {
						if (cuerpos[tipo].length > 0) {
							cuerpos[tipo]
								.sort((b, a) => a.Orden - b.Orden)
								.forEach((cuerpo) => {
									// Si no está en modo creación, carga inactivos los cuerpos no asociados
									// De lo contrario, carga todos como activos
									if (
										nuevaReserva.cotizacion &&
										typeof nuevaReserva.cotizacion.cuerpos !== "undefined"
									) {
										if (
											(nuevaReserva.cotizacion.edicion == 2 ||
												nuevaReserva.cotizacion.edicion == 3) &&
											(tipo == "OT" || tipo == "CO")
										) {
											cuerpo.Estado = "A";
										} else {
											const index = nuevaReserva.cotizacion.cuerpos[
												tipo
											].findIndex(
												(cuerpo2) => cuerpo2.CuerpoId === cuerpo.CuerpoId
											);
											if (index === -1) {
												cuerpo.Estado = "I";
											} else {
												cuerpo.Texto =
													nuevaReserva.cotizacion.cuerpos[tipo][index].Texto;
												cuerpo.strActividades =
													nuevaReserva.cotizacion.cuerpos[tipo][
														index
													].strActividades;
												if (tipo == "OT") {
													cuerpo.Dependencias =
														nuevaReserva.cotizacion.cuerpos[tipo][
															index
														].Dependencias;
												}
												cuerpo.Estado = "A";
											}
										}
									} else {
										cuerpo.Estado = "A";
									}

									$(`#cuerpos${tipo}`).closest("tr").next().after(`<tr
										data-cuerpoid="${cuerpo.CuerpoId}"
										data-tipocuerpo="${tipo}"
										data-dependencias="${cuerpo.strDependencias}"
									>
									<th colspan="2">
										<div class="d-flex justify-content-between align-items-center">
											<span class="mr-auto">${cuerpo.Nombre}</span>
											${
												tipo === "OT"
													? `<button
														class="btn btn-sm btn-success rounded-circle btnActividadesCuerpo mr-3 ${
															nuevaReserva.cotizacion &&
															typeof nuevaReserva.cotizacion.edicion ===
																"undefined"
																? "d-none"
																: ""
														}"
														title="Administrar Actividades"
													>
														<i class="fas fa-tasks"></i>
													</button>`
													: ""
											}
											<button
												class="btn btn-sm btn-primary rounded-circle btnEditarCuerpo ${
													nuevaReserva.cotizacion &&
													typeof nuevaReserva.cotizacion.edicion === "undefined"
														? "d-none"
														: ""
												}"
												title="Editar cuerpo"
											>
												<i class="fas fa-pencil-alt"></i>
											</button>
										</div>
									</th>
								</tr><tr>
									<td colspan="2">
										<div class="strCuerpo">${cuerpo.Texto}</div>
										<div class="strActividades">${cuerpo.strActividades}</div>
									</td>
								</tr>
								<tr>
									<td colspan="2"></td>
								</tr>`);
								});
							cuerpos[tipo].sort((a, b) => a.Orden - b.Orden);

							// Carga cuerpos en el chosen-select
							cuerpos[tipo].forEach((cuerpo) => {
								$(`#cuerpos${tipo}`).append(
									`<option
										${cuerpo.Estado === "A" ? "selected" : ""}
										value="${cuerpo.CuerpoId}"
										data-orden="${cuerpo.Orden}"
									>
										${cuerpo.Nombre}
									</option>`
								);
							});

							$(`#cuerpos${tipo}`).trigger("chosen:updated").change();
							setTimeout(() => {
								cuerposCargados = true;
							}, 100);
						}
					});
				},
			});
		})
		.on("click", ".btnEditarCuerpo", function (e) {
			e.preventDefault();
			const Tipo = $(this).closest("[data-cuerpoid]").attr("data-tipocuerpo"),
				CuerpoId = $(this).closest("[data-cuerpoid]").attr("data-cuerpoid"),
				Nombre = $(this)
					.closest("[data-cuerpoid]")
					.find("span.mr-auto")
					.text()
					.trim(),
				Texto = $(this)
					.closest("[data-cuerpoid]")
					.next()
					.find("td")
					.find(".strCuerpo")
					.html();

			tmpCuerpo.Tipo = Tipo;
			tmpCuerpo.CuerpoId = CuerpoId;
			tmpCuerpo.Nombre = Nombre;
			tmpCuerpo.Texto = Texto;
			$("#modalCuerpo").modal("show");
		})
		.on("hidden.bs.modal", function (e) {
			const modal = $(e.target).attr("id");
			if (modal == "modalCuerpo" || "modalActividades") {
				tmpCuerpo.Tipo = "";
				tmpCuerpo.CuerpoId = -1;
				tmpCuerpo.Nombre = "";
				tmpCuerpo.Texto = "";
				tmpCuerpo.actividades = [];
			}
		})
		.on("shown.bs.modal", function (e) {
			const modal = $(e.target).attr("id");
			if (modal == "modalCuerpo") {
				$("#Nombre").val(tmpCuerpo.Nombre);
				CKEDITOR.instances.editor.setData(tmpCuerpo.Texto);
			} else if (modal == "modalActi.strCuerpovidades") {
			}
		})
		.on("submit", "#formCuerpo", function (e) {
			e.preventDefault();
			tmpCuerpo.Texto = CKEDITOR.instances.editor.getData();
			$(
				`[data-tipocuerpo=${tmpCuerpo.Tipo}][data-cuerpoid=${tmpCuerpo.CuerpoId}]`
			)
				.next()
				.find("td")
				.find(".strCuerpo")
				.html(tmpCuerpo.Texto);
			$(
				`[data-tipocuerpo=${tmpCuerpo.Tipo}][data-cuerpoid=${tmpCuerpo.CuerpoId}]`
			)
				.next()
				.find("td")
				.find(".strActividades")
				.html(tmpCuerpo.strActividades);

			alertify.success(`Cuerpo ${tmpCuerpo.Nombre} actualizado exitosamente.`);
			const index = cuerpos[tmpCuerpo.Tipo].findIndex(
				(cuerpo) => cuerpo.CuerpoId == tmpCuerpo.CuerpoId
			);
			cuerpos[tmpCuerpo.Tipo][index].Texto = tmpCuerpo.Texto;
			$("#formCuerpo").trigger("reset");
			$("#modalCuerpo").modal("hide");
			hayCambiosSinGuardar = true;
			$("#btnSiguiente").removeClass("d-none");
		})
		.on("shown.bs.tab", function (e) {
			const activatedTab = $(e.target).attr("href");

			if (activatedTab === "#cotizacion") {
				cargarPDF("cotizacion");
			} else if (activatedTab === "#ot") {
				cargarPDF("ot");
			} else if (activatedTab === "#contrato") {
				cargarPDF("contrato");
			} else if (activatedTab === "#detallePDF") {
				cargarPDF("detallePDF");
			}
		})
		.on("click", ".btnActividadesCuerpo", function (e) {
			e.preventDefault();

			const Tipo = $(this).closest("[data-cuerpoid]").attr("data-tipocuerpo"),
				CuerpoId = $(this).closest("[data-cuerpoid]").attr("data-cuerpoid");

			const index = cuerpos[Tipo].findIndex(
				(cuerpo) => cuerpo.CuerpoId == CuerpoId
			);

			let dependencias = [];

			const arrDependencias = $(this)
				.closest("[data-cuerpoid]")
				.attr("data-dependencias")
				.trim();
			if (
				arrDependencias != null &&
				arrDependencias != "null" &&
				arrDependencias !== ""
			) {
				arrDependencias.split(";").forEach((dependencia) => {
					const tmpDependencia = dependencia.split(",");
					const tmpActividades = [];

					// Si es un evento confirmado en edición, carga las actividades almacenadas previamente
					if (
						typeof cuerpos[Tipo][index].Dependencias !== "undefined" &&
						cuerpos[Tipo][index].Dependencias != ""
					) {
						const indexDependencia = cuerpos[Tipo][
							index
						].Dependencias.findIndex(
							(dependencia2) => tmpDependencia[0] == dependencia2.id
						);

						for (const actividad of cuerpos[Tipo][index].Dependencias[
							indexDependencia
						].actividades) {
							tmpActividades.push(actividad);
						}
					}

					dependencias.push({
						id: tmpDependencia[0],
						nombre: tmpDependencia[1],
						actividades: tmpActividades,
					});
				});
			}

			for (const key in cuerpos[Tipo][index]) {
				tmpCuerpo[key] = cuerpos[Tipo][index][key];
			}
			tmpCuerpo.Tipo = Tipo;

			$("#modalActividades")
				.find(".modal-title")
				.html(
					`<i class="far fa-newspaper"></i> Actividades ${tmpCuerpo.Nombre}`
				);

			if (dependencias.length === 0) {
				alertify.alert(
					"Advertencia",
					`No hay dependencias asociadas al cuerpo "${tmpCuerpo.Nombre}" para este tipo de evento`
				);
			} else {
				actividadComponent = new Actividades(
					$("#modalActividades").find(".modal-body").find(".col-12"),
					{ data: dependencias }
				);

				$("#modalActividades").modal("show");
				$(".textareaActividad").trigger("input");
			}
		})
		.on("input", ".textareaActividad", function () {
			const regex = /\n/g;
			let matches = $(this).val().match(regex);
			matches = matches ? matches.length : 0;
			matches++;
			let height = 22.5 * matches;
			height = $(this)[0].scrollHeight;
			if (height < 31) {
				height = 31;
			}

			$(this).css("height", height + "px");
			$(this).css("min-height", 31 + "px");
		})
		.on("submit", "#formActividades", function (e) {
			e.preventDefault();

			const guardarActividades = () => {
				const dependencias = actividadComponent.getData();
				let strActividades = "";

				dependencias.forEach((dependencia) => {
					if (dependencia.actividades.length > 0) {
						strActividades += `<h5>${dependencia.nombre.toUpperCase()}</h5>`;
						dependencia.actividades.forEach((actividad) => {
							strActividades += `<p>${actividad.nombre}</p>`;
						});
					}
				});

				tmpCuerpo.strActividades = strActividades;

				$(
					`[data-tipocuerpo=${tmpCuerpo.Tipo}][data-cuerpoid=${tmpCuerpo.CuerpoId}]`
				)
					.next()
					.find("td")
					.find(".strCuerpo")
					.html(tmpCuerpo.Texto);

				$(
					`[data-tipocuerpo=${tmpCuerpo.Tipo}][data-cuerpoid=${tmpCuerpo.CuerpoId}]`
				)
					.next()
					.find("td")
					.find(".strActividades")
					.html(tmpCuerpo.strActividades);

				alertify.success(
					`Cuerpo ${tmpCuerpo.Nombre} actualizado exitosamente.`
				);
				const index = cuerpos[tmpCuerpo.Tipo].findIndex(
					(cuerpo) => cuerpo.CuerpoId == tmpCuerpo.CuerpoId
				);
				cuerpos[tmpCuerpo.Tipo][index].strActividades =
					tmpCuerpo.strActividades;
				cuerpos[tmpCuerpo.Tipo][index].Dependencias = dependencias;
				$("#formCuerpo").trigger("reset");
				$("#modalActividades").modal("hide");
				hayCambiosSinGuardar = true;
				$("#btnSiguiente").removeClass("d-none");
			};

			let actividadesPendientes = false;
			$(".nuevaActividad").each(function () {
				if ($(this).val().trim() !== "") {
					actividadesPendientes = true;
				}
			});

			if (actividadesPendientes) {
				alertify.confirm(
					"Advertencia",
					"Hay actividades sin guardar, ¿Está seguro de continuar?",
					function () {
						guardarActividades();
					},
					function () {}
				);
			} else {
				guardarActividades();
			}
		})
		.on("change", "#Email", function () {
			hayCambiosSinGuardar = true;

			if (
				typeof nuevaReserva.cotizacion !== "undefined" &&
				nuevaReserva.cotizacion !== null
			) {
				nuevaReserva.cotizacion.cambiosEvento = true;
				$("#btnSiguiente").removeClass("d-none");
			}
		})
		.on("change", ".checkDoc", function () {
			if ($(this).is(":checked")) {
				TipoDocSelect[$(this).val()] = 1;
			} else {
				TipoDocSelect[$(this).val()] = 0;
			}
		})
		.on("change", "[name=NuevaVersion]", function () {
			if ($(this).is(":checked")) {
				nuevaReserva.cotizacion.nuevaVersion = true;
				$(".divAdjuntos").removeClass("d-none");
			} else {
				nuevaReserva.cotizacion.nuevaVersion = false;
				$(".divAdjuntos").addClass("d-none");
			}
		})
		.on("change", ".checkDoc[id=reenvioDependencias]", function () {
			if ($(this).is(":checked")) {
				$(".checkDoc[id=elegirDependencias]")
					.closest(".divCheck")
					.removeClass("d-none");
			} else {
				$(".checkDoc[id=elegirDependencias]")
					.closest(".divCheck")
					.addClass("d-none");
			}
			$(".checkDoc[id=elegirDependencias]").prop("checked", false).change();
		})
		.on("change", ".checkDoc[id=elegirDependencias]", function () {
			if ($(this).is(":checked")) {
				if (!cuerposDependencias) {
					cuerposDependencias = true;
					const dataAJAX = { ...nuevaReserva };
					$.ajax({
						url: rutaGeneral + "cargarDependenciasCuerpos",
						type: "POST",
						async: false,
						data: {
							data: JSON.stringify(dataAJAX),
							rollbackCotizacion: true,
						},
						dataType: "json",
						success: (res) => {
							if (Object.keys(res).length > 0) {
								let htmlDependencias = "";
								Object.keys(res).forEach(function (tipo) {
									const divChecks = $(`<div id="checks${tipo}"></div>`);
									switch (tipo) {
										case "CO":
											$(divChecks).append(
												`<label class="font-weight-bold">Contrato</label>`
											);
											break;
										case "CT":
											$(divChecks).append(
												`<label class="font-weight-bold">Cotización</label>`
											);
											break;
										case "OT":
											$(divChecks).append(
												`<label class="font-weight-bold">Orden de Trabajo</label>`
											);
											break;
									}
									$(divChecks).append();
									Object.keys(res[tipo]).forEach(function (dependenciaId) {
										const dependencia = res[tipo][dependenciaId];
										$(divChecks).append(`<div class="form-group form-check">
											<input
												type="checkbox"
												class="form-check-input"
												id="${tipo}_${dependenciaId}"
												value="${dependenciaId}"
												checked
												data-tipo="${tipo}"
											>
											<label class="form-check-label" for="${tipo}_${dependenciaId}">${dependencia}</label>
										</div>`);
									});
									htmlDependencias += $(divChecks).html();
								});
								$("#divDependencias").append(htmlDependencias);
							}
						},
					});
				}
				$("#divDependencias").removeClass("d-none");
			} else {
				$("#divDependencias").addClass("d-none");
			}
		});

	$("#frmCotizacion").on("submit", function (e) {
		e.preventDefault();

		nuevaReserva.datosBasicos.tercero.email = $("#Email").val().trim();
		nuevaReserva.disponibilidad.fechalimite = $("#FechaLimite").val();
		cuerposDependencias = false;
		cargarCuerpos();

		if ($(".alertify").length > 0) {
			$(".alertify").remove();
		}

		let msg = [
			"Enviar cotización de evento",
			`¿Está seguro de registrar y enviar la cotización al correo <b>${nuevaReserva.datosBasicos.tercero.email}</b>?`,
		];

		let checks = `<div class="col-6 col-lg-3 divCheck">
			<div class="form-group">
				<div class="custom-control custom-switch">
					<input
						type="checkbox"
						class="custom-control-input checkDoc"
						name="AplicaCotizacion"
						id="AplicaCotizacion"
						value="CT"
						checked
					/>
					<label class="custom-control-label" for="AplicaCotizacion"
						>Cotización</label
					>
				</div>
			</div>
		</div>
		<div class="col-6 col-lg-3 divCheck">
			<div class="form-group">
				<div class="custom-control custom-switch">
					<input
						type="checkbox"
						class="custom-control-input checkDoc"
						name="AplicaDetalle"
						id="AplicaDetalle"
						value="DT"
						checked
					/>
					<label class="custom-control-label" for="AplicaDetalle"
						>Detalle</label
					>
				</div>
			</div>
		</div>`;

		TipoDocSelect.CT = 1;
		TipoDocSelect.DT = 1;

		if (
			nuevaReserva.cotizacion &&
			typeof nuevaReserva.cotizacion.edicion !== "undefined" &&
			(nuevaReserva.cotizacion.edicion == 2 ||
				nuevaReserva.cotizacion.edicion == 3)
		) {
			msg[0] = "Confirmar cotización de evento";
			msg[1] = `¿Está seguro de confirmar la cotización del evento?<br/><br/>
			Los PDF's se enviarán al correo <b>${nuevaReserva.datosBasicos.tercero.email}</b> y a las dependencias correspondientes, por favor espere ya que este proceso puede demorar unos minutos.`;

			checks += `<div class="col-6 col-lg-3 divCheck">
				<div class="form-group">
					<div class="custom-control custom-switch">
						<input
							type="checkbox"
							class="custom-control-input checkDoc validaEstadoCheck"
							name="AplicaOT"
							id="AplicaOT"
							value="OT"
							checked
						/>
						<label class="custom-control-label" for="AplicaOT"
							>Orden de Trabajo</label
						>
					</div>
				</div>
			</div>
			<div class="col-6 col-lg-3 divCheck">
				<div class="form-group">
					<div class="custom-control custom-switch">
						<input
							type="checkbox"
							class="custom-control-input checkDoc validaEstadoCheck"
							name="AplicaContrato"
							id="AplicaContrato"
							value="CO"
							checked
						/>
						<label class="custom-control-label" for="AplicaContrato"
							>Contrato</label
						>
					</div>
				</div>
			</div>
			<div class="col-12 divCheck">
				<div class="form-group">
					<div class="custom-control custom-switch">
						<input
							type="checkbox"
							class="custom-control-input checkDoc validaEstadoCheck"
							name="reenvioDependencias"
							id="reenvioDependencias"
							value="RD"
							checked
						/>
						<label class="custom-control-label" for="reenvioDependencias"
							>Enviar a dependencias asociadas</label
						>
					</div>
				</div>
			</div>
			<div class="col-12 divCheck">
				<div class="form-group">
					<div class="custom-control custom-switch">
						<input
							type="checkbox"
							class="custom-control-input checkDoc validaEstadoCheck"
							name="elegirDependencias"
							id="elegirDependencias"
							value="ED"
						/>
						<label class="custom-control-label" for="elegirDependencias"
							>Elegir las dependencias a las que se enviarán correos</label
						>
					</div>
				</div>
			</div>
			<div class="col-12 divCheck d-none" id="divDependencias">
			</div>
			`;

			TipoDocSelect.OT = 1;
			TipoDocSelect.CO = 1;
			TipoDocSelect.RD = 1;
			TipoDocSelect.ED = 0;
		}

		if (
			nuevaReserva.cotizacion &&
			typeof nuevaReserva.cotizacion.edicion !== "undefined" &&
			(nuevaReserva.cotizacion.edicion == 1 ||
				nuevaReserva.cotizacion.edicion == 3)
		) {
			nuevaReserva.cotizacion.nuevaVersion = false;

			msg[1] = `<label class="mb-0"
			>¿Desea editar la versión actual o crear una nueva versión? (Una nueva versión requerirá la confirmación del cliente nuevamente)</label>
			<div class="row mt-3">
				<div class="col divCheck">
					<div class="form-group mb-0">
						<div class="custom-control custom-switch">
							<input
								type="checkbox"
								class="custom-control-input"
								name="NuevaVersion"
								id="NuevaVersion"
							/>
							<label class="custom-control-label" for="NuevaVersion"
								>Generar nueva versión</label
							>
						</div>
					</div>
				</div>
			</div>
			<div class="divAdjuntos d-none mt-3">
				${msg[1]}
				<label class="mt-3 mb-0">Confirme los adjuntos a enviar:</label>
				<div class="row mt-3">${checks}</div>
			</div>`;
		} else {
			msg[1] += `<div class="divAdjuntos">
				<label class="mt-3 mb-0">Confirme los adjuntos a enviar:</label>
				<div class="row mt-3">${checks}</div>
			</div>`;
		}

		if (alertifyConfirm !== null) {
			try {
				alertifyConfirm.destroy();
			} catch (error) {}
			alertifyConfirm = null;
		}
		alertifyConfirm = alertify.confirm(
			msg[0],
			msg[1],
			async function () {
				sessionStorage.setItem(
					"newRESDatosBasicos",
					JSON.stringify(nuevaReserva.datosBasicos)
				);

				const dataAJAX = { ...nuevaReserva };

				const htmlDetalle = $("#divContenido").html().trim();

				customToast("Validando conexión a Internet...");
				const internet = await validarConexionLimite();

				customToast("Almacenando información...");

				$.ajax({
					url: rutaGeneral + "enviarCotizacion",
					type: "POST",
					data: {
						data: JSON.stringify(dataAJAX),
						htmlDetalle,
					},
					dataType: "json",
					success: (res) => {
						if ($(".ajs-message").length > 0) {
							$(".ajs-message").remove();
						}
						if (res.error) {
							if (typeof res.lugaresOcupados !== "undefined") {
								alertify.alert(
									"Lugares ocupados",
									`Por favor, revise la disponibilidad de los siguientes lugares, pues se cruzan con eventos confirmados:
									<ul>
									${res.lugaresOcupados.map(
										(lugar) =>
											`<li>${lugar.Nombre} (Evento ${lugar.Evento})</li>`
									)}
									</ul>`,
									function () {
										window.location.href =
											base_url() +
											"Administrativos/Eventos/ReservarEvento/Disponibilidad";
									}
								);
							} else if (typeof res.eventoId !== "undefined") {
								// Success

								customToast("Generando PDFs...");
								let msg = `<label class="mb-4">El evento se ha cotizado satisfactoriamente.</label>`;
								msg += `<div role="alert" class="alert alert-success">
									<h4 class="alert-heading mb-0">
										Cotización Evento N° ${res.evento}
									</h4>
								</div>`;
								if (
									nuevaReserva.cotizacion &&
									typeof nuevaReserva.cotizacion.edicion !== "undefined" &&
									(nuevaReserva.cotizacion.edicion == 1 ||
										nuevaReserva.cotizacion.edicion == 3) &&
									nuevaReserva.cotizacion.nuevaVersion === false
								) {
									// Edita el evento sin crear nueva versión
									alertify.alert("Evento cotizado", msg, function () {
										clearStorage();
									});
								} else if (internet) {
									// Enviar correos eventos que se cruzan por SSE
									if (
										typeof res.eventosCN !== "undefined" &&
										res.eventosCN.length > 0
									) {
										setTimeout(() => {
											$("#overlay").removeClass("d-none");
											$(".loader-bg").show();
										}, 100);

										const arrayResultado = res.eventosCN
											.replace(/'/g, "")
											.split(",");
										const arrayIds = arrayResultado.map((item) =>
											parseInt(item)
										);
										const cadenaArray = arrayIds.join(",");

										const eventSourceCN = new EventSource(
											`${rutaGeneral}enviarCN_SSE/${encodeURIComponent(
												cadenaArray
											)}"`
										);
										eventSourceCN.onopen = function (event) {
											console.log("Conexión SSE abierta");
										};
										eventSourceCN.onmessage = function (event) {
											const data = JSON.parse(event.data);
											console.log(data);
											if (data.status !== "OK") {
												if (typeof data.msg !== "undefined") {
													customToast(data.msg);
												}
											} else if (data.status === "Error") {
												console.error("Error de SSE: ", data.msg);
												eventSourceCN.close();
												$("#overlay").addClass("d-none");
												$(".loader-bg").hide();
												if ($(".ajs-message").length > 0) {
													$(".ajs-message").remove();
												}
												envioPDFs(res, msg);
											} else {
												eventSourceCN.close();
												$("#overlay").addClass("d-none");
												$(".loader-bg").hide();
												if ($(".ajs-message").length > 0) {
													$(".ajs-message").remove();
												}
												if (!data.internet) {
													msg += `<div class="alert alert-warning">
														No hay conexión a internet para Enviar los correos.
													</div>`;
												}
												envioPDFs(res, msg);
											}
										};
									} else {
										envioPDFs(res, msg);
									}
								} else {
									msg += `<div class="alert alert-warning">
										No hay conexión a Internet para enviar los correos.
									</div>`;

									alertify.alert("Evento cotizado", msg, function () {
										clearStorage();
									});
								}
							} else {
								if (typeof res.nuevaVersion !== "undefined") {
									alertify.alert(
										"Advertencia",
										"Está visualizando una versión desactualizada de la cotización, se enviará automáticamente a la última versión disponible",
										function () {
											const currentUrl = window.location.href;
											const lastSlashIndex = currentUrl.lastIndexOf("/");
											const baseUrl = currentUrl.substring(
												0,
												lastSlashIndex + 1
											);

											window.location.href = `${baseUrl}Disponibilidad/${res.nuevaVersion}`;
										}
									);
								} else {
									alertify.error(
										"Ocurrió un problema al registrar la cotización del evento"
									);
								}
							}
						} else {
							alertify.alert(
								"Evento cotizado",
								"El evento se ha cotizado satisfactoriamente",
								function () {
									clearStorage();
								}
							);
						}
					},
				});
			},
			function () {
				try {
					alertifyConfirm.destroy();
				} catch (error) {}
				alertifyConfirm = null;
			}
		);
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

			if (cuerposCargados) {
				hayCambiosSinGuardar = true;
				if (
					typeof nuevaReserva.cotizacion !== "undefined" &&
					nuevaReserva.cotizacion !== null
				) {
					nuevaReserva.cotizacion.cambiosEvento = true;
					$("#btnSiguiente").removeClass("d-none");
				}
			}
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
	$("#FechaLimite")
		.val(nuevaReserva.disponibilidad.fechalimite)
		.attr("disabled", false)
		.change();
	$("#FechaLimite").on("dp.hide", function () {
		nuevaReserva.disponibilidad.fechalimite = $(this).val();
		const disponibilidadJSON = JSON.stringify(nuevaReserva.disponibilidad);
		sessionStorage.setItem("newRESDisponibilidad", disponibilidadJSON);
		$("#Email").change();
	});

	if (
		nuevaReserva.cotizacion &&
		typeof nuevaReserva.cotizacion.edicion !== "undefined"
	) {
		if (
			nuevaReserva.cotizacion.edicion == 2 ||
			nuevaReserva.cotizacion.edicion == 3
		) {
			$("#FechaLimite").attr("disabled", true);
		}
	}

	let minFechaIni = new Date(9999, 0, 1);
	const fechaActual = new Date();
	nuevaReserva.disponibilidad.lugares.forEach((reserva) => {
		if (new Date(reserva.fechaini) < minFechaIni) {
			minFechaIni = new Date(reserva.fechaini);
		}
	});

	if (
		nuevaReserva.disponibilidad.fechaini != nuevaReserva.disponibilidad.fechafin
	) {
		$("#FechaLimite").datetimepicker({
			format: "YYYY-MM-DD",
			locale: "es",
			icons: {
				time: "fas fa-clock",
				date: "fa fa-calendar",
				up: "fa fa-arrow-up",
				down: "fa fa-arrow-down",
			},
			minDate: fechaActual,
			maxDate: minFechaIni,
		});
	} else {
		$("#FechaLimite").datetimepicker({
			format: "YYYY-MM-DD HH:mm:ss",
			sideBySide: true,
			locale: "es",
			icons: {
				time: "fas fa-clock",
				date: "fa fa-calendar",
				up: "fa fa-arrow-up",
				down: "fa fa-arrow-down",
			},
			minDate: fechaActual,
			maxDate: minFechaIni,
		});
	}

	// Procedimientos
	if (nuevaReserva.cotizacion && nuevaReserva.cotizacion.estado == "CO") {
		$("#ot-tab").closest("li").removeClass("d-none");
		$("#contrato-tab").closest("li").removeClass("d-none");

		$(".trOT, .trCO").each(function () {
			$(this).removeClass("d-none");
		});
	}

	if (
		nuevaReserva.cotizacion &&
		typeof nuevaReserva.cotizacion.edicion !== "undefined"
	) {
		// Si está en modo confirmación
		if (
			nuevaReserva.cotizacion.edicion == 2 ||
			nuevaReserva.cotizacion.edicion == 3
		) {
			$("#btnSiguiente")
				.html(
					$("#btnSiguiente")
						.html()
						.replace("Enviar Cotización", "Confirmar Cotización")
				)
				.removeClass("d-none");
		} else {
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
				$("#btnSiguiente").addClass("d-none");
			}
		}

		// Si está confirmando el evento, se muestran tabs de OTs y Contratos
		// Si es un evento confirmado también
		if (
			typeof nuevaReserva.cotizacion.edicion !== "undefined" &&
			(nuevaReserva.cotizacion.edicion === 2 ||
				nuevaReserva.cotizacion.edicion === 3)
		) {
			if ($("#btnSiguiente").length > 0) {
				$("#btnSiguiente").html(
					$("#btnSiguiente")
						.addClass("btnConfirmarEvento")
						.html()
						.replace("Enviar Cotización", "Confirmar Evento")
				);
			}

			$("#ot-tab").closest("li").removeClass("d-none");
			$("#contrato-tab").closest("li").removeClass("d-none");

			$(".trOT, .trCO").each(function () {
				$(this).removeClass("d-none");
			});
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

function cargarCuerpos() {
	const cuerposFiltrados = {
		CT: cuerpos.CT.filter((cuerpo) => cuerpo.Estado === "A").sort(
			(a, b) => a.Orden - b.Orden
		),
		OT: cuerpos.OT.filter((cuerpo) => cuerpo.Estado === "A").sort(
			(a, b) => a.Orden - b.Orden
		),
		CO: cuerpos.CO.filter((cuerpo) => cuerpo.Estado === "A").sort(
			(a, b) => a.Orden - b.Orden
		),
	};

	if (nuevaReserva.cotizacion === null) {
		nuevaReserva.cotizacion = {
			cuerpos: cuerposFiltrados,
		};
	} else {
		nuevaReserva.cotizacion.cuerpos = cuerposFiltrados;
	}
}

function cargarPDF(tipo) {
	cargarCuerpos();
	htmlDetalle = "";
	let reporte = "";
	if (tipo === "cotizacion") {
		reporte = "CotizacionEvento";
	} else if (tipo === "ot") {
		reporte = "OTEvento";
	} else if (tipo === "detallePDF") {
		reporte = "detallePDF";
		htmlDetalle = $("#divContenido").html().trim();
	} else {
		reporte = "ContratoEvento";
	}

	$.ajax({
		type: "POST",
		url: `${base_url()}Reportes/CargarPDF/?r0=${reporte}`,
		data: {
			evento: JSON.stringify(nuevaReserva),
			htmlDetalle,
			reporte,
		},
		dataType: "json",
		success: function (res) {
			const pdfData = "data:application/pdf;base64," + res.pdf;
			const embed = `<embed
				src="${pdfData}#zoom=100"
				type="application/pdf"
				width="100%"
				height="800"
			/>`;
			$(`#${tipo} .divPrevisualizacion`).html(embed);
		},
	});
}

async function validarConexion() {
	return new Promise(async (resolve) => {
		try {
			$.ajax({
				url: rutaGeneral + "proxyToGoogle",
				type: "GET",
				timeout: 2500,
				success: function () {
					resolve(true);
				},
				error: function (xhr, status, error) {
					resolve(false);
				},
			});
		} catch (error) {
			resolve(false);
		}
	});
}

function validarConexionLimite() {
	const limite = 2500;
	const validarConexionPromise = validarConexion();

	const tiempoAgotadoPromise = new Promise((resolve) => {
		setTimeout(() => {
			resolve(false);
		}, limite);
	});

	return Promise.race([validarConexionPromise, tiempoAgotadoPromise]);
}

alertify.dialog("customConfirm", function () {
	const buttons = [
		{ text: "Ver la última versión", key: 49, className: "btn btn-primary" },
		{
			text: "Seleccionar versión",
			key: 50,
			className: "btn btn-outline-secondary",
		},
		{
			className: "btn btn-secondary",
			invokeOnClose: true,
			key: 27,
			text: "Cancelar",
		},
	];

	return {
		main: function (title, message, callback) {
			this.title = title;
			this.message = message;
			this.callback = callback;
		},
		setup: function () {
			return {
				buttons: buttons,
				focus: { element: 0 },
				options: {
					maximizable: false,
				},
			};
		},
		prepare: function () {
			this.setHeader(this.title);
			this.setContent(this.message);
		},
		callback: function (closeEvent) {
			this.callback(closeEvent.index);
		},
	};
});

alertify.myAlert ||
	alertify.dialog("myAlert", function factory() {
		return {
			main: function (content) {
				this.setContent(content);
			},
			setup: function () {
				return {
					options: {
						maximizable: false,
						closable: false,
						resizable: false,
						padding: false,
						title: "Reporte no disponible",
					},
				};
			},
			hooks: {
				onclose: function () {
					setTimeout(function () {
						alertify.myAlert().destroy();
					}, 1000);
				},
			},
		};
	});

function validarExisteReportes() {
	$.ajax({
		type: "POST",
		url: `${base_url()}Reportes/validarExisteReportes`,
		dataType: "json",
		success: function (resp) {
			if (resp.valida == 1) {
				alertify.myAlert(resp.vista, function () {
					this.destroy();
				});
			}
		},
		error: function (error) {
			console.error("Error", error);
			return;
		},
	});
}

function customToast(msg) {
	if ($(".ajs-message").length > 0) {
		$(".ajs-message").remove();
	}
	alertify.message(msg, 0);
}

function clearStorage() {
	sessionStorage.removeItem("newRESDisponibilidad");
	sessionStorage.removeItem("newRESDatosBasicos");
	sessionStorage.removeItem("newRESComplementos");
	sessionStorage.removeItem("newRESInvitados");
	sessionStorage.removeItem("newRESCotizacion");

	hayCambiosSinGuardar = false;

	location.href = `${base_url()}Administrativos/Eventos/ListaEventos`;
}

function envioPDFs(res, msg) {
	// Envío de PDFs por SSE
	let $cotizacion = 1,
		$detalle = 1,
		$ot = 0,
		$contrato = 0,
		$dependencias = 0;

	// Si se confirmó la cotización envía los correos a las dependencias
	if (
		typeof nuevaReserva.cotizacion.edicion !== "undefined" &&
		(nuevaReserva.cotizacion.edicion === 2 ||
			nuevaReserva.cotizacion.edicion === 3)
	) {
		$ot = 1;
		$contrato = 1;
		$dependencias = 1;

		msg += `<div role="alert" class="alert alert-success">
		<h4 class="alert-heading mb-0">
			Orden de Trabajo N° ${res.ot}
		</h4>
	</div>`;
		msg += `<div role="alert" class="alert alert-success">
		<h4 class="alert-heading mb-0">
			Contrato N° ${res.contrato}
		</h4>
	</div>`;
	}

	$cotizacion = TipoDocSelect["CT"];
	$detalle = TipoDocSelect["DT"];
	$ot = TipoDocSelect["OT"];
	$contrato = TipoDocSelect["CO"];
	$dependencias = TipoDocSelect["RD"];

	setTimeout(() => {
		$("#overlay").removeClass("d-none");
		$(".loader-bg").show();
	}, 100);

	const dependenciasExcluidas = encodeURIComponent(
		JSON.stringify(obtenerDependencias())
	);

	const eventSource = new EventSource(
		`${rutaGeneral}enviarPDF/${res.eventoId}/${$cotizacion}/${$detalle}/${$ot}/${$contrato}/${$dependencias}?depeExclu=${dependenciasExcluidas}`
	);
	eventSource.onopen = function (event) {
		console.log("Conexión SSE abierta");
	};
	eventSource.onmessage = function (event) {
		const data = JSON.parse(event.data);
		console.log(data);
		if (data.status !== "OK") {
			if (typeof data.msg !== "undefined") {
				customToast(data.msg);
			}
		} else if (data.status === "Error") {
			console.error("Error de SSE: ", data.msg);
			eventSource.close();
			$("#overlay").addClass("d-none");
			$(".loader-bg").hide();
			if ($(".ajs-message").length > 0) {
				$(".ajs-message").remove();
			}
		} else {
			eventSource.close();
			$("#overlay").addClass("d-none");
			$(".loader-bg").hide();
			if ($(".ajs-message").length > 0) {
				$(".ajs-message").remove();
			}
			if (!data.internet) {
				msg += `<div class="alert alert-warning">
				No hay conexión a internet para Enviar los correos.
			</div>`;
			} else {
				if (typeof data.pdfDetalle !== "undefined" && !data.pdfDetalle) {
					msg += `<div class="alert alert-warning">
					No fue posible crear el adjunto de la Cotización.
				</div>`;
				}
				if (typeof data.pdfCotizacion !== "undefined" && !data.pdfCotizacion) {
					msg += `<div class="alert alert-warning">
					No fue posible crear el adjunto del Detalle.
				</div>`;
				}
				if (data.email != 1) {
					msg += `<div class="alert alert-warning">
					No fue posible Enviar el correo.
				</div>`;
				}
				// Si se confirmó la cotización envía los correos a las dependencias
				if (
					typeof nuevaReserva.cotizacion.edicion !== "undefined" &&
					(nuevaReserva.cotizacion.edicion === 2 ||
						nuevaReserva.cotizacion.edicion === 3)
				) {
					if (typeof data.mailCT !== "undefined" && !data.mailCT) {
						msg += `<div class="alert alert-warning">
						Ocurrió un problema al enviar los correos de las Cotizaciones.
					</div>`;
					}
					if (typeof data.mailOT !== "undefined" && !data.mailOT) {
						msg += `<div class="alert alert-warning">
						Ocurrió un problema al enviar los correos de las Ordenes de Trabajo.
					</div>`;
					}
					if (typeof data.mailCO !== "undefined" && !data.mailCO) {
						msg += `<div class="alert alert-warning">
						Ocurrió un problema al enviar los correos de los Contratos.
					</div>`;
					}
				}
			}
			alertify.alert("Evento Cotizado", msg, function () {
				clearStorage();
			});
		}
	};
	eventSource.onerror = function (event) {
		if (event.readyState === EventSource.CLOSED) {
			console.log("Conexión SSE cerrada");
		} else {
			console.error("Error de SSE: ", event);
		}
		eventSource.close();
		$("#overlay").addClass("d-none");
		$(".loader-bg").hide();
		if ($(".ajs-message").length > 0) {
			$(".ajs-message").remove();
		}
	};
}

function obtenerDependencias() {
	const dependencias = {};

	$("#divDependencias")
		.find("[data-tipo]:not(:checked)")
		.each(function () {
			const tipo = $(this).attr("data-tipo");
			if (!dependencias.hasOwnProperty(tipo)) {
				dependencias[tipo] = [];
			}
			dependencias[tipo].push($(this).val());
		});

	return dependencias;
}
