const rutaGeneral =
	base_url() + "Administrativos/SolicitudSocio/SolicitudesAR/";
let dataFiltroSolicitud = {
	FechaInicial: moment().format("YYYY-MM-01"),
	FechaFinal: moment().format("YYYY-MM-DD"),
	Numero: "",
	TerceroId: "",
	Estado: ["PE"],
};
const estados = {
	PE: "Pendiente",
	RE: "Rechazado",
	AP: "Aprobado",
};
let estadoConfirmado = "",
	tblEventos,
	solicitudId;
$(function () {
	RastreoIngresoModulo("Gestionar Solicitudes");
	$(".chosen-select").val(["PE"]).trigger("chosen:updated");

	//Se deshabilitan las fecha para no colocar rango erroneos
	$(".FechaInicial").on("dp.change", function (e) {
		$(".FechaFinal").data("DateTimePicker").minDate(e.date);
	});
	$(".FechaFinal").on("dp.change", function (e) {
		$(".FechaInicial").data("DateTimePicker").maxDate(e.date);
	});

	$(".FechaInicial").val(moment().format("YYYY-MM-01"));
	$(".FechaFinal").val(moment().format("YYYY-MM-DD"));
	$(".FechaInicial, .FechaFinal").change();
	cargarSolicitudes();
});

//Listener
$("#cerrarSolicitud").on("click", function (e) {
	e.preventDefault();
	$("#AproRechaSolicitud").modal("hide");
	$("#formAproRechaSolicitud")[0].reset();
});

$("#aprobado").change(function (e) {
	e.preventDefault();
	if ($(this).prop("checked")) {
		$("#rechazado").prop("checked", false);
	}
});

$("#rechazado").change(function (e) {
	e.preventDefault();
	if ($(this).prop("checked")) {
		$("#aprobado").prop("checked", false);
	}
});

$(document).on("click", ".openFilter", function (e) {
	e.preventDefault();
	$("#filtrarsolicitudes").modal("show");
});

$("#formAproRechaSolicitud").on("submit", function (e) {
	e.preventDefault();
	if ($(this).valid()) {
		const form_data = new FormData($("#formAproRechaSolicitud")[0]);
		form_data.append("SolicitudId ", solicitudId);
		form_data.append("Numero ", numeroSolicitud);
		form_data.append("nombre ", nombre);
		form_data.append("email ", Email);
		$.ajax({
			url: rutaGeneral + "actualizarSolicitud",
			type: "POST",
			data: form_data,
			processData: false,
			contentType: false,
			cache: false,
			dataType: "json",
			success: (resp) => {
				if (resp.success) {
					tblEventos.ajax.reload();
					alertify.success(resp.msj);
				} else {
					alertify.error(resp.msj);
				}
			},
		});
		$("#AproRechaSolicitud").modal("hide");
	} else {
		alertify.error("Valide la información de los campos obligatorios.");
	}
});

$("#cargarFiltroSolicitud").on("click", function (e) {
	e.preventDefault();
	dataFiltroSolicitud.FechaInicial = $("#FechaInicialSolicitud").val();
	dataFiltroSolicitud.FechaFinal = $("#FechaFinalSolicitud").val();
	dataFiltroSolicitud.Numero = $("#NumSolicitud").val();
	dataFiltroSolicitud.TerceroId = $("#TerceroId").val();
	dataFiltroSolicitud.Estado = $("#Estado").val();
	$("#filtrarsolicitudes").modal("hide");
	// cargarSolicitudes();
	tblEventos.ajax.reload();
});

//preprocesamientos

$(".chosen-select").chosen({
	width: "100%",
});

$(".FiltrosSelec").change(function (e, el) {
	e.preventDefault();
	let values = ["-1"];
	if (el.selected != -1) {
		values = $(this)
			.val()
			.filter((x) => x != "-1");
		if (
			values.length <= 0 ||
			values.length >= $(this).find("option").length - 1
		)
			values = ["-1"];
	}
	$(this).val(values).trigger("chosen:updated");
});

