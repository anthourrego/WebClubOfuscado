let rutaGeneral = base_url() + 'Socios/Reserva/Reserva/';
let sedeActual;
let zonasSede;
let zonaActual;
let itemsDetalle = [{
	valor: 'ZonaId', titulo: 'Zona'
}, {
	valor: 'Fecha', titulo: 'Fecha'
}, {
	valor: 'Hora', titulo: 'Hora'
}, {
	valor: 'Motivo', titulo: 'Motivo'
}, {
	valor: 'observacion', titulo: 'Observación'
}];
let calendar;
let diaSemana;
let fechaReserva = {};
let reservasUsuario = [];
let reservaEditar = {};
let infoEventos;
let eventossCalendar = [];
let eventoFin;
let eventoInicio;

$(function () {
	$('#Fecha').datetimepicker('minDate', moment().subtract(1,'d').toDate()); 
	$('#Fecha').datetimepicker('disabledDates', [moment().subtract(1,'d').toDate()]);

	/*$("#Fecha").on("focus", function () {
		$("#input-calendar").click();
		accionDiaActual();
	});*/

	ejecutarPeticion({}, 'obtenerReservaUsuario', 'datosReservas');

	iniciarListaDetalle();
	$(".tarjeta-sede").on('click', function () {
		if ($(this).data('zonas') > 0) {
			sedeActual = $(this).data('sede');
			let data = {
				sede: sedeActual
			}
			ejecutarPeticion(data, 'obtenerZonas', 'datosZonas');
		} else {
			alertify.warning("La sede no posee zonas disponibles");
		}
	});

	$("#ZonaId").change(function () {
		if ($(this).val() == '') {
			$("#Fecha").attr('disabled', true);
		} else {
			var fechas = [];
			zonaActual = zonasSede.find(op => op.ZonaId == $(this).val());

			if (zonaActual.Lunes != 'S') fechas.push(1);
			if (zonaActual.Martes != 'S') fechas.push(2);
			if (zonaActual.Miercoles != 'S') fechas.push(3);
			if (zonaActual.Jueves != 'S') fechas.push(4);
			if (zonaActual.Viernes != 'S') fechas.push(5);
			if (zonaActual.Sabado != 'S') fechas.push(6);
			if (zonaActual.Domingo != 'S') fechas.push(0);

			$('#Fecha').datetimepicker('daysOfWeekDisabled', fechas);
			$("#Fecha").attr('disabled', false)
			$("#input-calendar").click();
			accionDiaActual();
		}
	});

	$(document).on('dp.change', "#Fecha", function (e) {
		let value = $(this).val();
		if (value == '') {
			return;
		}
		$("#cargador-calendar").hide();
		$("#calendar-padre, .ticket").hide();
		if (zonaActual) {
			diaSemana = moment(value, 'YYYY-MM-DD').locale('es').format('dddd');
			if (diaSemana == "Miércoles") diaSemana = "Miercoles";
			if (diaSemana == "Sábado") diaSemana = "Sabado";
			
			if (zonaActual[diaSemana] == 'S') {
				if (!zonaActual[diaSemana + 'HoraInicial'] || !zonaActual[diaSemana + 'HoraFinal']) {
					alertify.warning("La zona no tiene configurado horario para este dia");
				} else {
					$("#cargador-calendar").show();
					$("#calendar-padre, .ticket").hide();
					let horIni = moment(zonaActual[diaSemana + 'HoraInicial'], 'HH:mm');
					let minInit = horIni.format('mm');
					let horFin = moment(zonaActual[diaSemana + 'HoraFinal'], 'HH:mm');
					let minFin = horFin.subtract(1, 'minute').format('mm');

					infoEventos = {
						fechaReserva: value,
						horaInicial: +horIni.format('HH'),
						horaFinal: +horFin.format('HH'),
						zonaId: zonaActual['ZonaId'],
						fechaInicio: moment(value, 'YYYY-MM-DD').hour(+horIni.format('HH')).minute(+minInit).format('YYYY-MM-DD HH:mm:ss'),
						fechaFinal: moment(value, 'YYYY-MM-DD').hour(+horFin.format('HH')).minute(+minFin).format('YYYY-MM-DD HH:mm:ss'),
						personas: $("#Personas").val()
					}
					initCalendar();
				}
			} else {
				$(".ticket").show();
				alertify.warning(`La zona no tiene disponibilidad el dia ${diaSemana}`);
			}
		} else {
			$(".ticket").show();
			alertify.warning("No se ha seleccionado la zona.");
		}
	});

	setTimeout(() => {
		$("button.add, button.remove").on('click', function () {
			if (eventoInicio) {
				if ($("#Personas").val() == 0) $("#Personas").val(1);
				$("#Fecha").focusout();
				infoEventos['personas'] = $("#Personas").val();
				let datos = { ...infoEventos, eventoInicio, eventoFin };
				ejecutarPeticion(datos, 'validarHorario', 'validarHorarioReserva');
			} else {
				if ($("#ZonaId").val() != "") {
					alertify.warning("Selecciona la hora de la reserva en el calendario.")
				}
				$("#Personas").val(1)
			}
		});
	}, 1000);

	$("#formularioCrearReserva").submit(function (e) {
		e.preventDefault();
		if ($(this).valid() && fechaReserva.start) {
			let $fills = $("#formularioCrearReserva input, #formularioCrearReserva select, #formularioCrearReserva textarea");
			let data = {};
			$.each($fills, (pos, input) => {
				const name = $(input).attr("name");
				data[name] = $(input).val();
			});
			data['Inicio'] = moment(fechaReserva.start).format('YYYY-MM-DD HH:mm:ss');
			data['Fin'] = moment(fechaReserva.end).format('YYYY-MM-DD HH:mm:ss');
			delete data['Fecha'];
			data['HoraReserva'] = moment(fechaReserva.start).format('HH');
			data['HoraReservaFinal'] = moment(fechaReserva.end).format('HH');
			data = { ...data, ...infoEventos, eventoInicio, eventoFin, reserva: null };
			ejecutarPeticion(data, 'guardarReserva', 'reservaGuardada');
		} else {
			if (!fechaReserva.start) {
				alertify.warning("No ha seleccionado la hora de la reserva");
				return;
			}
			alertify.error("Valide la información el formulario");
		}
	});

	$("#btnCancelarCancelacion").click(function () {
		$("#tiposCancelacion").modal('hide');
	});

	$('#modalReserva').on('hide.bs.modal', function (event) {
		reservaEditar = {};
		$("#formularioCrearReserva")[0].reset();		
		$("#formularioCrearReserva :input").attr('disabled', false);

		$("#calendar-padre").hide();
		$("#cargador-calendar").hide();
		$(".ticket").show();
		$("#Fecha").val("").change().prop('disabled', true);
		iniciarListaDetalle();
	});
});

