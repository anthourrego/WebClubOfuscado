let rutaGeneral = base_url() + "Administrativos/Servicios/";
let idAlmacen;
let datosFactura;
let almacenActual;
let contexto = this;
let vendedorElegido = null;
let almacenUsuarioPermisos;
let tipoReactivacion = null;
let cargueHotel = {};
let tipoVentaHotel = {};
let UserAutorizaActual = null;
let accionPos = VistaGeneralMenu
	? "pedido_mesa"
	: sessionStorage.getItem("accionPos");

let permisoVerificar = sessionStorage.getItem("permiso");
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
						closable: false,
					},
				};
			},
			hooks: {
				onclose: function () {
					$("#modal-reimprimir").modal("toggle");
					setTimeout(function () {
						alertify.myAlert().destroy();
					}, 500);
				},
				onshow: function () {
					$("#modal-reimprimir").modal("toggle");
				},
			},
		};
	});

function tipoVenta(infodata) {
	//Validamos los UVTs y si tiene todo declarado
	if (
		($EVENTO > 0 ||
			accionPos == "general" ||
			accionPos == "pedido_mesa" ||
			accionPos == "facturas_pendientes_pago" ||
			accionPos == "cuentas_pendientes") &&
		infodata.FacturaElectronica == "N" &&
		$DATOSMONTAJE.UVTsFE > 0
	) {
		if ($DATOSMONTAJE.ValorUVT <= 0) {
			let anio = moment().format("YYYY");
			alertify.alert(
				"Advertencia",
				`No se ha especificado el valor de la UVT para el año ${anio}. No es posible continuar.`,
				() => {
					return;
				}
			);
			return;
		}
	}

	sessionStorage.setItem("tipoVenta", JSON.stringify(infodata));
	$("#tipoVentaAlmacen").modal("hide");
	if (
		$EVENTO > 0 ||
		accionPos === "facturas_pendientes_pago" ||
		accionPos === "reimprimir" ||
		accionPos === "informe_vendedor"
	) {
		if (infodata.vendedor == "S") {
			let data = { almacen: idAlmacen, accionPos };
			obtenerInformacion(data, "obtenerVendedores", "datosVendedores");
		} else {
			accionVendedor({ vendedorid: null });
		}
	} else {
		if (accionPos === "cuentas_pendientes") {
			location.href = rutaGeneral + "CuentasPendientes?almacen=" + idAlmacen;
			return;
		}
		if (accionPos == "pedido_mesa" && almacenActual.ManejaMesas != "S") {
			alertify.warning("El almacen debe manejar mesas.");
			return;
		}
		let urlCargueHotel = "";
		if (cargueHotel.ReservaId) {
			urlCargueHotel =
				"/" + cargueHotel.ReservaId.trim() + "/" + cargueHotel.Tercero.trim();
		}
		location.href =
			rutaGeneral + `VistaGeneral/Mesas/${idAlmacen.toString().trim()}/${infodata.codiventid.toString().trim()}` + urlCargueHotel;
	}
}

function validarTipoVenta(tiposVenta) {
	if (tiposVenta && tiposVenta.length) {
		if (tiposVenta.length == 1) {
			tipoVenta(tiposVenta[0]);
		} else {
			$("#estructura").empty();
			tiposVenta.forEach((item) => {
				$("#estructura").append(`<div class="col-3 p-1">
						<div class="card mb-1 h-100" style="box-shadow: none !important;">
							<div class="card-body p-1" onclick='tipoVenta(${JSON.stringify(
								item
							)})' style="border:2px solid #d4d4d4; cursor:pointer; border-radius: 5px; height: 80px;">
								<div class="container-item text-center" style="font-size: 13px; text-overflow: ellipsis; white-space: break-spaces;overflow: hidden;">${
									item.codiventid
								} - ${item.nombre}</div>
							</div>
						</div>
					</div>`);
			});
			$("#tipoVentaAlmacen").modal("show");
		}
	} else {
		alertify.warning("El almacen no tiene tipo de venta asignado" + (accionPos == "pedido_mesa" ? ' con manejo de mesas' : ''));
	}
}

function obtenerInformacion(data, metodoBack, funcion) {
	data = $.Encriptar(data);
	$.ajax({
		url: rutaGeneral + "PanelPrincipal/" + metodoBack,
		type: "POST",
		dataType: "json",
		data: {
			encriptado: data,
		},
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (resp.valido) {
				this[funcion](resp);
			} else {
				if (funcion == "resolucionBuscada") {
					this[funcion](resp);
				} else {
					alertify.error(resp.mensaje);
				}
			}
		},
	});
}

function cancelarUsuario() {
	if ($("#formDataAdmin")[0]) {
		$("#formDataAdmin")[0].reset();
		$("#formDataAdmin :input").removeClass("is-invalid");
		$("#formDataAdmin").validate().resetForm();
	}
}

