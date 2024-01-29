let rutaGeneralCalendario = 'Administrativos/Eventos/Calendario/';
let valorIncialAnioMes = '';
let configInicial = {
	mesAnio: null
	, capacidadMaxima: null
	, capacidadMinima: null
	, lugaresFiltroC: []
	, tipoLugaresFiltroC: []
};
let eventosNuevosCalendario = [];
let lugarActualCalendario = null;
let calendarInicial = null;
let calendarLugar = null;
let optionFullCalendarLugar = {};


function iniciarCalendario(datos = {}) {

	configInicial = { ...configInicial, ...datos };
	if (!configInicial.mesAnio) {
		configInicial.mesAnio = moment().format("DD-MM-YYYY");
	}
	obtenerInformacionCalendario(configInicial, 'initCalendarioDisponible', 'regresoCalendario');
}

// function iniciarCalendario(datos = {}) {
// 	configInicial = { ...configInicial, ...datos };
// 	if (!configInicial.mesAnio) {
// 		configInicial.mesAnio = moment().format("DD-MM-YYYY");
// 	}
// 	obtenerInformacionCalendario(configInicial, 'initCalendarioDisponible', 'regresoCalendario');
// }

function obtenerInformacionCalendario(data, metodoBack, funcion) {
	$.ajax({
		url: base_url() + rutaGeneralCalendario + metodoBack,
		type: 'POST',
		data: data,
		dataType: "json",
		success: (resp) => {
			if (funcion) this[funcion](resp);
		}
	});
}

function regresoCalendario({ valido, cabecera, tabla, tituloCalendario, mesanio, tipoLugares, filtro }) {
	if (valido) {

		$("#mesanio").datetimepicker({
			minDate: moment().startOf('month')
			, format: 'MM-YYYY'
			, locale: 'es'
		});

		$("#cabeceraCalendario").html(cabecera);
		$(".estructuraCalendario").html(tabla);
		$(".tituloCalendario").html(tituloCalendario);
		$("#mesanio").val(mesanio);
		$('[data-toggle="tooltip"]').tooltip();
		valorIncialAnioMes = mesanio;

		if (!filtro) {
			/* Inicializamos campos para la modal de filtros */
			let estruLugares = '<option selected value="" style="search-choice-close-disabled">Todos</option>';
			$("#lugaresFiltroC").html(estruLugares).chosen({ width: '100%' });

			tipoLugares.forEach(it => {
				estruLugares += `<option value="${it.TipoLugarId}" style="search-choice-close-disabled">${it.Nombre}</option>`
			});
			$("#tipoLugaresFiltroC").html(estruLugares).chosen({ width: '100%' });

			$(".chosen-select").unbind('change').change(function (e) {
				let id = $(this).attr('id');
				let data = configInicial[id];
				let entrada = $(this).val().filter(x => !data.includes(x));
				if ((entrada.length == 1 && entrada[0] == "") || !$(this).val().length) {
					$(this).val([""]);
					configInicial[id] = [];
				} else {
					$(this).val($(this).val().filter(it => it != ''));
					configInicial[id] = $(this).val();
				}
				$(this).trigger('chosen:updated');
				if (id == 'tipoLugaresFiltroC') {
					irPorLosLugares(configInicial[id]);
				}
			});
		}

		$("#modalCalendarioFull").unbind().on('hidden.bs.modal', function () {
			eventosNuevosCalendario = [];
			lugarActualCalendario = null;
			// let mesAnio = moment($("#mesanio").val(), 'DD-MM-YYYY').format('DD-MM-YYYY');
			console.log('configInicial',configInicial);
			iniciarCalendario(configInicial);
			calendarInicial.destroy();
			calendarInicial = null;
		});

		$("#btnAgregarCalendario").unbind().on('click', function () {
			// if (configInicial.vista == 'reserva') {
				// if (!eventosNuevosCalendario.length) {
				// 	return alertify.warning("No se encontraron horarios seleccionados");
				// }
				// let datos = {
				// 	eventoId: configInicial.eventoId
				// 	, reservas: []
				// 	, lugarId: lugarActualCalendario
				// }
				// datos.reservas = eventosNuevosCalendario.map(it => {
				// 	return {
				// 		fin: moment(it.end).format('YYYY-MM-DD HH:mm:ss')
				// 		, inicio: moment(it.start).format('YYYY-MM-DD HH:mm:ss')
				// 	}
				// });
				// obtenerInformacionCalendario(datos, 'guardarEventos', 'regresoGuardarEventos');
			// } else {
				// if (!eventosNuevosCalendario.length) {
				// 	return alertify.warning("No se encontraron horarios seleccionados");
				// }
				let datos = {
					  eventoId : configInicial.eventoId
					, eventos  : []
					, lugarId  : lugarActualCalendario
				}

				console.log('eventosNuevosCalendario',eventosNuevosCalendario);
				datos.eventos = eventosNuevosCalendario.map(it => {
					return {
						   inicio : moment(it.start).format('YYYY-MM-DD HH:mm:ss')
						,  fin    : moment(it.end).format('YYYY-MM-DD HH:mm:ss')
					}
				});
				console.log('datos',datos);
				// $("#modalCalendarioFull").modal('hide');
			// }
		});

		$("#btnFiltrarCalendario").unbind().on('click', function () {
			let data = {
				  mesAnio: $("#mesanio").val()
				, capacidadMinima  : $("#capacidadMinima").val()
				, capacidadMaxima  : $("#capacidadMaxima").val()
				, lugaresFiltroC   : configInicial.lugaresFiltroC
			}
			console.log('datadata',data);
			iniciarCalendario(data);
			$("#modalFiltrosCalendario").modal('hide');
		});

		$("#btnAgregarCalendario").html('<i class="fas fa-check"></i> Aceptar');
		if (configInicial.vista == 'reserva') {
			$("#btnAgregarCalendario").html('<i class="fas fa-check"></i> Agregar');
			bloquearODesbloquearHoy();
		}
	}
}