function accionDiaActual() {
	$(".today").click(function () {
		$("#Fecha").val(moment().format('YYYY-MM-DD'));
	});
}

function iniciarListaDetalle() {
	$("#listaDetalleReserva").html(`
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Sede</span>
			<span id="valTickSedeId"></span>
		</div>
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Zona</span>
			<span id="valTickZonaId"></span>
		</div>
		<div id="mesaId" class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Mesa</span>
			<span id="valTickMesaId"></span>
		</div>
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Fecha</span>
			<span id="valTickFecha"></span>
		</div>
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Hora</span>
			<span id="valTickHora"></span>
		</div>
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Personas</span>
			<span id="valTickPersonas"></span>
		</div>
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Motivo</span>
			<span id="valTickMotivo"></span>
		</div>
	`);
	$("#valTickObservacion").html("");
}

function reservaGuardada(resp) {
	alertify.success(resp.mensaje);
	infoEventos = null;
	calendar.removeAllEvents();
	fechaReserva = null;
	eventoInicio = null;
	$("#modalReserva").modal('hide');
	$("#formularioCrearReserva :input").val('');
	$("#Personas").val(1);
	$("#Fecha").val(moment().format('YYYY-MM-DD'));
	ejecutarPeticion({}, 'obtenerReservaUsuario', 'datosReservas');
}

function datosZonas({ datos }) {
	let estructura = '';
	$("#ZonaId").html("<option value=''>Seleccione...</option>");
	datos.forEach(element => {
		estructura += `<option value="${element.ZonaId}">${element.Nombre}</option>`;
	});
	zonasSede = datos;
	$("#ZonaId").append(estructura);
	let enc = $SEDES.find(op => op.SedeId == sedeActual);
	$("#valTickSedeId").text(enc.Nombre);
	$("#Personas").val(1);
	$("button.remove").click();
	$("#btnEliminarReserva").hide();
	$("#btnCrearReserva").show();
	$("#mesaId").removeClass('d-flex').addClass('d-none');
	$("#modalReserva").modal('show');
}

function ejecutarPeticion(data, metodoBack, funcion) {
	data = $.Encriptar(data);
	$.ajax({
		url: rutaGeneral + metodoBack,
		type: 'POST',
		data: { encriptado: data },
		dataType: "json",
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (resp.valido && funcion) {
				this[funcion](resp);
			} else if (!resp.valido) {
				alertify.error(resp.mensaje);
			}
		}
	});
}