function dataUsuario(resp) {
	if (accionPos == "actualiza_forma_pago" || accionPos == "reactiva-consumo") {
		if (accionPos == "reactiva-consumo") datosFactura = null;
		if (datosFactura && datosFactura["factura"]) {
			abrirCerrarModal(
				"#modal-solicitar-usuario",
				"hide",
				"#modal-numero-factura",
				"show"
			);
			setTimeout(() => {
				$("#numFac").focus();
			}, 500);
		} else {
			sessionStorage.setItem("accionPos", accionPos);
			if (accionPos == "reactiva-consumo") {
				reactivarConsumoCortesia();
			} else {
				location.href =
					base_url() +
					"Administrativos/Servicios/VistaGeneral?actualiza-forma-pago=true&usuario=" +
					resp.usuarioId;
			}
		}
	} else if (accionPos == "reimprimir") {
		$("#formReimprimirFacturas :input").prop("disabled", true);
		obtenerInformacion({ idAlmacen }, "resolucionFacturas", "datosResolucion");
	} else if (accionPos == "informe-general-consumos-facturas") {
		location.href =
			base_url() +
			"Administrativos/Servicios/InformeGeneralConsumoFacturas?usuario=" +
			resp.usuarioId;
	} else if (accionPos == "informe-vendedor-por-consumo") {
		location.href =
			base_url() +
			"Administrativos/Servicios/InformeVendedorConsumo?usuario=" +
			resp.usuarioId;
	} else if (
		accionPos == "basecaja" ||
		accionPos == "recogidas" ||
		accionPos == "cuadreCajero"
	) {
		sessionStorage.setItem("accionPos", accionPos);
		location.href =
			base_url() +
			"Administrativos/Servicios/VistaGeneral?" +
			accionPos +
			"=true&usuario=" +
			resp.usuarioId;
	} else if (accionPos == "cambio-almacen-vendedor") {
		location.href =
			base_url() +
			`Administrativos/Servicios/CambioAlmacen/Vendedor/${resp.usuarioId}`;
	} else if (accionPos == "cambio-almacen-cajero") {
		location.href =
			base_url() +
			`Administrativos/Servicios/CambioAlmacen/Cajero/${resp.usuarioId}`;
	} else if (accionPos == "informe_ventas_cajero") {
		location.href =
			base_url() + "Administrativos/Servicios/informeVentasCajero";
	}
}

function datosResolucion({ datos }) {
	//Reseteamos el formulario antes de por si hay informacion precargada
	$("#formReimprimirFacturas")[0].reset();
	$("#formReimprimirFacturas :input").removeClass("is-invalid");
	$("#formReimprimirFacturas").validate().resetForm();

	if (datos) {
		if (datos["FE"] == 1 && $POSImprimeComprobanteElec == "N") {
			alertify.alert(
				"Advertencia",
				"El sistema no esta configurado para imprimir comprobante electronicos",
				function () {
					$("#formReimprimirFacturas")[0].reset();
					setTimeout(() => {
						$("#prefijo").trigger("focus");
					}, 100);
				}
			);
		} else {
			Object.keys(datos).forEach((it) =>
				$(`#${it}`).val(it != "FE" ? datos[it] : datos[it] == 0 ? "N" : "S")
			);
		}
	}

	$("#prefijo").prop("disabled", false);
	abrirCerrarModal(
		"#modal-solicitar-usuario",
		"hide",
		"#modal-reimprimir",
		"show"
	);
	$("#prefijo")
		.unbind()
		.change(function () {
			let disable = $(this).val() == "" ? true : false;
			$("#numDocIni").prop("disabled", disable);
			$("#numDocIni, #numDocFin").val("");
			if (datos["prefijo"] == $(this).val()) {
				Object.keys(datos).forEach((it) =>
					$(`#${it}`).val(it != "FE" ? datos[it] : datos[it] == 0 ? "N" : "S")
				);
			} else {
				obtenerInformacion(
					{ prefijo: $(this).val() },
					"buscarResolucion",
					"resolucionBuscada"
				);
			}
		});
	$("#numDocIni")
		.unbind("keyup")
		.keyup(function () {
			let disable = $(this).val() == "" ? true : false;
			$("#numDocFin").prop("disabled", disable);
		});

	$("#numDocIni")
		.unbind("focusout")
		.focusout(function () {
			$("#numDocFin").val($(this).val());
		});
	setTimeout(() => {
		$("#prefijo").focus();
	}, 300);
	let oculto = $("#prefijo").val() == "" ? true : false;
	$("#numDocIni").prop("disabled", oculto);
	$("#numDocFin")
		.unbind("focusout")
		.focusout(function () {
			$("#cantidadFacturas").val(
				$("#numDocFin").val() - $("#numDocIni").val() + 1
			);
		});
	$("#formReimprimirFacturas")
		.unbind()
		.submit(function (e) {
			e.preventDefault();
			let $rango = 0;
			$rango = $("#numDocFin").val() - $("#numDocIni").val();
			if ($("#formReimprimirFacturas").valid()) {
				if (+$("#numDocIni").val() > +$("#numDocFin").val()) {
					alertify.warning("El número inicial debe ser menor al final.");
					return;
				}
				// validacion si el rango de facturas a reimprimir es mayor a 100 no lo deje.
				if ($rango >= 100) {
					alertify.warning(
						"A superado la cantidad máxima de reimpresiones permitidas."
					);
					return;
				}
				let data = {
					prefijo: $("#prefijo").val(),
					numDocIni: +$("#numDocIni").val(),
					numDocFin: +$("#numDocFin").val(),
					facelectronica: $("#FE").val(),
					resolucion: $("#numero").val(),
					resolid: $("#ResolucionIdPOS").val(),
					idAlmacen: idAlmacen,
				};
				obtenerInformacion(data, "obtenerFacturas", "facturasObtenidas");
			} else {
				alertify.error("Validar la información de los campos.");
			}
		});
}

