const rutaGeneralInforme =
	base_url() + "Administrativos/Eventos/InformeEventos/";
const agregaCorreos = [];
const dataFiltro = {
	tipoEvento: ["-1"],
	Sede: ["-1"],
	Lugar: ["-1"],
	Vendedor: ["-1"],
	estado: ["-1"],
	FechaInicial: moment().format("YYYY-MM-01"),
	FechaFinal: moment().format("YYYY-MM-DD"),
	numDoc: null,
	numAcc: null,
	numEvento: null,
};
let tblEventos = true;
let primerCarga = 1;
let eventoResetear = false;

tblEventos = $("#tlbEventos").DataTable({
	fixedColumns: true,
	serverSide: true,
	scrollX: true,
	pageLength: 10,
	order: [[0, "DESC"]],
	ajax: {
		url: rutaGeneralInforme + "DTEventos",
		type: "POST",
		data: function (d) {
			return $.extend(d, {
				...dataFiltro,
				tipoEvento: dataFiltro.tipoEvento.filter(
					(tipoEvento) => tipoEvento != "-1"
				),
				Sede: dataFiltro.Sede.filter((Sede) => Sede != "-1"),
				Lugar: dataFiltro.Lugar.filter((Lugar) => Lugar != "-1"),
				Vendedor: dataFiltro.Vendedor.filter((Vendedor) => Vendedor != "-1"),
				estado: dataFiltro.estado.filter((estado) => estado != "-1"),
				primerCarga,
			});
		},
	},
	buttons: buttonsDT(["copy", "excel", "pdf", "print", "pageLength"]),
	columns: [
		{
			data: "EventoId",
			className: "text-center noExport",
			orderable: false,
			targets: [0],
			width: "1%",
			render: function (data) {
				if ($permisoBotones) {
					return `
					<a
						href="${base_url()}Administrativos/Eventos/ReservarEvento/Disponibilidad/${data}"
						class="btn btn-primary btn-xs btnVisualizar"
						title="Visualizar evento"
					>
						<i class="fas fa-eye"></i>
					</a>
					<button class="btn btn-info btn-xs verModal" title="Ver resumen" value=${data}>
						<i class="fas fa-list"></i>
					</button>
					`;
				} else {
					return `<button class="btn btn-info btn-xs verModal" title="Ver resumen" value=${data}>
						<i class="fas fa-list"></i>
					</button>`;
				}
			},
		},
		{ data: "Evento" },
		{ data: "Version" },
		{ data: "Nombre" },
		{ data: "TipoEvento" },
		{ data: "Tercero" },
		{ data: "barra" },
		{ data: "AccionId" },
		{
			data: "FechaInicial",
			render: function (data) {
				return moment(data, "YYYY-MM-DD HH:mm:ss").format(
					"YYYY-MM-DD hh:mm:ss A"
				);
			},
		},
		{
			data: "FechaFinal",
			render: function (data) {
				return moment(data, "YYYY-MM-DD HH:mm:ss").format(
					"YYYY-MM-DD hh:mm:ss A"
				);
			},
		},
		{
			data: "EstadoAct",
			className: "Estado",
			render: function (Estado) {
				return Estado;
			},
		},
		{ data: "Valor", className: "Valor text-right" },
		{ data: "Anticipos", className: " valorCartera text-right" },
		{ data: "ValorPagado", className: " valorPagado text-right" },
		{ data: "Sede" },
		{ data: "Almacen" },
		{ data: "Vendedor" },
		{ data: "MedioReserva" },
		{ data: "Interno" },
		{ data: "Personas" },
		{ data: "Invitados", className: "text-right" },
		{
			data: "FechaSolici",
			render: function (data, type, row, meta) {
				return moment(data, "YYYY-MM-DD HH:mm:ss").format(
					"YYYY-MM-DD hh:mm:ss A"
				);
			},
		},
		{ data: "Lugares" },
	],
	createdRow: function (row, data, dataIndex) {
		$(row)
			.find(".Valor")
			.html("$&nbsp;" + addCommas(data.Valor));
		$(row)
			.find(".valorCartera")
			.html("$&nbsp;" + addCommas(data.Anticipos));
		$(row)
			.find(".valorPagado")
			.html("$&nbsp;" + addCommasNeg(data.ValorPagado));
		$(row)
			.find(".verModal")
			.on("click", function (e) {
				$.ajax({
					url: rutaGeneralInforme + "cargarComponent",
					type: "POST",
					data: {
						eventoId: data.EventoId,
					},
					dataType: "json",
					success: (reservaDB) => {
						Object.assign(nuevaReserva, reservaDB);
						detalleComponent();
						setTimeout(() => {
							$("#modalDetalle").modal("show");
						}, 150);
					},
				});
			});

		// Se agrega validacion para que le cargue los colores correspondiente a cada estado y se vea en la vista.
		EstadoCO = $(row).find(".Estado");
		EstadoCO[0].style.cursor = "pointer";
		switch (data.EstadoAct) {
			case "Cotizado":
				// 'Cotizado'
				EstadoCO[0].style.backgroundColor = "#F5A9BC";
				EstadoCO[0].title =
					"Evento cotizado, a la espera de una respuesta del cliente";
				break;
			case "Versionado":
				// 'Versionado'
				EstadoCO[0].style.backgroundColor = "#A9DFBF";
				EstadoCO[0].title =
					"Versión antigua de un evento(No debería mostrarse en el calendario)";
				break;
			case "Aceptado Cliente":
				// 'Aceptado Cliente'
				EstadoCO[0].style.backgroundColor = "#AEDFF7";
				EstadoCO[0].title =
					"El cliente confirma la cotizacion (Se puede confirmar) ";
				break;
			case "Rechazado Cliente":
				// 'Rechazado Cliente'
				EstadoCO[0].style.backgroundColor = "#F5CBA7";
				EstadoCO[0].title =
					"El cliente rechaza la cotización (Se debe crear una nueva versión de la cotización y esperar que el cliente la confirme)";
				break;
			case "Anulado":
				// 'Anulado'
				EstadoCO[0].style.backgroundColor = "#D2B4DE";
				EstadoCO[0].title = "Cotización anulada, finaliza el proceso";
				break;
			case "Confirmado":
				// 'Confirmado'
				EstadoCO[0].style.backgroundColor = "#B8E994";
				EstadoCO[0].title =
					"Cotización confirmada por el asesor comercial después de tener el aval del cliente";
				break;
			case "Cotizar Nuevamente":
				// 'Cotizar Nuevamente'
				EstadoCO[0].style.backgroundColor = "#87CEEB";
				EstadoCO[0].title =
					"Se requiere cotizar nuevamente el evento ya que un evento confirmado ocupó el lugar para la fecha cotizada";
				break;
			case "Expirado":
				// 'Expirado'
				EstadoCO[0].style.backgroundColor = "#F8C9C5";
				EstadoCO[0].title = "Cotización que no pasó a evento";
				break;
			case "Vencido":
				// 'Vencido'
				EstadoCO[0].style.backgroundColor = "#B3B6B7";
				EstadoCO[0].title = "Evento confirmado que pasó el tiempo límite";
				break;
			case "Finalizado":
				// 'Finalizado'
				EstadoCO[0].style.backgroundColor = "#F9E79F";
				EstadoCO[0].title = "Evento finalizado, ya se celebró";
				break;
			case "Activo":
				// 'Activo'
				EstadoCO[0].style.backgroundColor = "#C39BD3";
				EstadoCO[0].title = "Evento activo y en proceso";
				break;
			case "Facturación":
				// 'Facturado'
				EstadoCO[0].style.backgroundColor = "#9fc063";
				EstadoCO[0].title = "Evento facturado";
				break;
		}
	},
});

