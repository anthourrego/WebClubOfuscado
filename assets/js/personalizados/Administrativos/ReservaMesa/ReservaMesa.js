let rutaGeneral = base_url() + 'Administrativos/ReservaMesa/ReservaMesa/';
let diaSemana;
let zonaActual;
let consultandoAccion = false;
let datosSede = {};
let selectMesas = [""];
let horaInicio;
let horaFinal;
let dataFiltro = {};
let fechaIniFiltro;
let fechaFinFiltro;
let reservasMesas = [];
let mesasZona = [];
let reservaActual = {};
let reservaMultiple = false;
let multipleMesasArray = [];
let datosTerceros = [];
let columnaConsultaTercero = "TerceroID";
let accionReserva;

$(function () {
	RastreoIngresoModulo('Reservar');
	$("#tercerosAccion").hide();

	$(".chosen-select").chosen({ width: '100%' });
	$("#Fecha, #FechaCambiar").val(moment().format('YYYY-MM-DD'));
	$("#HoraCambiar").val(moment().add(1, 'hour').startOf('hour').format('HH:mm'));

	$("#btnSeleccionarSede").on('click', function () {
		if (!$SEDE.valido) {
			alertify.warning($SEDE.msg);
			return;
		} else {
			datosSede = $SEDE['datos'] ? $SEDE['datos'] : {};
			abrirCerrarModal("#ModalSeleccionarSede", "show");
		}
	});

	iniciarListaDetalle();

	$("#btnSeleccionarSede").click();

	$("#mesas").change(function (e) {
		let entrada = $(this).val().filter(x => !selectMesas.includes(x));
		if (entrada[0] == "") {
			$(this).val([""]);
		} else {
			$(this).val($(this).val().filter(it => it != ''));
		}
		selectMesas = $(this).val();
		$("#mesas").trigger('chosen:updated');
	});

	$("#formBuscarZona").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			let data = {
				fecha: $("#Fecha").val(),
				zona: $("#ZonaId").val()
			}
			diaSemana = moment(data.fecha, 'YYYY-MM-DD').locale('es').format('dddd');
			if (diaSemana == "Miércoles") diaSemana = "Miercoles";
			if (diaSemana == "Sábado") diaSemana = "Sabado";
			zonaActual = $ZONAS.find(op => op.ZonaId == data.zona);
			if (zonaActual[diaSemana] != 'S') {
				alertify.warning("La zona no esta disponible para reserva el dia " + diaSemana);
				return;
			}
			if (!zonaActual[diaSemana + 'HoraInicial'] || !zonaActual[diaSemana + 'HoraFinal']) {
				alertify.warning("La zona no tiene configurado horario para este dia");
				return;
			}
			let HoraFinZona = zonaActual[diaSemana + 'HoraFinal'].split(':');
			let HoraIniZona = zonaActual[diaSemana + 'HoraInicial'].split(':');
			horaFinal = moment($("#Fecha").val()).hour(+HoraFinZona[0]).minute(+HoraFinZona[1]);
			horaFinal = horaFinal.add((+HoraIniZona[1] + 1), 'minute').format('YYYY-MM-DD HH:mm:ss');
			horaInicio = moment($("#Fecha").val()).hour(+HoraIniZona[0]).minute(+HoraIniZona[1]);
			horaInicio = horaInicio.subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
			ejecutarPeticion({ zona: zonaActual['ZonaId'], horaInicio, horaFinal }, 'obtenerMesas', 'datosMesas');
		}
	});

	$("#Motivo, #Observacion").keyup(function () {
		$("#valTickMotivo").text($("#Motivo").val());
		$("#valTickObservacion").text($("#Observacion").val());
	});

	$(".cerrarModal").click(function () {
		$("#formularioReserva")[0].reset();
		$("#formularioReserva :input").removeClass('is-invalid');
		$("#formularioReserva").validate().resetForm();
		$("#tercerosAccion").hide();
		reservaActual = {};
		$("#UserPedido").val('<option value="">&nbsp;</option>');
		$("#Personas").val('1');
	});

	setTimeout(() => {
		$("button.add, button.remove").on('click', function () {
			let personas = $("#Personas").val();
			let maximo = $("#Personas").prop('max');
			if (+personas == (+maximo)) {
				$("#Personas").val(maximo);
			} else if (+personas >= (+maximo)) {
				$("#Personas").val(maximo);
				alertify.warning("Maximo " + maximo + " personas");
			}
			$("#valTickPersonas").text($("#Personas").val());
		});
	}, 1000);

	$("#UserPedido").on('change', function () {
		let valor = $("#UserPedido option:selected").val();
		$("#valTickTerceroId").text($("#UserPedido option:selected").text());
		let enc = datosTerceros.find(op => op.TerceroID == valor);
		accionReserva = enc.AccionId;
		if (enc.CantAcciones > 1 && columnaConsultaTercero != "AccionId") {
			if (!reservaActual['Id']) {
				modalaccionesTercero(enc.Acciones);
			} else {
				if (reservaActual['TerceroId'] != $("#numeroAccion").val()) {
					modalaccionesTercero(enc.Acciones);
				}
			}
		} else {
			if (columnaConsultaTercero == "AccionId") {
				accionReserva = $("numeroAccion").val();
			}
			$("#valTickAccionId").text(accionReserva);
		}
	});

	$("#numeroAccion").change(function () {
		buscarDatosTercero($(this).val());
	});

	$("#btnBuscarTercero").click(function () {
		buscarDatosTercero($("#numeroAccion").val());
	});

	$("#btnCrearReserva").click(function (e) {
		e.preventDefault();
		if (!$("#UserPedido").val()) {
			alertify.warning("No se ha seleccioando ningún tercero.");
			return;
		}
		if ($("#formularioReserva").valid()) {
			let horIni = moment(zonaActual[diaSemana + 'HoraInicial'], 'HH:mm');
			let minInit = horIni.format('mm');
			let horFin = moment(zonaActual[diaSemana + 'HoraFinal'], 'HH:mm');
			let minFin = horFin.subtract(1, 'minute').format('mm');
			let fecha = $("#valTickFecha").text();
			let data = {
				Personas: $("#Personas").val(),
				ZonaId: zonaActual['ZonaId'],
				Observacion: $("#Observacion").val(),
				Hora: $("#valTickHora").text(),
				Motivo: $("#Motivo").val(),
				sede: datosSede['SedeId'],
				fechaReserva: fecha,
				horaInicial: +horIni.format('HH'),
				horaFinal: +horFin.format('HH'),
				fechaInicio: moment(fecha, 'YYYY-MM-DD').hour(+horIni.format('HH')).minute(+minInit).format('YYYY-MM-DD HH:mm:ss'),
				fechaFinal: moment(fecha, 'YYYY-MM-DD').hour(+horFin.format('HH')).minute(+minFin).format('YYYY-MM-DD HH:mm:ss'),
				tercero: $("#UserPedido").val(),
				mesa: $("#valTickMesaId").text(),
				reserva: reservaActual && reservaActual['Id'] ? reservaActual['Id'] : null,
				accion: (accionReserva || null)
			}
			if (reservaMultiple) {
				organizarDataReservaMultiple(data);
			} else {
				let hora = $("#valTickHora").text().split(':');
				data['Inicio'] = moment(fecha, 'YYYY-MM-DD').hour(hora[0]).minute(hora[1]).format('YYYY-MM-DD HH:mm:ss');
				data['Fin'] = moment(fecha, 'YYYY-MM-DD').hour(hora[0]).minute(hora[1]).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
				data['HoraReserva'] = hora[0];
				data['HoraReservaFinal'] = moment(data.Fin).format('HH');
				eventoFin = moment(data.Inicio).add(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
				eventoInicio = moment(data.Fin).subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
				data = { ...data, eventoInicio, eventoFin };
				ejecutarPeticion(data, 'guardarReserva', 'reservaGuardada');
			}
		} else {
			alertify.warning("Validar campos del formulario.");
		}
	});

	setInterval(() => {
		if (dataFiltro.mesas) {
			$("#formFiltro").submit();
		} else {
			$("#formBuscarZona").submit();
		}
	}, 60000);

	$("#btnFiltrosCalendario").click(function () {
		$("#HoraIni").val(zonaActual[diaSemana + 'HoraInicial']);
		$("#HoraFin").val(zonaActual[diaSemana + 'HoraFinal']);
		$("#mesas").change();
		abrirCerrarModal("#modalFiltros", "show");
	});

	$("#formFiltro").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			dataFiltro = {
				mesas: $("#mesas").val(),
				horaInicial: $("#HoraIni").val(),
				horaFinal: $("#HoraFin").val()
			}
			let fechaInicial = moment($("#Fecha").val());
			let fechaFinal = moment($("#Fecha").val());
			fechaIniFiltro = fechaInicial.hour(+moment(dataFiltro.horaInicial, 'HH:mm').format('HH')).minute(+moment(dataFiltro.horaInicial, 'HH:mm').format('mm'));
			fechaFinFiltro = fechaFinal.hour(+moment(dataFiltro.horaFinal, 'HH:mm').format('HH')).minute(+moment(dataFiltro.horaFinal, 'HH:mm').format('mm'));
			if (fechaIniFiltro.isBefore(fechaFinFiltro)) {
				if (moment(horaInicio).isBefore(fechaIniFiltro) && moment(horaFinal).isAfter(fechaFinFiltro)) {
					let mesas = dataFiltro.mesas.includes('');
					let peticion = {
						zona: zonaActual['ZonaId'],
						horaInicio: fechaIniFiltro.subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss'),
						horaFinal: fechaFinFiltro.add(1, 'minute').format('YYYY-MM-DD HH:mm:ss')
					};
					if (!mesas) {
						peticion['mesas'] = dataFiltro.mesas;
					}
					ejecutarPeticion(peticion, 'obtenerMesas', 'datosMesas');
				} else {
					alertify.warning("La hora no se encuentra en el rango del horario de la zona.");
				}
			} else {
				alertify.warning("La hora incial debe ser superior a la final.");
			}
		} else {

		}
	});

	$("#btnModificarFecha").on('click', function (e) {
		e.preventDefault();
		if ($("#formMesaCambiar").valid()) {
			let tiempo = $("#HoraCambiar").val().split(':');
			let fecha = moment($("#FechaCambiar").val()).hour(+tiempo[0]).minute(+tiempo[1]);
			let fechaReal = moment($("#FechaCambiar").val()).hour(+tiempo[0]).minute(+tiempo[1]);
			let data = {
				reserva: reservaActual['Id'],
				mesa: reservaActual['MesaId'],
				horaIni: fecha.subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss'),
				horaFin: fecha.add(1, 'hour').add(2, 'minute').format('YYYY-MM-DD HH:mm:ss'),
				horaRealIni: fechaReal.format('YYYY-MM-DD HH:mm:ss'),
				horaRealFin: fechaReal.add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
				zona: zonaActual['ZonaId'],
				horaAnterior: moment(reservaActual['Inicio']).format('YYYY-MM-DD HH:mm:ss')
			}
			ejecutarPeticion(data, 'cambiarHorario', 'horarioCambiar');
		}
	});

	$("#btnMultiplesMesas").on('click', function () {
		if (!$PERMISOCREARRESERVA) {
			alertify.warning("No tiene permisos para crear reservas");
			return;
		}
		let oculto = $(".bs-canvas-right").is(':visible');
		$("#btnSeleccionarSede, #btnFiltrosCalendario, #btnEstadosTabla").prop('disabled', !oculto);
		if (!oculto) {
			$(".bs-canvas-right").show().css('margin-bottom', '34px');
			$("#personTotal").val('');
			solicitarCantidadPersonas();
		} else {
			$(".bs-canvas-right").hide().css('margin-bottom', '-100vh');
			reservaMultiple = false;
			multipleMesasArray.forEach(op => {
				$(op.clase).removeClass('mesa-multiple').addClass('tdReserva');
			});
			multipleMesasArray = [];
		}
	});

	$("#btnCancelarMultiplesMesas").click(function () {
		$('#btnMultiplesMesas').click();
		reservaMultiple = false;
		multipleMesasArray.forEach(op => {
			$(op.clase).removeClass('mesa-multiple').addClass('tdReserva');
		});
		multipleMesasArray = [];
	});

	$("#modalReserva").on('shown.bs.modal', function () {
		setTimeout(() => {
			$("#numeroAccion").focus();
		}, 100);
	});

	$("#btnCerrarModalAccionesCargarCuenta").click(function () {
		abrirCerrarModal("#modal-accion-tercero", "hide", "#modalReserva", "show");
	});
});

