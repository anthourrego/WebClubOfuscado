let rutaGeneral = base_url() + 'Administrativos/Servicios/InformeVendedorConsumo/';
let dataFiltro = {
	idUsuario: $USUARIO,
	vendedores: [],
	almacenes: [],
	gruposMenu: [],
	marcas: [],
	fechaInicial: moment().format('YYYY-MM-DD'),
	fechaFinal: moment().format('YYYY-MM-DD'),
	dias: '',
	consumosHotel: $("#consumosHotel").is(':checked')
};
let tblCuentas;
let tblDias;
let registroActual = {};
let columnasTblDia = [];
let totalesDiaGeneral = {};

function obtenerInformacion(data, metodoBack, funcion) {
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

function totalFiltro({ total, totalGeneral }) {
	$("#totalFiltro").val('$ ' + addCommas(total, 2));
	$("#totalGeneral").val('$ ' + addCommas(totalGeneral, 2));
}

function irModificarVendedor(vendedor) {
	alertify.confirm('Cambiar vendedor', '¿Esta seguro de modificar el vendedor?', function () {
		let data = {
			idEnFactura: registroActual.idEnFactura
			,vendedor
			,factura: registroActual.Factura.trim()
			,consumo: registroActual.Comanda
			,producto: registroActual.Cod_Producto
			,vendedorAntes: registroActual.vendedorid
			,ConsumoId: registroActual.ConsumoId
		};
		obtenerInformacion(data, 'modificarVendedorFactura', 'vendedirModificado')
	}, function () {
		registroActual = {};
	});
}

function vendedirModificado({ mensaje }) {
	alertify.success(mensaje);
	$("#ElegirVendedor").modal('hide');
	tblCuentas.ajax.reload();
}

function tabla() {
	tblCuentas = $('#tabla').DataTable({
		dom: domBftrip,
		fixedColumns: true,
		serverSide: true,
		scrollX: true,
		pageLength: 10,
		ajax: {
			url: rutaGeneral + "cargarDT",
			type: 'POST',
			data: function (d) {
				return $.extend(d, dataFiltro);
			},
		},
		order: [],
		buttons: buttonsDT(['copy', 'excel', 'pdf', 'print', 'pageLength']),
		columns: [
			{ 
				className: 'acciones text-center', 
				visible: $PerVendEditar, 
				orderable: false,
				data: null,
				defaultContent: `<button class="btn btn-primary btn-xs" title="Cambio Vendedor">
						<i class="fas fa-pencil-alt"></i>
				</button>`
			}
			,{ data: 'Comanda' }
			,{ data: 'Barra' }
			,{ data: 'Cod_Cliente' }
			,{ data: 'Nombre_Cliente' }
			,{ data: 'Cedula_Mesero' }
			,{ data: 'Mesero_Pedido' }
			,{ data: 'Cod_Producto' }
			,{ data: 'Nombre_Producto' }
			,{ 
				data: 'Cant_Consu', 
				render: function(data, type, row, meta) {
					return (+data | 0).toFixed(+row.DecimalesCant);
				}
			}
			,{ 
				data: 'Fecha_Consu',
				render: function(data) {
					return data ? moment(data).format('DD/MM/YYYY HH:mm') : '';
				}
			}
			,{ 
				data: 'Almacen',
				className: 'almacen'
			}
			,{ 
				data: 'Fecha_Factura',
				render: function(data) {
					return data ? moment(data).format('DD/MM/YYYY') : '';
				}
			}
			,{ data: 'Factura' }
			,{ data: 'Nombre_Habitacion' }
			,{ data: 'Dia' }
			,{ 
				data: 'ImpoConsumo',
				className: 'text-right',
				render: function(data) {
					return '$' + addCommas(data, 2);
				}
			}
			,{ 
				data: 'Valor_Iva', 
				className: 'text-right',
				render: function(data) {
					return '$' + addCommas(data, 2);
				} 
			}
			,{ data: 'Tipo_Devo' }
			,{ 
				data: 'Subtotal', 
				className: 'text-right',
				render: function(data) {
					return '$' + addCommas(data, 2);
				} 
			}
			,{ 
				data: 'Valor_Total', 
				className: 'text-right',
				render: function(data) {
					return '$' + addCommas(data, 2);
				} 
			}
		],
		createdRow: function (row, data, dataIndex) {
			$(row).on('click', '.acciones button', function (e) {
				e.preventDefault();
				registroActual = data;
				$(`div[data-vendedor]`).removeClass('card-vendedor-seleccionado');
				$(`#vend${data.vendedorid}`).addClass('card-vendedor-seleccionado');
				$("#ElegirVendedor").modal('show');
			});
		},
	});
}

function tablaDia() {
	tblDias = $('#tablaDia').DataTable({
		dom: domBftr,
		fixedColumns: true,
		pageLength: 100,
		serverSide: false,
		searching: false,
		scrollX: true,
		ajax: {
			url: rutaGeneral + "cargarDTDia",
			type: 'POST',
			data: function (d) {
				return $.extend(d, dataFiltro);
			},
		},
		buttons: buttonsDT(['copy', 'excel', 'pdf', 'print']),
		columns: columnasTblDia,
		initComplete: function () {
			$('div#tablaDia_filter input').unbind();
			$('div#tablaDia_filter input').keyup(function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find('#tablaDia').dataTable();
				}
			}).change(function (e) {
				e.preventDefault();
				table = $("body").find('#tablaDia').dataTable();
				table.fnFilter(this.value);
			});
			$('div#tablaDia_filter input').focus();
			$('div#tablaDia_paginate').css(
				"margin-bottom", "5px"
			);
			let data = {};
			Object.entries(totalesDiaGeneral).forEach(op => {
				data[op[0]] = op[1];
			});
			data['Vendedor'] = '<b>Total Antes de Impuesto</b>';
			data['Total_Antes_De_Impuesto'] = 0;
			data['Total_General'] = 0;
			tblDias.row.add(data).draw();
			Object.entries(totalesDiaGeneral).forEach(op => {
				$('.' + op[0]).last().addClass('font-weight-bold');
			});
		},
		createdRow: function (row, data, dataIndex) {
			let total = 0;
			let subTotal = 0;
			columnasTblDia.forEach(op => {
				if (op.data != 'Vendedor' && op.data != "Total_Antes_De_Impuesto" && op.data != "Total_General") {
					arrayTotal = data[op.data] == null ?  [0,0] : data[op.data].split("|"); 
					subTotal += parseFloat((+arrayTotal[0]));
					total += parseFloat((+arrayTotal[1]));
					$(row).find('.' + op.data).text('$' + addCommas(arrayTotal[0], 2));
					if (!totalesDiaGeneral[op.data]) {
						totalesDiaGeneral[op.data] = "0|0";
					}
					arrayTotalDiaGeneral = totalesDiaGeneral[op.data].split("|"); 
					totalesDiaGeneral[op.data] = (parseFloat(arrayTotalDiaGeneral[0]) + parseFloat((+arrayTotal[0])))+"|"+(parseFloat(arrayTotalDiaGeneral[1]) + parseFloat((+arrayTotal[1])));
				}
			});
			$(row).find('.Total_Antes_De_Impuesto').text('$' + addCommas(subTotal, 2));
			$(row).find('.Total_General').text('$' + addCommas(total, 2));
		},
	});
}

