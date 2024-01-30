let rutaGeneral = "Administrativos/Eventos/Parametrizacion/Sedes/";
let validandoCodigo = false;
let editarSede = 0;
let tablaSedes;
let dataTablePrev = [
	{
		titulo: "Código",
		id: "SedeId",
	},
	{
		titulo: "AlmacenIdEventos",
		id: "AlmacenIdEventos",
	},
	{
		titulo: "Pais",
		id: "PaisId",
	},
	{
		titulo: "Departamento",
		id: "DptoId",
	},
	{
		titulo: "Ciudad",
		id: "CiudadId",
	},
	{
		titulo: "Zona",
		id: "ZonaId",
	},
	{
		titulo: "Telefono",
		id: "Telefono",
	},
	{
		titulo: "Estado",
		id: "Estado",
	},
];
let ciudadEditar,
	$EDITAR = 0;

let tblSedes = $("#tabla").DataTable({
	dom: domBftrip,
	fixedColumns: true,
	serverSide: true,
	pageLength: 10,
	scrollX: true,
	ajax: {
		url: base_url() + rutaGeneral + "cargarDT",
		type: "POST",
		data: function (d) {},
	},
	buttons: buttonsDT(
		["copy", "excel", "pdf", "print"],
		[
			{
				className: "abrirModalCrearSede btnFiltros",
				attr: {
					title: "Crear",
					"data-toggle": "modal",
				},
				text: '<i class="fas fa-plus"></i> <strong> Crear Sede</strong>',
			},
		]
	),
	columns: [
		{ data: "Id", className: "noExport", visible: false },
		{ data: "Codigo" },
		{ data: "Almacen" },
		{ data: "Nombre" },
		{ data: "Pais" },
		{ data: "Departamento" },
		{ data: "Ciudad" },
		{ data: "Zona" },
		{ data: "Telefono" },
		{ data: "Estado" },
		{
			data: "Acciones",
			width: "10%",
			className: "text-center noExport",
			orderable: false,
			render: function (meta, type, data, meta) {
				let ver = `
					<button class="ediSede btn btn-secondary btn-xs" data-sede="${
						data.Id
					}" title="Editar" style="margin-bottom:3px"><i class="fas fa-edit"></i></button>
					<button class="eliSede btn btn-danger btn-xs" data-sede='${JSON.stringify({
						Id: data.Id,
						SedeId: data.Codigo,
					})}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
					`;
				return ver;
			},
		},
	],
	createdRow: function (row, data, dataIndex) {
		$(row).children().last().css("text-align", "center");
		accionBotones(row);
	},
});

$(function () {
	RastreoIngresoModulo("Sedes");
	$("input[name=Estado]").prop("checked", true);

	$("#Telefono").inputmask({
		groupSeparator: "",
		alias: "integer",
		placeholder: "0",
		autoGroup: !0,
		digitsOptional: !1,
		clearMaskOnLostFocus: !1,
		rightAlign: false,
		min:0,
	});
	initActions();
});

initActions = function () {
	$("#formularioCrearSede").submit(function (event) {
		event.preventDefault();
		crearSede.apply(this);
	});

	$("#DptoId").change(function () {
		let datos = {
			deptoId: $(this).val(),
		};
		datosUbicacion(rutaGeneral + "obtenerCiudades", "CiudadId", datos);
	});

	$("#SedeId").on("blur", function () {
		let data = $.Encriptar($(this).val());
		validandoCodigo = true;
		$.ajax({
			url: base_url() + rutaGeneral + "validarCodigo",
			type: "POST",
			dataType: "json",
			data: {
				encriptado: data,
			},
			success: (resp) => {
				$("#SedeId").removeClass("is-valid, is-invalid");
				resp = JSON.parse($.Desencriptar(resp));
				if ($EDITAR == 0) {
					if (!resp.valido) {
						$("#SedeId").addClass("is-invalid");
						alertify.error(resp.mensaje);
						$("#SedeId").val("");
					}
					validandoCodigo = false;
				}
			},
			error: (err) => {
				validandoCodigo = false;
			},
		});
	});

	$("#Telefono").on("keyup", function () {
		let data = Array.from($(this).val());
		$("#Telefono").removeClass("is-invalid");
		data.forEach((item) =>
			isNaN(item) || !isFinite(item)
				? $("#Telefono").addClass("is-invalid")
				: null
		);
	});

	tablaSedes = tblSedes;

	$(".abrirModalCrearSede").click(function () {
		$EDITAR = 0;
		$("#AlmacenIdEventos").val("");
		$("#modalCrearSede").modal("show");

		$("#CiudadId").html('<option value="">&nbsp;</option>');
		$("#SedeId").attr("disabled", false);
	});

	$("#cerrarCrearSede").click(function () {
		limpiarDatos();
	});

	dataTablePrev.forEach((item) => {
		$("#tablaPrev").append(`<tr>
			<td>- ${item.titulo}:</td>
			<td id="pre${item.id}" class="text-right texto-wrap"></td>
		</tr>`);
	});
};

