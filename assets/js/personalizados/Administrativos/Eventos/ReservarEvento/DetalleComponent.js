const nuevaReserva = {},
	rutaGeneral = base_url() + "Administrativos/Eventos/ReservarEvento/";

if (typeof reservaDB !== "undefined") {
	Object.assign(nuevaReserva, reservaDB);

	sessionStorage.setItem(
		"newRESDisponibilidad",
		JSON.stringify(nuevaReserva.disponibilidad)
	);
	sessionStorage.setItem(
		"newRESDatosBasicos",
		JSON.stringify(nuevaReserva.datosBasicos)
	);
	sessionStorage.setItem(
		"newRESComplementos",
		JSON.stringify(nuevaReserva.complementos)
	);
	sessionStorage.setItem(
		"newRESInvitados",
		JSON.stringify(nuevaReserva.invitados)
	);
	sessionStorage.setItem(
		"newRESCotizacion",
		JSON.stringify(nuevaReserva.cotizacion)
	);
} else {
	nuevaReserva.disponibilidad = sessionStorage.getItem("newRESDisponibilidad");
	nuevaReserva.datosBasicos = sessionStorage.getItem("newRESDatosBasicos");
	nuevaReserva.complementos = sessionStorage.getItem("newRESComplementos");
	nuevaReserva.invitados = sessionStorage.getItem("newRESInvitados");
	nuevaReserva.cotizacion = sessionStorage.getItem("newRESCotizacion");

	if (nuevaReserva.disponibilidad) {
		nuevaReserva.disponibilidad = JSON.parse(nuevaReserva.disponibilidad);
	}
	if (nuevaReserva.datosBasicos) {
		nuevaReserva.datosBasicos = JSON.parse(nuevaReserva.datosBasicos);
	}
	if (nuevaReserva.complementos) {
		nuevaReserva.complementos = JSON.parse(nuevaReserva.complementos);
	}
	if (nuevaReserva.invitados) {
		nuevaReserva.invitados = JSON.parse(nuevaReserva.invitados);
	}
	if (nuevaReserva.cotizacion) {
		nuevaReserva.cotizacion = JSON.parse(nuevaReserva.cotizacion);
	}
}