function horarioCambiar({ mensaje, datos }) {
	alertify.success(mensaje);
	abrirCerrarModal("#modalHorarioModificar", "hide", "#modalReserva", "hide");
	if (dataFiltro.mesas) {
		$("#formFiltro").submit();
	} else {
		$("#formBuscarZona").submit();
	}
}

function reservaGuardada({ mensaje }) {
	alertify.success(mensaje);
	$("#formularioReserva")[0].reset();
	$("#formularioReserva :input").removeClass('is-invalid');
	$("#formularioReserva").validate().resetForm();
	$("#Personas").val('1');
	$("#formBuscarZona").submit();
	$("#tercerosAccion").hide();
	abrirCerrarModal("#modalReserva", "hide");
	if (reservaActual['Id']) {
		reservaActual = {};
	}
}

function solicitarCantidadPersonas() {
	alertify.prompt('Cantidad de personas', '', '', function (evt, value) {
		if (value != '') {
			if ($("#personTotal").val() == '') {
				alertify.warning("Selecciones las mesas en el horario a reservar");
				$("#personProgress").val(0);
			} else {
				organizarAcumuladoPersonas();
			}
			$("#personTotal").val(value);
			reservaMultiple = true;
			$("#btnConfirmarMultiplesMesas").unbind().click(function () {
				if (multipleMesasArray.length) {
					alertify.confirm('Alerta', "¿Esta seguro de reservar las mesas seleccionadas?", function (ok) {
						$("#container-input-personas").hide();
						$("#formulario, #btnCrearReserva").show();
						$("#formulario :input").attr('disabled', false);
						$("#ticket-mesa").removeClass('col-12');
						$("#modalReserva").children('div').addClass('modal-lg');
						$("#btnRechazarReserva, #btnConfirmarReserva, #btnCambiarMesaReserva, #btnCancelarReserva, #btnCambiarHorarioReserva").hide();
						iniciarListaDetalle();
						$("#valTickSedeId").text(datosSede['NombreSede']);
						$("#valTickZonaId").text(zonaActual['Nombre']);
						$("#valTickPersonas").text($("#personTotal").val());
						$("#horaReserva").removeClass('d-flex').addClass('d-none');
						$("#btnCrearReserva").text('Agregar Reserva');
						$("#valTickFecha").text($("#Fecha").val());
						$("#valTickMesaId").text($("#mesasMultiple").text());
						abrirCerrarModal("#modalReserva", "show");
					}, function (err) {
						console.error("Error ", err);
					});
					/* if ($("#personTotal").val() > $("#personProgress").val()) {
					} else {} */
				} else {
					alertify.warning("No ha seleccionado ninguna mesa");
				}
			});
		} else {
			alertify.warning("Por favor digite una cantidad valida");
			setTimeout(() => {
				if ($("#personTotal").val() == '') solicitarCantidadPersonas();
			}, 50);
		}
	}, function () {
		if ($("#personTotal").val() == '') {
			$(".bs-canvas-right").hide().css('margin-bottom', '-100vh');
			reservaMultiple = false;
		}
	}).set('type', 'number');
}