function resolucionBuscada({ datos }) {
	if (datos) {
		if (datos["FE"] == 1 && $POSImprimeComprobanteElec == "N") {
			alertify.alert(
				"Advertencia",
				"El sistema no esta configurado para imprimir comprobante electronicos",
				function () {
					$("#formReimprimirFacturas")[0].reset();
					setTimeout(() => {
						$("#prefijo").trigger("focus");
					}, 100);
				}
			);
		} else {
			Object.keys(datos).forEach((it) =>
				$(`#${it}`).val(it != "FE" ? datos[it] : datos[it] == 0 ? "N" : "S")
			);
		}
	} else {
		var value = $("#prefijo").val();
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
							select: ["resolucionid AS ResolucionIdPOS", "prefijo"],
							table: ["Resolucion"],
							column_order: ["resolucionid", "prefijo"],
							column_search: ["resolucionid", "prefijo"],
							orden: {},
							columnas: ["ResolucionIdPOS", "prefijo"],
						},
						bAutoWidth: false,
						serverSide: true,
						columnDefs: [{ targets: [0], width: "1%" }],
						order: [],
						ordering: false,
						draw: 10,
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
								$("#prefijo").val(data[1]).change();
								alertify.myAlert().close();
							});
						},
						scrollY: screen.height - 400,
						scroller: {
							loadingIndicator: true,
						},
						dom: domftri,
					};
					dtSS(config);
				},
			});
		};
		alertify.ajaxAlert(base_url() + "Busqueda/DataTable");
	}
}

function facturasObtenidas({ datos, noEncontradas }) {
	let j = 0;
	let strReportes = "";
	let funcionFactura = "ImprimirFactura";
	if ($("#FE").val() == "S") {
		funcionFactura = "ImprimirFacturaElectronica";
	}

	alertify.confirm(
		"Advertencia",
		"¿Desea imprimir los comprobantes de venta?",
		function () {
			datos.forEach((it) => {
				strReportes += j == 0 ? "?" : "&";

				strReportes += `r${j}=${funcionFactura}/${it.facturaid}/1/1`;

				if (Object.keys(it.Terceros).length > 1) {
					let i = 0;
					for (x in it.Terceros) {
						strReportes += "&";
						strReportes +=
							"r" +
							j +
							i +
							"=ImprimirComprobantePago/" +
							it.facturaid +
							"/" +
							it.Terceros[x] +
							"/" +
							i +
							"/1/1";
						i++;
					}
				}
				j++;
			});

			abrirReporte(base_url() + "Reportes/imprimirReportes/" + strReportes);
		},
		function () {
			datos.forEach((it) => {
				strReportes += j == 0 ? "?" : "&";

				strReportes += `r${j}=ImprimirFactura/${it.facturaid}/1/1`;
				j++;
			});

			abrirReporte(base_url() + "Reportes/imprimirReportes/" + strReportes);
		}
	);
}

function abrirCerrarModal(elemento, metodo, elementoAbrir, metodoAbrir) {
	$(elemento).modal(metodo);
	if (elementoAbrir && metodoAbrir) {
		$(elementoAbrir).modal(metodoAbrir);
	}
}

function dataFactura({ datos, vendedores }) {
	$("#listaVendedores").html("");
	$("#listaVendedoresEmpty").show();
	$(".form-buscar-vendedor").addClass("d-none").removeClass("d-flex");
	if (vendedores.length) {
		let estructura = "";
		vendedores.forEach((it) => {
			estructura += `<div class="col-12 col-sm-4 col-md-4 col-lg-2 mb-2" style="cursor:pointer">
				<div class="card mb-1 h-100" style="box-shadow: none !important;">
					<div id="vend${
						it.vendedorid
					}" class="card-body px-1 py-1 rounded card-vendedor ${
				it.Actual ? "card-vendedor-seleccionado" : ""
			}" style="border:1px solid #b2b9be;" data-vendedor="${it.vendedorid}">
						<div class="container-vendedor text-center">
						<img src="${it.foto}" style="height: 68px; border-radius: 3px;">
						</div>
						<p style="text-align: center;font-size: 14px;margin-bottom:6px;margin-top: 6px;">${
							it.nombre
						}</p>
					</div>
				</div>
			</div>`;
		});
		$("#listaVendedoresEmpty").hide();
		$(".form-buscar-vendedor").addClass("d-flex").removeClass("d-none");
		$("#listaVendedores").html(estructura);
	}
	datosFactura = datos;
	if (moment(datos.fecha).isSameOrAfter(moment(), "day")) {
		abrirCerrarModal(
			"#modal-numero-factura",
			"hide",
			"#ElegirVendedor",
			"show"
		);
		//location.href2 = rutaGeneral + 'ActualizarFormaPago/factura/' + datosFactura['facturaid'];
	} else {
		alertify.confirm(
			"Alerta",
			`La factura no pertenece al dia de hoy (${datos.fecha}), ¿Esta seguro que desea editarle el vendedor?`,
			function (ok) {
				cancelarUsuario();
				abrirCerrarModal(
					"#modal-numero-factura",
					"hide",
					"#modal-solicitar-usuario",
					"show"
				);
				setTimeout(() => {
					$("#usuarioid").focus();
				}, 500);
			},
			function (err) {
				$("#btnCancelarUsuario").click();
				abrirCerrarModal("#modal-numero-factura", "hide");
			}
		);
	}
	$(".card-vendedor").click(function () {
		if (datosFactura["vendedorid"] != $(this).data("vendedor")) {
			let vendedor = $(this).data("vendedor");
			alertify.confirm(
				"Advertencia",
				"¿Esta seguro de modificar el vendedor de la factura?",
				function () {
					let encriptado = $.Encriptar({
						vendedor,
						factura: datosFactura.facturaid,
						numeroFactura: datosFactura.factura,
						idAlmacen,
					});
					$.ajax({
						url: rutaGeneral + "PanelPrincipal/ActualizarVendedor",
						type: "POST",
						data: { encriptado },
						dataType: "json",
						success: function (resp) {
							resp = JSON.parse($.Desencriptar(resp));
							if (resp.valido) {
								alertify.success(resp.mensaje);
								abrirCerrarModal(
									"#ElegirVendedor",
									"hide",
									"#modal-solicitar-usuario",
									"hide"
								);
								$("#numFac").val("");
								datosFactura = null;
							} else {
								alertify.error(resp.mensaje);
							}
						},
					});
				},
				function () {}
			);
		} else {
			alertify.warning("Vendedor no puede ser igual al de la factura.");
		}
	});
}