function regresoGuardarEventos({ valido, msj }) {
	if (valido) {
		alertify.success(msj);
		$("#modalCalendarioFull").modal('hide');
	} else {
		alertify.danger(msj);
	}
}

function otroMesMas(fun) {
	let mesAnio = moment($("#mesanio").val(), 'YYYY-MM-DD')[fun](1, 'month').format('YYYY-MM-DD');

	console.log('mesAnio',mesAnio); 
	iniciarCalendario({ mesAnio });
}

document.getElementById('mesanio').addEventListener('focusin', function (e) {
	valorIncialAnioMes = e.target.value;
});

document.getElementById('mesanio').addEventListener('focusout', function (e) {
	if (valorIncialAnioMes != e.target.value) {
		iniciarCalendario({ mesAnio: e.target.value });
	}
});

function clickDiaCalendario(dia, lugar,fecha = null) {
	console.log('dia',dia);
	// let fecha = moment(AnioMes, 'YYYY-MM-DD').format('YYYY-MM-DD');
	// let fecha = moment(AnioMes, 'YYYY-MM-DD').format('YYYY-MM-DD');
	console.log('fecha',fecha);

	if (configInicial.vista == 'reserva') {
		if (moment(fecha).isSameOrAfter(moment().format('YYYY-MM-DD'))) {
			irInfoDiaValido(fecha, lugar);
		} else {
			alertify.warning("El dia debe ser mayor al actual.");
		}
	} else {
		irInfoDiaValido(fecha, lugar);
	}
}

function irInfoDiaValido(dia, lugar) {
	let datos = {
		idDiaMes: dia,
		lugarId: lugar
	}
	lugarActualCalendario = lugar;
	obtenerInformacionCalendario(datos, 'eventosDia', 'regresoEventosDia');
}

function regresoEventosDia({ valido, diaMes, datos }) {
	if (valido) {
		initFullCalendar(diaMes);
		calendarInicial.addEventSource(datos);
		if (eventosNuevosCalendario.length) {
			let extrasEventos = eventosNuevosCalendario.filter(it => moment(it.start).format('YYYY-MM-DD') == diaMes);
			calendarInicial.addEventSource(extrasEventos);
		}
	}
}

