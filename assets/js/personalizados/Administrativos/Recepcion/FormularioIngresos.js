let rutaGeneral = base_url() + "Administrativos/Recepcion/FormularioIngresos/";
let arrayTercerosAprobados = [];
let $ID;
let registroSolicitud = null;
let CantAnex = 0;
let AnexObl = 0;
let PerAnex = 0;
let TipoDocSelect;
let SolicituAut = undefined;
let actualizarSol = 0;
let busquedaProveedor = 0;
let RastreoSeccion = "";
let tipoingresoAuto = null;
let depencendiaId = null;
let validarvistaDoc = null;
let tblAnexos = null;
let tblcomentarios = null;
let tblAnexos2 = null;
let dataDependencias = [];
let registroTerceros = [];
let tblDTAyuda;
let verificaModalVer = false;
let editarFechas = false;
let TipoDocumentoTercero = "";
const JSONsolicitudes = [];
var usuarioAutoriza = 0;
let pestanavisita = "Solicitud";

var columnChecked = [];
var seleccionoTodo = 1;
var selecciones = [];

totalRegistrosFull = [];

//VARIABLES DEL LECTOR
var barra = [],
	textoBarra = "",
	scanner = true,
	limiteIngresos = false,
	RegistroId = null,
	inputChecked = "#codigo";

var inputStart, inputStop, firstKey, lastKey, timing, userFinishedEntering;
var minChars = 2;

//PREPARAMOS EL ALERTIFY
alertify.myAlert ||
	alertify.dialog("myAlert", function factory() {
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
						title: "Búsqueda",
					},
				};
			},
			hooks: {
				onclose: function () {
					setTimeout(function () {
						alertify.myAlert().destroy();
					}, 1000);
				},
			},
		};
	});

//INICIALIZAMOS LAS TABLAS
let tblAutorizaciones = $("#tablaAutorizaciones").DataTable({
	deferRender: true,
	fixedColumns: true,
	serverSide: true,
	scrollX: true,
	pageLength: 10,
	order: [[0, "DESC"]],
	buttons: buttonsDT(["copy", "excel", "pdf", "print", "pageLength"]),
	ajax: {
		url: rutaGeneral + "DTautorizaciones",
		type: "POST",
	},
	columns: [
		{ data: "Consecutivo" },
		{ data: "NombreTipoIng" },
		{ data: "NombreDepenOrigen" },
		{ data: "NombreDepen" },
		{ data: "nombreUsu" },
		{ data: "EmpresaId" },
		{ data: "NombreEmpresa" },
		{ data: "FechaInicio" },
		{ data: "FechaFin" },
		{ data: "Accion", orderable: false },
	],
	initComplete: function () {
		setTimeout(() => {
			$(window).trigger("resize");
		}, 1000);
	},
	createdRow: function (row, data, dataIndex) {
		let ver = `
        <button type="button" class="verAutSolicitud btn btn-success btn-xs" title="Ver" style="margin-bottom:3px" style="transition:0.4s;"><i class="fas fa-eye"></i></button>
        `;
		$(row)
			.find("td:eq(9)")
			.html(ver)
			.addClass("text-center")
			.on("click", ".verAutSolicitud ", function (e) {
				e.preventDefault();
				pestanavisita = "Autoriza";
				usuarioAutoriza = 0;
				tipoingresoAuto = data.TipoIngresoId;
				depencendiaId = data.dependenciaId;
				$(".btnCancelarReactivarRezhazados").click();
				$("[id=formSolIngreso]")[0].reset();
				$("#RegistroSolicitudIngresoMod").modal("show");
				$("#RegistroSolicitudIngresoMod").css("overflow", "auto");
				$("body").css("overflow", "hidden");

				verificaModalVer = true;
				validarvistaDoc = true;
				IngresardatosModal(data.solicitudId, data.Consecutivo);

				setTimeout(() => {
					$(
						//, #AutSolicitud, #RechaSolicitud
						"[id=InfoComenta], [id=btnSalirModal], #AutSolicitud, #RechaSolicitud, .solicitudAut,#btnEnviarSolicitud, #btnCancelarSolicitud"
					).removeClass("d-none");
					$(".comentatioVer").removeClass("d-none");
					$(
						"#btnRegistrarSol, .verInSolicitudAut, #btnActualizarSolicitud, #btnEnviarSolicitud, #btnCancelarSolicitud, #modificarFechaIngresoSalida"
					).addClass("d-none");
					$("#RegistroSolicitudIngresoMod")
						.find(
							"#TipoIngresoId, #dependendiasIn ,#dependendiasInDes, #fechaIni, #fechaFin, #terceroID, #empresaId, #otroProveedor, #btnAdjuntar, #filePd, #FechaIniSol, #FechaFinSol"
						)
						.attr("disabled", true);
					$("#TipoIngresoId, #dependendiasIn, #dependendiasInDes").trigger(
						"chosen:updated"
					);
					$("#RegistroSolicitudIngresoMod")
						.find("#comentarioDepen")
						.removeAttr("disabled readonly");
					if ($("#empresaId").val() != "") {
						$(".otroProveedor").addClass("d-none");
						$(".empresaId").removeClass("d-none");
					} else {
						$(".empresaId").addClass("d-none");
						$(".otroProveedor").removeClass("d-none");
					}

					if (
						registroTerceros.filter(
							(element) =>
								element.EstadoSol == "APROBADA" ||
								element.EstadoSol == "RECHAZADA"
						).length > 0
					) {
						editarFechas = false;
					} else {
						editarFechas = true;
					}

					estadoTerceroRequiereSeguridadSocial = registroTerceros.filter(
						(element) => element.EstadoSol == "REQUIERE SEGURIDAD SOCIAL"
					);

					estadoAprobados = registroTerceros.filter(
						(element) => element.EstadoSol == "APROBADA"
					);
					estadoRechazados = registroTerceros.filter(
						(element) => element.EstadoSol == "RECHAZADA"
					);

					if (
						estadoTerceroRequiereSeguridadSocial.length > 0 ||
						estadoAprobados.length === registroTerceros.length ||
						estadoRechazados.length === registroTerceros.length
					) {
						$("#AutSolicitud, #RechaSolicitud").addClass("d-none");
					} else {
						$("#AutSolicitud, #RechaSolicitud").removeClass("d-none");
					}
				}, 600);
				$(".dependenciaAuto").chosen("destroy");
				$(".dependenciaAuto").empty();
				$(".dependenciaAuto").chosen();

				setDependenciasAut(data);
			});
	},
});

let tblSolicitudes = $("#tblSolicitudes").DataTable({
	deferRender: true,
	fixedColumns: true,
	serverSide: true,
	scrollX: true,
	pageLength: 10,
	order: [[0, "DESC"]],
	buttons: buttonsDT(
		["copy", "excel", "pdf", "print", "pageLength"],
		[
			{
				className: "btnRegistrarSolicitud",
				text: '<i class="fas fa-pencil-alt"></i> Registrar Solicitud',
			},
			{
				className: "btnActualizarTabla",
				text: '<i class="fas fa-sync-alt"></i> Actualizar',
			},
		]
	),
	ajax: {
		url: rutaGeneral + "DTsolicitudes",
		type: "POST",
	},
	columns: [
		{ data: "Consecutivo" },
		{ data: "NombreIng" },
		{ data: "NombreDepenOrigen" },
		{ data: "NombreDepen" },
		{ data: "EmpresaId" },
		{ data: "NombreEmpresa" },
		{ data: "FechaInicio" },
		{ data: "FechaFin" },
		{ data: "Accion", orderable: false },
	],
	initComplete: function () {
		setTimeout(() => {
			$(window).trigger("resize");
		}, 1000);
	},
	createdRow: function (row, data, dataIndex) {
		$("#btnActualizarSolicitudAprobados")
			.attr("hidden", true)
			.addClass("d-none");
		$("#btnAgregarTercero").attr("hidden", false).removeClass("d-none");

		ver = `
            <button type="button" class="verSolicitud btn btn-success btn-xs" title="Ver y Editar" style="margin-bottom:3px" style="transition:0.4s;"><i class="fas fa-eye"></i></button>
            <button type="button" class="modificarSol btn btn-primary btn-xs" title="Modificar" style="margin-bottom:3px"><i class="fas fa-edit"></i></button>
            <button type="button" class="eliSolicitud btn btn-danger btn-xs" title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
            `;
		$(row)
			.find("td:eq(8)")
			.html(ver)
			.addClass("text-center")
			.on("click", ".verSolicitud, .modificarSol", function (e) {
				e.preventDefault();
				$("#RegistroSolicitudIngresoMod").css("overflow", "auto");
				$("body").css("overflow", "hidden");

				pestanavisita = "Solicitud";
				usuarioAutoriza = 0;
				resetFormulario();
				$("[id=formSolIngreso]")[0].reset();

				verificaModalVer = false;
				validarvistaDoc = true;
				editarFechas = false;
				IngresardatosModal(data.solicitudId, data.Consecutivo);
				setTimeout(() => {
					// if (
					// 	registroTerceros.filter(
					// 		(element) => element.EstadoSol == "APROBADA"
					// 		//||element.EstadoSol == "RECHAZADA"
					// 	).length > 0 &&
					// 	e.currentTarget.className.includes("modificarSol")
					// ) {
					// 	alertify.error(
					// 		"La solicitud ya posee una autorización o rechazo en uno de los terceros registrados, por lo que ya no es posible realizar la modificación de esta solicitud"
					// 	);
					// 	setTimeout(() => {
					// 		$("body").css("overflow", "auto");
					// 	}, 200);
					// } else {
					$("#RegistroSolicitudIngresoMod").modal("show");
					// }
				}, 300);
				setTimeout(() => {
					$(
						"[id=InfoComenta], [id=btnSalirModal], .comentatioVer, #modificarSolicitud"
					).removeClass("d-none");
					$(
						"#btnRegistrarSol, .verInSolicitud, .eliTercero, #btnAgregarTercero"
					).addClass("d-none");
					$("#RegistroSolicitudIngresoMod")
						.find(
							"#TipoIngresoId, #dependendiasIn, #dependendiasInDes, #fechaIni, #fechaFin, #terceroID, #empresaId, #otroProveedor, #btnAdjuntar, #filePd, #FechaIniSol, #FechaFinSol, #comentarioDepen"
						)
						.attr("disabled", true);
					$("#TipoIngresoId, #dependendiasInDes, #dependendiasIn").trigger(
						"chosen:updated"
					);
					$("#comentarioDepen").attr("disabled", false);
					$("#comentarioDepen").attr("readonly", false);

					if ($("#empresaId").val() != "") {
						$(".otroProveedor").addClass("d-none");
						$(".empresaId").removeClass("d-none");
					} else {
						$(".empresaId").addClass("d-none");
						$(".otroProveedor").removeClass("d-none");
					}
					if (e.currentTarget.className.includes("verSolicitud")) {
						if (
							registroTerceros.filter(
								(element) =>
									element.EstadoSol == "APROBADA" ||
									element.EstadoSol == "RECHAZADA"
							).length > 0
						) {
							$("#modificarSolicitud").addClass("d-none");
						} else {
							$("#modificarSolicitud").removeClass("d-none");
						}

						if (
							registroTerceros.filter(
								(element) => element.EstadoSol == "APROBADA"
							).length > 0
						) {
							$("#modificarFechaIngresoSalida").removeClass("d-none");
						} else {
							$("#modificarFechaIngresoSalida").addClass("d-none");
						}
					} else if (e.currentTarget.className.includes("modificarSol")) {
						$("#modificarFechaIngresoSalida").addClass("d-none");
						if (
							registroTerceros.filter(
								(element) =>
									element.EstadoSol == "APROBADA" ||
									element.EstadoSol == "RECHAZADA"
							).length > 0
						) {
							$("#modificarSolicitud").addClass("d-none");
						} else {
							$("#modificarSolicitud").click();
						}
					}
					$("#btnRegistrarSol,#btnActualizarSolicitud").attr("hidden", true);
					setDependenciasAut(data);
				}, 600);
			})
			.on("click", ".eliSolicitud", function (e) {
				e.preventDefault();
				idSolicitud = data.solicitudId;
				idConsecutivo = data.Consecutivo;
				valor = idSolicitud == null ? idConsecutivo : idSolicitud;
				consultarEstadoSolictud(data.Consecutivo, idSolicitud, valor);
			});
	},
});

//SE AGREGAN LOS EVENTOS E INICIALIZAMOS ATRIBUTOS DE LAS ETIQUETAS
$(document).on("mouseup touchend", function (e) {
	var container = $(".bootstrap-datetimepicker-widget");
	if (!container.is(e.target) && container.has(e.target).length === 0) {
		container
			.parent()
			.find("[data-toggle='datetimepicker']")
			.datetimepicker("hide");
	}
});

$(".datetimepicker").datetimepicker({
	format: "YYYY-MM-DD HH:mm",
	sideBySide: true,
	locale: "es",
});