function datosReservas({ datos }) {
	reservasUsuario = datos;
	if (datos.length) {
		let estructuraPendientes = '';
		let estructuraCanceladas = '';
		datos.forEach(it => {
			let principal = `<div title="${it.NombreEstado}" class="listaItem" data-id="${it.Id}" data-sede="${it.SedeId}">
				<a href="#" class="flex-column align-items-start">
					<div class="d-flex w-100 justify-content-between align-items-center">
						<h5 class="mb-0 text-truncate pr-2">Reserva: ${it.ReservaId}</h5>
					</div>
					<p class="text-truncate pr-2 mb-0">Motivo: ${toTitleCase(it.Motivo)}</p>
					<small>Mesa Nro: ${it.MesaId}</small><br>
					<small>${moment(it.Inicio).locale('es').format('LLL')}</small>
				</a>
			</div>`;
			if (it.Estado == 'CC' || it.Estado == 'RZ') {
				estructuraCanceladas += `<div class="list-group-item list-group-item-action p-2 listaReserva" onMouseOver="this.style.borderBottomColor = '${it.ColorEstado}'" onMouseOut="this.style.borderBottomColor = '#e1e1e1'">
					${principal}
				</div>`;
			} else {
				estructuraPendientes += `<div class="list-group-item list-group-item-action p-2 listaReserva" onMouseOver="this.style.borderBottomColor = '${it.ColorEstado}'" onMouseOut="this.style.borderBottomColor = '#e1e1e1'">
					<div title="" class="text-white text-center bg-danger eliminarReserva btnLista" data-id="${it.Id}" style="position: absolute; right: 0px; top: 0px;width: 20px; cursor:pointer;">
						<i class="fas fa-trash"></i>
					</div>
					${principal}
				</div>`;
			}
		});
		$("#listareservasPendientes").html(estructuraPendientes);
		$("#listareservasCanceladas").html(estructuraCanceladas);
		accionReservas();
	} else {
		$("#listareservas").html('<div class="text-center">No tienes reservas registradas...</div>');
	}
}