//funciones
function limpiarFiltrosSolicitudes() {
	$(".chosen-select").val([""]).trigger("chosen:updated");
	dataFiltroSolicitud.Numero = "";
	dataFiltroSolicitud.TerceroId = "";
	dataFiltroSolicitud.Estado = "";
	$("#NumSolicitud").val("");
	$("#TerceroId").val("");
	$("#Estado").val("");
	$("#filtrarsolicitudes").modal("hide");
	tblEventos.ajax.reload();
}

function cargarSolicitudes() {
	tblEventos = $("#tlbSolicitudesAR").DataTable({
		dom: domlBftrip,
		serverSide: true,
		pageLength: 10,
		scrollX: true,
		order: [[0, "DESC"]],
		ajax: {
			url: rutaGeneral + "DTVerSolicitudes",
			type: "POST",
			data: function (d) {
				return $.extend(d, { dataFiltroSolicitud });
			},
			global: false,
		},
		buttons: buttonsDT(
			["copy", "excel", "pdf", "print"],
			[
				{
					className: "btnFiltros openFilter",
					attr: { title: "Crear", "data-toggle": "modal" },
					text: '<i class="fas fa-filter"></i> <strong> Filtros</strong>',
				},
			]
		),
		columns: [
			{ data: "Numero" },
			{ data: "TerceroId" },
			{ data: "nombre" },
			{ data: "NombreTipo" },
			{
				data: "Estado",
				render: function (data, type, row, meta) {
					switch (data) {
						case "RE":
							// 'Rechazado'
							data = "Rechazado";
							break;
						case "AP":
							// 'Aprobado'
							data = "Aprobado";
							break;
						case "PE":
							// 'Pendiente'
							data = "Pendiente";
							break;
						case "BO":
							// 'Pendiente'
							data = "Borrador";
							break;
					}
					return data;
				},
			},
			{ data: "FechaSolicitud" },
			{ data: "FechaTramite" },
			{ data: "FechaJunta" },
			{ data: "NumeroActa" },
			{ data: "Observacion", width: "300px", className: "styleespacio" },
			{
				data: "Acciones",
				orderable: false,
				className: "text-center noExport",
				render: function (meta, type, data, meta) {
					return `
					<a
						href="#"
						class="btn btn-success btn-xs btnVisualizar"
						title="Aprobar o Rechazar Solicitudes"
					>
						<i class="fas fa-check"></i>
					</a>
					<a
						href="${base_url()}Administrativos/SolicitudSocio/FormularioSolicitud/SolicitudView/V/${
						data.TipoAspiranteId
					}/${data.Numero}"
						class="btn btn-primary btn-xs btnVerDocumentos"
						title="Ver Solicitudes aspirantes"
					>
						<i class="far fa-eye"></i>
					</a>`;
				},
			},
		],
		createdRow: function (row, data, dataIndex) {
			if (data.Estado == "AP" || data.Estado == "RE" || data.Estado == "BO") {
				botoncito = $(row).find("td:eq(10) .btnVisualizar")[0];
				botoncito.style.display = "none";
			}

			//Se agrega validacion para que le cargue los colores correspondiente a cada estado y se vea en la vista.
			EstadoCO = $(row).find("td:eq(4)");
			switch (data.Estado) {
				case "RE":
					// 'Rechazado'
					EstadoCO[0].style.backgroundColor = "#F5A9BC";
					EstadoCO[0].title = "Solicitud Rechazada";
					break;
				case "AP":
					// 'Aprobado'
					EstadoCO[0].style.backgroundColor = "#A9DFBF";
					EstadoCO[0].title = "Solicitud Aprobada";
					break;
				case "PE":
					// 'Pendiente'
					EstadoCO[0].style.backgroundColor = "#AEDFF7";
					EstadoCO[0].title = "Solicitid pendiente";
					break;
				case "BO":
					// 'Borrador'
					EstadoCO[0].style.backgroundColor = "#dbca6f";
					EstadoCO[0].title = "Solicitid en Borrador";
					break;
			}

			$(row).on("click", ".btnVisualizar", function (e) {
				$("#formAproRechaSolicitud")[0].reset();
				$("#aprobado, #rechazado").attr("disabled", false);
				$("#AproRechaSolicitud").modal("show");
				solicitudId = data.SolicitudId;
				numeroSolicitud = data.Numero;
				nombre = data.nombre;
				Email = data.Email;
			});
		},
	});
}