$("#modalAyuda").on("shown.bs.modal", function () {
	if (!tblDTAyuda) {
		tblDTAyuda = $("#tblAyuda").DataTable({
			scrollY: $(document).height() - 480,
			scrollX: true,
			scroller: {
				loadingIndicator: true,
			},
			scrollCollapse: true,
			columnDefs: [],
			pageLength: -1,
			ordering: false,
		});
	}
});

$("#RegistroSolicitudIngresoMod").on("shown.bs.modal", function () {
	tblTerceros.draw();
});

$("#modalAyuda").on("hide.bs.modal", function () {
	setTimeout(() => {
		$("#RegistroSolicitudIngresoMod").modal("show");
	}, 500);
});

///Solicitudes
$("#btnAyuda").click(function (e) {
	e.preventDefault();
	$("#RegistroSolicitudIngresoMod").modal("hide");
	setTimeout(() => {
		$("#modalAyuda").modal("show");
	}, 500);
});

// Event Listeners
var tblTerceros = $("#tblTerceros")
	.DataTable({
		language,
		processing: true,
		pageLength: 100,
		columnDefs: [
			{
				targets: [0, 1, 2],
				className: "textoTbl",
			},
			{
				targets: [3, 6],
				className: "text-center",
				width: "1%",
				orderable: false,
			},
			{
				targets: [4, 5, 6],
				visible: false,
			},
		],
		dom: "lBfrtip",
		autoWidth: false,
		order: [0, "desc"],
		scrollX: true,
		deferRender: true,
		fixedColumns: true,
		buttons: [
			{
				extend: "copy",
				className: "copyButton",
				text: "Copiar",
				exportOptions: { columns: ":not(.noExport)" },
			},
			{
				extend: "excel",
				className: "excelButton",
				orientation: "landscape",
				exportOptions: { columns: ":not(.noExport)" },
				pageSize: "letter",
				title: null,
				filename: `Eventos - Lista de Invitados`,
			},
			{
				extend: "pdf",
				className: "pdfButton",
				tex: "PDF",
				orientation: "landscape",
				exportOptions: { columns: ":not(.noExport)" },
				pageSize: "letter",
			},
			{
				extend: "print",
				className: "printButton",
				orientation: "landscape",
				pageSize: "letter",
				exportOptions: { columns: ":not(.noExport)" },
				text: "Imprimir",
			},
			{
				className: "btnEliminarAprobados d-none cesar",
				text: '<i class="fas fa-user-slash"></i> Inactivar Tercero Aprobados',
			},
			{
				className: "btnReactivarRezhazados d-none",
				text: '<i class="fas fa-check"></i> Seleccionar Rechazados',
			},
			{
				className: "btnCancelarReactivarRezhazados  d-none",
				text: '<i class="fas fa-times"></i> Cancelar Selección Rechazados',
			},
			{
				className: "guardarSeleccionRechazados d-none btnActualizarTabla",
				text: '<i class="fas fa-edit"></i> Reactivar Rechazados',
			},
		],
		select: {
			style: "multi",
			selector: ".checkColumn",
		},
		drawCallback: function (settings, data) {
			if (this.api().rows().data().length === 0) {
				$("#btnRegistrarSol,#btnActualizarSolicitud").attr("hidden", true);
			} else {
				$("#btnRegistrarSol,#btnActualizarSolicitud").attr("hidden", false);
				for (let i = 0; i < this.api().rows().data().length; i++) {
					JSONsolicitudes.push(this.api().rows().data()[i]);
				}
			}
		},
		createdRow: function (row, data, dataIndex) {
			$(row).on("click", ".eliminarTercero", function (e) {
				e.preventDefault();
				if (data[4] != null && data[4] != "") {
					alertify.confirm(
						"Advertencia",
						"¿Está seguro de eliminar la solicitud " + data[4] + "?",
						function () {
							$.ajax({
								type: "POST",
								url: rutaGeneral + "deshabilitarSolicitudTercero",
								data: {
									SolicitudId: data[4],
									RASTREO: RASTREO(
										"Deshabilita solicitud " + data[4],
										"Modifica Solicitud"
									),
								},
								dataType: "json",
								success: function (resp) {
									alertify.success("Solicitud eliminada correctamente.");
									nuevosterceros = registroTerceros.filter(
										(element) => element.DocumentoId != data[0]
									);
									registroTerceros = nuevosterceros;
									if (registroTerceros.length > 0) {
										cargarTerceroTabla(registroTerceros);
										$(".eliminarTercero").removeClass("d-none");
									} else {
										$("#RegistroSolicitudIngresoMod").modal("hide");
										tblSolicitudes.ajax.reload();
										alertify.warning(
											"La solicitud ya no posee terceros registrados, por lo cual se procederá a eliminar por completo la solicitud"
										);
									}
								},
							});
						},
						function () {}
					);
				} else {
					nuevosterceros = registroTerceros.filter(
						(element) => element.DocumentoId != data[0]
					);
					registroTerceros = nuevosterceros;
					cargarTerceroTabla(registroTerceros);
				}
			});

			$(row).on("click", ".aprobarTercero,.rechazarTercero", function (e) {
				e.preventDefault();
				const TipoIngresoId = data[5];
				const NombreTercero = data[1];
				const solicitudId = data[4];
				const tipoAutorizacion = $(this).attr("dataAut");
				if ($("#dependenciaAuto").val() != "") {
					modificarEstadosolicitud(
						solicitudId,
						tipoAutorizacion,
						TipoIngresoId,
						null,
						NombreTercero
					);
					$("#RegistroSolicitudIngresoMod").addClass("d-none");
				} else {
					alertify.error(
						"Debe asignar al menos una dependencia para continuar con la operación."
					);
				}
			});

			$(row).on("click", ".reactivarTercero", function (e) {
				e.preventDefault();
				const dataTerceros = [
					{
						Consecutivo: idConsecutivoSol,
						NombreTercero: data[1],
						SolicitudId: data[4],
						TerceroId: data[0],
					},
				];

				actualizarSolicitudTercero(dataTerceros);
			});

			$(row).on("click", ".rechazarTerceroIndividual", function (e) {
				e.preventDefault();
				const TipoIngresoId = data[5];
				const NombreTercero = data[1];
				const solicitudId = data[4];
				const tipoAutorizacion = $(this).attr("dataAut");
				InactivaEstadosolicitud(solicitudId, TipoIngresoId, NombreTercero);
				$("#RegistroSolicitudIngresoMod").addClass("d-none");
			});

			$(".btnEliminarAprobados").click(function (e) {
				e.preventDefault();
				InactivaEstadosolicitud();
				$("#RegistroSolicitudIngresoMod").addClass("d-none");
			});

			$(".btnReactivarRezhazados").click(function (e) {
				e.preventDefault();
				$(".btnReactivarRezhazados").addClass("d-none");
				$(
					".btnCancelarReactivarRezhazados, .guardarSeleccionRechazados"
				).removeClass("d-none");
				tblTerceros.column(6).visible(true);
				tblTerceros.column(3).visible(false);
				seleccionoTodo = 0;
				$("#checkAll").prop("indeterminate", false);
				$(".checkColumn").prop("checked", false);
				tblTerceros.rows().deselect();
				selecciones = [];
			});

			$(".btnCancelarReactivarRezhazados").click(function (e) {
				e.preventDefault();
				$(
					".btnCancelarReactivarRezhazados, .guardarSeleccionRechazados"
				).addClass("d-none");
				$(".btnReactivarRezhazados").removeClass("d-none");
				tblTerceros.column(6).visible(false);
				tblTerceros.column(3).visible(true);
			});

			$(".guardarSeleccionRechazados")
				.off("click")
				.on("click", function (e) {
					e.preventDefault();
					if (selecciones.length > 0) {
						actualizarSolicitudTercero(selecciones);
					} else {
						alertify.error("No tiene terceros checkeados para reactivar");
						return;
					}
				});

			setTimeout(() => {
				for (var i = 0; i <= 2; i++) {
					var dato = "" + data[i] + "";
					dato = dato.substring(0, 1);
					if (dato == "*") {
						$(row).find("td").addClass("td-warning");
						$("#btnRegistrarSol,#btnActualizarSolicitud").attr("hidden", true);
					}
				}
			}, 100);
		},
	})
	.on("select", function (e, dt, type, indexes) {
		$(".selected").removeClass("selected");
		let rowData = dt.rows(indexes).data().toArray()[0];
		const dataTerceros = {
			Consecutivo: idConsecutivoSol,
			NombreTercero: rowData[1],
			SolicitudId: rowData[4],
			TerceroId: rowData[0],
		};
		agregarRegistro(dataTerceros);

		if (totalRegistrosFull == selecciones.length) {
			seleccionoTodo = 1;
			$("#checkAll").prop("indeterminate", false).prop("checked", true);
		} else if (selecciones.length > 0) {
			$("#checkAll").prop("indeterminate", true);
		}
	})
	.on("deselect", function (e, dt, type, indexes) {
		seleccionoTodo = 0;
		$(".selected").removeClass("selected");
		let rowData = dt.rows(indexes).data().toArray()[0];
		const dataTerceros = {
			Consecutivo: idConsecutivoSol,
			NombreTercero: rowData[1],
			SolicitudId: rowData[4],
			TerceroId: rowData[0],
		};
		eliminarRegistro(dataTerceros);

		if (selecciones.length <= 0) {
			$("#checkAll").prop("indeterminate", false).prop("checked", false);
		}
	});

function agregarRegistro(data) {
	if (!selecciones.some((it) => it.TerceroId == data.TerceroId)) {
		selecciones.push(data);
	}
}

function eliminarRegistro(data) {
	index = selecciones.findIndex(
		(element) => element.TerceroId == data.TerceroId
	);
	if (index !== -1) {
		selecciones.splice(index, 1);
	}
}

$(document).on("change", "#checkAll", function () {
	if ($(this).is(":checked")) {
		seleccionoTodo = 1;
		$("#checkAll").prop("indeterminate", false);
		$(".checkColumn").prop("checked", true);
		tblTerceros.rows().select();
		selecciones = [...totalRegistrosFull];
		// $(".dt-buttons .btnEliminar")
		// 	.attr("disabled", false)
		// 	.removeClass("disabled");
	} else {
		seleccionoTodo = 0;
		$("#checkAll").prop("indeterminate", false);
		$(".checkColumn").prop("checked", false);
		tblTerceros.rows().deselect();
		// $(".dt-buttons .btnEliminar").attr("disabled", true).addClass("disabled");
		selecciones = [];
	}
});

$("#excelfile").change(function (e) {
	e.preventDefault();
	tblTerceros.clear().draw();
	registroTerceros = [];
	var fileInput = document.getElementById("excelfile");

	var file = fileInput.files[0];
	formData = new FormData();
	formData.append("excelfile", file);

	$.ajax({
		url: rutaGeneral + "cargarExcel",
		type: "POST",
		dataType: "json",
		data: formData,
		async: false,
		cache: false,
		contentType: false,
		processData: false,
		success: function (resp) {
			registro = resp.data;
			if (registro.valido) {
				registro.datos.forEach((element) => {
					cargarTercero(
						element.DocumentoId,
						element.Nombre,
						"PENDIENTE REGISTRO",
						"",
						""
					);
				});
			} else {
				alertify.error(registro.message);
				return;
			}
		},
	});
});

