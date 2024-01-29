let cabecera = ['Acciones', 'CierreClubId', 'Fecha', 'Motivo', 'Sede', 'Estado'];
let rutaGeneral = 'Administrativos/CierreClub/';
let editarCierre = 0;
let tablaCierreClub;

$(function () {

	RastreoIngresoModulo('Cierre Club');

	$('input[name=Estado]').prop('checked', true);

	$("#Motivo").change(function () {
		$(this).css("height", "auto");
		$(this).css("height", $(this)[0].scrollHeight + "px");
	});

	initActions();
});

initActions = function () {

	$.each(cabecera, (pos, cab) => {
		$('#cabecera').append(`<th class="text-center">${cab}</th>`)
	});

	$("#formularioCrearCierreClub").submit(function (event) {
		event.preventDefault();
		if ($("#formularioCrearCierreClub").valid()) {
			let $fills = $("#formularioCrearCierreClub input, #formularioCrearCierreClub select, #formularioCrearCierreClub textarea");
			let data = {};
			$.each($fills, (pos, input) => {
				let value = $(input).val();
				const name = $(input).attr("name");
				if (name == "Estado") {
					value = $(input).prop('checked') ? 'A' : 'I';
				}
				data[name] = value;
			});
			data = { ...data, editarCierre };
			data = $.Encriptar(data);
			$.ajax({
				url: base_url() + rutaGeneral + 'crearCierre',
				type: 'POST',
				data: {
					encriptado: data
				},
				dataType: "json",
				success: (resp) => {
					resp = JSON.parse($.Desencriptar(resp));
					if (resp.valido) {
						let idInsertado = resp.idInsertado;
						limpiarDatos();
						configurarTabla();
						$('#modalCrearCierre').modal('hide');
						alertify.success(resp.mensaje);
						$('#btnCrearCierre').text('Crear');
					} else {
						alertify.error(resp.mensaje);
					}
				}
			});
		} else {
			alertify.error("Validar los valores de los campos.");
		}
	});

	configurarTabla();

	$("#cerrarModalCrearCierre").click(function () {
		limpiarDatos();
	});

}

configurarTabla = function () {
	if (tablaCierreClub) {
        tablaCierreClub.destroy();
    }
    tablaCierreClub = {
		data: {
            tblID: "#tablaCierre",
            select: [
                "a.CierreClubId"
                , "a.Fecha"
                , "a.Motivo"
                , "s.Nombre as Sede"
                , "CASE a.Estado WHEN 'A' THEN 'Activo' WHEN 'I' THEN 'Inactivo' END as Estado"
                , "'' AS Acciones"
            ],
            table: [
                'APPClubCierreClub a',
                [
					["Sede s", "s.SedeId = a.SedeId", "LEFT"]
				], []
            ],
            column_order: ["Acciones", "CierreClubId", "Fecha", "Motivo", "Sede", "Estado"],
            column_search: ['s.Nombre', 'a.Motivo', 'a.Fecha'],
            columnas: cabecera,
            orden: {
                'Estado': 'ASC'
                , 'Sede': 'ASC'
                , 'Motivo': 'ASC'
                , 'Fecha': 'ASC'
                , 'Acciones': 'ASC'
            },
        },
		language: $.Constantes.lenguajeTabla,
		processing: true,
		pageLength: 10,
		serverside: true,
		order: [],
		dom: 'Bfrtp',
		buttons: [
			{ extend: 'copy', className: 'copyButton', text: 'Copiar', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'csv', className: 'csvButton', text: 'CSV', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'excel', action: newExportAction, text: 'Excel', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'pdf', className: 'pdfButton', tex: 'PDF', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: { columns: ':not(:first-child)', title: 'Web_Club' } }
		],
		columnDefs: [{
			targets: [1], visible:false
		}],
		createdRow: function (row, data, dataIndex) {
			let ver = `
				<button class="ediCierre btn btn-primary btn-xs" data-cierre="${data[1]}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
				<button class="eliCierre btn btn-danger btn-xs" data-cierre='${data[1]}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
            `;
            $(row).find('td:eq(2)').html("<div class='motivo'>" + data[3] + "</div>");
            $(row).find('td:eq(0)').html(ver).addClass('text-center');
			accionBotones(row);
		},
		initComplete: function(){
			$('div.dataTables_filter input').unbind();
			$("div.dataTables_filter input").keyup( function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find("#tablaCierre").dataTable();
					table.fnFilter( this.value );
				}
			} );
			$('div.dataTables_filter input').focus();
		},
	};
    tablaCierreClub = dtSS(tablaCierreClub);
}

accionBotones = function (row) {
	$(row).on("click", ".ediCierre", function (e) {
		e.preventDefault();
		let data = $.Encriptar($(this).data('cierre'));
		obtenerCierre(data, 'edicionCierre');
	});

	$(row).on("click", ".eliCierre", function (e) {
		e.preventDefault();
		let data = $(this).data('cierre');
		alertify.confirm('Eliminar', '¿Desea eliminar este cierre?', function (ok) {
			data = $.Encriptar(data);
			$.ajax({
				url: base_url() + rutaGeneral + 'eliminarCierre',
				type: 'POST',
				data: {
					encriptado: data
				},
				dataType: "json",
				success: (resp) => {
					resp = JSON.parse($.Desencriptar(resp));
					let metodo = (!resp.valido ? 'error' : 'success');
					alertify[metodo](resp.mensaje);
					if (resp.valido) {
						configurarTabla();
					}
				},
				error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
			});
		}, function (err) {
			console.log("Error ", err);
		});
	});
}

obtenerCierre = function (data, funcion) {
	$.ajax({
		url: base_url() + rutaGeneral + 'obtenerCierre',
		type: 'POST',
		data: {
			encriptado: data
		},
		cache: false,
		dataType: "json",
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

edicionCierre = function (resp) {
	editarCierre = resp.datos[0]['CierreClubId'];
	$('#btnCrearCierre').text('Modificar');
	Object.keys(resp.datos[0]).forEach(item => {
		$('#' + item).val(resp.datos[0][item]);
		if (item == "Estado") {
			$('#' + item).prop('checked', (resp.datos[0][item] == 'A' ? true : false));
		}
	});
	$('#modalCrearCierre').modal('show');
	setTimeout(() => {
		$("#Motivo").change();
	}, 400);
}

limpiarDatos = function () {
	editarCierre = 0;
	$('#btnCrearCierre').text('Crear');
	$('#formularioCrearCierreClub')[0].reset();
	$("#formularioCrearCierreClub :input").removeClass('is-invalid');
	$("#formularioCrearCierreClub").validate().resetForm();
	$('input[name=Estado]').prop('checked', true);
	$('input[name=Fecha]').val(moment().add(1, 'days').format('YYYY-MM-DD'));
}
