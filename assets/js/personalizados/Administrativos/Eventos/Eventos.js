let rutaGeneral = 'Administrativos/Eventos/Eventos/';
let tablaEventos;

$(function () {
	RastreoIngresoModulo('Eventos');

	$(".card-evento").on('click', function () {
		if ($INGRESO == "1") {
			location.href = `${base_url()}Administrativos/Eventos/Eventos/IngresoEvento/0/${$(this).data('codigo')}/0/1`;
		} else {
			location.href = `${base_url()}Administrativos/Servicios/VistaGeneral?evento=${$(this).data('codigo')}`;
		}
	});

	//Buscador de Beneficiaros y Invitador
	$("#buscarEvento").on("keyup", function(){
		var rex = new RegExp($(this).val(), 'i');

		$("#contenedor .items").addClass("d-none");

		$("#contenedor .items").filter(function(){
			return rex.test($(this).find(".card-text").text());
		}).removeClass("d-none");

		if ($("#contenedor .items:not(.d-none)").length <= 0) {
			$("#noDisponible").removeClass("d-none");
		} else {
			$("#noDisponible").addClass("d-none");
		}
	});

	$("#buscarEvento").trigger("focus");
});

/*accionBotones = function (row) {
	$(row).on("click", ".edievento", function (e) {
		e.preventDefault();
		let data = $.Encriptar($(this).data('evento'));
		obtenerevento(data, 'edicionevento');
	});

	$(row).on("click", ".elievento", function (e) {
		e.preventDefault();
		let data = $(this).data('evento');
		alertify.confirm('Eliminar', '¿Desea eliminar esta evento?', function (ok) {
			data = $.Encriptar(data);
			$.ajax({
				url: base_url() + rutaGeneral + 'eliminarevento',
				type: 'POST',
				dataType: 'json',
				data: {
					encriptado: data
				},
				success: (resp) => {
					resp = JSON.parse($.Desencriptar(resp));
					let metodo = (!resp.valido ? 'error' : 'success');
					alertify[metodo](resp.mensaje);
					if (resp.valido) {
						obtenereventos();
					}
				},
				error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
			});
		}, function (err) {
			console.log("Error ", err);
		});
	});

	$(row).on("click", ".verEvento", function (e) {
		e.preventDefault();
		let data = $.Encriptar($(this).data('evento'));
		obtenerevento(data, 'verPrev', true);
	});

}

configurarTabla = function () {
	return $('#tablaEventos').DataTable({
		language: $.Constantes.lenguajeTabla,
		processing: true,
		pageLength: 10,
		order: [],
		dom: 'Bfrtp',
		autoWidth: false,
		buttons: [
			{ extend: 'copy', className: 'copyButton', text: 'Copiar', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'csv', className: 'csvButton', text: 'CSV', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'excel', action: newExportAction, text: 'Excel', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'pdf', className: 'pdfButton', tex: 'PDF', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: { columns: ':not(:first-child)', title: 'Web_Club' } }
		],
		columnDefs: [{
			targets: 0, visible: false
		}],
		createdRow: function (row, data, dataIndex) {
			$(row).children().last().css('text-align', 'center');
			accionBotones(row);
		}
	});
}

obtenerEventos = function () {
	$.ajax({
		url: base_url() + rutaGeneral + 'obtenerEventos',
		type: 'GET',
		cache: false,
		dataType: 'json',
		success: (resp) => {
			tablaeventos.clear().draw();
			resp = JSON.parse($resp);
				let filas = [];
				$.each(resp.datos, function (pos, evento) {
					let ver = `
						<button class="edievento btn btn-primary btn-xs" data-evento="${evento.Id}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
						<button class="elievento btn btn-danger btn-xs" data-evento='${JSON.stringify({ 'Id': evento.Id, 'eventoId': evento.Codigo })}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
						<button class="verevento btn btn-success btn-xs" data-evento='${evento.Id}' title="Ver" style="margin-bottom:3px"><i class="fas fa-eye"></i></button>
					`;
					let valores = {};
					cabecera.forEach((item, pos) => {
						if (item == "Estado") {
							valores[pos] = evento[item] == 'A' ? 'Activado' : 'Inactivo';
						} else {
							valores[pos] = evento[item] ? evento[item] : '';
						}
					});
					valores[cabecera.length - 1] = ver;
					filas.push(valores);
				});
				tablaeventos.rows.add(filas).draw();
				tablaeventos.order([1, 'asc']).draw();
		},
		error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
	});
}

obtenerEvento = function (data, funcion, id) {
	$.ajax({
		url: base_url() + rutaGeneral + 'datosEventos' + (id ? '?ver=' + id : ''),
		type: 'POST',
		dataType: 'json',
		data: {
			encriptado: data
		},
		cache: false,
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (!resp.valido) {
				alertify.error(resp.mensaje);
			} else {
				this[funcion](resp);
			}
		},
		error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
	});
}

$("#numeroAccion").change(function () {
	buscarDatosTercero($(this).val());
});

$("#btnBuscarTercero").click(function () {
	buscarDatosTercero($("#numeroAccion").val());
});

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
}*/

