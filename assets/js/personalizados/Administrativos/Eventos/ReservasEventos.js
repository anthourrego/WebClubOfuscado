let rutaGeneral = base_url() + 'Administrativos/Eventos/Eventos/';
let totalReservas = null;
let primerCarga = 1;
let dataFiltro = {
	FechaInicial: moment().format('YYYY-MM-01'),
	FechaFinal: moment().format('YYYY-MM-DD'),
	numDoc: null,
	numDocInvi: null,
	numAcc: null,
	numResev: null,
	numFac: null,
	proSer: ["-1"],
	proSerArray: [],
	estado: ["-1"],
	estadoArray: [],
	tipoEvento: ["-1"],
	tipoEventoArray: [],
	reservaActual: null
}

let tblAsistententes = $('#tablaAsistentes').DataTable({
	fixedColumns: true,
	serverSide: true,
	scrollX: true,
	pageLength: 10,
	ajax: {
		url: rutaGeneral + "DTTotalInvitadosReserva",
		type: 'POST',
		data: function (d) {
			return $.extend(d, {...dataFiltro, primerCarga});
		},
	},
	buttons: buttonsDT(['copy', 'excel', 'pdf', 'print', 'pageLength']),
	columns: [
		{ data: "Reserva" }, 
		{ data: "Cod_Evento" }, 
		{ data: "Evento" }, 
		{
			data: "Fecha_Inicio",
			render: function(data, type, row, meta){
				return moment(data).format('YYYY-MM-DD HH:mm:ss');
			}
		}, 
		{
			data: "Fecha_Fin",
			render: function(data, type, row, meta){
				return moment(data).format('YYYY-MM-DD HH:mm:ss');
			}
		}, 
		{ data: "Servicio" }, 
		{ data: "Nro_Accion" }, 
		{ data: "Cedula" }, 
		{ data: "Nombre" }, 
		{ data: 'Tipo_Tercero' }, 
		{ data: "Accion_Invitado" }, 
		{ data: "Documento_Invitado" }, 
		{ data: "Invitado" }, 
		{ data: "FechaNac_Invitado" }, 
		{ data: "Telefono_Invitado" }, 
		{ data: "Email_Invitado" }, 
		{
			data: "Fecha_Registro",
			render: function(data, type, row, meta){
				return moment(data).format('YYYY-MM-DD HH:mm:ss');
			}
		}, 
		{ data: "Estado_Reserva" }, 
		{ data: "Factura" }
	],
	initComplete: function () {
		showTableColumns([], "tablaAsistentes");
	}
});

let tblReservas = $('#tabla').DataTable({
	fixedColumns: true,
	scrollX: true,
	serverSide: true,
	pageLength: 10,
	ajax: {
		url: rutaGeneral + "cargarDT",
		type: 'POST',
		data: function (d) {
			return $.extend(d, {...dataFiltro, primerCarga});
		},
	},
	buttons: buttonsDT(['copy', 'excel', 'pdf', 'print', 'pageLength']),
	columns: [
		{ data: 'Numero_Reserva' }, 
		{ data: 'Numero_Documento'}, 
		{ data: 'Nombre' }, 
		{ data: 'Nro_Accion' }, 
		{
			data: 'Fecha_Registro',
			render: function(data, type, row, meta){
				return moment(data).format('YYYY-MM-DD HH:mm:ss');
			}
		}, 
		{ data: 'Evento' }, 
		{ data: 'Estado' }, 
		{ data: 'Factura' }, 
		{
			data: 'ValorTotal',
			className: "text-right",
			render: function(data, type, row, meta){
				return "$&nbsp;" + addCommas(parseFloat(data).toFixed(2) > 0 ? parseFloat(data).toFixed(2) : '0.00');
			}
		}, 
		{
			data: null,
			defaultContent: `<button class="btn btn-info btn-xs btn-ver-invitados" title="Ver Invitados">
					<i class="fas fa-search"></i>
				</button>`,
			className: 'text-center Accion noExport',
			orderable: false
		}
	],
	initComplete: function () {
		showTableColumns([], "tabla");
	},
	createdRow: function (row, data, dataIndex) {
		$(row).find('.btn-ver-invitados').click(function () {
			dataFiltro.reservaActual = data.EventoReservaId;
			tblInvitados.ajax.reload();
			totalesFacInvitados();

			Object.entries(data).forEach(op => {
				if (op[0] ==  "Fecha_Registro") {
					$("#" + op[0]).html(moment(op[1]).format('YYYY-MM-DD HH:mm:ss'));
				} else {
					$("#" + op[0]).html(op[1]);
				}
			});

			tblInvitados.columns.adjust().draw();
			$("#modalInvitados").modal('show');
		});
	},
});

let tblInvitados = $('#tablaInvitados').DataTable({
	fixedColumns: true,
	serverSide: true,
	pageLength: 5,
	scrollX: true,
	ajax: {
		url: rutaGeneral + "DTInvitadosReserva",
		type: 'POST',
		data: function (d) {
			return $.extend(d, {
				numeroReserva: dataFiltro.reservaActual,
				primerCarga
			});
		},
	},
	buttons: buttonsDT(['copy', 'excel', 'pdf', 'print', 'pageLength']),
	columns: [
		{ data: 'Accion' }, 
		{ data: 'DocumentoInvitado' }, 
		{ data: 'NombreInvitado' }, 
		{ data: 'FechaNac' }, 
		{ data: 'TelefonoInvitado' }, 
		{ data: 'EmialInvitado' }, 
		{ data: 'Observacion' }, 
		{ data: 'Estado' }, 
		{ data: 'nombre' },
		{
			data: 'Valor',
			className: "text-right",
			render: function(data, type, row, meta){
				return "$&nbsp;" + addCommas(parseFloat(data).toFixed(2) > 0 ? parseFloat(data).toFixed(2) : '0.00');
			}
		}
	],
	initComplete: function () {
		showTableColumns([], "tablaInvitados");
	}
});

