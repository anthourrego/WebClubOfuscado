let rutaGeneral = base_url() + 'Administrativos/Recepcion/OcupacionActualClub/';
let dataFiltro = {};
let Tipo = '';
let Grafico = '';

var tablaInforme = dtSS({
	data: {
		tblID: "#tabla",
	},
	ajax: {
		url: rutaGeneral + "DTOcupacionActualClub",
		type: "POST",
		data: function (d) {
			return $.extend(d, { Tipo });
		},
	},
	columns: [
		{data: "Accion"},
		{data: "Codigo_Barra"},
		{
			data: "Ingreso",
			render: function(data, type, row, meta ) {
				return data ? moment(data, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD hh:mm:ss A") : '';
			}
		},
		{
			data: "Salida",visible:false,
			render: function(data, type, row, meta ) {
				return data ? moment(data, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD hh:mm:ss A") : '';
			}
		},
		{data: "Nro_Documento"},
		{data: "Nombre"},
		{data: "Placa"},
		{data: "Sede"},
		{data: "Codigo_Carnet"},
		{data: "Club_Origen"},
		{data: "Evento"},
		{data: "Tipo_Invitado"},
		{data: "Ingreso_Especial"},
		{data: "Tipo"},
		{data: "Codigo_Barras_Titular",visible:false},
		{data: "ID_Titular",visible:false},
		{data: "Nombre_del_Titular",visible:false},
		{data: "Reserva_Hotel"},
		{data: "Usuario",visible:false},
	],
	order: [[3, 'DESC']],
	pageLength: 10,
	scrollX: true,
	buttons: [
		{ extend: 'copy', className: 'copyButton', text: 'Copiar', title: 'Ocupación Actual Club' },
		{ extend: 'csv', className: 'csvButton', text: 'CSV', title: 'Ocupación Actual Club' },
		{ extend: 'excel', action: newExportAction, text: 'Excel', title: 'Ocupación Actual Club' },
		{ extend: 'pdf', className: 'pdfButton', tex: 'PDF', title: 'Ocupación Actual Club' },
		{ extend: 'print', className: 'printButton', text: 'Imprimir', title: 'Ocupación Actual Club' },
	],
	dom: domlBftrip,
});

$(function () {
	RastreoIngresoModulo('Ocupación Actual Club');
	if($OcupacionActual.length > 0){
		Tipo = $OcupacionActual[0].Tipo;
		mostrarTipoIngresos($OcupacionActual[0].Tipo)
	}
	$('.tipo-card-container').on('click', function () {
		Tipo = $(this).attr('tipo');
		mostrarTipoIngresos(Tipo);
	});

	$('.tipo-card-grafica').on('click', function (e) {
		$('#modalGraficar').modal('show');
		if(Grafico){
			Grafico.destroy();
		}
		graficar('bar',$OcupacionActual)
	});

	$(".selectorGrafica").change(function () {
		Grafico.destroy();
		graficar($(this).val(), $OcupacionActual);
	});

	$("#downloadCanvas").click(function () {
		var data =  document.getElementsByTagName('canvas')[0].toDataURL();
		const linkSource = `${data}`;
		const downloadLink = document.createElement("a");
		const fileName = 'Ocupación Actual Club.png';
		downloadLink.href = linkSource;
		downloadLink.download = fileName;
		downloadLink.click();
	});
});


function mostrarTipoIngresos(Tipos) {
	tablaInforme.column(0).visible(false); 
	tablaInforme.column(8).visible(false); 
	tablaInforme.column(9).visible(false); 
	tablaInforme.column(10).visible(false);
	tablaInforme.column(11).visible(false); 
	tablaInforme.column(12).visible(false); 
	tablaInforme.column(17).visible(false); 
	tablaInforme.column(14).visible(false);  
	tablaInforme.column(15).visible(false); 
	tablaInforme.column(16).visible(false); 

	switch (Tipos) {

		case 'H':
			tablaInforme.column(17).visible(true); 
		break;
		case 'C':
			tablaInforme.column(9).visible(true); 
		break;
		case 'E':
			tablaInforme.column(12).visible(true); 
		break;
		case 'I':
			tablaInforme.column(8).visible(true); 
			tablaInforme.column(11).visible(true);
			tablaInforme.column(14).visible(true);  
			tablaInforme.column(15).visible(true); 
			tablaInforme.column(16).visible(true); 
		break;
		case 'T':
			tablaInforme.column(0).visible(false); 
		break;
		
		default:
			tablaInforme.column(0).visible(true); 
		break;
		
	}

	colorAntes = $(".tipo-seleccionado").attr('color');
	$(".tipo-seleccionado .card-full ").css({'border':'1px solid #ccc','border-right':'15px solid ' + colorAntes,'box-shadow':'none'});
	$('.tipo-seleccionado').removeClass('tipo-seleccionado');
	$("[tipo='"+Tipos+"'").addClass('tipo-seleccionado');
	color = $("[tipo='"+Tipos+"'").attr('color');
	$(".tipo-seleccionado .card-full ").css({'border':'3px solid ' + color,'border-right':'15px solid ' + color,'box-shadow': '0px 0px 8px 0px ' + color});
	tablaInforme.ajax.reload();
}


//Esta función me permite hacer las graficas
function graficar(tipo, vector) {
	var vLabel = [];
	var vData  = [];
	var vColor = [];

	for (var i = 0; i < vector.length; i++) {
		// if (i > 9)
		// 	break;
		vLabel.push(vector[i]['TipoNombre']);
		vData.push(vector[i]['Cantidad']);
		vColor.push(vector[i]['Color']);
	}

	const options =  {
		plugins: {
		  datalabels: {
			display: true,
			color: 'black',
			anchor: 'end',
			align: 'end',
			clamp: true,
			// font: {
			//   size: 10,
			//   weight: 900
			// }
		  }
		},
		  scales: {
		  yAxes: [{
			gridLines : {
			  display : true,
			  fontSize:10
			},
			display : true,
			ticks: {
			  beginAtZero:true,
			  fontSize:10
			}
		  }],
		  xAxes: [{
			gridLines : {
			  display : true,
			  fontSize:10
			},
			display : true,
			ticks: {
			  beginAtZero:true,
			  fontSize:10
			}
		  }]
		}
	  };

	// const options = { 
	// 	tooltips: { 
	// 		enabled: true
	// 	}
	// };

	if (tipo != 'line' && tipo != 'radar') {
		Grafico = new Chart(document.getElementById('GraficarOcupacion'), {
			type: tipo,
			data: {
				labels: vLabel,
				datasets: [{
					label: 'Datos',
					data: vData,
					backgroundColor: vColor
				}]
			},
			options : options
			
		});
	} else {
		Grafico = new Chart(document.getElementById('GraficarOcupacion'), {
			type: tipo,
			options : options,
			data: {
				labels: vLabel,
				datasets: [{
					label: '',
					data: vData,
					options : options,
					fill: false,
					borderColor: 'gray',
					backgroundColor: 'transparent',
					pointBorderColor: 'gray',
					pointBackgroundColor: 'lightgray',
					pointRadius: 5,
					pointHoverRadius: 15,
					pointHitRadius: 30,
					pointBorderWidth: 2
				}]
			}
		});
	}
}



