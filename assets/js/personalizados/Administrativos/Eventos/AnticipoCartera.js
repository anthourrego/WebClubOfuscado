const estados = {
	BO: "Borrador",
	CT: "Cotizado",
	VR: "Versionado",
	CC: "Aceptado Cliente",
	RE: "Rechazado Cliente",
	NU: "Anulado",
	CO: "Confirmado",
	CN: "Cotizar Nuevamente",
	EX: "Expirado",
	VE: "Vencido",
	FI: "Finalizado",
	AC: "Activo",
	FA: "Facturación",
};
const TipoAsociacion = {
	E: "Ejecutivo",
	S: "Titular",
	R: "Representante",
	B: "Beneficiario",
};
let $ModifFeRec = false;
let $AlmacenId = null;

$(document).ready(function () {
	RastreoIngresoModulo("Anticipos");

	$('[data-db="evento"]').val("");
	$('[data-db="accionid"]').val("");
	$('[data-db="terceroid"]').val("");
	$('[data-db="terceroidNombre"]').val("");
	$('[data-db="recibo"]').val("");
	$('[data-db="fecha"]').val("").val($fecha);
	$('[data-db="fechapago"]').val("").val($fecha);
	$('[data-db="anticipo"]').val("0");
	$('[data-db="codipagoid"]').val("");
	$('[data-db="codipagoidNombre"]').text("");
	$('[data-db="bancoid"]').val("");
	$('[data-db="bancoidNombre"]').text("");
	$('[data-db="tipodocume"]').val("");
	$('[data-db="observacio"]').val("");

	if ($JSON != "") {
		$JSON = JSON.parse($JSON);
		if ($JSON.terceroid && $JSON.terceroid != "") {
			$('[data-db="evento"]').attr("readonly", false).focus();
			$('[data-db="terceroid"]').val($JSON.terceroid).attr("readonly", true);
			$('[data-db="terceroidNombre"]').attr("readonly", true);
			$('[data-db="accionid"]').val($JSON.accionid).attr("readonly", true);
			$('[data-db="recibo"]').attr("readonly", true);
			$('[data-db="fechapago"]').attr("readonly", true);
			$('[data-db="anticipo"]').attr("readonly", false);
			// $('[data-db="codipagoid"]').attr('readonly', false);
			$('[data-db="bancoid"]').attr("readonly", true);
			$('[data-db="tipodocume"]').attr("readonly", true);
			// $('[data-db="observacio"]').attr('readonly', false);
			// $('#submitFormaPago').attr('disabled', false);
			// $('#btnCancelar').attr('disabled', false);
			if ($ModifFeRec != "S") {
				$('[data-db="fecha"]').attr("readonly", true);
			} else {
				$('[data-db="fecha"]').attr("readonly", false);
			}
		}
	}

	// Se define dataTable de Anticipos
	dtSS({
		data: {
			tblID: "#tblCRUD",
		},
		ajax: {
			url:
				base_url() +
				"Administrativos/Eventos/AnticipoCartera/DTAnticipoCartera",
			type: "POST",
			data: function (d) {
				return $.extend(d, { terceroid: $JSON.terceroid });
			},
		},
		order: [[0, "DESC"]],
		fixedColumns: true,
		createdRow: function (row, data, dataIndex) {
			$(row)
				.find("td:eq(2)")
				.html("$ " + addCommas(data[2]));
		},
		scrollX: "100%",
		scrollY: $(document).height() - 500,
		scroller: {
			loadingIndicator: true,
		},
		scrollCollapse: false,
		dom: domBftri,
		columnDefs: [{ width: "1%", targets: [2] }],
	});

	$(".ajs-input")
		.inputmask({
			groupSeparator: ",",
			alias: "currency",
			placeholder: "0",
			autoGroup: 3,
			digits: 0,
			digitsOptional: !1,
			clearMaskOnLostFocus: !1,
			rightAlign: false,
			prefix: "",
			integerDigits: 20,
			allowMinus: false,
			allowPlus: false,
		})
		.focus(function () {
			$(this).select();
		});

	if ($('[data-db="terceroid"]').val() == "") {
		$("#btnCancelar").attr("disabled", true);
	}

	setTimeout(function () {
		$('[data-db="terceroid"]').focus();
	}, 300);
});