function dataFacturaRactivarConsumo({ datos }) {
	abrirCerrarModal("#modal-numero-factura", "hide");
	alertify.confirm(
		"Advertencia",
		`¿Esta seguro de reactivar la ${tipoReactivacion}?`,
		function () {
			let encriptado = $.Encriptar({
				factura: datos.facturaid,
				sede: almacenActual.SedeId,
				tipoReactivacion: tipoReactivacion,
				usuAutoriza: UserAutorizaActual,
				idAlmacen,
			});
			$.ajax({
				url: rutaGeneral + "PanelPrincipal/reactivarConsumoFactura",
				type: "POST",
				dataType: "json",
				data: { encriptado },
				success: function (resp) {
					resp = JSON.parse($.Desencriptar(resp));
					if (resp.valido) {
						alertify.success(resp.mensaje);
						$("#numFac").val("");
						datosFactura = null;
						alertify.alert("Advertencia", "¿Desea ir al consumo?", function () {
							redirigirConsumo(resp);
						});
					} else {
						alertify.error(resp.mensaje);
					}
				},
			});
		},
		function () {
			abrirCerrarModal("#modal-numero-factura", "show");
		}
	);
}

function redirigirConsumo(resp) {
	let fac = resp.factura;
	sessionStorage.setItem("tipoVenta", JSON.stringify(fac.tipoVenta));
	sessionStorage.setItem(
		"accionPos",
		fac.mesa && fac.mesa != "" ? "pedido_mesa" : "general"
	);

	let urlCargueHotel = "";
	if (cargueHotel.ReservaId) {
		urlCargueHotel =
			"/" + cargueHotel.ReservaId.trim() + "/" + cargueHotel.Tercero.trim();
	}
	let datos = {
		TerceroId: fac.terceroid,
		accionPos: fac.mesa && fac.mesa != "" ? "pedido_mesa" : "general",
		VendedorId: fac.vendedorid,
		MesaId: fac.mesa && fac.mesa != "" ? fac.mesa : null,
		reactivarConsumo: true,
		AlmacenId: fac.AlmacenIdC,
		tipoVentaSeleccionado: JSON.stringify(fac.tipoVenta),
		arrayProductosPedido: JSON.stringify([]),
		ConAccion: false,
		terceroDatos: JSON.stringify(resp.infoTercero),
		codBarraTercero:
			resp.infoTercero && resp.infoTercero.barra ? resp.infoTercero.barra : "",
		numPersonas: fac.personas,
		terceroPedidoEmpresa: JSON.stringify(
			resp.dataEmpresaFact ? resp.dataEmpresaFact : {}
		),
	};
	sessionStorage.setItem("dataPos", $.Encriptar(datos));
	location.href =
		base_url() + `Administrativos/Servicios/VistaGeneral/Mesas/${fac.AlmacenIdC.toString().trim()}/${fac.tipoVenta.codiventid.toString().trim()}` + urlCargueHotel;
}

