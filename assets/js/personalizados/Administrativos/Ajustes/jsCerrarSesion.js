const rutaGeneral =  base_url() + "Administrativos/Ajustes/CerrarSesion/";
$(function () {
    RastreoIngresoModulo("Cerrar Sesiones Activas");

	tblSesiones = $("#tablaSesiones").DataTable({
		serverSide: true,
		pageLength: 10,
		ajax: {
			url: rutaGeneral + "cargarDT",
			type: "POST",
		},
		buttons: buttonsDT(["copy", "excel", "pdf", "print", "pageLength"]),
		columns: [
			{ data: "UsuarioId" },
			{ data: "nombre" },
			{
				data: "accion",
				orderable: false,
				className: "text-center noExport",
				render: function (meta, type, data, meta) {
					return `
					<button
						class="btn btn-danger btn-xs btn-terminarSesion"
						title="Terminar sesión"
					>
						<i class="fas fa-times"></i>
					</button>
					`;
				},
			},
		],
		createdRow: function (row, data, dataIndex) {
			$(row).find('.btn-terminarSesion').on('click',function () {
			    var usr = data.UsuarioId;
			    var nombreUsr = data.nombre;

                alertify.confirm('Advertencia', '¿Está seguro de terminar la sesión de ' + nombreUsr + '?', 
				function(){
					$.ajax({
                        type: 'POST',
                        url: rutaGeneral + "TerminarSesion",
                        data: {
                            usuario : usr,
                            RASTREO : RASTREO('Terminar sesión a [id: ' + usr + ', nombre: ' + nombreUsr + ']','Cerrar Sesiones Activas')
                        },
                        dataType: "json",
                        success:function(resp){
                            if(resp.success) {
                                tblSesiones.ajax.reload();
                                alertify.success(resp.msj);
                            } else {
                                alertify.error(resp.msj);
                            }
                        }
                    });
				},function(){});			    
			});
		},
	});
});