$("[data-db=accionid]").change(function () {
	const accionId = $(this).val();
	if (accionId != "") {
		$.ajax({
			url: base_url() + "Administrativos/Eventos/AnticipoCartera/ValidarAccion",
			type: "POST",
			data: {
				accionId,
			},
			dataType: "json",
			success: function (res) {
				if (res.length === 1) {
					$('[data-db="terceroid"]').val(res[0].TerceroId);
				} else if (res.length > 1) {
					dtAlertify({
						titulo: "Seleccione el Tercero",
						campos: [
							"IDTercero",
							"Nombre Tercero",
							"Activo",
							"Tipo Socio",
							"Tipo Asociación",
							"Parentesco",
						],
						dtConfig: {
							data: {
								select: [
									"T.TerceroID",
									"T.nombre",
									"TA.Activo",
									"TS.Nombre AS TipoSocio",
									"TA.Tipo",
									"P.Nombre AS Parentesco",
								],
								table: [
									"TerceroAccion TA",
									[
										["Tercero T", "TA.TerceroId = T.TerceroID", "LEFT"],
										["TipoSocio TS", "TA.TipoSocioId = TS.TipoSocioId", "LEFT"],
										[
											"Parentesco P",
											"TA.ParentescoId = P.ParentescoId",
											"LEFT",
										],
									],
									[["TA.AccionId", accionId]],
								],
								column_order: [
									"T.TerceroID",
									"T.nombre",
									"TA.Activo",
									"TS.Nombre AS TipoSocio",
									"TA.Tipo",
									"P.Nombre",
								],
								orden: [
									["TA.Activo", "DESC"],
									["TA.Tipo", "DESC"],
									["T.Nombre", "ASC"],
								],
								column_search: ["E.TerceroID", "T.nombre"],
								columnas: [
									"TerceroID",
									"nombre",
									"Activo",
									"TipoSocio",
									"Tipo",
									"Parentesco",
								],
							},
							orderable: true,
							scrollX: true,
							columns: [
								{ data: 0 },
								{
									data: 1,
									render: function (tercero) {
										return capitalizarPalabras(tercero);
									},
								},
								{
									data: 2,
									render: function (activo) {
										return activo == 1 ? "S" : "N";
									},
								},
								{
									data: 3,
									render: function (tipoSocio) {
										return capitalizarPalabras(tipoSocio);
									},
								},
								{
									data: 4,
									render: function (tipoAsociacion) {
										return TipoAsociacion[tipoAsociacion];
									},
								},
								{
									data: 5,
									render: function (parentesco) {
										return capitalizarPalabras(parentesco);
									},
								},
							],
							rowCallback: function (row, data) {
								if (data[2] == 1) {
									$(row).addClass("trActivo");
								}
							},
						},
					}).then((res) => {
						$("[data-db=terceroid]").val(res[0]);
						cargarTercero();
					});
					$(".ajs-dialog:visible").addClass("busqueda");
				} else {
					$("[data-db=accionid]").val("").focus();
					alertify.warning("La Acción especificada no existe...");
				}
			},
		});
	}
});

