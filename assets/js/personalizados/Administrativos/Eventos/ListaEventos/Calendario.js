let searchParams,
	ajaxCalendario = false;
const searchString = window.location.search;
var calendar;

document.addEventListener("DOMContentLoaded", function () {
	var calendarEl = document.getElementById("calendar");
	let right = "dayGridMonth,timeGridWeek,timeGridDay,listWeek";
	let initialView = "dayGridMonth";

	$("#filtrosCalendario").trigger("reset");

	calendar = new FullCalendar.Calendar(calendarEl, {
		timeFormat: "HH:mm",
		views: {
			week: {
				slotLabelInterval: { hours: 1 },
				slotLabelFormat: {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				},
			},
			day: {
				slotLabelInterval: { hours: 1 },
				slotLabelFormat: {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				},
			},
		},
		initialView,
		themeSystem: "bootstrap",
		locale: "es",
		// businessHours: true,
		dayMaxEvents: true,
		editable: true,
		selectable: true,
		heigth: "100%",
		expandRows: true,
		headerToolbar: {
			left: "prev,next today",
			center: "title",
			right,
		},
		events: function (info, successCallback, failureCallback) {
			const apiUrl = `${base_url()}Administrativos/Eventos/ReservarEvento/calendarioData`;
			const estados = $("#estados").val();
			const lugares = [];
			$(".custom-control-input:checked").each(function () {
				lugares.push($(this).attr("id").split("-")[1]);
			});

			const data = {
				start: info.startStr,
				end: info.endStr,
				estados: JSON.stringify(estados),
				lugares: JSON.stringify(lugares),
			};

			$.ajax({
				url: apiUrl,
				data,
				success: function (response) {
					successCallback(JSON.parse(response));
				},
				error: function () {
					failureCallback();
				},
			});
		},
		datesRender: function (info) {
			calendar.refetchEvents();
		},
		eventDidMount: function (info) {
			if ($(info.el).is(":not(.fc-daygrid-dot-event)")) {
				$(info.el).find(".fc-event-title")
					.append(`<br><b data-eventoid="${info.event.id}">
						${info.event.extendedProps.description}
					</b>`);
			}

			descTooltip(info.event, info.el);
		},
		eventClick: function (info) {
			location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad/${
				info.event.groupId
			}`;
		},
		select: function (arg) {
			const hoy = new Date();
			hoy.setHours(0, 0, 0, 0);

			if (arg.start.getTime() >= hoy.getTime()) {
				const fechaIni = `${arg.start.getFullYear()}-${
					arg.start.getMonth() + 1
				}-${arg.start.getDate()}`;
				const fechaFin = `${arg.end.getFullYear()}-${arg.end.getMonth() + 1}-${
					arg.end.getDate() - 1
				}`;

				const data = {
					fechaIni,
					fechaFin,
				};

				sessionStorage.removeItem("newRESDisponibilidad");
				sessionStorage.removeItem("newRESDatosBasicos");
				sessionStorage.removeItem("newRESComplementos");
				sessionStorage.removeItem("newRESInvitados");
				sessionStorage.removeItem("newRESCotizacion");

				setTimeout(() => {
					var parsedUrl = new URL(
						`${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad`
					);

					Object.keys(data).forEach(function (key) {
						parsedUrl.searchParams.append(key, data[key]);
					});

					const url = parsedUrl.toString();

					location.href = url;
				}, 10);
			}
		},
	});
	calendar.render();

	// Procedimientos antes de event listeners

	// Event listeners

	$(document)
		.on("change", ".checkLugar", function () {
			refetchEvents();
		})
		.on("change", "#estados", function () {
			refetchEvents();
		})
		.on("change", "[name=sede]", function () {
			const sede = $("[name=sede]:checked").attr("id").split("-")[1];

			ajaxCalendario = false;

			$(".checkLugar").each(function () {
				$(this).prop("checked", false);
				if ($(this).attr("data-sede") != sede) {
					$(this).closest(".custom-checkbox").addClass("d-none");
				} else {
					$(this).closest(".custom-checkbox").removeClass("d-none");
				}
			});

			$(".divSede").each(function () {
				const lugares = $(this).find(".custom-checkbox").length;
				const lugaresOcultos = $(this).find(".custom-checkbox.d-none").length;
				if (lugares === lugaresOcultos) {
					$(this).find("label.font-weight-bold").addClass("d-none");
				} else {
					$(this).find("label.font-weight-bold").removeClass("d-none");
				}
			});

			ajaxCalendario = true;

			refetchEvents();
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

	// Funciones / Métodos

	function descTooltip(event, element) {
		let estado = "";
		switch (event.extendedProps.Estado) {
			case "BO":
				// Guardado inicial
				estado = "Borrador";
				break;
			case "CT":
				// Cotización enviada
				estado = "Cotizado";
				break;
			case "VR":
				estado = "Versionado";
				break;
			case "CC":
				// Cotización confirmada
				estado = "Aceptado Cliente";
				break;
			case "RE":
				estado = "Rechazado Cliente";
				break;
			case "NU":
				estado = "Anulado";
				break;
			case "CO":
				estado = "Confirmado";
				break;
			case "CN":
				estado = "Cotizar Nuevamente";
				break;
			case "EX":
				// Borrador que pasó el tiempo límite
				estado = "Expirado";
				break;
			case "VE":
				// Cotización que pasó el tiempo límite
				estado = "Vencido";
				break;
			case "FI":
				// Ya se celebró
				estado = "Finalizado";
				break;
			case "AC":
				// Está Maluma en Los Mangos
				estado = "Activo";
				break;
			case "FA":
				// Actualmente lo estan facturando 
				estado = "Facturación";
				break;
			default:
				estado = "";
				break;
		}
		let FORMAT = "DD/MM/YYYY";
		if (!event.allDay) {
			FORMAT += " h:mm A";
		}
		let inicio = moment(event.start).format(FORMAT);
		let fin = event.end === null ? event._instance.range.end : event.end;

		if (fin.getHours() === 0 && fin.getMinutes() === 0) {
			fin = moment(event.end.setSeconds(event.end.getSeconds() - 1)).format(
				FORMAT
			);
		} else {
			fin = moment(event.end).format(FORMAT);
		}

		let title = `${
			event.extendedProps.tercero ? `${event.extendedProps.tercero}<br/>` : ""
		}
				${
					event.extendedProps.AccionId && event.extendedProps.AccionId !== null
						? `<b>Acción:</b> ${event.extendedProps.AccionId}<br/>`
						: ""
				}
				<b>Evento:</b> ${event.extendedProps.Evento} | ${event.title}
				<br/><b>Tipo:</b>  ${event.extendedProps.description}
				<br/><b>Inicio:</b> ${inicio}
				<br/><b>Fin:</b> ${fin}
				${event.extendedProps.Estado ? `<br/><b>Estado:</b> ${estado}` : ""}
				<br/><b class="L-${event.extendedProps.LugarId}">${
			event.extendedProps.Lugar
		}</b>
			`;

		$(element).removeData("tooltip").tooltip("dispose");
		$(".tooltip").remove();

		if ($(element).is(".fc-event")) {
			$(element)
				.closest(".fc-event")
				.addClass(`EL-${event.extendedProps.LugarId}`);
		} else {
			$(element).addClass(`EL-${event.extendedProps.LugarId}`);
		}

		$(element).tooltip({
			html: true,
			title,
		});
	}

	function refetchEvents() {
		if (ajaxCalendario) {
			calendar.refetchEvents();
		}
	}

	// Procedimientos

	$(".chosen-select").chosen({ width: "100%" }).chosen("close");
	$("[name=sede]:eq(0)").prop("checked", true).change();
});

function fechas(fecha) {
	const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
	const start = primerDia.toISOString().split("T")[0];

	const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
	const end = ultimoDia.toISOString().split("T")[0];

	return { start, end };
}