//Finsolicitudes
$(function () {
	if ($validarIngreso == "Sol&Aut") {
		RastreoIngresoModulo("Solicitud y autorización de ingresos");
		RastreoSeccion = "Solicitud y Autorización Ingresos";
	} else {
		RastreoIngresoModulo("Otros Ingresos");
		RastreoSeccion = "Otros Ingresos";
	}

	$('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
		if (e.target.id == "ingreso-tab") {
			$("#bntLimpiar").click();
		}
		validarvistaDoc = false;
		if (e.target.id == "autorizaciones-tab") {
			tblAutorizaciones.ajax.reload();
		}
		var tabActivo = $(e.target).attr("title");
	});

	$(
		'select[data-db]:not([data-db="DependenciaIdDes"], [data-db="DependenciaId"], [data-db="TipoIngresoId"]), input[type=file], textarea, #btnModalTercerosModal, #btnEnviarSolicitud, #btnCancelarSolicitud, #btnAdjuntar, #btnRegistrarSol'
	).attr("disabled", true);
	$(
		'input[data-db]:not([data-db="DependenciaIdDes"],  [data-db="DependenciaId"], [data-db="TipoIngresoId"]), textarea[data-db]'
	).attr({ readonly: true, disabled: true });
	$("#excelfile").attr({ readonly: false, disabled: false });
	$("#otroProveedor, #comentarioDepen, #comentarioAuto").on(
		"input",
		function () {
			this.style.height = "auto";
			this.style.height = this.scrollHeight + "px";
		}
	);

	$("#RegistroSolicitudIngresoMod").on("hidden.bs.modal", function () {
		setTimeout(() => {
			$("body").css("overflow", "auto");
		}, 200);
	});

	$("#modificarSolicitud").on("click", function () {
		$("#RegistroSolicitudIngresoMod").css("overflow", "auto");
		$("body").css("overflow", "hidden");
		$(this).addClass("d-none");
		$(
			"[id=InfoComenta], [id=btnSalirModal], .modal-footer, #btnActualizarSolicitud, .comentatioVer, .verInSolicitud, .otroProveedor, .empresaId, .eliTercero, #btnAgregarTercero, .eliminarTercero"
		).removeClass("d-none");
		$("#btnCancelarSolicitud, #btnEnviarSolicitud, #btnRegistrarSol").addClass(
			"d-none"
		);
		$("#RegistroSolicitudIngresoMod")
			.find(
				"#dependendiasInDes, #dependendiasIn,#terceroID, #empresaId, #otroProveedor, #btnAdjuntar, #filePd, #FechaIniSol, #FechaFinSol, #comentarioDepen, #fechaIni, #fechaFin"
			)
			.removeAttr("disabled readonly");
		$("#btnActualizarSolicitud").attr("hidden", false);
		editarFechas = true;
		validarvistaDoc = false;
		tblAnexos.draw();
		$("#dependendiasInDes, #dependendiasIn").trigger("chosen:updated");
		$("#empresaId").val() == ""
			? $("#empresaId").attr("disabled", true)
			: $("#empresaId").val();
		$("#otroProveedor").val() == ""
			? $("#otroProveedor").attr("disabled", true)
			: $("#otroProveedor").val();
		if ($("#empresaId").val() == "" && $("#otroProveedor").val() == "") {
			$("#empresaId").attr("disabled", false);
		}
	});

	$("#modificarFechaIngresoSalida").on("click", function (e) {
		e.preventDefault();
		$("#RegistroSolicitudIngresoMod").modal("hide");
		$("#modal-solicitar-usuario").modal("show");
	});

	$("#modal-solicitar-usuario").on("hidden.bs.modal", function () {
		$("#RegistroSolicitudIngresoMod").modal("show");
		$("body").addClass("modal-open");
	});

	$("#formDataAdmin").submit(function (e) {
		e.preventDefault();
		$("#btCuadreSubmit").addClass("invisible");

		/* Vamos a validar el usuario ingresado para permisos de administrador */
		if ($(this).valid()) {
			let $fills = $("#formDataAdmin input"),
				data = {};
			$.each($fills, (pos, input) => {
				const name = $(input).attr("name");
				data[name] = $(input).val();
			});
			data["permiso"] = 2652; //permiso para modificar fechas;
			datas = $.Encriptar(data);

			$.ajax({
				url: rutaGeneral + "validarUsuario",
				type: "POST",
				data: {
					encriptado: datas,
				},
				success: (resp) => {
					resp = JSON.parse($.Desencriptar(JSON.parse(resp)));
					$("#formDataAdmin")[0].reset();
					$("#formDataAdmin :input").removeClass("is-invalid");
					$("#formDataAdmin").validate().resetForm();
					if (resp.valido) {
						alertify.success(resp.mensaje);
						$("#btCuadreSubmit").removeClass("invisible");
						$("#modal-solicitar-usuario").modal("hide");
						$("#modificarFechaIngresoSalida").addClass("d-none");
						$("#fechaIni,#fechaFin").removeAttr("disabled readonly");
						$("#btnActualizarSolicitudAprobados")
							.attr("hidden", false)
							.removeClass("d-none");
						usuarioAutoriza = data["usuarioid"];
					} else if (!resp.valido) {
						$("#btCuadreSubmit").addClass("invisible");
						alertify.error(resp.mensaje);
						usuarioAutoriza = 0;
						$("#btnActualizarSolicitudAprobados")
							.attr("hidden", true)
							.addClass("d-none");
					} else {
						$("#btCuadreSubmit").addClass("invisible");
						alertify.error(resp.mensaje);
						usuarioAutoriza = 0;
						$("#modal-solicitar-usuario").modal("hide");
						$("#modificarFechaIngresoSalida").removeClass("d-none");
						$("#btnActualizarSolicitudAprobados")
							.attr("hidden", true)
							.addClass("d-none");
					}
				},
			});
		} else {
			alertify.error("Validar la información de los campos");
		}
	});

	//Se deshabilitan las fecha para no colocar rango erroneos
	$("[id=fechaIni]").on("dp.change", function (e) {
		e.preventDefault();
		$("[id=fechaIni]")
			.data("DateTimePicker")
			.minDate(moment().format("YYYY-MM-DD HH:mm"));
		$("[id=fechaFin]").data("DateTimePicker").minDate(e.date);
	});

	$("#AutSolicitud, #RechaSolicitud").on("click", function (e) {
		if ($("#dependenciaAuto").val() != "") {
			if (e.target.id == "AutSolicitud") {
				var autorizar = 1;
			} else if (e.target.id == "RechaSolicitud") {
				var autorizar = 0;
			}
			modificarEstadosolicitud(SolicituAut, autorizar, tipoingresoAuto, 1);
			$("#RegistroSolicitudIngresoMod").addClass("d-none");
		} else {
			alertify.error(
				"Debe asignar al menos una dependencia para continuar con la operación."
			);
		}
	});

	$("#codigo").on("keydown", function (e) {
		if (!$("#checkLector").is(":checked")) {
			form = $(this).closest("form");
			if (e.which == 13) {
				form.submit();
				if ($(this).val().length == 0) {
					setTimeout(() => {
						$(this).focus();
					}, 200);
				}
			}
		}
	});

	$("[id=btnSalirModal]").on("click", function () {
		$("#RegistroSolicitudIngresoMod").modal("hide");
		$("#RegistroSolicitudIngresoMod").css("overflow", "hidden");
		setTimeout(() => {
			$("body").css("overflow", "auto");
		}, 200);
	});

	$(".btnRegistrarSolicitud").click(function () {
		$("body").css("overflow", "hidden");
		$("#RegistroSolicitudIngresoMod").css("overflow", "auto");
		$("#btnAgregarTercero").attr("hidden", false).removeClass("d-none");
		resetFormulario();
		$("#modificarFechaIngresoSalida").addClass("d-none");
		if ($TipoIngreso.length > 0) {
			$("[id=formSolIngreso]")[0].reset();
			$("#RegistroSolicitudIngresoMod").modal("show");
			$("[id=fechaFin]").val(moment().format("YYYY-MM-DD HH:mm"));
			$("[id=fechaIni]").val(moment().format("YYYY-MM-DD HH:mm"));
			$("#dependendiasInDes_chosen").css("border", "");
			$("#dependendiasInDes_chosen").css("border-radius", "");
			$(".verInSolicitudAut").removeClass("d-none");
			$(
				"[id=terceroID], [id=empresaId], [id=otroProveedor], [id=fechaFin], [id=fechaIni]"
			).removeClass("is-invalid");
		} else {
			alertify.error(
				"El usuario actual no tiene asignación de tipos de ingreso para realizar la solicitud"
			);
		}
	});

	$("#solicitud").on("click", ".col-form-label-md", function () {
		var self = this;
		setTimeout(function () {
			$(self).next().find("input, select, textarea").focus();
		}, 0);
	});

	$(".btnActualizarTabla").click(function () {
		tblSolicitudes.ajax.reload();
	});

	$(".chosen-select").chosen({
		width: "100%",
	});

	if ($tabIngresos.length === 0) {
		$("#solicitud-tab").click();
	} else {
		$("#ingreso-tab").click();
	}

	$(document).on("show.bs.tab", function () {
		setTimeout(() => {
			$(window).trigger("resize");
		}, 30);
	});

	$("[id=btnEnviarSolicitud],[id=btnActualizarSolicitud] ").on(
		"click",
		function (e) {
			e.preventDefault();
			$("#RegistroSolicitudIngresoMod").css("overflow", "hidden");
			setTimeout(() => {
				$("body").css("overflow", "auto");
			}, 200);
			if (e.target.id === "btnActualizarSolicitud") {
				actualizarSol = 1;
				if ($("#dependendiasInDes").val() == "") {
					$("#dependendiasInDes_chosen").css("border", "1px solid red");
					$("#dependendiasInDes_chosen").css("border-radius", "4px");
				} else {
					$("#dependendiasInDes_chosen").css("border", "");
					$("#dependendiasInDes_chosen").css("border-radius", "");
				}
			}
			$("#formSolIngreso").submit();
		}
	);

	$("[id=btnActualizarSolicitudAprobados]").on("click", function (e) {
		e.preventDefault();
		if ($("#fechaInicio").val() == "") {
			alertify.warning("El campo fecha ingreso no puede estar vacio");
			return false;
		}

		if ($("#fechaFin").val() == "") {
			alertify.warning("El campo fecha salida no puede estar vacio");
			return false;
		}
		ActualizarSolitudAprobados();
	});

	$("[data-codigo]")
		.off()
		.on("change", function (e) {
			e.preventDefault();
			if (e.target.id === "terceroID") {
				e.preventDefault();
				lastId = $ID;
				$ID = $('[data-codigo="codigoTer"]').val().trim();
				tipoConsulta = "Tercero";
				if ($ID != "" && $ID.length > 0) {
					$.ajax({
						url: rutaGeneral + "cargarTerceroSol",
						type: "POST",
						dataType: "json",
						data: {
							codigo: $ID,
							tipoConsulta,
							RASTREO: RASTREO("Carga Cliente " + $ID, "Terceros"),
						},
						success: function (registro) {
							if (registro.length == 0) {
								let creartercero = 0;
								$TipoIngreso.forEach((element) => {
									if (
										element.TipoIngresoId == $("#TipoIngresoId").val() &&
										element.CreacionTerceros == 1
									) {
										creartercero = 1;
									}
								});
								if (creartercero == 1) {
									$("#modalConsultarCrear").modal("show");
								} else {
									alertify.error(
										"El usuario no se encuentra registrado o se encuentra inactivo."
									);
									$("#NombreTer").val("");
									$('[data-codigo="codigoTer"]').val("");
								}
							} else {
								if (registro != 1) {
									if (registro[0] && registro[0].tipodocuid != 31) {
										TipoDocumentoTercero = registro[0].tipodocuid;
										for (var key in registro[0]) {
											if (registro[0][key] != null) {
												var value = registro[0][key];
												$("[data-db=" + key + "]").val(value);
												if ($("#NombreTer").val() != "") {
													$("#btnAgregarTercero").prop("disabled", false);
												}
											}
										}
									} else {
										alertify.error(
											"El tercero " +
												registro[0].TerceroID +
												" se encuentra registrado con documento tipo NIT."
										);
										$("#NombreTer").val("");
										$('[data-codigo="codigoTer"]').val("");
									}
								} else {
									$('[data-codigo="codigoTer"]').val("");
									$("#NombreTer").val("");
									alertify.error(
										"La persona" +
											" se encuentra bloqueada por la junta directiva, no se permite su ingreso."
									);
									return false;
								}
							}
						},
					});
				} else {
					$("#NombreTer").val("");
					if ($('[data-codigo="terceroID"]').val() != "") {
						$('[data-codigo="terceroID"]').val($ID);
					}
				}
			} else if (e.target.id === "empresaId") {
				e.preventDefault();
				$ID = $('[data-codigo="empresaId"]').val().trim();
				tipoConsulta = "Empresa";
				if ($ID != "" && $ID.length > 0) {
					$.ajax({
						url: rutaGeneral + "cargarTerceroSol",
						type: "POST",
						dataType: "json",
						data: {
							codigo: $ID,
							tipoConsulta,
							RASTREO: RASTREO("Carga Cliente " + $ID, "Proveedor"),
						},
						success: function (registro) {
							if (registro != 1) {
								for (var key in registro[0]) {
									if (registro[0][key] != null) {
										var value = registro[0][key];
										$("[data-db=" + key + "]").val(value);
									}
								}
							}
							if (registro == 1) {
								$('[data-codigo="codigoTer"]').val("");
								$("#NombreEmp").val("");
								alertify.alert(
									"Alerta",
									'<h3 class="mensaje-alerta">La empresa' +
										" se encuentra bloqueada por la junta directiva, no se permite su ingreso.</h3>"
								);
								return false;
							}
							if (registro.length == 0) {
								alertify.error(
									"La empresa no se encuentra registrada o se encuentra inactiva."
								);
								$('[data-codigo="empresaId"]').val("");
								$("#NombreEmp").val("");
							}
						},
					});
				} else {
					$("#NombreEmp").val("");
					if ($('[data-codigo="empresaId"]').val() != "") {
						$('[data-codigo="empresaId"]').val($ID);
					}
				}
			}
		});

	//creacion de terceros llamando el modulo de tercero
	$("#btnCrear").on("click", function (e) {
		e.preventDefault();
		$("#modalConsultarCrear").modal("hide");

		terceroComponent({
			tercero: $("#terceroID").val(),
			tipoTercero: "EsProveedor",
			paneles: ["DatosPrincipales", "DireccionResidencia"],
		})
			.then((res) => {
				console.log(res);
				$("#RegistroSolicitudIngresoMod").css("overflow", "auto");
				$("body").css("overflow", "hidden");
				$("#btnAgregarTercero").attr("disabled", false);
			})
			.catch((error) => {
				$("#terceroID").val("");
				$("#NombreTer").val("");
				$("#RegistroSolicitudIngresoMod").css("overflow", "auto");
				$("body").css("overflow", "hidden");
				console.log(error);
			});
	});

	$("#btnBuscar").on("click", function () {
		alertify.ajaxAlert = function (url) {
			$.ajax({
				url: url,
				async: false,
				success: function (data) {
					alertify.myAlert().set({
						onclose: function () {
							if (!busquedaClick) {
								$ID = "";
								$("#NombreTer, #terceroID").val("");
								$("#btnAgregarTercero").attr("disabled", true);
							}
							setTimeout(() => {
								$("#RegistroSolicitudIngresoMod").data(
									"bs.modal"
								)._config.focus = true;
								$("#RegistroSolicitudIngresoMod").data(
									"bs.modal"
								)._config.keyboard = true;
							}, 350);
							busqueda = false;
							alertify.myAlert().set({ onshow: null });
							$(".ajs-modal").unbind();
							delete alertify.ajaxAlert;
							$("#tblBusqueda").unbind().remove();
						},
						onshow: function () {
							setTimeout(() => {
								$("#RegistroSolicitudIngresoMod").data(
									"bs.modal"
								)._config.focus = false;
								$("#RegistroSolicitudIngresoMod").data(
									"bs.modal"
								)._config.keyboard = false;
							}, 350);
							busqueda = true;
							busquedaClick = false;
						},
					});

					alertify.myAlert(data);

					var $tblID = "#tblBusqueda";
					dtSS({
						data: {
							tblID: $tblID,
						},
						ajax: {
							url: rutaGeneral + "DTBucarTercero",
							type: "POST",
						},
						bAutoWidth: false,
						columnDefs: [{ targets: [0], width: "1%" }],
						ordering: false,
						draw: 10,
						pageLength: 10,
						initComplete: function () {
							setTimeout(function () {
								$("div.dataTables_filter input").focus();
								$("html, body").animate(
									{
										scrollTop: $("div.dataTables_filter input").offset().top,
									},
									2000
								);
							}, 500);
							$("div.dataTables_filter input").change(function (e) {
								e.preventDefault();
								table = $("body").find($tblID).dataTable();
								table.fnFilter(this.value);
							});
						},
						oSearch: { sSearch: $ID },
						createdRow: function (row, data, dataIndex) {
							$(row).click(function () {
								busquedaClick = true;
								$("[data-codigo]")
									.find("#terceroID")
									.val(data[0].trim())
									.focusin()
									.change();
								$(self).val(data[0].trim()).change();
								alertify.myAlert().close();
								$("#RegistroSolicitudIngresoMod").css("overflow", "auto");
								$("body").css("overflow", "hidden");
								$("#btnAgregarTercero").attr("disabled", false);
								$("#NombreTer").val(data[1]);
								$('[data-codigo="codigoTer"]').val(data[0]);
							});
						},
						scrollY: screen.height - 400,
						scroller: {
							loadingIndicator: true,
						},
						dom: domftri,
					});
				},
			});
		};
		alertify.ajaxAlert(base_url() + "Busqueda/DataTable");

		//this.destroy();
		$("#modalConsultarCrear").modal("hide");
		$CREAR = 1;
	});

	$("#btnCerrarModalConsultarCrear").on("click", function (e) {
		e.preventDefault();
		$("#modalConsultarCrear").modal("hide");
		$("#NombreTer").val("");
		$('[data-codigo="codigoTer"]').val("");
	});

	$(".checkDoc").on("click", function () {
		if ($(this).is(":checked")) {
			$(".checkDoc").not(this).prop("checked", false);
			TipoDocSelect = $(this).val();
		} else {
			$(this).prop("checked", false);
			TipoDocSelect = "";
		}
		if (TipoDocSelect == "SS") {
			$(".validDoc").removeClass("invisible");
			$("#terceroAnexo_chosen").removeClass("invisible");
			$("[id=FechaIniSol]").val(moment().format("YYYY-MM-DD"));
			$("[id=FechaFinSol]").val(moment().format("YYYY-MM-DD"));
		} else {
			$(".validDoc").addClass("invisible");
			$("#terceroAnexo_chosen").addClass("invisible");
			$("[id=FechaIniSol]").val(moment().format("YYYY-MM-DD"));
			$("[id=FechaFinSol]").val(moment().format("YYYY-MM-DD"));
		}
	});

	$("[id=formSolIngreso]").on(
		"change",
		"[data-db='TipoIngresoId']",
		function () {
			$(
				"#btnEnviarSolicitud, #btnCancelarSolicitud, #btnAdjuntar, #btnRegistrarSol"
			).attr("disabled", true);
			let tipoIngreso = $("#TipoIngresoId").val();
			validarCampos(tipoIngreso, (ValidaCrear = 0));
			$("[id=TipoIngresoId]").val(tipoIngreso).trigger("chosen:updated");
			$(
				"#btnEnviarSolicitud, #btnCancelarSolicitud, #btnAdjuntar, #btnRegistrarSol"
			).attr("disabled", false);
			$(
				"select[data-db], input[type=file], textarea, #btnModalTercerosModal"
			).attr("disabled", false);
			$(
				"input[data-db]:not(#dependendiasInDes, #dependendiasIn, #NombreTer, #NombreEmp), textarea[data-db]"
			).attr({ readonly: false, disabled: false });
		}
	);

	$("#dependendiasInDes")
		.chosen()
		.change(function () {
			if ($("#dependendiasInDes").val() != "") {
				$("#dependendiasInDes_chosen").css("border", "");
				$("#dependendiasInDes_chosen").css("border-radius", "");
			}
		});

	$("#formSolIngreso input").on("focusout", function (e) {
		if (e.target.value != "") {
			$(e.target).removeClass("is-invalid");
		}
	});

	$("#btnAgregarTercero").on("click", function () {
		let valorRegistrado = false;
		if (
			$("[name=terceroId]").val() != null &&
			$("[name=terceroId]").val() != ""
		) {
			cargarTercero(
				$("[name=terceroId]").val(),
				$("[name=nombreTercero]").val(),
				"PENDIENTE REGISTRO",
				null,
				$("#TipoIngresoId").val()
			);
		}
		$("#btnAgregarTercero").prop("disabled", true);
	});

	$("[id=btnRegistrarSol]").click(function (e) {
		validar = document.getElementById("formSolIngreso");
		var formularioUno = new FormData(validar);
		formularioUno.append("Estado", "A");
		formularioUno.append("NombreEmpresa", $("[name=NombreEmpresa]").val());
		formularioUno.delete("excelfile");
		formularioUno.delete("AdjuntoAnex");
		formularioUno.delete("tblTerceros_length");

		validarRequired = validar.querySelectorAll("[required]");
		formularioUno = Object.fromEntries(formularioUno.entries());
		if ($("#dependendiasInDes").val() == "") {
			$("#dependendiasInDes_chosen").css("border", "1px solid red");
			$("#dependendiasInDes_chosen").css("border-radius", "4px");
		} else {
			$("#dependendiasInDes_chosen").css("border", "");
			$("#dependendiasInDes_chosen").css("border-radius", "");
		}
		for (var i = 0; i < validarRequired.length; i++) {
			var field = validarRequired[i];

			if (field.value == "") {
				field.classList.add("is-invalid");
			} else {
				if (field.classList.contains("is-invalid")) {
					field.classList.remove("is-invalid");
				}
			}
		}
		if (validar.checkValidity() && registroTerceros.length > 0) {
			$.ajax({
				url: rutaGeneral + "creaSolicitud",
				type: "POST",
				dataType: "json",
				async: false,
				data: { registro: JSON.stringify([formularioUno, registroTerceros]) },
				success: function (registro) {
					if (!registro.RegistroRepeat) {
						registroSolicitud = registro[0].Consecutivo;
						validarCampos(registro.TipoIngresoId, (ValidaCrear = 1));
						if (AnexObl == 1 || PerAnex == 1) {
							$("#btnRegistrarSol").addClass("d-none");
							$("#btnCancelarSolicitud, #btnEnviarSolicitud").removeClass(
								"d-none"
							);
							$("#TipoIngresoId").attr("disabled", true);
							validarTercerosAnexos(registro);
						} else {
							$("#formSolIngreso").submit();
						}
					} else {
						alertify.error(
							"El tercero |" +
								registro.RegistroRepeat +
								"| ya cuenta con una solicitud en ese rango de fechas, creada por el usuario | " +
								registro.Usuario +
								" |"
						);
					}
				},
			});
		} else {
			if (registroTerceros.length == 0) {
				alertify.error("Debe agregar al menos un tercero a la solicitud.");
			} else {
				setTimeout(() => {
					$("#RegistroSolicitudIngresoMod").css("overflow", "auto");
					$("body").css("overflow", "hidden");
				}, 200);
				alertify.error("Complete los campos obligatorios.");
			}
		}
	});

	$("#formSolIngreso").on("submit", function (e) {
		e.preventDefault();
		let RegistroSol = 1;
		if (AnexObl == 1) {
			if (CantAnex == 0) {
				RegistroSol = 0;
			}
		}
		validar = document.getElementById("formSolIngreso");
		if (validar.checkValidity() && RegistroSol == 1) {
			let formulario = new FormData(validar);
			formulario.append("validarSeguridad", AnexObl);
			formulario.append("EmpresaId", $('[name="EmpresaId"]').val());
			formulario.append("FechaInicio", $('[name="FechaInicio"]').val());
			formulario.append("FechaFin", $('[name="FechaFin"]').val());
			formulario.append("NombreEmpresa", $('[name="NombreEmpresa"]').val());
			formulario.append("TipoIngresoId", $("[id=TipoIngresoId]").val());
			formulario.delete("AdjuntoAnex");
			formulario.delete("tblTerceros_length");
			formulario.delete("excelfile");
			formulario.append(
				"SolicitudId",
				(registroSolicitud =
					SolicituAut !== undefined ? SolicituAut : registroSolicitud)
			);
			if (actualizarSol == 1) {
				formulario.append("editarsolicitud", actualizarSol);
			}
			formulario = Object.fromEntries(formulario.entries());
			$.ajax({
				url: rutaGeneral + "actualizaSolicitud",
				type: "POST",
				dataType: "json",
				async: false,
				data: { registro: JSON.stringify([formulario, registroTerceros]) },
				cache: false,
				success: function (registro) {
					if (registro == 1) {
						if (actualizarSol != 1) {
							alertify.success("Solicitud creada correctamente.");
						} else {
							alertify.success("Solicitud actualizada correctamente.");
						}

						registroSolicitud = null;
						setTimeout(() => {
							$("#RegistroSolicitudIngresoMod").modal("hide");
							tblSolicitudes.ajax.reload();
							tblAutorizaciones.ajax.reload();
							$("[id=formSolIngreso]").trigger("reset");
							$("[id=TipoIngresoId]").val("").trigger("chosen:updated");
						}, 1000);
					} else {
						alertify.error(
							"La fecha de ingreso y salida del tercero debe estar dentro del rango de fechas de seguridad social"
						);
					}
				},
			});
		} else {
			if (RegistroSol == 0) {
				alertify.error("Adjunte la seguridad social del tercero.");
				$("body").css("overflow", "hidden");
				$("#RegistroSolicitudIngresoMod").css("overflow", "auto");
			} else {
				validarRequired = validar.querySelectorAll("[required]");
				for (var i = 0; i < validarRequired.length; i++) {
					var field = validarRequired[i];

					if (field.value == "") {
						field.classList.add("is-invalid");
					} else {
						if (field.classList.contains("is-invalid")) {
							field.classList.remove("is-invalid");
						}
					}
				}
				setTimeout(() => {
					$("#RegistroSolicitudIngresoMod").css("overflow", "auto");
					$("body").css("overflow", "hidden");
				}, 200);
				alertify.error("Complete los campos obligatorios.");
			}
		}
	});

	function ActualizarSolitudAprobados() {
		FechaInicio = $('[name="FechaInicio"]').val();
		FechaFin = $('[name="FechaFin"]').val();
		SolicitudId = SolicituAut;
		Consecutivo = idConsecutivoSol;
		// 2641 Modificación fechas de slicitudes aprobadas
		$.ajax({
			url: rutaGeneral + "actualizaSolicitudAprobados",
			type: "POST",
			dataType: "json",
			async: false,
			data: {
				FechaInicio,
				FechaFin,
				SolicitudId,
				Consecutivo,
				usuarioAutoriza,
			},
			cache: false,
			success: function (registro) {
				if (registro == 1) {
					alertify.success("Solicitud actualizada correctamente.");
					registroSolicitud = null;
					setTimeout(() => {
						$("#RegistroSolicitudIngresoMod").modal("hide");
						tblSolicitudes.ajax.reload();
						tblAutorizaciones.ajax.reload();
						$("[id=formSolIngreso]").trigger("reset");
						$("[id=TipoIngresoId]").val("").trigger("chosen:updated");
					}, 1000);
				} else {
					alertify.error(
						"La fecha de ingreso y salida del tercero " +
							registro +
							" debe estar dentro del rango de fechas de seguridad social"
					);
				}
			},
		});
	}

	$("[id=btnCancelarSolicitud]").on("click", function () {
		if (registroSolicitud) {
			$.ajax({
				url: rutaGeneral + "eliminarSolicitud",
				type: "POST",
				dataType: "json",
				data: {
					Id: registroSolicitud,
					RASTREO: RASTREO("Elimina solicitud: ", "Solicitud Ingreso"),
				},
				success: function (registro) {
					$("#RegistroSolicitudIngresoMod").modal("hide");
					tblSolicitudes.ajax.reload();
				},
			});
			registroSolicitud = null;
		}
	});

	$("[id=btnAdjuntar]").on("click", function () {
		var anexoDoc = $("[id=filePd]").prop("files")[0];
		var FechaIniSeg = $("[id=FechaIniSol]").val();
		var FechaFinSeg = $("[id=FechaFinSol]").val();
		var idSolicitud = $("#terceroAnexo").val();
		var tipoDoc = TipoDocSelect;
		var formData = new FormData();

		formData.append("file", anexoDoc);
		if (tipoDoc == "OA") {
			formData.append("FechaIni", null);
			formData.append("FechaFin", null);
			formData.append("idSolicitud", null);
		} else {
			formData.append("FechaIni", FechaIniSeg);
			formData.append("FechaFin", FechaFinSeg);
			formData.append("idSolicitud", idSolicitud);
		}
		formData.append("tipoDoc", tipoDoc);
		formData.append(
			"registroSolicitud",
			SolicituAut !== undefined ? SolicituAut : registroSolicitud
		);
		if (anexoDoc) {
			$.ajax({
				url: rutaGeneral + "actualizaAnexos",
				type: "POST",
				dataType: "json",
				processData: false,
				contentType: false,
				async: false,
				data: formData,
				success: function (resp) {
					if (resp.valido) {
						alertify.success(resp.mensaje);
						tblAnexos.columns.adjust().draw();
					} else {
						alertify.error(resp.mensaje);
					}
				},
			});
		} else {
			alertify.error("Por favor, adjunte un archivo");
		}
		$("[id=filePd]").val("");
	});

	$("[id='btnRegistrarComentario']").on("click", function (e) {
		var dataComentario = $("#comentarioDepen").val();
		if (dataComentario.trim().length !== 0) {
			$.ajax({
				url: rutaGeneral + "agregarComentarios",
				type: "POST",
				data: {
					SolicituAut,
					dataComentario,
				},
				success: function (registro) {
					alertify.success("Se ha registrado correctamente");
					$("#comentarioDepen").val("");
					tblcomentarios.columns.adjust().draw();
				},
			});
		} else {
			alertify.error("No se han agregado datos en el campo de observación");
		}
	});

	$("#formBuscar").on("submit", function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			let datos = new FormData(this);
			datos.set("validaLector", $("#checkLector").is(":checked"));
			$.ajax({
				url: rutaGeneral + "BuscarTerceroIngreso",
				type: "POST",
				data: datos,
				dataType: "json",
				processData: false,
				contentType: false,
				cache: false,
				success: (resp) => {
					respuesta = resp[1];
					if (resp) {
						busquedaProveedor = {
							TerceroId: respuesta[0].TerceroId,
							TipoIngresoId: respuesta[0].TipoIngresoId,
							Sede: $datosSede.SedeId,
							Almacen: $datosAlmacen.almacenid,
						};

						if (resp[1][0].Estado.trim() == "B") {
							mensaje = "<div class='p-2' style='background-color: #ff00003b'>";
							mensaje += `<h5>La solicitud se encuentra bloqueada por el usuario ${resp[4][0]}</h5>`;
							if (resp[4][1] != "")
								mensaje += `<h3> Motivo: ${resp[4][1]}</h3>`;
							mensaje += `</div>`;
							alertify
								.alert("<h4>Solicitud bloqueada</h4>", mensaje)
								.set("label", "Aceptar");
							$(".ajs-content").css("padding", "2px");
							$("#bntLimpiar").click();
							return;
						}

						if (resp[0] == 1 && resp[2] == "S") {
							$("#registrarSalida").removeClass("d-none");
							$("#registrarIngreso").addClass("d-none");
						} else if (
							respuesta[0].BloqueoPorAutorizacion == 0 &&
							(respuesta[0].EstadoSol == "PENDIENTE" ||
								respuesta[0].EstadoSol == "APROBADA")
						) {
							$("#registrarSalida").addClass("d-none");
							$("#registrarIngreso").removeClass("d-none");
						} else if (
							respuesta[0].BloqueoPorAutorizacion == 1 &&
							respuesta[0].EstadoSol == "APROBADA"
						) {
							$("#registrarSalida").addClass("d-none");
							$("#registrarIngreso").removeClass("d-none");
						} else {
							$("#registrarSalida").addClass("d-none");
							$("#registrarIngreso").addClass("d-none");
						}
					}

					if (respuesta) {
						if (respuesta[0].foto !== "" && respuesta[0].foto !== null) {
							$(".img-persona").attr(
								"src",
								"data:image/jpeg;base64," + respuesta[0].foto
							);
						} else {
							$(".img-persona").attr(
								"src",
								base_url() + "assets/images/user/nofoto.png"
							);
						}

						SolicituAut = respuesta[0].SolicitudId;
						registroSolicitud = respuesta[0].Consecutivo;
						cargarTablasAdd(false, false, true);

						setTimeout(() => {
							datosTabla = tblAnexos2.data();

							if (datosTabla.length > 0) {
								$(".tablaDos").removeClass("d-none");
								validarvistaDoc = true;
							} else {
								$(".tablaDos").addClass("d-none");
							}
						}, 500);
						for (var key in respuesta[0]) {
							if (respuesta[0][key] != null) {
								var value = respuesta[0][key];
								$("[data-ing=" + key + "]").val(value);
							}
						}
						if (resp[0] == 1) {
							$("#cardSocio")
								.removeClass(
									"border border-danger border-success border-warning"
								)
								.addClass("border border-info");
						} else if (respuesta[0].EstadoSol == "APROBADA") {
							$("#cardSocio")
								.removeClass("border border-danger border-success border-info")
								.addClass("border border-success");
						} else if (
							respuesta[0].EstadoSol == "RECHAZADA" ||
							respuesta[0].EstadoSol == "REQUIERE SEGURIDAD SOCIAL"
						) {
							$("#cardSocio")
								.removeClass("border border-success border-warning border-info")
								.addClass("border border-danger");
						} else if (respuesta[0].EstadoSol == "PENDIENTE") {
							$("#cardSocio")
								.removeClass("border border-success border-danger border-info")
								.addClass("border border-warning");
						}
					} else {
						$("#bntLimpiar").click();
						alertify.confirm(
							"Registrar solicitud",
							"El tercero no cuenta con una solicitud de ingreso ¿Desea Registrar la solicitud? ",
							function () {
								if ($TipoIngreso.length > 0) {
									resetFormulario();
									$("[id=formSolIngreso]")[0].reset();
									$("#RegistroSolicitudIngresoMod").modal("show");
									$("#RegistroSolicitudIngresoMod").css("overflow", "auto");
									$("body").css("overflow", "hidden");
								} else {
									alertify.error(
										"El usuario actual no tiene asignación de tipos de ingreso para realizar la solicitud"
									);
								}
							},
							function () {}
						);
					}
				},
			});
		}
	});

	$("#registrarIngreso").on("click", function () {
		$.ajax({
			url: rutaGeneral + "ConfirmarIngresoTercero",
			type: "POST",
			data: {
				busquedaProveedor,
			},
			dataType: "json",
			success: (resp) => {
				$("#cardSocio")
					.removeClass(
						"border border-danger border-sucess border-warning border-success"
					)
					.addClass("border border-info");
				alertify.success("Ingresó correctamente");
				$("#bntLimpiar").click();
			},
		});
		// $("#formBuscar").submit();
	});

	$("#registrarSalida").on("click", function () {
		$.ajax({
			url: rutaGeneral + "ConfirmarSalidaTercero",
			type: "POST",
			data: {
				busquedaProveedor,
			},
			dataType: "json",
			success: (resp) => {
				$("#registrarIngreso, #registrarSalida").addClass("d-none");
				alertify.success("Salió correctamente");
				setTimeout(() => {
					location.reload();
				}, 2000);
			},
		});
		$("#bntLimpiar").click();
	});

	$("#bntLimpiar").on("click", function () {
		SolicituAut = undefined;
		$(".tablaDos").addClass("d-none");
		$("#cardSocio").removeClass(
			"border border-success border-danger border-warning border-info"
		);
		$(".img-persona").attr("src", base_url() + "assets/images/user/nofoto.png");
		$("[data-ing]").val("");
		$("#formBuscar")[0].reset();
		$("#registrarIngreso, #registrarSalida").addClass("d-none");
	});

	//Lector de cedula eventos
	$("#checkLector").on("click", function () {
		$(this).is(":checked") ? propForm(true) : propForm(false);
	});

	$(inputChecked).on("focusout", function () {
		if ($("#checkLector").is(":checked")) {
			setTimeout(function () {
				$(inputChecked).focus();
			}, 50);
		}
	});

	$(inputChecked).on("focus", function () {
		if ($("#checkLector").is(":checked")) {
			if (scanner == false) {
				barra = [];
				textoBarra = "";
				scanner = false;

				inputStart = null;
				inputStop = null;
				firstKey = null;
				lastKey = null;
			}
		}
	});

	$(inputChecked).keydown(function (e) {
		if ($("#checkLector").is(":checked")) {
			$("#checkLector").prop("disabled", true);
			if (!(barra == [] && $(this).val() == "")) {
				// restart the timer
				if (timing) {
					clearTimeout(timing);
				}

				// handle the key event
				if (e.which == 13) {
					// Enter key was entered
					// don't submit the form
					e.preventDefault();

					// has the user finished entering manually?
					if ($(inputChecked).val().trim().length >= minChars) {
						userFinishedEntering = true; // incase the user pressed the enter key
						inputComplete();
					}
					var arrUser = $(inputChecked).val().split("-");

					setTimeout(function () {
						$(inputChecked).val(arrUser[0]);
						$("#formBuscar").submit();
						$("#checkLector").prop("disabled", false).click();
					}, 100);
				} else {
					// some other key value was entered

					// could be the last character
					inputStop = performance.now();
					lastKey = e.which;

					// don't assume it's finished just yet
					userFinishedEntering = false;

					// is this the first character?
					if (e.which == 9) {
						e.preventDefault();
						$(inputChecked).val($(inputChecked).val().trim() + "-");
						setTimeout(function () {
							$(inputChecked).focus();
						}, 100);
						return;
					}
					if (e.which == 16) {
						e.stopPropagation();
						$(inputChecked).val($(inputChecked).val().trim());
						return;
					}
					if (e.which == 32) {
						e.stopPropagation();
						$(inputChecked).val($(inputChecked).val().trim());
						return;
					}

					if (!inputStart) {
						firstKey = e.which;
						inputStart = inputStop;
						// watch for a loss of focus
						$("body").on("blur", inputChecked, inputBlur);
					}

					// start the timer again
					timing = setTimeout(inputTimeoutHandler, 500);
				}
			}
		}
	});

	$(document)
		.off("keydown")
		.on("keypress", function (e) {
			if ($("#checkLector").is(":checked")) {
				if (e.which == 13) {
					e.preventDefault();
				} else {
					textoBarra += e.key;
				}

				if (e.which == 13 && scanner == true) {
					e.preventDefault();
				}
			}
		});

	$(document).on("keyup", "#codigo", function () {
		if ($(this).next().find("input").prop("disabled")) {
			$(this).val($(this).val().replace(/^0/, ""));
		}
	});
});