function datosVendedores({ vendedores }) {
	$("#listaVendedores").html("");
	$("#listaVendedoresEmpty").show();
	$(".form-buscar-vendedor").removeClass("d-flex").addClass("d-none");
	let pos = vendedores.findIndex((x) => x.vendUser);
	//se hace validacion para que al momento de ingresar al modulo reimprimir no muestre la modal de vendedores si no que pase directo
	reimprimirVendedor = window.location.search;
	if (reimprimirVendedor == '?reimprimir=true') {
		accionVendedor(null);
	}else{
		if (pos > -1) {
			accionVendedor(vendedores[pos]);
		} else {
			if (vendedores.length) {
				$(".form-buscar-vendedor").addClass("d-flex").removeClass("d-none");	
				vendedores.forEach((it) => {
					$("#listaVendedores")
						.append(`<div class='col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 p-2'>
							<div id='vend${it.vendedorid}' class='card h-100 shadow-none cursor-pointer card-vendedor' data-vendedor='${it.vendedorid}' >
								<div class='card-body p-1'>
									<div class='container-vendedor text-center rounded' style='background-image: url("${it.foto}")'></div>
									<p class='card-text text-center pt-1 nombre-vendedor'>${it.nombre}</p>
								</div>
							</div>
						</div>`);
				});
				$("#listaVendedoresEmpty").hide();
			}
			$("#ElegirVendedor").modal("show");
			$(".card-vendedor").click(function () {
				let actual = this;
				let vend = vendedores.find(
					(it) => it.vendedorid == $(this).data("vendedor")
				);
				vendedorElegido = vend.vendedorid;
				if (vend.Pass && $DATOSMONTAJE.SolicitaClaveVendedor == "S") {
					let mensaje = `
						<h6>${vend.nombre}</h6>
						<input type="password" class="form-control data-pass p-1 alertify" autocomplete="off" id="dataPass">
					`;
	
					alertify
						.confirm()
						.setting({
							message: mensaje,
							onok: function () {
								let pass = $(".ajs-content").find(".data-pass").val();
								if (pass != "") {
									$.ajax({
										url: rutaGeneral + "PanelPrincipal/validarPassVendedor",
										type: "POST",
										dataType: "json",
										data: {
											idVendedor: vend.vendedorid,
											pass: pass,
										},
										success: function (resp) {
											if (resp.success) {
												accionVendedor(vend);
											} else {
												setTimeout(() => {
													$(actual).click();
												}, 100);
												alertify.error("Contraseña incorrecta");
											}
										},
									});
								} else {
									setTimeout(() => {
										$(actual).click();
									}, 100);
									alertify.warning("Por favor digite una contraseña");
								}
							},
							title: "Confirmar Contraseña",
						})
						.set({
							onshow: function () {
								$(".data-pass").keyup(function (e) {
									e.preventDefault();
									if (e.keyCode == 13 && $(this).val() != "")
										$(".ajs-ok").click();
								});
								$(".ajs-content").find(".data-pass").val("");
								setTimeout(function () {
									$(".ajs-content").find(".data-pass").focus();
								}, 1000);
							},
							onclose: function () {
								alertify.alert().set({ onshow: null });
							},
						})
						.show();
				} else {
					accionVendedor(vend);
				}
			});
		}
	}
}

function buscarVendedor(buscar = "") {
	var cont = 0;
	$("#buscarVendedor").val(buscar);
	$("#listaVendedores").children("div").removeClass("d-none");
	$("#listaVendedoresEmpty").hide();
	if (buscar == "") return;
	total = 0;
	$("#listaVendedores")
		.children("div")
		.filter(function (index, item) {
			total++;
			if ($(item).find("p").text().toLowerCase().includes(buscar.toLowerCase()))
				return true;
			$(item).addClass("d-none");
			cont++;
			return false;
		});
	if (cont == total) {
		$("#listaVendedoresEmpty").show();
	}
}

function irMesa() {
	obtenerInformacion({}, "obtenerAlmacenesNoFisico", "almacenesNoFisicos");
}

function almacenesNoFisicos({ almacenes }) {
	if (almacenes.length == 1) {
		irAlmacenNoFisico(almacenes[0]);
	} else {
		let estructura = "";
		almacenes.forEach((op) => {
			estructura += `<div onclick='irAlmacenNoFisico(${JSON.stringify(
				op
			)})' title="Ir al almacen" class="m-b-10 d-flex border rounded justify-content-between align-items-center pl-2">
				<div style="width: 72%;">
					<h6>${op.almacenid} - ${op.nombre}</h6>
				</div>
				<button type="button" title="Ir a la cuenta" class="btn btn-sm btn-secondary" style="max-height: 75px; height: 75px;">
					<i class="fas fa-share-square"></i>
				</button>
			</div>`;
		});
		$("#listaAlmacenes").html(estructura);
		abrirCerrarModal("#almacenNoFisico", "show");
	}
}

function irAlmacenNoFisico(info) {
	if (info.tiposVenta) {
		sessionStorage.setItem("acceso-modulo", "otras-ventas");
		sessionStorage.setItem("tipoVenta", JSON.stringify(info.tiposVenta));
		location.href = rutaGeneral + `VistaGeneral/Mesas/${info.almacenid.toString().trim()}/${info.tiposVenta.codiventid.toString().trim()}`;
	} else {
		alertify.warning("El almacen no esta asignado a un tipo de venta");
	}
}

function accionVendedor(vend) {
	if ($EVENTO > 0) {
		location.href = `${base_url()}Administrativos/Eventos/Eventos/IngresoEvento/${idAlmacen}/${$EVENTO}/${
			vend.vendedorid
		}`;
	} else if (accionPos === "informe_vendedor") {
		location.href =
			rutaGeneral +
			`InformeVendedor?vendedor=${vend.vendedorid}&almacen=${almacenActual.AlmacenId}`;
	} else if (accionPos === "reimprimir") {
		abrirCerrarModal("#ElegirVendedor", "hide", "#modalTipoImpresion", "show");
		setTimeout(() => {
			$("#modalTipoImpresion").find(".btn-success").focus();
		}, 1000);
	} else {
		location.href =
			rutaGeneral +
			`FacturasPendientes?vendedor=${vend.vendedorid}&almacen=${almacenActual.AlmacenId}`;
	}
}

function tipoReactivacionEjecutar(tipo, permiso) {
	tipoReactivacion = tipo;
	permisoVerificar = permiso;
	abrirCerrarModal(
		"#modalTipoReactivacion",
		"hide",
		"#modal-solicitar-usuario",
		"show"
	);
}

