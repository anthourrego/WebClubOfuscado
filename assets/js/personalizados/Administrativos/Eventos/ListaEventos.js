const rutaGeneral = base_url() + "Administrativos/Eventos/ListaEventos/";
const dataFiltro = {};
const estados = {
	BO: "Borrador",
	CT: "Cotizado",
	VR: "Versionado",
	CC: "Aceptado Cliente",
	RE: "Rechazado Cliente",
	NU: "Anulado",
	CO: "Confirmado",
	CN: "Cotizar Nuevamente",
	EX: "Expirado",
	VE: "Vencido",
	FI: "Finalizado",
	AC: "Activo",
	FA: "Facturación",
};
let tblEventos,
	isTabActive = true;

$(function () {
	RastreoIngresoModulo("Lista Eventos");

	tblEventos = $("#tlbEventos").DataTable({
		dom: domlBftrip,
		serverSide: true,
		pageLength: 10,
		scrollX: true,
		order: [[0, "DESC"]],
		ajax: {
			url: rutaGeneral + "DTEventos",
			type: "POST",
			data: function (d) {
				return $.extend(d, { dataFiltro });
			},
			global: false,
		},
		columns: [
			{
				data: "EventoId",
				className: "text-center",
				render: function (data) {
					btnVisualizar='';
					btnGestor='';
					if (permisoGestorActividades2) {
						btnVisualizar = `
						<a
							href="${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad/${data}"
							class="btn btn-primary btn-xs btnVisualizar"
							title="Visualizar evento"
						>
							<i class="far fa-eye"></i>
						</a>
						<a
							href="${base_url()}Evento/Cotizacion/${$NIT}/{terceroid}/${data}"
							class="btn btn-warning btn-xs btnConfirmar d-none"
							title="URL Confirmación evento"
							target="_blank"
						>
							<i class="fas fa-clipboard-check"></i>
						</a>
						`;
					}
					
					if (permisoGestorActividades) {
						btnGestor = `
						<a
							class="btn btn-info btn-xs btnPlaneador d-none"
							title="Gestor de actividades"
						>
							<i class="fas fa-thumbtack" style="color: #ffffff;"></i>
						</a>
						`;
					}
					return btnVisualizar + btnGestor;

				},
			},
			{ data: "Evento" },
			{ data: "Version", visible: false },
			{ data: "Nombre" },
			{ data: "TipoEvento" },
			{ data: "Tercero" },
			{
				data: "Estado",
				render: function (Estado) {
					return estados[Estado];
				},
			},
			{
				data: "Inicio",
				render: function (data) {
					return moment(data, "YYYY-MM-DD HH:mm:ss").format(
						"YYYY-MM-DD hh:mm:ss A"
					);
				},
			},
			{
				data: "Fin",
				render: function (data) {
					return moment(data, "YYYY-MM-DD HH:mm:ss").format(
						"YYYY-MM-DD hh:mm:ss A"
					);
				},
			},
			{ data: "Personas" },
			{
				data: "FechaSolici",
				render: function (data, type, row, meta) {
					return moment(data, "YYYY-MM-DD HH:mm:ss").format(
						"YYYY-MM-DD hh:mm:ss A"
					);
				},
			},
			{ data: "MedioReserva" },
			{ data: "Vendedor" },
			{
				data: "Porcentaje",
				className: "text-center",
				render: function (data) {
					data = data == null ? 0 : data;
					return `${data} %`;
				},
			},
		],
		createdRow: function (row, data, dataIndex) {
			// Se agregan colores para los porcentajes
			Porcentaje = $(row).find("td:eq(12)");
			if (
				parseInt(Porcentaje[0].textContent) >= 0 &&
				parseInt(Porcentaje[0].textContent) <= 33
			) {
				Porcentaje[0].style.backgroundColor = "#F5A9BC";
			} else if (
				parseInt(Porcentaje[0].textContent) > 33 &&
				parseInt(Porcentaje[0].textContent) < 66
			) {
				Porcentaje[0].style.backgroundColor = "#F2DDB4";
			} else if (parseInt(Porcentaje[0].textContent) >= 66) {
				Porcentaje[0].style.backgroundColor = "#B8E994";
			}

			//Se agrega validacion para que le cargue los colores correspondiente a cada estado y se vea en la vista.
			EstadoCO = $(row).find("td:eq(5)");
			switch (data.Estado) {
				case "CT":
					// 'Cotizado'
					EstadoCO[0].style.backgroundColor = "#F5A9BC";
					EstadoCO[0].title =
						"Evento cotizado, a la espera de una respuesta del cliente";
					break;
				case "VR":
					// 'Versionado'
					EstadoCO[0].style.backgroundColor = "#A9DFBF";
					EstadoCO[0].title =
						"Versión antigua de un evento(No debería mostrarse en el calendario)";
					break;
				case "CC":
					// 'Aceptado Cliente'
					EstadoCO[0].style.backgroundColor = "#AEDFF7";
					EstadoCO[0].title =
						"El cliente confirma la cotizacion (Se puede confirmar) ";
					break;
				case "RE":
					// 'Rechazado Cliente'
					EstadoCO[0].style.backgroundColor = "#F5CBA7";
					EstadoCO[0].title =
						"El cliente rechaza la cotización (Se debe crear una nueva versión de la cotización y esperar que el cliente la confirme)";
					break;
				case "NU":
					// 'Anulado'
					EstadoCO[0].style.backgroundColor = "#D2B4DE";
					EstadoCO[0].title = "Cotización anulada, finaliza el proceso";
					break;
				case "CO":
					// 'Confirmado'
					EstadoCO[0].style.backgroundColor = "#B8E994";
					EstadoCO[0].title =
						"Cotización confirmada por el asesor comercial después de tener el aval del cliente";
					break;
				case "CN":
					// 'Cotizar Nuevamente'
					EstadoCO[0].style.backgroundColor = "#87CEEB";
					EstadoCO[0].title =
						"Se requiere cotizar nuevamente el evento ya que un evento confirmado ocupó el lugar para la fecha cotizada";
					break;
				case "EX":
					// 'Expirado'
					EstadoCO[0].style.backgroundColor = "#F8C9C5";
					EstadoCO[0].title = "Cotización que no pasó a evento";
					break;
				case "VE":
					// 'Vencido'
					EstadoCO[0].style.backgroundColor = "#B3B6B7";
					EstadoCO[0].title = "Evento confirmado que pasó el tiempo límite";
					break;
				case "FI":
					// 'Finalizado'
					EstadoCO[0].style.backgroundColor = "#F9E79F";
					EstadoCO[0].title = "Evento finalizado, ya se celebró";
					break;
				case "AC":
					// 'Activo'
					EstadoCO[0].style.backgroundColor = "#C39BD3";
					EstadoCO[0].title = "Evento activo y en proceso";
					break;
				case "FA":
					// 'Facturacion'
					EstadoCO[0].style.backgroundColor = "#9fc063";
					EstadoCO[0].title = "Evento en proceso de ser facturado";
					break;
			}

			$(row).on("click", ".btnPlaneador", function (e) {
				mostrarModalPlaneadorCuerpos(data.EventoId);
			});
			$(row).on("click", ".btnVisualizar", function (e) {
				e.preventDefault();
				const { Evento } = data;
				if (data.Version > 1) {
					alertify.customConfirm(
						"Evento versionado",
						"Este evento cuenta con versiones antiguas, ¿Desea ver la última versión o seleccionar una versión pasada?",
						function ({ index }) {
							if (index === 0) {
								location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad/${
									data.EventoId
								}`;
							} else if (index === 1) {
								dtAlertify({
									titulo: "Versiones",
									campos: ["EventoId", "Versión", "Estado", "Fecha"],
									dtConfig: {
										data: {
											select: ["EventoId", "Version", "Estado", "FechaSolici"],
											table: ["Evento", [], [["Evento", Evento]]],
											column_order: [
												"EventoId",
												"Version",
												"Estado",
												"FechaSolici",
											],
											orden: { EventoId: "DESC" },
											column_search: ["Version"],
											columnas: [
												"EventoId",
												"Version",
												"Estado",
												"FechaSolici",
											],
										},
										orderable: true,
										columns: [
											{
												data: 0,
												visible: false,
											},
											{ data: 1 },
											{
												data: 2,
												render: function (Estado) {
													return estados[Estado];
												},
											},
											{
												data: 3,
												render: function (FechaSolici) {
													return moment(
														FechaSolici,
														"YYYY-MM-DD HH:mm:ss"
													).format("YYYY-MM-DD hh:mm:ss A");
												},
											},
										],
									},
								}).then((res) => {
									location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad/${
										res[0]
									}`;
								});
							}
						}
					);
				} else {
					location.href = $(this).attr("href");
				}
			});

			if (data.Estado === "CO") {
				$(row).find(".btnPlaneador").removeClass("d-none");
			} else if (data.Estado === "CT" && permisoGestorActividades2) {
				$(row)
					.find(".btnConfirmar")
					.removeClass("d-none")
					.attr(
						"href",
						$(row)
							.find(".btnConfirmar")
							.attr("href")
							.replace("{terceroid}", data.TerceroId)
					);
			}
		},
	});

	$(document).on("click", "#btnCrearEvento", function (e) {
		e.preventDefault();

		sessionStorage.removeItem("newRESDisponibilidad");
		sessionStorage.removeItem("newRESDatosBasicos");
		sessionStorage.removeItem("newRESComplementos");
		sessionStorage.removeItem("newRESInvitados");
		sessionStorage.removeItem("newRESCotizacion");

		setTimeout(() => {
			location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad?eventoid=-1`;
		}, 0);
	});

	$(window)
		.on("focus", function () {
			if (!isTabActive) {
				tblEventos.ajax.reload();
				isTabActive = true;
			}
		})
		.on("blur", function () {
			isTabActive = false;
		});
});

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