$(function () {
	RastreoIngresoModulo("Informe Eventos");

	// Se deshabilitan las fecha para no colocar rango erroneos
	$(".FechaInicial").on("dp.change", function (e) {
		$(".FechaFinal").data("DateTimePicker").minDate(e.date);
	});
	$(".FechaFinal").on("dp.change", function (e) {
		$(".FechaInicial").data("DateTimePicker").maxDate(e.date);
	});
	$(".FechaInicial").val(moment().format("YYYY-MM-01"));
	$(".FechaFinal").val(moment().format("YYYY-MM-DD"));
	$(".FechaInicial, .FechaFinal").change();
	$(".chosen-select").chosen({
		width: "100%",
	});

	cargarLugares();

	$(".FiltrosSelec").change(function (e, el) {
		e.preventDefault();
		if (typeof el === "undefined") {
			el = {
				selected: "-1",
			};
		}
		let values = ["-1"];
		if (el.selected != -1) {
			values = $(this)
				.val()
				.filter((x) => x != "-1");
			if (
				values.length <= 0 ||
				values.length >= $(this).find("option").length - 1
			) {
				values = ["-1"];
			}
		}
		$(this).val(values).trigger("chosen:updated");

		if ($(this).attr("Id") == "SedeId") {
			cargarLugares();
		}
	});

	$("#formFiltro").submit(function (e) {
		e.preventDefault();

		dataFiltro.FechaInicial = $(
			"#formFiltro :input[name='FechaInicialE']"
		).val();
		dataFiltro.FechaFinal = $("#formFiltro :input[name='FechaFinalE']").val();
		dataFiltro.numAcc = $("#formFiltro :input[name='NumAcc']").val();
		dataFiltro.numDoc = $("#formFiltro :input[name='NumDoc']").val();
		dataFiltro.numEvento = $("#formFiltro :input[name='eventoId']").val();
		dataFiltro.Almacen = $("#formFiltro select[name='AlmacenId']").val();
		dataFiltro.TipoEvento = $("#formFiltro select[name='TipoEventoId']").val();
		dataFiltro.Sede = $("#formFiltro select[name='SedeId']").val();
		dataFiltro.Lugar = $("#formFiltro select[name='LugarId']").val();
		dataFiltro.Vendedor = $("#formFiltro select[name='VendedorId']").val();
		dataFiltro.estado = $("#formFiltro select[name='EstadoRes']").val();

		primerCarga = 0;
		tblEventos.ajax.reload();

		$(".closeFiltros").removeClass("d-none");
		$("#modalFiltro").modal("hide");
	});

	$("#btnFiltroReset").on("click", function (e) {
		e.preventDefault();

		eventoResetear = true;
		$("#formFiltro")[0].reset();
		$(".FechaInicial").val(moment().format("YYYY-MM-01"));
		$(".FechaFinal").val(moment().format("YYYY-MM-DD"));
		$(".FechaInicial, .FechaFinal").change();
		$(".FiltrosSelec").each(function () {
			$(this).val(["-1"]).change().trigger("chosen:updated");
		});
	});

	$(document)
		.on("cargarLugares", function () {
			$("#formFiltro").submit();
		})
		.on("submit", "#frmCorreos", function (e) {
			e.preventDefault();
			const cadenaCorreos = $("#correos").val().trim();
			if (cadenaCorreos === "") {
				setTimeout(() => {
					$("#correos").val("").focus();
					$("#frmCorreos").submit();
				}, 0);
			} else {
				const correos = cadenaCorreos.split(",").map((correo) => correo.trim());
				const correosNoValidos = correos.filter(
					(correo) => !isValidEmail(correo)
				);
				if (correosNoValidos.length > 0) {
					const listaHTML =
						"<ul>" +
						correosNoValidos.map((correo) => `<li>${correo}</li>`).join("") +
						"</ul>";
					alertify.alert("Correos no válidos", listaHTML, function () {
						setTimeout(() => {
							$("#correos").select();
						}, 0);
					});
				} else {
					// Envio SSE
					const JSONdataFiltro = encodeURIComponent(JSON.stringify({
						...dataFiltro,
						tipoEvento: dataFiltro.tipoEvento.filter(
							(tipoEvento) => tipoEvento != "-1"
						),
						Sede: dataFiltro.Sede.filter((Sede) => Sede != "-1"),
						Lugar: dataFiltro.Lugar.filter((Lugar) => Lugar != "-1"),
						Vendedor: dataFiltro.Vendedor.filter(
							(Vendedor) => Vendedor != "-1"
						),
						estado: dataFiltro.estado.filter((estado) => estado != "-1"),
					}));
					const JSONcorreos = encodeURIComponent(JSON.stringify(correos));
					let eventSource = new EventSource(
						`${rutaGeneralInforme}envioInforme?dataFiltro=${JSONdataFiltro}&correos=${JSONcorreos}`
					);
					eventSource.onopen = function (event) {
						console.log("Conexión SSE abierta");
					};
					eventSource.onmessage = function (event) {
						const data = JSON.parse(event.data);
						console.log(data);
						if (data.status !== "OK") {
							if (typeof data.msg !== "undefined") {
								customToast(data.msg);
							}
						} else if (data.status === "Error") {
							console.error("Error de SSE: ", data.msg);
							eventSource.close();
							$("#overlay").addClass("d-none");
							$(".loader-bg").hide();
							if ($(".ajs-message").length > 0) {
								$(".ajs-message").remove();
							}
						} else {
							eventSource.close();
							$("#overlay").addClass("d-none");
							$(".loader-bg").hide();
							if ($(".ajs-message").length > 0) {
								$(".ajs-message").remove();
							}
							$("#modalInforme").modal("hide");
							alertify.success(
								"Informe generado y enviado a los correos satisfactoriamente"
							);
						}
					};
					eventSource.onerror = function (event) {
						console.error("Error de conexión:", event);
						if (eventSource !== null) {
							eventSource.close();
							eventSource = null;
						}
						$("#overlay").addClass("d-none");
						$(".loader-bg").hide();
						if ($(".ajs-message").length > 0) {
							$(".ajs-message").remove();
						}
						alertify.error("Error de conexión");
					};
					eventSource.onclose = function (event) {
						console.log("Conexión cerrada:", event);
						$("#overlay").addClass("d-none");
						$(".loader-bg").hide();
						if ($(".ajs-message").length > 0) {
							$(".ajs-message").remove();
						}
					};
				}
			}
		});

	$("#btnVerInforme").on("click", function (e) {
		e.preventDefault();
		$.ajax({
			type: "POST",
			url: rutaGeneralInforme + `descargarInforme/`,
			data: {
				reporte: "GeneraInformeEvento",
				dataFiltro: {
					...dataFiltro,
					tipoEvento: dataFiltro.tipoEvento.filter(
						(tipoEvento) => tipoEvento != "-1"
					),
					Sede: dataFiltro.Sede.filter((Sede) => Sede != "-1"),
					Lugar: dataFiltro.Lugar.filter((Lugar) => Lugar != "-1"),
					Vendedor: dataFiltro.Vendedor.filter((Vendedor) => Vendedor != "-1"),
					estado: dataFiltro.estado.filter((estado) => estado != "-1"),
				},
			},
			success: function (res) {
				if (typeof res === "string") {
					if (esHTML(res)) {
						alertify.alert("Reporte no disponible", res);
					} else {
						const result = JSON.parse(res);
						if (result.success) {
							const blob = new Blob([base64ToArrayBuffer(result.pdf)], {
								type: "application/pdf",
							});
							const link = document.createElement("a");
							link.href = window.URL.createObjectURL(blob);
							link.download = "informeEventos.pdf";
							document.body.appendChild(link);
							link.click();
							document.body.removeChild(link);
						} else {
							alertify.error("Ocurrió un problema al generar el informe");
						}
					}
				} else {
					alertify.error("Ocurrió un problema al generar el informe");
				}
			},
		});
	});

	$(".btnEnviarInforme").on("click", function (e) {
		e.preventDefault();

		$("#modalInforme").modal("show");
	});
});