function reactivarConsumoCortesia() {
	$(".modal-title-reactivar").html(
		'<i style="color:#fff;" class="far fa-image"></i> ' +
			(tipoReactivacion == "factura" ? "Factura" : "Cortesia")
	);
	$(".numFacReactivar").html(
		tipoReactivacion == "factura" ? "Prefijo + Número de Factura" : "Número"
	);
	abrirCerrarModal(
		"#modal-solicitar-usuario",
		"hide",
		"#modal-numero-factura",
		"show"
	);
	setTimeout(() => {
		$("#numFac").focus();
	}, 500);
}

function tipoImpresionEjecutar(tipo) {
	if (tipo == "factura") {
		abrirCerrarModal(
			"#modalTipoImpresion",
			"hide",
			"#modal-reimprimir",
			"show"
		);
		$("#formReimprimirFacturas :input").prop("disabled", true);
		obtenerInformacion({ idAlmacen }, "resolucionFacturas", "datosResolucion");
	} else {
		let title = tipo == "comanda_hotel" ? "Comanda" : "Cortesia";
		$(".modal-title-impresion").html(
			'<i style="color:#fff;" class="far fa-image"></i> ' + title
		);
		abrirCerrarModal(
			"#modalTipoImpresion",
			"hide",
			"#modal-numero-imprimir",
			"show"
		);
		$("#formNumImpresion")
			.unbind()
			.on("submit", function (e) {
				e.preventDefault();
				if ($(this).valid()) {
					let data = {
						tipoImpresion: tipo,
						numero: $("#numImprimir").val(),
						vendedor: vendedorElegido,
						almacen: idAlmacen,
					};
					obtenerInformacion(data, "buscarImpresion", "datosReimprimir");
				}
			});
		$("#btnCancelarNumImpresion")
			.unbind()
			.on("click", function () {
				$("#numImprimir").val("");
				abrirCerrarModal("#modal-numero-imprimir", "hide");
			});
		setTimeout(() => {
			$("#numImprimir").focus();
		}, 100);
	}
}

function datosReimprimir({ datos, tipo, lugarPedido }) {
	if (tipo == "cortesia") {
		abrirReporte(
			base_url() + "Reportes/ImprimirCortesia/" + datos + "/1/1",
			contexto
		);
	} else {
		abrirReporte(
			base_url() +
				`reportes/imprimirComprobanteConsumoHotel/${datos}/${lugarPedido}/1/1`,
			contexto
		);
	}
}

function tipoVentaAlmacenH({ datos }) {
	tipoVentaHotel = datos;
}

