const rutaGeneral = base_url() + "Administrativos/Eventos/ListaEventos/";
const dataFiltro = {};
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
		},
		columns: [
			{
				data: "EventoId",
				className: "text-center",
				render: function (data) {
					return `
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
					</a>`;
				},
			},
			{ data: "Evento" },
			{ data: "Version", visible: false },
			{ data: "Nombre" },
			{ data: "TipoEvento" },
			{ data: "Tercero" },
			{ data: "Estado" },
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
		],
		createdRow: function (row, data, dataIndex) {
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
											select: [
												"EventoId",
												"Version",
												`CASE Estado
													WHEN 'BO' THEN 'Borrador'

													WHEN 'CT' THEN 'Cotizado'
													WHEN 'VR' THEN 'Versionado'

													WHEN 'CC' THEN 'Confirmado Cliente'
													WHEN 'RE' THEN 'Rechazado Cliente'

													WHEN 'NU' THEN 'Anulado'
													WHEN 'CO' THEN 'Confirmado'

													WHEN 'CN' THEN 'Cotizar Nuevamente'

													WHEN 'EX' THEN 'Expirado'
													WHEN 'VE' THEN 'Vencido'
													WHEN 'FI' THEN 'Finalizado'
													WHEN 'AC' THEN 'Activo'
											END AS Estado`,
												"FechaSolici",
											],
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
											{ data: 2 },
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

			if (data.EstadoE === "CT") {
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
			location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad`;
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
