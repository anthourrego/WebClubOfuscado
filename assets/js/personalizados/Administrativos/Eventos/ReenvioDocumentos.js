rutaGeneral = base_url() + "Administrativos/Eventos/ReservarEvento/";
const nuevaReserva = {};
let htmlDetalle = "";
TipoDocSelect = {
	CT: 0,
	DT: 0,
	OT: 0,
	CO: 0,
	RD: 0,
};

$(function () {
	cargarDetalle();
	$("#cotizacion-tab").click();

	validaEstado = $DATOSEVENTO.cotizacion.estado;

	if (
		validaEstado === "CO" ||
		validaEstado === "FI" ||
		validaEstado === "AC" ||
		validaEstado === "VE"
	) {
		$(".validaEstado").removeClass("d-none");
		$(".validaEstadoCheck").prop("disabled", false);
	}

	$(document).on("click", "#btnVolver", function () {
		window.history.back();
	});

	$(".checkDoc").on("change", function () {
		if ($(this).is(":checked")) {
			TipoDocSelect[$(this).val()] = 1;
		} else {
			TipoDocSelect[$(this).val()] = 0;
		}
	});

	$(document).on("shown.bs.tab", function (e) {
		const activatedTab = $(e.target).attr("href");
		if (activatedTab === "#cotizacion") {
			cargarPDF("cotizacion");
		} else if (activatedTab === "#detallePDF") {
			cargarPDF("detallePDF");
		} else if (activatedTab === "#ot") {
			cargarPDF("ot");
		} else if (activatedTab === "#contrato") {
			cargarPDF("contrato");
		}
	});

	$(document).on("click", "#btnReenvio", function () {
		$("#modalReenvio").modal("show");
	});

	$(document).on("click", "#btnReenviarDocumento", function () {
		const correoUsu = $("#Email").val();
		let validaDoc = 0;
		for (var value in TipoDocSelect) {
			validaDoc += TipoDocSelect[value];
		}

		if (
			validaDoc > 0 &&
			((validaDoc == 1 && TipoDocSelect["RD"] == 1) || $("#Email").val() != "")
		) {
			let msg = `¿Está seguro de enviar los documentos al correo ${correoUsu}?`;
			if (validaDoc == 1 && TipoDocSelect["RD"] == 1) {
				msg =
					"¿Está seguro de enviar las ordenes de trabajo a las dependencias asociadas?";
			}
			alertify.confirm(
				"Enviar cotización de evento",
				msg,
				function () {
					$.ajax({
						type: "POST",
						url: rutaGeneral + "guardaDetalle",
						data: {
							htmlDetalle,
						},
						dataType: "json",
						success: async function (res) {
							console.log("Detalle cargado a la sesión...");

							$("#modalReenvio").modal("hide");

							const dataAJAX = { ...$DATOSEVENTO };

							customToast("Validando conexión a Internet...");

							const internet = await validarConexionLimite();

							customToast("Procesando información...");

							if (internet) {
								// Envío de PDFs por SSE
								eventoId = dataAJAX.cotizacion.eventoId;
								let $enviarCotizacion = TipoDocSelect["CT"],
									$detalle = TipoDocSelect["DT"],
									$enviarOT = TipoDocSelect["OT"],
									$enviarContrato = TipoDocSelect["CO"],
									$enviarDependencias = TipoDocSelect["RD"],
									$correo = encodeURIComponent(correoUsu);

								setTimeout(() => {
									$("#overlay").removeClass("d-none");
									$(".loader-bg").show();
								}, 100);

								const eventSource = new EventSource(
									`${rutaGeneral}enviarPDF/${eventoId}/${$enviarCotizacion}/${$detalle}/${$enviarOT}/${$enviarContrato}/${$enviarDependencias}/${$correo}`
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
										let msg = `<div class="alert alert-success">
														Se realizó el envío de los documentos satisfactoriamente.
													</div>`;
										if (!data.internet) {
											msg += `<div class="alert alert-warning">
												No hay conexión a internet para Enviar los correos.
											</div>`;
										} else {
											if (
												data.pdfCotizacion !== undefined &&
												!data.pdfCotizacion
											) {
												msg += `<div class="alert alert-warning">
													No fue posible crear el adjunto de la Cotización.
												</div>`;
											}
											if (data.pdfDetalle !== undefined && !data.pdfDetalle) {
												msg += `<div class="alert alert-warning">
													No fue posible crear el adjunto del Detalle.
												</div>`;
											}
											if (data.enviarOT !== undefined && !data.enviarOT) {
												msg += `<div class="alert alert-warning">
													No fue posible crear el adjunto de las ordenes de trabajo.
												</div>`;
											}
											if (
												data.enviarContrato !== undefined &&
												!data.enviarContrato
											) {
												msg += `<div class="alert alert-warning">
													No fue posible crear el adjunto del contrato.
												</div>`;
											}
											if (
												data.enviarDependencias !== undefined &&
												!data.enviarDependencias
											) {
												msg += `<div class="alert alert-warning">
													No fue posible reenviar a las dependencias.
												</div>`;
											}
											if (data.email != 1) {
												msg += `<div class="alert alert-warning">
													No fue posible Enviar el correo.
												</div>`;
											}
										}
										alertify.alert("Confirmación de envío", msg, function () {
											location.reload();
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
							} else {
								msg += `<div class="alert alert-warning">
									No hay conexión a Internet para enviar los correos.
								</div>`;
							}
						},
					});
				},
				function () {}
			);
		} else {
			alertify.error(
				"Debe ingresar un correo electrónico y seleccionar al menos un documento a enviar"
			);
		}
	});

	$("#modalReenvio").on("shown.bs.modal", function () {
		$(".checkDoc").prop("checked", false).change();
		$("#AplicaCotizacion").prop("checked", true).change();
		$("#Email").val("");
	});
});

function cargarPDF(tipo) {
	let reporte = "";
	htmlDetalle = "";
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
		url: `${base_url()}Reportes/CargarPDF/?r0=${reporte}/`,
		data: {
			evento: JSON.stringify($DATOSEVENTO),
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
				class="border"
			/>`;
			$(`#${tipo} .divPrevisualizacion`).html(embed);
		},
	});
}

function cargarDetalle() {
	htmlDetalle = "";
	data = JSON.stringify($DATOSEVENTO);
	$.ajax({
		url: rutaGeneral + "detalleReserva",
		type: "POST",
		data: {
			data,
		},
		success: (res) => {
			const AJAXdata = JSON.parse(res);
			Object.assign(nuevaReserva, AJAXdata);
			if (nuevaReserva.disponibilidad) {
				let FORMAT = "DD/MM/YYYY";
				let allDay = true;
				let minFechaIni = new Date(9999, 0, 1),
					maxFechaFin = new Date(1000, 11, 31);
				let strFechas = "";
				const FORMATHOURS = "h:mm a";
				let strLugares = "<ul>";
				nuevaReserva.disponibilidad.lugares.forEach((lugar) => {
					let fechaIni = new Date(lugar.fechaini),
						fechaFin = new Date(lugar.fechafin);
					if (fechaIni < minFechaIni) {
						minFechaIni = fechaIni;
					}
					if (fechaFin > maxFechaFin) {
						maxFechaFin = fechaFin;
					}
					if (!lugar.allDay) {
						allDay = false;
						FORMAT = `DD/MM/YYYY ${FORMATHOURS}`;
					}
					let tipoMontaje = "";
					if (lugar.tipomontaje) {
						tipoMontaje = ` [${lugar.TMNombre}]`;
					}
					strLugares += `<li>${lugar.Nombre} / ${
						lugar.TLNombre
					}${tipoMontaje} ${
						nuevaReserva.disponibilidad.agrupar
							? ""
							: `(${moment(fechaIni).format(FORMAT)} - ${moment(
									fechaFin
							  ).format(FORMAT)})`
					} </li>`;
				});
				strLugares += "</ul>";
				if (allDay) {
					strFechas = `${moment(minFechaIni).format(FORMAT)} - ${moment(
						maxFechaFin
					).format(FORMAT)}`;
				} else {
					strFechas = `${moment(minFechaIni).format(FORMAT)} - ${moment(
						maxFechaFin
					).format(FORMAT)}`;
				}
				const strDisponibilidad = `
					<h4>Disponibilidad</h4>
					<p>${nuevaReserva.disponibilidad.nombre}</p>
					<p>${strFechas}</p>
					<p><strong>Tipo de Evento:</strong> ${
						nuevaReserva.disponibilidad.tipoeventonombre
					}</p>
					<p><strong>Personas:</strong> ${addCommas(
						nuevaReserva.disponibilidad.personas
					)}</p>
					<p><strong>Lugares:</strong></p>
					${strLugares}
				`;

				htmlDetalle += strDisponibilidad;
			}
			if (nuevaReserva.datosBasicos) {
				const strDatosBasicos = `
					<h4>Datos Básicos</h4>
					${nuevaReserva.datosBasicos.interno ? "<p>Es Interno</p>" : ""}
					${nuevaReserva.datosBasicos.menu ? "<p>Aplica Menú</p>" : ""}
					${
						nuevaReserva.datosBasicos.interno &&
						nuevaReserva.datosBasicos.boleteria
							? "<p>Boletería</p>"
							: ""
					}
					<p><strong>Medio de la Reserva:</strong> ${
						nuevaReserva.datosBasicos.medioReservaNombre
					}</p>
					<p><strong>Asesor Comercial:</strong> ${
						nuevaReserva.datosBasicos.vendedorNombre
					}</p>
					<p><strong>Tercero:</strong></p>
					<ul>
						<li><strong>N° documento:</strong> ${
							nuevaReserva.datosBasicos.tercero.terceroid
						}</li>
						${
							nuevaReserva.datosBasicos.tercero.accion
								? `<li><strong>Acción:</strong> ${nuevaReserva.datosBasicos.tercero.accion}</li>`
								: ""
						} 
						<li><strong>Nombre:</strong> ${nuevaReserva.datosBasicos.tercero.nombre}</li>
						<li><strong>Email:</strong> ${nuevaReserva.datosBasicos.tercero.email}</li>
						<li><strong>Teléfono:</strong> ${
							nuevaReserva.datosBasicos.tercero.telefono
						}</li>
					</ul>
				`;

				htmlDetalle += strDatosBasicos;

				if ($datosMontaje.SolicitaGeneroEventos == "S") {
					htmlDetalle += `
						<p><strong>Hombres:</strong> ${nuevaReserva.datosBasicos.hombres}</p>
						<p><strong>Mujeres:</strong> ${nuevaReserva.datosBasicos.mujeres}</p>
						<p><strong>Niños:</strong> ${nuevaReserva.datosBasicos.ninos}</p>
						<p><strong>Niñas:</strong> ${nuevaReserva.datosBasicos.ninas}</p>
						<p><strong>Observaciones:</strong> ${nuevaReserva.datosBasicos.observacion}</p>	
					`;
				}
			}

			if (nuevaReserva.complementos) {
				const totales = {
					totalFijos: 0,
					totalMenus: 0,
					totalOtros: 0,
					totalServicios: 0,
					totalIva: 0,
					totalImpoConsumo: 0,
					totalTotal: 0,
					totalLugares: 0,
				};

				for (const value of Object.values(nuevaReserva.complementos)) {
					for (const value2 of Object.values(value)) {
						if (value2.ivaid == "8.0000") {
							totales.totalImpoConsumo +=
								((value2.total / (1 + value2.ivaid / 100)) * value2.ivaid) /
								100;
						} else {
							totales.totalIva +=
								((value2.total / (1 + value2.ivaid / 100)) * value2.ivaid) /
								100;
						}
					}
				}

				// Elementos Fijos

				// Filtramos costo de los lugares
				const elementosFijos = nuevaReserva.complementos.elementosFijos.filter(
					(producto) => producto.ElementoId !== -1
				);

				totales.totalFijos = elementosFijos.reduce(
					(acumulador, producto) => acumulador + parseFloat(producto.total),
					0
				);

				const lugares = nuevaReserva.complementos.elementosFijos.filter(
					(producto) => producto.ElementoId == -1
				);

				totales.totalLugares = lugares.reduce(
					(acumulador, producto) => acumulador + parseFloat(producto.total),
					0
				);

				// Objeto donde se agruparán los objetos por el lugar

				const fijosObjetosAgrupados = elementosFijos.reduce(
					(acumulador, objeto) => {
						const menu = objeto.menu;
						if (!acumulador[menu]) {
							acumulador[menu] = [];
						}
						acumulador[menu].push(objeto);
						return acumulador;
					},
					{}
				);

				// Array de objetos agrupados por el lugar
				const fijosArrayAgrupado = Object.entries(fijosObjetosAgrupados).map(
					([menu, objetos]) => ({ menu, objetos })
				);

				const strFijos = fijosArrayAgrupado.reduce(
					(acumulador, menu) =>
						acumulador +
						`<li><small>${menu.objetos[0].nombreMenu}</small>
							<ul>
							${menu.objetos.reduce(
								(acumulador2, menu2) =>
									acumulador2 +
									`<li><small>${menu2.nombre} x ${menu2.cantidad}</small></li>`,
								""
							)}
							</ul>
						</li>`,
					""
				);

				// Menús
				const menus = nuevaReserva.complementos.menus;
				totales.totalMenus = menus.reduce(
					(acumulador, producto) => acumulador + parseFloat(producto.total),
					0
				);

				totales.totalMenus = menus.reduce(
					(acumulador, producto) => acumulador + parseFloat(producto.total),
					0
				);

				// Objeto donde se agruparán los objetos por el menú
				const menusObjetosAgrupados = menus.reduce((acumulador, objeto) => {
					const menu = objeto.menu;
					if (!acumulador[menu]) {
						acumulador[menu] = [];
					}
					acumulador[menu].push(objeto);
					return acumulador;
				}, {});

				// Array de objetos agrupados por el menú
				const menusArrayAgrupado = Object.entries(menusObjetosAgrupados).map(
					([menu, objetos]) => ({ menu, objetos })
				);

				const strMenus = menusArrayAgrupado.reduce((acumulador, menu) => {
					desde =
						menu.objetos[0].hasOwnProperty("desde") && menu.objetos[0].desde
							? menu.objetos[0].desde
							: " ";
					hasta =
						menu.objetos[0].hasOwnProperty("hasta") && menu.objetos[0].hasta
							? " " + menu.objetos[0].hasta
							: " ";
					hora =
						menu.objetos[0].hasOwnProperty("hora") && menu.objetos[0].hora
							? " " + menu.objetos[0].hora
							: " ";

					return (
						acumulador +
						`<li>	
							<span>${menu.objetos[0].nombreMenu}</span>
							<span style="float: right;text-align: right;font-style:italic;font-size: smaller;">${
								desde + hasta + hora
							}
							</span>
							<ul>
							${menu.objetos.reduce(
								(acumulador2, menu2) =>
									acumulador2 +
									`<li>
										<small>${menu2.nombre} x ${menu2.cantidad}</small>
										${
											menu2.Observacion
												? `<br><small style="font-size: small;font-style: italic;margin: 0;">${menu2.Observacion}</small>`
												: ""
										}
									</li>`,
								""
							)}
							</ul>
						</li>`
					);
				}, "");

				// Otros
				const otros = nuevaReserva.complementos.otros;
				totales.totalOtros = otros.reduce(
					(acumulador, producto) => acumulador + parseFloat(producto.total),
					0
				);

				const strOtros = otros.reduce(
					(acumulador, producto) =>
						acumulador +
						`<li><small>${producto.nombre} x ${producto.cantidad}</small></li>`,
					""
				);

				// Servicios
				const servicios = nuevaReserva.complementos.servicios;
				totales.totalServicios = servicios.reduce(
					(acumulador, producto) => acumulador + parseFloat(producto.total),
					0
				);

				const strServicios = servicios.reduce(
					(acumulador, producto) =>
						acumulador +
						`<li><small>${producto.nombre} x ${producto.cantidad}</small></li>`,
					""
				);

				totales.totalTotal =
					totales.totalFijos +
					totales.totalMenus +
					totales.totalOtros +
					totales.totalServicios +
					totales.totalLugares;

				const strComplementos = `
					<h4>Complementos</h4>

					${
						strFijos.length
							? `<p class="mb-0">Elementos Fijos</p>
								<ul>
									${strFijos}
								</ul>`
							: ""
					}

					${
						strMenus.length
							? `<p class="mb-0">Menú</p>
								<ul>
									${strMenus}
								</ul>`
							: ""
					}
					
					${
						strOtros.length
							? `<p class="mb-0">Otros</p>
								<ul>
									${strOtros}
								</ul>`
							: ""
					}

					${
						strServicios.length
							? `<p class="mb-0">Servicios</p>
								<ul>
									${strServicios}
								</ul>`
							: ""
					}

					${
						strFijos.length
							? `<p><strong>Total Elementos:</strong> $ ${addCommas(
									totales.totalFijos
							  )}</p>`
							: ""
					}

					${
						strMenus.length
							? `<p><strong>Total Menú:</strong> $ ${addCommas(
									totales.totalMenus
							  )}</p>`
							: ""
					}
					
					${
						strOtros.length
							? `<p><strong>Total Otros:</strong> $ ${addCommas(
									totales.totalOtros
							  )}</p>`
							: ""
					}

					${
						strServicios.length
							? `<p><strong>Total Servicios:</strong> $ ${addCommas(
									totales.totalServicios
							  )}</p>`
							: ""
					}
					
					<p><strong>Sub Total:</strong> $ ${addCommas(
						totales.totalTotal - totales.totalImpoConsumo - totales.totalIva
					)}</p>
					<p><strong>Total Iva:</strong> $ ${addCommas(totales.totalIva)}</p>
					<p><strong>Total ImpoConsumo:</strong> $ ${addCommas(
						totales.totalImpoConsumo
					)}</p>
					<p><strong>Total:</strong> $ ${addCommas(totales.totalTotal)}</p>
				`;

				htmlDetalle += strComplementos;
			}
			if (nuevaReserva.invitados) {
				const strInvitados = `
					<h4>Invitados</h4>
					<p>${addCommas(nuevaReserva.invitados.length)} invitados cargados</p>
				`;

				htmlDetalle += strInvitados;
			}

			const strCotizacion = `
				<h4>Cotización</h4>
				<p><strong>Consecutivo: </strong>${nuevaReserva.cotizacion.evento}</p>
				<p><strong>Versión: </strong>${nuevaReserva.cotizacion.version}</p>
			`;

			htmlDetalle += strCotizacion;

			$("#divContenido").append(htmlDetalle);
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

function customToast(msg) {
	if ($(".ajs-message").length > 0) {
		$(".ajs-message").remove();
	}
	alertify.message(msg, 0);
}
