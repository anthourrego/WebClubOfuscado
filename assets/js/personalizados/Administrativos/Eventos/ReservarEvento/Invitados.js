const cabeceraExcel = [
	"N°_Documento",
	"Nombre",
	"Fecha_Nacimiento",
	"Telefono",
	"Email",
	"Observación",
];
const JSONinvitados = [];

let hayCambiosSinGuardar = false;
let tblDTAyuda;

$(function () {
	$(window).on("beforeunload", () => {
		if (hayCambiosSinGuardar) {
			return "¿Estás segur@ que quieres salir? Hay cambios sin guardar";
		}
	});

	if (!nuevaReserva.disponibilidad) {
		window.location.href =
			base_url() + "Administrativos/Eventos/ReservarEvento/Disponibilidad";
	} else if (!nuevaReserva.datosBasicos) {
		window.location.href =
			base_url() + "Administrativos/Eventos/ReservarEvento/DatosBasicos";
	} else if (!nuevaReserva.complementos) {
		window.location.href =
			base_url() + "Administrativos/Eventos/ReservarEvento/Complementos";
	}

	$("#frmExcel").trigger("reset");
	// $("#btnSiguiente").attr("disabled", true);
	crearCabecera(cabeceraExcel, "crearCabeceraExcel");

	DTtblImportar = $("#tblImportar").DataTable({
		language: $.Constantes.lenguajeTabla,
		order: [],
		dom: "Bfrtp",
		fixedColumns: true,
		processing: true,
		pageLength: 10,
		scrollX: true,
		scrollCollapse: true,
		columnDefs: [],
		ajax: {
			url: rutaGeneral + "cargarExcel",
			type: "POST",
			data: function (d) {
				return new FormData($("#frmExcel")[0]);
			},
			async: false,
			cache: false,
			contentType: false,
			processData: false,
		},
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
		],
		columns: [
			{ data: "A0" },
			{ data: "A1" },
			{ data: "A2" },
			{ data: "A3" },
			{ data: "A4" },
			{ data: "A5" },
		],
		preDrawCallback: function () {
			$("#btnSiguiente").attr("disabled", false);

			JSONinvitados.splice(0);
		},
		drawCallback: function (settings) {
			if (this.api().rows().data().length === 0) {
				// $("#btnSiguiente").attr("disabled", true);
			} else {
				for (let i = 0; i < this.api().rows().data().length; i++) {
					JSONinvitados.push(this.api().rows().data()[i]);
				}
			}
		},
		createdRow: function (row, data, dataIndex) {
			for (var i = 0; i <= 5; i++) {
				var dato = "" + data["A" + i] + "";
				dato = dato.substring(0, 1);
				if (dato == "*") {
					$(row)
						.find("td:eq(" + i + ")")
						.addClass("td-warning");

					$("#btnSiguiente").attr("disabled", true);
				}
			}
		},
	});

	if (nuevaReserva.invitados) {
		DTtblImportar.rows.add(nuevaReserva.invitados).draw();
	}

	// Event Listeners

	$("#excelfile").change(function (e) {
		hayCambiosSinGuardar = true;
		DTtblImportar.clear().draw();
		if (typeof FormData !== "undefined") {
			DTtblImportar.ajax.reload();
		}
	});

	$("#btnImportar").click(function (e) {
		e.preventDefault();
		if ($(".td-warning").length > 0) {
			alertify.alert(
				"Advertencia",
				`Por favor verificar el archivo importado en la tabla mostrada en pantalla,
			cada campo señalado en color <strong class="text-danger">ROJO</strong> significa que no puede ser cargado por exceder el tamaño mencionado o no cumplir con las condiciones específicadas en la seccción de <strong>"Ayuda"</strong>`
			);
		} else {
			$.ajax({
				type: "POST",
				dataType: "json",
				url: rutaGeneral + "Importar",
				data: {
					EventoReservaId,
					listaInvitado: JSON.stringify(DTtblImportar.rows().data().toArray()),
					RASTREO: RASTREO(
						"Importa archivo de Invitados",
						"Importar Lista Invitados"
					),
				},
				success: function (res) {
					switch (res) {
						case "1":
							alertify.success(
								"Lista de Invitados, los invitados se han importado satisfactoriamente y han sido cargados al modulo"
							);
							DTtblImportar.clear().draw();
							break;
						case "2":
							alertify.alert(
								"Advertencia",
								'Por favor verificar el archivo importado en la tabla mostrada en pantalla,\
								cada campo señalado en color ROJO significa que no puede ser cargado por exceder el tamaño mencionado o no cumplir con las condiciones específicadas en la seccción de "Ayuda"'
							);
							break;
						default:
							alertify.error(
								"Lo sentimos, ocurrió un problema al subir el archivo"
							);
							console.error(res);
							break;
					}
				},
			});
		}
	});

	$("#btnAyuda").click(function (e) {
		e.preventDefault();
		$("#modalAyuda").modal("show");
		if (!tblDTAyuda) {
			setTimeout(() => {
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
			}, 200);
		}
	});

	$("#btnSiguiente").click(function (e) {
		e.preventDefault();
		const personas = parseInt(nuevaReserva.disponibilidad.personas),
			invitados = JSONinvitados.length;
		if (invitados <= personas) {
			sessionStorage.setItem("newRESInvitados", JSON.stringify(JSONinvitados));

			// Si está en modo edición
			if (
				nuevaReserva.cotizacion &&
				typeof nuevaReserva.cotizacion.edicion !== "undefined"
			) {
				const cotizacionJSON = JSON.stringify({
					...nuevaReserva.cotizacion,
					cambiosEvento: true,
				});
				sessionStorage.setItem("newRESCotizacion", cotizacionJSON);
			}

			hayCambiosSinGuardar = false;
			location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Cotizacion`;
		} else {
			alertify.alert(
				"Advertencia",
				`El número de invitados cargados (${addCommas(
					invitados
				)}) es mayor al número de personas del evento (${addCommas(personas)})
				<br/><br/>
				Revise que estos valores coincidan para poder continuar`
			);
		}
	});

	// Métodos
});

function crearCabecera(array, id) {
	$.each(array, (pos, cab) => {
		$("." + id).append(`<th class="text-center">${cab.replace("_", " ")}</th>`);
	});
}