$('[data-db="terceroid"]').change(function () {
	$ID = $("[data-codigo]").val();
	if ($ID != "") {
		$.ajax({
			url:
				base_url() + "Administrativos/Eventos/AnticipoCartera/ValidarTercero",
			type: "POST",
			data: {
				terceroid: $ID,
				CLUB: $CLUB,
			},
			success: function (res) {
				switch (res) {
					case "0":
						alertify.warning(
							"El cliente digitado no se encuentra registrado, por favor registrelo primero en el módulo de Registro de Clientes"
						);
						$("#modalTercConCrear").modal("show");
						break;
					case "1":
						cargarTercero();
						break;
					case "2":
						alertify.alert(
							"Advertencia",
							"El tercero existe pero no está asociado como Cliente: (Es Proveedor)",
							function () {
								$('[data-db="terceroid"]').val("");
							}
						);
						break;
					case "3":
						alertify.warning(
							"Seleccione el tercero asociado al número de acción"
						);

						dtAlertify({
							titulo: "Seleccione la Acción",
							campos: ["Acción", "Fecha Inicio", "Fecha Final"],
							dtConfig: {
								data: {
									select: [
										`
									'&nbsp;' AS AccionId,
									NULL AS FechaInicial,
									NULL AS FechaFinal
									UNION ALL
									SELECT AccionId`,
										"FechaInicial",
										"FechaFinal",
									],
									table: [
										"TerceroAccion",
										[],
										[
											["TerceroId", $ID],
											[
												"GETDATE() BETWEEN CAST(FechaInicial AS DATE) AND CAST(FechaFinal AS DATE)",
											],
										],
									],
									column_order: ["AccionId", "FechaInicial", "FechaFinal"],
									orden: [["AccionId", "ASC"]],
									column_search: ["AccionId"],
									columnas: ["AccionId", "FechaInicial", "FechaFinal"],
								},
								orderable: true,
							},
						}).then((res) => {
							$("[data-db=accionid]").val(res[0]);
							cargarTercero();
						});
						break;
					case "4":
						alertify.alert(
							"Advertencia",
							"El tercero se encuentra inactivo",
							function () {
								$('[data-db="terceroid"]').val("");
							}
						);
						break;
					case "5":
						alertify.alert(
							"Advertencia",
							"El tercero existe pero no está asociado como Cliente",
							function () {
								$('[data-db="terceroid"]').val("");
							}
						);
						break;
					case "6":
						alertify.alert(
							"Advertencia",
							"El socio se encuentra bloqueado por la junta directiva, no se permite su ingreso",
							function () {
								$('[data-db="terceroid"]').val("");
							}
						);
						break;
					default:
						try {
							var registro = JSON.parse(res);
						} catch (e) {
							alertify.alert("Error", res, function () {
								this.destroy();
							});
							return false;
						}
						if (registro[0] == 1) {
							$("[data-db=terceroid]").val(registro[1].trim());
							cargarTercero();
						} else {
							alertify.alert("Error", res);
						}
						break;
				}
			},
		});
	}
});

$(".data-int")
	.inputmask({
		groupSeparator: "",
		alias: "integer",
		placeholder: "",
		autoGroup: !0,
		digitsOptional: !1,
		clearMaskOnLostFocus: !1,
		rightAlign: false,
	})
	.focus(function () {
		$(this).select();
	});

$("[data-db=evento]").change(function () {
	const evento = $("[data-db=evento]").val();
	$.ajax({
		url: base_url() + "Administrativos/Eventos/AnticipoCartera/ValidarEvento",
		type: "POST",
		data: {
			evento,
		},
		dataType: "json",
		success: function (res) {
			if (res.length > 0) {
				$ModifFeRec = res[0].ModifFeRec;
				$AlmacenId = res[0].AlmacenId;
				$("[data-db=recibo]").val(res[0].ReciboEvento);
			} else {
				$ModifFeRec = false;
				$AlmacenId = null;
				$("[data-db=recibo]").val("");
				$("[data-db=evento]").val("");
				alertify.warning("No existe ningún evento con el número digitado");

				dtAlertify({
					titulo: "Eventos",
					campos: ["EventoId", "Evento", "Estado", "Nombre"],
					dtConfig: {
						data: {
							select: ["E.EventoId", "E.Evento", "E.Estado", "E.Nombre"],
							table: [
								"Evento E",
								[
									[
										`(SELECT
												MAX(EventoId) AS EventoId,
												Evento,
												MAX([Version]) AS [Version]
											FROM Evento
											GROUP BY Evento
											) X`,
										"E.EventoId = X.EventoId",
										"INNER",
									],
								],
								[
									["E.Estado NOT IN ('NU')"]
								],
							],
							column_order: ["E.EventoId", "E.Evento", "E.Estado", "E.Nombre"],
							orden: [["EventoId", "DESC"]],
							column_search: ["E.Evento", "E.Nombre"],
							columnas: ["EventoId", "Evento", "Estado", "Nombre"],
						},
						orderable: true,
						columns: [
							{
								data: 0,
								visible: false,
							},
							{ data: 1 },
							{
								data: 2,
								render: function (Estado) {
									return estados[Estado];
								},
							},
							{ data: 3 },
						],
					},
				}).then((res) => {
					$("[data-db=evento]").val(res[1]).change();
				});
			}

			if ($ModifFeRec != "S") {
				$('[data-db="fecha"]').attr("readonly", true);
			} else {
				$('[data-db="fecha"]').attr("readonly", false);
			}
		},
	});
});