$(function () {
	if (
		nuevaReserva.disponibilidad ||
		nuevaReserva.datosBasicos ||
		nuevaReserva.complementos ||
		nuevaReserva.invitados ||
		nuevaReserva.cotizacion
	) {
		const { invitados, ...tmpReserva } = nuevaReserva;
		data = JSON.stringify(tmpReserva);
		let htmlDetalle = "";

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
						<p><strong>Hombres:</strong> ${nuevaReserva.datosBasicos.hombres}</p>
						<p><strong>Mujeres:</strong> ${nuevaReserva.datosBasicos.mujeres}</p>
						<p><strong>Niños:</strong> ${nuevaReserva.datosBasicos.ninos}</p>
						<p><strong>Niñas:</strong> ${nuevaReserva.datosBasicos.ninas}</p>
						<p><strong>Observaciones:</strong> ${nuevaReserva.datosBasicos.observacion}</p>
					`;

					htmlDetalle += strDatosBasicos;
				}
				if (nuevaReserva.complementos) {
					const totales = {
						totalFijos: 0,
						totalMenus: 0,
						totalOtros: 0,
						totalServicios: 0,

						totalTotal: 0,
					};

					// Elementos Fijos

					// Filtramos costo de los lugares
					const elementosFijos =
						nuevaReserva.complementos.elementosFijos.filter(
							(producto) => producto.ElementoId !== -1
						);

					totales.totalFijos = elementosFijos.reduce(
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

					const strMenus = menusArrayAgrupado.reduce(
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
						totales.totalServicios;

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
				if (nuevaReserva.cotizacion) {
					// Funciones

					function confirmarCoti(estado) {
						const $nit = NIT(),
							$documento = nuevaReserva.datosBasicos.tercero.terceroid,
							$eventoId = nuevaReserva.cotizacion.eventoId;

						$.ajax({
							url:
								rutaGeneral +
								`confirmarCotizacion/${$nit}/${$documento}/${$eventoId}`,
							type: "POST",
							data: {
								data: {
									data: JSON.stringify({ ...nuevaReserva }),
									estado,
									cambiosEvento: false,
								},
							},
							success: (res) => {
								if (res != 0) {
									hayCambiosSinGuardar = false;

									alertify.alert(
										`Cotización ${estado == "CO" ? "confirmada" : "anulada"}`,
										`La cotización ha sido <b>${
											estado == "CO" ? "Confirmada" : "Anulada"
										}</b> satisfactoriamente`,
										function () {
											location.href =
												base_url() + "Administrativos/Eventos/ListaEventos";
										}
									);
								} else {
									alertify.alert(
										"Error",
										`Ocurrió un error al momento de ${
											estado == "CO" ? "Confirmar" : "Anular"
										} la cotización`
									);
								}
							},
						});
					}

					// Event listeners

					$("#selectVersion")
						.off("change")
						.on("change", function () {
							const ver = $(this).val();
							location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad/${ver}`;
						});

					const editarEvento = (modo) => {
						nuevaReserva.cotizacion.edicion = modo;
						sessionStorage.setItem(
							"newRESCotizacion",
							JSON.stringify(nuevaReserva.cotizacion)
						);

						const currentUrl = window.location.href;
						const urlSegments = currentUrl.split("/");
						const indexDisponibilidad = urlSegments.indexOf("Disponibilidad");
						if (indexDisponibilidad !== -1) {
							if (typeof urlSegments[indexDisponibilidad + 1] !== "undefined") {
								const lastSlashIndex = currentUrl.lastIndexOf("/");
								location.href = currentUrl.substring(0, lastSlashIndex);
							} else {
								location.reload();
							}
						} else {
							location.reload();
						}
					};

					$("#ddNuevaVersion")
						.off("click")
						.on("click", function (e) {
							e.preventDefault();
							alertify.confirm(
								"Crear nueva versión",
								"¿Desea abrir la cotización actual en modo edición para así crear una nueva versión?",
								function () {
									editarEvento(1);
								},
								function () {}
							);
						});

					$("#ddConfirmar")
						.off("click")
						.on("click", function (e) {
							e.preventDefault();
							alertify.confirm(
								"Confirmar cotización",
								"¿Está seguro de confirmar definitivamente esta cotización?",
								function () {
									confirmarCoti("CO");
								},
								function () {}
							);
						});

					$("#ddAnular")
						.off("click")
						.on("click", function (e) {
							e.preventDefault();
							alertify.confirm(
								"Anular cotización",
								"¿Está seguro de dar fin y anular esta cotización?",
								function () {
									confirmarCoti("NU");
								},
								function () {}
							);
						});

					$("#ddEditarEvento")
						.off("click")
						.on("click", function (e) {
							e.preventDefault();
							alertify.confirm(
								"Editar evento confirmado",
								"¿Desea abrir la cotización actual en modo edición para así crear una nueva versión pese a ya estar confirmado el evento?",
								function () {
									editarEvento(2);
								},
								function () {}
							);
						});

					$("#btnCancelarEdi")
						.off("click")
						.on("click", function (e) {
							e.preventDefault();
							alertify.confirm(
								"Cancelar edición",
								"¿Está seguro de cancelar la edición del evento actual sin guardar los cambios?",
								function () {
									location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad/${
										nuevaReserva.cotizacion.eventoId
									}`;
								},
								function () {}
							);
						});

					// Procedimientos

					const estadosFinales = ["NU", "CO", "EX", "VE", "FI", "AC"];

					const strCotizacion = `
						<h4>Cotización</h4>
						<p><strong>Consecutivo: </strong>${nuevaReserva.cotizacion.evento}</p>
						<p><strong>Versión: </strong>${nuevaReserva.cotizacion.version}</p>
					`;

					htmlDetalle += strCotizacion;

					$("#divVersion")
						.find("#pEvento")
						.html(
							$("#divVersion")
								.find("#pEvento")
								.html()
								.replace("{nEvento}", nuevaReserva.cotizacion.evento)
						);

					nuevaReserva.cotizacion.versiones.forEach((version) => {
						const fecha = moment(
							version.FechaSolici,
							"YYYY-MM-DD HH:mm:ss"
						).format("YYYY-MM-DD hh:mm:ss A");
						$("#selectVersion").append(
							`<option value="${version.EventoId}">${version.Version} | ${version.Estado} | ${fecha}</option>`
						);
					});

					$("#selectVersion").val(nuevaReserva.cotizacion.eventoId);

					if (
						!nuevaReserva.cotizacion.ultimaVersion ||
						nuevaReserva.cotizacion.estado !== "CC"
					) {
						$("#ddConfirmar").addClass("d-none");
					}

					$("#divVersion").removeClass("d-none");

					if (estadosFinales.includes(nuevaReserva.cotizacion.estado)) {
						if (nuevaReserva.cotizacion.estado === "CO") {
							$("#ddNuevaVersion, #ddConfirmar, #ddAnular").addClass("d-none");
							$("#ddEditarEvento").removeClass("d-none");
						} else {
							$("#btnGroupAcciones").addClass("d-none");
						}
					}
				}

				const btnFlotante = `<button type="button" class="fas btnFlotante fa-file" id="btnMenuFlotante"></button>`;
				const modalDetalle = `<div
					id="modalDetalle"
					class="modal fade"
					tabindex="-1"
					role="dialog"
					aria-labelledby="modalDetalleLabel"
					aria-hidden="true"
				>
					<div class="modal-dialog" role="document">
						<div class="modal-content">
							<div class="modal-header headerWebClub">
								<h5 class="modal-title">
									<i class="fa fa-file"></i>
									Detalle Evento
								</h5>
								<button
									type="button"
									class="close"
									data-dismiss="modal"
									aria-label="Close"
									style="color: #fff; opacity: 1"
								>
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div class="modal-body">
								${htmlDetalle}
							</div>
							<div class="modal-footer p-2">
								<button
									type="button"
									class="btn btn-secondary"
									id="cancelarModal"
									data-dismiss="modal"
								>
									<i class="fas fa-times"></i> Cerrar
								</button>
							</div>
						</div>
					</div>
				</div>
				`;

				$("body").append(btnFlotante);
				$("body").append(modalDetalle);

				$(document).on("click", "#btnMenuFlotante", function () {
					$("#modalDetalle").modal("show");
				});

				$(document).trigger("init.detalleComponent");
			},
		});
	}

	if (nuevaReserva.disponibilidad) {
		$(
			".nav-link[data-href=Disponibilidad], .nav-link[data-href=DatosBasicos]"
		).each(function () {
			$(this).removeClass("disabled").parent().attr("disabled", false);
		});
	}
	if (nuevaReserva.datosBasicos) {
		$(
			".nav-link[data-href=DatosBasicos], .nav-link[data-href=Complementos]"
		).each(function () {
			$(this).removeClass("disabled").parent().attr("disabled", false);
		});

		if (!nuevaReserva.datosBasicos.manejalista) {
			$(".nav-link[data-href=Invitados]")
				.addClass("disabled")
				.parent()
				.attr("disabled", true);
		}
	}
	if (nuevaReserva.complementos) {
		$(".nav-link[data-href=Complementos]")
			.removeClass("disabled")
			.parent()
			.attr("disabled", false);

		if (nuevaReserva.datosBasicos.manejalista) {
			$(".nav-link[data-href=Invitados]")
				.removeClass("disabled")
				.parent()
				.attr("disabled", false);
		} else {
			$(".nav-link[data-href=Cotizacion]")
				.removeClass("disabled")
				.parent()
				.attr("disabled", false);
		}
	}
	if (nuevaReserva.invitados) {
		if (nuevaReserva.datosBasicos.manejalista) {
			$(".nav-link[data-href=Invitados]")
				.removeClass("disabled")
				.parent()
				.attr("disabled", false);
		}
		$(".nav-link[data-href=Cotizacion]")
			.removeClass("disabled")
			.parent()
			.attr("disabled", false);
	}
	if (nuevaReserva.cotizacion) {
		$(".nav-link[data-href=Cotizacion]")
			.removeClass("disabled")
			.parent()
			.attr("disabled", false);

		setTimeout(() => {
			if (typeof nuevaReserva.cotizacion.edicion === "undefined") {
				// Disponibilidad
				$(document).off("click", ".lugar-component:not(.thumbnail)");
				$("#lugaresComponent div:eq(0)")
					.find(`[data-lugarid] .card .lugar-card-container`)
					.off("click")
					.each(function () {
						$(this).find(".lugar-nombre").remove();
					});
				$("#btnFiltrarDisponibilidad").closest("div").addClass("d-none");

				// Datos básicos
				$(document).off("click", ".card-tipomontaje");
				$("input[type=text], input[type=email]").each(function () {
					$(this).attr("readonly", true);
				});
				$(
					"input[type=checkbox], select:not(#selectVersion), #btnReiniciar, #btnFiltrarDisponibilidad"
				).each(function () {
					$(this).prop("disabled", true);
				});

				// Complementos
				$(".btnTabla, .btnSeleccionarMenu").each(function () {
					$(this).addClass("invisible");
				});
				$("[id=agregarProducto]").addClass("d-none");

				// Invitados
				$("[id=frmExcel]").addClass("d-none");

				$("[id=divContinuar], [id=btnSiguiente]").addClass("d-none");
				$("#btnGroupAcciones").removeClass("d-none");
			} else {
				$("#btnGroupAcciones").closest(".btn-group").addClass("d-none");
				$("#selectVersion").attr("disabled", true);
				$("#btnCancelarEdi").removeClass("d-none");
			}
		}, 1000);
	}
});
