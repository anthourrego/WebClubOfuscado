let rutaGeneral = base_url() + 'Administrativos/Servicios/ProductosEliminados/';
let tblInformeProd;
let dataFiltro = {
	almacenConsumo: [],
	almacenDescargue: [],
	tipoDevo: [],
	usuario: [],
	fechaIniConsumo: moment().format('YYYY-MM-DD'),
	fechaFinConsumo: moment().format('YYYY-MM-DD')
};

function Tabla() {
	tblInformeProd = $('#tablaProd').DataTable({
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
		order: [],
		buttons: buttonsDT(["copy", "excel", "pdf", "print", "pageLength"]),
		columns: [
			{ data: 'ConsumoId' }
			,{ 
				data: 'FechaConsu',
				render: function(data) {
					return data ? moment(data).format('DD/MM/YYYY HH:mm') : '';
				}
			}
			,{ data: 'AccionId' }
			,{ data: 'TerceroId' }
			,{ data: 'Barra' }  
			,{ data: 'NombreTer' }
			,{ data: 'MesaId' }
			,{ data: 'NombreAlmacenP' }
			,{ data: 'NombreAlmacenC' }
			,{ data: 'NombreVendedor' }
			,{ data: 'ProductoId' }
			,{ data: 'NombreProducto' }
			,{ data: 'Cantidad' }
			,{ 
				data: 'Valor',
				className: "text-right" ,
				render: function(data, type, row, meta) {
					return '$' + addCommas((data <= 0 ? '0.00' : data));
				} 
			}
			,{ 
				data: 'FechaRetiro',
				render: function(data) {
					return data ? moment(data).format('DD/MM/YYYY HH:mm') : '';
				} 
			}
			,{ 
				data: 'TiempoEliminacion',
				render: function(data) {
					return data ? segundosDias(data) : '';
				} 
			}
			,{ data: 'NombreDev' }
			,{ 
				data: 'ObservacioDevol', 
				className: "showObserv"
			}
			,{ data: 'UsuarioApruebaN' } 
		],
		createdRow: function(row, data, dataIndex){
			if (data['ObservacioDevol'].length > 0) {
				text = "";
				text = data['ObservacioDevol'].slice(0, 60) + (data['ObservacioDevol'].length > 60 ? "..." : "");
				$(row).find(".showObserv").html(`<div title="${text}">${text}</div>`);
			}

			$(row).find(".showObserv").on("click", () => {
				if (data['ObservacioDevol'].length > 60) {
					$(".txtObservacion").text(data['ObservacioDevol']);
					$("#mModalObservacion").modal("show");
				} 
			});
		}
	});
};

function segundosDias(Tiempo){
	var seconds = parseInt(Tiempo, 10);
	var days = Math.floor(seconds / (3600 * 24));
	seconds -= days * 3600 * 24;
	var hrs = Math.floor(seconds / 3600);
	seconds -= hrs*3600;
	var mnts = Math.floor(seconds / 60);
	seconds -= mnts*60;

	if(days > 0){
		if(days > 99)
			return (addCommas(days) + ':' + ('0' + hrs).slice(-2) + ':' + ('0' + mnts).slice(-2) + ':' + ('0' + seconds).slice(-2));
		else
			return (('0' + days).slice(-2) + ':' + ('0' + hrs).slice(-2) + ':' + ('0' + mnts).slice(-2) + ':' + ('0' + seconds).slice(-2));
	}else if(hrs > 0){
		return (('0' + hrs).slice(-2) + ':' + ('0' + mnts).slice(-2) + ':' + ('0' + seconds).slice(-2));
	}else{
		return (('0' + mnts).slice(-2) + ':' + ('0' + seconds).slice(-2));
	}
}

$(function () {
	RastreoIngresoModulo('Productos Eliminados');

	$(".chosen-select").chosen({ width: '100%' });

	Tabla();
	   
	$(".FiltrosSelec").change(function (e, el) {
		e.preventDefault();
		let values = ['-1'];
		if (el.selected != -1) {
			values = $(this).val().filter(x => x != '-1');
			if (values.length <= 0 || values.length >= ($(this).find("option").length - 1)) values = ['-1'];
		}

		$(this).val(values).trigger("chosen:updated");
	});

  //Se deshabilitan las fecha para no colocar rango erroneos
	$("#fechaIniConsumo").on("dp.change", function (e) {
		var fecha = (e.date._i != undefined) ? e.date : 0;
		$('#fechaFinConsumo').data("DateTimePicker").minDate(fecha);
	});
	$("#fechaFinConsumo").on("dp.change", function (e) {
		var fecha = (e.date._i != undefined) ? e.date : moment().format('YYYY-MM-DD');
		$('#fechaIniConsumo').data("DateTimePicker").maxDate(fecha);
	});
	
	//Se cooloca la fecha maxima para la fina fin del consumo
	$("#fechaFinConsumo").data("DateTimePicker").maxDate(moment().format('YYYY-MM-DD'));

	$("#fechaIniConsumo, #fechaFinConsumo").val(moment().format('YYYY-MM-DD')).change();

	$("#formFiltro").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			dataFiltro.fechaIniConsumo = $("#fechaIniConsumo").val();
			dataFiltro.fechaFinConsumo = $("#fechaFinConsumo").val();
			dataFiltro.almacenConsumo = $("#almacenConsumo").val().filter(x => x != '-1');
			dataFiltro.almacenDescargue = $("#almacenDescargue").val().filter(x => x != '-1');
			dataFiltro.tipoDevo = $("#tipoDevo").val().filter(x => x != '-1');
			dataFiltro.usuario = $("#usuario").val().filter(x => x != '-1');
			tblInformeProd.ajax.reload();
		}
	});


});