alertify.dialog(
	"myConfirm",
	function () {
		var settings;
		return {
			setup: function () {
				var settings = alertify.alert().settings;
				for (var prop in settings) this.settings[prop] = settings[prop];
				var setup = alertify.alert().setup();
				setup.buttons.push({
					text: "Crear",
					scope: "auxiliary",
					className: "btnCrearTercero",
				});
				setup.buttons.push({
					text: "Consultar",
					scope: "auxiliary",
					className: "btnConsultarTercero",
				});
				setup.options.title = "Advertencia";
				return setup;
			},
			settings: {
				oncontinue: null,
			},
			callback: function (closeEvent) {
				if (closeEvent.index == 2) {
					if (typeof this.get("oncontinue") == "function") {
						returnValue = this.get("oncontinue").call(this, closeEvent);
						if (typeof returnValue !== "undefined") {
							closeEvent.cancel = !returnValue;
						}
					}
				} else {
					alertify.alert().callback.call(this, closeEvent);
				}
			},
		};
	},
	false,
	"alert"
);

$(document).on("click", ".btnCrearTercero", function (e) {
	e.preventDefault();
	$("#modalTercConCrear").modal("hide");
	$ID = $ID.replace(/ /g, "");

	terceroComponent({
		tercero: $ID,
		paneles: ["DatosPrincipales", "DireccionResidencia"],
	})
		.then((res) => {
			$("[data-db=terceroidNombre]").text(
				res.data.contentDatosPersonales.nombre
			);
		})
		.catch((error) => {
			$("[data-db=terceroid]").val("");
			console.log(error);
		});
});

$(document).on("click", ".btnConsultarTercero", function (e) {
	e.preventDefault();
	$("#modalTercConCrear").modal("hide");
	BusquedaTercero();
});

function BusquedaTercero() {
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
					},
					onshow: function () {
						busqueda = true;
						$(".ajs-dialog:visible").addClass("busqueda");
					},
				});
				alertify.myAlert(data);
				if ($CLUB == "False") {
					config = {
						data: {
							tblID: "#tblBusqueda",
						},
						ajax: {
							url:
								base_url() +
								"Administrativos/Eventos/AnticipoCartera/DTAnticipoCarteraBusqueda",
							type: "POST",
						},
						processing: true,
						serverSide: true,
						bAutoWidth: false,
						columnDefs: [{ targets: [0], width: "1%" }],
						ordering: false,
						pageLength: 10,
						initComplete: function () {
							setTimeout(function () {
								$("div.dataTables_filter input").focus();
							}, 0);
							$("div.dataTables_filter input")
								.unbind()
								.change(function (e) {
									e.preventDefault();
									table = $("body").find("#tblBusqueda").dataTable();
									table.fnFilter(this.value);
								});
						},
						oSearch: { sSearch: $ID },
						createdRow: function (row, data, dataIndex) {
							$(row).click(function () {
								$("[data-codigo]").val(data[0]).focusin().change();
								// $(self).val(data[0]).change();
								alertify.myAlert().close();
							});
						},
						deferRender: true,
						scrollY: screen.height - 420,
						scroller: {
							loadingIndicator: true,
						},
						dom: domftri,
					};
				} else {
					config = {
						data: {
							tblID: "#tblBusqueda",
						},
						ajax: {
							url:
								base_url() +
								"Administrativos/Eventos/AnticipoCartera/DTAnticipoCarteraBusqueda2",
							type: "POST",
							data: function (d) {
								return $.extend(d, $ID);
							},
						},
						processing: true,
						serverSide: true,
						bAutoWidth: false,
						columnDefs: [{ targets: [0], width: "1%" }],
						ordering: false,
						pageLength: 10,
						initComplete: function () {
							setTimeout(function () {
								$("div.dataTables_filter input").focus();
							}, 500);
							$("div.dataTables_filter input")
								.unbind()
								.change(function (e) {
									e.preventDefault();
									table = $("body").find("#tblBusqueda").dataTable();
									table.fnFilter(this.value);
								});
						},
						oSearch: { sSearch: $ID },
						createdRow: function (row, data, dataIndex) {
							$(row).click(function () {
								$("[data-codigo]").val(data[0]).focusin().change();
								// $(self).val(data[0]).change();
								alertify.myAlert().close();
							});
						},
						deferRender: true,
						scrollY: screen.height - 420,
						scrollX: true,
						scroller: {
							loadingIndicator: true,
						},
						dom: domftri,
					};
				}
				dtSS(config);
			},
		});
	};
	if ($CLUB == "False") {
		alertify.ajaxAlert(base_url() + "Busqueda/DataTable");
	} else {
		var campos = encodeURIComponent(
			JSON.stringify(["Código", "Nombre", "Barra", "Tarjeta", "Acción"])
		);
		alertify.ajaxAlert(base_url() + "Busqueda/DataTable?campos=" + campos);
	}
}