function initCalendar() {
	if (calendar) {
		calendar.destroy();
		calendar = null;
	}
	const options = {
		allDaySlot: false,
		height: '100%',
		expandRows: true,
		locale: 'es',
		slotMinTime: zonaActual[diaSemana + 'HoraInicial'],
		slotMaxTime: zonaActual[diaSemana + 'HoraFinal'],
		slotDuration: '00:60:00',
		initialView: 'timeGridDay',
		initialDate: moment($("#Fecha").val(), 'YYYY-MM-DD').toDate(),
		headerToolbar: {
			left: '',
			center: 'title',
			right: ''
		},
		navLinks: false,
		editable: false,
		selectable: true,
		nowIndicator: true,
		dayMaxEvents: true,
		slotLabelFormat: [{
			hour: 'numeric',
			minute: '2-digit',
			meridiem: 'short'
		}],
		eventClick: function (ev) { },
		select: function (ev) {
			if (!moment(ev.start).isAfter(moment())) {
				alertify.warning("No se permite fecha y hora anteriores.");
				return;
			}
			let unidad = (zonaActual.UnidadTiempoAntelacion == 'HO' ? 'hours' : (zonaActual.UnidadTiempoAntelacion == 'MI' ? 'minutes' : 'days'));
			let tiempo = (unidad == 'hours' ? 'horas' : (unidad == 'minutes' ? 'minutos' : 'dias'));
			if (moment(ev.start).diff(moment(), unidad) < zonaActual.TiempoAntelacionReserva) {
				alertify.warning("La reserva se debe realizar con " + zonaActual.TiempoAntelacionReserva + " " + tiempo + " de antelación.");
				return;
			}
			calendar.removeAllEvents();
			calendar.addEventSource([...eventossCalendar, ev]);
			fechaReserva = ev;
			eventoFin = moment(fechaReserva.end).add(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
			eventoInicio = moment(fechaReserva.start).subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
			let datos = { ...infoEventos, eventoInicio, eventoFin };
			ejecutarPeticion(datos, 'validarHorario', 'validarHorarioReserva');
			$("#valTickHora").text(moment(fechaReserva.start).format('HH:mm'));
		},
		events: async function (start, end, timezone, callback) {
			eventossCalendar = [];
			await jQuery.ajax({
				url: base_url() + "Socios/Reserva/Reserva/obtenerDisponibilidadMesas",
				type: 'POST',
				dataType: 'json',
				data: infoEventos,
				success: async function (doc) {
					doc = JSON.parse(doc);
					$("#calendar-padre").show();
					$("#cargador-calendar").hide();
					calendar.removeAllEvents();
					if (fechaReserva && fechaReserva.start) {
						calendar.addEventSource([fechaReserva]);
					}
					if (!doc.datos.length) {
						return
					} else {
						let minutos = moment(zonaActual[diaSemana + 'HoraInicial'], 'HH:mm').format('mm');
						await doc.datos.forEach(op => {
							eventossCalendar.push({
								id: op.Id,
								title: 'No disponible',
								start: moment(op.Fecha, 'YYYY-MM-DD').hour(op.Horas).minute(+minutos).toDate(),
								end: moment(op.Fecha, 'YYYY-MM-DD').hour(op.Horas).add(((+minutos)/*  + 60 */), 'minutes').toDate(),
							});
						});
					}
				}
			});
			return eventossCalendar;
		}
	}
	let FuCalendar = FullCalendar.Calendar;
	let calendarEl = document.getElementById('calendar');
	calendar = new FuCalendar(calendarEl, options);
	calendar.render();
}

function validarHorarioReserva(doc) {
	if (doc.mesasMensaje == '') {
		if (!doc.mesas.length) {
			alertify.warning("No hay mesas disponibles.");
			$("#calendar-padre, #cargador-calendar").hide();
			$(".ticket").show();
			return;
		}
	} else {
		$("#calendar-padre, #cargador-calendar").hide();
		$(".ticket").show();
		alertify.warning(doc.mesasMensaje);
	}
}

function accionReservas() {
	$(".listaItem").on('click', function () {
		reservaEditar = { id: $(this).data('id') };
		let enc = reservasUsuario.find(op => op.Id == reservaEditar['id']);
		$("#ZonaId").html("<option value=''>Seleccione...</option>");
		$("#ZonaId").append(`<option value="${enc['ZonaId']}">${enc['Nombre']}</option>`);
		Object.keys(enc).forEach(it => {
			$("#" + it).val(enc[it]);
			$("#valTick" + it).text(enc[it]);
		});
		$("#valTickZonaId").text(enc['Nombre']);
		$("#valTickSedeId").text(enc['NombreSede']);
		$("#mesaId").removeClass('d-none').addClass('d-flex');
		$("#btnEliminarReserva").show();
		$("#btnEliminarReserva").data('id', reservaEditar['id']);
		$("#btnCrearReserva").hide();
		$("#formularioCrearReserva :input").attr('disabled', true)
		$("#modalReserva").modal('show');
		if (enc.Estado == 'CC' || enc.Estado == 'FT') {
			$("#btnEliminarReserva").hide();
		}
	});

	$(".eliminarReserva").click(function () {
		reservaEditar = { id: $(this).data('id') };
		if ($(this).attr('id') == 'btnEliminarReserva') {
			reservaEditar['modal'] = true;
		}
		ejecutarPeticion({}, 'obtenerTiposCancelacionReserva', 'tiposCancelacion')
	});
}

function reservaEliminada(resp) {
	reservaEditar = {};
	$("#modalReserva").modal('hide');
	$("#tiposCancelacion").modal('hide');
	alertify.success(resp.mensaje);
	ejecutarPeticion({}, 'obtenerReservaUsuario', 'datosReservas');
}

function tiposCancelacion({ datos }) {
	$('#estructuraCancelacion').empty();
	if (datos.length) {
		datos.forEach(item => {
			$('#estructuraCancelacion').append(`<div class="col-3 p-1">
				<div class="card mb-1 h-100" style="box-shadow: none !important;">
					<div class="card-body p-1" onclick='clickCancelacion(${JSON.stringify(item)})' style="border:2px solid #d4d4d4; cursor:pointer; border-radius: 5px; height: 80px;">
						<div class="container-item text-center" style="font-size: 13px; text-overflow: ellipsis; white-space: break-spaces;overflow: hidden;">${item.Nombre}</div>
					</div>
				</div>
			</div>`);
		});
	} else {
		$('#estructuraCancelacion').append(`<div class="col-3 p-1">No hay tipos de cancelación registradas</div>`);
	}
	if (reservaEditar.modal) {
		$("#modalReserva").modal('hide');
	}
	$("#tiposCancelacion").modal('show');
}

function clickCancelacion(cancelacion) {
	alertify.confirm('Alerta', `¿Desea cancelar la reserva?`, function (ok) {
		let enc = reservasUsuario.find(op => op.Id == reservaEditar['id']);
		let data = {
			reserva: reservaEditar.id,
			tipoCancelacion: cancelacion['TipoCancelacionId'],
			zona: enc['ZonaId'],
			hora: moment(enc['Inicio']).format('HH'),
			fecha: moment(enc['Inicio']).format('YYYY-MM-DD')
		}
		ejecutarPeticion(data, 'eliminarReserva', 'reservaEliminada');
	}, function (err) {
		console.error("Error ", err);
	});
}