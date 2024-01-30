let rutaGeneral = base_url() + 'Administrativos/Servicios/CambioAlmacen/';
let dtCambioAlmacen = null;
if ($UsuarioId != 'null' && $AlmacenesIds.length > 0) {
	dtCambioAlmacen = $('#tblCambioAlmacen').DataTable({
		serverSide: true,
		pageLength: 15,
		order: [],
		ajax: {
			url: rutaGeneral + "DT" + ($Tipo == "Cajero" ? "Cajero" : ""),
			type: 'POST',
			data: function (d) {
				return $.extend(d, {almacenes: $AlmacenesIds});
			}
		},
		scrollX: true,
		columns: [
			{ data: 'vendedorid' }
			, { data: 'cedula' }
			, { data: 'nombre' }
			, { data: 'AlmacenId' }
			, { data: 'Nombre_Almacen' }
			, { 
				className: "text-right",
				data: 'Pendientes',
				visible: ($Tipo == "Cajero" ? false : true)
			}
			,{
				className: 'text-center'
				, orderable: false
				, data: "vendedorid"
				, render: function (meta, type, data, meta) {
					return `<button ${(data.Pendientes > 0 && $Tipo == "Vendedor") ? 'disabled' : ''} class="btn btn-primary btn-xs btnEditarAlmacen" title="Cambiar Almacen" style="margin-bottom:3px">
						<i class="fas fa-pencil-alt"></i>
					</button>`;
				}
			}
		],
		createdRow: function (row, data, dataIndex) {
			$(row).find('.btnEditarAlmacen').on('click', function (e) {
				e.preventDefault();
				if ($Tipo == "Cajero" && data.Pendientes == 0) {
						validarCuadreCajero(data);
				} else {
					cambiarAlmacen(data.vendedorid, data.AlmacenId, data.nombre);
				}
			});
		}
	});
}

const cambiarAlmacen = (vendedorId, almacenId, nombre) => {
	dtAlertify({
		titulo: "Cambio Almacén",
		campos: ["Codigo", "nombre"],
		dtConfig: {
			ajax: {
				url: rutaGeneral + "ListarAlmacen",
				type: 'POST',
				data: function (d) {
					return $.extend(d, { almacenId, UsuarioId: $UsuarioId });
				}
			},
			orderable: true,
			columns: [
				{ data: 0},
				{ data: 1 }
			],
		},
	}).then((res) => {
		data = {
			vendedorId: vendedorId
			, AlmacenId: res[0]
			, RASTREO: RASTREO(`Se cambia del almacén ${almacenId} ${$Tipo == 'Vendedor' ? 'vendedor' : 'usuario/cajero'} ${vendedorId} ${nombre} al almacén ${res[0]}, autoriza usuario ${$UsuarioId}`, 'Cambio de Almacén')
			,tipo: $Tipo
		}

		alertify.confirm('Advertencia', "¿Está seguro de cambiar de Almacén a '" + res[1] + "'", function () {
			$.ajax({
				url: rutaGeneral + 'CambiarAlmacen',
				type: 'POST',
				dataType: 'json',
				data: data,
				success: function (res) {
					if (res.success) {
						alertify.success(res.msj);
						dtCambioAlmacen.ajax.reload();
					} else {
						alertify.error(res.msj);
					}
				}
			});
		}, function () { }).set({
			closable: false
		});
	});
} 

const validarCuadreCajero = (datos) => {
	$.ajax({
		type: "POST",
		url: rutaGeneral + "CuadreCajero",
		data: {
			usuarioId: datos.vendedorid,
			AlmacenId: datos.AlmacenId
		},
		dataType: "json",
		success: (resp) => {
			if (resp.success) {
				cambiarAlmacen(datos.vendedorid, datos.AlmacenId, datos.nombre);
			} else {
				alertify.alert("Advertencia", resp.msj);
			}
		}
	});
}

$(function () {
	RastreoIngresoModulo(`Cambio ${$Tipo}`);
	
	if ($UsuarioId == 'null') {
		alertify.alert(
			"El usuario validado no coincide",
			"El usuario digitado no coincide debe validarlo nuevamente",
			() => {
				location.href = base_url() + "Administrativos/Servicios/PanelPrincipal";
			}
		);
		return;
	}

	if ($AlmacenesIds.length <= 0) {
		alertify.alert(
			"No se han encontrado almacenes",
			"El usuario no tienen almacenes asignados, valide nuevamente el usuario con el que realizó la autorización.",
			() => {
				location.href = base_url() + "Administrativos/Servicios/PanelPrincipal";
			}
		);
		return;
	}
});