function totalesFacInvitados(){
	$.ajax({
		url: rutaGeneral + "TotalFacInvi",
		type: 'POST',
		dataType: 'json',
		data: dataFiltro,
		success: function (res) {
			$("#TotalFacturasInvi").val(Intl.NumberFormat('es-CO', {
				style: 'currency',
				currency: 'COP'
			}).format(res.ValorTotalFac));
	
		},
	});
}

function totalesTablas() {
	$.ajax({
		url: rutaGeneral + "TotalesRes",
		type: 'POST',
		dataType: 'json',
		data: dataFiltro,
		success: function (res) {
			$("#TotalReservas").val(res.TotalReservas.totalRev);
			$("#TotalFacturas").val(Intl.NumberFormat('es-CO', {
				style: 'currency',
				currency: 'COP'
			}).format(res.TotalReservas.TotalFac));
			$("#TotalInvitados").val(res.TotalInvitados.totalInvi);
		},
	});
}

function cambioProductosServicios(tipoEvento){
	$("#ProductoSer").html(`<option value='-1' selected>Todos</option>`);
	let prodServ = [];

	if (tipoEvento.includes("-1")) {
		tipoEvento = [];
		$("#tipoEvento").find("option").each(function(){
			if ($(this).attr("value") != -1) {
				tipoEvento.push($(this).attr("value"));
			}
		});
	}

	$PROSER.forEach(it => {
		tipoEvento.forEach(it2 => {
			if (it.EventoId.includes(it2) && !prodServ.find(el => el.ProductoId == it.ProductoId)) {
				prodServ.push(it);
				$("#ProductoSer").append(`<option value="${it.ProductoId}">${it.Servicio}</option>`);
			}
		});
	});
	$("#ProductoSer").trigger("chosen:updated");
}

$(function () {
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

		//Esto solo lo hace para el select para tipo evento
		if ($(this).attr("id") == 'tipoEvento' && el.deselected != '-1') {
			cambioProductosServicios(values);
		}
		$(this).val(values).trigger("chosen:updated");
	});

	$("#formFiltro").submit(function (event) {
		event.preventDefault();

		dataFiltro.FechaInicial = $("#formFiltro :input[name='FechaInicialE']").val();
		dataFiltro.FechaFinal = $("#formFiltro :input[name='FechaFinalE']").val();
		dataFiltro.numDoc = $("#formFiltro :input[name='NumDoc']").val();
		dataFiltro.numDocInvi = $("#formFiltro :input[name='numDocInvi']").val();
		dataFiltro.numAcc = $("#formFiltro :input[name='NumAcc']").val();
		dataFiltro.numResev = $("#formFiltro :input[name='NumReserva']").val();
		dataFiltro.numFac = $("#formFiltro :input[name='NumFact']").val();
		dataFiltro.proSer = $("#formFiltro select[name='ProductoSer']").val();
		dataFiltro.proSerArray = $("#formFiltro select[name='ProductoSer']").val();
		dataFiltro.estado = $("#formFiltro select[name='EstadoRes']").val();
		dataFiltro.estadoArray = $("#formFiltro select[name='EstadoRes']").val();
		dataFiltro.tipoEvento = $("#formFiltro select[name='tipoEvento']").val();
		dataFiltro.tipoEventoArray = $("#formFiltro select[name='tipoEvento']").val();

		if (dataFiltro.proSer.includes("-1")) {
			dataFiltro.proSerArray = [];
			$("#formFiltro select[name='ProductoSer']").find("option").each(function(){
				if ($(this).attr("value") != "-1") {
					dataFiltro.proSerArray.push($(this).attr("value"));
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

		if (dataFiltro.tipoEvento.includes("-1")) {
			dataFiltro.tipoEventoArray = [];
			$("#formFiltro select[name='tipoEvento']").find("option").each(function(){
				if ($(this).attr("value") != "-1") {
					dataFiltro.tipoEventoArray.push($(this).attr("value"));
				}
			});
		}

		primerCarga = 0;
		tblAsistententes.ajax.reload();
		tblReservas.ajax.reload();
		totalesTablas();

		$(".closeFiltros").removeClass("d-none");
		$("#totalEventos").val(dataFiltro.tipoEventoArray.length);
		$("#modalFiltro").modal("hide");
	});

	$("#btnFiltroReset").on("click", function(e){
		e.preventDefault();
	
		$("#formFiltro")[0].reset();
		cambioProductosServicios(["-1"]);
		$(".FechaInicial").val(moment().format('YYYY-MM-01'));
		$(".FechaFinal").val(moment().format('YYYY-MM-DD'));
		$(".FechaInicial, .FechaFinal").change();
		$(".FiltrosSelec").val(["-1"]).trigger("chosen:updated");

		$("#formFiltro").submit();
	});

	//Abrimos la modal del filtro
	$("#modalFiltro").modal("show");
});