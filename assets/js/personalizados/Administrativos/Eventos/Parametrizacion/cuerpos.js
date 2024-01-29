const rutaGeneral =
		base_url() + "Administrativos/Eventos/Parametrizacion/Cuerpos/",
	tmpCuerpo = {
		CuerpoId: -1,
		Nombre: "",
		Estado: "",
		Texto: "",
		AplicaCotizacion: 0,
		AplicaOT: 0,
		AplicaContrato: 0,
	};

let editarMedioReserva = 0,
	codEditarMedioReserva = 0;

var tblMedioReserva = $("#tblMedioReserva").DataTable({
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
				className: "btnFiltros",
				attr: { title: "Crear", "data-toggle": "modal" },
				text: '<i class="fas fa-plus"></i> <strong> Crear Cuerpo</strong>',
			},
		]
	),
	columns: [
		{
			data: "CuerpoId",
			width: "10%",
			className: "text-center",
			render: function (meta, type, data, meta) {
				btnEditar = `<button class="editar btn btn-secondary btn-xs" title="Editar">
					<i class="fas fa-edit"></i>
				</button>`;
				btnEliminar = `<button class="eliminar btn btn-danger btn-xs" title="Eliminar">
					<i class="fas fa-trash"></i>
				</button>`;
				return btnEditar + " " + btnEliminar;
			},
		},
		{ data: "Nombre" },
		{ data: "AplicaCotizacion", width: 130, className: "text-center" },
		{ data: "AplicaOT", width: 130, className: "text-center" },
		{ data: "AplicaContrato", width: 130, className: "text-center" },
		{ data: "Estado", width: "10%", className: "text-center" },
	],
	createdRow: function (row, data, dataIndex) {
		$(row)
			.find(".editar")
			.click(function (e) {
				e.preventDefault();
				const { CuerpoId } = data;
				$.ajax({
					url: rutaGeneral + "cargar",
					type: "POST",
					data: {
						CuerpoId,
					},
					success: (res) => {
						const dataDB = JSON.parse(res);
						tmpCuerpo.CuerpoId = dataDB.CuerpoId;
						tmpCuerpo.Nombre = dataDB.Nombre;
						tmpCuerpo.Estado = dataDB.Estado;
						tmpCuerpo.Texto = dataDB.Texto;
						tmpCuerpo.AplicaCotizacion = dataDB.AplicaCotizacion;
						tmpCuerpo.AplicaOT = dataDB.AplicaOT;
						tmpCuerpo.AplicaContrato = dataDB.AplicaContrato;

						$("#modalCuerpo").modal("show");
					},
				});
			});

		$(row)
			.find(".eliminar")
			.click(function (e) {
				e.preventDefault();
				const { CuerpoId } = data;
				alertify.confirm(
					"Advertencia",
					`¿Está seguro de eliminar el cuerpo "${data.Nombre}"?`,
					function () {
						$.ajax({
							url: rutaGeneral + "eliminar",
							type: "POST",
							data: {
								CuerpoId,
							},
							success: (res) => {
								if (res == 1) {
									alertify.success("Cuerpo eliminado éxitosamente.");
									tblMedioReserva.ajax.reload();
								} else {
									alertify.error(
										"Ocurrió un problema al momento de eliminar el cuerpo."
									);
								}
							},
						});
					},
					function () {}
				);
			});
	},
});

// CKEditor
if (CKEDITOR.env.ie && CKEDITOR.env.version < 9)
	CKEDITOR.tools.enableHtml5Elements(document);

// The trick to keep the editor in the sample quite small
// unless user specified own height.
CKEDITOR.config.height = 250;
CKEDITOR.config.width = "auto";

var initCKEditor = (function () {
	var wysiwygareaAvailable = isWysiwygareaAvailable();

	return function () {
		var editorElement = CKEDITOR.document.getById("editor");

		// Depending on the wysiwygare plugin availability initialize classic or inline editor.
		if (wysiwygareaAvailable) {
			CKEDITOR.replace("editor");
		} else {
			editorElement.setAttribute("contenteditable", "true");
			CKEDITOR.inline("editor");

			// TODO we can consider displaying some info box that
			// without wysiwygarea the classic editor may not work.
		}
	};

	function isWysiwygareaAvailable() {
		// If in development mode, then the wysiwygarea must be available.
		// Split REV into two strings so builder does not replace it :D.
		if (CKEDITOR.revision == "%RE" + "V%") {
			return true;
		}

		return !!CKEDITOR.plugins.get("wysiwygarea");
	}
})();

$(function () {
	RastreoIngresoModulo("Cuerpos de Documentos");
	initCKEditor();

	// Event listers

	$("#formCuerpo").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			tmpCuerpo.Texto = CKEDITOR.instances.editor.getData();
			$.ajax({
				url: rutaGeneral + "guardar",
				type: "POST",
				data: {
					tmpCuerpo,
				},
				success: (res) => {
					if (res == 0) {
						alertify.error(
							"Ocurrió un problema al momento de guardar la información."
						);
					} else {
						let msg = "guardado";
						if (tmpCuerpo.CuerpoId !== -1) {
							msg = "actualizado";
						}
						alertify.success(`Cuerpo ${msg} éxitosamente.`);
						$("#formCuerpo").trigger("reset");
						$("#modalCuerpo").modal("hide");
						tblMedioReserva.ajax.reload();
					}
				},
			});
		} else {
			alertify.error("Valide la información de los campos.");
		}
	});

	$(document)
		.on("change", "#Nombre", function () {
			tmpCuerpo.Nombre = $(this).val().trim();
		})
		.on("change", "#Estado", function () {
			tmpCuerpo.Estado = $(this).val();
		})
		.on("change", ".custom-control-input", function () {
			tmpCuerpo[$(this).attr("id")] = $(this).is(":checked") ? 1 : 0;
		})
		.on("hidden.bs.modal", function () {
			tmpCuerpo.CuerpoId = -1;
			tmpCuerpo.Nombre = "";
			tmpCuerpo.Estado = "";
			tmpCuerpo.Texto = "";
			tmpCuerpo.AplicaCotizacion = 0;
			tmpCuerpo.AplicaOT = 0;
			tmpCuerpo.AplicaContrato = 0;
		})
		.on("shown.bs.modal", function () {
			$("#Nombre").val(tmpCuerpo.Nombre);
			$("#Estado").val(tmpCuerpo.Estado);
			CKEDITOR.instances.editor.setData(tmpCuerpo.Texto);
			$("#AplicaCotizacion")
				.attr("checked", tmpCuerpo.AplicaCotizacion == 1 ? true : false)
				.change();
			$("#AplicaOT")
				.attr("checked", tmpCuerpo.AplicaOT == 1 ? true : false)
				.change();
			$("#AplicaContrato")
				.attr("checked", tmpCuerpo.AplicaContrato == 1 ? true : false)
				.change();
		})
		.on("click", ".btnFiltros", function (e) {
			e.preventDefault();
			tmpCuerpo.Estado = "A";
			$("#modalCuerpo").modal("show");
		});
});