function resetFormulario() {
	tblSolicitudes.ajax.reload();
	$("#modificarSolicitud").addClass("d-none");
	$("[id=formSolIngreso]").trigger("reset");
	$("[id=TipoIngresoId], [id=dependendiasInDes], [id=dependendiasIn]")
		.val("")
		.trigger("chosen:updated");
	$("#TipoIngresoId, #dependendiasInDes, #dependendiasIn").removeAttr(
		"disabled readonly"
	);
	$("#TipoIngresoId, #dependendiasInDes, #dependendiasIn").trigger(
		"chosen:updated"
	);
	$(
		".solicitudAut, .DependediaCl, #InfoTer, #InfoProvee, #OtroProvee, #InfoAnex, #InfoComenta, #btnActualizarSolicitud, #btnCancelarSolicitud, #btnEnviarSolicitud, #btnActualizarSolicitud, #AutSolicitud, #RechaSolicitud, .dependenciaOrigen"
	).addClass("d-none");
	$("#btnRegistrarSol").removeClass("d-none");
	$("#btnRegistrarSol").attr("disabled", true);
	$(".responMod").removeClass("modal-dialog-scrollable");
	$("#comentarioDepen").val("");
	$(
		"[id=terceroID], [id=empresaId],  [id=otroProveedor], [id=fechaFin], [id=fechaIni]"
	).removeClass("is-invalid");
	$(
		"[id=terceroID], [id=empresaId],  [id=otroProveedor], [id=fechaFin], [id=fechaIni]"
	).removeClass("input-invalid");
	$("#dependendiasInDes_chosen").css("border", "");
	$("#dependendiasInDes_chosen").css("border-radius", "");
	registroSolicitud = null;
	SolicituAut = undefined;
	registroTerceros = [];
	$("#tblTerceros tbody").empty();
	$(".tablaTerceros").addClass("d-none");
}

