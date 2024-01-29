let rutaGeneral = base_url() + 'Administrativos/Servicios/InformeGeneralConsumoFacturas/';
let dataFiltro = {
	idUsuario: $USUARIO,
	vendedores: [],
	almacenes: [],
	tipoItem: [],
	fechaInicial: moment().format('YYYY-MM-DD'),
	fechaFinal: moment().format('YYYY-MM-DD')
};

let tblCuentas = $('#tabla').DataTable({
	dom: domBftrip,
	fixedColumns: true,
	serverSide: true,
	pageLength: 10,
	scrollX: true,
	ajax: {
		url: rutaGeneral + "cargarDT",
		type: 'POST',
		data: function (d) {
			return $.extend(d, dataFiltro);
		},
	},
	buttons: buttonsDT(["copy", "excel", "pdf", "print"]),
	columns: [
		{ data: 'Tipo', width: '11.11%' }
		,{ data: 'Comanda_o_Factura', width: '11.11%' }
		,{ data: 'Mesa', width: '11.11%' }
		,{ data: 'Almacen', width: '11.11%' }
		,{ data: 'Vendedor', width: '11.11%' }
		,{ data: 'Accion', width: '11.11%', visible: ($TIPOCOMERC == 'CLUB' ? true : false) }
		,{ data: 'Codigo_Barras', width: '11.11%' }
		,{ data: 'Nombre_Habitacion', width: '11.11%' }
		,{ data: 'Cliente_o_Socio', width: '11.11%' }
		,{ data: 'Fecha_y_hora', width: '11.11%' }
		,{ data: 'Concepto_Pago', width: '11.11%' }
		,{ data: 'Fact_Electronica', width: '11.11%' }
		,{ 
			data: 'Mensaje_WhatsApp', 
			width: '11.11%',
			visible: ($MONTAJE.WhatsAppFactura == 'S' ? true : false)
		}
	],
	createdRow: function (row, data, dataIndex) {
		if (data.Tipo == 'Comanda') {
			$(row).css("background-color", "#fffcae7d");
		} else {
			$(row).css("background-color", "#aeecff73");
		}
	},
});

$(function () {
	RastreoIngresoModulo('Informe General Consumo Facturas');

	//Se deshabilitan las fecha para no colocar rango erroneos
	$("#fechaInicial").on("dp.change", function (e) {
		$('#fechaFinal').data("DateTimePicker").minDate(e.date);
	});
	$("#fechaFinal").on("dp.change", function (e) {
		$('#fechaInicial').data("DateTimePicker").maxDate(e.date);
	});
	
	//Se cooloca la fecha maxima para la fina fin del consumo
	$("#fechaFinal").data("DateTimePicker").maxDate(moment().format('YYYY-MM-DD'));

	$("#fechaInicial, #fechaFinal").val(moment().format('YYYY-MM-DD')).change();

	$(".chosen-select").chosen({ width: '100%' });

	$("#formFiltroCF").submit(function (e) {
		e.preventDefault();
		
		if ($(this).valid()) {
			dataFiltro.fechaInicial = $("#fechaInicial").val();
			dataFiltro.fechaFinal = $("#fechaFinal").val();
			dataFiltro.vendedores = $("#vendedores").val().filter(x => x != '-1');
			dataFiltro.tipoItem = $("#tipoItem").val().filter(x => x != '-1');
			dataFiltro.almacenes = $("#almacenes").val().filter(x => x != '-1');
			tblCuentas.ajax.reload();
		}
	});

	$(".FiltrosSelec").change(function (e, el) {
		e.preventDefault();
		let values = ['-1'];
		if (el.selected != -1) {
			values = $(this).val().filter(x => x != '-1');
			if (values.length <= 0 || values.length >= ($(this).find("option").length - 1)) values = ['-1'];
		}

		$(this).val(values).trigger("chosen:updated");
	});

});