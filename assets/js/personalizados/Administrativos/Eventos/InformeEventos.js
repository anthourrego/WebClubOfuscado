const rutaGeneralInforme = base_url() + "Administrativos/Eventos/InformeEventos/";
const rutaGeneralConnect = base_url() + "Administrativos/Eventos/ReservarEvento/";
let tblEventos = true;
let primerCarga = 1;
let listasSedes = [];
let agregaCorreos = [];

let dataFiltro = {
	FechaInicial: moment().format('YYYY-MM-01'),
	FechaFinal: moment().format('YYYY-MM-DD'),
	numAcc: null,
	estado: ["-1"],
	estadoArray: [],
	tipoEvento: ["-1"],
	tipoEventoArray: [],
	numDoc: null,
	VendedorId: ["-1"],
	VendedorIdArray: [],
	LugarId: ["-1"],
	LugarIdArray: [],
	numEvento : null
}

tblEventos = $("#tlbEventos").DataTable({
	fixedColumns: true,
	serverSide: true,
	scrollX: true,
	pageLength: 10,
	order: [[0, "DESC"]],
	ajax: {
		url: rutaGeneralInforme + "DTEventos",
		type: "POST",
		data: function (d) {
			return $.extend(d, {...dataFiltro, primerCarga});
		},
		global: false,
	},
	buttons: buttonsDT(['copy', 'excel', 'pdf', 'print', 'pageLength']),
	columns: [
		{
			data: "EventoId",
			className: "text-center noExport",
			orderable: false, targets: [0], width: '1%',
			render: function (data) {
				if($permisoBotones){
					return `
					<a
						href="${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad/${data}"
						class="btn btn-primary btn-xs btnVisualizar"
						title="Visualizar evento"
					>
						<i class="fas fa-eye"></i>
					</a>
					<button class="btn btn-info btn-xs verModal" title="Ver resumen" value=${data}>
						<i class="fas fa-list"></i>
					</button>
					`;
				}else{
					return ``
				}

			},
		},
		{ 	data: "Evento" },
		{ 	data: "Version"},
		{ 	data: "Nombre" },
		{ 	data: "TipoEvento" },
		{ 	data: "Tercero" },
		{ 	data: "barra" },
		{ 	data: "Accion" },
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
		{ 	data: "EstadoAct" ,
			className: "Estado",
			render: function(Estado){
				return Estado;
			}
		},
		{ data: "Valor" ,className: "Valor text-right"},
		{ data: "valorCartera", className: " valorCartera text-right"},
		{ data: "valorPagado", className: " valorPagado text-right"},
		{ data: "NombreSede"},
		{ data: "nombreAlmacen"},
		{ data: "Vendedor"},
		{ data: "MedioReserva"},
		{ data: "Interno"},
		{ data: "Personas" },
		{ 	data: "Numimvitados", className: "text-right"},
		{
			data: "FechaSolici",
			render: function (data, type, row, meta) {
				return moment(data, "YYYY-MM-DD HH:mm:ss").format(
					"YYYY-MM-DD hh:mm:ss A"
				);
			},
		},
		{ data: "Lugar"},
	],
	createdRow: function (row, data, dataIndex) {
		$(row).find('.Valor').html('$&nbsp;' + addCommas(data.Valor));
		$(row).find('.valorCartera').html('$&nbsp;' + addCommas(data.valorCartera));
		$(row).find('.valorPagado').html('$&nbsp;' + addCommasNeg(data.valorPagado));
		$(row).find('.verModal').on('click', function (e) {
			$.ajax({
				url: rutaGeneralInforme + "cargarComponent",
				type: "POST",
				data: {
					eventoId : data.EventoId,
				},
				success: (res) => {
					reservaDB = JSON.parse(res);
					Object.assign(nuevaReserva, reservaDB);
					detalleComponent();
					setTimeout(() => {
						$("#modalDetalle").modal("show");
					}, 300);
					
				}
			})
		})

		//Se agrega validacion para que le cargue los colores correspondiente a cada estado y se vea en la vista.
		EstadoCO = $(row).find('.Estado');
		EstadoCO[0].style.cursor = 'pointer'
		switch (data.EstadoAct) {
			case 'Cotizado':
				// 'Cotizado'
				EstadoCO[0].style.backgroundColor = '#F5A9BC'
				EstadoCO[0].title = 'Evento cotizado, a la espera de una respuesta del cliente'
				break;
			case 'Versionado':
				// 'Versionado'
				EstadoCO[0].style.backgroundColor = '#A9DFBF'
				EstadoCO[0].title = 'Versión antigua de un evento(No debería mostrarse en el calendario)'
				break;
			case 'Aceptado Cliente':
				// 'Aceptado Cliente'
				EstadoCO[0].style.backgroundColor = '#AEDFF7'
				EstadoCO[0].title = 'El cliente confirma la cotizacion (Se puede confirmar) '
				break;
			case 'Rechazado Cliente':
				// 'Rechazado Cliente'
				EstadoCO[0].style.backgroundColor = '#F5CBA7'
				EstadoCO[0].title = 'El cliente rechaza la cotización (Se debe crear una nueva versión de la cotización y esperar que el cliente la confirme)'
				break;
			case 'Anulado':
				// 'Anulado'
				EstadoCO[0].style.backgroundColor = '#D2B4DE'
				EstadoCO[0].title = 'Cotización anulada, finaliza el proceso'
				break;
			case 'Confirmado':
				// 'Confirmado'
				EstadoCO[0].style.backgroundColor = '#B8E994'
				EstadoCO[0].title = 'Cotización confirmada por el asesor comercial después de tener el aval del cliente'
				break;
			case 'Cotizar Nuevamente':
				// 'Cotizar Nuevamente'
				EstadoCO[0].style.backgroundColor = '#87CEEB'
				EstadoCO[0].title = 'Se requiere cotizar nuevamente el evento ya que un evento confirmado ocupó el lugar para la fecha cotizada'
				break;
			case 'Expirado':
				// 'Expirado'
				EstadoCO[0].style.backgroundColor = '#F8C9C5'
				EstadoCO[0].title = 'Cotización que no pasó a evento'
				break;
			case 'Vencido':
				// 'Vencido'
				EstadoCO[0].style.backgroundColor = '#B3B6B7'
				EstadoCO[0].title = 'Evento confirmado que pasó el tiempo límite'
				break;
			case 'Finalizado':
				// 'Finalizado'
				EstadoCO[0].style.backgroundColor = '#F9E79F'
				EstadoCO[0].title = 'Evento finalizado, ya se celebró'
				break;
			case 'Activo':
				// 'Activo'
				EstadoCO[0].style.backgroundColor = '#C39BD3'
				EstadoCO[0].title = 'Evento activo y en proceso'
				break;
			case 'Facturación':
				// 'Facturado'
				EstadoCO[0].style.backgroundColor = '#9fc063'
				EstadoCO[0].title = 'Evento facturado'
				break;
		}
	},
});