$(function () {
	RastreoIngresoModulo(ALMACENESRAS ? "Vista General" : "Panel Principal");
	sessionStorage.removeItem("tipoVenta");
	sessionStorage.removeItem("acceso-modulo");
	if (VistaGeneralMenu) {
		sessionStorage.setItem("accionPos", "pedido_mesa");
	}
	if (!ALMACENESRAS) {
		sessionStorage.removeItem("permiso");
		permisoVerificar = null;
		sessionStorage.removeItem("cuentaHotel");
		sessionStorage.removeItem("dataPos");
		sessionStorage.removeItem("tercerosDesayuno");
		sessionStorage.removeItem("regresoMesaDesayuno");
	}

	let cuentaHotel = sessionStorage.getItem("cuentaHotel");
	if (cuentaHotel) {
		cargueHotel = JSON.parse($.Desencriptar(JSON.parse(cuentaHotel)));
		obtenerInformacion(
			cargueHotel,
			"tipoVentaAlmacenHotel",
			"tipoVentaAlmacenH"
		);
	}

	if (
		(accionPos == "general" ||
			accionPos == "basecaja" ||
			accionPos == "recogidas" ||
			accionPos == "gasto-base-ventas" ||
			accionPos == "cuentas_pendientes" ||
			accionPos == "facturas_pendientes_pago" ||
			accionPos == "pedido_mesa") &&
		accionPos != "cuadreCajero"
	) {
		$(".bloqueoDiv").addClass("bloqueoDiv");
	} else {
		$(".bloqueoDiv").removeClass("bloqueoDiv");
		$(".card-almacen").removeAttr("style");
		$(".card-almacen").removeAttr("title");
		$(".card").removeAttr("data-valida");
	}

	$(".card-almacen").click(function () {
		if ($("div:even", this).attr("data-valida") == "true") {
			return;
		}

		idAlmacen = $(this).data("almacen");
		idAlmacen = typeof idAlmacen === "string" ? idAlmacen.trim() : idAlmacen;
		almacenActual = $ALMACENES.find((it) => it.AlmacenId == idAlmacen);
		if ($EVENTO > 0) {
			validarTipoVenta(almacenActual.tiposVenta);
		} else if (accionPos == 'facturas_pendientes_pago') {
			location.href = rutaGeneral + `FacturasPendientes?vendedor=null&almacen=${idAlmacen}`;
		} else if (accionPos == "mesa_edicion") {
			location.href = rutaGeneral + "MesaEdicion?almacen=" + idAlmacen;
		} else if (accionPos == "actualiza_forma_pago") {
			abrirCerrarModal("#modal-numero-factura", "show");
			setTimeout(() => {
				$("#numFac").focus();
			}, 500);
		} else if (accionPos == "reactiva-consumo") {
			abrirCerrarModal("#modalTipoReactivacion", "show");
		} else if (accionPos == "recogidas") {
			if ($USUARIOAUTORIZA > 0) {
				location.href = `${base_url()}Administrativos/Servicios/Recogidas?almacenid=${idAlmacen}&usuario=${$USUARIOAUTORIZA}`;
			} else {
				alertify.warning("No se encontro usuario autorizador");
			}
		} else if (accionPos == "basecaja") {
			location.href = `${base_url()}Administrativos/Servicios/BaseCaja?almacenid=${idAlmacen}`;
		} else if (accionPos == "cuadreCajero") {
			location.href = `${base_url()}Administrativos/Servicios/CuadreCajero?almacenid=${idAlmacen}`;
		} else if (accionPos == "gasto-base-ventas") {
			location.href = `${base_url()}Administrativos/Servicios/GastoBaseVenta?almacenid=${idAlmacen}`;
		} else if (accionPos === "reimprimir") {
			let data = { almacen: idAlmacen, accionPos };
			obtenerInformacion(data, "obtenerVendedores", "datosVendedores");
		} else {
			if ($(this).data("menu") != "") {
				if (!almacenActual.SedeNombre) {
					alertify.warning("El almacen no tiene sede asociada");
					return;
				}
				if (!almacenActual.cantZonas) {
					alertify.warning(
						"El almacen no tiene zonas en la sede " + almacenActual.SedeNombre
					);
					return;
				}
				if (cargueHotel.ReservaId && tipoVentaHotel.codiventid) {
					sessionStorage.removeItem("cuentaHotel");
					tipoVenta(tipoVentaHotel);
				} else {
					validarTipoVenta(almacenActual.tiposVenta);
				}
			} else {
				alertify.warning("El almacen no tiene tipo de menú asignado");
			}
		}
	});

	$("#btnCancelarTipoVenta").click(function () {
		$("#tipoVentaAlmacen").modal("hide");
	});

	$("#formDataAdmin").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			UserAutorizaActual = $("#usuarioid").val();
			let data = {
				clave: $("#superclave").val(),
				usuarioid: UserAutorizaActual,
				actual: "N",
				modulo: accionPos.split("-").join(" ").split("_").join(" "),
			};
			if (permisoVerificar) {
				data["permiso"] = permisoVerificar;
			}
			obtenerInformacion(data, "validarUsuario", "dataUsuario");
		} else {
			alertify.error("Llene los campos del formulario.");
		}
	});

	$("#formNumeroFactura").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			if (
				datosFactura &&
				datosFactura["factura"].split(" ").join("").toUpperCase() ==
					$("#numFac").val().split(" ").join("").toUpperCase()
			) {
				abrirCerrarModal(
					"#modal-numero-factura",
					"hide",
					"#ElegirVendedor",
					"show"
				);
				return;
			}
			let data = {
				numFac: $("#numFac").val(),
				accion: accionPos,
				almacen: idAlmacen,
			};
			if (accionPos == "reactiva-consumo") {
				data["tipoReactivacion"] = tipoReactivacion;
				obtenerInformacion(
					data,
					"validarFactura",
					"dataFacturaRactivarConsumo"
				);
			} else {
				obtenerInformacion(data, "validarFactura", "dataFactura");
			}
		} else {
			alertify.error("Llene los campos del formulario.");
		}
	});

	$("#modal-reimprimir").on("hide.bs.modal", function (event) {
		cancelarUsuario();
	});

	$("#modal-solicitar-usuario").on("hide.bs.modal", function (event) {
		cancelarUsuario();
	});

	$("#btnCancelarUsuario").click(function () {
		cancelarUsuario();
		datosFactura = null;
		$("#numFac").val("");
	});

	$("#btnCancelarVendedor").click(function () {
		$(".card-vendedor").removeClass("card-vendedor-seleccionado");
		abrirCerrarModal(
			"#ElegirVendedor",
			"hide",
			"#modal-solicitar-usuario",
			"hide"
		);
		datosFactura = null;
		$("#numFac").val("");
	});

	$("#btnCancelarNumeroFactura").click(function () {
		$("#numFac").val("");
		datosFactura = null;
		abrirCerrarModal("#modal-numero-factura", "hide");
	});

	if ($ALMACENES.length == 1 && ALMACENESRAS) {
		$(".card-almacen").click();
	}

	$("#ElegirVendedor").on("hide.bs.modal", function (event) {
		buscarVendedor();
	});

	$("#btnCancelarModal").click(function () {
		abrirCerrarModal("#almacenNoFisico", "hide");
	});

	$(".btn-buscar").on("click", function () {
		let valor = $("#buscaracceso").val().toLowerCase();

		$(".alert-buscador").hide();

		$(".tarjeta-busqueda").removeClass("d-none");

		$.each($(".tarjeta-busqueda"), function () {
			let titulo = $(this).find(".card-title").text().toLowerCase();
			let descripcion = $(this).find(".card-text").text().toLowerCase();

			if (!titulo.includes(valor) && !descripcion.includes(valor)) {
				$(this).addClass("d-none");
			}
		});

		if (!$(".tarjeta-busqueda:not(.d-none)").length) {
			$(".alert-buscador").show();
		}
	});

	//Busqueda del panel principal pal darle enter
	$("#buscaracceso").on("keypress", function (e) {
		if (e.which == 13) {
			$(".btn-buscar").click();
		}
	});

	//Buscador de almacenes
	$("#buscarEvento").on("keyup", function () {
		var rex = new RegExp($(this).val(), "i");

		$("#contenedorAlmacen .card-almacen").addClass("d-none");

		$("#contenedorAlmacen .card-almacen")
			.filter(function () {
				return rex.test(
					$(this).find("h5").text() + " " + $(this).find(".text-muted").text()
				);
			})
			.removeClass("d-none");

		if ($("#contenedorAlmacen .card-almacen:not(.d-none)").length <= 0) {
			$("#noDisponible").removeClass("d-none");
		} else {
			$("#noDisponible").addClass("d-none");
		}
	});

	$("#buscarEvento").trigger("focus");
});

