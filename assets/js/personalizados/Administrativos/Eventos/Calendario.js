let rutaGeneralCalendario = 'Administrativos/Eventos/Calendario/';
let valorIncialAnioMes = '';
let configInicial = {
	mesAnio: null
	, lugaresFiltroC: []
	, sedesfiltro: []
};
let eventosNuevosCalendario = [];
let lugarActualCalendario = null;
let calendarInicial = null;
let calendarLugar = null;
let optionFullCalendarLugar = {};


function iniciarCalendario(datos = {}) {
	configInicial = { ...configInicial, ...datos };
	if (!configInicial.mesAnio) {
		configInicial.mesAnio = moment().format("MM-YYYY");
	}
	obtenerInformacionCalendario(configInicial, 'initCalendarioDisponible', 'regresoCalendario');
}

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

//En esta funcion nos carga todos los datos dinamicos del calendario
function regresoCalendario({ valido, cabecera, tabla, tituloCalendario, mesanio, tipoLugares, filtro }) {
	// este boton es para redireccionar a la creacion de eventos
	$("#btnCrearEvento").on("click", function (e) {
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
	if (valido) {
		$("#cabeceraCalendario").html(cabecera);
		$(".estructuraCalendario").html(tabla);
		$(".tituloCalendario").html(tituloCalendario);
		$("#mesanio").val(mesanio);
		$('[data-toggle="tooltip"]').tooltip();
		valorIncialAnioMes = mesanio;
		if (!filtro) {
			/* Inicializamos campos para la modal de filtros */
			let estruLugares = '<option selected value="" style="search-choice-close-disabled">Todos</option>';
			let lugaresFiltroC= $("#lugaresFiltroC").html(estruLugares).chosen({ width: '100%' });

			tipoLugares.forEach(it => {
				estruLugares += `<option value="${it.SedeId}" style="search-choice-close-disabled">${it.Nombre}</option>`
			});

			for (let i = 0; i < tipoLugares.length; i++) {
				const lugares = tipoLugares[i];
				lugares.lugares.forEach(itLugares => {
					lugaresFiltroC += `<option value="${itLugares.LugarId}" style="search-choice-close-disabled">${itLugares.Nombre}</option>`
				});				
			}

			$("#sedesfiltro").html(estruLugares).chosen({ width: '100%' });			
			$("#lugaresFiltroC").html(lugaresFiltroC).chosen({ width: '100%' });

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
				if (id == 'sedesfiltro') {
					//aqui nos redireccionara a los lugares segun lo que se seleccione en la sede
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

		$("#btnFiltrarCalendario").unbind().on('click', function () {
			let data = {
				  mesAnio: $("#mesanio").val()
				, sedesfiltro   : configInicial.sedesfiltro
				, lugaresFiltroC   : configInicial.lugaresFiltroC
			}
			iniciarCalendario(data);
			$("#modalFiltrosCalendario").modal('hide');
		});

	}
}

//Funcion para cargar los meses siguientes o anteriores
function otroMesMas(fun) {
	let mesAnio = moment($("#mesanio").val(), 'MM-YYYY');

	if (fun === 'add') {
		mesAnio = mesAnio.add(1,'month').startOf('month');
	}else if (fun === 'subtract') {
		mesAnio = mesAnio.subtract(1,'month').startOf('month');
	}
	mesAnio = mesAnio.format('MM-YYYY');
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

function limpiarFiltrosCalendario() {
	$(".chosen-select").val([""]).trigger('chosen:updated');
	configInicial.lugaresFiltroC = [];
	configInicial.sedesfiltro = [];
	$("#modalFiltrosCalendario").modal('hide');
	iniciarCalendario();
}

//aqui obtenemos los lugares, los lugares para el filtro
function regresoObtenerLugares(lugares) {
	// console.log('lugares cuando selecciona filtro',lugares);
	let estruLugares = '<option selected value="" style="search-choice-close-disabled">Todos</option>';
	lugares.forEach(it => {
		estruLugares += `<option value="${it.LugarId}" style="search-choice-close-disabled">${it.Nombre}</option>`
	});
	$("#lugaresFiltroC").html(estruLugares).trigger('chosen:updated');;
}

function bloquearODesbloquearHoy() {
	$("#btnMesMenos, #btnHoy").prop('disabled', false);
	if (configInicial.mesAnio == moment().format('MM-YYYY')) {
		$("#btnMesMenos, #btnHoy").prop('disabled', true);
	}
}

function verInformacionLugar(lugarId) {
	location.href = `${base_url()}Administrativos/Eventos/ListaEventos/Calendario/`+lugarId;
}

function irPorLosLugares(sedesfiltro) {
	configInicial.lugaresFiltroC = [];
	if (sedesfiltro.length) {
		let data = { sedesfiltro }
		obtenerInformacionCalendario(data, 'obtenerLugares', 'regresoObtenerLugares');
	} else {
		let estruLugares = '<option selected value="" style="search-choice-close-disabled">Todos</option>';
		$("#lugaresFiltroC").html(lugaresFiltroC).val([""]).trigger('chosen:updated');
	}
}

function hoyCalendario() {
	if (configInicial.vista == 'reserva') {
		$("#btnMesMenos, #btnHoy").prop('disabled', true);
	}
	iniciarCalendario({ mesAnio: moment().format('MM-YYYY') });
}

// funcion para cargas lo eventos en listas con la informacion relacionada
function cargarEventos(eventos) {
	var modalBody= $('#card-body');
	modalBody.empty();
	
	eventos.forEach(function(event){
		var card ='<ul class="list-group list-group-flush card-eventos">';
		card+= `<a class='eventoCargado' href="${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad/`+event.ReservaEvento+`">
			<div class="card m-2">
				<div class="card-body">
					<li class="list-group " style="color:#000;font-size:15px">
						<div class="row">
						<div class="" style="background-color:`+event.Color+` ;border-left:thick solid `+event.Color+` !important;height:75%;left:1%;position: absolute;border-radius:5px;border:1px solid `+event.Color+`;width: 10px;"></div>
							<div class="col-12">
								`
									+"<strong>Cliente: </strong>"+event.Cliente+
								`
							</div>
							<div class='col-6'>
								`
									+"<strong>Reserva: </strong>"+event.IdEvento+
									"<br><strong>Lugar: </strong>"+event.NombreLugar+
									"<br><strong>Estado: </strong>"+event.Estado+
								`
							</div>
							<div class='col-6'>
								`
									+"<strong>Dia Inicio: </strong>"+event.Inicio+
									"<br><strong>Día Final: </strong>"+event.Fin+
									"<br><strong>Días Evento: </strong>"+event.DiasEvento+
								`
							</div>
						</div>
					</li>
				</div>
			</div>`;
		card+= '</ul>';
		modalBody.append(card);
		if (!permisoGestorActividades) {
			$('.eventoCargado').removeAttr('href');
		}
	});
	$("#eventModal").modal('show');	
}