$(function () {
	RastreoIngresoModulo("Informe Eventos");

	//se agrega un id al choosen de tipo evento para que se enfoque el teclado virtual
	setTimeout(function () {
		$('#modalFiltro').find('input:eq(0)').attr('id', 'tipEvento');
	}, 1000);
	//Se deshabilitan las fecha para no colocar rango erroneos
	$(".FechaInicial").on("dp.change", function (e) {
		$('.FechaFinal').data("DateTimePicker").minDate(e.date);
	});
	$(".FechaFinal").on("dp.change", function (e) {
		$('.FechaInicial').data("DateTimePicker").maxDate(e.date);
	});

	$(".FechaInicial").val(moment().format('YYYY-MM-01'));
	$(".FechaFinal").val(moment().format('YYYY-MM-DD'));
	$(".FechaInicial, .FechaFinal").change();

	$(".chosen-select").chosen({
		width: '100%'
	});

	$listaSedes.forEach(element => {
		listasSedes.push(element.SedeId);
	});

	cargarLugares(listasSedes);

	$(`a[data-toggle="tab"]`).on("shown.bs.tab", function(event) {
		$(".totalIn, .totalRev").addClass("d-none");
		let tab = $(this).data();
		$(`.${tab.class}`).removeClass("d-none");
		eval(tab.tabla).columns.adjust();
	});

	$(".FiltrosSelec").change(function (e, el) {
		e.preventDefault();
		let values = ['-1'];
		if (el.selected != -1) {
			values = $(this).val().filter(x => x != '-1');
			if (values.length <= 0 || values.length >= ($(this).find("option").length - 1)) values = ['-1'];
		}
		$(this).val(values).trigger("chosen:updated");

		if($(this).attr('Id') == 'SedeId'){
			$(this).val()[0] == -1 ? cargarLugares(listasSedes) : cargarLugares($(this).val());
		}
	});

	$('.btnAgregarCorreo').on('click', function(){
		agregaCorreos.push($('#Email').val());
		$('#Email').val('');
		console.log(agregaCorreos);

		agregaCorreos.forEach(element => {
			
		});

	});


	$("#formFiltro").submit(function (event) {
		event.preventDefault();

		dataFiltro.FechaInicial = $("#formFiltro :input[name='FechaInicialE']").val();
		dataFiltro.FechaFinal = $("#formFiltro :input[name='FechaFinalE']").val();

		dataFiltro.numAcc = $("#formFiltro :input[name='NumAcc']").val();
		dataFiltro.numDoc = $("#formFiltro :input[name='NumDoc']").val();
		dataFiltro.numEvento = $("#formFiltro :input[name='eventoId']").val();
		dataFiltro.estado = $("#formFiltro select[name='EstadoRes']").val();
		dataFiltro.VendedorId = $("#formFiltro select[name='VendedorId']").val();
		dataFiltro.VendedorIdArray = $("#formFiltro select[name='VendedorId']").val();

		dataFiltro.estadoArray = $("#formFiltro select[name='EstadoRes']").val();
		dataFiltro.TipoEventoId = $("#formFiltro select[name='TipoEventoId']").val();
		dataFiltro.TipoEventoIdArray = $("#formFiltro select[name='TipoEventoId']").val();
		dataFiltro.AlmacenId = $("#formFiltro select[name='AlmacenId']").val();
		dataFiltro.AlmacenIdArray = $("#formFiltro select[name='AlmacenId']").val();
		dataFiltro.SedeId = $("#formFiltro select[name='SedeId']").val();
		dataFiltro.SedeIdArray = $("#formFiltro select[name='SedeId']").val();

		dataFiltro.LugarId = $("#formFiltro select[name='LugarId']").val();
		dataFiltro.LugarIdArray = $("#formFiltro select[name='LugarId']").val();

		if (dataFiltro.LugarId.includes("-1")) {
			dataFiltro.LugarIdArray = [];
			$("#formFiltro select[name='LugarId']").find("option").each(function(){
				if ($(this).attr("value") != "-1") {
					dataFiltro.LugarIdArray.push($(this).attr("value"));
				}
			});
		}

		if (dataFiltro.estado.includes("-1")) {
			dataFiltro.estadoArray = [];
			$("#formFiltro select[name='EstadoRes']").find("option").each(function(){
				if ($(this).attr("value") != "-1") {
					dataFiltro.estadoArray.push($(this).attr("value"));
				}
			});
		}

		if (dataFiltro.SedeId.includes("-1")) {
			dataFiltro.SedeIdArray = [];
			$("#formFiltro select[name='SedeId']").find("option").each(function(){
				if ($(this).attr("value") != "-1") {
					dataFiltro.SedeIdArray.push($(this).attr("value"));
				}
			});
		}

		if (dataFiltro.TipoEventoId.includes("-1")) {
			dataFiltro.TipoEventoIdArray = [];
			$("#formFiltro select[name='TipoEventoId']").find("option").each(function(){
				if ($(this).attr("value") != "-1") {
					dataFiltro.TipoEventoIdArray.push($(this).attr("value"));
				}
			});
		}

		if (dataFiltro.VendedorId.includes("-1")) {
			dataFiltro.VendedorIdArray = [];
			$("#formFiltro select[name='VendedorId']").find("option").each(function(){
				if ($(this).attr("value") != "-1") {
					dataFiltro.VendedorIdArray.push($(this).attr("value"));
				}
			});
		}

		primerCarga = 0;
		tblEventos.ajax.reload();

		$(".closeFiltros").removeClass("d-none");
		$("#modalFiltro").modal("hide");
	});

	$("#btnFiltroReset").on("click", function(e){
		e.preventDefault();
		$("#formFiltro")[0].reset();
		$(".FechaInicial").val(moment().format('YYYY-MM-01'));
		$(".FechaFinal").val(moment().format('YYYY-MM-DD'));
		$(".FechaInicial, .FechaFinal").change();
		$(".FiltrosSelec").val(["-1"]).trigger("chosen:updated");
		cargarLugares(dataFiltro.SedeIdArray);
		setTimeout(() => {
			$("#formFiltro").submit();
		}, 10);
	});

	$('.btnEnviarInforme').on('click', function(){
		correoUsu = $("#Email").val();
		if ($("#Email").val() != "")
		{
			let msg = `¿Está seguro de enviar los documentos al correo ${correoUsu}?`;

			alertify.confirm(
				"Envío informe eventos",
				msg,
				function () {
					reporte = 'GeneraInformeEvento';
					$.ajax({
						type: "POST",
						url: rutaGeneralInforme + `envioInforme/`,
						data: {
							reporte,
							dataFiltro,
							correoUsu
						},
						dataType: "json",
						success: async function (res) {
							console.log("Detalle cargado a la sesión...");

							$("#modalReenvio").modal("hide");

							customToast("Validando conexión a Internet...");

							const internet = await validarConexionLimite();

							customToast("Procesando información...");

							if (internet) {
								if(res){
									if ($(".ajs-message").length > 0) {
										$(".ajs-message").remove();
									}
									alertify.success(res.Confirma);
									$("#Email").val("");
								}else{
									alertify.alert('Error al enviar el documento');
									$("#Email").val("");
								}
							} else {
								alertify.error("No hay conexión a Internet para enviar el correo.");
							}
						
						},
					});
				},
				function () {}
			)
		}else
		{
			alertify.error('El campo de email no se puede encontrar vacío');
		}

	})
});