function cargarTercero(
	DocumentoId,
	Nombre,
	EstadoSol,
	SolicitudId,
	TipoIngresoId,
	tipoRegistro = false
) {
	let valorRegistrado = false;
	registroTerceros.forEach((element) => {
		if (element.DocumentoId == DocumentoId) {
			valorRegistrado = element;
			return;
		}
	});
	if (valorRegistrado == false) {
		// 	//agregarmos los datos del tercero a un array aparte
		if ($(".tablaTerceros").hasClass("d-none"))
			$(".tablaTerceros").removeClass("d-none");
		registroTerceros.push({
			DocumentoId,
			Nombre,
			EstadoSol,
			SolicitudId,
			TipoIngresoId,
		});
		cargarTerceroTabla(registroTerceros);
	} else {
		alertify.warning(
			"El tercero " +
				valorRegistrado.DocumentoId +
				" | " +
				valorRegistrado.Nombre +
				" ya se encuentra registrado en la solicitud"
		);
	}

	if (!tipoRegistro) {
		$("#terceroID").val("");
		$("#NombreTer").val("");
	}
}

function cargarDatosTabla(idSolicitudSol) {
	$.ajax({
		url: rutaGeneral + "consultaConsecutivo",
		type: "POST",
		dataType: "json",
		data: {
			idSolicitudSol,
			idConsecutivoSol: idConsecutivoSol,
		},
		success: function (registro) {
			cargarTerceroTabla(registro);
			tblcomentarios.ajax.reload();
		},
	});
}