function initFullCalendar(dia) {
	let options = {
		allDaySlot: false,
		height: '100%',
		expandRows: true,
		locale: 'es',
		slotMinTime: '00:00',
		slotMaxTime: '24:00',
		slotDuration: '00:30:00',
		selectOverlap: false, // No deja seleccionar por encima de los demas eventos
		headerToolbar: {
			left: '',
			center: 'title',
			right: 'today prev,next'
		},
		displayEventTime: false,
		initialView: 'timeGrid',
		initialDate: moment(dia).toDate(),
		editable: false,
		selectable: true,
		nowIndicator: true,
		dayMaxEvents: true,
		slotLabelFormat: [{
			hour: 'numeric',
			minute: '2-digit',
			omitZeroMinute: false,
			meridiem: 'short',
			hour12: false
		}],
		events: [],
	}

	// if (configInicial.vista == 'reserva') {
		options = {
			...options
			, eventClick
			, select
			, validRange: {
				start: new Date()
			}
		};
	// }

	let FuCalendar = FullCalendar.Calendar;
	calendarInicial = new FuCalendar(document.getElementById('calendarioFull'), options);
	console.log('calendarInicial',calendarInicial);
	setTimeout(() => {
		calendarInicial.render();
		$("#calendarioFull .fc-prev-button").unbind('click').click(() => {
			clickDiaCalendario(moment(calendarInicial.getDate()).format('DD'), lugarActualCalendario);
		});
		$("#calendarioFull .fc-next-button").unbind('click').click(() => {
			clickDiaCalendario(moment(calendarInicial.getDate()).format('DD'), lugarActualCalendario);
		});
	}, 100);
	$("#modalCalendarioFull").modal('show');
}

function eventClick({ el, event, jsEvent, view }) {
	if (event.id == "") {
		alertify.confirm("Advertencia", "¿Está seguro de remover horario?", function () {
			eventosNuevosCalendario.splice(eventosNuevosCalendario.findIndex(it => it.strInit == event.startStr), 1);
			event.remove();
		}, function () { });
	}
}

function select(ev) {
	eventoSeleccionado = ev;
	const { start, end, startStr } = ev;
	if (moment().isSameOrBefore(moment(start))) {
		let data = {
			start
			, end
			, editable: 1
			, className: 'bg-secondary border-secondary'
			, strInit: startStr
		};
		(calendarInicial || calendarLugar).addEventSource([data]);
		eventosNuevosCalendario.push(data);
	} else {
		alertify.warning("La hora debe ser mayor a la actual.");
	}
}

function limpiarFiltrosCalendario() {
	$(".chosen-select").val([""]).trigger('chosen:updated');
	configInicial.lugaresFiltroC = [];
	configInicial.tipoLugaresFiltroC = [];
	$("#modalFiltrosCalendario").modal('hide');
	iniciarCalendario();
}

function irPorLosLugares(tipoLugaresFiltroC) {
	configInicial.lugaresFiltroC = [];
	if (tipoLugaresFiltroC.length) {
		let data = { tipoLugaresFiltroC }
		obtenerInformacionCalendario(data, 'obtenerLugares', 'regresoObtenerLugares');
	} else {
		let estruLugares = '<option selected value="" style="search-choice-close-disabled">Todos</option>';
		$("#lugaresFiltroC").html(estruLugares).val([""]).trigger('chosen:updated');
	}
}

function regresoObtenerLugares(lugares) {
	let estruLugares = '<option selected value="" style="search-choice-close-disabled">Todos</option>';
	lugares.forEach(it => {
		estruLugares += `<option value="${it.LugarId}" style="search-choice-close-disabled">${it.Nombre}</option>`
	});
	$("#lugaresFiltroC").html(estruLugares).trigger('chosen:updated');;
}

function hoyCalendario() {
	if (configInicial.vista == 'reserva') {
		$("#btnMesMenos, #btnHoy").prop('disabled', true);
	}
	iniciarCalendario({ mesAnio: moment().format('YYYY-MM-DD') });
}

function bloquearODesbloquearHoy() {
	$("#btnMesMenos, #btnHoy").prop('disabled', false);
	if (configInicial.mesAnio == moment().format('MM-YYYY')) {
		$("#btnMesMenos, #btnHoy").prop('disabled', true);
	}
}

