let rutaGeneral =
	base_url() + "Administrativos/Eventos/Parametrizacion/TiposEvento/";
let editarTipoEvento = 0;

let tblCoti = new TblCuerpo("#tblCoti", "AplicaCotizacion");
let tblOT = new TblCuerpo("#tblOT", "AplicaOT");
let tblContra = new TblCuerpo("#tblContra", "AplicaContrato");

const objCuerpos = {
	cotizaciones: [],
	ots: [],
	contratos: [],
};

let tblTiposEvento = $("#tblTiposEvento").DataTable({
	dom: domBftrip,
	fixedColumns: true,
	serverSide: true,
	pageLength: 10,
	scrollX: true,
	ajax: {
		url: rutaGeneral + "cargarDT",
		type: "POST",
		data: function (d) {},
	},
	buttons: buttonsDT(
		["copy", "excel", "pdf", "print"],
		[
			{
				className: "btnCrear btnFiltros",
				attr: { title: "Crear", "data-toggle": "modal" },
				text: '<i class="fas fa-plus"></i> <strong> Crear Tipo De Evento</strong>',
			},
		]
	),
	columns: [
		{
			data: "Imagen",
			width: "8%",
			className: "text-center imagen-evento",
			orderable: false,
			render: function (data) {
				let imagen = `uploads/${NIT()}/TipoEvento/${data}`;
				if (!data) {
					imagen = `assets/images/user/nofoto.png`;
				}
				return `<img width="100%" class="mw-100" src="${
					base_url() + imagen
				}" alt="Imagen Evento">`;
			},
		},
		{ data: "Nombre", width: "21%" },
		{ data: "Porcentaje", width: "10%" },
		{ data: "DiaAlerta", width: "10%" },
		{ data: "NombreEstado", width: "10%", className: "text-center" },
		{
			data: "TipoEventoId",
			width: "10%",
			className: "text-center noExport",
			orderable: false,
			render: function (meta, type, data, meta) {
				btnEditar = `<button class="editarTipo btn btn-secondary btn-xs" title="Editar"><i class="fas fa-edit"></i></button>`;
				btnEliminar = `<button class="eliminarEstado btn btn-danger btn-xs" title="Eliminar"><i class="fas fa-trash"></i></button>`;
				return btnEditar + " " + btnEliminar;
			},
		},
	],
	createdRow: function (row, data, dataIndex) {
		let codigo = data.TipoEventoId;
		$(row)
			.find(".editarTipo")
			.click(function () {
				informacion({ codigo }, "obtenerTipoEvento", "dataTipoEvento");
			});

		$(row)
			.find(".eliminarEstado")
			.click(function () {
				informacion({ codigo }, "obtenerTipoEvento", "dataTipoEventoEliminar");
			});
	},
});

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

function tipoEventoCreado({ success, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		$("#modalTipoEvento").modal("hide");
		alertify.success(msj);
		tblTiposEvento.ajax.reload();
		limpiarDatos();
	}
}

function busquedaProducto({ success, producto }) {
	if (success) {
		$("#ProductoId")
			.closest(".input-group")
			.find(".nombre-prod")
			.html(producto.nombre);
	} else {
		$("#ProductoId").val("");
		$("#ProductoId").closest(".input-group").find(".nombre-prod").html("");

		$("#modalTipoEvento").modal("hide");
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
							$("#modalTipoEvento").modal("show");
						},
						onshow: function () {
							busqueda = true;
						},
					});
					alertify.myAlert(data);

					dtSS({
						data: {
							tblID: "#tblBusqueda",
						},
						ajax: {
							url: rutaGeneral + "DTBuscarProducto",
							type: "POST",
						},
						bAutoWidth: false,
						columnDefs: [{ targets: [0], width: "3%" }],
						ordering: false,
						draw: 10,
						pageLength: 10,
						oSearch: { sSearch: $("#ProductoId").val() },
						createdRow: function (row, data, dataIndex) {
							$(row).click(function () {
								$("#ProductoId").val(data[0]).change();
								alertify.myAlert().close();
							});
						},
						scrollY: screen.height - 400,
						scroller: {
							loadingIndicator: false,
						},
						dom: domftri,
					});
				},
			});
		};
		var campos = encodeURIComponent(JSON.stringify(["ProductoId", "Nombre"]));
		alertify.ajaxAlert(base_url() + "Busqueda/DataTable?campos=" + campos);
	}
}

function informacion(data, ruta, funcion, noProcess = false) {
	let info = {
		url: rutaGeneral + ruta,
		type: "POST",
		dataType: "json",
		data: data,
		cache: false,
		success: (resp) => {
			if (funcion) {
				this[funcion](resp);
			}
		},
		error: (err) => {
			console.error("errro ", err);
			alertify.error("No fue posible obtener los datos");
		},
	};

	if (noProcess) {
		info = {
			...info,
			processData: false,
			contentType: false,
			dataType: "json",
			cache: false,
			encType: "multipart/form-data",
		};
	}

	$.ajax(info);
}