function cargarTerceroTabla(datos) {
	totalRegistrosFull = [];
	arrayTercerosAprobados = [];
	$(".btnEliminarAprobados").addClass("d-none");
	$(".btnReactivarRezhazados").addClass("d-none");
	$(".btnCancelarReactivarRezhazados").addClass("d-none");
	$(".guardarSeleccionRechazados").addClass("d-none");
	var filas = [];
	if (datos.length > 0) {
		$.each(datos, function () {
			botonAprobar = "";
			elimina = "";
			botonRechazar = "";
			botonReactivar = "";
			checkReactivar = "";
			checkbox = "";

			if (
				this.EstadoSol !== "APROBADA" &&
				this.EstadoSol !== "RECHAZADA" &&
				this.EstadoSol !== "PENDIENTE" &&
				this.EstadoSol !== "REQUIERE SEGURIDAD SOCIAL"
			) {
				elimina =
					'<button type="button" class="eliminarTercero btn btn-danger btn-xs" value="' +
					this.DocumentoId +
					'" title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>';
				// botonEliminar = `<button class="eliTercero btn btn-danger btn-xs text-center m-1" title="Eliminar" value="${this.SolicitudId}" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>`
			}
			if (
				this.EstadoSol == "PENDIENTE" ||
				this.EstadoSol == "REQUIERE SEGURIDAD SOCIAL"
			) {
				let none = "d-none";
				if (pestanavisita != "Autoriza") {
					none = "";
				}
				elimina =
					'<button type="button" class="eliminarTercero ' +
					none +
					' btn btn-danger btn-xs" value="' +
					this.DocumentoId +
					'" title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>';
				if (verificaModalVer) {
					botonAprobar = `<button type='button' class="aprobarTercero  btn btn-success btn-xs text-center m-1" dataTipoIngreso="${this.TipoIngresoId}" dataAut="1" title="Aprobar" value="${this.SolicitudId}" style="margin-bottom:3px"><i class="fas fa-check"></i></button>`;
					botonRechazar = `<button type='button' class="rechazarTercero btn btn-danger btn-xs text-center m-1" dataTipoIngreso="${this.TipoIngresoId}" dataAut="0" title="Rechazar" value="${this.SolicitudId}" style="margin-bottom:3px"><i class="fas fa-times"></i></button>`;
				}
			}

			if (this.EstadoSol == "APROBADA") {
				if (pestanavisita == "Solicitud") {
					$(".btnEliminarAprobados").removeClass("d-none");
					arrayTercerosAprobados.push(this.SolicitudId);
					elimina =
						'<button type="button" class="rechazarTerceroIndividual btn btn-warning btn-xs" value="' +
						this.DocumentoId +
						'" title="Rechazar tercero" style="margin-bottom:3px"><i class="fas fa-times"></i></button>';
				}
			}

			if (this.EstadoSol == "RECHAZADA") {
				botonReactivar = `<button type='button' class="reactivarTercero btn btn-primary btn-xs text-center m-1" dataTipoIngreso="${this.TipoIngresoId}" dataAut="0" title="Rechazar" value="${this.SolicitudId}" style="margin-bottom:3px"><i class="fas fa-edit"></i></button>`;

				const dataTerceros = {
					Consecutivo: idConsecutivoSol,
					NombreTercero: this.Nombre,
					SolicitudId: this.SolicitudId,
					TerceroId: this.DocumentoId,
				};
				totalRegistrosFull.push(dataTerceros);

				checkbox = `<div class="custom-control custom-checkbox">
						<input type="checkbox" class="custom-control-input checkColumn" id="checkColumn${this.DocumentoId}" data-solicitudid="${this.SolicitudId}">
						<label class="custom-control-label checkColumn-custom-control-label" for="checkColumn${this.DocumentoId}"></label>
					</div>`;

				$(".btnReactivarRezhazados").removeClass("d-none");
			}

			var fila = {
				0: this.DocumentoId,
				1: this.Nombre,
				2: this.EstadoSol,
				3:
					"<center>" +
					botonAprobar +
					botonRechazar +
					elimina +
					botonReactivar +
					"</center>",
				4: this.SolicitudId,
				5: this.TipoIngresoId,
				6: checkbox,
			};
			filas.push(fila);
		});
	}
	tblTerceros.clear().draw();
	tblTerceros.rows.add(filas).draw();
	tblTerceros.order([0, "desc"]).draw();
}

//AGREGAMOS LA FUNCIONES
function IngresardatosModal(idSolicitudtbl, idConsecutivotbl) {
	SolicituAut = idConsecutivotbl != null ? idConsecutivotbl : idSolicitudtbl;
	idSolicitudSol = idSolicitudtbl;
	idConsecutivoSol = idConsecutivotbl;
	registroTerceros = [];
	$.ajax({
		url: rutaGeneral + "consultaConsecutivo",
		type: "POST",
		dataType: "json",
		data: {
			idSolicitudSol,
			idConsecutivoSol,
		},
		success: function (registro) {
			if (registro.length > 0) {
				if (registro[0].EmpresaId == "" || registro[0].EmpresaId == null) {
					registro[0].EmpresaOtra = registro[0].NombreEmpresa;
					registro[0].NombreEmpresa = "";
				}
				registro.forEach((element) => {
					registroTerceros.push({
						DocumentoId: element.TerceroId,
						Nombre: element.nombre,
						EstadoSol: element.EstadoSol,
						SolicitudId: element.SolicitudId,
						TipoIngresoId: element.TipoIngresoId,
					});
				});
				cargarTerceroTabla(registroTerceros);

				validarTercerosAnexos(registro);

				if ($(".tablaTerceros").hasClass("d-none"))
					$(".tablaTerceros").removeClass("d-none");

				setTimeout(() => {
					for (var key in registro[0]) {
						if (registro[0][key] != null) {
							var value = registro[0][key];
							$("[data-aut=" + key + "]").val(value);
						}
					}
					$("#terceroID").val("").change();
					$("[id=fechaFin]").val(registro[0]["FechaFinAc"]);
					$("[id=fechaIni]").val(registro[0]["FechaIniAc"]);
					$("[data-aut=TipoIngresoId]")
						.val(registro[0].TipoIngresoId)
						.trigger("chosen:updated");
					$("[data-aut=DepenAut]")
						.val(registro[0].DepenAut)
						.trigger("chosen:updated");
					$("[data-aut=DependenciaIdDes]")
						.val(registro[0].DependenciaId)
						.trigger("chosen:updated");
					$("[data-aut=DependenciaOrigen]")
						.val(registro[0].DependenciaOrigen)
						.trigger("chosen:updated");
				}, 500);
				validarCampos(
					registro[0].TipoIngresoId,
					(ValidaCrear = 0),
					(validaEditar = 1)
				);
			} else {
				$("#RegistroSolicitudIngresoMod").modal("hide");
				alertify.warning(
					"La solicitud ya no posee terceros registrados, por lo cual se procederá a eliminar por completo la solicitud"
				);
			}
		},
	});
}