function verInformacionLugar(idLugar) {
	let datos = {
		lugarId: idLugar
		, idDiaMes: moment('01-' + valorIncialAnioMes, 'DD-MM-YYYY').format('YYYY-MM-DD')
		, tipoCant: 'M'
	};
	obtenerInformacionCalendario(datos, 'eventosMes', 'regresoEventosMes');
}

function regresoEventosMes({ datos, valido, diaMes, lugarId, nombreLugar }) {
	if (valido) {
		$(".calendario-manual").addClass("d-none");
		$(".calendariofull-lugar").removeClass('d-none');
		if (calendarLugar) {
			calendarLugar.removeAllEvents()
		} else {
			initFullCalendarSoloLugar(lugarId, diaMes);
			setTimeout(() => {
				$(".fc-regresar-button").css('background-color', '#ff5252').css('border-color', '#ff5252');
				$(".fc-regresar-button").addClass('btn btn-danger').html(`<i class="fas fa-chevron-left"></i> Regresar`);

				$(".fc-toolbar-title").closest('.fc-toolbar-chunk').append(`<h2 class="fc-toolbar-title">| ${nombreLugar}</h2>`).addClass('d-flex');
			}, 300);
		}
		calendarLugar.addEventSource(datos);
	}
}

function initFullCalendarSoloLugar(lugarId, diaMes) {
	optionFullCalendarLugar = {
		customButtons: {
			regresar: {
				click: () => {
					$(".calendario-manual").removeClass("d-none");
					$(".calendariofull-lugar").addClass('d-none');
					calendarLugar.destroy();
					calendarLugar = null;
				}
			}
		},
		buttonText: {
			timeGrid: 'Mes',
			regresar: 'Regresar'
		},
		allDaySlot: false,
		height: '100%',
		locale: 'es',
		slotMinTime: '00:00',
		slotMaxTime: '24:00',
		slotDuration: '00:30:00',
		selectOverlap: false, // No deja seleccionar por encima de los demas eventos
		headerToolbar: {
			left: 'regresar',
			center: 'title',
			right: 'timeGrid,timeGridWeek,today prev,next'
		},
		dayHeaderContent: ({ date }) => moment(date).format('ddd D/MM'),
		displayEventTime: true,
		initialView: 'timeGrid',
		editable: false,
		selectable: true,
		initialDate: moment().toDate(),
		nowIndicator: true,
		slotLabelFormat: [{
			hour: 'numeric',
			minute: '2-digit',
			omitZeroMinute: false,
			meridiem: 'short',
			hour12: false
		}],
		visibleRange: {
			start: (configInicial.vista == 'reserva' ? moment().format('YYYY-MM-DD') : moment(diaMes).startOf('month').format('YYYY-MM-DD'))
			, end: moment(diaMes).endOf('month').add(1, 'day').format('YYYY-MM-DD')
		}
	}

	if (calendarLugar) {
		if (calendarLugar.view.type == 'timeGridWeek') {
			delete optionFullCalendarLugar.visibleRange;
			optionFullCalendarLugar.initialView = 'timeGridWeek';
		}
	}

	if (configInicial.vista == 'reserva') {
		optionFullCalendarLugar = {
			...optionFullCalendarLugar
			, eventClick
			, select
			, validRange: {
				start: new Date()
			}
		};
	}
	let FuCalendarLugar = FullCalendar.Calendar;
	calendarLugar = new FuCalendarLugar(document.getElementById('calendarioFullLugar'), optionFullCalendarLugar);
	setTimeout(() => {
		calendarLugar.render();
		iniciarEventosCalendario(lugarId);
	}, 100);
}

function buscarInfoEventosLugar(lugarId, idDiaMes, tipoCant = 'M') {
	let datos = { lugarId, idDiaMes, tipoCant };
	obtenerInformacionCalendario(datos, 'eventosMes', 'regresoEventosMes');
}

