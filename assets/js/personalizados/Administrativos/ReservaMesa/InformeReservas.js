let cabecera = ["Id", "SigEstado", "Zona", 'Acción', 'Tercero', 'Mesas', 'Inicio', 'Fin', 'Personas', 'Motivo', 'Observación', 'Estado'];
let tablaInformeReservas;
let rutaGeneral = base_url() + 'Administrativos/ReservaMesa/InformeReservas/';
let consultandoAccion = false;
let filtroOriginal = {};
let dataCancelar = {};

$(function () {
	RastreoIngresoModulo('Informe Reservas');
	$(".chosen-select").chosen({ width: '100%' });

	$.each(cabecera, (pos, cab) => {
		$('#cabecera').append(`<th class="text-center">${cab.replace('_', ' ')}</th>`)
	});

	configurarTabla();

	$("#btnLimpiar").click(function () {
		$("#formData :input").val('');
		filtroOriginal = {};
	});

	$("#btnBuscar").click(function () {
		filtroOriginal = {
			fechaInicial: $("#FechaIni").val(),
			fechaFinal: $("#FechaFin").val(),
			estado: $("#estadosReser").val()
		}
		configurarTabla(filtroOriginal);
	});
});

function configurarTabla(filtro = null) {
	if (tablaInformeReservas) {
		tablaInformeReservas.destroy();
	}
	let info = {
		data: {
			tblID: "#tablaInformeReservas",
			select: [
				"T.nombre AS Tercero"
				, `Mesas = STUFF(
					(	
						SELECT ' - ' + MesaId
						FROM ReservaMesas 
						WHERE ReservaId = RMZ.ReservaId
						GROUP BY MesaId FOR XML PATH('')
					),1, 3, ''
				)`
				, "RMZ.Inicio"
				, "RMZ.Fin"
				, 'RMZ.Personas'
				, 'RMZ.Motivo'
				, 'RMZ.Id'
				, '(SELECT TOP 1 M.ZonaId FROM ReservaMesas RM LEFT JOIN Mesa M ON RM.MesaId = M.MesaId WHERE RM.ReservaId = RMZ.ReservaId) AS Zona'
				, 'RMZ.Observacion AS Observación'
				, 'RMZ.Estado AS SigEstado'
				, `CASE 
					WHEN RMZ.Estado = 'CC'
						THEN 'Cancelada'
					WHEN RMZ.Estado = 'PD'
						THEN 'Pendiente'
					WHEN RMZ.Estado = 'RZ'
						THEN 'Rechazada'
					WHEN RMZ.Estado = 'EM' AND GETDATE() BETWEEN RMZ.Inicio AND RMZ.Fin
						THEN 'En Mesa'
					WHEN RMZ.Estado = 'FT'
						THEN 'Facturada'
					ELSE 'Confirmada'
				END AS Estado`
				, "'' AS Acción"
			],
			table: [
				'ReservaMesaZona RMZ',
				[
					["Tercero T", "T.TerceroID = RMZ.TerceroId", "INNER"]
				], []
			],
			column_order: ["Acción", "SigEstado", "Zona", "Id", "Tercero", "Mesas", "Inicio", "Fin", "Personas", "Motivo", "Observación", "Estado"],
			column_search: ['Tercero'],
			columnas: cabecera,
			orden: {
				'Inicio': 'ASC'
				, 'Tercero': 'ASC'
				, 'Mesas': 'ASC'
				, 'Fin': 'ASC'
				, 'Personas': 'ASC'
				, 'Motivo': 'ASC'
				, 'Observación': 'ASC'
				, 'Estado': 'ASC'
			},
		},
		language: $.Constantes.lenguajeTabla,
		processing: false,
		serverSide: true,
		order: [[6, 'ASC']],
		draw: 10,
		fixedColumns: true,
		pageLength: 10,
		buttons: [
			{ extend: 'copy', className: 'copyButton', text: 'Copiar', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'csv', className: 'csvButton', text: 'CSV', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'excel', action: newExportAction, text: 'Excel', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'pdf', className: 'pdfButton', tex: 'PDF', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: { columns: ':not(:first-child)', title: 'Web_Club' } }
		],
		dom: 'Bfrtp',
		columnDefs: [{
			visible: false, targets: [0, 1, 2]
		}],
		createdRow: function (row, data, dataIndex) {
			let ver = '';
			if (data[1] == 'CN' && moment(data[6]).isAfter(moment())) {
				if ($PERMISOCANCELARRESERVA) {
					ver = `
						<button onclick="estadoReserva('cancelar', 'CC', ${data[0]}, '${data[6]}', '${data[2]}')" class="btn btn-danger btn-xs" title="Cancelar" style="margin-bottom:3px"><i class="fas fa-times"></i></button>
					`;	
				}
				if ($PERMISORECHAZARRESERVA) {
					ver += `
						<button onclick="estadoReserva('rechazar', 'RZ', ${data[0]}, '${data[6]}', '${data[2]}')" class="btn btn-secondary btn-xs" title="Rechazar" style="margin-bottom:3px"><i class="fas fa-user-alt-slash"></i></button>
					`;	
				}
			}
			$(row).find('td:eq(3)').html(moment(data[6]).format('YYYY-DD-MM HH:mm')).css('text-align', 'center');
			$(row).find('td:eq(4)').html(moment(data[7]).format('YYYY-DD-MM HH:mm')).css('text-align', 'center');
			$(row).find('td:eq(0)').html(ver).css('text-align', 'center');
		}
	};
	if (filtro) {
		if (filtro.estado && filtro.estado.length) {
			let string = "";
			let enMesa = false;
			filtro.estado.forEach(op => {
				if (op == 'EM') {
					enMesa = true;
				}
				if (string == '') string += "'" + op + "'"; else string += ", '" + op + "'";
			});
			info.data.table[2].push(["RMZ.Estado IN (" + string + ")"]);
			if (enMesa) {
				info.data.table[2].push(["GETDATE() BETWEEN RMZ.Inicio AND RMZ.Fin"]);
			}
		}
		if (filtro.fechaInicial && filtro.fechaFinal) {
			info.data.table[2].push([
				"CAST(RMZ.Inicio AS DATE) BETWEEN CAST('" + filtro.fechaInicial + "' AS DATE) AND CAST('" + filtro.fechaFinal + "' AS DATE)"
			]);
			info.data.table[2].push([
				"CAST(RMZ.Fin AS DATE) BETWEEN CAST('" + filtro.fechaInicial + "' AS DATE) AND CAST('" + filtro.fechaFinal + "' AS DATE)"
			]);
		}
	} else {
		info.data.table[2].push(["RMZ.Estado = 'PD'"]);
	}
	tablaInformeReservas = dtSS(info);
}