datosUbicacion = function (url, tipo, data) {
	data = $.Encriptar(data);
	$.ajax({
		url: base_url() + url,
		type: "POST",
		dataType: "json",
		data: {
			encriptado: data,
		},
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (resp.valido) {
				$("#" + tipo).html("");
				resp.datos.forEach((item) => {
					$("#" + tipo).append(
						`<option value="${item.ciudadid}">${item.nombre}</option>`
					);
				});
				if (editarSede) {
					$("#" + tipo).val(ciudadEditar);
				}
			} else {
				alertify.error(resp.mensaje);
			}
		},
		error: (err) => {
			console.error("Error ", err);
		},
	});
};

crearSede = function () {
	if ($("#formularioCrearSede").valid()) {
		if (validandoCodigo) {
			alertify.warning("Validando codigo ingresado.");
			return;
		}
		let $fills = $("#formularioCrearSede input, #formularioCrearSede select");
		let data = {};
		$.each($fills, (pos, input) => {
			let value = $(input).val();
			const name = $(input).attr("name");
			if (name == "Estado") {
				value = $(input).prop("checked") ? "A" : "I";
			}
			data[name] = value;
		});
		data = { ...data, editarSede };
		data = $.Encriptar(data);
		$.ajax({
			url: base_url() + rutaGeneral + "crearSede",
			type: "POST",
			dataType: "json",
			data: {
				encriptado: data,
			},
			success: (resp) => {
				resp = JSON.parse($.Desencriptar(resp));
				if (resp.valido) {
					let idInsertado = resp.idInsertado;
					limpiarDatos();
					tablaSedes.draw();

					$("#modalCrearSede").modal("hide");
					alertify.success(resp.mensaje);
					$("#btnCrearSede")
						.text("")
						.append('<i class="fas fa-plus"></i> Crear');
				} else {
					alertify.error(resp.mensaje);
				}
			},
		});
	} else {
		alertify.error("Valide la informacion ingresada.");
	}
};

accionBotones = function (row) {
	$(row).on("click", ".ediSede", function (e) {
		e.preventDefault();
		let data = $.Encriptar($(this).data("sede"));
		$EDITAR = 1;
		obtenerSede(data, "edicionSede");
	});

	$(row).on("click", ".eliSede", function (e) {
		e.preventDefault();
		let data = $(this).data("sede");
		alertify.confirm(
			"Eliminar",
			"¿Desea eliminar esta Sede?",
			function (ok) {
				data = $.Encriptar(data);
				$.ajax({
					url: base_url() + rutaGeneral + "eliminarSede",
					type: "POST",
					dataType: "json",
					data: {
						encriptado: data,
					},
					success: (resp) => {
						resp = JSON.parse($.Desencriptar(resp));
						let metodo = !resp.valido ? "error" : "success";
						alertify[metodo](resp.mensaje);
						if (resp.valido) {
							tablaSedes.draw();
						}
					},
					error: (err) => {
						console.log("errro ", err);
						alertify.error("No fue posible obtener los datos");
					},
				});
			},
			function (err) {
				console.log("Error ", err);
			}
		);
	});
};

obtenerSede = function (data, funcion, id) {
	$.ajax({
		url: base_url() + rutaGeneral + "obtenerSede" + (id ? "?ver=" + id : ""),
		type: "POST",
		dataType: "json",
		data: {
			encriptado: data,
		},
		cache: false,
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			this[funcion](resp);
			$("#SedeId").attr("disabled", true);
		},
		error: (err) => {
			console.log("errro ", err);
			alertify.error("No fue posible obtener los datos");
		},
	});
};

edicionSede = function (resp) {
	editarSede = resp.datos[0]["Id"];
	editarSedeAlmacen =
		resp.datos[0]["AlmacenIdEventos"] == null
			? ""
			: resp.datos[0]["AlmacenIdEventos"];
	editarSedeAlmacen = editarSedeAlmacen.replace(/\s/g, "");
	$("#btnCrearSede").text("").append('<i class="fas fa-edit"></i> Modificar');
	Object.keys(resp.datos[0]).forEach((item) => {
		$("#" + item).val(resp.datos[0][item]);
		if (item == "Estado") {
			$("#" + item).prop("checked", resp.datos[0][item] == "A" ? true : false);
		}
	});
	ciudadEditar = resp.datos[0]["CiudadId"];
	almacenEditar = resp.datos[0]["AlmacenIdEventos"];
	$("#DptoId").change();
	if (editarSedeAlmacen !== null) {
		$("#AlmacenIdEventos").val(editarSedeAlmacen);
	}

	$("#modalCrearSede").modal("show");
};

limpiarDatos = function () {
	editarSede = 0;
	$("#btnCrearSede").text("").append('<i class="fas fa-plus"></i> Crear');
	$("#formularioCrearSede")[0].reset();
	$("#formularioCrearSede")[0].reset();
	$("#formularioCrearSede :input").removeClass("is-invalid");
	$("#formularioCrearSede").validate().resetForm();
	$("input[name=Estado]").prop("checked", true);
};