function iniciarEventosCalendario(lugarId) {
	$("#calendarioFullLugar .fc-prev-button").unbind('click').click(() => {
		if (calendarLugar.view.type == 'timeGrid') {
			let end = moment(calendarLugar.view.activeEnd).subtract(1, 'month').format('YYYY-MM-DD');
			let start = moment(calendarLugar.view.activeStart).subtract(1, 'month').format('YYYY-MM-DD');
			if (configInicial.vista == 'reserva') {
				start = moment().format('YYYY-MM-DD');
			}
			calendarLugar.setOption('visibleRange', { end, start });
			buscarInfoEventosLugar(lugarId, start);
		} else {
			let end = moment(calendarLugar.view.activeEnd).format('YYYY-MM-DD');
			let start = moment(calendarLugar.view.activeStart).format('YYYY-MM-DD');
			calendarLugar.setOption('visibleRange', { end, start });
			buscarInfoEventosLugar(lugarId, start, 'S');
		}
	});
	$("#calendarioFullLugar .fc-next-button").unbind('click').click(() => {
		if (calendarLugar.view.type == 'timeGrid') {
			let end = moment(calendarLugar.view.activeEnd).add(1, 'month').format('YYYY-MM-DD');
			let start = moment(calendarLugar.view.activeStart).add(1, 'month').format('YYYY-MM-DD');
			if (configInicial.vista == 'reserva') {
				start = moment(calendarLugar.view.activeStart).startOf('month').add(1, 'month').format('YYYY-MM-DD');
			}
			calendarLugar.setOption('visibleRange', { end, start });
			buscarInfoEventosLugar(lugarId, start);
		} else {
			let end = moment(calendarLugar.view.activeEnd).format('YYYY-MM-DD');
			let start = moment(calendarLugar.view.activeStart).format('YYYY-MM-DD')
			calendarLugar.setOption('visibleRange', { end, start });
			buscarInfoEventosLugar(lugarId, start, 'S');
		}
	});
	$("#calendarioFullLugar .fc-timeGrid-button").unbind('click').click(() => {
		let end = moment().endOf('month').add(1, 'day').format('YYYY-MM-DD');
		let start = moment().startOf('month').format('YYYY-MM-DD');
		if (moment(calendarLugar.getDate()).format('YYYY-MM-DD') != moment().format('YYYY-MM-DD')) {
			end = moment(calendarLugar.view.activeEnd).endOf('month').add(1, 'day').format('YYYY-MM-DD');
			start = moment(calendarLugar.view.activeEnd).startOf('month').format('YYYY-MM-DD')
		} else {
			if (configInicial.vista == 'reserva') {
				start = moment().format('YYYY-MM-DD');
			}
		}
		calendarLugar.setOption('visibleRange', { end, start });
		buscarInfoEventosLugar(lugarId, start);
	});
	$("#calendarioFullLugar .fc-today-button").unbind('click').click(() => {
		let end = moment().endOf('week').format('YYYY-MM-DD');
		let start = moment().startOf('week').format('YYYY-MM-DD');
		if (calendarLugar.view.type == 'timeGrid') {
			end = moment().endOf('month').add(1, 'day').format('YYYY-MM-DD');
			start = moment().startOf('month').format('YYYY-MM-DD');
			if (configInicial.vista == 'reserva') {
				start = moment().format('YYYY-MM-DD');
			}
		}
		calendarLugar.setOption('visibleRange', { end, start });
		buscarInfoEventosLugar(lugarId, start, (calendarLugar.view.type == 'timeGrid' ? null : 'S'));

	});
	$("#calendarioFullLugar .fc-timeGridWeek-button").unbind('click').click(() => {
		let end = moment(calendarLugar.getDate()).endOf('week').format('YYYY-MM-DD');
		let start = moment(calendarLugar.getDate()).startOf('week').format('YYYY-MM-DD');
		if (moment(calendarLugar.getDate()).startOf('month').format('YYYY-MM') == moment().startOf('month').format('YYYY-MM')) {
			end = moment().endOf('week').format('YYYY-MM-DD');
			start = moment().startOf('week').format('YYYY-MM-DD');
		}
		calendarLugar.setOption('visibleRange', { end, start });
		buscarInfoEventosLugar(lugarId, start, 'S');
	});
}
