let rutaGeneral = base_url() + 'Administrativos/Servicios/ReimprimirComandas/';
let dataFiltro = {
	idUsuario: $USUARIO,
	vendedores: ["-1"],
	almacenes: ["-1"],
	fechaInicial: moment().format('YYYY-MM-DD'),
	fechaFinal: moment().format('YYYY-MM-DD'),
};

let busqueda = null;

var seleccionoTodo = 0;
var selecciones = [];
var totalRegistros = 0;

var tblCuentas = $('#tabla').DataTable({
	fixedColumns: true,
	serverSide: true,
	pageLength: 10,
	ajax: {
		url: rutaGeneral + "cargarDT",
		type: 'POST',
		data: function (d) {
			return $.extend(d, dataFiltro);
		},
	},
	order: [[0, 'ASC']],
	fixedColumns: true,
	buttons: buttonsDT(["copy", "excel", "pdf", "print"], [{
		className: 'btnImprimir',
		attr: { title: "Reimprimir Comandas", "data-toggle": "modal" },
		text: '<i class="fas fa-print"></i> <strong> Reimprimir Comandas</strong>'
	}]),
	columns: [
		{	
			orderable: false,
			visible: true,// cargarVisible,
			className: "Cargar",
			data: 'Id',
			className: "text-center",
			render: function(meta, type, data, meta){
				return `<div class="custom-control custom-checkbox">
							<input type="checkbox" class="custom-control-input checkColumn" id="checkColumn${data.Id}">
							<label class="custom-control-label checkColumn-custom-control-label" for="checkColumn${data.Id}"></label>
						</div>`;
			}
		}
		,{ data: 'Comanda' }
		,{ 
			data: 'Fecha_Consu',
			render: function(data) {
				return data ? moment(data).format('DD/MM/YYYY HH:mm') : '';
			}
		}
		,{ data: 'Cod_Producto' }
		,{ data: 'Nombre_Producto' }
		,{ data: 'Cantidad'}
		,{ data: 'Impresora'}
		,{ data: 'MesaId'}
		,{ 
			data: 'Almacen',
			className: 'almacen'
		}
		,{ data: 'AccionId'}
		,{ data: 'Barra' }
		,{ data: 'TerceroId' }
		,{ data: 'Nombre_Cliente' }
		,{ data: 'Cedula_Mesero' }
		,{ data: 'Mesero_Pedido' }
	],
	select: {
		style: 'multi',
		selector: '.checkColumn'
	},
	scrollX: '100%',
	scrollY: $(document).height() - 390,
	scroller: {
		loadingIndicator: true
	},
	scrollCollapse: false,
	dom: domBftri,
	createdRow: function(row,data,dataIndex){
		if ((seleccionoTodo == 1 && selecciones.findIndex(element => element.Id == data.Id) === -1) || (seleccionoTodo == 0 && selecciones.findIndex(element => element.Id == data.Id) !== -1)){
			tblCuentas.row(dataIndex).select();
			$(row).find(".checkColumn").prop("checked", true);
		}
	},
	drawCallback: function(settings){
		totalRegistros = settings.json.recordsTotal;

		if (totalRegistros <= 0){
			$("#checkAll").prop("disabled", true);
		} else {
			$("#checkAll").prop("disabled", false);
		}
	},
}).on('select', function ( e, dt, type, indexes ) {
	let rowData = dt.rows( indexes ).data().toArray()[0];

	if (seleccionoTodo == 0){
		
		agregarRegistro(rowData);
		if(totalRegistros == selecciones.length){
			seleccionoTodo = 1;
			$("#checkAll").prop("indeterminate", false).prop("checked", true);
			selecciones = [];
		} else if(selecciones.length > 0){
			$("#checkAll").prop("indeterminate", true);
		}
	} else {
		eliminarRegistro(rowData);
		if(selecciones.length == 0){
			$("#checkAll").prop("indeterminate", false).prop("checked", true);
		}
	}
}).on('deselect', function ( e, dt, type, indexes ) {
	let rowData = dt.rows( indexes ).data().toArray()[0];
	if (seleccionoTodo == 0){
		eliminarRegistro(rowData);
		if(selecciones.length <= 0){
			$("#checkAll").prop("indeterminate", false).prop("checked", false);
			$(".btnImprimir, #btnCargarNocheFecha, #btnCargarNoche").prop("disabled", true);
			$('input[name="Padicional"]').val('0.00');
		}
	} else {
		agregarRegistro(rowData);

		$("#checkAll").prop("indeterminate", true);
		
		if(totalRegistros == selecciones.length){
			seleccionoTodo = 0;
			$("#checkAll").prop("indeterminate", false).prop("checked", false);
			$(".btnImprimir").prop("disabled", true);
			selecciones = [];
		}
	}
});

