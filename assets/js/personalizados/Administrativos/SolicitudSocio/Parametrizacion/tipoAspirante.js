const rutaGeneral =
		base_url() +
		"Administrativos/SolicitudSocio/Parametrizacion/TipoAspirante/",
	TipoAspirante = {
		TipoAspiranteId: -1,
		Nombre: "",
		Estado: "",
		Texto: "",
	};

let editarMedioReserva = 0,
	codEditarMedioReserva = 0;

var tblTipoAspirante = $("#tblTipoAspirante").DataTable({
	dom: domBftrip,
	serverSide: true,
	pageLength: 10,
	ajax: {
		url: rutaGeneral + "cargarDT",
		type: "POST",
		data: function (d) {},
	},
	buttons: buttonsDT(["copy", "excel", "pdf", "print"]),
	columns: [
		{ data: "Nombre" },
		{ data: "Estado", width: "10%", className: "text-center" },
		{
			data: "TipoAspiranteId",
			orderable: false,
			width: "10%",
			className: "text-center noExport",
			render: function (meta, type, data, meta) {
				btnEditar = `<button class="editar btn btn-secondary btn-xs" title="Editar">
					<i class="fas fa-edit"></i>
				</button>`;
				btnToken = `<button class="Url btn btn-primary btn-xs ml-1" title="Copiar URL">
					<i class="fas fa-copy"></i>
				</button>`;
				return btnEditar + btnToken;
			},
		},
	],
	createdRow: function (row, data, dataIndex) {
		$(row)
			.find(".editar")
			.click(function (e) {
				e.preventDefault();
				const { TipoAspiranteId } = data;
				$.ajax({
					url: rutaGeneral + "cargar",
					type: "POST",
					data: {
						TipoAspiranteId,
					},
					success: (res) => {
						const dataDB = JSON.parse(res);
						TipoAspirante.TipoAspiranteId = dataDB.TipoAspiranteId;
						TipoAspirante.Nombre = dataDB.Nombre;
						TipoAspirante.Estado = dataDB.Estado;
						TipoAspirante.Texto = dataDB.Texto;

						$("#modalTexto").modal("show");
						$("#btnCrearCuerpo").html('<i class="fas fa-save"></i> Modificar');
					},
				});
			});
		$(row)
			.find(".Url")
			.click(function (e) {
				e.preventDefault();
				$("#modalUrl").modal("show");

				$("#URLFormulario").val(
					base_url() +
						"Formulario/Solicitud/" +
						NIT() +
						"/" +
						data.TipoAspiranteId
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
	RastreoIngresoModulo("Tipo Aspirante");
	initCKEditor();

	// Event listers

	$("#formTexto").submit(function (e) {
		e.preventDefault();

		if ($(this).valid()) {
			TipoAspirante.Texto = CKEDITOR.instances.editor.getData();

			$.ajax({
				url: rutaGeneral + "guardar",
				type: "POST",
				data: {
					TipoAspirante,
				},
				success: (res) => {
					if (res == 0) {
						alertify.error(
							"Ocurrió un problema al momento de guardar la información."
						);
					} else {
						let msg = "actualizado";
						alertify.success(`Texto ${msg} exitosamente.`);
						$("#formTexto").trigger("reset");
						$("#modalTexto").modal("hide");
						tblTipoAspirante.ajax.reload();
					}
				},
			});
		} else {
			alertify.error("Valide la información de los campos.");
		}
	});

	$(document)
		.on("change", "#Nombre", function () {
			TipoAspirante.Nombre = $(this).val().trim();
		})
		.on("change", "#Estado", function () {
			TipoAspirante.Estado = $(this).val();
		})
		.on("hidden.bs.modal", function () {
			TipoAspirante.TipoAspiranteId = -1;
			TipoAspirante.Nombre = "";
			TipoAspirante.Estado = "";
			TipoAspirante.Texto = "";
		})
		.on("shown.bs.modal", function () {
			$("#Nombre").val(TipoAspirante.Nombre);
			$("#Estado").val(TipoAspirante.Estado);
			CKEDITOR.instances.editor.setData(TipoAspirante.Texto);
		});

	$("#btnCopiarUrl").click(function () {
		$("#URLFormulario").select();
		try {
			document.execCommand("copy");
		} catch (error) {}
		$("#URLFormulario").blur();
		alertify.warning("URL copiada en el portapapeles");
	});
});