$(document).on("click", "#btnBuscarVendedor", function () {
	buscarVendedor($("#buscarVendedor").val());
});

$(document).on("keyup", "#buscarVendedor", function (e) {
	e.stopImmediatePropagation();
	buscarVendedor($(this).val());
});

$("#btnEventos").click(function (e) {
	e.preventDefault();

	$("#ElegirVendedor").modal("show");
});

$(document).on("click", ".cardMesero", function (e) {
	e.preventDefault();
	const MeseroId = $(this).attr("data-vendedor");
	const Pass = $(this).attr("data-pass") == 1;
	let actual = this;

	if (Pass && $MONTAJE.SolicitaClaveVendedor == "S") {
		let mensaje = `
			<h6>${$(this).data("nombre")}</h6>
			<input type="password" class="form-control data-pass p-1 alertify" autocomplete="off" id="dataPass" value="" />
		`;

		alertify
			.confirm()
			.setting({
				message: mensaje,
				onok: function () {
					const pass = $(".ajs-content").find(".data-pass").val();
					if (pass != "") {
						$.ajax({
							url: rutaGeneral + "PanelPrincipal/validarPassVendedor",
							type: "POST",
							dataType: "json",
							data: {
								idVendedor: MeseroId,
								pass,
							},
							success: function (resp) {
								if (resp.success) {
									tblEventos(MeseroId);
								} else {
									setTimeout(() => {
										$(actual).click();
									}, 100);
									alertify.error("Contraseña incorrecta");
								}
							},
						});
					} else {
						setTimeout(() => {
							$(actual).click();
						}, 100);
						alertify.warning("Por favor digite una contraseña");
					}
				},
				title: "Confirmar Contraseña",
			})
			.set({
				onshow: function () {
					$(".data-pass").keyup(function (e) {
						e.preventDefault();
						if (e.keyCode == 13 && $(this).val() != "") $(".ajs-ok").click();
					});
					$(".ajs-content").find(".data-pass").val("");
					setTimeout(function () {
						$(".ajs-content").find(".data-pass").val("").focus().select();
					}, 1000);
				},
				onclose: function () {
					alertify.alert().set({ onshow: null });
				},
			})
			.show();
	} else {
		tblEventos(MeseroId);
	}
});

function tblEventos(MeseroId) {
	const tblData = {
		select: [
			"E.EventoId",
			"E.Evento",
			"E.Nombre",
			"E.FechaInicial",
			"E.FechaFinal",
		],
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
				[
					`(
						Estado = 'CO' AND E.EventoId IN (SELECT
						EM.EventoId
						FROM EventoMesero EM
						WHERE EM.EventoId = E.EventoId
						AND EM.MeseroId = '${MeseroId}')
					)
						OR E.Estado IN ('AC', 'FA')
					`,
				],
			],
		],
		column_order: [
			"EventoId",
			"Evento",
			"Nombre",
			"FechaInicial",
			"FechaFinal",
		],
		orden: { EventoId: "ASC" },
		column_search: ["Evento", "Nombre"],
		columnas: ["EventoId", "Evento", "Nombre", "FechaInicial", "FechaFinal"],
	};

	dtAlertify({
		titulo: "Eventos",
		campos: ["Id", "Evento", "Nombre", "Inicio", "Fin"],
		dtConfig: {
			data: tblData,
			orderable: true,
			scrollX: true,
			columns: [
				{ data: 0, visible: false },
				{ data: 1 },
				{ data: 2 },
				{
					data: 3,
					render: function (Inicio) {
						return moment(Inicio, "YYYY-MM-DD HH:mm:ss").format(
							"YYYY-MM-DD hh:mm:ss A"
						);
					},
				},
				{
					data: 4,
					render: function (Fin) {
						return moment(Fin, "YYYY-MM-DD HH:mm:ss").format(
							"YYYY-MM-DD hh:mm:ss A"
						);
					},
				},
			],
		},
	}).then((res) => {
		$("#ElegirVendedor").modal("hide");
		location.href = `${base_url()}Administrativos/Servicios/Eventos/Complementos/${
			res[0]
		}/${MeseroId}`;
	});
}

function buscarVendedorP(buscar = "", keyup = true) {
	var cont = 0;
	if (!keyup) {
		$("#buscarVendedorP").val(buscar);
	}
	$("#listaVendedoresPendiente").children("div").removeClass("d-none");
	$("#listaVendedoresPendienteEmpty").hide();
	if (buscar == "") return;
	total = 0;
	$("#listaVendedoresPendiente")
		.children("div")
		.filter(function (index, item) {
			total++;
			if ($(item).find("p").text().toLowerCase().includes(buscar.toLowerCase()))
				return true;
			$(item).addClass("d-none");
			cont++;
			return false;
		});
	if (cont == total) {
		$("#listaVendedoresPendienteEmpty").show();
	}
}

$(document).on("click", "#btnBuscarVendedorP", function () {
	buscarVendedorP($("#buscarVendedorP").val());
});

$(document).on("keyup", "#buscarVendedorP", function (e) {
	e.stopImmediatePropagation();
	buscarVendedorP($(this).val(), false);
});