function estadoReserva(estado, codigo, id, inicio, zona) {
	alertify.confirm('Alerta', `¿Desea ${estado} la reserva?`, function (ok) {
		if (codigo == 'CC') {
			dataCancelar = { id, codigo, inicio, zona };
			ejecutarPeticion({}, 'obtenerTiposCancelacionReserva', 'tiposCancelacion');
		} else {
			cambiarEstado(id, codigo, inicio, zona);
		}
	}, function (err) {
		console.error("Error ", err);
	});
}

function cambiarEstado(id, codigo, inicio, zona, tipoCance = null) {
	let data = {
		reserva: id,
		estado: codigo,
		fecha: moment(inicio).format('YYYY-MM-DD'),
		horas: moment(inicio).format('HH'),
		zona: zona
	}
	if (tipoCance) {
		data['tipoCancelacion'] = tipoCance;
	}
	ejecutarPeticion(data, 'modificarEstadoReserva', 'reservaEstadoModificado');
}

function reservaEstadoModificado({ mensaje, datos }) {
	alertify.success(mensaje);
	$("#tiposCancelacion").modal('hide');
	if (filtroOriginal.estado) {
		configurarTabla(filtroOriginal);
	} else {
		configurarTabla();
	}
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
}

function tiposCancelacion({ datos }) {
	$('#estructuraCancelacion').empty();
	if (datos.length) {
		datos.forEach(item => {
			$('#estructuraCancelacion').append(`<div class="col-3 p-1">
				<div class="card mb-1 h-100" style="box-shadow: none !important;">
					<div class="card-body p-1" onclick='cambiarEstado("${dataCancelar.id}","${dataCancelar.codigo}","${dataCancelar.inicio}","${dataCancelar.zona}", ${JSON.stringify(item.TipoCancelacionId)})' style="border:2px solid #d4d4d4; cursor:pointer; border-radius: 5px; height: 80px;">
						<div class="container-item text-center" style="font-size: 13px; text-overflow: ellipsis; white-space: break-spaces;overflow: hidden;">${item.Nombre}</div>
					</div>
				</div>
			</div>`);
		});
	} else {
		$('#estructuraCancelacion').append(`<div class="col-3 p-1">No hay tipos de cancelación registradas</div>`);
	}
	$("#tiposCancelacion").modal('show');
}