function totalFiltro({ total, totalGeneral }) {
	$("#totalFiltro").val('$ ' + addCommas(total, 2));
	$("#totalGeneral").val('$ ' + addCommas(totalGeneral, 2));
}

function agregarRegistro(data){
	if(!selecciones.some(it => it.Id == data.Id)){
		selecciones.push(data);
	}
}

function eliminarRegistro(data){
	index = selecciones.findIndex(element => element.Id == data.Id);
	if (index !== -1) {
		selecciones.splice(index, 1);
	}
}

$(function () {
	RastreoIngresoModulo('Administrador de Comandas');
	$("#fechaInicial, #fechaFinal").val(moment().format('YYYY-MM-DD'));
	$(".chosen-select").chosen({ width: '100%' });

	$("#formFiltro").submit(function (e) {
		e.preventDefault();
		dataFiltro.fechaInicial = $("#fechaInicial").val();
		dataFiltro.fechaFinal = $("#fechaFinal").val();
		dataFiltro.vendedores = $("#vendedores").val(),
		dataFiltro.almacenes = $("#almacenes").val(),
		tblCuentas.ajax.reload();
	});

	/*$(".chosen-select").change(function (e) {
		let id = $(this).attr('id');
		let data = dataFiltro[id];
		let entrada = $(this).val().filter(x => !data.includes(x));
		if (entrada.length == 1 && entrada[0] == "") {
			$(this).val([""]);
			dataFiltro[id] = [];
		} else {
			$(this).val($(this).val().filter(it => it != ''));
			dataFiltro[id] = $(this).val();
		}
		$(this).trigger('chosen:updated');
	});*/

	$(".FiltrosSelec").change(function (e, el) {
		e.preventDefault();
		let values = ['-1'];
		if (el.selected != -1) {
			values = $(this).val().filter(x => x != '-1');
			if (values.length <= 0 || values.length >= ($(this).find("option").length - 1)) values = ['-1'];
		}

		// //Esto solo lo hace para el select para tipo evento
		// if ($(this).attr("id") == 'tipoEvento' && el.deselected != '-1') {
		// 	// cambioProductosServicios(values);
		// }
		$(this).val(values).trigger("chosen:updated");
	});

	//Se deshabilitan las fecha para no colocar rango erroneos
	$("#fechaInicial").on("dp.change", function (e) {
		$('#fechaFinal').data("DateTimePicker").minDate(e.date);
	});
	$("#fechaFinal").on("dp.change", function (e) {
		$('#fechaInicial').data("DateTimePicker").maxDate(e.date);
	});

	$(document).on("change", "#checkAll", function(){
		if($(this).is(":checked")){
			seleccionoTodo = 1;
			$("#checkAll").prop("indeterminate", false)
			$(".checkColumn").prop("checked", true);
			tblCuentas.rows().select();
		} else{
			seleccionoTodo = 0;
			$("#checkAll").prop("indeterminate", false)
			$(".checkColumn").prop("checked", false);
			tblCuentas.rows().deselect();
		}
		selecciones = [];
	});

});

$(document).on("click", ".btnImprimir", function (event) {
	event.preventDefault();
	if ((selecciones.length > 0 && seleccionoTodo == 0) || seleccionoTodo == 1) {
		alertify.confirm(
			'Reimprimir Comandas', 
			'¿Esta seguro de reimprimir las comandas seleccionadas?', 
			function(){ 
				$.ajax({
					url: rutaGeneral  + 'reImprimirComandas',
					type:'POST',
					dataType: 'json',
					async: false,
					data: {
						seleccionoTodo,
						busqueda,
						dataFiltro,
						Comandas: selecciones,
						RASTREO: RASTREO('', 'Reimprimir Comandas')
					},
					success: function(res){
						if(res.success == true){
							selecciones = [];
							seleccionoTodo = 0;
							tblCuentas.ajax.reload();
							$("#checkAll").prop("indeterminate", false).prop("checked", false);
							$(".btnImprimir").prop("disabled", true);
							if(res.msj != ''){
								$(".btnImprimir").prop("disabled", false);
								alertify.alert('Advertencia', res.msj, function(){});
							} else {
								$(".btnImprimir").prop("disabled", false);
								alertify.success("Se han cargado todas las comandas correctamente");
							}
						} else {
							alertify.alert('Advertencia', res.msj, function(){});
						}
					}
				});
			}, 
			function(){}
		);
	}else{
		alertify.warning("Por favor seleccione una registro.");
	}
});