function addCommasNeg(nStr, decimales = 0) {
	if(nStr == .00){
		nStr = 0
	}
	if (nStr != "null") {
		nStr += "";
		x = nStr.split(".");
		x1 = x[0];
		x2 = x.length > 1 ? "." + x[1] : ".";
		for (var i = 0; i < decimales; i++) {
			x2 += "0";
		}

		x2 = x2.substr(0, 1 + decimales);

		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, "$1" + "," + "$2");
		}
		if (decimales == 0) {
			return x1;
		} else {
			return x1 + x2;
		}
	} else {
		str = "0";
		for (let i = 0; i < decimales; i++) {
			if (i == 0) str += ".";
			str += "0";
		}
		return str;
	}
}

async function validarConexion() {
	return new Promise(async (resolve) => {
		try {
			$.ajax({
				url: rutaGeneralConnect + "proxyToGoogle",
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

function cargarLugares(SedeId) {
	$.ajax({
		url: rutaGeneralInforme + 'obtenerLugares',
		type: 'POST',
		data: {SedeId},
		dataType: "JSON",
		success: (resp) => {
			let estruLugares = '<option value="-1" selected style="search-choice-close-disabled">Todos</option>';
			resp.forEach(it => {
				estruLugares += `<option value="${it.LugarId}" style="search-choice-close-disabled">${it.Nombre}</option>`
			});
			$("#LugarId").html(estruLugares).trigger('chosen:updated');
		}
	});
}