function dataTipoEvento({ success, tipoEvento, cuerpos, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		editarTipoEvento = tipoEvento.TipoEventoId;
		$("#btnCrearTipoEvento").html('<i class="fas fa-edit"></i> Modificar');
		Object.keys(tipoEvento).forEach((item) => {
			$("#" + item).val(tipoEvento[item]);
		});
		let icono = `uploads/${NIT()}/TipoEvento/${tipoEvento.Imagen}`;
		$("#eliminarImagen").show();
		if (!tipoEvento.Imagen) {
			$("#eliminarImagen").hide();
			icono = `assets/images/user/nofoto.png`;
		}
		$(".icon-container")
			.children("img")
			.attr("src", `${base_url() + icono}?${Math.random()}`);
		$("#ProductoId").closest(".input-group").find(".nombre-prod").html("");
		if (tipoEvento.ProductoId) {
			$("#ProductoId").change();
		}

		tblCoti.setData(cuerpos.tblCoti);
		tblOT.setData(cuerpos.tblOT);
		tblContra.setData(cuerpos.tblContra);

		$("#modalTipoEvento").modal("show");
	}
}

function dataTipoEventoEliminar({ success, tipoEvento, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		alertify.confirm(
			"Advertencia",
			`¿Está seguro de eliminar el tipo de evento <strong>` +
				tipoEvento.Nombre +
				`</strong>?`,
			function () {
				let data = {
					Id: tipoEvento.TipoEventoId,
				};
				informacion(data, "eliminarTipoEvento", "tipoEventoEliminado");
			},
			function () {}
		);
	}
}

function tipoEventoEliminado({ success, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		alertify.success(msj);
	}
	tblTiposEvento.ajax.reload();
}

function limpiarDatos() {
	editarTipoEvento = 0;
	$("#formularioCrearTipoEvento")[0].reset();
	$(".form-control").removeClass("input-invalid");
	$("#formularioCrearTipoEvento :input").removeClass("is-invalid");
	$("#formularioCrearTipoEvento").validate().resetForm();
	$("#btnCrearTipoEvento").html('<i class="fas fa-save"></i> Crear');
	$(".icon-container")
		.children("img")
		.attr("src", `${base_url()}assets/images/user/nofoto.png?${Math.random()}`);
	$("#eliminarImagen").hide();

	tblCoti.setData([]);
	tblOT.setData([]);
	tblContra.setData([]);
}

$(function () {
	RastreoIngresoModulo("Tipos Evento");
	$("#eliminarImagen").hide();

	$(".icon-container").click(function (e) {
		let id = $(this).parent().children("input").attr("id");
		let actual = $(this);
		$("#" + id).click();
		$("#" + id).on("change", function (evt) {
			let file = $(this).prop("files")[0];
			if (file) {
				let reader = new FileReader();
				reader.onloadend = function () {
					actual.children("img").attr("src", reader.result);
					$("#eliminarImagen").show();
				};
				reader.readAsDataURL(file);
			}
		});
	});

	$("#formularioCrearTipoEvento").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			let formulario = new FormData(this);
			formulario.append("imagen", $("#eliminarImagen").is(":hidden"));
			formulario.append("editarTipoEvento", editarTipoEvento);
			formulario.append("tblCoti", JSON.stringify(tblCoti.getData()));
			formulario.append("tblOT", JSON.stringify(tblOT.getData()));
			formulario.append("tblContra", JSON.stringify(tblContra.getData()));

			if (!$("#inputIcon").prop("files").length) {
				formulario.delete("Icono");
			}

			informacion(formulario, "crearTipoEvento", "tipoEventoCreado", true);
		} else {
			alertify.error("Valide la información de los campos.");
		}
	});

	$("#eliminarImagen").on("click", function () {
		$("#eliminarImagen").hide();
		$(".icon-container")
			.children("img")
			.attr(
				"src",
				`${base_url()}assets/images/user/nofoto.png?${Math.random()}`
			);
	});

	$("#cancelarCrearTipoEvento").click(function () {
		limpiarDatos();
	});

	$("#ProductoId").on("change", function (e) {
		e.preventDefault();
		let codigo = $(this).val();

		informacion({ codigo }, "validarProducto", "busquedaProducto");
	});

	$(".decimal").inputmask("decimal", {
		integerDigits: 3,
		digits: 2,
		rightAlign: false,
	});

	$(document).on("click", ".btnCrear", function (event) {
		event.preventDefault();
		$("#modalTipoEvento").modal("show");
		$("#ProductoId").closest(".input-group").find(".nombre-prod").html("");
		limpiarDatos();
	});

	// Cuerpos de documentos
});
