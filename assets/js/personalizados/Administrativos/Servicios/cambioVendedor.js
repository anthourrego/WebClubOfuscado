let rutaGeneral = base_url() + 'Administrativos/Servicios/CambioVendedor/';
let cabecera = ['Acciones', 'vendedorid', 'cedula', 'nombre', 'AlmacenId', 'Nombre_Almacen', 'Pendientes'];
let dttabla = null;

$(function () {
	RastreoIngresoModulo('Cambio Vendedor');
	$.each(cabecera, (pos, cab) => {
		$('#cabecera').append(`<th class="text-center">${cab.split('_').join(' ')}</th>`)
	});

	dataTable();
});

function dataTable() {
	dataAjax = {
		UsuarioId: $UsuarioId
	};
	dttabla = $('#tabla').DataTable({
		language: $.Constantes.lenguajeTabla,
		processing: false,
		serverSide: true,
		order: [],
		draw: 10,
		fixedColumns: true,
		pageLength: 15,
		dom: 'Bfrtp',
		order: [],
		processing: true,
		ajax: {
			url: rutaGeneral + "carga",
			type: 'POST',
			data: function (d) {
				return $.extend(d, dataAjax);
			}
		},
		buttons: [
			{ extend: 'copy', className: 'copyButton', text: 'Copiar', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'csv', className: 'csvButton', text: 'CSV', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'excel', action: newExportAction, text: 'Excel', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'pdf', className: 'pdfButton', tex: 'PDF', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: { columns: ':not(:first-child)', title: 'Web_Club' } }
		],
		columns: [
			{
				className: 'text-center'
				, orderable: false
				, data: 'Acciones'
				, render: function (meta, type, data, meta) {
					return `<button ${data.Pendientes > 0 ? 'disabled' : ''} class="btn btn-primary btn-xs btnEditarAlmacen" title="Facturar" style="margin-bottom:3px">
						<i class="fas fa-pencil-alt"></i>
					</button>`;
				}
			}
			, { data: 'vendedorid' }
			, { data: 'cedula' }
			, { data: 'nombre' }
			, { data: 'AlmacenId' }
			, { data: 'Nombre_Almacen' }
			, { data: 'Pendientes' }
		],
		createdRow: function (row, data, dataIndex) {
			$(row).find('.btnEditarAlmacen').on('click', function (e) {
				e.preventDefault();
				vendedorid = data.vendedorid;
				nombre = data.nombre;
				alamcenid = data.AlmacenId;

				alertify.ajaxAlert = function (url) {
					$.ajax({
						url: url,
						async: false,
						success: function (data) {
							alertify.myAlert().set({
								onclose: function () {
									busqueda = false;
									alertify.myAlert().set({ onshow: null });
									$(".ajs-modal").unbind();
									delete alertify.ajaxAlert;
									$("#tblBusqueda").unbind().remove();
								}, onshow: function () {
									busqueda = true;
								}
							});

							alertify.myAlert(data);
							var tblID = $('#tblBusqueda').DataTable({
								bAutoWidth: false,
								processing: true,
								serverSide: true,
								ajax: {
									url: rutaGeneral + "ListarAlmacen",
									type: 'POST',
									data: function (d) {
										return $.extend(d, { alamcenid, UsuarioId: $UsuarioId });
									}
								},
								columnDefs: [
									{ targets: [0], width: '1%' },
								],
								order: [],
								ordering: false,
								draw: 10,
								language: language,
								pageLength: 10,
								initComplete: function () {
									setTimeout(function () {
										$('div.dataTables_filter input').focus();
									}, 500);
									$('div.dataTables_filter input').unbind().change(function (e) {
										e.preventDefault();
										table = $("body").find($tblID).dataTable();
										table.fnFilter(this.value);
									});
								},
								createdRow: function (row, resul, dataIndex) {
									$(row).click(function () {
										datas = {
											vendedorid: vendedorid
											, AlmacenId: resul[0]
											, Almacen: resul[1]
											, RASTREO: RASTREO(`Vendedor ${vendedorid} ${nombre} se cambia al almacén ${alamcenid} autorizado por usuario ${$UsuarioId}`, 'Cambio de Almacén')
										}

										alertify.myAlert().close();
										alertify.confirm('Advertencia', "¿Está seguro de cambiar de Almacén a '" + resul[1] + "'", function () {
											$.ajax({
												url: rutaGeneral + 'cambiarAlmacen',
												type: 'POST',
												dataType: 'json',
												data: datas,
												success: function (res) {
													if (res.valido) {
														alertify.success(res.msj);
														dttabla.ajax.reload()
													} else {
														alertify.error(res.msj);
													}
												}
											});
										}, function () { }).set({
											closable: false
										});
									});
								},
								deferRender: true,
								scrollY: screen.height - 500,
								scroller: {
									loadingIndicator: true
								},
								dom: 'ftri'
							});
						}
					});
				}
				alertify.ajaxAlert(base_url() + "Busqueda/DataTable");
			});
		}
	});
}

alertify.myAlert || alertify.dialog('myAlert', function factory() {
	return {
		main: function (content) {
			this.setContent(content);
		},
		setup: function () {
			return {
				options: {
					maximizable: false,
					resizable: false,
					padding: false,
					title: 'Cambio Almacén'
				}
			};
		},
		hooks: {
			onclose: function () {
				setTimeout(function () {
					alertify.myAlert().destroy();
				}, 500);
			}
		}
	};
});