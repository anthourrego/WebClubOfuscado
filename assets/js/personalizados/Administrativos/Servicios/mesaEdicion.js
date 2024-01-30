let rutaGeneral = base_url() + 'Administrativos/Servicios/MesaEdicion/';
let cabecera = ['Mesa', 'Nombre_Habitación',  'Acción', 'Identificación', 'Cliente_o_Socio', 'Vendedor', 'Usuario', 'Acciones'];
let tablaMesas;

$(function () {
	RastreoIngresoModulo('Mesa Edición');
	$.each(cabecera, (pos, cab) => {
		$('#cabecera').append(`<th class="text-center">${cab.split('_').join(' ')}</th>`)
	});

	dataTable();

});

function dataTable() {
	tablaMesas = $('#tabla').DataTable({
		dom: domBftrip,
		fixedColumns: true,
		processing: true,
		serverSide: true,
		pageLength: 10,
		ajax: {
			url: rutaGeneral + "cargarDT",
			type: 'POST',
			data: function (d) {
				return $.extend(d, { almacen: $ALMACEN });
			},
		},
		scrollX: true,
		columns: [
			{ data: 'Mesa', width: '11.11%' }
			, { data: 'Nombre_Habitacion', width: '11.11%' }
			, { data: 'Acción', width: '11.11%', visible: ($TIPOCOMERC == 'CLUB' ? true : false) }
			, { data: 'Identificación', width: '11.11%' }
			, { data: 'Cliente_o_Socio', width: '11.11%' }
			, { data: 'Vendedor', width: '11.11%' }
			, { data: 'Usuario', width: '11.11%' }
			, { data: 'Acciones', width: '11.11%', className: 'subTotal' }
		],
		initComplete: function () {
			$('div#tabla_filter input').unbind();
			$('div#tabla_filter input').keyup(function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find('#tabla').dataTable();
				}
			}).change(function (e) {
				e.preventDefault();
				table = $("body").find('#tabla').dataTable();
				table.fnFilter(this.value);
			});
			$('div#tabla_filter input').focus();
			$('div#tabla_paginate').css(
				"margin-bottom", "5px"
			);
		},
		createdRow: function (row, data, dataIndex) {
			if (data.ProdsPendientes > 0) {
				$(row).css('background-color', '#ffa0a0');
			}
			let ver = `
                <button data-mesa="${data.Mesa}" data-tercero="${data.Identificación}" class="editMesa btn btn-success btn-xs" title="Habilitar Mesa" style="margin-bottom:3px">
					<i class="fas fa-check-circle"></i>
                </button>
            `;
			$(row).find('td').last().html(ver).css('text-align', 'center');
			$(row).on("click", ".editMesa", function (e) {
				e.preventDefault();
				alertify.confirm('Alerta', `¿Esta seguro de habilitar la cuenta de ${data.Cliente_o_Socio} en la mesa ${data.Mesa}?`, function (ok) {
					let info = { mesa: data.Mesa, tercero: data.Identificación };
					obtenerInformacion(info, 'actualizarMesaEdicion', 'datosMesaEdicion');
				}, function (err) { });
			});

		},
	});
}

function obtenerInformacion(data, metodoBack, funcion) {
	data = $.Encriptar(data);
	$.ajax({
		url: rutaGeneral + metodoBack,
		type: 'POST',
		dataType: "json",
		data: {
			encriptado: data
		},
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

function datosMesaEdicion(resp) {
	alertify.success(resp.mensaje);
	tablaMesas.ajax.reload();
}