function validarCampos(tipoIngreso, validaCrear, validaEditar) {
	if (validaEditar == 1 || validaCrear == 0) {
		$("[id=formSolIngreso]")[0].reset();
		$("[id=fechaFin]").val(moment().format("YYYY-MM-DD HH:mm"));
		$("[id=fechaIni]").val(moment().format("YYYY-MM-DD HH:mm"));
	}
	tipoIngresoId = tipoIngreso;
	$("[id=InfoTer], .otroProveedor, .empresaId, .dependenciaOrigen").removeClass(
		"d-none"
	);
	for (var ingresos of $TipoIngreso) {
		if (ingresos["TipoIngresoId"] == tipoIngresoId) {
			parametroIngreso = ingresos;
		}
	}
	if (parametroIngreso.SolicitaDependencia == 1) {
		if ($valDepen.length === 0) {
			alertify.error(
				"Debe asignar dependencias a su usuario para continuar con la solicitud."
			);
			setTimeout(() => {
				$("#btnRegistrarSol").attr("disabled", true);
			}, 100);
		}
		$(".DependediaCl").removeClass("d-none");
		$("[id=dependendiasInDes]")
			.attr("required", "required")
			.css("border-color", "red");
	} else {
		$(".DependediaCl").addClass("d-none");
		$("#dependendiasInDes, #dependendiasIn").val("");
		$("#dependendiasInDes, #dependendiasIn").trigger("chosen:updated");
		$("[id=dependendiasInDes]").removeAttr("required").css("border-color", "");
	}
	if (
		parametroIngreso.SolicitaEmpresa == 1 &&
		parametroIngreso.EmpresaOtra == 1
	) {
		setTimeout(() => {
			$("[id=InfoProvee] , [id=OtroProvee]").removeClass("d-none");

			$("[id=empresaId],[id=otroProveedor] ").on(
				"change focusout",
				function (e) {
					if (e.target.id == "empresaId" && e.target.value != "") {
						$("[id=otroProveedor]").removeClass("input-invalid");
						$("[id=empresaId], [id=otroProveedor]").removeClass("is-invalid");
						$("[id=otroProveedor]").removeAttr("required");
						$("[id=empresaId], [id=NombreEmp]").attr("required", "required");
						$("[id=NombreEmp]").attr("name", "NombreEmpresa");
						$("[id=otroProveedor]").attr("disabled", true);
					} else if (e.target.id == "otroProveedor" && e.target.value != "") {
						$("[id=empresaId]").removeClass("input-invalid");
						$("[id=empresaId], [id=otroProveedor]").removeClass("is-invalid");
						$("[id=empresaId], [id=NombreEmp]").removeAttr("required");
						$("[id=otroProveedor]").attr("required", "required");
						$("[id=otroProveedor]").attr("name", "NombreEmpresa");
						$("[id=empresaId]").attr("disabled", true);
					} else if (e.target.value == "") {
						$("[id=otroProveedor]").attr("required");
						$("[id=empresaId], [id=NombreEmp]").attr("required");
						$("[id=empresaId], [id=otroProveedor]").removeAttr(
							"disabled",
							false
						);
						$("[id=NombreEmp]").removeAttr("name", "NombreEmpresa");
						$("[id=otroProveedor]").removeAttr("name", "NombreEmpresa");
					}
				}
			);
		}, 100);
	} else {
		$("[id=InfoProvee], [id=OtroProvee]").addClass("d-none");
		$("[id=empresaId], [id=otroProveedor], [id=NombreEmp]").removeAttr(
			"required"
		);
		$("[id=otroProveedor], [id=NombreEmp]").removeAttr("name");

		if (
			parametroIngreso.SolicitaEmpresa == 1 &&
			parametroIngreso.EmpresaOtra == 0
		) {
			$("[id=InfoProvee]").removeClass("d-none");
			$("[id=empresaId], [id=NombreEmp]").attr("required", "required");
			$("[id=NombreEmp]").attr("name", "NombreEmpresa");
		} else {
			$("[id=InfoProvee]").addClass("d-none");
			$("[id=empresaId], [id=NombreEmp]").removeAttr("required");
			$("[id=NombreEmp]").removeAttr("name");
		}
		if (
			parametroIngreso.EmpresaOtra == 1 &&
			parametroIngreso.SolicitaEmpresa == 0
		) {
			$("[id=OtroProvee]").removeClass("d-none");
			$("[id=otroProveedor]").attr("required", "required");
			$("[id=otroProveedor]").attr("name", "NombreEmpresa");
		} else {
			$("[id=OtroProvee]").addClass("d-none");
			$("[id=otroProveedor]").removeAttr("required");
			$("[id=otroProveedor]").removeAttr("name");
		}
	}
	if (
		parametroIngreso.PermiteAdjuntos == 1 &&
		parametroIngreso.SolicitaSeguridadSocial == 1 &&
		(validaCrear == 1 || validaEditar == 1)
	) {
		AnexObl = 1;
		PerAnex = 1;
		$("[id=InfoAnex], .verInSolicitud").removeClass("d-none");
		setTimeout(() => {
			$("#DocSegSocial").click();
		}, 50);
	} else {
		AnexObl = 0;
		PerAnex = 0;
		$("[id=InfoAnex]").addClass("d-none");

		if (
			parametroIngreso.PermiteAdjuntos == 1 &&
			parametroIngreso.SolicitaSeguridadSocial == 0 &&
			(validaCrear == 1 || validaEditar == 1)
		) {
			AnexObl = 0;
			PerAnex = 1;
			setTimeout(() => {
				$("[id=InfoAnex], .verInSolicitud").removeClass("d-none");
				$("[id=DocSegSocial],[id=DocSegSocialLabel]").addClass("invisible");
				$("[id=DocOtrArchivo]").attr("disabled", false);
				$("[id=DocOtrArchivo]").click();
			}, 100);
		} else {
			AnexObl = 0;
			PerAnex = 0;
			$("[id=DocSegSocial],[id=DocSegSocialLabel]").removeClass("invisible");
			$("[id=DocOtrArchivo]").attr("disabled", false);
			$("[id=InfoAnex]").addClass("d-none");
		}
		if (
			parametroIngreso.PermiteAdjuntos == 0 &&
			parametroIngreso.SolicitaSeguridadSocial == 1 &&
			(validaCrear == 1 || validaEditar == 1)
		) {
			AnexObl = 1;
			PerAnex = 0;
			setTimeout(() => {
				$("[id=InfoAnex], .verInSolicitud").removeClass("d-none");
				$("[id=DocOtrArchivo],[id=DocOtrArchivoLabel]").addClass("invisible");
				$("[id=DocSegSocial]").attr("disabled", false);
				if (!$("[id=DocSegSocial]").is(":checked")) {
					$("[id=DocSegSocial]").click();
				}
				$("[id=DocSegSocial]").attr("disabled", true);
			}, 100);
		} else {
			AnexObl = 0;
			PerAnex = 0;
			$("[id=DocOtrArchivo],[id=DocOtrArchivoLabel]").removeClass("invisible");
			$("[id=DocSegSocial]").attr("disabled", false);
			$("[id=InfoAnex]").addClass("d-none");
		}
	}
	if (
		(parametroIngreso.PermiteAdjuntos == 1 ||
			parametroIngreso.SolicitaSeguridadSocial == 1) &&
		validaEditar == 1 &&
		ValidaCrear == 0
	) {
		cargarTablasAdd(true, true);
	} else if (
		(parametroIngreso.PermiteAdjuntos == 0 ||
			parametroIngreso.SolicitaSeguridadSocial == 0) &&
		validaEditar == 1 &&
		ValidaCrear == 0
	) {
		cargarTablasAdd(false, true);
	} else if (
		((parametroIngreso.PermiteAdjuntos == 1 &&
			parametroIngreso.SolicitaSeguridadSocial == 0) ||
			(parametroIngreso.PermiteAdjuntos == 0 &&
				parametroIngreso.SolicitaSeguridadSocial == 1) ||
			(parametroIngreso.PermiteAdjuntos == 1 &&
				parametroIngreso.SolicitaSeguridadSocial == 1)) &&
		ValidaCrear == 1
	) {
		cargarTablasAdd(true);
	}
}

function validarTercerosAnexos(registro) {
	$("[id=TipoIngresoId]").trigger("chosen:updated");
	$("#terceroAnexo").empty();
	$("#terceroAnexo").append(`<option selected value="-1">TODOS</option>`);
	registro.forEach((it) => {
		$("#terceroAnexo").append(
			`<option value="${it.SolicitudId}">${it.nombre}</option>`
		);
	});
	$("#terceroAnexo").trigger("chosen:updated");
}

function modificarEstadosolicitud(
	SolicitudId,
	autorizar,
	TipoIngresoId,
	autorizaGeneral = 0,
	NombreTercero = ""
) {
	$("#comentarioAuto").val("");
	alertify.confirm(
		"Advertencia",
		`¿Está seguro de  ${
			autorizar == 1 ? "Autorizar" : "Rechazar"
		}  la solicitud ${SolicitudId} ${
			NombreTercero == "" ? "" : "Tercero : " + NombreTercero
		} ?
        <div class="col-12 mt-3 pl-0 pr-0">
            <textarea id="comentarioAuto" class="form-control form-control-sm form-control-floating" rows="5"
                value="" maxlength="255" data-db="comentarioAuto" style="overflow-y:hidden;"></textarea>
            <label class="floating-label" for="comentarioAuto">Observación</label>
        </div>`,
		function () {
			comentarioAut = $("#comentarioAuto").val();
			dependenciasAut = $("#dependenciaAuto").val();
			$.ajax({
				url: rutaGeneral + "modificarEstadosolicitud",
				type: "POST",
				dataType: "json",
				data: {
					SolicitudId,
					autorizar,
					TipoIngresoId,
					comentarioAut,
					dependenciasAut,
					SolicituAut,
					autorizaGeneral,
				},
				success: function (registro) {
					mensaje = "";
					if (registro.consulta == 1) {
						if (registro.SolicitudesAprobadas != false) {
							mensaje += `<br><h5>Las siguientes solicitudes han sido ${
								autorizar == 1
									? '<span class="text-success">autorizadas</span>'
									: '<span class="text-danger">rechazadas</span>'
							} satisfactoriamente:</h5>`;
							Object.keys(registro.SolicitudesAprobadas).forEach((element) => {
								mensaje += `<strong>${element}</strong><ul>`;
								registro.SolicitudesAprobadas[element].forEach((elemento) => {
									mensaje += `<li>${
										elemento.DependenciaId + " | " + elemento.Nombre
									}</li>`;
								});
								mensaje += `</ul>`;
							});
						}
						if (registro.AutRegistrados != false) {
							mensaje += `<br><h5>Las siguientes solicitudes ya poseen un registro de <span class="text-success">autorización</span> o <span class="text-danger">rechazo</span> por las dependencias seleccionadas:</h5>`;
							Object.keys(registro.AutRegistrados).forEach((element) => {
								mensaje += `<strong>${element}</strong><ul>`;
								registro.AutRegistrados[element].forEach((elemento) => {
									mensaje += `<li>${
										elemento.DependenciaId + " | " + elemento.Nombre
									}</li>`;
								});
								mensaje += `</ul>`;
							});
						}
						if (registro.SolicitudesNoSeg.length > 0) {
							mensaje += `<h5>Las siguientes solicitudes no <span class="text-danger">poseen una seguridad social válida</span> para su respectiva aprobación:</h5>`;
							registro.SolicitudesNoSeg.forEach((element) => {
								mensaje += `<br><ul class="p-0"><strong>${element}</strong></ul>`;
							});
						}
						alertify
							.alert("<h4>Confirmación</h4>", mensaje)
							.set("label", "Aceptar");
						$(".ajs-content").css("padding", "0px");
						tblAutorizaciones.ajax.reload();
						cargarDatosTabla(SolicitudId);
						tblAnexos.ajax.reload();
						$("#RegistroSolicitudIngresoMod").removeClass("d-none");
					} else {
						alertify.error(
							"Por favor adjunte una seguridad social valida para la autorización."
						);
						$("#RegistroSolicitudIngresoMod").removeClass("d-none");
					}
				},
			});
		},
		function () {
			$("#RegistroSolicitudIngresoMod").removeClass("d-none");
		}
	);
}

function guardarFechas(formData) {
	$.ajax({
		url: rutaGeneral + "registrarFechas",
		type: "POST",
		dataType: "json",
		processData: false,
		contentType: false,
		async: false,
		data: formData,
		dataType: "json",
		success: (resp) => {
			tblAnexos.ajax.reload();
			cargarDatosTabla(idSolicitudSol);
			alertify.success("Se han registrado las nuevas fechas");
		},
	});
}