function buscarDatosTercero(valor) {
	if (!consultandoAccion) {
		consultandoAccion = true;
		ejecutarPeticion({ tercero: valor }, 'buscarTercero', 'datosTercero');
	}
}

function datosTercero({ datos, columna }) {
	let items = '';
	columnaConsultaTercero = columna;
	$("#tercerosAccion").show();
	datosTerceros = datos;
	if (datos.length) {
		datos.forEach(it => {
			items += `<option value="${it.TerceroID}">${it.Nombre}</option>`;
		});
		$("#UserPedido").html(items);
		$("#UserPedido").change();
	} else {
		$("#tercerosAccion").hide();
		$("#valTickTerceroId").text('');
	}
	consultandoAccion = false;
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
				if (metodoBack == 'buscarTercero') {
					consultandoAccion = false;
					$("#tercerosAccion").hide();
					$("#valTickTerceroId").text('');
				}
				alertify.error(resp.mensaje);
			}
		}
	});
}

function organizarDataReservaMultiple(data) {
	let dataGuardar = [];
	multipleMesasArray.forEach(op => {
		let info = { ...data, Personas: op.personas, Hora: op.hora, mesa: op.mesa };
		let hora = op.hora.split(':');
		info['Inicio'] = moment(data.fechaReserva, 'YYYY-MM-DD').hour(hora[0]).minute(hora[1]).format('YYYY-MM-DD HH:mm:ss');
		info['Fin'] = moment(data.fechaReserva, 'YYYY-MM-DD').hour(hora[0]).minute(hora[1]).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
		info['HoraReserva'] = hora[0];
		info['HoraReservaFinal'] = moment(info.Fin).format('HH');
		eventoFin = moment(info.Inicio).add(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
		eventoInicio = moment(info.Fin).subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
		info = { ...info, eventoInicio, eventoFin };
		dataGuardar.push(info);
	});
	ejecutarPeticion(dataGuardar, 'guardarReservaMultiple', 'reservaMultipleGuardada');
}

function reservaMultipleGuardada(resp) {
	$("#formBuscarZona").submit();
	$("#btnMultiplesMesas").click();
	abrirCerrarModal("#modalReserva", "hide");
	reservaMultiple = false;
	multipleMesasArray = [];
	alertify.success(resp.mensaje);
}

function datosMesas({ datos, reservas }) {
	actualizarTitulo();
	if (dataFiltro.mesas) {
		abrirCerrarModal("#modalFiltros", "hide");
	}
	construirTabla(zonaActual[diaSemana + 'HoraInicial'], zonaActual[diaSemana + 'HoraFinal'], datos, reservas);
}

function construirTabla(horaInicio, horaFin, mesas, reservas) {
	let horaIniTemp = moment(horaInicio, 'HH:mm');
	horaFin = moment(horaFin, 'HH:mm');
	let estructura = `<th scope="col" style="position: sticky;top: -2px; z-index: 3;">${zonaActual['Nombre']}</th>`;
	let fechaHora = moment($("#Fecha").val(), 'YYYY-MM-DD');
	while (horaFin.diff(horaIniTemp) > 0) {
		fechaHora.hour(+horaIniTemp.format('HH')).minute((+horaIniTemp.format('mm') + 1));
		let valido = 1;
		if (fechaIniFiltro && fechaFinFiltro) {
			valido = fechaHora.isBetween(moment(fechaIniFiltro).subtract(1, 'minute'), moment(fechaFinFiltro).add(1, 'minute'));
		}
		if (valido) {
			estructura += `<th scope="col" class="text-center" style="position: sticky;top: -2px; z-index: 3;">${horaIniTemp.format('HH:mm')}</th>`;
		}
		horaIniTemp = horaIniTemp.add(1, 'hour');
	}
	$("#cabeceraCalendario").html(estructura);
	horaIniTemp = moment(horaInicio, 'HH:mm');
	let estrucReservas = '';
	let fecha = moment($("#Fecha").val(), 'YYYY-MM-DD');
	let optionsChosen = '';
	mesasZona = mesas;
	reservasMesas = reservas;
	mesas.forEach(element => {
		let infor = `<th scope="row" class="text-center thMesa" style="position:sticky; left: 0;z-index: 5;">${element['MesaId']}</th>`;
		optionsChosen += `<option value="${element['MesaId']}">${element['MesaId']}</option>`;
		while (horaFin.diff(horaIniTemp) > 0) {
			fecha.hour(+horaIniTemp.format('HH')).minute((+horaIniTemp.format('mm') + 1));
			let valido = 1;
			if (fechaIniFiltro && fechaFinFiltro) {
				valido = fecha.isBetween(moment(fechaIniFiltro).subtract(1, 'minute'), moment(fechaFinFiltro).add(1, 'minute'));
			}
			if (valido) {
				let enc = reservas.filter(it => fecha.isBetween(moment(it['Inicio']), moment(it['Fin'])) && it['MesaId'] == element['MesaId']);
				let findMultiple = multipleMesasArray.findIndex(op => op.clase == `.mesa${element['MesaId']}${horaIniTemp.format('HHmm')}`);
				if (enc.length) {
					if (findMultiple != -1) {
						multipleMesasArray.splice(findMultiple, 1);
					}
					let canceladas = [];
					let rechazadas = [];
					let confirmadas = 0;
					enc.forEach(element => {
						if (element['Estado'] == 'CN' || element['Estado'] == 'EM' || element['Estado'] == 'FT') {
							confirmadas++;
							infor += `<td style="position: relative; max-width:150px; min-width:150px;" title="${element['Observacion']}" class="tdReserva td${element['Estado']}">
								<div tabindex="0" role="button" data-toggle="popover" data-trigger="hover" title="${element['Motivo']}" data-content="${element['Observacion']}" class="td-reservamesa" data-reserva="${element['Id']}">
									<div class="text-truncate">${element['Motivo']}</div>
									<div class="text-truncate">${element['Observacion']}</div>
								</div>`;
						} else {
							element['Estado'] == 'CC' ? canceladas.push(element['Id']) : rechazadas.push(element['Id']);
						}
					});
					if (confirmadas == 0) {
						infor += `<td class="text-center tdReserva" style="position: relative; max-width:150px; min-width:150px;"><div onclick="reservaMesa('${element['MesaId']}', '${horaIniTemp.format('HH:mm')}', '${element['MaximoPersonas']}')">Disponible</div>`;
					}
					if (canceladas.length) {
						infor += `<div data-reserva="${JSON.stringify(canceladas)}" style="position: absolute; top: 0; left: 0;" class="triangle-canceladas" title="Canceladas"></div>`;
					}
					if (rechazadas.length) {
						infor += `<div data-reserva="${JSON.stringify(rechazadas)}" style="position: absolute; top: 0; right: 0;" class="triangle-rechazadas" title="Rechazadas">
						</div>`;
					}
					infor += `</td>`;
				} else {
					infor += `<td 
						onclick="reservaMesa('${element['MesaId']}', '${horaIniTemp.format('HH:mm')}', '${element['MaximoPersonas']}')"
						class="text-center mesa${element['MesaId']}${horaIniTemp.format('HHmm')} ${findMultiple != -1 ? 'mesa-multiple' : 'tdReserva'}"
						title="${element['MaximoPersonas'] ? element['MaximoPersonas'] + ' personas' : 'No tiene capacidad de personas registrada'}"
						style="max-width:150px; min-width:150px;"
					>Disponible</td>`;
				}
			}
			horaIniTemp = horaIniTemp.add(1, 'hour');
			//horaIniTemp = horaIniTemp.add(30, 'minutes');
		}
		horaIniTemp = moment(horaInicio, 'HH:mm');
		estrucReservas += `<tr>${infor}</tr>`;
		if (reservaMultiple) {
			organizarAcumuladoPersonas();
		}
	});
	if (!dataFiltro.mesas) {
		$("#mesas").html('<option value="" selected>Todos</option>');
		$("#mesas").append(optionsChosen).trigger('chosen:updated');
	}
	$("#estructuraCalendario").html(estrucReservas);
	actualizarTitulo();
	$('[data-toggle="popover"]').popover()
	$("#btnFiltrosCalendario, #InfoCalendar, #btnMultiplesMesas").show();
	abrirCerrarModal("#ModalSeleccionarSede", "hide");
	$(".td-reservamesa").click(function () {
		/* if (!$PERMISOMODIFICARRESERVA) {
			alertify.warning("No tiene permisos para modificar");
			return;
		} */
		if (reservaMultiple) return alertify.warning("Mesa en horario no disponible");
		let enc = reservasMesas.find(op => op.Id == $(this).data('reserva'));
		reservaActual = enc;
		iniciarListaDetalle();
		$("#valTickSedeId").text(datosSede['NombreSede']);
		$("#valTickZonaId").text(zonaActual['Nombre']);
		$("#valTickHora").text(moment(enc['Inicio']).format('HH:mm'));
		$("#valTickFecha").text(moment(enc['Inicio']).format('YYYY-MM-DD'));
		$("#valTickMesaId").text(enc['MesaId']);
		$("#valTickTerceroId").text(enc['NombreTercero']);
		$("#valTickPersonas").text(enc['Personas']);
		$("#valTickObservacion").text(enc['Observacion']);
		$("#valTickMotivo").text(enc['Motivo']);
		$("#btnCrearReserva").text('Modificar Reserva');
		$("#valTickAccionId").text(enc['AccionId']);
		$("#numeroAccion").val(enc['TerceroId']).change();
		$("#Personas").val(enc['Personas']).change();
		$("#Motivo").val(enc['Motivo']).change();
		$("#Observacion").val(enc['Observacion']).change();
		let mesa = mesas.find(it => it['MesaId'] == enc['MesaId'])
		$("#Personas").attr('max', mesa['MaximoPersonas']);
		$("#btnRechazarReserva, #btnConfirmarReserva, #btnCambiarMesaReserva, #btnCancelarReserva, #btnCambiarHorarioReserva, #btnCrearReserva").show();
		if (reservaActual['Estado'] == 'CN') {
			$("#btnConfirmarReserva").hide();
		}
		if (reservaActual['Estado'] == 'RZ') {
			$("#btnRechazarReserva, #btnCambiarMesaReserva, #btnCambiarHorarioReserva").hide();
		}
		if (reservaActual['Estado'] == 'CC') {
			$("#btnCancelarReserva").hide();
		}
		if (reservaActual['Estado'] == 'EM') {
			$("#btnCambiarHorarioReserva, #btnRechazarReserva, #btnCancelarReserva, #btnConfirmarReserva").hide();
		}
		if (moment().isAfter(moment(reservaActual['Inicio'])) || reservaActual['Estado'] == 'FT') {
			$("#btnCambiarMesaReserva, #btnCambiarHorarioReserva, #btnCancelarReserva, #btnRechazarReserva, #btnCambiarHorarioReserva, #btnCrearReserva").hide();
		}
		if (reservaActual['Estado'] == 'FT') {
			$("#btnConfirmarReserva").hide();
			$("#formulario :input").attr('disabled', true);
		}
		if (!$PERMISOMODIFICARRESERVA && reservaActual['Estado'] == 'CN') {
			$("#btnCrearReserva").hide();
		}
		abrirCerrarModal("#modalReserva", "show");
	});
	$(".triangle-canceladas").on('click', function () {
		if (reservaMultiple) return alertify.warning("No puede seleccionar reservas canceladas");
		detallesReserva($(this).data('reserva'), 'Cancelada');
	});
	$(".triangle-rechazadas").on('click', function () {
		if (reservaMultiple) return alertify.warning("No puede seleccionar reservas rechazadas");
		detallesReserva($(this).data('reserva'), 'Rechazada');
	});
}

function detallesReserva(reserCanc, estadoReserva) {
	let reservas = [];
	reserCanc.forEach(it => {
		reservas.push(reservasMesas.find(op => op.Id == it));
	});
	let estructura = '';
	reservas.forEach((it, pos) => {
		estructura += `<li data-id="${it.Id}" class="list-group-item ${pos == 0 ? 'active' : ''} item-lista-detalle d-flex align-items-center
		justify-content-between" 3px;" aria-current="true">
			${toTitleCase(it.NombreTercero)}
			<i class="fas fa-angle-right"></i>
		</li>`;
	});
	$("#tituloDetalles").html(`<i class="far fa-newspaper"></i> Detalle Reserva ${estadoReserva}`);
	iniciarListaDetalle('#listaDetalleReservaMesa', 'Detalle');
	$("#listaReservas").html('<ul class="list-group">' + estructura + '</ul>');
	abrirCerrarModal("#modalDetalleReservas", "show");
	$(".item-lista-detalle").click(function () {
		$(".item-lista-detalle").removeClass('active');
		$(this).addClass('active');
		let reserva = reservas.find(op => op.Id == $(this).data('id'));
		$("#valTickSedeIdDetalle").text(datosSede['NombreSede']);
		$("#valTickZonaIdDetalle").text(zonaActual['Nombre']);
		$("#valTickHoraDetalle").text(moment(reserva['Inicio']).format('HH:mm'));
		$("#valTickFechaDetalle").text(moment(reserva['Inicio']).format('YYYY-MM-DD'));
		$("#valTickMesaIdDetalle").text(reserva['MesaId']);
		$("#valTickTerceroIdDetalle").text(reserva['NombreTercero']);
		$("#valTickPersonasDetalle").text(reserva['Personas']);
		$("#valTickObservacionDetalle").text(reserva['Observacion']);
		$("#valTickMotivoDetalle").text(reserva['Motivo']);
	});
	$(".item-lista-detalle.active").click();
}

function reservaMesa(mesa, hora, personas) {
	if (!$PERMISOCREARRESERVA && !reservaMultiple) {
		alertify.warning("No tiene permisos para crear reservas");
		return;
	}
	if (personas == 'null') {
		alertify.warning("La mesa no tiene capacidad de personas registradas");
		return;
	}
	let unidad = (zonaActual.UnidadTiempoAntelacion == 'HO' ? 'hours' : (zonaActual.UnidadTiempoAntelacion == 'MI' ? 'minutes' : 'days'));
	let tiempo = (unidad == 'hours' ? 'horas' : (unidad == 'minutes' ? 'minutos' : 'dias'));
	let fecha = moment($("#Fecha").val()).hour(+moment(hora, 'HH:mm').format('HH')).minute(+moment(hora, 'HH:mm').format('mm'));
	if (moment(fecha).diff(moment(), unidad) < zonaActual.TiempoAntelacionReserva) {
		alertify.warning("La reserva se debe realizar con " + zonaActual.TiempoAntelacionReserva + " " + tiempo + " de antelación.");
		return;
	}
	if (reservaMultiple) {
		let clase = `.mesa${mesa}${hora.replace(':', '')}`;
		if ($(clase).hasClass('mesa-multiple')) {
			$(clase).removeClass('mesa-multiple');
			let pos = multipleMesasArray.findIndex(it => it.clase == clase);
			multipleMesasArray.splice(pos, 1);
		} else {
			$(clase).addClass('mesa-multiple');
			let data = { hora, mesa, personas, clase: clase };
			multipleMesasArray.push(data);
		}
		organizarAcumuladoPersonas();
	} else {
		$("#container-input-personas").show();
		$("#horaReserva").removeClass('d-none').addClass('d-flex');
		$("#formulario, #btnCrearReserva").show();
		$("#formulario :input").attr('disabled', false);
		$("#ticket-mesa").removeClass('col-12');
		$("#modalReserva").children('div').addClass('modal-lg');
		$("#btnRechazarReserva, #btnConfirmarReserva, #btnCambiarMesaReserva, #btnCancelarReserva, #btnCambiarHorarioReserva").hide();
		iniciarListaDetalle();
		$("#Personas").attr('max', personas);
		$("#valTickSedeId").text(datosSede['NombreSede']);
		$("#valTickZonaId").text(zonaActual['Nombre']);
		$("#valTickPersonas").text(1);
		$("#valTickHora").text(hora);
		$("#btnCrearReserva").text('Agregar Reserva');
		$("#valTickFecha").text($("#Fecha").val());
		$("#valTickMesaId").text(mesa);
		abrirCerrarModal("#modalReserva", "show");
	}
}

function estadoReserva(estado, codigo) {
	if (codigo == 'CN') {
		let fecha = moment(reservaActual['Inicio']).add(zonaActual['TiempoEsperaReserva'], 'minutes');
		if (fecha.isBefore(moment())) {
			alertify.warning("La reserva no puede confirmarse, se supero los " + zonaActual['TiempoEsperaReserva'] + " minuto(s) de espera.");
			return;
		}
	}
	alertify.confirm('Alerta', `¿Desea ${estado} la reserva?`, function (ok) {
		if (codigo == 'CC') {
			ejecutarPeticion({}, 'obtenerTiposCancelacionReserva', 'tiposCancelacion');
		} else {
			cambiarEstadoReserva(codigo);
		}
	}, function (err) {
		console.error("Error ", err);
	});
}

function tiposCancelacion({ datos }) {
	$('#estructuraCancelacion').empty();
	if (datos.length) {
		datos.forEach(item => {
			$('#estructuraCancelacion').append(`<div class="col-3 p-1">
				<div class="card mb-1 h-100" style="box-shadow: none !important;">
					<div class="card-body p-1" onclick='cambiarEstadoReserva("CC", ${JSON.stringify(item.TipoCancelacionId)})' style="border:2px solid #d4d4d4; cursor:pointer; border-radius: 5px; height: 80px;">
						<div class="container-item text-center" style="font-size: 13px; text-overflow: ellipsis; white-space: break-spaces;overflow: hidden;">${item.Nombre}</div>
					</div>
				</div>
			</div>`);
		});
	} else {
		$('#estructuraCancelacion').append(`<div class="col-3 p-1">No hay tipos de cancelación registradas</div>`);
	}
	abrirCerrarModal("#modalReserva", "hide", "#tiposCancelacion", "show");
}

function cambiarEstadoReserva(codigo, tipoCance = null) {
	let data = {
		reserva: reservaActual.Id,
		estado: codigo,
		fecha: moment(reservaActual['Inicio']).format('YYYY-MM-DD'),
		horas: moment(reservaActual['Inicio']).format('HH'),
		zona: zonaActual['ZonaId']
	}
	if (tipoCance) {
		data['tipoCancelacion'] = tipoCance;
	}
	ejecutarPeticion(data, 'modificarEstadoReserva', 'reservaEstadoModificado');
}

function reservaEstadoModificado({ mensaje, datos }) {
	alertify.success(mensaje);
	$("#tercerosAccion").hide();
	reservaActual = {};
	$("#formularioReserva")[0].reset();
	$("#formularioReserva :input").removeClass('is-invalid');
	$("#formularioReserva").validate().resetForm();
	abrirCerrarModal("#modalReserva", "hide", "#tiposCancelacion", "hide");
	if (dataFiltro.mesas) {
		$("#formFiltro").submit();
	} else {
		$("#formBuscarZona").submit();
	}
}

function modificarMesa() {
	let estructura = '';
	mesasZona.forEach(it => {
		if (reservaActual['MesaId'] != it['MesaId'] && it['MaximoPersonas'] > 0) {
			estructura += `<option value="${it['MesaId']}">${it['MesaId']}</option>`;
		}
	});
	let datos = `<form id="formMesaCambiar">
		<div class="form-group mb-0 form-valid">
			<label class="mb-0" for="mesaCambiar">Mesas:</label>
			<select class="chosen-select custom-select custom-select-sm" name="mesaCambiar" id="mesaCambiar">${estructura}</select>
		</div>
	</form>`
	alertify.prompt('Cambiar a la mesa', datos, '', function (evt, value) {
		let data = {
			reserva: reservaActual['ReservaId'],
			mesaNueva: $("#mesaCambiar").val(),
			mesaAnterior: reservaActual['MesaId'],
			fecha: moment(reservaActual['Inicio']).format('YYYY-MM-DD'),
			horaIni: moment(reservaActual['Inicio']).format('HH'),
			horaFin: moment(reservaActual['Fin']).format('HH'),
			fechaReservaInicio: moment(reservaActual['Inicio']).format('YYYY-MM-DD HH:mm:ss'),
			fechaReservaFin: moment(reservaActual['Fin']).format('YYYY-MM-DD HH:mm:ss'),
			zona: zonaActual['ZonaId'],
			personas: reservaActual['Personas']
		}
		ejecutarPeticion(data, 'cambiarMesa', 'cambiadoMesa');
	}, function () { });
	$(".ajs-input").hide();
}

function modificarHorario() {
	$("#HoraCambiar").val(moment(reservaActual['Inicio']).format('HH:mm'));
	abrirCerrarModal("#modalHorarioModificar", "show");
}

function cambiadoMesa(resp) {
	$("#formBuscarZona").submit();
	abrirCerrarModal("#modalReserva", "hide");
}

function iniciarListaDetalle(lista = '', ext = '') {
	$(`${lista != '' ? lista : '#listaDetalleReserva'}`).html(`
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold mr-4">Tercero</span>
			<span id="valTickTerceroId${ext}" class="text-truncate"></span>
		</div>
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold mr-4">Acción</span>
			<span id="valTickAccionId${ext}" class="text-truncate"></span>
		</div>
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Sede</span>
			<span id="valTickSedeId${ext}"></span>
		</div>
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Zona</span>
			<span id="valTickZonaId${ext}"></span>
		</div>
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Mesa</span>
			<span id="valTickMesaId${ext}"></span>
		</div>
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Fecha</span>
			<span id="valTickFecha${ext}"></span>
		</div>
		<div class="col-12 d-flex justify-content-between" id="horaReserva">
			<span class="font-weight-bold">Hora</span>
			<span id="valTickHora${ext}"></span>
		</div>
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Personas</span>
			<span id="valTickPersonas${ext}"></span>
		</div>
		<div class="col-12 d-flex justify-content-between">
			<span class="font-weight-bold">Motivo</span>
			<span id="valTickMotivo${ext}"></span>
		</div>
	`);
	$("#valTickObservacion").html("");
}

function organizarAcumuladoPersonas() {
	let cantPersonas = 0;
	let mesasString = '';
	multipleMesasArray.forEach((op, index) => {
		cantPersonas += (+op.personas || 0);
		if (!mesasString.includes(op.mesa)) {
			mesasString += op.mesa + (index == (multipleMesasArray.length - 1) ? '' : ' - ');
		}
	});
	$("#personProgress").val(cantPersonas);
	$("#mesasMultiple").text(mesasString);
}

function modalaccionesTercero(acciones) {
	let estructura = '';
	$("#accionesCargarCuenta").html(estructura);
	acciones.forEach(it => {
		estructura += `<div title="Accion" class="m-b-10 d-flex border rounded btnAccionCargar" style="align-items: center; cursor:pointer;" data-info="${it.AccionId}">
			<div class="pl-3" style="width: 100%;">
				<h6>${it.AccionId}</h6>
				<p class="m-b-0">${it.Tipo}</p>
			</div>
			<button type="button" title="Accion" class="btn btn-sm btn-secondary" style="max-height: 75px; height: 75px;">
				<i class="fas fa-share-square"></i>
			</button>
		</div>`;
	});
	$("#accionesCargarCuenta").html(estructura);
	abrirCerrarModal("#modalReserva", "hide", "#modal-accion-tercero", "show");
	$(".btnAccionCargar").unbind().click(function () {
		accionReserva = $(this).data('info');
		$("#valTickAccionId").text(accionReserva);
		abrirCerrarModal("#modal-accion-tercero", "hide", "#modalReserva", "show");
	});
}

function abrirCerrarModal(elemento, metodo, elementoAbrir, metodoAbrir) {
	$(elemento).modal(metodo);
	if (elementoAbrir && metodoAbrir) {
		$(elementoAbrir).modal(metodoAbrir);
	}
}

function actualizarTitulo() {
	$("#tituloCalendar").html(`Sede: ${datosSede['NombreSede']} - Fecha: ${moment($("#Fecha").val()).format('YYYY/MM/DD')} - Zona: ${zonaActual['Nombre']}`);
}