function obtenerDiasInforme() {
	obtenerInformacion(dataFiltro, 'diasFactura', 'diasInforme');
}

function diasInforme({ datos }) {
	totalesDiaGeneral = {};
	if (datos && datos.Dias) {
		columnasTblDia = [{ data: 'Vendedor' }];
		(datos.Dias.split(',') || []).forEach(it => {
			let col = it.replace('[', '').replace(']', '');
			columnasTblDia.push({ data: col, className: 'text-center ' + col });
		});
		columnasTblDia.push({ data: 'Total_Antes_De_Impuesto', className: 'text-center Total_Antes_De_Impuesto font-weight-bold' });
		columnasTblDia.push({ data: 'Total_General', className: 'text-center Total_General font-weight-bold' });
		dataFiltro.dias = datos.Dias;
		dataFiltro.diasFiltro = datos.Dias.split('[').join("'").split(']').join("'");
		if (tblDias) {
			tblDias.columns().clear();
			tblDias.destroy();
		}
		$('#cabeceraDia').html('');
		columnasTblDia.forEach(it => {
			if (it.data != 'Vendedor' && it.data != 'Total_Antes_De_Impuesto' && it.data != 'Total_General') {
				$('#cabeceraDia').append(`<th class="text-center font-weight-bold">${moment(it.data).format('MM-DD')}</th>`)
			} else {
				$('#cabeceraDia').append(`<th class="text-center font-weight-bold">${it.data.split('_').join(' ')}</th>`)
			}
		});
		tablaDia();
	} else {
		if (tblDias) {
			tblDias.columns().clear();
			tblDias.destroy();
			tblDias = null;
		}
		$('#cabeceraDia').html('');
		alertify.warning("No se encontraron resultados");
	}
}

