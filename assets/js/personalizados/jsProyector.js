let codeBase64 = 'data:image/jpeg;base64,';
let coloresMesa = {
	Blanco: { color: '#ffffff', titulo: 'Libre' },
	Rojo: { color: '#dc3545', titulo: 'Producto retrasado' },
	Amarillo: { color: '#ffc107', titulo: 'Proximo a cumplir tiempo del producto' },
	Verde: { color: '#198754', titulo: 'Ocupada' },
	Azul: { color: '#4680ff', titulo: 'Reserva' },
	AzulSinConsumo: { color: '#00bcd4', titulo: 'Reserva en la mesa sin consumo' },
	mesaModificada: { color: '#2ce0d8', titulo: 'Nuevo Pedido' },
	CuentaPendiente: { color: '#f5ff00', titulo: 'Cuenta Pendiente' },
	ProdsPendientes: { color: '#ffa0a0', titulo: 'Productos Pendientes' },
}
$(function () {
	let count = 0;
    const interval = window.setInterval(() => {
      count++;
      if (count >= 1) {
        cargarPlano();
      }
    }, 30000);

	if($INFOALMACEN.length){
		if($INFOALMACEN.length == 1){
			$('#almacenid').val($INFOALMACEN[0].AlmacenId);
			setTimeout(function () {
				$('#almacenid').change();
			}, 500);
		}else{
			$('.divAlmacen').removeClass('hide');
		}
	}
	$(document).on('change', "#almacenid", function () {
		let data = {
			almacenid: $(this).val()
		}
		$("#tabla").css('display', "none");
		$('#zonaid').html('');
		$('.divZona').addClass('hide');
		$('.divMesa').empty();
		$('.contenedor-imagen-mesas').css('background-image', "unset");
		obtenerInformacion(data,'obtenerZonas','zonas')
	});
});

$(document).on('change', "#zonaid", function () {
	$('.divMesa').empty();
	$('.contenedor-imagen-mesas').css('background-image', "unset");
	$("#tabla").css('display', "none");
	cargarPlano();
});

function cargarPlano(){

	if ($('#zonaid').val() && $('#zonaid').val() != '') {
		let data = {
			zona: $('#zonaid').val(),
			fechaInicio: moment().startOf('day').format('DD-MM-YYYY HH:mm:ss'),
			fechaFin: moment().add(1, 'days').startOf('day').format('DD-MM-YYYY HH:mm:ss'),
			fechaActual: moment().format('YYYY-MM-DD HH:mm:ss')
		};			
		zonaMesaActual = $ZONAS.find(it => it['ZonaId'] == data.zona);
		obtenerInformacion(data, 'obtenerMesas', 'agregarMesas');
		$("#tabla").css('display', "unset");
	} else {
		$('.divMesa').empty();
		$('.contenedor-imagen-mesas').css('background-image', "unset");
		
	}
}

function agregarMesas({datos}) {


	$('.contenedor-imagen-mesas').css('background-image', ("url('" + codeBase64 + zonaMesaActual.Imagen + "')"));
	$('.divMesa').empty();
	mesasPlano = datos;
	datos.forEach(element => {
		$(".divMesa").append(`
			<div class="mesaId mesaPopo${element.MesaId}" style="
				color: ${element['ColorMesa'] == 'Verde' || element['ColorMesa'] == 'Rojo' || element['ColorMesa'] == 'Azul' ? '#ffffff' : '#000000'};
				border-radius: 5px;
				text-align: center;
				background-color: ${coloresMesa[element['ColorMesa']].color};
				position:absolute;
				font-size: 13px;
				white-space: nowrap;
				font-weight: 800;
				user-select: none;
				left:${element.PosX - (element.Ancho / 2)}px;
				top:${element.PosY - (element.Alto / 2)}px;
				height: ${element.Alto}px;
				width: ${element.Ancho}px;"
				data-mesa="${element.MesaId}"
				data-ocupada="${element.Consumo}"
				data-personas="${element['MaximoPersonas']}"
				tabindex="0" role="button" title="Detalle Mesa" data-trigger="focus" data-content="${element['MaximoPersonas'] ? `Maximo ${element['MaximoPersonas']} personas` : 'No tiene cantidad de personas registradas'}">
				${element.MesaId}
			</div>
		`);

	});
	
}
function obtenerInformacion(data, metodoBack, funcion) {
	data = $.Encriptar(data);
	$.ajax({
		url: rutaGeneral + metodoBack,
		type: 'POST',
		data: {
			encriptado: data,
		},
		dataType: "json",
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (resp.valido && funcion) {
				this[funcion](resp);
			} else if (!resp.valido) {
				alertify.error(resp.mensaje);
				if (metodoBack == 'obtenerMesas') {
					$('.contenedor-imagen-mesas').css('background-image', 'none');
					$('.divMesa').html('<strong>La zona no tiene plano configurado...</strong>');
				}
			}
		}
	});
}

function zonas(datos){
	$ZONAS = datos.datos;
	$('#zonaid').html('');
	let option = '<option value="">Selecciona zona</option>';
	for (i=0; i < $ZONAS.length; i++) {
		option += `<option value="${$ZONAS[i].ZonaId}">${$ZONAS[i].Nombre}</option>`;
	}
	$("#zonaid").append(option);
	if ($ZONAS.length){
		if ($ZONAS.length == 1){
			$('#zonaid').val($ZONAS[0].ZonaId);
			$('#zonaid').change().trigger("chosen:updated");
		}else{
			$('.divZona').removeClass('hide');
			$('#zonaid').val($ZonaMesaId).trigger("chosen:updated");
			$('#zonaid').change();
		}
	}
	
}
$('.chos-unit select[unitario]').chosen({
	placeholder_text_single: 'Seleccione Opción'
	, width: '100%'
	, no_results_text: 'Ooops, no se encuentra'
	, allow_single_deselected: true
});