function cargarTablasAdd(tablaNexo, tablaComen, tablaNexo2) {
	if (tablaNexo) {
		if (tblAnexos) {
			tblAnexos.columns().clear();
			tblAnexos.destroy();
			tblAnexos = null;
			CantAnex = 0;
		}

		if (!registroSolicitud) {
			registroSolicitud = SolicituAut;
		}
		tblAnexos = $("[id=tblAnexos]").DataTable({
			scrollX: "100%",
			scrollCollapse: false,
			serverSide: true,
			retrieve: true,
			pageLength: 10,
			language: {
				infoEmpty: "",
			},
			buttons: buttonsDT(["copy", "excel", "pdf", "print", "pageLength"]),
			paginate: true,
			ajax: {
				url: rutaGeneral + "DTAnexos",
				type: "POST",
				data: function (d) {
					return $.extend(d, { SolicituAut, registroSolicitud });
				},
			},
			columns: [
				{ data: "Consecutivo" },
				{ data: "nombreTer" },
				{ data: "Nombre", className: "AdjuntoAnexEdit" },
				{ data: "Tipo", width: "auto" },
				{
					data: "FechaInicio",
					targets: ["FechaInicio"],
					className: "fechaInicio datetimepicker",
				},
				{
					data: "FechaVencimiento",
					className: "fechaVencimiento datetimepicker",
					targets: ["FechaVencimiento"],
				},
				{ data: "FechaRegistro" },
				{
					data: "Ruta",
					className: "Ruta",
					orderable: false,
				},
			],
			initComplete: function () {
				setTimeout(() => {
					$(window).trigger("resize");
				}, 1000);
			},
			drawCallback: function (settings) {},
			createdRow: function (row, data, dataIndex) {
				ver = `
                        <a href="${
													base_url() +
													"uploads/" +
													$nit +
													"/SolicitudIngreso/" +
													data.Consecutivo +
													"/" +
													data.Ruta
												}" target="_blank" class="verAnexo btn btn-success btn-xs" title="Ver" style="transition:0.4s;"><i class="fas fa-eye"></i></a>
                        <button type="button" class="editarFechas  d-none btn btn btn-primary btn-xs " title="Editar Fechas"><i class="fas fa-edit"></i></button>
                        <button type="button" value="${
													data.Id
												}" class="guardarFecha btn btn-success btn-xs d-none" title="Guardar Fechas"><i class="fas fa-check"></i></button>
                        <button type="button" class="cancelarEdit btn btn-danger btn-xs d-none" title="Cancelar"><i class="fas fa-times"></i></button>
                        <button type="button" class="eliAnexo btn btn-danger btn-xs " title="Eliminar"><i class="fas fa-prescription-bottle"></i></button>
                        `;

				$(row).find(".Ruta").html(ver);

				// if (validarvistaDoc) {
				// 	$(".eliAnexo", this).addClass("d-none");
				// }

				// if (editarFechas) {
				// 	$(".editarFechas").removeClass("d-none");
				// }

				if (data.EstadoSol != "RECHAZADA") {
					$(row).find("td:last .eliAnexo").addClass("d-none");
					if (editarFechas) {
						$(row).find("td:last .editarFechas").removeClass("d-none");
					}
				} else {
					$(row).find("td:last .editarFechas").removeClass("d-none");
				}

				$(row).on("click", ".editarFechas", function (e) {
					$(row)
						.find("td.AdjuntoAnexEdit")
						.html(
							`<label for="AdjuntoAnex" class="btn btn-success btn-xs has-ripple"><i class="fas fa-upload"></i></label>
							<input  type="file" name="AdjuntoAnex" id="AdjuntoAnex" style="display:none;"  accept=".gif, .jpg, .png, .pdf, .xlsx, .docx, .xls, .doc, .txt, .jpeg" />`
						);

					$(row)
						.find("td.fechaInicio")
						.html(
							'<input type="text" id="fechaInicio' +
								data.Id +
								'" class="fechaInicio form-control input-group form-control-sm mFecha form-control-floating" data-formato="YYYY-MM-DD" tabindex="1" style="width:100%">'
						);
					$(row).find("td.fechaInicio input").val(data.FechaInicio);

					$(row)
						.find("td.fechaVencimiento")
						.html(
							'<input type="text" id="fechaVencimiento' +
								data.Id +
								'" class="fechaVencimiento input-group form-control form-control-sm mFecha form-control-floating" data-formato="YYYY-MM-DD" tabindex="1" style="width:100%">'
						);
					$(row).find("td.fechaVencimiento input").val(data.FechaVencimiento);

					// $(row).find("td:last .eliAnexo").addClass("d-none");
					$(row).find("td:last .verAnexo").addClass("d-none");
					// $(row).find("td:last .editarFechas").addClass("d-none");
					$(row).find("td:last .guardarFecha").removeClass("d-none");
					$(row).find("td:last .cancelarEdit").removeClass("d-none");

					$("#fechaInicio" + data.Id)
						.focus()
						.click();
					$("#mFecha").modal("show");

					$("#mFecha").on("hidden.bs.modal", function () {
						$("body").addClass("modal-open");
					});
				});

				$(row).on("click", ".cancelarEdit", function (e) {
					e.preventDefault();
					tblAnexos.ajax.reload();
				});

				$(row).on("click", ".guardarFecha", function (e) {
					e.preventDefault();
					var id = $(this).val();

					FechaInicio = $(row).find(".fechaInicio input").val();
					fechaVencimiento = $(row).find(".fechaVencimiento input").val();

					if (FechaInicio == "") {
						alertify.warning("El campo fecha inicio no puede estar vacio");
						$("#fechaInicio" + id).focus();
						return false;
					}

					if (fechaVencimiento == "") {
						alertify.warning("El campo fecha final no puede estar vacio");
						$("#fechaVencimiento" + id).focus();
						return false;
					}

					var anexoDoc = $(row).find(".AdjuntoAnexEdit input").prop("files")[0];
					var formData = new FormData();
					formData.append("file", anexoDoc);

					formData.append("id", id);
					formData.append("FechaInicio", FechaInicio);
					formData.append("fechaVencimiento", fechaVencimiento);
					formData.append("Consecutivo", SolicituAut);

					guardarFechas(formData);
				});

				validSS = data["Tipo"];
				if (validSS == "SEGURIDAD SOCIAL") {
					CantAnex = 1;
				}

				$(row)
					.addClass("text-center")
					.on("click", ".eliAnexo", function (e) {
						e.preventDefault();
						//DESABILITAMOS ANEXO
						alertify.confirm(
							"Advertencia",
							"¿Está seguro de eliminar el documento?",
							function () {
								$.ajax({
									type: "POST",
									url: rutaGeneral + "eliminarAnexo",
									data: {
										Id: data.Id,
									},
									dataType: "json",
									success: function (resp) {
										tblAnexos.columns.adjust().draw();
									},
								});
							},
							function () {}
						);
					});
			},
		});
	}

	if (tablaComen) {
		if (tblcomentarios) {
			tblcomentarios.columns().clear();
			tblcomentarios.destroy();
			tblcomentarios = null;
		}
		tblcomentarios = $("[id=tblComentarios]").DataTable({
			scrollX: "100%",
			scrollCollapse: false,
			serverSide: true,
			retrieve: true,
			pageLength: 10,
			language: {
				infoEmpty: "",
			},
			buttons: buttonsDT(["copy", "excel", "pdf", "print", "pageLength"]),
			paginate: true,
			ajax: {
				url: rutaGeneral + "DTcomentarios",
				type: "POST",
				data: function (d) {
					d.registroSolicitud =
						SolicituAut !== undefined ? SolicituAut : registroSolicitud;
				},
			},
			columns: [
				{ data: "FechaRegistro" },
				{ data: "nombre" },
				{ data: "Comentario" },
				{ data: "Autorizo" },
				{ data: "TerceroId" },
				{ data: "nombreTer" },
				{ data: "SolicitudId" },
				{ data: "nombreDepen" },
			],
			initComplete: function (row, data, dataIndex) {
				setTimeout(() => {
					$(window).trigger("resize");
				}, 1000);
			},
		});
	}

	if (tablaNexo2) {
		if (tblAnexos2) {
			tblAnexos2.columns().clear();
			tblAnexos2.destroy();
			tblAnexos2 = null;
		}
		tblAnexos2 = $("[id=tblAnexos2]").DataTable({
			scrollX: "100%",
			scrollCollapse: false,
			serverSide: true,
			retrieve: true,
			pageLength: 10,
			language: {
				infoEmpty: "",
			},
			paginate: true,
			ajax: {
				url: rutaGeneral + "DTAnexos",
				type: "POST",
				data: function (d) {
					return $.extend(d, { SolicituAut, registroSolicitud });
				},
			},
			buttons: buttonsDT(["copy", "excel", "pdf", "print", "pageLength"]),
			columns: [
				{ data: "SolicitudId" },
				{ data: "Nombre" },
				{ data: "Tipo" },
				{ data: "FechaInicio" },
				{ data: "FechaVencimiento" },
				{ data: "FechaRegistro" },
				{
					data: "Ruta",
					className: "text-center",
					render: function (data, type, row) {
						urlDoc = data;
						ver = `
                        <a href="${
													base_url() +
													"uploads/" +
													$nit +
													"/SolicitudIngreso/" +
													registroSolicitud +
													"/" +
													urlDoc
												}" target="_blank" class="verAnexo btn btn-info btn-xs " title="Ver" style="transition:0.4s;"><i class="fas fa-eye"></i></a>`;
						return ver;
					},
					orderable: false,
				},
			],
			initComplete: function () {
				setTimeout(() => {
					$(window).trigger("resize");
				}, 1000);
			},
		});
	}
}

function soloLetrasNumeros(e) {
	key = e.keyCode || e.which;
	tecla = String.fromCharCode(key).toLowerCase();
	letras = "abcdefghijklmnopqrstuvwxyz1234567890+-*/";
	especiales = "8-37-39-46";

	tecla_especial = false;

	for (var i in especiales) {
		if (key == especiales[i]) {
			tecla_especial = true;
			break;
		}
	}

	if (letras.indexOf(tecla) == -1 && !tecla_especial) {
		return false;
	}
}

//Funcion del lector
function propForm(prop) {
	$("button, select").prop("disabled", prop);
	$("input, a, textarea").not("#codigo, #checkLector").prop("readonly", prop);
	setTimeout(function () {
		$(inputChecked).focus();
	}, 0);
}

function inputBlur() {
	clearTimeout(timing);
	if ($(inputChecked).val().trim().length >= minChars) {
		userFinishedEntering = true;
		inputComplete();
	}
}

function resetValues() {
	barra = [];
	textoBarra = "";
	scanner = false;

	inputStart = null;
	inputStop = null;
	firstKey = null;
	lastKey = null;
	setTimeout(function () {
		$("#codigo").val("").focus();
	}, 0);
	inputComplete();
}

function isScannerInput() {
	return (
		(inputStop - inputStart) / $(inputChecked).val().trim().length < 30 &&
		$(inputChecked).val() != ""
	);
}

function isUserFinishedEntering() {
	return !isScannerInput() && userFinishedEntering;
}

function inputTimeoutHandler() {
	// stop listening for a timer event
	clearTimeout(timing);
	// if the value is being entered manually and hasn't finished being entered
	if (!isUserFinishedEntering() || $(inputChecked).val().trim().length < 3) {
		// keep waiting for input
		return;
	} else {
		reportValues();
	}
}

function inputComplete() {
	// stop listening for the input to lose focus
	$("body").off("blur", inputChecked, inputBlur);
	// report the results
	reportValues();
}

function reportValues() {
	// update the metrics
	$("#startTime").text(inputStart == null ? "" : inputStart);
	$("#firstKey").text(firstKey == null ? "" : firstKey);
	$("#endTime").text(inputStop == null ? "" : inputStop);
	$("#lastKey").text(lastKey == null ? "" : lastKey);
	$("#totalTime").text(
		inputStart == null ? "" : inputStop - inputStart + " milliseconds"
	);
	if (!inputStart) {
		// clear the results
		setTimeout(function () {
			$(inputChecked).focus().select();
		}, 3000);
	} else {
		// prepend another result item
		var inputMethod = isScannerInput() ? "Scanner" : "Keyboard";
		if (isScannerInput()) {
			scanner = true;
			if (barra.length == 0) {
				barra.push(textoBarra.trim());
				textoBarra = "";
			}
		}
		setTimeout(function () {
			$(inputChecked).focus().select();
		}, 0);
		inputStart = null;
	}
}

function setDependenciasAut(data) {
	$.ajax({
		url: rutaGeneral + "validarDependenciasAut",
		type: "POST",
		dataType: "json",
		async: false,
		data: {
			SolicitudId:
				data.Consecutivo != null ? data.Consecutivo : data.SolicitudId,
		},
		success: function (registro) {
			selectAut = $(".dependenciaAuto");
			registro.forEach(function (opcion) {
				var opciones =
					'<option value="' +
					opcion.DependenciaId +
					'">' +
					opcion.Nombre +
					"</option>";
				selectAut.append(opciones);
			});
			selectAut.trigger("chosen:updated");
		},
	});
}

setInterval(function () {
	barra = [];
	textoBarra = "";
	scanner = false;

	inputStart = null;
	inputStop = null;
	firstKey = null;
	lastKey = null;
}, 2000);

function InactivaEstadosolicitud(
	SolicitudId,
	TipoIngresoId,
	NombreTercero = ""
) {
	arrayTercro = [];
	if (SolicitudId) {
		arrayTercro.push(SolicitudId);
	} else {
		arrayTercro = arrayTercerosAprobados;
	}

	$("#comentarioAuto").val("");
	alertify.confirm(
		"Advertencia",
		`¿Está seguro de Inactivar la solicitud ${
			SolicitudId ? SolicitudId : "de "
		} ${
			NombreTercero == ""
				? "todos los terceros Aprobados"
				: "Tercero : " + NombreTercero
		} ?
        <div class="col-12 mt-3 pl-0 pr-0">
            <textarea id="comentarioAuto" class="form-control form-control-sm form-control-floating" rows="5"
                value="" maxlength="220" data-db="comentarioAuto" style="overflow-y:hidden;"></textarea>
            <label class="floating-label" for="comentarioAuto">Observación</label>
        </div>`,
		function () {
			comentarioAut = $("#comentarioAuto").val();
			$.ajax({
				url: rutaGeneral + "RechazaEstadosolicitud",
				type: "POST",
				dataType: "json",
				data: {
					TipoIngresoId,
					comentarioAut,
					arrayTercro,
				},
				success: function (registro) {
					mensaje = "";
					if (registro == 1) {
						mensaje += `<br><p>Los terceros se han inactivado satisfactoriamente:</p>`;
						alertify
							.alert("Historial registros", mensaje)
							.set("label", "Aceptar");
						$("#RegistroSolicitudIngresoMod").removeClass("d-none");
						if (arrayTercro.length > 1)
							$("#RegistroSolicitudIngresoMod").modal("hide");
						tblTerceros.clear().draw();
						IngresardatosModal(idSolicitudSol, idConsecutivoSol);
						tblSolicitudes.ajax.reload();
						tblAutorizaciones.ajax.reload();
						tblAnexos.ajax.reload();
					} else {
						alertify.error("Ocurrio un error");
					}
				},
			});
		},
		function () {
			$("#RegistroSolicitudIngresoMod").removeClass("d-none");
		}
	);
}

function actualizarSolicitudTercero(DataTerceros) {
	let texto = DataTerceros.length > 1 ? "s" : "";
	alertify.confirm(
		"Advertencia",
		"¿Está seguro de reactivar los terceso" +
			texto +
			" rechazado" +
			texto +
			" ?",
		function () {
			$.ajax({
				url: rutaGeneral + "actualizarSolicitudTercero",
				type: "POST",
				dataType: "json",
				data: { DataTerceros },
				async: false,
				success: function (resp) {
					if (resp.valido) {
						alertify.success(resp.message);
						cargarDatosTabla(DataTerceros[0].SolicitudId);
						tblTerceros.column(6).visible(false);
						tblTerceros.column(3).visible(true);

						setTimeout(() => {
							tblAnexos.ajax.reload();
						}, 1000);
					} else {
						alertify.error(resp.message);
					}
				},
			});
		},
		function () {}
	);
}

function consultarEstadoSolictud(idConsecutivo, idSolicitud, valor) {
	$.ajax({
		url: rutaGeneral + "consultarEstadoSolictud",
		type: "POST",
		dataType: "json",
		data: { idConsecutivo },
		async: false,
		success: function (resp) {
			if (!resp.valido) {
				//DESABILITAMOS LA SOLICITUD
				alertify.confirm(
					"Advertencia",
					"¿Está seguro de eliminar la solicitud " + valor + "?",
					function () {
						$.ajax({
							type: "POST",
							url: rutaGeneral + "deshabilitarSolicitud",
							data: {
								idSolicitud,
								idConsecutivo,
							},
							dataType: "json",
							success: function (resp) {
								tblAutorizaciones.ajax.reload();
								tblSolicitudes.ajax.reload();
								alertify.success("Solicitud eliminada correctamente.");
							},
						});
					},
					function () {}
				);
			} else {
				alertify.error(resp.message);
			}
		},
	});
}