function addCommas(nStr) {
	if (nStr != "null") {
		nStr += "";
		x = nStr.split(".");
		x1 = x[0];
		x2 = x.length > 1 ? "." + x[1] : "";
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, "$1" + "," + "$2");
		}
		return x1 + x2;
	} else {
		return "0";
	}
}

$.extend({
	redirectPost: function (location, args) {
		var form = $("<form></form>");
		form.attr("method", "post");
		form.attr("action", location);

		$.each(args, function (key, value) {
			var field = $("<input></input>");

			field.attr("type", "hidden");
			field.attr("name", key);
			field.attr("value", value);

			form.append(field);
		});
		$(form).appendTo("body").submit();
	},
});

$("#submitFormaPago").click(function (e) {
	e.preventDefault();
	if ($('[data-db="evento"]').val() == "") {
		alertify.error("Digite el número del evento");
		return false;
	}
	if ($('[data-db="anticipo"]').val() == "") {
		alertify.error("Digite el valor del anticipo");
		return false;
	}
	if ($('[data-db="codipagoid"]').val() == "") {
		alertify.error("Seleccione forma de pago");
		return false;
	}
	alertify.confirm(
		"Advertencia",
		"¿Está seguro de grabar el recibo de caja?",
		function () {
			var frmData = {};
			$("[data-db]").each(function () {
				frmData[$(this).attr("data-db")] = $(this).val();
			});
			$.ajax({
				url:
					base_url() +
					"Administrativos/Eventos/AnticipoCartera/GuardarAnticipo",
				type: "POST",
				data: {
					frmData: frmData,
					RASTREO: RASTREO("", "Anticipos"),
				},
				success: function (res) {
					switch (res) {
						case "0":
							alert.alert("Error", "Ocurrió un error en el momento ");
							break;
						case "2":
							alertify.alert("Advertencia", "No hay almacén definido en el evento, revise la configuración de sedes");
							break;
						default:
							try {
								var registro = JSON.parse(res);
							} catch (e) {
								alertify.alert("Error", res, function () {
									this.destroy();
								});
								return false;
							}
							if (registro[0] == 1) {
								alertify.alert(
									"Anticipo generado satisfactoriamente",
									"Se ha guardado exitosamente el anticipo, Recibo No. " +
										registro[1],
									function () {
										abrirReporte(
											base_url() + "Reportes/ImprimirAnticipo/" + registro[2]
										);

										setTimeout(() => {
											cargarTercero();
										}, 100);
									}
								);
							} else {
								alertify.alert(
									"Error",
									"Ocurrió un problema al momento de registrar la reserva",
									function () {
										this.destroy();
									}
								);
								return false;
							}
							break;
					}
				},
			});
		},
		function () {}
	);
});

$("#btnCancelar").click(function (e) {
	e.preventDefault();
	location.href = base_url() + "Administrativos/Eventos/AnticipoCartera";
});