function buscarVendedor(buscar = '') {
	var cont = 0;
	$("#buscarVendedor").val(buscar);
	$("#listaVendedores").children('div').removeClass('d-none');
	$("#listaVendedoresEmpty").hide();
	if (buscar == '') return;
	total = 0;
	$("#listaVendedores").children('div').filter(function (index, item) {
		total++;
		if ($(item).find('p').text().toLowerCase().includes(buscar.toLowerCase())) return true;
		$(item).addClass('d-none');
		cont++;
		return false;
	});
	if (cont == total) {
		$("#listaVendedoresEmpty").show();
	}
}

$(document).on('click', '#btnBuscarVendedor', function () {
	buscarVendedor($("#buscarVendedor").val());
});

$(document).on('keyup', '#buscarVendedor', function (e) {
	e.stopImmediatePropagation();
	buscarVendedor($(this).val());
});

$(document).on("click", ".nav-link", function () {
	if ($(this).data('tab') == 'general') {
		delete dataFiltro.length;
		delete dataFiltro.draw;
		// $(".foot-total").show();
		tblCuentas.ajax.reload();
		obtenerInformacion(dataFiltro, 'obtenerTotal', 'totalFiltro');
	} else {
		dataFiltro.length = -1;
		dataFiltro.draw = 0;
		// $(".foot-total").hide();
		obtenerDiasInforme();
	}
})

$(function () {
	RastreoIngresoModulo('Informe Vendedor Consumo');

	$("#fechaInicial, #fechaFinal").val(moment().format('YYYY-MM-DD'));

	$(".chosen-select").chosen({ width: '100%' });

	tabla();

	obtenerInformacion(dataFiltro, 'obtenerTotal', 'totalFiltro');

	$("#formFiltro").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			dataFiltro.fechaInicial = $("#fechaInicial").val();
			dataFiltro.fechaFinal = $("#fechaFinal").val();
			dataFiltro.almacenes = $("#almacenes").val().filter(x => x != '-1');
			dataFiltro.vendedores = $("#vendedores").val().filter(x => x != '-1');
			dataFiltro.marcas = $("#marcas").val().filter(x => x != '-1');
			let tab = $(".nav-link.active").data('tab');
			delete dataFiltro.length;
			delete dataFiltro.draw;
			dataFiltro.consumosHotel = $("#consumosHotel").is(':checked');
			if (tab == 'general') {
				tblCuentas.ajax.reload();
			} else {
				dataFiltro.length = -1;
				dataFiltro.draw = 0;
				obtenerDiasInforme();
			}
			obtenerInformacion(dataFiltro, 'obtenerTotal', 'totalFiltro');
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

	$("#btnCancelarVendedor").on('click', function () {
		$('.card-vendedor').removeClass('card-vendedor-seleccionado');
		registroActual = null;
		$("#ElegirVendedor").modal('hide');
	});

	$(".card-vendedor").on('click', function () {
		let idVendedor = $(this).data("vendedor");
		if (registroActual['vendedorid'] == idVendedor) {
			alertify.warning("Este es el vendedor actual de la comanda.");
			return;
		}
		irModificarVendedor(idVendedor);
	});

	//Se deshabilitan las fecha para no colocar rango erroneos
	$("#fechaInicial").on("dp.change", function (e) {
		var fecha = (e.date._i != undefined) ? e.date : 0;
		$('#fechaFinal').data("DateTimePicker").minDate(fecha);
	});
	$("#fechaFinal").on("dp.change", function (e) {
		var fecha = (e.date._i != undefined) ? e.date : moment().format('YYYY-MM-DD');
		$('#fechaInicial').data("DateTimePicker").maxDate(fecha);
	});

	$("#fechaFinal").data("DateTimePicker").maxDate(moment().format('YYYY-MM-DD'));
});