function addCommasNeg(nStr, decimales = 0) {
	if (nStr == 0.0) {
		nStr = 0;
	}
	if (nStr != "null") {
		nStr += "";
		x = nStr.split(".");
		x1 = x[0];
		x2 = x.length > 1 ? "." + x[1] : ".";
		for (var i = 0; i < decimales; i++) {
			x2 += "0";
		}

		x2 = x2.substr(0, 1 + decimales);

		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, "$1" + "," + "$2");
		}
		if (decimales == 0) {
			return x1;
		} else {
			return x1 + x2;
		}
	} else {
		str = "0";
		for (let i = 0; i < decimales; i++) {
			if (i == 0) str += ".";
			str += "0";
		}
		return str;
	}
}

function customToast(msg) {
	if ($(".ajs-message").length > 0) {
		$(".ajs-message").remove();
	}
	alertify.message(msg, 0);
}

function cargarLugares() {
	const SedeId = $("#formFiltro select[name='SedeId']")
		.val()
		.filter((x) => x != "-1");
	$.ajax({
		url: rutaGeneralInforme + "obtenerLugares",
		type: "POST",
		data: { SedeId },
		dataType: "JSON",
		success: (resp) => {
			let estruLugares =
				'<option value="-1" selected style="search-choice-close-disabled">Todos</option>';
			resp.forEach((it) => {
				estruLugares += `<option value="${it.LugarId}" style="search-choice-close-disabled">${it.Nombre}</option>`;
			});
			$("#LugarId").html(estruLugares).trigger("chosen:updated");

			if (eventoResetear) {
				$(document).trigger("cargarLugares");
				eventoResetear = false;
			}
		},
	});
}

function isValidEmail(email) {
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
}

function esHTML(cadena) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(cadena, "text/html");
	return doc.body.childNodes.length > 0 && cadena[0] === "<";
}

function base64ToArrayBuffer(base64) {
	const binary_string = window.atob(base64);
	const len = binary_string.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
}