$("#frmAnticipo").on(
	"change",
	"[data-foranea]:not([data-codigo])",
	function () {
		var value = $(this).val();
		var tabla = $(this).attr("data-foranea");
		var self = this;

		if (value != "") {
			var nombre = $(self).attr("data-foranea-codigo");
			var tblNombre = "nombre";
			$.ajax({
				url:
					base_url() + "Administrativos/Eventos/AnticipoCartera/CargarForanea",
				type: "POST",
				data: {
					tabla: tabla,
					value: value,
					nombre: nombre,
					tblNombre: tblNombre,
				},
				success: function (respuesta) {
					if (respuesta == 0) {
						$(self)
							.val("")
							.closest(".input-group")
							.find("span")
							.text("")
							.attr("title", "");
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
										},
										onshow: function () {
											busqueda = true;
										},
									});

									alertify.myAlert(data);

									var $tblID = "#tblBusqueda";
									var config = {
										data: {
											tblID: $tblID,
											select: [$(self).attr("data-foranea-codigo"), tblNombre],
											table: [$(self).attr("data-foranea")],
											column_order: [
												$(self).attr("data-foranea-codigo"),
												tblNombre,
											],
											column_search: [
												$(self).attr("data-foranea-codigo"),
												tblNombre,
											],
											orden: {},
											columnas: [
												$(self).attr("data-foranea-codigo"),
												tblNombre,
											],
										},
										bAutoWidth: false,
										columnDefs: [{ targets: [0], width: "1%" }],
										ordering: false,
										pageLength: 10,
										initComplete: function () {
											setTimeout(function () {
												$("div.dataTables_filter input").focus();
											}, 500);
											$("div.dataTables_filter input")
												.unbind()
												.change(function (e) {
													e.preventDefault();
													table = $("body").find($tblID).dataTable();
													table.fnFilter(this.value);
												});
										},
										oSearch: { sSearch: value },
										createdRow: function (row, data, dataIndex) {
											$(row).click(function () {
												$(self).val(data[0]).change();
												alertify.myAlert().close();
											});
										},
										deferRender: true,
										scrollY: screen.height - 400,
										scroller: {
											loadingIndicator: true,
										},
										dom: "ftri",
									};

									if (tabla == "CodiPago") {
										config.data.table[2] = [
											["encartera", 1],
											["activa <>", "N"],
										];
									} else if (tabla == "bancos") {
										config.data.table[2] = [["estado <>", "I"]];
									}
									dtSS(config);
								},
							});
						};
						alertify.ajaxAlert(base_url() + "Busqueda/DataTable");
					} else {
						respuesta = JSON.parse(respuesta);

						if (tabla == "CodiPago") {
							$("[data-db=bancoid]")
								.attr("readonly", true)
								.val("")
								.closest(".input-group")
								.find("span")
								.text("")
								.attr("title", "");
							$("[data-db=tipodocume]").attr("readonly", true).val("");
						}

						if (tabla == "CodiPago" && respuesta[0]["encartera"] != 1) {
							alertify.alert(
								"Advertencia",
								"Forma de Pago no habilitada para Cartera",
								function () {
									$(self)
										.val("")
										.closest(".input-group")
										.find("span")
										.text("")
										.attr("title", "");
								}
							);
						} else {
							$(self)
								.closest(".input-group")
								.find("span")
								.text(respuesta[0][tblNombre])
								.attr("title", respuesta[0][tblNombre]);

							if (tabla == "CodiPago") {
								if (respuesta[0]["manejcentr"] == "S") {
									$("[data-db=bancoid]").attr("readonly", false);
								}
								if (respuesta[0]["manejnumer"] == "S") {
									$("[data-db=NumerDocum]").attr("readonly", false);
								}
							}
						}
					}
				},
			});
		} else {
			$(self).closest(".input-group").find("span").text("").attr("title", "");
		}
	}
);

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
					}, 500);
				},
			},
		};
	});

$('[data-db="anticipo"]').change(function () {
	if ($(this).val() == "") {
		var value = 0;
	}
	if (value != 0) {
		$('[data-db="codipagoid"]').attr("readonly", false);
		$('[data-db="observacio"]').attr("readonly", false);

		$("#submitFormaPago").attr("disabled", false);
		// $('#btnCancelar').attr('disabled', false);
	} else {
		$('[data-db="codipagoid"]').attr("readonly", true);
		$('[data-db="observacio"]').attr("readonly", true);

		$("#submitFormaPago").attr("disabled", true);
		// $('#btnCancelar').attr('disabled', true);
	}
});

$(".date").datetimepicker({
	format: "DD-MM-YYYY",
	locale: "es",
});

function capitalizarPalabras(texto) {
	let textoFormateado = null;
	if (texto != null) {
		let palabras = texto.split(" ");

		for (let i = 0; i < palabras.length; i++) {
			palabras[i] =
				palabras[i].charAt(0).toUpperCase() +
				palabras[i].slice(1).toLowerCase();
		}

		textoFormateado = palabras.join(" ");
	}
	return textoFormateado;
}

function cargarTercero() {
	const terceroid = $("[data-db=terceroid]").val();
	const accionid = $("[data-db=accionid]").val();
	$.redirectPost(base_url() + "Administrativos/Eventos/AnticipoCartera", {
		json: JSON.stringify({
			terceroid,
			accionid,
		}),
	});
}
