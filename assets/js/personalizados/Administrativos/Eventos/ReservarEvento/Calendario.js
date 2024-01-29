let eventoCreado = false,
	nombreEvento = "",
	tipoEvento = null,
	searchParams;
const searchString = window.location.search,
	tmpData = {},
	evento = {};
var calendar;

document.addEventListener("DOMContentLoaded", function () {
	if (searchString === "") {
		window.location.href =
			base_url() + "Administrativos/Eventos/ReservarEvento/Disponibilidad";
	} else {
		searchParams = new URLSearchParams(searchString);
		if (
			searchParams.has("fechaini") &&
			searchParams.has("fechafin") &&
			searchParams.has("lugares") &&
			searchParams.has("personas")
		) {
			tmpData.start = searchParams.get("fechaini");
			tmpData.end = searchParams.get("fechafin");
			tmpData.lugarid = searchParams.get("lugares").split(",")[0];
			tmpData.personas = parseInt(searchParams.get("personas"));
			tmpData.regresar = JSON.parse(searchParams.get("regresar"));
		} else {
			window.location.href =
				base_url() + "Administrativos/Eventos/ReservarEvento/Disponibilidad";
		}
	}

	var calendarEl = document.getElementById("calendar");
	let right = "dayGridMonth,timeGridWeek,timeGridDay,listWeek";
	let initialView = "dayGridMonth";
	if (tmpData.start === tmpData.end) {
		right = "timeGridWeek,timeGridDay,listWeek";
		initialView = "timeGridDay";
	}
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
		// dayMaxEvents: true,
		editable: true,
		selectable: false,
		heigth: "100%",
		expandRows: true,
		headerToolbar: {
			left: "prev,next today",
			center: "title",
			right,
		},
		events: `${base_url()}Administrativos/Eventos/ReservarEvento/calendarioData/${
			tmpData.lugarid
		}/`,
		eventDidMount: function (info) {
			if ($(info.el).is(":not(.fc-daygrid-dot-event)")) {
				$(info.el).find(".fc-event-title")
					.append(`<br><b data-eventoid="${info.event.id}">
						${info.event.extendedProps.description}
					</b>`);
			}

			descTooltip(info.event, info.el);
		},
		eventResizeStart: function (info) {
			$(info.el).removeData("tooltip").tooltip("dispose");
			$(".tooltip").remove();
		},
		eventResizeStop: function (info) {
			$(info.el).removeData("tooltip").tooltip("dispose");
			$(".tooltip").remove();
		},
		eventResize: function (info) {
			descTooltip(info.event, info.el);
		},
		eventDrop: function (info) {
			descTooltip(info.event, info.el);
		},
		eventChange: function (info) {
			if (IsDateHasEvent(info.event.start, info.event.end)) {
				alertify.alert(
					"Advertencia",
					"Las fechas seleccionadas están ocupadas por otro evento.\nPor favor, elige otras fechas"
				);

				calendar.getEventById(evento.id).remove();
				calendar.addEvent(evento);
			} else {
				evento.start = info.event.start;
				evento.end = info.event.end;

				const start = moment(info.event.start).format(),
					end = moment(info.event.end).format();

				const changedEvent = $(
					`.fc-event[data-start="${start}"][data-end="${end}"]`
				);
			}
			descTooltip(info.event, info.el);
		},
		select: function (arg) {
			$(".tooltip-guia").remove();
			if (IsDateHasEvent(arg.start, arg.end)) {
				alertify.alert(
					"Advertencia",
					"Las fechas seleccionadas están ocupadas por otro evento.\nPor favor, elige otras fechas"
				);
			} else {
				evento.id = -1;
				evento.title = nombreEvento;
				evento.description = $("#tipoEvento option:selected").text().trim();
				evento.start = arg.start;
				evento.end = arg.end;
				evento.allDay = arg.allDay;

				calendar.addEvent(evento);
				eventoCreado = true;
				$("#btnSiguiente").prop("disabled", false);
				calendar.setOption("selectable", false);
			}
			calendar.unselect();

			guia();
		},
		validRange: function (nowDate) {
			const validRange = {
				start: tmpData.start,
			};
			if (tmpData.end) {
				validRange.end = tmpData.end;
			}

			return validRange;
		},
	});
	calendar.render();

	// Procedimientos antes de event listeners

	// 1. Obtener datos del session storage
	if (!nuevaReserva.disponibilidad) {
		$("#frmEvento").trigger("reset");
		setTimeout(() => {
			guia();
		}, 100);
	} else {
		$("#nombre").val(nuevaReserva.disponibilidad.nombre);
		nombreEvento = nuevaReserva.disponibilidad.nombre;
		$("#tipoEvento").val(nuevaReserva.disponibilidad.tipoevento);
		tipoEvento = nuevaReserva.disponibilidad.tipoevento;

		nuevaReserva.disponibilidad.lugares.forEach((lugar) => {
			let FORMAT = "DD/MM/YYYY";
			if (!lugar.allDay) {
				FORMAT += " h:mm A";
			}
			const inicio = moment(lugar.fechaini).format(FORMAT);
			const fin = moment(lugar.fechafin).format(FORMAT);
			const title = `
				<b>Evento:</b> ${nuevaReserva.disponibilidad.nombre}
				<br/><b>Tipo:</b>  ${nuevaReserva.disponibilidad.description}
				<br/><b>Inicio:</b> ${inicio}
				<br/><b>Fin:</b> ${fin}
			`;
			$(`[data-lugarid='${lugar.lugarid}'`)
				.tooltip({
					html: true,
					title,
					placement: "right",
				})
				.on("click", function () {
					const lugarid = $(this).attr("data-lugarid");
					alertify.confirm(
						"Descartar lugar",
						"¿Desea no incluir el lugar seleccionado en la cotización del evento actual?",
						function () {
							let index = nuevaReserva.disponibilidad.lugares.findIndex(
								(lugar) => lugar.lugarid === lugarid
							);
							if (index !== -1) {
								nuevaReserva.disponibilidad.lugares.splice(index, 1);
							}
							const disponibilidadJSON = JSON.stringify(
								nuevaReserva.disponibilidad
							);
							sessionStorage.setItem(
								"newRESDisponibilidad",
								disponibilidadJSON
							);

							actualizarElementosFijos();

							const searchParamsLugares = searchParams
								.get("lugares")
								.split(",");
							const searchParamsIndex = searchParamsLugares.indexOf(lugarid);
							if (searchParamsIndex !== -1) {
								searchParamsLugares.splice(searchParamsIndex, 1);
							}
							const nuevoValor = searchParamsLugares.join(",");
							searchParams.set("lugares", nuevoValor);
							const newSearchParams = searchParams.toString();
							location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Calendario?${newSearchParams}`;
						},
						function () {}
					);
				})
				.find(".card .lugar-card-container div").append(`<div
					class="d-flex justify-content-center align-items-center text-center"
				>
					<p class="lugar-nombre text-danger mb-0">
						<i class="fa fa-trash"></i>
					</p>
				</div>`);
		});

		guia();
	}

	// Event listeners

	$("#nombre").change(function () {
		nombreEvento = $(this).val();
		guia();

		if (eventoCreado) {
			calendar.getEventById(-1).setProp("title", nombreEvento);
			descTooltip(
				calendar.getEventById(-1),
				$('[data-eventoid="-1"]').closest("a")
			);
		}
	});

	$("#tipoEvento").focusout(function () {
		tipoEvento = $("#tipoEvento option:selected").text().trim();
		guia();

		if (eventoCreado) {
			calendar.getEventById(-1).setExtendedProp("description", tipoEvento);
			$('[data-eventoid="-1"]').each(function () {
				$(this).text(tipoEvento);
			});
		}
	});

	$("#tipoEvento").change(function () {
		$("#calendar").closest(".d-none").removeClass("d-none");
		if (!eventoCreado) {
			calendar.setOption("selectable", true);
		} else {
			tipoEvento = $("#tipoEvento option:selected").text().trim();
			calendar.getEventById(-1).setExtendedProp("description", tipoEvento);
			$('[data-eventoid="-1"]').text(tipoEvento);
			descTooltip(
				calendar.getEventById(-1),
				$('[data-eventoid="-1"]').closest("a")
			);
		}
	});

	$("#frmEvento").submit(function (e) {
		e.preventDefault();

		// 1. Obtener datos del session storage
		if (!nuevaReserva.disponibilidad) {
			nuevaReserva.disponibilidad = {};

			nuevaReserva.disponibilidad.lugares = [];
		}

		nuevaReserva.disponibilidad.nombre = $("#nombre").val();
		nuevaReserva.disponibilidad.tipoevento = $("#tipoEvento").val();
		nuevaReserva.disponibilidad.personas = tmpData.personas;
		nuevaReserva.disponibilidad.description = $("#tipoEvento")
			.find("option:selected")
			.text()
			.trim();
		nuevaReserva.disponibilidad.agrupar = tmpData.regresar;

		// 2. Si no hay nada, creo un objeto con personas, nombre, tipo, array con lugar
		const FORMAT = "YYYY-MM-DD HH:mm:ss";

		const lugarReserva = {
			lugarid: tmpData.lugarid,
			fechaini: moment(evento.start).format(FORMAT),
			fechafin: moment(evento.end).format(FORMAT),
			allDay: evento.allDay,
		};

		if (evento.end.getHours() === 0 && evento.end.getMinutes() === 0) {
			lugarReserva.fechafin = moment(
				evento.end.setSeconds(evento.end.getSeconds() - 1)
			).format(FORMAT);
		}

		// 3. Si ya hay, actualizo el objeto
		nuevaReserva.disponibilidad.lugares.push(lugarReserva);

		// 3.1 Recorre los lugares para actualizar los campos de fechaIni y fechaFin
		let minFechaIni = new Date(9999, 0, 1);
		let maxFechaFin = new Date(1000, 11, 31);
		nuevaReserva.disponibilidad.lugares.forEach((reserva) => {
			if (new Date(reserva.fechaini) < minFechaIni) {
				minFechaIni = new Date(reserva.fechaini);
			}
			if (new Date(reserva.fechafin) > maxFechaFin) {
				maxFechaFin = new Date(reserva.fechafin);
			}
		});

		nuevaReserva.disponibilidad.fechaini =
			moment(minFechaIni).format("YYYY-MM-DD");
		nuevaReserva.disponibilidad.fechafin =
			moment(maxFechaFin).format("YYYY-MM-DD");

		// 4. Guarda en el session storage
		const disponibilidadJSON = JSON.stringify(nuevaReserva.disponibilidad);
		sessionStorage.setItem("newRESDisponibilidad", disponibilidadJSON);

		// 4.1 Actualiza los elementos fijos
		actualizarElementosFijos();

		// 4. Me devuelve a la pestaña anterior
		if (tmpData.regresar) {
			location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad`;
		} else {
			alertify
				.confirm(
					"Continuar",
					"¿Desea continuar con la cotización o agregar más lugares a la cotización del evento?",
					function () {
						location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/DatosBasicos`;
					},
					function () {
						location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad`;
					}
				)
				.set("labels", { ok: "Continuar", cancel: "Agregar lugar" });
		}
	});

	$("#btnRegresar").click(function (e) {
		e.preventDefault();
		alertify.confirm(
			"Advertencia",
			"¿Está seguro de que desea regresar?",
			function () {
				location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad`;
			},
			function () {}
		);
	});

	// Funciones / Métodos

	// Valida entre el rango de fechas que no se cruce con un evento confirmado
	function IsDateHasEvent(date1, date2) {
		const allEvents = calendar.getEvents();

		days = getDates(date1, date2);
		let cruza = false;

		days.forEach(function (day) {
			const events = $.grep(allEvents, function (v) {
				let fechaFin = v.end;
				if (fechaFin.getHours() === 0) {
					fechaFin.setDate(fechaFin.getDate() - 1);
					fechaFin.setHours(23);
				}
				if (day >= v.start && day <= fechaFin) {
					if (
						v.extendedProps.Estado === "CO" ||
						v.extendedProps.Estado === "AC" ||
						v.extendedProps.Estado === "FI"
					) {
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			});
			if (events.length) {
				cruza = true;
			}
		});

		return cruza;
	}

	// Devuelve array con fechas en un rango
	function getDates(fechaInicial, fechaFinal) {
		const fechas = [];
		const fechaActual = new Date(fechaInicial);
		const fechaFin = new Date(fechaFinal);

		while (fechaActual < fechaFin) {
			fechas.push(new Date(fechaActual));
			fechaActual.setDate(fechaActual.getDate() + 1);
		}

		return fechas;
	}

	function sameDay(date1, date2) {
		return (
			date1.getDate() === date2.getDate() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getFullYear() === date2.getFullYear()
		);
	}

	// Tooltips de ayuda al usuario
	function guia() {
		if ($(".tooltip-guia")) {
			$(".tooltip-guia").remove();
		}
		if (nombreEvento === "") {
			$("#frmEvento")
				.find("input:eq(0)")
				.focus()
				.tooltip({
					title: "Escribe el nombre del evento",
					placement: "right",
					trigger: "manual",
				})
				.tooltip("show");
			$(".tooltip:eq(0)").addClass("tooltip-guia");
		} else if (tipoEvento === null) {
			$("#tipoEvento")
				.focus()
				.tooltip({
					title: "Elige el tipo del evento",
					placement: "right",
					trigger: "manual",
				})
				.tooltip("show");
			$(".tooltip:eq(0)").addClass("tooltip-guia");
		} else if (!eventoCreado) {
			$("#calendar").closest(".d-none").removeClass("d-none");
			$("#calendar")
				.tooltip({
					title:
						"Deja el click presionado y arrastra para seleccionar el rango de fechas en que ocurre el evento",
					placement: "top",
					trigger: "manual",
				})
				.tooltip("show");
			$(".tooltip:eq(0)").addClass("tooltip-guia");

			calendar.setOption("selectable", true);
		} else {
			$("#btnSiguiente")
				.tooltip({
					title: "De click acá para continuar el proceso",
					placement: "top",
					trigger: "manual",
				})
				.tooltip("show");
			$(".tooltip:eq(0)").addClass("tooltip-guia");
		}
	}

	function actualizarElementosFijos() {
		// Actualizo los elementos fijos, eliminando aquellos de lugares que ahora no hay
		if (nuevaReserva.complementos !== null) {
			const lugares = nuevaReserva.disponibilidad.lugares.map(
				(lugar) => lugar.lugarid
			);

			nuevaReserva.complementos.elementosFijos =
				nuevaReserva.complementos.elementosFijos.filter((producto) =>
					lugares.includes(producto.menu)
				);

			const menus = [
				...new Set(
					nuevaReserva.complementos.elementosFijos.map(
						(elemento) => elemento.menu
					)
				),
			];

			const lugaresFaltantes = lugares.filter(
				(lugar) => !menus.includes(lugar)
			);

			$.ajax({
				url: rutaGeneral + "CargarElementosFijos",
				type: "POST",
				async: false,
				data: {
					lugares: JSON.stringify(lugaresFaltantes),
				},
				success: function (respuesta) {
					const res = JSON.parse(respuesta);
					if (res.length) {
						res.forEach((producto) =>
							nuevaReserva.complementos.elementosFijos.push(producto)
						);
						const complementosJSON = JSON.stringify(nuevaReserva.complementos);
						sessionStorage.setItem("newRESComplementos", complementosJSON);
					}
				},
			});
		}
	}

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
				estado = "Confirmado Cliente";
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
			default:
				estado = "";
				break;
		}
		let FORMAT = "DD/MM/YYYY";
		if (!event.allDay) {
			FORMAT += " h:mm A";
		}
		let inicio = moment(event.start).format(FORMAT);
		let fin = event.end;

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
				<b>Evento:</b> ${event.title}
				<br/><b>Tipo:</b>  ${event.extendedProps.description}
				<br/><b>Inicio:</b> ${inicio}
				<br/><b>Fin:</b> ${fin}
				${event.extendedProps.Estado ? `<br/><b>Estado:</b> ${estado}` : ""}
				
			`;

		$(element).removeData("tooltip").tooltip("dispose");
		$(".tooltip").remove();

		$(element).tooltip({
			html: true,
			title,
		});
	}

	// Procedimientos

	if (nuevaReserva.disponibilidad == null) {
		setTimeout(() => {
			$("#calendar").closest(".overflow-auto").addClass("d-none");
		}, 100);
	}
});
