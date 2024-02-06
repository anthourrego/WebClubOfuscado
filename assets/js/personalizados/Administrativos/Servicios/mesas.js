let rutaGeneral = base_url() + "Administrativos/Servicios/VistaGeneral/";
var contexto = this;
let contador = 0;
let usuarioIdA;
let selectMesasMultiple = [""];
let productoActual = {};
let editarProductoPedidoNuevo = -1;
let zonaMesaActual = {};
let imprimirDevolucionConsumo = false;
let itemsDisponibleProducto = [];
let itemsObservaciones = [];
let itemsNoDisponiblesProducto = [];
let prodsAgregarNew = [];
let rastreoAbreCenta = true;
let accionPos = "general";
let promocionActual = {};
let tercerosDesayuno = [];
let tercerosDesayunoOriginal = [];
let darBajaVenta = false;
let btnCargarCuentaClick = true;
let cargarCuentaPendiente = false;
let cargarCuentaEvento = false;
let numeroPersonasPedido = 1;
let tercerosAccion = [];
let dataAnteriorProducto = {};
let frmtFech = "YYYY-MM-DD HH:mm:ss";
let cambiarSocioCuenta = false;
let cambiarMesas;
let unificarMesas;
let mesaUno;
let mesaDos;
let ReservaAplicaDesayuno = null;
let TieneDesayunoPendiente = null;
let HeadReservaIdHotel = null;
let EventoId = null;
let btnTerceroPendiente = false;
let factElectronicaDirecta = false;
let cantidadNuevaPedido = null;
let formValidateDataUser;
let tipoDevolucionSeleccionada;
let permisoAccionActual = 0;
let consultadonAccion = false;
let valorBuscarProducto = "";
let propinaPedido = "0";
let tabReserva = "proximas";
let textCambioTercero = "Tercero";
let mesasPlano = [];
let unificarMesasTercero = false;
let coloresMesa = {
	Blanco: { color: "#ffffff", titulo: "Libre" },
	Rojo: { color: "#dc3545", titulo: "Producto retrasado" },
	Amarillo: {
		color: "#ffc107",
		titulo: "Proximo a cumplir tiempo del producto",
	},
	Verde: { color: "#198754", titulo: "Ocupada" },
	Azul: { color: "#4680ff", titulo: "Reserva" },
	AzulSinConsumo: {
		color: "#00bcd4",
		titulo: "Reserva en la mesa sin consumo",
	},
	ProdsPendientes: { color: "#ffa0a0", titulo: "Productos Pendientes" },
	mesaModificada: { color: "#2ce0d8", titulo: "Nuevo Pedido" },
};
let btnAgregarCuentaTercero = false;
let botonCambiarCuenta = 0;
let dataMostrarTercero = [
	{
		propiedad: "TerceroID",
		titulo: "Documento",
	},
	{
		propiedad: "barra",
		titulo: "Código de Barra",
	},
	{
		propiedad: "EdadT",
		titulo: "Edad",
	},
];

if ($TIPOCOMERC == "CLUB") {
	dataMostrarTercero = dataMostrarTercero.concat([
		{
			propiedad: "AccionId",
			titulo: "Acción",
		},
		{
			propiedad: "Tipo",
			titulo: "Tipo",
		} /* {
			propiedad: 'TarjetaSocioId', titulo: 'Tarjeta Socio'
		} */,
	]);
}
let reservaActual = {};
let cuentaTerceroConsumo = {};
let columnaBusquedaTercero = "TerceroID";
let reservasActuales = [];
let lineaTiempoSubGrupos = [];
let dataOriginal = {
	almacen: { ...$INFOALMACEN },
};
let prodsSelectFamilia = {};
let dataFechasHotel = {
	EntradaReservaHotel: null,
	SalidaReservaHotel: null,
};
let posPlatoActualFami = -1;
let btnCarrito = [
	"#btnBorrarPedido",
	"#btnDarDeBajaCuenta",
	"#btnCambiarSocio",
	"#btnCargarACuenta",
];
let mesasDesc = null;
let promocionesProd;
let valor = null;
let validaPendientes = false;

// 11/02/2022 JCSM - Constante para definir que el IVA del 8% representa el Impuesto al Consumo en caso de que cambie en un futuro
const $impoConsumo = 8;

$(function () {
	RastreoIngresoModulo(
		accionPos == "general" ? "Ventas Generales" : "Pedido Mesa"
	);

	$(".carrito").html($("#content-carrito").html());
	$("#content-carrito").remove();

	//Seteamos los datos para el menú
	if (
		localStorage.getItem("fontProds") != null &&
		localStorage.getItem("fontProds") != 12
	) {
		$("#tamLetraProductos").val(localStorage.getItem("fontProds"));
	}

	if (
		localStorage.getItem("fontPrecioProds") != null &&
		localStorage.getItem("fontPrecioProds") != 14
	) {
		$("#tamLetraPrecio").val(localStorage.getItem("fontPrecioProds"));
	}

	if (
		localStorage.getItem("fontPrecioProds") != null &&
		localStorage.getItem("fontPrecioProds") != 14
	) {
		$("#tamLetraPrecio").val(localStorage.getItem("fontPrecioProds"));
	}

	if (
		localStorage.getItem("boldLetraProds") != null &&
		localStorage.getItem("boldLetraProds") != "N"
	) {
		$("#negrillaLetraProductos").val(localStorage.getItem("boldLetraProds"));
	}

	if (
		localStorage.getItem("boldPrecioProds") != null &&
		localStorage.getItem("boldPrecioProds") != "S"
	) {
		$("#negrillaLetraPrecio").val(localStorage.getItem("boldPrecioProds"));
	}

	if (
		localStorage.getItem("disenoProds") != null &&
		localStorage.getItem("disenoProds") != 1
	) {
		$("#disenoProds").val(localStorage.getItem("disenoProds"));
	}

	$(".boldsProds").change(function () {
		dataStorage = $(this).data("storage");
		dataClass = $(this).data("class");
		localStorage.setItem(dataStorage, $(this).val());

		if (dataStorage == "disenoProds") {
			$(".tipo-comida-seleccionado").click();
		} else {
			if ($(this).val() == "S") {
				$(document).find(`.${dataClass}`).css({ "font-weight": "bold" });
			} else {
				$(document).find(`.${dataClass}`).css({ "font-weight": "unset" });
			}
		}
	});

	let dataPos = sessionStorage.getItem("dataPos");
	if (dataPos) {
		validaPendientes = true;
		dataPos = JSON.parse($.Desencriptar(JSON.parse(dataPos)));
		terceroIdPedido = dataPos.TerceroId ? dataPos.TerceroId : null;
		codBarraTercero =
			!dataPos.codBarraTercero || dataPos.codBarraTercero == ""
				? null
				: dataPos.codBarraTercero;
		vendedorElegido = dataPos.VendedorId;
		accionPos = dataPos.accionPos;
		idMesaActual = dataPos.MesaId == "" ? null : dataPos.MesaId;
		mesasDesc = dataPos.MesasDesc;
		terceroPedidoEmpresa = dataPos.terceroPedidoEmpresa
			? JSON.parse(dataPos.terceroPedidoEmpresa)
			: {};

		if (dataPos.reactivarConsumo && dataPos.reactivarConsumo != "false") {
			reactivarConsumo = dataPos.reactivarConsumo;
			datosTerceroReactivar = dataPos.terceroDatos
				? dataPos.terceroDatos
				: null;
			numeroPersonasReactivar = dataPos.numPersonas ? dataPos.numPersonas : 0;
		} else {
			$POST = true;
			desdeFactura = true;
			$AlmacenId = dataPos.AlmacenId;
			tipoVentaSeleccionado = JSON.parse(dataPos.tipoVentaSeleccionado);

			//Valimos que si no maneja cliente cambie el nombre del botón cambio tercero
			if (tipoVentaSeleccionado.manejclien == "S" && $TIPOCOMERC == "CLUB")
				textCambioTercero = "Socio";
			$("#btnCambiarSocio").attr("title", "Cambiar " + textCambioTercero);
			$("#btnCambiarSocio span").text("Cambiar " + textCambioTercero);

			arrayProductosPedido = JSON.parse(dataPos.arrayProductosPedido);
			ConAccion = dataPos.ConAccion == "" ? null : dataPos.ConAccion;
			reservaHotel =
				dataPos.reservaHotel && dataPos.reservaHotel != "null"
					? dataPos.reservaHotel
					: null;
			accionTercero = dataPos.AccionPedido ? dataPos.AccionPedido : null;
			habitacionHotel = dataPos.habitacionHotel
				? dataPos.habitacionHotel
				: null;
			dataTerceroPendiente = dataPos.dataTerceroPendiente
				? JSON.parse(dataPos.dataTerceroPendiente)
				: {};
			ventanaCambioPedido =
				dataPos.facturaPuntoNoFisico && dataPos.facturaPuntoNoFisico == "S"
					? true
					: false;
			if (dataPos.dataFechasHotel) {
				dataFechasHotel = dataPos.dataFechasHotel;
			}
			HeadReservaIdHotel = dataPos.HeadReservaIdHotel;
			if (dataPos.TerceroIdConsumo && dataPos.TerceroIdConsumo != "") {
				terceroIdPedido = dataPos.TerceroIdConsumo;
			}
			validarVendedor(false, dataPos.VendedorId);

			if (dataPos.consumosOcultos) {
				$(".btnOcultarConsumos")
					.find("i")
					.removeClass("fa-eye")
					.addClass("fa-eye-slash");
				$(".btnOcultarConsumos").addClass("ocultarConsumos");
			}
		}
	} else {
		if (accesoCargarCuentaHotel) {
			let tercDesayun = sessionStorage.getItem("tercerosDesayuno");
			if (tercDesayun) {
				tercerosDesayunoOriginal = JSON.parse(
					$.Desencriptar(JSON.parse(tercDesayun))
				);
				tercerosDesayuno = [...tercerosDesayunoOriginal].map(
					(x) => x.terceroid
				);
			}
		}
	}

	RastreoIngresoModulo(
		accionPos == "general" ? "Ventas Generales" : "Pedido Mesa"
	);

	$("#AplicoDesayuno").hide();
	if ($POST && reservaHotel && reservaHotel != -1) {
		$("#btnCuentaHotel").show();
	}

	tipoVentaSeleccionado = JSON.parse(sessionStorage.getItem("tipoVenta"));
	//Valimos que si no maneja cliente cambie el nombre del botón cambio tercero
	if (tipoVentaSeleccionado.manejclien == "S" && $TIPOCOMERC == "CLUB")
		textCambioTercero = "Socio";
	$("#btnCambiarSocio").attr("title", "Cambiar " + textCambioTercero);
	$("#btnCambiarSocio span").text("Cambiar " + textCambioTercero);

	dataOriginal["tipoVenta"] = { ...tipoVentaSeleccionado };
	accionPos = sessionStorage.getItem("accionPos");
	if (!(dataTerceroPendiente && dataTerceroPendiente.TerceroID)) {
		let data = {
			accion: $("#numeroAccion").val(),
			ingreso: $INFOALMACEN["VerificarIngreso"],
			fecha: moment().format(frmtFech),
			zona: zonaMesaActual["ZonaId"] || "",
			almacen: $INFOALMACEN["almacenid"],
			fechaActual: moment().toDate(),
			sede: $INFOALMACEN["SedeId"],
		};
		if (!tipoVentaSeleccionado) {
			if ($INFOALMACEN["CodiVent"] && $INFOALMACEN["CodiVent"].codiventid) {
				data["codivent"] = $INFOALMACEN["CodiVent"].codiventid;
				obtenerInformacion(data, "obtenerTipoVenta", "dataTipoVenta");
			} else {
				alertify.warning("No ha seleccionado el tipo de venta");
			}
		} else {
			data["codivent"] = tipoVentaSeleccionado.codiventid;
			obtenerInformacion(data, "obtenerTipoVenta", "dataTipoVenta");
		}
	}

	if (
		datosTerceroReactivar &&
		datosTerceroReactivar != "" &&
		typeof datosTerceroReactivar == "string"
	) {
		try {
			datosTerceroReactivar = JSON.parse(datosTerceroReactivar);
		} catch (err) {
			console.log(err);
		}
	}

	$(".chosen-select").chosen({ width: "100%" });

	$(window).on("unload", function () {
		return "cerrar ventana?";
	});

	$("#observa-factura-borrar").on("shown.bs.modal", function (event) {
		$("#ObservacioBorrar").val("");
	});

	$(".modal-promociones").on("shown.bs.modal", function (event) {
		$("#general-tab").removeClass("active");
		$("#producto-tab").addClass("active");
		$("#general").removeClass("active show");
		$("#producto").addClass("active show");
	});

	$("#valProducto").change(
		delay(function () {
			if (
				terceroIdPedido &&
				valorBuscarProducto != $("#valProducto").val().toLowerCase()
			) {
				valorBuscarProducto = $("#valProducto").val().toLowerCase();
				if (valorBuscarProducto == "") {
					$("#btnLimpiarBuscadorProducto").hide();
				} else {
					$("#btnLimpiarBuscadorProducto").show();
					let grupo = $(".card-tipo-comida.tipo-comida-seleccionado").data(
						"grupo"
					);
					let data = {
						grupoId: grupo,
						buscar: valorBuscarProducto.trimEnd(),
					};

					if (tecladoVirtual) {
						$(".keyboardContainer").fadeOut();
					}

					obtenerProducsdDelMenu("clickTipoMenu", data);
				}
			} else {
				if (!terceroIdPedido) {
					abrirCerrarModal(".bd-accion-modal-sm", "show");
					return alertify.warning("No hay persona identificada para el pedido");
				}
			}
		})
	);

	$("#btnUnificarMesasTercero").click(function () {
		unificarMesasTercero = !unificarMesasTercero;
		$(this).css("border", unificarMesasTercero ? "solid 2px #9ccc65" : "none");
		if (!unificarMesasTercero) {
			$(".link-mesas").removeClass("mesa-unificar");
			$("#mesasUnificar").val("").change();
			$("#btnOtrasCuentasTerceroAceptar").hide();
		} else {
			$("#mesasUnificar").change();
			$("#btnOtrasCuentasTerceroAceptar").show();
		}
	});

	$("#valReserva").keyup(function () {
		let valor = $(this).val().toLowerCase();
		if (valor == "") {
			datosReservas(reservasActuales);
			return;
		}
		let array = reservasActuales.filter((op, pos) => {
			let enc = op.nombre.toLowerCase().indexOf(valor);
			let enc1 = op.TerceroID.toLowerCase().indexOf(valor);
			let enc2 = -1;
			if (op.Accionid) {
				enc2 = op.Accionid.toLowerCase().indexOf(valor);
			}
			if (enc != -1 || enc1 != -1 || enc2 != -1) {
				return op;
			}
		});
		datosReservas(array);
	});

	$("#btnLimpiarBuscadorProducto").click(function () {
		$("#btnLimpiarBuscadorProducto").hide();
		$("#valProducto").val("").focus();
	});

	if (accionPos == "pedido_mesa") {
		$("#btnCambiarZona").html(
			'<i class="fas fa-redo-alt"></i> Cambiar De Mesa'
		);
	}

	$(
		"#btnCambiarZona, #tercerosAccion, #btnElegirVendedor, #tituloCentasPendiente, .formBuscarProductos"
	).hide();

	$("#Observacio, #ObservacioBorrar").on("change", function () {
		$(this).css("height", "auto");
		$(this).css("height", $(this)[0].scrollHeight + 3 + "px");
	});

	$(document).on("change", "#zonaMesa", function () {
		if ($(this).val() && $(this).val() != "") {
			if ($INFOALMACEN["ManejaMesas"] != "S") {
				if (terceroIdPedido === undefined) {
					abrirCerrarModal(".bd-accion-modal-sm", "show");
				} else {
					informacionMesa();
				}
				return;
			}
			let data = {
				zona: $(this).val(),
				fechaInicio: moment().startOf("day").format("DD-MM-YYYY HH:mm:ss"),
				fechaFin: moment()
					.add(1, "days")
					.startOf("day")
					.format("DD-MM-YYYY HH:mm:ss"),
				fechaActual: moment().format("YYYY-MM-DD HH:mm:ss"),
			};
			zonaMesaActual = $ZONAS.find((it) => it["ZonaId"] == data.zona);
			$("#NumeroPersonas").val("");
			obtenerInformacion(data, "obtenerMesas", "agregarMesas");
			$(
				"#btnUnificarMesas, #btnCambioMesas, #btnMesasTemporales, #btnEstadoColores"
			).show();
			configColoresMesa();
			$("#btnEstadoColores").click(function () {
				Object.keys(coloresMesa).forEach((it) => {
					$("." + it).css("background", coloresMesa[it].color);
				});
			});
		} else {
			$(".divMesa").empty();
			$(".contenedor-imagen-mesas").css("background-image", "unset");
			if (accionPos != "general") {
				if ($(this).val() == null) {
					alertify.warning(
						"La zona predeterminada del almacen es de una sede diferente."
					);
				} else if ($ZONAS.length) {
					alertify.warning("Seleccione una zona valida.");
				}
			}
		}
	});

	accionBotonesMesa();
	if ($INFOALMACEN["ZonaMesaId"]) {
		$("#zonaMesa").val($INFOALMACEN["ZonaMesaId"]).change();
		if (accionPos == "pedido_mesa" && reactivarConsumo) {
			consumoReactivar();
		}
	} else {
		alertify.warning("El almacen no posee zona predeterminada.");
	}
	if (
		($INFOALMACEN["ManejaMesas"] != "S" && $ZONAS.length) ||
		accionPos == "general"
	) {
		if (accionPos == "general") {
			if ($POST) {
				informacionMesa(accionPos != "general" ? idMesaActual : false);
				organizarAcumulado();
				let ven = $VENDEDORES.find((x) => x.vendedorid == vendedorElegido);
				if (ven) {
					$(".vendedorPedido").html(ven.nombre);
					$("#btnFacturarPedido").prop("disabled", false);
					if (ven.PuedeFacturarEnPOS != "S") {
						$("#btnFacturarPedido").prop("disabled", true);
					}
				}
				if (
					arrayProductosPedido &&
					arrayProductosPedido[0] &&
					arrayProductosPedido[0]["NombreTercero"]
				) {
					$(".clientePedido").html(arrayProductosPedido[0]["NombreTercero"]);
					$(".accionIdPedido").html(accionTercero || "");
					$(".documentoPedido").html(terceroIdPedido || "");
				}
				if (dataTerceroPendiente && dataTerceroPendiente.TerceroID) {
					validarBtnHotelCuentaPendiente();
				}
			}
			cambiarTab("#tabCategorias");
			if (!$ZONAS.length) {
				$("#zonaMesa").parent().removeClass("d-flex");
			}
			$("#zonaMesa").parent().hide();
			$("#btnCambiarZona").show();
			if (accesoCargarCuentaHotel && accionPos == "general") {
				let temp = terceroIdPedido;
				setTimeout(() => {
					terceroIdPedido = temp;
					$("#numeroAccion").val(terceroIdPedido);
					$("#btnBuscarTercero").click();
					$("#NumeroPersonas").val("1");
				}, 200);
			}
		} else {
			if (!$POST) {
				abrirCerrarModal(".bd-accion-modal-sm", "show");
			} else {
				informacionMesa(accionPos != "general" ? idMesaActual : false);
				organizarAcumulado();
				if (dataTerceroPendiente && dataTerceroPendiente.TerceroID) {
					validarBtnHotelCuentaPendiente();
				}
			}
		}
	} else {
		if (validaPendientes) {
			if (dataTerceroPendiente) {
				$(".clientePedido").html(
					dataTerceroPendiente.Nombre != null ? dataTerceroPendiente.Nombre : ""
				);
				$(".accionIdPedido").html(
					dataTerceroPendiente.AccionId != null
						? dataTerceroPendiente.AccionId
						: ""
				);
				$(".habitacionPedido").html(
					dataTerceroPendiente.HabitacionId != null
						? dataTerceroPendiente.HabitacionId
						: ""
				);
				$(".barraPedido").html(
					dataTerceroPendiente.barra != null ? dataTerceroPendiente.barra : ""
				);
				$(".documentoPedido").html(
					dataTerceroPendiente.TerceroId != null
						? dataTerceroPendiente.TerceroId
						: ""
				);
			}
		}
		if ($POST) {
			if (!ventanaCambioPedido) {
				informacionMesa(idMesaActual);
			}
			organizarAcumulado();
			let ven = $VENDEDORES.find((x) => x.vendedorid == vendedorElegido);
			if (ven) {
				$(".vendedorPedido").html(ven.nombre);
				$("#btnFacturarPedido").prop("disabled", false);
				if (ven.PuedeFacturarEnPOS != "S") {
					$("#btnFacturarPedido").prop("disabled", true);
				}
			}
			if (
				arrayProductosPedido &&
				arrayProductosPedido[0] &&
				arrayProductosPedido[0]["NombreTercero"]
			) {
				$(".clientePedido").html(arrayProductosPedido[0]["NombreTercero"]);
				$(".documentoPedido").html(arrayProductosPedido[0]["TerceroId"]);
				$(".accionIdPedido").html(accionTercero || "");
			}
			if (dataTerceroPendiente && dataTerceroPendiente.TerceroID) {
				validarBtnHotelCuentaPendiente();
			}
		}
	}

	if (accionPos == "general") {
		$("#btnMesasTercero").hide();
	}

	$("#btnCancelarVendedor").click(function () {
		if (accionPos == "general") {
			if (!$VENDEDORES.length) {
				alertify.warning("El almacen debe tener al menos un vendedor.");
			}
			if (!terceroIdPedido) {
				abrirCerrarModal(
					"#ElegirVendedor",
					"hide",
					".bd-accion-modal-sm",
					"show"
				);
			} else {
				abrirCerrarModal("#ElegirVendedor", "hide");
			}
		} else {
			abrirCerrarModal("#ElegirVendedor", "hide");
			$("#zonaMesa").change();
		}
	});

	$("#formCargarAccion").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			if (cambiarSocioCuenta) {
				let enc = tercerosAccion.find(
					(it) => it.TerceroID == $("#UserPedido").val()
				);

				if (!validarIngresoTercero(enc)) return false;

				let datos = {
					mesa: idMesaActual,
					terceroNuevo: $("#UserPedido").val().trim(),
					terceroActual: terceroIdPedido,
					accion: enc ? enc.AccionId : null,
					personas:
						$("#NumeroPersonas").val() == "" ? 1 : $("#NumeroPersonas").val(),
					terceroEmpresa: terceroPedidoEmpresa.TerceroID
						? ("" + terceroPedidoEmpresa.TerceroID).trim()
						: null,
				};
				if (
					enc.TipoDocumento != "31" ||
					tipoVentaSeleccionado.manejclien == "N"
				) {
					datos.terceroEmpresa = null;
				}
				if ($TIPOCOMERC == "CLUB" && enc.firma != "S") {
					alertify.confirm(
						"Alerta",
						"El socio no está autorizado para firmar, solo puede facturar de contado",
						function (evt, value) {},
						function () {}
					);
				}
				let buscar = $(".btnFiltroeBuscar.show").data("botonsearch");
				if (buscar == "habitacion") {
					datos["habitacion"] = enc.HabitacionId || null;
					datos["headreserva"] = enc.HeadReservaHotel || null;
				}
				let encriptado = $.Encriptar(datos);
				$.ajax({
					url: rutaGeneral + "cambiarSocio",
					type: "POST",
					dataType: "json",
					data: { encriptado },
					success: (resp) => {
						resp = JSON.parse($.Desencriptar(resp));
						if (resp.valido) {
							alertify.success(resp.mensaje);
							terceroIdPedido = resp.tercero;
							cambiarSocioCuenta = false;
							abrirCerrarModal(".bd-accion-modal-sm", "hide");
							numeroPersonasPedido = datos.personas;
							if (!datos.terceroEmpresa) {
								$(".clientePedido").html(enc.Nombre);
								$(".accionIdPedido").html(accionTercero || "");
							}
							let maxPer = $(".mesaId.mesa-seleccionada").data("personas")
								? $(".mesaId.mesa-seleccionada").data("personas")
								: null;
							$("#cantPersonas")
								.html(`<input type="number" name="NumPerEditar" style="color: #ffffff;" class="form-control form-control-floating" placeholder="Número de personas" id="NumPerEditar" data-campodb="Personas" value="${numeroPersonasPedido}" max="${maxPer}" min="1" required>
							`);

							$(".habitacionPedido").html("");
							if (enc.NombreHabitacion && enc.NombreHabitacion != "") {
								$(".habitacionPedido").html(enc.NombreHabitacion);
							}

							$("#btnCuentaEvento").hide();
							$(".eventoPedido").html("");
							EventoId = null;
							if (enc.EventoId && enc.EventoId != -1) {
								$("#btnCuentaEvento").show();
								$(".eventoPedido").html(
									enc.NroEvento + " - " + enc.NombreEvento
								);
								EventoId = enc.EventoId;
							}

							accionTercero = enc.AccionId || null;

							$("#btnCuentaHotel").hide();
							reservaHotel = null;
							if (
								cargarCuentaHotelPermiso &&
								enc.ReservaHotel &&
								enc.ReservaHotel != -1
							) {
								if (enc.reservaVigente) {
									reservaHotel = enc.ReservaHotel;
									$("#btnCuentaHotel").show();
								}
							}
							HeadReservaIdHotel = enc.HeadReservaHotel;
							sincronizarConsumo();
							accionCamposPedido();
							validarBtnFacturaElectronica();
						} else {
							alertify.error(resp.mensaje);
						}
					},
				});
			} else {
				if (
					tipoVentaSeleccionado.PagoPendiente == "S" &&
					tipoVentaSeleccionado.vendedor != "S"
				) {
					alertify.alert(
						"¡Alerta!",
						'<h3 class="mensaje-alerta">No es posible continuar, el tipo de venta tiene pago pendiente y no solicita vendedor.</h3>'
					);
					return;
				}

				let enc = tercerosAccion.find(
					(op) => op.TerceroID == $("#UserPedido").val()
				);

				if (enc) {
					if ($DATOSMONTAJE.FactConAbier == "S" && enc.TotalEdicion > 0) {
						alertify.error(
							`${enc.NombreTercero} se encuentra con un pedido en edición por el usuario ${enc.NombreUsuarioEdicion}`
						);
						return;
					}

					/* Se valida la accion que se trae del modulo cargue cuenta hotel */
					let datosCuentaHotel = sessionStorage.getItem("datosCuentaHotel");
					if (datosCuentaHotel) {
						datosCuentaHotel = JSON.parse(
							$.Desencriptar(JSON.parse(datosCuentaHotel))
						);
						enc.AccionId = datosCuentaHotel.AccionId
							? datosCuentaHotel.AccionId
							: null;
						enc.HeadReservaHotel = datosCuentaHotel.HeadReservaId;
						enc.HabitacionId = datosCuentaHotel.HabitacionId;
						enc.ReservaHotel = datosCuentaHotel.ReservaId;
					}

					if (btnAgregarCuentaTercero && terceroIdPedido) {
						obtenerInformacion(
							{ mesaId: idMesaActual, tercero: terceroIdPedido },
							"EdicionMesa"
						);
					}

					if (reservaActual["Id"]) {
						accionTercero = reservaActual["AccionId"];
					} else {
						accionTercero = enc.AccionId;
					}
					codBarraTercero = enc.barra || "";
					$(".barraPedido").html(codBarraTercero);

					if (!validarIngresoTercero(enc)) return false;

					$("#btnCuentaHotel").hide();
					if (
						cargarCuentaHotelPermiso &&
						enc.ReservaHotel &&
						enc.ReservaHotel != -1
					) {
						if (enc.reservaVigente) {
							reservaHotel = enc.ReservaHotel;
							$("#btnCuentaHotel").show();
						} else {
							reservaHotel = null;
						}
					} else {
						reservaHotel = null;
					}

					$("#btnCuentaEvento").hide();
					EventoId = null;
					if (enc.EventoId && enc.EventoId != -1) {
						$("#btnCuentaEvento").show();
						EventoId = enc.EventoId;
					}

					if ($TIPOCOMERC == "CLUB" && !enc.AccionId) {
						alertify.error("El tercero no tiene acción");
					}
					ReservaAplicaDesayuno = enc.AplicaDesayuno;
					TieneDesayunoPendiente = enc.DesayunoPendiente;
					$("#AplicoDesayuno").hide();
					if (
						reservaHotel > 0 &&
						ReservaAplicaDesayuno == "S" &&
						TieneDesayunoPendiente == "N"
					) {
						$("#AplicoDesayuno").show();
					}
					HeadReservaIdHotel = enc.HeadReservaHotel;
					if (
						accesoCargarCuentaHotel &&
						terceroIdPedido != enc.TerceroID.trim()
					) {
						alertify.warning(
							"El tercero elegido es diferente al de la reserva hotel."
						);
						return;
					}
					if ($TIPOCOMERC == "CLUB" && enc.firma != "S") {
						alertify.confirm(
							"Alerta",
							"El socio no está autorizado para firmar, solo puede facturar de contado",
							function (evt, value) {
								setTimeout(() => {
									cargarAccionTerc(enc);
								}, 200);
							},
							function () {}
						);
					} else {
						cargarAccionTerc(enc);
					}
				}
			}
		} else {
			alertify.error("Validar la información de los campos");
		}
	});

	$("#modal-solicitar-usuario").on("hide.bs.modal", function (event) {
		$("#formDataAdmin")[0].reset();
		$("#formDataAdmin :input").removeClass("is-invalid");
		$("#formDataAdmin").validate().resetForm();
	});

	ocultarInforFlotante();

	$("#formIngredientes").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			if (+$("input[name=Cantidad]").val() <= 0) {
				return alertify.warning(
					"No es posible agregar productos con cantidad 0."
				);
			}

			let $fills = $("#formIngredientes input, #formIngredientes textarea");
			let data = { inventario: Array.from(itemsDisponibleProducto) };

			prodsAgregarNew = [];

			$.each($fills, (pos, input) => {
				let value = $(input).val();
				const name = $(input).attr("name");
				if (name == "Termino" || name == "allevar") {
					if ($(input).prop("checked")) {
						data[name] = name == "Termino" ? $(input).data("valor") : true;
					} else {
						if (name == "allevar") {
							data[name] = false;
						}
					}
				} else {
					if ($(input).attr("type") == "checkbox") {
						let pos = data.inventario.findIndex((op) => op.productoid == name);
						if (pos != -1) {
							delete data.inventario[pos]["elegido"];
							if ($(input).is(":checked")) {
								data.inventario[pos]["elegido"] = true;
								data.inventario[pos]["checked"] = true;
							} else {
								delete data.inventario[pos]["checked"];
								data.inventario[pos]["elegido"] = false;
							}
						}
					} else {
						if (name == "Valor") {
							if (productoActual.PrecioAbierto == "S") data[name] = value;
						} else {
							value = name == "Cantidad" ? +value : value;
							data[name] = value;
						}
					}
				}
			});

			let observsValidas =
				productoActual.inventames != "S" &&
				productoActual.estructura == "S" &&
				itemsObservaciones.length > 0;

			/* Se valida para cuando un prod de familia maneja terminos */
			if (
				productoActual.AplicaFamilia == "S" &&
				productoActual.TotalFamilias > 0 &&
				!productoActual.SeleccionoFamilia
			) {
				productoActual.valorTermino = data.Termino;
			}

			if (
				productoActual.AplicaFamilia == "S" &&
				productoActual.TotalFamilias > 0 &&
				!productoActual.SeleccionoFamilia &&
				!observsValidas
			) {
				let dataFami = {
					producto: productoActual.headprodid,
				};
				obtenerInformacion(
					dataFami,
					"obtenerFamiliasProd",
					"informacionFamiliaProducto"
				);
			} else {
				let valorProd = +productoActual["Valor"];
				if (productoActual.PrecioAbierto == "S") {
					valorProd = +data["Valor"];
				}
				if (
					valorProd <= 0 &&
					$DATOSMONTAJE["ventaceros"] != "S" &&
					tipoVentaSeleccionado.PreciAbier == "S"
				) {
					alertify.error(
						"No se especificó el valor unitario del producto o no es valido"
					);
					return;
				}

				if (promocionActual["Tipo"] == "RANC") {
					if (!validarPromociones(promocionActual, promocionActual)) {
						alertify.warning(
							"La cantidad ingresada no aplica para la promoción de rango."
						);
					}
				}

				if (itemsNoDisponiblesProducto.length) {
					let datos = [];
					itemsNoDisponiblesProducto.forEach((op) => {
						let enc = data.inventario.find(
							(it) => op.productoid == it.productoid
						);
						if (!enc) {
							datos.push(enc);
						}
					});
					data.inventario = data.inventario.concat(datos);
				}

				let info = {
					Personas: numeroPersonasPedido,
					...productoActual,
					...data,
					nuevo: true,
					AccionId: accionTercero,
					barra: $(".barraPedido:first").text(),
					VendedorId: vendedorElegido,
					terceroEmpresa: terceroPedidoEmpresa["TerceroID"]
						? terceroPedidoEmpresa["TerceroID"]
						: terceroIdPedido,
					HeadReservaIdHotel: HeadReservaIdHotel || null,
				};

				info["Desayuno"] = null;

				let totalFami = Object.keys(prodsSelectFamilia).length;
				if (
					productoActual.EsDesayuno == "S" &&
					ReservaAplicaDesayuno == "S" &&
					TieneDesayunoPendiente == "S"
				) {
					if (info.Cantidad > 1) {
						return alertify.warning(
							`El tercero tiene solo un desayuno pendiente`
						);
					}
				}
				if (editarProductoPedidoNuevo > -1) {
					if (
						!(
							productoActual.AplicaFamilia == "S" &&
							productoActual.TotalFamilias > 0 &&
							totalFami > 0
						)
					) {
						prodsAgregarNew.push(info);
					}
				} else {
					let name = false;
					if (tercerosAccion && tercerosAccion.length) {
						let value = tercerosAccion.find(
							(op) => op.TerceroID == terceroIdPedido
						);
						if (value) {
							info["NombreTercero"] = value.Nombre;
							info["ReservaHotel"] = value.ReservaHotel;
							info["AccionId"] = value.AccionId;
							info["barra"] = value.barra;
							info["NombreHabitacion"] = value.NombreHabitacion;
							info["HabitacionId"] = value.HabitacionId;
							info["EventoId"] = value.EventoId;
							name = true;
						}
					}

					if (!name && arrayProductosPedido[0]) {
						info["NombreTercero"] = arrayProductosPedido[0]["NombreTercero"];
						info["ReservaHotel"] = arrayProductosPedido[0]["ReservaHotel"];
						info["AccionId"] = arrayProductosPedido[0]["AccionId"];
						info["barra"] = arrayProductosPedido[0]["barra"];
						info["NombreHabitacion"] =
							arrayProductosPedido[0]["NombreHabitacion"];
						info["HabitacionId"] = arrayProductosPedido[0]["HabitacionId"];
						info["EventoId"] = arrayProductosPedido[0]["EventoId"];
					}
					if (
						!(
							productoActual.AplicaFamilia == "S" &&
							productoActual.TotalFamilias > 0 &&
							totalFami > 0
						)
					) {
						prodsAgregarNew.push(info);
					}
				}
				if (
					productoActual.PromoDatosProdObsequio &&
					productoActual.PromoDatosProdObsequio["headprodid"]
				) {
					let tempProdAg = productoActual.PromoDatosProdObsequio;
					let validAdd = true;
					let cantValid = info.Cantidad * +tempProdAg.PorCada;
					if (+tempProdAg.PorCada > cantValid) {
						validAdd = false;
					}
					if (
						validAdd &&
						tempProdAg.inventames == "N" &&
						tempProdAg.estructura == "S"
					) {
						if (!validarEstructuraHijos(tempProdAg.inventario, cantValid)) {
							validAdd = false;
						}
					} else {
						if (
							validAdd &&
							tempProdAg.inventames == "S" &&
							+tempProdAg.invenactua < cantValid
						) {
							validAdd = false;
						}
					}
					if (!validAdd) {
						alertify.warning(
							"Se retirará el producto de obsequio ya que no se encuenta con inventario disponible."
						);
					} else {
						productoActual.PromoDatosProdObsequio.Valor = 0;
						productoActual.PromoDatosProdObsequio.PromoDescuen = 0;
						prodsAgregarNew.push(productoActual.PromoDatosProdObsequio);
					}
				}

				if (
					productoActual.AplicaFamilia == "S" &&
					productoActual.TotalFamilias > 0 &&
					totalFami > 0
				) {
					if (editarProductoPedidoNuevo > -1) {
						prodsSelectFamilia[posPlatoActualFami] = prodsSelectFamilia[
							posPlatoActualFami
						].map((it) => {
							it.Cantidad = it.CantidadFamilia;
							it.allevar =
								arrayProductosPedido[editarProductoPedidoNuevo].allevar;
							it.Desayuno =
								arrayProductosPedido[editarProductoPedidoNuevo].Desayuno;
							it.Personas =
								arrayProductosPedido[editarProductoPedidoNuevo].Personas;
							it.Termino =
								arrayProductosPedido[editarProductoPedidoNuevo].Termino;
							it.PuestoMesa =
								arrayProductosPedido[editarProductoPedidoNuevo].PuestoMesa;
							it.Valor = 0;
							it.nuevo = true;
							it.Observacio = "";
							it.AccionId = accionTercero;
							return it;
						});
						arrayProductosPedido[editarProductoPedidoNuevo].ProductosFamilia =
							prodsSelectFamilia[posPlatoActualFami];
						editarProductoPedidoNuevo = -1;
					} else {
						if (itemsObservaciones.length) {
							info.inventario = info.inventario.concat(
								productoActual.observacionesProd
							);
						}
						if (productoActual.valorTermino) {
							info.Termino = productoActual.valorTermino;
						}
						Object.keys(prodsSelectFamilia).forEach((pos) => {
							info.Cantidad = prodsSelectFamilia[pos][0].Cantidad;
							let estruct = prodsSelectFamilia[pos];
							estruct = estruct.map((it) => {
								it.Cantidad = it.CantidadFamilia;
								it.allevar = info.allevar;
								it.Desayuno = info.Desayuno;
								it.Personas = info.Personas;
								it.PuestoMesa = info.PuestoMesa;
								it.ivaid = info.ivaid;
								it.Valor = (it.RecargoEnFamilias > 0 ? it.RecargoEnFamilias : 0);
								it.nuevo = true;
								it.AccionId = accionTercero;
								return it;
							});
							info.posFamilia = pos;
							info.ProductosFamilia = estruct;
							prodsAgregarNew.push({ ...info });
						});
					}
					/* Se vuelve falso porque quiere decir que ya eligieron a los prods de la familia */
					observsValidas = false;
				}

				/* No se pone en el mismo if porque si se pone se borra la cantidad del input para cuando son familias */
				if (productoActual.AplicaFamilia == "S") {
					if (productoActual.TotalFamilias > 0 && totalFami > 0) {
						$(this)[0].reset();
						$("#formIngredientes :input").removeClass(
							"is-invalid, input-invalid"
						);
						$(this).validate().resetForm();
					}
				} else {
					$(this)[0].reset();
					$("#formIngredientes :input").removeClass(
						"is-invalid, input-invalid"
					);
					$(this).validate().resetForm();
				}

				dataAnteriorProducto = data;
				/* Validamos si hay items de tipo O y maneja estructura */
				if (observsValidas) {
					cantidadNuevaPedido = data.Cantidad;
					abrirCerrarModal(".bd-Variables", "hide");
					observacionesProducto(
						"#listaObservaciones",
						productoActual,
						itemsObservaciones,
						".modal-observaciones-producto"
					);
				} else {
					if (
						productoActual.EsDesayuno == "S" &&
						ReservaAplicaDesayuno == "S" &&
						TieneDesayunoPendiente == "S"
					) {
						$(
							"#btnCargarACuenta, #btnFacturarPedido, #btnBorrarPedido, #btnDarDeBajaCuenta, #btnCambiarSocio"
						).hide();
						info["Desayuno"] = "S";
						info["Valor"] = 0;
						info["HeadReservaIdHotel"] = HeadReservaIdHotel;
						TieneDesayunoPendiente = "N";
						$("#AplicoDesayuno").show();
					}
					abrirCerrarModal(".bd-Variables", "hide");
					$("#valProducto").val("");
					promocionActual = {};
					if (
						editarProductoPedidoNuevo != -1 &&
						arrayProductosPedido[editarProductoPedidoNuevo]["Id"] &&
						arrayProductosPedido[editarProductoPedidoNuevo]["Imprime"] != "P"
					) {
						permisoAccionActual = 2609;
						imprimirDevolucionConsumo = false;
						if (
							$DATOSMONTAJE.TiempoDevolConsumo &&
							productoActual.Cantidad > data.Cantidad
						) {
							let tiempoDevolucion = moment(productoActual.FechaConsu).add(
								$DATOSMONTAJE.TiempoDevolConsumo,
								"minutes"
							);
							if (tiempoDevolucion.isBefore(moment())) {
								abrirCerrarModal("#modal-solicitar-usuario", "show");
							} else {
								imprimirDevolucionConsumo = true;
								obtenerInformacion(
									{},
									"tiposDevoluciones",
									"dataTiposDevoluciones"
								);
							}
						} else {
							if (productoActual.Cantidad > data.Cantidad) {
								obtenerInformacion(
									{},
									"tiposDevoluciones",
									"dataTiposDevoluciones"
								);
							} else {
								abrirCerrarModal("#modal-solicitar-usuario", "show");
							}
						}
					} else {
						guardarProducto();
					}
				}
			}
		} else {
			alertify.error("Validar la información de los campos");
		}
	});

	$(".btnCloseObservaciones").on("click", function () {
		if (arrayProductosPedido.length && editarProductoPedidoNuevo == -1) {
			arrayProductosPedido.splice(arrayProductosPedido.length - 1, 1);
		}
	});

	$(".item-nav-reserva").click(function () {
		tabReserva = $(this).data("tabsito");
		$("#valReserva").keyup();
	});

	$("#formObservacionesProd").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			let $fills = $("#formObservacionesProd input");
			let prodSelecteds = [];
			$.each($fills, (pos, input) => {
				const name = $(input).attr("name");
				let item = itemsObservaciones.find((op) => op.EstructuraId == name);
				let itemProd = Object.assign({}, item);
				if ($(input).is(":checked")) {
					itemProd.elegido = true;
					itemProd.checked = true;
				} else {
					itemProd.elegido = false;
					delete itemProd.checked;
				}
				prodSelecteds.push(itemProd);
			});

			if (prodSelecteds.length) {
				if (editarProductoPedidoNuevo != -1) {
					let producto = arrayProductosPedido[editarProductoPedidoNuevo];
					producto.inventario = (producto.inventario || []).concat(
						prodSelecteds
					);

					if (
						productoActual.EsDesayuno == "S" &&
						ReservaAplicaDesayuno == "S" &&
						TieneDesayunoPendiente == "S"
					) {
						$(
							"#btnCargarACuenta, #btnFacturarPedido, #btnBorrarPedido, #btnDarDeBajaCuenta, #btnCambiarSocio"
						).hide();
						producto["Desayuno"] = "S";
						producto["Valor"] = 0;
						producto["HeadReservaIdHotel"] = HeadReservaIdHotel;
						TieneDesayunoPendiente = "N";
						$("#AplicoDesayuno").show();
					}
					arrayProductosPedido[editarProductoPedidoNuevo] = producto;

					if (
						productoActual.EsDesayuno == "S" &&
						ReservaAplicaDesayuno == "S" &&
						TieneDesayunoPendiente == "S"
					) {
						producto["Desayuno"] = "S";
						producto["Valor"] = 0;
						producto["HeadReservaIdHotel"] = HeadReservaIdHotel;
						TieneDesayunoPendiente = "N";
						$("#AplicoDesayuno").show();
					}

					producto = prodsAgregarNew[prodsAgregarNew.length - 1];
					producto.inventario = producto.inventario.concat(prodSelecteds);
					prodsAgregarNew[prodsAgregarNew.length - 1] = producto;
				} else {
					let producto = prodsAgregarNew[prodsAgregarNew.length - 1];
					producto.inventario = producto.inventario.concat(prodSelecteds);

					if (
						productoActual.EsDesayuno == "S" &&
						ReservaAplicaDesayuno == "S" &&
						TieneDesayunoPendiente == "S"
					) {
						$(
							"#btnCargarACuenta, #btnFacturarPedido, #btnBorrarPedido, #btnDarDeBajaCuenta, #btnCambiarSocio"
						).hide();
						producto["Desayuno"] = "S";
						producto["Valor"] = 0;
						producto["HeadReservaIdHotel"] = HeadReservaIdHotel;
						TieneDesayunoPendiente = "N";
						$("#AplicoDesayuno").show();
					}
					prodsAgregarNew[prodsAgregarNew.length - 1] = producto;
				}
			}
			$("#valProducto").val("");
			abrirCerrarModal(".modal-observaciones-producto", "hide");
			if (
				editarProductoPedidoNuevo != -1 &&
				arrayProductosPedido[editarProductoPedidoNuevo]["Id"] &&
				arrayProductosPedido[editarProductoPedidoNuevo]["Imprime"] != "P"
			) {
				permisoAccionActual = 2609;
				imprimirDevolucionConsumo = false;
				if (
					$DATOSMONTAJE.TiempoDevolConsumo &&
					productoActual.Cantidad > cantidadNuevaPedido
				) {
					let tiempoDevolucion = moment(productoActual.FechaConsu).add(
						$DATOSMONTAJE.TiempoDevolConsumo,
						"minutes"
					);
					if (tiempoDevolucion.isBefore(moment())) {
						abrirCerrarModal("#modal-solicitar-usuario", "show");
					}
				} else {
					if (productoActual.Cantidad > dataAnteriorProducto.Cantidad) {
						imprimirDevolucionConsumo = true;
						obtenerInformacion(
							{},
							"tiposDevoluciones",
							"dataTiposDevoluciones"
						);
					} else {
						abrirCerrarModal("#modal-solicitar-usuario", "show");
					}
				}
			} else {
				if (
					productoActual.AplicaFamilia == "S" &&
					productoActual.TotalFamilias > 0 &&
					!productoActual.SeleccionoFamilia
				) {
					let data = {
						producto: productoActual.headprodid,
					};
					productoActual.observacionesProd = prodSelecteds;

					obtenerInformacion(
						data,
						"obtenerFamiliasProd",
						"informacionFamiliaProducto"
					);
				} else {
					guardarProducto();
				}
			}
			editarProductoPedidoNuevo = -1;
			prodsSelectFamilia = {};
			posPlatoActualFami = -1;
			promocionActual = {};
		} else {
			alertify.error("Los valores de las opciones no son correctos");
		}
	});

	$(".btn-floating").on("click", function () {
		$(".CheckOut").toggle();
		$(".platos-pedido").scrollTop($(".platos-pedido")[0].scrollHeight);
	});

	$(".btn-Reservas").on("click", function () {
		$(".reservas-mesa").toggle();
		if ($(".reservas-mesa").is(":visible")) {
			let tab = $(".item-nav-reserva.active").data("tabsito");
			$("#" + tab).addClass("active show");
		}
	});

	if (accesoCargarCuentaHotel) {
		$("#btnCargarACuenta").hide();
	} else {
		$("#btnCargarACuenta").click(function () {
			cargarCuentaPendiente = false;
			cargarCuentaEvento = false;
			if (accesoCargarCuentaHotel) {
				$("#btnCuentaHotel").click();
			} else {
				accesoCargarCuentaHotel = false;
				guardarCuenta();
			}
		});
	}

	$("#btnCuentaHotel").click(function () {
		cargarCuentaPendiente = false;
		cargarCuentaEvento = false;
		btnCargarCuentaClick = false;
		if (accesoCargarCuentaHotel) {
			btnCargarCuentaClick = true;
			// Alerta para propina cuando se carga cuenta hotel
			if (tipoVentaSeleccionado.Propina == "S") {
				alertify
					.propinaAlert($("#propinaFrm")[0], function () {})
					.set("selector", 'input[id="propinaInput"]');
			} else {
				guardarCuenta();
			}
		} else {
			accesoCargarCuentaHotel = true;
			// Alerta para propina cuando se carga cuenta hotel
			if (tipoVentaSeleccionado.Propina == "S") {
				alertify
					.propinaAlert($("#propinaFrm")[0], function () {})
					.set("selector", 'input[id="propinaInput"]');
			} else {
				guardarCuenta();
			}
		}
	});

	$("#btnCuentaEvento").click(function () {
		cargarCuentaEvento = true;
		guardarCuenta();
	});

	$("#btnFacturarPedido").click(function () {
		let valor = $(".totalCuentaActual:first").html().replace("$", "");
		if (
			$DATOSMONTAJE["FacturaCortesia"] == "S" &&
			$DATOSMONTAJE["ventaceros"] == "S" &&
			+valor <= 0
		) {
			alertify.error("No se puede facturar en cero");
			return;
		}

		/* Filtramos los nuevos y organizamos la informacion según la tabla */
		if ($DATOSMONTAJE["ConfirmarConsumoAPP"] == "S") {
			let SinConfirmar = arrayProductosPedido.filter(
				(ite) => !ite.ConfirmadoAPP
			);
			if (SinConfirmar.length) {
				alertify.warning(
					"Algunos productos no han sido aceptados por el cliente."
				);
				return;
			}
		}

		if ($DATOSMONTAJE.FactConAbier == "S") {
			if ($(".btnOcultarConsumos").hasClass("ocultarConsumos")) {
				let printConsumos = arrayProductosPedido
					.filter((it) => {
						return $(
							`.platos-pedido-item[data-prod=${it.ProductoId}]`
						).hasClass("activoplato");
					})
					.map((x) => x.Id);

				if (printConsumos.length) {
					alertify
						.confirm(
							"Alerta",
							"¿Desea facturar la cuenta de todos los puntos de venta?",
							function (evt, value) {
								cargarCuentaPendiente = false;
								cargarCuentaEvento = false;
								facturarPedido();
							},
							function () {
								cargarCuentaPendiente = false;
								cargarCuentaEvento = false;
								facturarPedido(printConsumos);
							}
						)
						.set("labels", { ok: "Si", cancel: "No" });
				} else {
					// alertify.warning("El pedido actual no tiene productos registrados.")
					cargarCuentaPendiente = false;
					cargarCuentaEvento = false;
					facturarPedido(printConsumos);
				}
			} else {
				cargarCuentaPendiente = false;
				cargarCuentaEvento = false;
				facturarPedido();
			}
		} else {
			cargarCuentaPendiente = false;
			cargarCuentaEvento = false;
			facturarPedido();
		}
	});

	$("#btnFacturarFacturaElectronico").click(function () {
		factElectronicaDirecta = true;
		$("#btnFacturarPedido").click();
	});

	$(".btnCancelarCargar").click(function () {
		$("input[name=Termino]").removeAttr("required");
		$("input[name=Termino]").prop("checked", false);
		abrirCerrarModal(".bd-Variables", "hide");
		editarProductoPedidoNuevo = -1;
		$(`[name=Termino]`).attr("checked", false);
		if (valorBuscarProducto != "") {
			abrirCerrarModal("#BusquedaProducto", "show");
		}
	});

	$("#tabProductos").click(function () {
		if (
			!$(".card-tipo-comida").children().children(".producto-seleccionado")[0]
		) {
			alertify.warning("Debe seleccionar una categoria.");
		}
	});

	$("#cancelarModalAccion").on("click", function () {
		if (accionPos == "general") {
			informacionMesa(false);
		}
		$("#formCargarAccion")[0].reset();
		$("#formCargarAccion :input").removeClass("is-invalid");
		$("#formCargarAccion").validate().resetForm();
		$("#NumeroPersonas").val("");
		if (cambiarSocioCuenta) {
			terceroPedidoEmpresa = {};
		}
		cambiarSocioCuenta = false;
	});

	$("#formDataAdmin").submit(function (e) {
		e.preventDefault();
		/* Vamos a validar el usuario ingresado para permisos de administrador */
		if ($(this).valid()) {
			let $fills = $("#formDataAdmin input"),
				data = {};
			$.each($fills, (pos, input) => {
				const name = $(input).attr("name");
				data[name] = $(input).val();
			});
			data["permiso"] = permisoAccionActual;
			usuarioIdA = $("#usuarioid").val();
			if (permisoAccionActual == 2609) {
				obtenerInformacion(data, "validarUsuario", "editarProductoDeConsumo");
			} else if (permisoAccionActual == 2611) {
				obtenerInformacion(data, "validarUsuario", "darBajaProductoPedido");
			} else if (permisoAccionActual == "validar") {
				delete data["permiso"];
				obtenerInformacion(data, "validarUsuario", "actualizarMesasTemporales");
			} else {
				obtenerInformacion(
					data,
					"validarUsuario",
					"borrarCuentaProductoPedido"
				);
			}
		} else {
			alertify.error("Validar la información de los campos");
		}
	});

	$("#btnCerrarModalAccionesCargarCuenta").click(function () {
		abrirCerrarModal(
			"#modal-accion-tercero",
			"hide",
			".bd-accion-modal-sm",
			"show"
		);
	});

	$("#btnCerrarModalUsuario").click(function () {
		abrirCerrarModal("#modal-solicitar-usuario", "hide");
		$("#clave").val("");
		editarProductoPedidoNuevo = -1;
		darBajaVenta = false;
		$(".botones-carrito button").css("pointer-events", "auto");
		$("#btnCancelarProceso").hide();
		organizarAcumulado();
	});

	$(".card-vendedor").on("click", function () {
		$(".card-vendedor").removeClass("card-vendedor-seleccionado");
		$(this).addClass("card-vendedor-seleccionado");
		$("#btnFacturarPedido").prop("disabled", false);
		$("#btnFacturarFacturaElectronico").attr("data-vendfactura", "S");
		if ($(this).data("puedefacturar") != "S") {
			$("#btnFacturarPedido").prop("disabled", true);
			$("#btnFacturarFacturaElectronico").attr("data-vendfactura", "N");
		}
		if (accesoCargarCuentaHotel) $("#btnFacturarPedido").hide();
		let idVendedor = $(this).data("vendedor");
		$(".vendedorPedido").html($(this).data("nombre"));
		if (
			$DATOSMONTAJE.SolicitaClaveVendedor == "S" &&
			$(this).data("venuser") == ""
		) {
			let mensaje = `
				<h6>${$(this).data("nombre")}</h6>
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
								url: rutaGeneral + "validarPassVendedor",
								type: "POST",
								dataType: "json",
								data: { idVendedor, pass },
								success: function (resp) {
									if (resp.success) {
										setTimeout(() => {
											$("#btnElegirVendedor").click();
										}, 100);
									} else {
										setTimeout(() => {
											$(".card-vendedor-seleccionado").click();
										}, 10);
										alertify.error("Contraseña incorrecta");
									}
								},
							});
						} else {
							setTimeout(() => {
								$(".card-vendedor-seleccionado").click();
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
							$(".ajs-content").find(".data-pass").focus();
						}, 1000);
					},
					onclose: function () {
						alertify.alert().set({ onshow: null });
					},
				})
				.show();
		} else {
			$("#btnElegirVendedor").click();
		}
	});

	recargarPlano();

	$("#btnElegirVendedor").on("click", function () {
		let data = $(".card-vendedor.card-vendedor-seleccionado").data("vendedor");
		if (data) {
			vendedorElegido = data;
			informacionMesa(accionPos != "general" ? idMesaActual : false);
			abrirCerrarModal("#ElegirVendedor", "hide");
			window.scrollTo(0, 0);
		} else {
			alertify.warning("Debe elegir un vendedor");
		}
	});

	$("#btnCargarAccion").prop("disabled", true);
	$("#numeroAccion").on("change", function (e) {
		e.preventDefault();
		$("#btnCargarAccion").prop("disabled", true);
		$("#collapseTercero").removeClass("show");
		if (!consultadonAccion) {
			$("#btnBuscarTercero").click();
		}
	});

	$("#UserPedido").change(function () {
		let enc = tercerosAccion.find((op) => op.TerceroID == $(this).val());
		if (enc) {
			$("#dataTercero").html("");
			$("#fotoTercero").prop("src", enc.Foto);
			dataMostrarTercero.forEach((it) => {
				$("#dataTercero").append(`
				<div class="col-6"><strong>${it.titulo}</strong></div>
				<div class="col-6 prop${it.propiedad}">${
					enc[it.propiedad] == null ? "" : enc[it.propiedad]
				}</div>
			`);
			});
			if (tipoVentaSeleccionado.manejclien != "N") {
				if (!$("#collapseTercero.show")[0]) {
					$("#btnCollapse").click();
				}
			}
			if (
				enc.EsEmpleado == 0 &&
				!enc.Ingreso &&
				$INFOALMACEN["VerificarIngreso"] == "S" &&
				(!enc.ReservaHotel || enc.ReservaHotel == -1) &&
				enc.TipoDocumento != "31"
			) {
				alertify.warning("El tercero no tiene ingreso registrado para hoy");
				return;
			}

			/* Se regresa a 1 cuando tiene mas de una accion y cuando sea desde busque habitaciones ya que desde hotel trae la accion*/
			if (
				enc.CantAcciones > 1 &&
				$(".btnFiltroeBuscar.show").data("botonsearch") == "habitacion"
			) {
				enc.CantAcciones = enc.AccionId ? 1 : 0;
			}

			if (accesoCargarCuentaHotel && reservaHotel && reservaHotel != -1) {
				enc.ReservaHotel = reservaHotel;
			}
			habitacionHotel = enc.HabitacionId;
			if (accesoCargarCuentaHotel && accionPos == "general") {
				$("#formCargarAccion").submit();
			} else if (
				enc.CantAcciones > 1 &&
				columnaBusquedaTercero != "AccionId" &&
				!enc["IdReserva"]
			) {
				modalaccionesTercero(enc.Acciones);
			} else {
				if (enc.TipoDocumento == "31") {
					if (!cambiarSocioCuenta) {
						if (!terceroPedidoEmpresa.TerceroID) {
							terceroPedidoEmpresa = enc;
							$(".empresa-datos").html(
								`<strong>Empresa: </strong> ${
									enc.Nombre
								} - <strong> Nit: </strong> ${
									enc.TerceroID
								} - <strong> Acción: </strong> ${enc.AccionId || ""}`
							);
							if (enc.AccionId && enc.AccionId != "") {
								$("#numeroAccion").val(enc.AccionId);
								$("#btnBuscarTercero").click();
							}
						}
					} else {
						if (accionTercero && accionTercero != "") {
							if (enc.Acciones) {
								let acci = enc.Acciones.find(
									(it) => it.AccionId == accionTercero
								);
								if (acci && acci.AccionId) {
									$(".propAccionId").html(acci.AccionId);
								} else {
									$(".propAccionId").html("");
								}
							}
						} else {
							$(".propAccionId").html("");
						}
						terceroPedidoEmpresa = enc;
					}
				}
				setTimeout(() => {
					$("#NumeroPersonas").focus();
				}, 100);
			}
		}
	});

	$("#fotoTercero").on("click", function () {
		$("#btnCollapse").click();
	});

	$("#btnBuscarTercero").on("click", function (e) {
		e.preventDefault();
		$("#UserPedido").html("");
		$("#tercerosAccion").hide();
		consultadonAccion = true;
		let data = {
			accion: $("#numeroAccion").val(),
			mesa: idMesaActual,
			ingreso: $INFOALMACEN["VerificarIngreso"],
			fecha: moment().format(frmtFech),
			zona: zonaMesaActual["ZonaId"] || "",
			almacen: $INFOALMACEN["almacenid"],
			fechaActual: moment().toDate(),
			sede: $INFOALMACEN["SedeId"],
		};
		let buscar = $(".btnFiltroeBuscar.show").data("botonsearch");
		if ($("#numeroAccion").val() != terceroPedidoEmpresa.AccionId) {
			$(".empresa-datos").html(``);
			terceroPedidoEmpresa = {};
		}
		if (buscar == "tercero") {
			inputTercero = $("#numeroAccion").val();
			regex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
			if (regex.test(inputTercero)) {
				$("#numeroAccion").val("");
			}
			if ($("#numeroAccion").val() != "") {
				$("#btnBuscarTercero").prop("disabled", true);
				obtenerInformacion(data, "obtenerAccion", "informacionAccion");
			} else {
				$("#numeroAccion").focus();
			}
		} else if (buscar == "evento") {
			data["Evento"] = $("#EventosPedido").val();
			obtenerInformacion(data, "buscarTercerosPorEvento", "informacionAccion");
		} else {
			data["Habitacion"] = $("#HabitacionPedido").val();
			obtenerInformacion(
				data,
				"buscarTercerosPorHabitacion",
				"informacionAccion"
			);
		}
	});

	$("#btnMesasTercero").on("click", function () {
		let data = {
			tercero: terceroIdPedido,
			zona: zonaMesaActual["ZonaId"],
		};
		obtenerInformacion(data, "pedidosMesasTercero", "dataMesasTercero");
	});

	$("#mesasUnificar").change(function (e) {
		let entrada = $(this)
			.val()
			.filter((x) => !selectMesasMultiple.includes(x));
		if (entrada[0] == "") {
			$(this).val([""]);
		} else {
			$(this).val(
				$(this)
					.val()
					.filter((it) => it != "")
			);
		}
		selectMesasMultiple = $(this).val();
		$("#mesasUnificar").trigger("chosen:updated");
		if (unificarMesasTercero) {
			let mesas = [];
			let mesabtn = $("#btnUnificarMesasTercero").attr("data-mesabtn");
			if (!selectMesasMultiple.length || selectMesasMultiple[0] == "") {
				$("a.link-mesas").addClass("mesa-unificar");
				$.each($(`a.link-mesas`), (pos, element) => {
					let mesa = $(element).data("mesaterc");
					if (mesa != mesabtn) {
						mesas.push($(element).data("mesaterc"));
					}
				});
				$("#mesasUnificar").val(mesas);
				$(`a.link-mesas[data-mesaterc=${mesabtn}]`).removeClass(
					"mesa-unificar"
				);
			} else {
				$(`a.link-mesas`).removeClass("mesa-unificar");
				selectMesasMultiple.forEach((ite) => {
					if (ite != mesabtn) {
						$(`a.link-mesas[data-mesaterc=${ite}]`).addClass("mesa-unificar");
						mesas.push(ite);
					}
				});
				$("#mesasUnificar").val(mesas);
			}
		}
		$("#mesasUnificar").trigger("chosen:updated");
	});

	$("#btnOtrasCuentasTerceroAceptar").click(function () {
		let mesas = $("#mesasUnificar").val();
		if (mesas.length) {
			let data = {
				mesaOriginal: $("#btnUnificarMesasTercero").data("mesabtn"),
				mesasModificar: mesas,
				tercero: terceroIdPedido,
			};
			obtenerInformacion(
				data,
				"unificarMesasTercero",
				"mesasUnificadasTercero"
			);
		} else {
			alertify.warning("No ha seleccionado ninguna mesa");
		}
	});

	$("#btnCambiarZona").on("click", function () {
		if (accionPos == "pedido_mesa" && $INFOALMACEN["ManejaMesas"] == "S") {
			desdeFactura = false;
			$(
				"#btnCargarACuenta, #btnFacturarPedido, #btnBorrarPedido, #btnDarDeBajaCuenta, #btnCambiarSocio"
			).show();
			cambiarSocioCuenta = false;
			cambiarTab("#tabMesas");
			$("#zonaMesa").change();
			$("#btnCambiarZona, #btnCuentaHotel").hide();
			$(".card-vendedor").removeClass("card-vendedor-seleccionado");
			$("#dataTercero").html("");
			$(".btnOcultarConsumos")
				.find("i")
				.removeClass("fa-eye-slash")
				.addClass("fa-eye");
			$(".btnOcultarConsumos").removeClass("ocultarConsumos");
			ocultarInforFlotante();
			$(".btn-Reservas").show();
			let tercero = terceroIdPedido;
			terceroIdPedido = null;
			accionTercero = null;
			btnAgregarCuentaTercero = false;
			arrayProductosPedido = [];
			sessionStorage.removeItem("datosCuentaHotel");
			sessionStorage.removeItem("dataPos");
			sessionStorage.removeItem("tercerosDesayuno");
			obtenerInformacion({ mesaId: idMesaActual, tercero }, "EdicionMesa");
		} else {
			obtenerInformacion(
				{ mesaId: idMesaActual, tercero: terceroIdPedido },
				"EdicionMesa"
			);
			sessionStorage.removeItem("datosCuentaHotel");
			sessionStorage.removeItem("dataPos");
			sessionStorage.removeItem("tercerosDesayuno");
			location.href = base_url() + "Administrativos/Servicios/VistaGeneral";
		}
	});

	$("#btnAceptarEstructura").click(function () {
		abrirCerrarModal("#datosPlatoEstructura", "hide");
	});

	$("#btnCambiarSocio").on("click", function () {
		$("#tercerosAccion, #tituloCentasPendiente").hide();
		$("#numeroAccion").val("");
		$("#NumeroPersonas").val(numeroPersonasPedido);
		cambiarSocioCuenta = true;
		botonCambiarCuenta = 1;
		abrirCerrarModal(".bd-accion-modal-sm", "show");
		$("#tituloCentasPendiente, #cuentasPendienteMesa").hide();
		if ($("#collapseTercero.show")[0]) {
			$("#btnCollapse").click();
		}
	});

	$("#btnAceptarCambioMesa").click(function () {
		let $inputs = $("#listaTercerosConsumo .checkpadre");
		if (unificarMesas) {
			$inputs = $("#listaTercerosConsumo input");
		}
		let tercerosCambiar = {};
		let datosUnifi = [];
		let consumos = false;
		$.each($inputs, (pos, it) => {
			let datosConsumos = $(it).data("consu");
			if (datosConsumos) {
				consumos = true;
				datosConsumos.forEach((opc) => {
					if ($("#" + opc).data("check")) {
						let padre = $(it).data("terc");
						if (!tercerosCambiar[padre]) {
							tercerosCambiar[padre] = [];
						}
						tercerosCambiar[padre].push($("#" + opc).data("consumo"));
					}
				});
			} else {
				if ($(it).prop("checked")) {
					let tercero = $(it).data("infomesa");
					let accion = $(it).data("user") || null;
					datosUnifi.push({ tercero, accion });
				}
			}
		});
		if (Object.keys(tercerosCambiar).length || datosUnifi.length) {
			let data = {
				mesaSalida: mesaUno["MesaId"],
				mesaEntrada: mesaDos["MesaId"],
			};
			if (consumos) {
				data["terceros"] = tercerosCambiar;
			} else {
				data["unificacion"] = datosUnifi;
			}
			actualizarConsumoMesas(data, "#btnCancelarUnificarMesa");
		} else {
			alertify.warning("No ha seleccionado ningún producto");
		}
	});

	$("#formObservacionBorrar").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			if (permisoAccionActual == 2609) {
				arrayProductosPedido[editarProductoPedidoNuevo]["ObservacioDevol"] =
					$("#ObservacioBorrar").val();
				editarProductoPedidoNuevo = -1;
				abrirCerrarModal("#observa-factura-borrar", "hide");
				guardarProducto();
				return;
			}
			let data = {
				observacion: $("#ObservacioBorrar").val(),
				tercero: terceroIdPedido,
				mesa: idMesaActual,
				tipoDevo:
					(tipoDevolucionSeleccionada &&
						tipoDevolucionSeleccionada.tipodevoid) ||
					null,
				accion: accionTercero,
				UsuarioIdAprueba:
					usuarioIdA === "undefined" || usuarioIdA == null ? null : usuarioIdA,
			};
			if (formValidateDataUser === "producto") {
				data["Id"] = arrayProductosPedido[editarProductoPedidoNuevo]["Id"];
				data["Producto"] =
					arrayProductosPedido[editarProductoPedidoNuevo]["ProductoId"];
			}
			$.ajax({
				url: rutaGeneral + "borrarDeCuenta",
				type: "POST",
				data: {
					encriptado: $.Encriptar(data),
					imprimirDevolucionConsumo,
					accionPos,
				},
				dataType: "json",
				success: (resp) => {
					resp = JSON.parse($.Desencriptar(resp));
					if (resp.valido) {
						alertify.success(resp.mensaje);
						abrirCerrarModal("#observa-factura-borrar", "hide");
						$("#ObservacioBorrar").val("");
						if (formValidateDataUser === "producto") {
							if (
								!arrayProductosPedido[editarProductoPedidoNuevo]["pendiente"] &&
								arrayProductosPedido[editarProductoPedidoNuevo]["Desayuno"] ==
									"S"
							) {
								TieneDesayunoPendiente = "S";
								$("#AplicoDesayuno").hide();
							}
							informacionMesa(accionPos != "general" ? idMesaActual : false);
							abrirCerrarModal("#ElegirVendedor", "hide");
							obtenerProductosTercerosDesayuno();
						} else {
							$("#btnCambiarZona").hide();
							tipoDevolucionSeleccionada = null;
							limpiarVariables();
							terceroIdPedido = null;
						}
					} else {
						alertify.error(resp.mensaje);
					}
				},
			});
		} else {
			alertify.error("Validar la información de los campos");
		}
	});

	$(".btnCancelarObservacionBorrar, #btnCancelarTipoDevolucion").click(
		function () {
			tipoDevolucionSeleccionada = null;
			editarProductoPedidoNuevo = -1;
			prodsAgregarNew = [];
			abrirCerrarModal("#tiposDevolucionCortesia", "hide");
		}
	);

	$("#btnCargarMesasTemporales").on("click", function () {
		permisoAccionActual = "validar";
		abrirCerrarModal(
			".modal-mesas-activar",
			"hide",
			"#modal-solicitar-usuario",
			"show"
		);
	});

	$("#btnAgregarCuentas").click(function () {
		$("#formCargarAccion")[0].reset();
		$("#formCargarAccion :input").removeClass("is-invalid");
		$("#formCargarAccion").validate().resetForm();
		$("#cuentasPendienteMesa").html("");
		$("#NumeroPersonas").val("");
		btnAgregarCuentaTercero = true;
		$("#tercerosAccion, #collapseTercero").hide();
		abrirCerrarModal(".bd-accion-modal-sm", "show");
	});

	$("#btnCambiarCuentaPedido").click(function () {
		let data = {
			mesaId: idMesaActual || false,
			accionPos: accionPos,
			ingreso: $INFOALMACEN["VerificarIngreso"],
			fecha: moment().format(frmtFech),
			zona: zonaMesaActual["ZonaId"] || "",
			almacen: $INFOALMACEN["almacenid"],
			fechaActual: moment().toDate(),
			sede: $INFOALMACEN["SedeId"],
		};
		obtenerInformacion(data, "cuentasMesa", "cuentasMesaTerceros");
	});

	$("#btnCerrarModalCambiarCuenta").click(function () {
		abrirCerrarModal("#modal-cambiar-cuenta", "hide");
	});

	$("#btnVerCuentasPendientes").hide();
	$(".bd-accion-modal-sm").on("shown.bs.modal", function (event) {
		$("#numeroAccion, #btnBuscarTercero").prop("disabled", false);
		if (accionPos == "pedido_mesa") {
			let mesa = mesasPlano.find((it) => it.MesaId == idMesaActual);
			if (mesa.TotalPendientes > 0) {
				$("#btnVerCuentasPendientes").show();
				$("#btnVerCuentasPendientes")
					.unbind()
					.click(function () {
						let data = {
							mesa: idMesaActual,
							fechaActual: moment().format("YYYY-MM-DD HH:mm:ss"),
							zona: zonaMesaActual["ZonaId"] || "",
						};
						obtenerInformacion(
							data,
							"cuentasConsumoPendientes",
							"consumosPendientesMesa"
						);
					});
			}
			setTimeout(() => {
				if (!mesa["TerceroReserva"]) {
					$("#numeroAccion").focus();
				}
			}, 100);
		} else {
			if (accionPos == "general") {
				if (terceroIdPedido == "" && tercerosDesayuno.length) {
					abrirCerrarModal(".bd-accion-modal-sm", "hide");
					let data = {
						mesaId: idMesaActual || false,
						accionPos: accionPos,
						ingreso: $INFOALMACEN["VerificarIngreso"],
						fecha: moment().format(frmtFech),
						zona: zonaMesaActual["ZonaId"] || "",
						almacen: $INFOALMACEN["almacenid"],
						almacenid: $INFOALMACEN["almacenid"],
						fechaActual: moment().toDate(),
						sede: $INFOALMACEN["SedeId"],
						terceros: tercerosDesayuno,
						reservaHotel: reservaHotel,
						terceroEmpresa:
							terceroPedidoEmpresa && terceroPedidoEmpresa.TerceroID
								? ("" + terceroPedidoEmpresa.TerceroID).trim()
								: null,
					};
					obtenerInformacion(data, "tercerosDesayuno", "dataTercerosDesayuno");
				} else {
					if ($SINMESA > 0) {
						$("#btnVerCuentasPendientes").show();
						$("#btnVerCuentasPendientes")
							.unbind()
							.click(function () {
								let data = {
									mesa: null,
									fechaActual: moment().format("YYYY-MM-DD HH:mm:ss"),
									zona: zonaMesaActual["ZonaId"] || "",
								};
								obtenerInformacion(
									data,
									"cuentasConsumoPendientes",
									"consumosPendientesMesa"
								);
							});
						setTimeout(() => {
							$("#numeroAccion").focus();
						}, 100);
					}
				}
			}
		}
		$(".btnFiltroeBuscar")
			.unbind("click")
			.click(function () {
				let botonsearch = $(this).data("botonsearch");
				$(".btnFiltroeBuscar")
					.removeClass("bg-white show")
					.addClass("text-white");
				$(this).addClass("bg-white show").removeClass("text-white");
				if (!cambiarSocioCuenta && !btnAgregarCuentaTercero) {
					terceroIdPedido = null;
				}
				tercerosAccion = [];
				$("#tercerosAccion, #dataHabHotel").hide();
				$("#collapseTercero").removeClass("show");
				$(`.input-${botonsearch}`).removeClass("d-none").addClass("d-flex");
				if (botonsearch == "tercero") {
					$(".input-habitacion, .input-evento")
						.addClass("d-none")
						.removeClass("d-flex");
					$("#numeroAccion").focus();
				} else if (botonsearch == "habitacion") {
					$("#numeroAccion").val("");
					$(".input-tercero, .input-evento")
						.addClass("d-none")
						.removeClass("d-flex");
					let data = {
						sede: $INFOALMACEN["SedeId"],
					};
					$("#dataHabHotel").hide();
					obtenerInformacion(
						data,
						"obtenerHabitacionesBusqueda",
						"datosHabitacionBuscar"
					);
				} else {
					$("#numeroAccion").val("");
					$(".input-tercero, .input-habitacion")
						.addClass("d-none")
						.removeClass("d-flex");
					let data = {
						sede: $INFOALMACEN["SedeId"],
					};
					obtenerInformacion(
						data,
						"obtenerEventosBusqueda",
						"datosEventosBuscar"
					);
				}
			});

		if (
			$(".btnFiltroeBuscar.show").data("botonsearch") != "habitacion" &&
			$("#numeroAccion").val() == ""
		) {
			$(".btnFiltroeBuscar").first().click();
		}
	});

	$("#btnDarDeBajaCuenta").click(function () {
		if (!darBajaVenta) {
			darBajaVenta = true;
			$(".platos-pedido-item button").attr("disabled", true);
			$(".botones-carrito button").css("pointer-events", "none");
			$("#btnDarDeBajaCuenta").css("pointer-events", "auto");
			$(".platos-pedido-item")
				.unbind()
				.click(function () {
					if (
						$(this).data("valido") == "S" &&
						darBajaVenta &&
						$(this).data("consumoid") != 0
					) {
						if ($(this).hasClass("dar-baja-producto")) {
							$(this).removeClass("dar-baja-producto");
						} else {
							$(this).addClass("dar-baja-producto");
						}
					}
				});
			$("#btnCancelarProceso").show().text("Cancelar Dar De Baja");
			$("#btnCancelarProceso")
				.unbind()
				.click(function () {
					darBajaVenta = false;
					$(".platos-pedido-item button").attr("disabled", false);
					$(".botones-carrito button").css("pointer-events", "auto");
					$(".platos-pedido-item")
						.removeClass("dar-baja-producto")
						.off("click");
					$(this).hide();
				});
		} else {
			if ($(".platos-pedido-item.dar-baja-producto").length) {
				formValidateDataUser = "venta";
				permisoAccionActual = 2611;
				abrirCerrarModal("#modal-solicitar-usuario", "show");
			} else {
				alertify.warning("No ha seleccionado ningún producto para dar de baja");
			}
		}
	});

	if ($DATOSMONTAJE["ConfirmarConsumoAPP"] == "S") {
		$("#btnConfirmarConsumo").click(function () {
			alertify
				.prompt(
					"Contraseña",
					$(".clientePedido:first").text(),
					"",
					function (evt, value) {
						if (value != "") {
							let info = {
								tercero: terceroIdPedido,
								pass: value,
							};
							obtenerInformacion(
								info,
								"validarPassSocio",
								"socioValidoConfirmarConsumo"
							);
						} else {
							setTimeout(() => {
								$("#btnConfirmarConsumo").click();
							}, 100);
							alertify.warning("Por favor digite una contraseña");
						}
					},
					function () {}
				)
				.set("type", "password");
		});
	}

	$("#ElegirVendedor").on("hide.bs.modal", function (event) {
		buscarVendedor();
	});

	$("#btnCancelarAlmacenNoFisico").on("click", function () {
		if (arrayProductosPedido.length) {
			let data = {
				observacion: "",
				tercero: terceroIdPedido,
				mesa: idMesaActual,
				tipoDevo:
					(tipoDevolucionSeleccionada &&
						tipoDevolucionSeleccionada.tipodevoid) ||
					null,
				almacen: $INFOALMACEN["almacenid"],
				accion: accionTercero,
			};
			$.ajax({
				url: rutaGeneral + "borrarDeCuenta",
				type: "POST",
				data: { encriptado: $.Encriptar(data) },
				dataType: "json",
				success: (resp) => {
					resp = JSON.parse($.Desencriptar(resp));
					if (resp.valido) {
						regresarCuentaAnterior(true);
					} else {
						alertify.error(resp.mensaje);
					}
				},
			});
		} else {
			regresarCuentaAnterior(true);
		}
	});

	$("#btnOtraCuenta").on("click", function () {
		let data = {
			vendedor: vendedorElegido || null,
		};
		obtenerInformacion(data, "obtenerAlmacenesNoFisico", "almancesNoFisicos");
	});

	if (ventanaCambioPedido) {
		$("#btnOtraCuenta").click();
	}

	if (!accesoCargarCuentaHotel && accionPos == "pedido_mesa") {
		$("#btnCargarDesayunos").click(function () {
			let regresoMesaDesayuno = {
				AlmacenId: $AlmacenId,
				CodiVent: (tipoVentaSeleccionado && tipoVentaSeleccionado.codiventid) || 0
			};
			sessionStorage.setItem("regresoMesaDesayuno", $.Encriptar(regresoMesaDesayuno));
			location.href = base_url() + `Administrativos/Servicios/CargueCuentaHotel`;
		});
	} else {
		$("#btn-cancelar-pedido").click(function () {
			if (tercerosDesayuno.length > 0) {
				let encriptado = $.Encriptar(tercerosDesayuno);
				$.ajax({
					url: rutaGeneral + "CancelarDesayunos",
					type: "POST",
					data: { encriptado, accionPos },
					dataType: "json",
					success: (resp) => {
						resp = JSON.parse($.Desencriptar(resp));
						if (resp.success) {
							sessionStorage.removeItem("dataPos");
							sessionStorage.removeItem("tercerosDesayuno");
							location.href =
								base_url() + "Administrativos/Servicios/CargueCuentaHotel";
						} else {
							alertify.error(resp.mensaje);
						}
					},
				});
			} else {
				let PlatosCargados = [];
				//Buscamos todos los platos que esten en rojo para hacer su devolucion y cancelación
				$(document)
					.find(".platos-pedido")
					.find(".platos-pedido-item")
					.each(function () {
						let plato = $(this).data();
						PlatosCargados.push(plato.idcom);
					});
				//Validamos si tienen pedidos dentros del carrito
				if (PlatosCargados.length > 0) {
					let encriptado = $.Encriptar(PlatosCargados);
					$.ajax({
						url: rutaGeneral + "CancelarPedidoCuentaHotel",
						type: "POST",
						data: { encriptado, accionPos },
						dataType: "json",
						success: (resp) => {
							resp = JSON.parse($.Desencriptar(resp));
							if (resp.success) {
								sessionStorage.removeItem("dataPos");
								sessionStorage.removeItem("tercerosDesayuno");
								location.href =
									base_url() + "Administrativos/Servicios/CargueCuentaHotel";
							} else {
								alertify.error(resp.mensaje);
							}
						},
					});
				} else {
					sessionStorage.removeItem("dataPos");
					sessionStorage.removeItem("tercerosDesayuno");
					location.href =
						base_url() + "Administrativos/Servicios/CargueCuentaHotel";
				}
			}
		});
	}

	$("#btnPrecuenta").on("click", function () {
		if (
			typeof tipoVentaSeleccionado.impresion == "undefined" ||
			tipoVentaSeleccionado.impresion == null
		) {
			tipoVentaSeleccionado.impresion = 1;
		}
		let printConsumos = [];
		let arrayPrintConsumos = arrayProductosPedido
			.filter((it) => {
				return (
					it.ConsumoId > 0 &&
					$(`.platos-pedido-item[data-prod=${it.ProductoId}]`).hasClass(
						"activoplato"
					)
				);
			});

		arrayPrintConsumos.forEach(consumoPadre => {
			printConsumos.push(consumoPadre.Id);
			if (consumoPadre.TotalFamilias != null && consumoPadre.TotalFamilias > 0) {
				consumoPadre.ProductosFamilia.forEach(consumoFamilia => {
					if (consumoFamilia.Valor > 0) printConsumos.push(consumoFamilia.Id);
				});
			}
		});

		if (printConsumos.length) {
			printConsumos = printConsumos.join("-");
			abrirReporte(
				`${base_url()}reportes/imprimirCuenta/${printConsumos}/${
					tipoVentaSeleccionado.codiventid
				}/${tipoVentaSeleccionado.impresion}`
			);
		} else {
			alertify.warning("No tiene productos cargados a la cuenta");
		}
	});
});

function consumoProductosTercero({ datos }) {
	arrayProductosPedido = datos;
	if (!tercerosDesayuno.length && arrayProductosPedido.length) {
		$(".clientePedido").html(arrayProductosPedido[0].NombreTercero);
		$(".accionIdPedido").html(accionTercero || "");
		$(".documentoPedido").html(arrayProductosPedido[0].TerceroId);
		$(".barraPedido").html(arrayProductosPedido[0].barra);
		numeroPersonasPedido = arrayProductosPedido[0].Personas;
		$("#NumPerEditar").val(numeroPersonasPedido);
		$("#btnCuentaHotel, #btnCuentaEvento").hide();
		if (cargarCuentaHotelPermiso && reservaHotel && reservaHotel != -1)
			$("#btnCuentaHotel").show();
		if (EventoId && EventoId != -1) $("#btnCuentaEvento").show();
	}
	organizarAcumulado();
	abrirCerrarModal("#modal-cambiar-cuenta", "hide");
	if (!vendedorElegido && accionPos == "general") {
		validarVendedor(true);
	}
}

function actualizarMesasTemporales() {
	let info = $('div[data-modificado="1"]');
	let mesas = [];
	$.each(info, (pos, opt) => {
		let data = {
			mesa: $(opt).data("mesa"),
			estado: $(opt).data("origi") == 1 ? 0 : 1,
			id: $(opt).data("mesaup"),
		};
		mesas.push(data);
	});
	if (mesas.length) {
		let encriptado = $.Encriptar(mesas);
		$.ajax({
			url: rutaGeneral + "modificarMesasTemporales",
			type: "POST",
			data: { encriptado },
			dataType: "json",
			success: (resp) => {
				resp = JSON.parse($.Desencriptar(resp));
				if (resp.valido) {
					alertify.success(resp.mensaje);
					$("#btnMesasTemporales").click();
					$("#zonaMesa").change();
					abrirCerrarModal("#modal-solicitar-usuario", "hide");
				} else {
					alertify.error(resp.mensaje);
				}
			},
		});
	} else {
		$("#btnMesasTemporales").click();
		abrirCerrarModal(".modal-mesas-activar", "hide");
	}
}

function actualizarConsumoMesas(data, btn) {
	let encriptado = $.Encriptar(data);
	$.ajax({
		url: rutaGeneral + "unificarMesas",
		type: "POST",
		data: { encriptado },
		dataType: "json",
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (resp.valido) {
				alertify.success(resp.mensaje);
				$(btn).click();
				$("#zonaMesa").change();
				mesaUno = null;
				mesaDos = null;
				$("#inputNumeroPersonas").show();
				$("#cuentasPendienteMesa").html("");
				abrirCerrarModal(".bd-accion-modal-sm", "hide");
				$("#texto-boton-mesa").text("");
			} else {
				alertify.error(resp.mensaje);
			}
		},
	});
}

function validarVendedor(abrirModal = false, vendedorId = 0) {
	if (!btnAgregarCuentaTercero || abrirModal == true) {
		$(".card-vendedor").removeClass("card-vendedor-seleccionado");
		$(".vendedorPedido").text("");
		abrirCerrarModal(".modal-cuentas-pendientes", "hide");
		if (
			tipoVentaSeleccionado.vendedor &&
			tipoVentaSeleccionado.vendedor == "S"
		) {
			if (vendedorId == 0) {
				let venUser = $VENDEDORES.find((x) => x.vendUser);
				if (accesoCargarCuentaHotel)
					$(
						"#btnFacturarPedido, #btnOtraCuenta, #btnFacturarFacturaElectronico, #btnPrecuenta, #btnCambiarSocio"
					).hide();
				if (venUser) {
					$("#vend" + venUser["vendedorid"]).addClass(
						"card-vendedor-seleccionado"
					);
					$("#btnElegirVendedor").click();
					$("#btnFacturarPedido").prop("disabled", false);
					$("#btnFacturarFacturaElectronico").attr("data-vendfactura", "S");
					if (venUser.PuedeFacturarEnPOS != "S") {
						$("#btnFacturarPedido").prop("disabled", true);
						$("#btnFacturarFacturaElectronico").attr("data-vendfactura", "N");
					}
					$(".vendedorPedido").html(venUser.nombre);
					abrirCerrarModal(".bd-accion-modal-sm", "hide");
					// $('.card-tipo-comida:first').click();
					validarBtnFacturaElectronica();
				} else if ($VENDEDORES.length === 1) {
					$("#vend" + $VENDEDORES[0]["vendedorid"]).addClass(
						"card-vendedor-seleccionado"
					);
					$("#btnFacturarFacturaElectronico").attr("data-vendfactura", "S");
					if ($VENDEDORES[0]["PuedeFacturarEnPOS"] != "S") {
						$("#btnFacturarPedido").prop("disabled", true);
						$("#btnFacturarFacturaElectronico").attr("data-vendfactura", "N");
					}
					abrirCerrarModal(
						".bd-accion-modal-sm",
						"hide",
						"#ElegirVendedor",
						"show"
					);
					validarBtnFacturaElectronica();
				} else {
					setTimeout(() => {
						abrirCerrarModal(
							".bd-accion-modal-sm",
							"hide",
							"#ElegirVendedor",
							"show"
						);
					}, 500);
				}
			} else {
				let Vendedor = $VENDEDORES.find((x) => x.vendedorid == vendedorId);
				$("#btnFacturarFacturaElectronico").attr("data-vendfactura", "S");
				if (Vendedor) {
					if (Vendedor.PuedeFacturarEnPOS != "S") {
						$("#btnFacturarPedido").prop("disabled", true);
						$("#btnFacturarFacturaElectronico").attr("data-vendfactura", "N");
					}
				}
			}
		} else {
			informacionMesa(accionPos != "general" ? idMesaActual : false);
			abrirCerrarModal(".bd-accion-modal-sm", "hide");
			if (tipoVentaSeleccionado.vendedor != "S")
				$("#btnFacturarFacturaElectronico").attr("data-vendfactura", "S");
			validarBtnFacturaElectronica();
			window.scrollTo(0, 0);
		}
	} else {
		let data = {
			mesaId: idMesaActual || false,
			tercero: terceroIdPedido,
			accion: accionTercero,
			almacenid: $INFOALMACEN["almacenid"],
			AlmacenNoFisico: $INFOALMACEN.NoFisico,
			soloDesayuno: tercerosDesayuno.length > 0 ? 1 : 0,
			headReservaHotel: tercerosDesayuno.length > 0 ? HeadReservaIdHotel : 0,
			terceroEmpresa:
				terceroPedidoEmpresa && terceroPedidoEmpresa.TerceroID
					? ("" + terceroPedidoEmpresa.TerceroID).trim()
					: null,
		};
		obtenerInformacion(data, "productosConsumo", "consumoProductosTercero");
		$(".card-tipo-comida.tipo-comida-seleccionado").click();
		abrirCerrarModal(".bd-accion-modal-sm", "hide");
	}
}

function editarProductoDeConsumo(resp) {
	$("#cantProducto").val(1);
	if (productoActual.Cantidad > dataAnteriorProducto.Cantidad) {
		obtenerInformacion({}, "tiposDevoluciones", "dataTiposDevoluciones");
	} else {
		editarProductoPedidoNuevo = -1;
		abrirCerrarModal("#modal-solicitar-usuario", "hide");
		guardarProducto();
	}
}

function abrirCerrarModal(elemento, metodo, elementoAbrir, metodoAbrir) {
	$(elemento).modal(metodo);
	if (elementoAbrir && metodoAbrir) $(elementoAbrir).modal(metodoAbrir);
}

function delay(callback) {
	var timer = 0;
	return () => {
		clearTimeout(timer);
		timer = setTimeout(function () {
			callback.apply(this, arguments);
		}, 700);
	};
}

function informacionAccion({ datos, columna }) {
	columnaBusquedaTercero = columna;
	if (datos.length) {
		let items = "";
		datos.forEach((it) => {
			items += `<option value="${it.TerceroID}">${it.Nombre}</option>`;
		});
		tercerosAccion = datos;
		$("#tercerosAccion").show();
		$("#UserPedido").html(items);
		$("#btnCargarAccion").prop("disabled", false);
		$("#UserPedido").change();
	} else {
		$("#btnCargarAccion").prop("disabled", true);
	}
}

function cuentaPendiente({ consumo }) {
	$("#tituloCentasPendiente, #cuentasPendienteMesa").show();
	$("#cuentasPendienteMesa").html("");
	if (consumo.length) {
		let estructura = "";
		consumo.forEach((it) => {
			let nombreEvento = "";
			if (it.EventoId && it.EventoId != -1) {
				nombreEvento = (it.NroEvento || "") + " - " + (it.NombreEvento || "");
			}
			estructura += `<div title="Ir a la cuenta" class="m-b-10 d-flex border rounded btnTerceroCuentaPendiente justify-content-between" style="align-items: center; ${
				it.TotalPendienteRojo > 0
					? "border-color: " +
					  coloresMesa.ProdsPendientes.color +
					  " !important;"
					: ""
			}" data-info="${it.TerceroIdC ? it.TerceroIdC : ""}" data-nombre="${
				it.datosCliente && it.datosCliente.NombreTercero
					? it.datosCliente.NombreTercero
					: it.Nombre
			}" data-habitacion="${it.NombreHabitacion || "null"}" data-accion="${
				it.Accion ? it.Accion : ""
			}" data-mesa="${it.MesasCuentaUnificar}" data-zona="${
				it.ZonaCuenta
			}" data-evento="${nombreEvento}" data-firma="${it.firma}">
				<img src="${
					it.foto
				}" style="width: 70px; height: auto; max-height: 75px; border-radius: 3px" class="mr-3">
				<div style="width: 72%;">
					<h6>${it.Nombre ? it.Nombre : ""}</h6>
					<p class="m-b-0">${
						it.AccionesPedido
							? "<b>Acción: </b>" + it.AccionesPedido
							: "<b>Documento: </b>" + it.TerceroIdC
					}</p>
					${
						it.datosCliente
							? `<p class="m-b-0">Cliente: ${(
									it.datosCliente.TerceroID + ""
							  ).trim()} -  ${it.datosCliente.NombreTercero}</p>`
							: ""
					}
					<p class="m-b-0">${
						it.NombreHabitacion
							? "<b>Habitación: </b>" + it.NombreHabitacion
							: ""
					}</p>
					<p class="m-b-0">${nombreEvento}</p>
				</div>
				<button type="button" title="Ir a la cuenta" class="btn btn-sm btn-secondary" style="max-height: 75px; height: 75px;">
					<i class="fas fa-share-square"></i>
				</button>
			</div>`;
		});
		$("#cuentasPendienteMesa").html(estructura);
		$(".btnTerceroCuentaPendiente").on("click", function () {
			if (
				tipoVentaSeleccionado.PagoPendiente == "S" &&
				tipoVentaSeleccionado.vendedor != "S"
			) {
				alertify.alert(
					"¡Alerta!",
					'<h3 class="mensaje-alerta">No es posible continuar, el tipo de venta tiene pago pendiente y no solicita vendedor.</h3>'
				);
				return;
			}

			if ($TIPOCOMERC == "CLUB" && $(this).data("zona") != null) {
				alertify.warning(
					"El tercero tiene cuenta en las zonas: " + $(this).data("zona")
				);
			}
			if ($TIPOCOMERC == "CLUB" && $(this).data("mesa") != null) {
				alertify.warning(
					"El tercero tiene cuentas en las mesas: " + $(this).data("mesa")
				);
			}
			btnTerceroPendiente = true;
			cuentaTerceroConsumo = consumo.find(
				(op) => op.TerceroIdC == $(this).data("info")
			);

			ReservaAplicaDesayuno = cuentaTerceroConsumo.AplicaDesayuno;
			TieneDesayunoPendiente = cuentaTerceroConsumo.DesayunoPendiente;
			HeadReservaIdHotel = cuentaTerceroConsumo.HeadReservaHotel;
			reservaHotel = cuentaTerceroConsumo.ReservaHotel;
			habitacionHotel = cuentaTerceroConsumo.HabitacionId;
			EventoId =
				cuentaTerceroConsumo.EventoId == -1
					? null
					: cuentaTerceroConsumo.EventoId;
			$("#btnCuentaHotel, #AplicoDesayuno, #btnCuentaEvento").hide();
			if (cargarCuentaHotelPermiso && reservaHotel && reservaHotel != -1) {
				if (cuentaTerceroConsumo.reservaVigente) {
					$("#btnCuentaHotel").show();
				} else {
					reservaHotel = null;
				}
			}
			if (
				reservaHotel > 0 &&
				ReservaAplicaDesayuno == "S" &&
				TieneDesayunoPendiente == "N"
			) {
				$("#AplicoDesayuno").show();
			}

			if (
				cuentaTerceroConsumo.EventoId &&
				cuentaTerceroConsumo.EventoId != -1
			) {
				$("#btnCuentaEvento").show();
			}

			if ($TIPOCOMERC == "CLUB" && $(this).data("firma") != "S") {
				let elemento = $(this);
				alertify.confirm(
					"Alerta",
					"El socio no está autorizado para firmar, solo puede facturar de contado",
					function (evt, value) {
						let canAcciones = (cuentaTerceroConsumo.AccionesPedido || "").split(
							"-"
						);
						if (canAcciones.length > 1) {
							if (
								cuentaTerceroConsumo.CantAcciones > 1 &&
								!cuentaTerceroConsumo.IdReserva
							) {
								let acciones = [];
								canAcciones.forEach((op) => {
									let enc = cuentaTerceroConsumo.Acciones.find(
										(it) => it.AccionId.trim() == op.trim()
									);
									if (enc) acciones.push(enc);
								});
								modalaccionesTercero(acciones, elemento);
								return;
							}
						}
						accionTercero = elemento.data("accion");
						if (cuentaTerceroConsumo.datosCliente) {
							let tempData = Object.assign({}, cuentaTerceroConsumo);
							delete tempData.datosCliente;
							tempData.TerceroID = tempData.TerceroId;
							tempData.AccionId = accionTercero;
							terceroPedidoEmpresa = tempData;
						}
						seleccionTercero(elemento);
					},
					function () {}
				);
			} else {
				let canAcciones = (cuentaTerceroConsumo.AccionesPedido || "").split(
					"-"
				);
				if (canAcciones.length > 1) {
					if (
						cuentaTerceroConsumo.CantAcciones > 1 &&
						!cuentaTerceroConsumo.IdReserva
					) {
						let acciones = [];
						canAcciones.forEach((op) => {
							let enc = cuentaTerceroConsumo.Acciones.find(
								(it) => it.AccionId.trim() == op.trim()
							);
							if (enc) acciones.push(enc);
						});
						modalaccionesTercero(acciones, $(this));
						return;
					}
				}
				accionTercero =
					!canAcciones[0] || canAcciones[0] == "" ? null : canAcciones[0];
				codBarraTercero = cuentaTerceroConsumo["barra"] || "";
				$(".barraPedido").html(codBarraTercero);
				if (cuentaTerceroConsumo.datosCliente) {
					let tempData = Object.assign({}, cuentaTerceroConsumo);
					delete tempData.datosCliente;
					tempData.TerceroID = tempData.TerceroId;
					tempData.AccionId = accionTercero;
					terceroPedidoEmpresa = tempData;
				}
				seleccionTercero($(this));
			}
		});
	} else {
		$("#tituloCentasPendiente").hide();
	}
	$("#tercerosAccion, #tituloCentasPendiente").hide();
	$("#numeroAccion").val("");
	$("#btnCargarAccion").show();
	let mesa = mesasPlano.find((op) => op.MesaId == idMesaActual);
	if (mesa["TerceroReserva"]) {
		reservaActual = reservasActuales.find((op) => op.Id == mesa.IdReserva);
		if (mesa["EstadoReserva"] == "EM") {
			$("#numeroAccion").val(mesa["TerceroReserva"]);
			$("#btnBuscarTercero").click();
			$("#NumeroPersonas").val(mesa["PersonasReserva"]);
		} else {
			let fecha = moment(reservaActual["Inicio"]).subtract(
				zonaMesaActual["TiempoAntesReserva"],
				"minutes"
			);
			let fecha2 = moment(reservaActual["Inicio"]).add(
				zonaMesaActual["TiempoEsperaReserva"],
				"minutes"
			);
			if (mesa.Consumo > 0) {
				$("#btnCargarAccion").hide();
			} else if (
				fecha.isBefore(moment()) &&
				moment(reservaActual["Inicio"]).isAfter(moment())
			) {
				alertify.warning(
					`La mesa ${mesa["MesaId"]} tiene una reserva a las ${reservaActual["Hora"]}.`
				);
				return;
			} else if (moment().isBetween(moment(reservaActual["Inicio"]), fecha2)) {
				alertify.warning(
					`La mesa ${mesa["MesaId"]} tiene una reserva pendiente.`
				);
				return;
			}
		}
	}
	if (tipoVentaSeleccionado.manejclien == "N") {
		if (tipoVentaSeleccionado.tercero[0]) {
			tercerosAccion = tipoVentaSeleccionado.tercero;
			terceroIdPedido = tipoVentaSeleccionado.tercero[0].TerceroID;
			accionTercero = tipoVentaSeleccionado.tercero[0].AccionId || "";

			/* Se valida para cuando no maneja cliente y tiene consumos pendiente abrir modal de tercero */
			if (consumo.length) {
				if (consumo.length == 1 && terceroIdPedido == consumo[0].TerceroIdC) {
					$(".clientePedido").html(tipoVentaSeleccionado.tercero[0].Nombre);
					$(".accionIdPedido").html(accionTercero);
					validarVendedor();
				} else {
					abrirCerrarModal(".bd-accion-modal-sm", "show");
					$("#numeroAccion").val(terceroIdPedido);
					$("#btnBuscarTercero").click();
					setTimeout(() => {
						$("#numeroAccion, #btnBuscarTercero").prop("disabled", true);
						$(".btnTerceroCuentaPendiente")[0].click();
					}, 150);
				}
			} else {
				$(".clientePedido").html(tipoVentaSeleccionado.tercero[0].Nombre);
				$(".accionIdPedido").html(accionTercero);
				validarVendedor();
			}
		} else {
			alertify.error("No se encontro tercero por defecto para la venta");
		}
	} else {
		abrirCerrarModal(".bd-accion-modal-sm", "show");
	}
	$("#btnVerCuentasPendientes").hide();
}

function seleccionTercero($this) {
	terceroIdPedido = $this.data("info");
	columnaBusquedaTercero = "TerceroID";
	if ($this.data("mesa") == null) {
		let nombre = $this.data("nombre");
		$(".clientePedido").html(nombre);
		$(".accionIdPedido").html(accionTercero || "");
		$(".documentoPedido").html(terceroIdPedido || "");
		$(".habitacionPedido").html($this.data("habitacion") || "");
		$(".eventoPedido").html($this.data("evento") || "");
		validarVendedor();
	} else {
		let mesitas = $this.data("mesa");
		let mesasFun =
			typeof mesitas == "string"
				? mesitas.split(" ").join("").split("-")
				: [mesitas + ""];
		let nombre = $this.data("nombre");
		if ($TIPOCOMERC == "CLUB" && accionPos == "pedido_mesa") {
			if ($DATOSMONTAJE.FactConAbier == "S") {
				$(".clientePedido").html(nombre);
				$(".accionIdPedido").html(accionTercero || "");
				validarVendedor();
			} else {
				setTimeout(() => {
					alertify.confirm(
						"Alerta",
						`El tercero tiene cuentas en la(s) mesa(s) ${$this.data(
							"mesa"
						)}, ¿Desea unificar con la mesa ${idMesaActual}?`,
						function (ok) {
							$(".clientePedido").html(nombre);
							$(".accionIdPedido").html(accionTercero || "");
							let data = {
								mesaOriginal: idMesaActual,
								mesasModificar: mesasFun,
								tercero: terceroIdPedido,
								edicion: 0,
								accion: accionTercero,
							};
							obtenerInformacion(
								data,
								"unificarMesasTercero",
								"validarVendedor"
							);
						},
						function (err) {
							$("#zonaMesa").change();
							terceroIdPedido = null;
							accionTercero = null;
							abrirCerrarModal(".bd-accion-modal-sm", "hide");
						}
					);
				}, 50);
			}
		} else {
			$(".clientePedido").html(nombre);
			$(".accionIdPedido").html(accionTercero || "");
			validarVendedor();
		}
	}
}

function limpiarVariables() {
	$(
		"#btnCargarACuenta, #btnFacturarPedido, #btnBorrarPedido, #btnDarDeBajaCuenta, #btnCambiarSocio"
	).show();
	arrayProductosPedido = [];
	$("input[name=Termino]").removeAttr("required");
	let tempTercero = terceroIdPedido;
	let tempAccionTercero = accionTercero;
	accionTercero = null;
	if (accesoCargarCuentaHotel && accionPos == "general") {
		$("#numeroAccion").val(terceroIdPedido);
		$("#btnBuscarTercero").click();
		$("#NumeroPersonas").val("1");
	} else {
		terceroIdPedido = null;
		accionTercero = null;
	}
	ocultarInforFlotante();
	$(".formBuscarProductos").hide();
	$("#productosMenu").empty();
	$("#tercerosAccion, #btnCambiarZona").hide();
	$(".btn-Reservas").show();
	if (
		($INFOALMACEN["ManejaMesas"] != "S" && $ZONAS.length) ||
		accionPos == "general"
	) {
		if (accionPos == "general") {
			terceroIdPedido = tempTercero;
			accionTercero = tempAccionTercero;
			informacionMesa();
		}
	} else {
		cambiarTab("#tabMesas");
	}
	$("#zonaMesa").change();
	$("#numeroAccion").val("");
	if ($("#collapseTercero.show")[0]) {
		$("#btnCollapse").click();
	}
	$("#NumeroPersonas").val("");
	numeroPersonasPedido = 1;
	tercerosAccion = null;
	btnAgregarCuentaTercero = false;
}

function agregarMesas({ datos, reservas }) {
	$(".contenedor-imagen-mesas").css(
		"background-image",
		"url('" + zonaMesaActual.Imagen + "')"
	);
	$(".divMesa").empty();
	mesasPlano = datos;
	datos.forEach((element) => {
		$(".divMesa").append(`
			<div class="mesaId mesaPopo${element.MesaId}" style="
				border-radius: 5px;
				cursor:pointer;
				color: ${
					element["ColorMesa"] == "Verde" ||
					element["ColorMesa"] == "Rojo" ||
					element["ColorMesa"] == "Azul"
						? "#ffffff"
						: "#000000"
				};
				text-align: center;
				background-color: ${coloresMesa[element["ColorMesa"]].color};
				position:absolute;
				font-size: 13px;
				white-space: nowrap;
				font-weight: 800;
				user-select: none;
				left:${element.PosX - element.Ancho / 2}px;
				top:${element.PosY - element.Alto / 2}px;
				height: ${element.Alto}px;
				width: ${element.Ancho}px;"
				data-mesa="${element.MesaId}"
				data-ocupada="${element.Consumo}"
				data-personas="${element["MaximoPersonas"]}"
				tabindex="0" role="button" title="Detalle Mesa" data-trigger="focus" data-content="${
					element["MaximoPersonas"]
						? `Maximo ${element["MaximoPersonas"]} personas`
						: "No tiene cantidad de personas registradas"
				}">
				${element.MesaId}
			</div>
		`);
	});
	$('[data-toggle="popover"]').popover();
	$(".mesaId").on("click", function () {
		let elemento = $(this);
		setTimeout(() => {
			if (cambiarMesas || unificarMesas) {
				let mesa = datos.find((it) => it.MesaId == elemento.data("mesa"));
				if (!mesaUno) {
					if (mesa.Consumo > 0) {
						mesaUno = mesa;
						let mensaje = cambiarMesas
							? "Seleccione la nueva mesa"
							: "Seleccione la mesa con la cual desea unificar";
						$("#texto-boton-mesa").text(mensaje);
					} else {
						alertify.warning("Seleccione una mesa ocupada");
					}
				} else {
					mesaDos = mesa;
					if (mesaUno["MesaId"] == mesaDos["MesaId"]) {
						alertify.warning("No puede seleccionar la misma mesa");
						return;
					}
					if (mesa.Consumo < 1 && unificarMesas) {
						alertify.warning("Las dos mesas deben tener cuentas pendientes.");
						return;
					}
				}
				if (mesaUno && mesaDos) {
					$("#inputPersonasCambioMesa").hide();
					if (cambiarMesas) {
						/* Codigo para cambiar consumo de una mesa a otra */
						obtenerInformacion(
							{ mesa: mesaUno["MesaId"], cambio: true },
							"informacionUnificarCambioMesas",
							"infoCambioMesas"
						);
					} else {
						/* Codigo para unificarMesas del plano */
						if (mesaUno.Consumo > 1) {
							obtenerInformacion(
								{ mesa: mesaUno["MesaId"] },
								"informacionUnificarCambioMesas",
								"infoUnificarMesas"
							);
						} else {
							alertify.confirm(
								"Alerta",
								`¿Esta seguro de pasar la mesa ${mesaUno["MesaId"]} a la mesa ${mesaDos["MesaId"]}?`,
								function (ok) {
									let data = {
										mesaSalida: mesaUno["MesaId"],
										mesaEntrada: mesaDos["MesaId"],
									};
									actualizarConsumoMesas(data, "#btnCancelarUnificarMesa");
								},
								function (err) {
									$("#btnCancelarUnificarMesa").click();
									console.log("Error ", err);
								}
							);
						}
					}
				}
			} else {
				$(".btnFiltroeBuscar[data-botonsearch=tercero]").click();
				$("#dataTercero").html("");
				$(".totalCuentaActual").text("$0.00");
				if ($("#collapseTercero.show")[0]) {
					$("#btnCollapse").click();
				}
				$(".card-tipo-comida")
					.children()
					.children("div")
					.removeClass("producto-seleccionado");
				$("input[name=Termino]").removeAttr("required");
				$(".mesaId").removeClass("mesa-seleccionada");
				elemento.addClass("mesa-seleccionada");
				idMesaActual = $(".mesaId.mesa-seleccionada").data("mesa");
				let data = {
					mesa: idMesaActual,
					zona: zonaMesaActual["ZonaId"],
					almacen: $INFOALMACEN["almacenid"],
					fechaActual: moment().toDate(),
					sede: $INFOALMACEN["SedeId"],
					ingreso: $INFOALMACEN["VerificarIngreso"],
					fecha: moment().format(frmtFech),
				};
				$("#NumeroPersonas").attr(
					"max",
					$(".mesaId.mesa-seleccionada").data("personas")
				);
				$(".titulo-data-mesa").text(elemento.data("content"));
				btnTerceroPendiente = false;
				terceroPedidoEmpresa = {};
				$(".empresa-datos").html(``);
				obtenerInformacion(data, "terceroCuentaPendiente", "cuentaPendiente");
			}
		}, 10);
	});
	if (reservas.length) {
		reservasActuales = reservas;
		$("#lista-reservas").parent().show();
		$("#valReserva").keyup();
	} else {
		$("#lista-reservas").html(
			'<div class="text-center">No hay reservas disponibles</div>'
		);
		$("#lista-reservas-superadas").html(
			'<div class="text-center">No hay reservas disponibles</div>'
		);
	}
}

function recargarPlano() {
	if (accionPos != "general") {
		setInterval(() => {
			if (accionPos != "general" && $("#tabMesas").is(":visible")) {
				$("#zonaMesa").change();
			}
		}, 180000);
	}
}

$(document).on("click", "#btnverMesa", function () {
	abrirPlano(
		base_url() +
			"Plano/mesas/" +
			Nitmesa +
			"/" +
			$INFOALMACEN.almacenid.trim() +
			"/" +
			$INFOALMACEN.ZonaMesaId
	);
});

function abrirPlano(url, evento = "onunload") {
	var winPrint = window.open(url);
	if (navigator.userAgent.toLocaleLowerCase().indexOf("chrome") > -1) {
		winPrint[evento] = function (e) {
			e.preventDefault();
			setTimeout(() => {
				let win = window.open(base_url(), "_blank");
				win.close();
			}, 10);
		};
	}
}

function mesasUnificadasTercero(resp) {
	$("#btnUnificarMesasTercero").click();
	$("#btnOtrasCuentasTercero").click();
}

function infoUnificarMesas({ datos }) {
	$("#listaTercerosConsumo").html(``);
	datos.forEach((it, index) => {
		let tercero = ("" + it.TerceroIdC).trim();
		$("#listaTercerosConsumo")
			.append(`<div class="text-left col-12 px-0 d-flex justify-content-between mt-2 align-items-center">
			<p class="m-0 font-weight-600 w-100">
				<span class="text-primary">${it.nombre}</span>
				${
					it.AccionId
						? `<span class="text-primary" title="Accion"> - ${it.AccionId}</span>`
						: ""
				}
			</p>
			<div class="form-group">
				<div class="custom-control custom-switch">
					<input type="checkbox" class="custom-control-input" data-user="${
						it.AccionId
					}" data-infomesa="${tercero}" name="Est${
			tercero + ("" + index)
		}" id="Est${tercero + ("" + index)}">
					<label class="custom-control-label" for="Est${tercero + ("" + index)}"></label>
				</div>
			</div>
		</div>`);
	});
	abrirCerrarModal(".modal-unificar-mesa", "show");
}

function infoCambioMesas({ datos }) {
	$("#listaTercerosConsumo").html(``);
	datos.forEach((it, index) => {
		let productos = "";
		let ids = [];
		let tercero = ("" + it.TerceroId).split(" ").join("");
		it.productos.forEach((op) => {
			ids.push(op.productoid + op.Id);
			productos += `<div class="col-3 p-1">
				<div class="card mb-1 h-100" style="box-shadow: none !important;">
					<div class="card-body p-1 card-comida-cambio" data-checkpadre="${
						tercero + index
					}" data-consumo="${op.Id}" id="${
				op.productoid + op.Id
			}" data-check="false" style="border:2px solid #b2b9be; cursor:pointer; border-radius: 5px;">
						<div class="container-item text-center" style="font-size: 12px; text-overflow: ellipsis; white-space: break-spaces;overflow: hidden;">${
							op.nombre
						}</div>
					</div>
				</div>
			</div>`;
		});
		$("#listaTercerosConsumo")
			.append(`<div class="text-left col-12 px-0 mt-2 align-items-center">
			<div class="d-flex justify-content-between">
				<p class="m-0 font-weight-600 w-100" style="cursor: pointer;" data-toggle="collapse" data-target="#collapseEje${index}"  aria-controls="collapseEje${index}" aria-expanded="false">
					<span class="text-primary">${it.nombre}</span>
					${
						it.AccionId
							? `<span class="text-primary" title="Accion"> - ${it.AccionId}</span>`
							: ""
					}
				</p>
				<div class="form-group">
					<div class="custom-control custom-switch">
						<input type="checkbox" class="custom-control-input checkpadre" data-terc="${tercero}" data-consu='${JSON.stringify(
			ids
		)}' name="${tercero + index}" id="${tercero + index}">
						<label class="custom-control-label" for="${tercero + index}"></label>
					</div>
				</div>
			</div>
			<div class="collapse" id="collapseEje${index}">
				<div class="card-body row p-0 m-0">${productos}</div>
			</div>
		</div>`);
	});
	$(".checkpadre").change(function () {
		let valor = $(this).prop("checked");
		$.each($(this).data("consu"), function (pos, it) {
			$("#" + it).css("border", "2px solid " + (valor ? "#3fff00" : "#b2b9be"));
			$("#" + it).data("check", valor);
		});
	});
	$(".card-comida-cambio").click(function () {
		let padre = "#" + $(this).data("checkpadre");
		let valor = !$(this).data("check");
		$(this).css("border", "2px solid " + (valor ? "#3fff00" : "#b2b9be"));
		$(this).data("check", valor);
		if (valor) {
			let checks = $(padre).data("consu");
			$(padre).prop("checked", valor);
			checks.forEach((it) => {
				if (!$("#" + it).data("check")) $(padre).prop("checked", false);
			});
		} else {
			$(padre).prop("checked", false);
		}
	});
	$("#inputPersonasCambioMesa").show();
	abrirCerrarModal(".modal-unificar-mesa", "show");
}

function organizarDataConsumo(array, tercero, filterNuevo = true) {
	let copiaDatos = array;
	if (filterNuevo) {
		copiaDatos = array.filter((ite) => {
			if (ite.nuevo === true && !ite.pendiente && cargarCuentaPendiente) {
				return ite;
			} else if (ite.nuevo && !cargarCuentaPendiente) {
				return ite;
			}
		});
	}

	let datosGuardar = [];
	let validPromo = copiaDatos.findIndex((te) => te.PromoProdu);
	let lineaPromo = 0;

	copiaDatos.forEach((op) => {
		let tipos = {};
		/* Construimos la observacion del pedido */
		(op.inventario || []).forEach((inv) => {
			if (inv.Tipo && inv.Tipo != " ") {
				let tipo = inv.Tipo == "F" ? "Sin" : inv.Tipo;
				if (
					(inv.Tipo == "F" && !inv.elegido) ||
					(inv.Tipo == "V" && inv.elegido) ||
					(inv.Tipo == "O" && inv.elegido)
				) {
					tipos[tipo] =
						(tipos[tipo] ? tipos[tipo] + ", " : " _" + tipo + "_:") +
						" " +
						inv.nombre;
				}
			}
		});

		if (op.Observacio != "") {
			op.Observacio =
				op.Observacio.includes("Sin:") ||
				op.Observacio.includes("V:") ||
				op.Observacio.includes("O:")
					? ""
					: op.Observacio;
		}
		Object.keys(tipos).forEach((it) => (op.Observacio += tipos[it]));

		if (op.Observacio != "" && op.Observacio.length > 254) {
			op.Observacio = op.Observacio.slice(0, 254);
		}

		if (validPromo != -1 && !op.ProdPromo) {
			lineaPromo++;
		}

		let Descuento = +op.PromoDescuen || 0;
		let Valor =
			(op.valorUnitario ? +op.valorUnitario : +op.Valor) * op.Cantidad;

		if (accesoCargarCuentaHotel && !filterNuevo && op.Id > 0) {
			Valor = (+op.Valor / op.Cantidad) * op.Cantidad;
		}

		let habitacionTemp = !op.HabitacionId ? null : op.HabitacionId;

		if (reactivarConsumo && accesoCargarCuentaHotel) {
			op.ReservaHotel = reservaHotel;
			habitacionTemp = habitacionHotel;
		}
		let datos = {
			Allevar: !op.allevar ? 0 : 1,
			AlmacenId: $INFOALMACEN["almacenid"],
			AlmacenIdI: op.AlmacenInventario,
			AccionId: !op.AccionId ? (!op.Accion ? null : op.Accion) : op.AccionId,
			Cantidad: op.Cantidad,
			ConAccion: !pedidoSinAccion,
			ConsuProdPadre: op.ProdPadreVenta || null,
			CostoDescu: op.costodescu,
			costoprome: op.costoprome || 0,
			Desayuno: op.Desayuno || null,
			DescuPieFa: 0,
			DescuProdu: Descuento,
			Descuento: Descuento,
			estructuraInventario: op.estructura,
			FechaConsu: op.FechaConsu
				? moment(op.FechaConsu).format("YYYY-MM-DD HH:mm:ss")
				: null,
			headprodid: op.headprodid,
			HeadReservaIdHotel: op.HeadReservaIdHotel || null,
			IdConsumo: op.Id ? op.Id : null,
			Inventario: op.inventario || [],
			inventaMes: op.inventames,
			IvaId: op.ivaid,
			IvaDescuen: (op.ivaid / 100) * Descuento,
			LineaPromo: !op.ProdPromo && lineaPromo > 0 ? lineaPromo : 0,
			LineaPadre: op.ProdPromo && lineaPromo > 0 ? lineaPromo : 0,
			ListaPreci: op.ListaPrecio,
			MesaId: idMesaActual ? idMesaActual : null,
			Observacio: op.Observacio,
			ObservacioDevol: op.ObservacioDevol ? op.ObservacioDevol : "",
			pendiente: op.pendiente ? true : false,
			Personas: op.Personas ? op.Personas : 1,
			ProductoId: op.ProductoId,
			PorceDescu: op.PromoPorce || 0,
			PorceDescP: op.PromoPorce || 0,
			ProdPromo: op.ProdPromo ? op.ProdPromo : null,
			PromoProdu: op.PromoProdu || "",
			TipoPromId: op.PromocionId != "" ? op.PromocionId : "",
			PreciPubli: op.valorUnitario ? op.valorUnitario : op.Valor,
			PuestoMesa: op.PuestoMesa ? op.PuestoMesa : null,
			ReservaId: reservaActual && reservaActual.Id ? reservaActual.Id : null,
			ReservaHotel:
				accesoCargarCuentaHotel && op.ReservaHotel
					? op.ReservaHotel
					: !reservaHotel || reservaHotel == -1 || filterNuevo
					? null
					: reservaHotel,
			Termino: op.Termino ? op.Termino : "",
			TerceroId:
				op.terceroEmpresa && op.terceroEmpresa != "0"
					? (op.terceroEmpresa + "").trim()
					: tercero,
			TerceroIdC: tercero,
			TipoCartId: op.TipoCarteraId,
			tipodevol: op.tipodevol ? op.tipodevol : null,
			tipoVenta: tipoVentaSeleccionado.CodigEstru || null,
			VendedorId: op.nuevo
				? vendedorElegido || null
				: op.VendedorId
				? op.VendedorId
				: null,
			HabitacionId:
				accesoCargarCuentaHotel && op.ReservaHotel
					? habitacionTemp
					: !reservaHotel || reservaHotel == -1 || filterNuevo
					? btnCargarCuentaClick && filterNuevo
						? habitacionTemp
						: null
					: habitacionTemp,
			EventoId: op.EventoId != EventoId ? EventoId : op.EventoId,
		};
		let ivan = 0;
		if ($DATOSMONTAJE["PreciAnIva"] != "S") {
			ivan = ((Valor / (1 + op.ivaid / 100)) * op.ivaid) / 100;
		} else {
			ivan = (Valor * op.ivaid) / 100;
			Valor = Valor + ivan;
		}
		datos["Iva"] = ivan;
		datos["Valor"] = Valor;
		if (op.Id) {
			datos["ConsumoId"] = op.ConsumoId;
			datos["Id"] = op.Id;
			datos["AccionId"] = op.AccionId ? op.AccionId : null;
			datos["headprodid"] = op.headprodid;
			datos["Imprime"] = op.Imprime;
			datos["Despachado"] = op.Despachado;
			datos["Entregado"] = op.Entregado;
		} else {
			if (
				!(
					array[0] &&
					array[0]["Imprime"] == "S" &&
					array[0]["Despachado"] == "S" &&
					array[0]["Entregado"] == 1 &&
					array[0]["HoraDespacho"] == null
				)
			) {
				datos["Imprime"] = "";
				datos["Despachado"] = "";
				datos["Entregado"] = null;
			}
		}

		datosGuardar.push(datos);

		if (
			(op.AplicaFamilia =
				"S" && op.ProductosFamilia && op.ProductosFamilia.length)
		) {
			op.ProductosFamilia = op.ProductosFamilia.map((tem) => {
				tem.pendiente = op.pendiente;
				tem.HabitacionId = datos.HabitacionId;
				tem.HeadReservaIdHotel = datos.HeadReservaIdHotel;
				return tem;
			});
			datosGuardar = datosGuardar.concat(
				organizarDataConsumo(op.ProductosFamilia, tercero, filterNuevo)
			);
		}
	});
	return datosGuardar;
}

function obtenerInformacion(data, metodoBack, funcion) {
	data = $.Encriptar(data);
	$.ajax({
		url: rutaGeneral + metodoBack,
		type: "POST",
		data: {
			encriptado: data,
			accionPos,
			imprimirDevolucionConsumo,
		},
		dataType: "json",
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (funcion == "clickMesa" && resp.subgrupo == "N") {
				$("#lista-tipo-comidas").empty();
			}
			if (metodoBack == "validarUsuario") {
				$("#formDataAdmin")[0].reset();
				$("#formDataAdmin :input").removeClass("is-invalid");
				$("#formDataAdmin").validate().resetForm();
			}
			consultadonAccion = false;
			if (resp.valido && funcion) {
				if (metodoBack == "unificarMesasTercero") {
					alertify.success(resp.mensaje);
				}
				this[funcion](resp);
			} else if (!resp.valido) {
				if (funcion == "clickTipoMenu") {
					$("#productosMenu").empty();
				}
				if (metodoBack == "obtenerAccion" || funcion == "informacionAccion") {
					if ($("#collapseTercero.show")[0]) {
						$("#btnCollapse").click();
					}
					$("#desayunoHabitacion").html("");
					//validacion para la creacion de tercero al momento de bvuscar y de cumplir las condiciones si no hace el proceso igual que siempre
					if (
						(tipoVentaSeleccionado.manejclien == "S" && CrearTercero) ||
						botonCambiarCuenta == 1
					) {
						if ($("#numeroAccion").val().length > 4) {
							$(".bd-accion-modal-sm").hide();
							const paneles = ["DatosPrincipales", "DireccionResidencia"];
							let exigeD = "N";
							if (
								tipoVentaSeleccionado.manejclien == "S" &&
								tipoVentaSeleccionado.ExigeDatos == "S"
							) {
								exigeD = "S";
							}
							terceroComponent({
								tercero: $("#numeroAccion").val(),
								tipoTercero: "EsCliente",
								modulo: "modalClientes",
								paneles: paneles,
								exigeD: exigeD,
							})
								.then((res) => {
									$(".bd-accion-modal-sm").show();
									const datosNuevosPersonales = res.data.contentDatosPersonales;
									$("#numeroAccion").val(datosNuevosPersonales.TerceroID);
									$("#btnBuscarTercero").prop("disabled", false);
									$("#btnBuscarTercero").click();
								})
								.catch((error) => {
									$(".bd-accion-modal-sm").show();
									$("#numeroAccion").val("");
									$("#btnBuscarTercero").prop("disabled", false);
								});
						} else {
							alertify.warning(
								"El documento diligenciado debe ser mayor a 4 caracteres"
							);
							$("#btnBuscarTercero").prop("disabled", false);
							return false;
						}
					}
				}
				if (metodoBack == "validarPassSocio") {
					setTimeout(() => {
						$("#btnConfirmarConsumo").click();
					}, 100);
				}
				if (metodoBack == "obtenerProductos") {
					valorBuscarProducto = "";
				}
				if (metodoBack == "obtenerMesas") {
					$(".contenedor-imagen-mesas").css("background-image", "none");
					$(".divMesa").html(
						"<strong>La zona no tiene plano configurado...</strong>"
					);
				}
				if (metodoBack == "agregarCuenta") {
					accesoCargarCuentaHotel = false;
				}
				alertify.error(resp.mensaje);
			}
		},
	});
}

function informacionMesa(mesa = "") {
	if (!$INFOALMACEN["TipoMenuId"]) {
		return alertify.error("Este almacen no tiene tipo de menú");
	}
	if (mesa != "") {
		if (mesasDesc == null) {
			$(".mesaPedido").html(mesa);
		} else {
			$(".mesaPedido").html(mesasDesc);
		}
	}
	obtenerGruposMenu(mesa);
	if ($INFOALMACEN["ManejaMesas"] == "S" && accionPos != "general") {
		$("#btnCambiarZona").show();
		$(".reservas-mesa").hide();
	}
}

function obtenerGruposMenu(mesa, subgrupoMenu = "N") {
	let data = {
		tipoMenu: $INFOALMACEN["TipoMenuId"],
		almacenid: $INFOALMACEN["almacenid"],
		tipoVenta: tipoVentaSeleccionado.CodigEstru || null,
		mesaId: mesa,
		tercero: terceroIdPedido,
		diaSemana: obtenerDiaSemana(),
		zona: zonaMesaActual["ZonaId"] || "",
		rastreoAbreCenta: accionPos == "general" ? rastreoAbreCenta : true,
		AlmacenNoFisico: $INFOALMACEN.NoFisico,
		soloDesayuno: tercerosDesayuno.length > 0 ? 1 : 0,
		headReservaHotel: tercerosDesayuno.length > 0 ? HeadReservaIdHotel : 0,
		subgrupo: subgrupoMenu,
		accesoCargarCuentaHotel: accesoCargarCuentaHotel ? 1 : 0,
		terceroEmpresa:
			terceroPedidoEmpresa && terceroPedidoEmpresa.TerceroID
				? ("" + terceroPedidoEmpresa.TerceroID).trim()
				: null,
	};
	if (accionTercero) {
		data["accion"] = accionTercero;
	}

	validarBtnFacturaElectronica();
	obtenerInformacion(data, "obtenerGrupoMenu", "clickMesa");

	//Validamos para cuando sea de cargue desayuno recargue los productos cargados
	if (accesoCargarCuentaHotel) {
		sincronizarConsumo();
	}
}

function productosBusqueda(resp) {
	$("#productosMenuBusqueda").html(resp);
	valorBuscarProducto = "";
	abrirCerrarModal("#BusquedaProducto", "show");
}

function clickMesa({ datos, consumo, montaje, subgrupo }) {
	$(".popover").popover("hide");
	$DATOSMONTAJE = montaje;
	fontProds = "";
	baseHeight = 100;
	if (
		localStorage.getItem("fontProds") != null &&
		localStorage.getItem("fontProds") > 12
	) {
		fontProds = `font-size: ${localStorage.getItem("fontProds")}px;`;
		alto = localStorage.getItem("fontProds") - 12;
		alto = alto * 1.2;
		baseHeight += alto;
	}

	if (
		localStorage.getItem("boldLetraProds") != null &&
		localStorage.getItem("boldLetraProds") != "N"
	) {
		fontProds +=
			localStorage.getItem("boldLetraProds") == "S"
				? " font-weight: bold;"
				: "";
	}

	if (subgrupo == "N") {
		$(".linea-subgrupos").hide();
		datos.forEach((op) => {
			$("#lista-tipo-comidas")
				.append(`<div class="col-4 col-md-3 col-sm-4 col-lg-2 col-xl-2 card-tipo-comida px-1 mb-2" data-grupo="${
				op.GrupoId
			}" style="cursor:pointer; height: ${baseHeight}px; max-height: ${baseHeight}px;" title="${
				op.Nombre
			}">
				<div class="card mb-1 h-100" style="box-shadow: none !important;">
					<div class="card-body px-1 py-1" style="border:1px solid #b2b9be;">
						<div class="d-flex flex-column align-items-center justify-content-center h-100" ${
							!op.Imagen ? `style="background-color: #${op.Color};"` : ""
						}>
							${
								op.Imagen
									? `<img src="${op.Imagen}" style="width:auto; height: 75%; border-radius: 3px;max-width: 100%;">`
									: ""
							}
							<p class="fontProds text-center ${
								op.Imagen ? "text-truncate m-0" : "m-2"
							}" style="${
				op.Imagen ? "width: 95%; height: 25%;" : ""
			} ${fontProds}">${op.Nombre}</p>
						</div>
						
					</div>
				</div>
			</div>`);
		});
		$(".btn-Reservas").hide();
		$(".card-tipo-comida").on("click", function () {
			if ($DATOSMONTAJE["LimitarBusqueda"] != "N") {
				$(".formBuscarProductos").show();
			}
			$(".card-tipo-comida").removeClass("tipo-comida-seleccionado");
			$(this).addClass("tipo-comida-seleccionado");
			valorBuscarProducto = "";
			$("#valProducto").val("");
			$(".card-tipo-comida")
				.children()
				.children("div")
				.removeClass("producto-seleccionado");
			$(this).children().children("div").addClass("producto-seleccionado");
			if (!terceroIdPedido || !vendedorElegido) {
				if (!terceroIdPedido) {
					abrirCerrarModal(".bd-accion-modal-sm", "show");
					return alertify.warning("No hay persona identificada para el pedido");
				} else {
					if (accesoCargarCuentaHotel && tercerosAccion.length) {
						abrirCerrarModal(".bd-accion-modal-sm", "show");
						$("#numeroAccion").val(terceroIdPedido);
						return alertify.warning(
							"No hay persona identificada para el pedido"
						);
					} else {
						if (
							tipoVentaSeleccionado.vendedor &&
							tipoVentaSeleccionado.vendedor == "S"
						) {
							validarVendedor();
							return;
						}
					}
				}
			}

			/* Se limpia para reiniciar las migas de pan */
			$(".linea-subgrupos").hide();
			lineaTiempoSubGrupos = [];

			let data = {
				grupoId: $(this).data("grupo"),
			};
			obtenerProducsdDelMenu("clickTipoMenu", data);
		});
		if (!$POST) {
			if (permisoAccionActual == 2594) {
				arrayProductosPedido = consumo.concat(
					arrayProductosPedido.filter((it) => it.nuevo && !it.pendiente)
				);
			} else {
				arrayProductosPedido = consumo;
			}
		} else {
			$POST = false;
			if (consumo.length) {
				numeroPersonasPedido = consumo[consumo.length - 1].Personas
					? consumo[consumo.length - 1].Personas
					: 1;
			} else {
				numeroPersonasPedido = 1;
			}
			arrayProductosPedido = consumo;
		}
		if (arrayProductosPedido.length > 0 && consumo.length > 0) {
			if (terceroIdPedido) {
				organizarAcumulado();
				$(".btn-floating").show();
			}
			if (btnTerceroPendiente) {
				numeroPersonasPedido = consumo[consumo.length - 1].Personas
					? consumo[consumo.length - 1].Personas
					: 1;
			}
			let maxPer = $(".mesaId.mesa-seleccionada").data("personas")
				? $(".mesaId.mesa-seleccionada").data("personas")
				: null;
			$("#cantPersonas")
				.html(`<input type="number" name="NumPerEditar" class="form-control form-control-floating" style="color: #ffffff;" placeholder="Número de personas" id="NumPerEditar" data-campodb="Personas" value="${numeroPersonasPedido}" max="${maxPer}" min="1" required>
			`);
			accionCamposPedido();
		} else {
			$(".totalCuentaActual").text("$0.00");
			ocultarInforFlotante();
		}
		$(".formBuscarProductos").hide();
		$("#productosMenu").empty();
		cambiarTab("#tabCategorias");
		$(".formBuscarProductos").show();
		abrirCerrarModal(".modal-cuentas-pendientes", "hide");
		if (
			!desdeFactura &&
			(!datosTerceroReactivar ||
				(datosTerceroReactivar && !datosTerceroReactivar.TerceroID))
		) {
			validarConsumoReactivado();
		}
	} else {
		if (datos.length) {
			obtenerProducsdDelMenu("clickTipoMenu", { grupoId: datos[0].GrupoId });
			lineaTiempoSubGrupos.push(datos[0]);
			organizarSubGruposLineaTiempo(datos[0]);
		} else {
			alertify.warning("No se encontro subgrupo asociado");
		}
	}
}

function organizarSubGruposLineaTiempo(eliminar = -1) {
	let estructura = "";
	if (eliminar > -1) {
		lineaTiempoSubGrupos.splice(eliminar);
	}
	lineaTiempoSubGrupos.forEach((it, pos) => {
		estructura += `<li class="breadcrumb-item item-subgrupo" data-grupo="${
			it.GrupoId
		}" data-pos="${pos + 1}">
			<a href="#">${it.Nombre}</a>
		</li>`;
	});
	$(".linea-subgrupos")
		.html(`<ol class="breadcrumb mb-1">${estructura}</ol>`)
		.show();
	$(".item-subgrupo").on("click", function () {
		let data = $(this).data();
		organizarSubGruposLineaTiempo(data.pos);
		obtenerProducsdDelMenu("clickTipoMenu", { grupoId: data.grupo });
	});
}

function obtenerProducsdDelMenu(funcionRetorno, dataExtra = {}) {
	let data = {
		almacen: $INFOALMACEN["almacenid"],
		tercero: terceroIdPedido,
		lista: tipoVentaSeleccionado.precio || null,
		tipoVenta: tipoVentaSeleccionado.CodigEstru || null,
		codiVentId: tipoVentaSeleccionado.codiventid || null,
		tipoMenu: $INFOALMACEN["TipoMenuId"],
		soloDesayuno: tercerosDesayuno.length > 0 ? 1 : 0,
		headReservaHotel: tercerosDesayuno.length > 0 ? HeadReservaIdHotel : 0,
	};
	obtenerInformacion(
		{ ...data, ...dataExtra },
		"obtenerProductos",
		funcionRetorno
	);
}

function accionCamposPedido() {
	$("#NumPerEditar")
		.unbind()
		.change(function () {
			if ($("#formPedido").valid()) {
				let data = {
					tercero: terceroIdPedido,
					mesa: idMesaActual || null,
					campo: $(this).data("campodb"),
					valorCampo: $(this).val(),
				};
				obtenerInformacion(data, "actualizarDatosPedido", "infoPedido");
			}
		});
}

function infoPedido(resp) {
	alertify.success(resp.mensaje);
	if (resp.campo == "Personas") {
		numeroPersonasPedido = resp.valorCampo;
		$("#NumeroPersonas").val(resp.valorCampo);
		arrayProductosPedido.forEach((it) => {
			it.Personas = numeroPersonasPedido;
		});
	}
}

function configColoresMesa() {
	let estructura = "";
	Object.keys(coloresMesa).forEach((it) => {
		estructura += `<div class="col-12">
			<span class="btn btn-sm btn-outline-secondary mr-1 btnEstado ${it}"></span>
			<span class="mr-3">${coloresMesa[it].titulo}</span>
		</div>`;
	});
	$("#btnEstadoColores").attr("data-content", estructura);
}

function dataMesasTercero({ datos }) {
	let dataMesas = datos;
	$("#contenidoModalCuentatercero").html("");
	$("#content-select").show();
	if (dataMesas.length) {
		$("#mesasUnificar").html('<option value="" selected>Todos</option>');
		let tabs = `<ul class="nav nav-tabs lined" id="tabModal" role="tablist">`;
		let contenidos = `<div class="tab-content pt-2" id="tabModalContent">`;
		let optionsChosen = ``;
		dataMesas.forEach((item, pos) => {
			tabs += `<li class="nav-item text-center" role="presentation">
				<a class="nav-link text-truncate ${
					pos == 0 ? "active" : ""
				} link-mesas" data-mesaterc="${item["mesa"]}" title="M${
				item["mesa"]
			}" id="M${item["mesa"]}-tab" data-toggle="tab" href="#M${
				item["mesa"]
			}" role="tab" aria-controls="M${item["mesa"]}" aria-selected="true">${
				item["mesa"]
			}</a>
			</li>`;
			let contentTab = `
				<div class="tab-pane fade" id="M${item["mesa"]}" role="tabpanel" aria-labelledby="M${item["mesa"]}-tab">
					<div class="list-group listaPedidos" id="listaMesaM${item["mesa"]}">
			`;
			optionsChosen += `<option value='${item["mesa"]}'>${item["mesa"]}</option>`;
			item.productos.forEach((option, pos2) => {
				contentTab += `<div title="${toTitleCase(
					option.nombre
				)}" class="list-group-item list-group-item-active p-2" style="border-top-width: 1px;">
					<div title="" class="listaItem">
						<a href="#" class="flex-column align-items-start">
							<div class="d-flex w-100 justify-content-between align-items-center">
								<h5 class="mb-1 text-truncate pr-2">${toTitleCase(option.nombre)}</h5>
							</div>
							<small>${option.Valor}</small>
						</a>
					</div>
				</div>`;
			});
			contentTab += `</div></div>`;
			contenidos += contentTab;
		});
		tabs += `</ul>`;
		contenidos += `</div>`;
		$("#contenidoModalCuentatercero").html(tabs);
		$("#contenidoModalCuentatercero").append(contenidos);
		setTimeout(() => {
			$("#M" + dataMesas[0]["mesa"]).addClass(" active show");
			$("#mesasUnificar").append(optionsChosen).trigger("chosen:updated");
			$("#btnUnificarMesasTercero").html(
				"Unificar a la mesa " + dataMesas[0]["mesa"]
			);
			$("#btnUnificarMesasTercero").attr("data-mesabtn", dataMesas[0]["mesa"]);
			accionMesasTercero();
		}, 200);
	} else {
		$("#contenidoModalCuentatercero").html(
			'<div class="text-center">No hay cuentas disponibles</di>'
		);
		$("#content-select").hide();
	}
	$("#OtrasCuentasTercero").modal("show");
}

function accionMesasTercero() {
	$(".link-mesas").click(function () {
		if (unificarMesasTercero) {
			if (
				$(this).data("mesaterc") !=
				$("#btnUnificarMesasTercero").data("mesabtn")
			) {
				let valor = $("#mesasUnificar").val();
				if ($(this).hasClass("mesa-unificar")) {
					$(this).removeClass("mesa-unificar");
					valor = valor.filter((x) => x != $(this).data("mesaterc"));
				} else {
					$(this).addClass("mesa-unificar");
					valor.push($(this).data("mesaterc"));
				}
				$("#mesasUnificar").val(valor).trigger("chosen:updated");
			}
		} else {
			$("#btnUnificarMesasTercero").html(
				"Unificar a la mesa " + $(this).data("mesaterc")
			);
			$("#btnUnificarMesasTercero").attr(
				"data-mesabtn",
				$(this).data("mesaterc")
			);
		}
	});
}

function cambiarTab(elemento) {
	$(".tab-pane").removeClass("show");

	if (elemento == "#tabCategorias" && accionPos == "pedido_mesa") {
		$("#lista-menu, .breadcrumb-item:eq(0), .main-menu-header").addClass(
			"disabled-events"
		);
		$("#sincronizarPermisos, #btnTecladoHUD").addClass(
			"disabled-events disabled-event"
		);
		$("#nav-user-link")
			.find(".list-inline-item:eq(0)")
			.addClass("disabled-events");
		$(".pro-body").find("li:eq(0)").addClass("disabled-events");
		$(".b-brand").addClass("disabled-event");
	} else {
		$("#lista-menu, .breadcrumb-item:eq(0), .main-menu-header").removeClass(
			"disabled-events"
		);
		$("#sincronizarPermisos, #btnTecladoHUD").removeClass(
			"disabled-events disabled-event"
		);
		$("#nav-user-link")
			.find(".list-inline-item:eq(0)")
			.removeClass("disabled-events");
		$(".pro-body").find("li:eq(0)").removeClass("disabled-events");
		$(".b-brand").removeClass("disabled-event");
	}

	setTimeout(() => {
		$(".tab-pane").removeClass("active");
		$(elemento).click();
		if (elemento == "#tabCategorias") {
			$("#valProducto").focus();
		}
	}, 80);
}

function consumosPendientesMesa({ datos }) {
	let estructura = "";
	$("#cuentasPendientesConsumo").html(estructura);
	if (datos.length) {
		datos.forEach((it) => {
			estructura += `<div title="Ir a la cuenta" class="m-b-10 d-flex border rounded btnTerceroConsumoPendiente" style="align-items: center;" data-info="${
				it.TerceroIdC
			}" data-accion="${it.Accion || ""}" data-nombre="${
				it.nombre
			}" data-personas="${
				it.PersonasReserva ? it.PersonasReserva : it.Personas
			}" data-firma="${it.firma}">
				<img src="${
					it.foto
				}" style="width: 70px; height: auto; max-height: 75px; border-radius: 3px" class="mr-3">
				<div style="width: 72%;">
					<h6>${it.nombre}</h6>
					<p class="m-b-0">${it.Accion || ""}</p>
				</div>
				<button type="button" title="Ir a la cuenta" class="btn btn-sm btn-secondary" style="max-height: 75px; height: 75px;">
					<i class="fas fa-share-square"></i>
				</button>
			</div>`;
		});
		$("#cuentasPendientesConsumo").html(estructura);
	} else {
		$("#cuentasPendientesConsumo").html(
			'<div class="text-center">No hay consumos pendientes</div>'
		);
	}
	abrirCerrarModal(
		".bd-accion-modal-sm",
		"hide",
		".modal-cuentas-pendientes",
		"show"
	);
	$(".btnTerceroConsumoPendiente")
		.unbind()
		.click(function () {
			terceroIdPedido = $(this).data("info");
			accionTercero = $(this).data("accion");
			$(".clientePedido").html($(this).data("nombre"));
			$(".accionIdPedido").html(accionTercero || "");
			let maxPer = $(".mesaId.mesa-seleccionada").data("personas")
				? $(".mesaId.mesa-seleccionada").data("personas")
				: null;
			numeroPersonasPedido = $(this).data("personas");
			$(
				"#cantPersonas"
			).html(`<input type="number" name="NumPerEditar" style="color: #ffffff;" class="form-control form-control-floating" 	placeholder="Número de personas" id="NumPerEditar" data-campodb="Personas" value="${numeroPersonasPedido}" max="${maxPer}" min="1">
		`);
			if ($TIPOCOMERC == "CLUB" && $(this).data("firma") != "S") {
				alertify.confirm(
					"Alerta",
					"El socio no está autorizado para firmar, solo puede facturar de contado",
					function (evt, value) {
						validarVendedor();
					},
					function () {}
				);
			} else {
				validarVendedor();
			}
			setTimeout(() => {
				$("#NumPerEditar").attr("disabled", true);
			}, 100);
		});
}

function clickTipoMenu({ datos }) {
	let estructuraHtml = "";
	$("#productosMenu").empty();
	datos.forEach((op) => {
		/* Se valida aplica sub grupo para que siempre se habilite */
		let productoValido =
			op.veriInven == "SI" || op.AplicaSubGrupo > 0 ? true : false;
		if (!productoValido && $DATOSMONTAJE["soloexiste"] == "S") {
			return op;
		}

		let colorFondo = "#ffffff";
		if (!productoValido) {
			colorFondo = "#d6d6d6";
		} else if (!op.Imagen && op.Color) {
			colorFondo = "#" + op.Color;
		} else {
			colorFondo = "transparent";
		}

		disenoProds = 1;
		if (localStorage.getItem("disenoProds") != null) {
			disenoProds = localStorage.getItem("disenoProds");
		}

		baseHeight = disenoProds == 1 ? 135 : 100;

		fontProds = "";
		if (
			localStorage.getItem("fontProds") != null &&
			localStorage.getItem("fontProds") > 12
		) {
			fontProds = `font-size: ${localStorage.getItem("fontProds")}px;`;
			alto = localStorage.getItem("fontProds") - 12;
			alto = alto * (disenoProds == 1 ? 5 : 3);
			baseHeight += alto;
		}

		if (
			localStorage.getItem("boldLetraProds") != null &&
			localStorage.getItem("boldLetraProds") != "N"
		) {
			fontProds +=
				localStorage.getItem("boldLetraProds") == "S"
					? " font-weight: bold;"
					: "";
		}

		fontPrecioProds = "";
		if (
			localStorage.getItem("fontPrecioProds") != null &&
			localStorage.getItem("fontPrecioProds") > 14
		) {
			fontPrecioProds = `font-size: ${localStorage.getItem(
				"fontPrecioProds"
			)}px;`;
			alto = localStorage.getItem("fontPrecioProds") - 14;
			alto = alto * (disenoProds == 1 ? 3 : 1.1);
			baseHeight += alto;
		}

		if (
			localStorage.getItem("boldPrecioProds") != null &&
			localStorage.getItem("boldPrecioProds") != "S"
		) {
			fontPrecioProds +=
				localStorage.getItem("boldPrecioProds") == "N"
					? " font-weight: unset;"
					: "";
		}

		if (disenoProds == 1) {
			estructuraHtml += `<div 
					class="producto-menu pb-2 px-1"
					style="max-width: 140px !important; height: ${baseHeight}px; width: 150px; cursor:${
				productoValido ? "pointer" : "no-drop"
			}"
					id="produ${op.ProductoId}"
					data-valido="${productoValido}"
					data-produ="${op.ProductoId}"
					data-subgrupo=${op.AplicaSubGrupo}
					title="${op.NombreSubGrupo || op.nombre}"
				>
				<div class="card mb-2 h-100" style="box-shadow: 2px 4px 3px 1px rgb(69 90 100 / 30%);">
					<div class="card-body p-2 ${
						op.NombreSubGrupo
							? "d-flex align-items-center justify-content-center" +
							  (op.Imagen ? " flex-column" : "")
							: ""
					}" style="border-radius:3px; background-color: ${colorFondo};">
						${
							op.Imagen
								? `<div class="container-item-prod text-center" style="min-height: 58px; max-height: 58px;">
							<img src="${op.Imagen}" style="max-width: 90px;z-index: 9; height: 100%; border-radius: 3px;">
						</div>`
								: ""
						}
						<div class="text-center texto-truncado" style="${
							!op.Imagen ? "-webkit-line-clamp: 4;" : ""
						}">
							<p class="m-0 fontProds" style="${fontProds}">${
				op.NombreSubGrupo || op.nombre
			}</p>
						</div>
						${
							!op.NombreSubGrupo
								? `<div class="mt-1" style="position: absolute; bottom: 3px; right: 8px;">
							<p class="fontPrecioProds" style="${fontPrecioProds}">$${addCommas(
										(+op.Valor).toFixed(0)
								  )}</p>
						</div>`
								: ""
						}
					</div>
				</div>
			</div>`;
		} else {
			estructuraHtml += `<div 
					class="producto-menu pb-2 px-1"
					style="max-width: 250px !important; height: ${baseHeight}px; width: 250px; cursor:${
				productoValido ? "pointer" : "no-drop"
			}"
					id="produ${op.ProductoId}"
					data-valido="${productoValido}"
					data-produ="${op.ProductoId}"
					data-subgrupo=${op.AplicaSubGrupo}
					title="${op.NombreSubGrupo || op.nombre}"
				>
				<div class="card mb-2 h-100" style="box-shadow: 2px 4px 3px 1px rgb(69 90 100 / 30%);">
					<div class="row no-gutters" style="height: 100%; background-color: ${colorFondo}; border-radius:3px;">
						<div class="${op.Imagen ? "d-flex align-items-center" : "d-none"} col-4">
							${
								op.Imagen
									? `<div class="container-item-prod text-center" style="min-height: 75px; max-height: 75px;">
								<img src="${op.Imagen}" style="max-width: 90px; z-index: 9; height: 100%; border-radius: 3px;">
							</div>`
									: ""
							}
						</div>
						<div class="${op.Imagen ? "col-8" : "col-12"}">
							<div class="card-body p-2 ${
								op.NombreSubGrupo
									? "d-flex align-items-center justify-content-center" +
									  (op.Imagen ? " flex-column" : "")
									: ""
							}">
								<div class="text-center texto-truncado" style="${
									!op.Imagen ? "-webkit-line-clamp: 4;" : ""
								}">
									<p class="m-0 fontProds" style="${fontProds}">${
				op.NombreSubGrupo || op.nombre
			}</p>
								</div>
								${
									!op.NombreSubGrupo
										? `<div class="mt-1" style="position: absolute; bottom: 3px; right: 8px;">
									<strong class="fontPrecioProds" style="${fontPrecioProds}">$${addCommas(
												(+op.Valor).toFixed(0)
										  )}</strong>
								</div>`
										: ""
								}
							</div>
						</div>
					</div>
				</div>
			</div>`;
		}
	});
	if (!datos.length) {
		$("#productosMenu").append(
			`<div class="col-12 text-center">No hay productos disponibles</div>`
		);
	} else {
		if (valorBuscarProducto == "") {
			$("#productosMenu").append(estructuraHtml);
		} else {
			productosBusqueda(estructuraHtml);
		}
	}
	$(".producto-menu").click(function () {
		setTimeout(() => {
			if ($(this).data("subgrupo") > 0) {
				let subgrupo = $(this).data("subgrupo");
				obtenerGruposMenu(idMesaActual, subgrupo);
			} else {
				if ($(this).data("valido")) {
					if (tercerosDesayuno.length) {
						let catn = tercerosDesayuno.filter(
							(x) =>
								!x.ProductoDesayuno ||
								(x.ProductoDesayuno && !x.ProductoDesayuno.Id)
						);
						if (!catn.length) {
							return alertify.warning("Todos los huespedes tienen desayuno");
						}
					}

					productoActual = {
						...datos.find((it) => it.ProductoId == $(this).data("produ")),
					};
					if (
						+productoActual["Valor"] <= 0 &&
						$DATOSMONTAJE["ventaceros"] != "S" &&
						tipoVentaSeleccionado.PreciAbier != "S"
					) {
						alertify.error("El producto no posee un valor de venta");
						return;
					}
					if (productoActual.terminos == "S") {
						$(".termino-producto").show();
						$("input[name=Termino]").attr("required", true);
					} else {
						$(".termino-producto").hide();
						$("input[name=Termino]").prop("checked", false);
					}
					$("input[name=Cantidad]").val(1);
					$("#allevar").attr("checked", false);
					let data = {
						headprodid: productoActual.headprodid,
						producto: productoActual.ProductoId,
						almacen: $INFOALMACEN["almacenid"],
						tipoVenta: tipoVentaSeleccionado.CodigEstru || null,
						pendiente: false,
					};
					$("#tituloIngredientes").hide();
					editarProductoPedidoNuevo = -1;
					prodsSelectFamilia = {};
					posPlatoActualFami = -1;
					$("#cantProducto").prop("disabled", false);
					$("#btnEliminarPromocion").hide();
					obtenerInformacion(data, "obtenerItemsProducto", "datosProducto");
				} else {
					alertify.warning("Producto no disponible");
				}
			}
		}, 10);
	});
	if (arrayProductosPedido.length) {
		organizarAcumulado();
	}
	$("#tabProductos").click();
}

function validarUnificarMesaAutomatico(MesasCuenta, tercero) {
	let mesasFun =
		typeof MesasCuenta == "string"
			? MesasCuenta.split(" ").join("").split("-")
			: [MesasCuenta + ""];
	let dataUnificar = {
		mesaOriginal: idMesaActual,
		mesasModificar: mesasFun,
		tercero: tercero,
		edicion: 0,
	};
	if ($DATOSMONTAJE.FactConAbier == "S") {
		validarVendedor();
	} else {
		setTimeout(() => {
			alertify.confirm(
				"Alerta",
				`El tercero tiene cuentas en la(s) mesa(s) ${MesasCuenta}, ¿Desea unificar con la mesa ${idMesaActual}?`,
				function (ok) {
					obtenerInformacion(
						dataUnificar,
						"unificarMesasTercero",
						"validarVendedor"
					);
				},
				function (err) {
					$("#zonaMesa").change();
					terceroIdPedido = null;
					accionTercero = null;
					abrirCerrarModal(".bd-accion-modal-sm", "hide");
				}
			);
		}, 100);
	}
}

function calcularIva(iva, valor) {
	let ivan = 0;
	if ($DATOSMONTAJE["PreciAnIva"] != "S") {
		ivan = ((valor / (1 + iva / 100)) * iva) / 100;
	} else {
		ivan = (valor * iva) / 100;
		valor = valor + ivan;
	}
	return [ivan, valor];
}

function organizarAcumulado() {
	$(".platos-pedido").html("");
	let datosTotales = {
			todasCuentas: 0,
			ivaPedidoActual: 0,
			impoConsumoPedidoActual: 0,
			totalHotel: 0,
			ivaHotel: 0,
			impoConsumoHotel: 0,
			pedidoActual: 0,
			totalSoloPendientes: 0,
			totalConPropina: 0,
			totalOtrosImpuestos: 0,
		},
		nuevos = 0,
		pendientes = 0,
		fechaConsu = "";

	$(".producto-menu").children().children("div").removeClass("producto-seleccionado");

	if (!dataFechasHotel.EntradaReservaHotel) {
		dataFechasHotel = {
			EntradaReservaHotel: null,
			SalidaReservaHotel: null,
		};
	}
	
	if (reservaHotel && reservaHotel != -1) {
		if (btnTerceroPendiente) {
			let { EntradaReservaHotel, SalidaReservaHotel } = cuentaTerceroConsumo;
			dataFechasHotel = { EntradaReservaHotel, SalidaReservaHotel };
		} else {
			let encTerc = tercerosAccion.find((op) => op.TerceroID + "" == terceroIdPedido + "");

			if (encTerc) {
				let { EntradaReservaHotel, SalidaReservaHotel } = encTerc;
				dataFechasHotel = { EntradaReservaHotel, SalidaReservaHotel };
			} else {
				let { EntradaReservaHotel, SalidaReservaHotel } = cuentaTerceroConsumo;
				dataFechasHotel = { EntradaReservaHotel, SalidaReservaHotel };
			}
		}
	}

	cantDarBaja = 0;

	arrayProductosPedido.forEach((item, pos) => {
		let valorProd = item.costoDescuento ? item.costoDescuento : +item.Valor;
		let valorFamilia = 0;

		if (item.valorUnitario) valorProd = +item.valorUnitario * +item.Cantidad;

		fechaConsu = item.FechaConsu.split(" ")[0];

		let color = "#ffffff";
		let letra = "N";
		if (
			item.Imprime == "P" &&
			item.Despachado == "P" &&
			$INFOALMACEN.NoFisico != "S"
		) {
			color = "#ffa0a0";
			letra = "P";
		} else if (item.pendiente) {
			color = "#fffab1";
		} else if (item.ProductosFamilia) {
			color = "#d4e399";
		}

		let claseVer = "d-flex activoplato";
		/* Validamos si solo se visualiza para el actual o no */
		if ($(".btnOcultarConsumos").hasClass("ocultarConsumos")) {
			if (
				reservaHotel &&
				reservaHotel != -1 &&
				tipoVentaSeleccionado.Propina == "S" &&
				dataFechasHotel.EntradaReservaHotel
			) {
				if (
					item.SedeAlmacen != $INFOALMACEN.SedeId ||
					moment(fechaConsu).isBefore(dataFechasHotel.EntradaReservaHotel) ||
					moment(fechaConsu).isAfter(dataFechasHotel.SalidaReservaHotel)
				) {
					claseVer = "d-none";
				}
			} else {
				if (accionPos == "pedido_mesa") {
					if (!item.MesaId || item.MesaId != idMesaActual) {
						claseVer = "d-none";
					}
				} else {
					if (
						(item.MesaId && item.MesaId != "") ||
						(item.AlmacenId + "").trim() != ($INFOALMACEN.almacenid + "").trim()
					) {
						claseVer = "d-none";
					}
				}
			}
		}

		let estructFami = "";
		if (item.ProductosFamilia && item.ProductosFamilia.length) {
			item.ProductosFamilia.forEach((it, pos2) => {

				let valorProdFA = it.costoDescuento ? it.costoDescuento : +it.Valor;

				if (it.valorUnitario) valorProdFA = +it.valorUnitario * +it.Cantidad;

				valorFamilia += +valorProdFA;

				estructFami += `<div class="d-flex align-items-center justify-content-between py-1 platos-pedido-item-fami" style="background-color: ${color}">
					<div class="col-1">
						${
							eliminarProductoPermiso
								? `<button data-posi="${pos2}" data-posipadre="${pos}" data-id="${it.Id || 0}" data-pendiente="${item.pendiente ? "S" : "N"}" class="btnEliminarProductoFami btn btn-danger btn-xs mb-2" title="Eliminar" style="display: none;">
							<i class="fas fa-times"></i>
						</button>`
								: ""
						}
					</div>
					<div class="text-left col-7 px-0">
						<p class="m-0 font-weight-600">
							<span class="${letra != "P" ? "text-primary" : ""}">${it.ProductoId} - ${it.nombre} ${it.Termino && it.Termino != "" ? " - Termino: " + it.Termino : ""}</span>
						</p>
					</div>
					<div class="text-left col-1 px-0">
						<p class="m-0 font-weight-600 text-center">
							<span class="${letra != "P" ? "text-primary" : ""}">${+it.Cantidad}</span>
						</p>
					</div>
					<div class="text-right col-2 px-0 mr-2">
						<p class="m-0 font-weight-600">
							<strong>$${addCommas((+it.Valor).toFixed(0))}</strong>
						</p>
					</div>
				</div>`;

				let stringIVAImpoConsumoFA = "ivaPedidoActual";
				let stringIVAImpoConsumoHotelFA = "ivaHotel";

				if (+it.ivaid == $impoConsumo) {
					stringIVAImpoConsumoFA = "impoConsumoPedidoActual";
					stringIVAImpoConsumoHotelFA = "impoConsumoHotel";
				}

				if (claseVer == "d-flex activoplato") {
					datosTotales[stringIVAImpoConsumoFA] += +it.Iva;
					datosTotales.pedidoActual += +valorProdFA;
				}

				if (reservaHotel && reservaHotel != -1 && tipoVentaSeleccionado.Propina == "S" && dataFechasHotel.EntradaReservaHotel) {
					if (it.SedeAlmacen == $INFOALMACEN.SedeId && moment(fechaConsu).isSameOrAfter(dataFechasHotel.EntradaReservaHotel) && moment(fechaConsu).isSameOrBefore(dataFechasHotel.SalidaReservaHotel)) {
						datosTotales[stringIVAImpoConsumoHotelFA] += +it.Iva;
						datosTotales.totalHotel += +valorProdFA;
					}
				}

				datosTotales.totalOtrosImpuestos += (it.PorceImpue > 0 ? +it.Impuesto : +it.Cantidad * +it.Impuesto);

				if (it.Imprime != "P" && it.Despachado != "P") datosTotales.todasCuentas += +valorProdFA;
			});
		}

		if (item.ConsumoId && darBajaProductoPermiso && item.pendiente == 0) cantDarBaja++;

		nuevos += item.nuevo || (item.Imprime == "P" && item.Despachado == "P") ? 1 : 0;
		pendientes += (item.nuevo && !item.pendiente) || (item.Imprime == "P" && item.Despachado == "P") ? 1 : 0;

		$(".platos-pedido").append(`
			<div class="${claseVer} align-items-center justify-content-between py-1 platos-pedido-item" style="background-color: ${color}" data-idcom="${
			item.Id
		}" data-consumoid="${item.ConsumoId}" data-valido="${
			item.nuevo ? "N" : "S"
		}" data-prod="${item.ProductoId}" ${
			item.ProductosFamilia
				? `id="famiHead${item.ProductoId}${pos}" data-target="#famiCollap${item.ProductoId}${pos}" data-toggle="collapse"`
				: ""
		}>
				<div class="col-2 px-1">
					<p class="m-0 font-weight-600" style="margin-bottom: -2px; font-weight: 100;">
						${
							eliminarProductoPermiso
								? `<button data-posi="${pos}" class="btnEliminarProducto btn btn-danger btn-xs mb-2" title="Eliminar">
							<i class="fas fa-trash"></i>
						</button>`
								: ""
						}
						${
							modificarProductoPermiso && !item.ComandaEditar
								? `<button data-posi="${pos}" class="btnEditarProducto btn btn-info btn-xs mb-2 ${
										item.ProductosFamilia && item.ProductosFamilia.length
											? "d-none"
											: ""
								  }" title="Editar">
							<i class="fas fa-pencil-alt"></i>
						</button>`
								: ""
						}
						${
							item.estructuraConsumo > 0 &&
							detalleProductoPermiso &&
							!item.ProductosFamilia
								? `<button data-posi="${pos}" class="btnDetalleEstructura btn btn-secondary btn-xs mb-2" title="Detalle">
								<i class="fas fa-info-circle"></i>
							</button>`
								: ``
						}
						${
							item.ConsumoId && darBajaProductoPermiso && item.pendiente == 0
								? `<button data-posi="${pos}" class="btnDarDebaja btn btn-warning btn-xs mb-2" title="Dar de baja">
							<i class="fas fa-thumbs-down"></i>
						</button>`
								: ""
						}
						${
							item.ProductosFamilia && item.ProductosFamilia.length
								? `<button data-posi="${pos}" data-posfami="${item.posFamilia}" class="btnEditarFamilia btn btn-secondary btn-xs mb-2 d-none" title="Editar Familia">
							<i class="fas fa-clipboard-check"></i>
						</button>`
								: ""
						}
					</p>
				</div>
				<div class="text-left col-6 px-0">
					<p class="m-0 font-weight-600">
						<span class="${letra != "P" ? "text-primary" : ""}">${item.ProductoId} - ${
			item.nombre
		} ${item.Desayuno == "S" ? "(Desayuno)" : ""}</span>
						<br class="${
							$DATOSMONTAJE.ConsolidarCuentaResponsablePago == "S"
								? ""
								: "d-none"
						}">
						<span class="${
							$DATOSMONTAJE.ConsolidarCuentaResponsablePago == "S"
								? ""
								: "d-none"
						}">${item.NombreTercero}</span>
						<br>
						${
							$carritoFlotante == "S"
								? `<span class="${letra != "P" ? "text-muted" : ""} mb-0">
								${item.Almacen} - ${item.NombreVendedor || $(".vendedorPedido:first").text()}
							</span>
							<br>
							<span class="${letra != "P" ? "text-muted" : ""} mb-0"> 
								${
									$DATOSMONTAJE.FactConAbier == "S" && item.MesaId
										? "Mesa " + item.MesaId + " - "
										: ""
								}  
								${
									moment(item.FechaConsu).format("DD-MM-YYYY hh:mm:ss A") ||
									moment().format("DD-MM-YYYY hh:mm:ss A")
								}
							</span>`
								: ""
						}

						${
							tercerosDesayuno.length
								? `<br><span class="${letra != "P" ? "text-muted" : ""} mb-0"> 
							${item.NombreTercero}
						</span>`
								: ""
						}
					</p>
				</div>
				<div class="text-left col-1 px-0">
					<p class="m-0 font-weight-600 text-center">
						<span class="${letra != "P" ? "text-primary" : ""}">${
			$carritoFlotante == "N" ? "Cant: " : ""
		}${+item.Cantidad}</span>
					</p>
				</div>
				<div class="text-right col-2 px-0 mr-2">
					<p class="m-0 font-weight-600">
						<strong>$${addCommas((+valorProd).toFixed(0))}</strong>
						${valorFamilia > 0 ? `<br><strong>($${addCommas((+valorFamilia).toFixed(0))})</strong>` : ""}
					</p>
				</div>
			</div>
			${
				item.ProductosFamilia
					? `<div id="famiCollap${item.ProductoId}${pos}" class="collapse" aria-labelledby="famiHead${item.ProductoId}${pos}" data-parent=".platos-pedido">${estructFami}</div>`
					: ""
			}
		`);
		$("#produ" + item.ProductoId).children().children("div").addClass("producto-seleccionado");

		let stringIVAImpoConsumo = "ivaPedidoActual";
		let stringIVAImpoConsumoHotel = "ivaHotel";

		if (+item.ivaid == $impoConsumo) {
			stringIVAImpoConsumo = "impoConsumoPedidoActual";
			stringIVAImpoConsumoHotel = "impoConsumoHotel";
		}

		if (claseVer == "d-flex activoplato") {
			datosTotales[stringIVAImpoConsumo] += +item.Iva;
			datosTotales.pedidoActual += +valorProd;
		}

		if (reservaHotel && reservaHotel != -1 && tipoVentaSeleccionado.Propina == "S" && dataFechasHotel.EntradaReservaHotel) {
			if (item.SedeAlmacen == $INFOALMACEN.SedeId && moment(fechaConsu).isSameOrAfter(dataFechasHotel.EntradaReservaHotel) && moment(fechaConsu).isSameOrBefore(dataFechasHotel.SalidaReservaHotel)) {
				datosTotales[stringIVAImpoConsumoHotel] += +item.Iva;
				datosTotales.totalHotel += +valorProd;
			}
		}

		datosTotales.totalOtrosImpuestos += (item.PorceImpue > 0 ? +item.Impuesto : +item.Cantidad * +item.Impuesto);

		if (item.Imprime != "P" && item.Despachado != "P") datosTotales.todasCuentas += +valorProd;

		if (item.TotalPedidosPendientes > 0) datosTotales.totalSoloPendientes = +item.TotalPedidosPendientes;
		
	});

	/* Calculamos el subtotal de todos los productos */
	let subtotal = datosTotales.pedidoActual - (datosTotales.impoConsumoPedidoActual + datosTotales.ivaPedidoActual + datosTotales.totalOtrosImpuestos);
	propinaPedido = 0;
	if (tipoVentaSeleccionado.Propina == "S") {
		if (reservaHotel && reservaHotel != -1) {
			/* Calculamos el subtotal solo de los productos de hotel como siempre habia estado antes de esta modificacion */
			subtotal = datosTotales.totalHotel - (datosTotales.impoConsumoHotel + datosTotales.ivaHotel);
		}
		propinaPedido = (subtotal * +tipoVentaSeleccionado.PropinaTarifa) / 100;
	}

	propinaPedido = Math.round(myRound(propinaPedido));
	if ($DATOSMONTAJE.RedondearPropina == "S") {
		//Aproximamos a los proximos 50 pesos
		propinaPedido = Math.ceil(propinaPedido / 50) * 50;
	}
	datosTotales.totalConPropina = datosTotales.pedidoActual + propinaPedido;
	// datosTotales.pedidoActual += propinaPedido;

	//Validamos si el boton de dar de baja aparece o no
	if (cantDarBaja > 0 || !darBajaProductoPermiso) {
		$("#btnDarDeBajaCuenta").removeClass("d-none");
	} else {
		$("#btnDarDeBajaCuenta").addClass("d-none");
	}

	/* Se agregan los totales a las visuales */
	$(".totalPropina").text("$" + addCommas(propinaPedido));
	$(".totalConPropina").text("$" + addCommas(datosTotales.totalConPropina));
	$(".totalOtrosImpuestos").text(
		"$" + addCommas(datosTotales.totalOtrosImpuestos)
	);
	$(".totalCuentaNeta").text("$" + addCommas(subtotal.toFixed(2)));

	$(".totalCuentaActual").text("$" + addCommas(datosTotales.pedidoActual.toFixed(2)));

	$(".totalOtrosPuntosCuenta").text("$" + addCommas(datosTotales.todasCuentas.toFixed(2)));
	$(".totalIva").text("$" + addCommas(datosTotales.ivaPedidoActual.toFixed(2)));
	$(".impuestoConsumo").text("$" + addCommas(datosTotales.impoConsumoPedidoActual.toFixed(2)));

	$(".totales-consumos-pendientes").hide();
	if (datosTotales.totalSoloPendientes > 0) {
		$(".totalPedidosPendientes").text(
			"$" + addCommas(datosTotales.totalSoloPendientes.toFixed(2))
		);
		$(".totales-consumos-pendientes").show();
	}

	if (arrayProductosPedido.length) {
		$(".btn-floating").show();
		$("#btnBorrarPedido").attr("disabled", true);
		if (nuevos < arrayProductosPedido.length) {
			$("#btnBorrarPedido").attr("disabled", false);
		}
	} else {
		ocultarInforFlotante();
		$("#valProducto").val("");
	}
	$("#btnCargarACuenta").attr("disabled", nuevos > 0 ? false : true);
	accionesProducto();
	$(".platos-pedido").scrollTop($(".platos-pedido")[0].scrollHeight);
	$("#btnCambiarSocio, #btnCambiarCuentaPedido, #btnAgregarCuentas").prop(
		"disabled",
		false
	);
	if (accesoCargarCuentaHotel && accionPos == "general") {
		$("#btnCambiarSocio, #btnCambiarCuentaPedido, #btnAgregarCuentas").prop(
			"disabled",
			true
		);
	}

	if (
		$DATOSMONTAJE.FactConAbier == "S" ||
		$DATOSMONTAJE.ConsolidarCuentaResponsablePago == "S"
	) {
		$(".totales-consumo").removeClass("bg-success");
		if (!$(".btnOcultarConsumos").hasClass("ocultarConsumos")) {
			$(".totales-consumo").addClass("bg-success");
		}
	}

	if ($carritoFlotante == "N") {
		$(".div-tipos-comida").removeClass("col-md-12").addClass("col-md-7");
		$(".content-car").show();
	}
}

function ocultarInforFlotante() {
	$(".CheckOut, .btn-floating, .reservas-mesa").hide();
}

function cargarAccionTerc(enc) {
	numeroPersonasPedido =
		$("#NumeroPersonas").val() == "" ? 1 : $("#NumeroPersonas").val();
	let maxPer = $(".mesaId.mesa-seleccionada").data("personas")
		? $(".mesaId.mesa-seleccionada").data("personas")
		: null;
	$("#cantPersonas")
		.html(`<input type="number" name="NumPerEditar" style="color: #ffffff;" class="form-control form-control-floating" 	placeholder="Número de personas" id="NumPerEditar" data-campodb="Personas" value="${numeroPersonasPedido}" max="${maxPer}" min="1" required>
	`);
	accionCamposPedido();
	$(".clientePedido").html(enc.Nombre);
	$(".habitacionPedido").html(enc.NombreHabitacion || "");
	$(".documentoPedido").html(enc.TerceroID || "");
	$(".eventoPedido").html("");
	if (enc.EventoId != -1)
		$(".eventoPedido").html(
			(enc.NroEvento || "") + " - " + (enc.NombreEvento || "")
		);
	$(".accionIdPedido").html(accionTercero || "");
	let consumo = $(".mesaId.mesa-seleccionada").data("ocupada");
	if ($TIPOCOMERC == "CLUB" && enc.ZonaCuenta != null) {
		alertify.warning(
			"El tercero tiene cuentas en las siguientes zonas: " + enc.ZonaCuenta
		);
	}
	if ($TIPOCOMERC == "CLUB" && enc.CantConsu > 0 && enc.MesasCuenta != null) {
		alertify.warning(
			"El tercero tiene cuentas en las mesas: " + enc.MesasCuenta
		);
	}
	if (
		enc.CantConsu > 0 &&
		enc.CantTercIgual == 0 &&
		idMesaActual &&
		consumo != 0
	) {
		alertify.confirm(
			"Alerta",
			`La mesa ${idMesaActual} tiene varias cuentas registradas. ¿Desea agregar una cuenta nueva?`,
			function (ok) {
				terceroIdPedido = enc.TerceroID;
				pedidoSinAccion = false;
				if ($TIPOCOMERC == "CLUB") {
					if (enc.MesasCuentaUnificar == null) {
						validarVendedor();
					} else {
						if (accionPos == "pedido_mesa") {
							validarUnificarMesaAutomatico(
								enc.MesasCuentaUnificar,
								terceroIdPedido
							);
						}
					}
				} else {
					validarVendedor();
				}
			},
			function (err) {
				console.error("Error ", err);
			}
		);
	} else {
		terceroIdPedido = enc.TerceroID;
		if ($TIPOCOMERC == "CLUB") {
			if (enc.MesasCuentaUnificar == null) {
				validarVendedor();
			} else {
				if (accionPos == "pedido_mesa") {
					validarUnificarMesaAutomatico(
						enc.MesasCuentaUnificar,
						terceroIdPedido
					);
				} else {
					validarVendedor();
				}
			}
		} else {
			validarVendedor();
		}
	}
}

function accionesProducto() {
	$(".btnEliminarProductoFami").click(function () {
		let posi = $(this).data("posi");
		let posiPadre = $(this).data("posipadre");
		let idGuardado = $(this).data("id");
		if (idGuardado > 0) {
			let data = {
				id: idGuardado,
				pendiente: $(this).data("pendiente"),
				posi,
				posiPadre,
				mesa: idMesaActual,
			};
			obtenerInformacion(data, "eliminarProdFamilia", "prodEliminadoFamilia");
		} else {
			if (arrayProductosPedido[posiPadre].ProductosFamilia.length == 1) {
				arrayProductosPedido.splice(posiPadre, 1);
			} else {
				arrayProductosPedido[posiPadre].ProductosFamilia.splice(posi, 1);
			}
			organizarAcumulado();
		}
	});

	$(".btnEliminarProducto").click(function () {
		permisoAccionActual = 2594;
		let posi = $(this).data("posi");
		let info = arrayProductosPedido[posi];
		formValidateDataUser = "producto";
		editarProductoPedidoNuevo = posi;
		if (info.Despachado == "P" && info.Imprime == "P") {
			$("#formObservacionBorrar").submit();
		} else {
			if (info.pendiente) {
				alertify.confirm(
					"Alerta",
					"¿Desea eliminar el producto " +
						info.nombre +
						" de la cuenta pendiente?",
					function (evt, value) {
						let data = {
							Producto: info.ProductoId,
							Id: info.Id,
						};
						obtenerInformacion(
							data,
							"borrarDeCuentaPendiente",
							"cuentaPendienteBorrado"
						);
					},
					function () {}
				);
			} else {
				if (info.Imprime == "P" && info.Despachado == "P") {
					borrarCuentaProductoPedido();
				} else {
					imprimirDevolucionConsumo = false;
					if ($DATOSMONTAJE.TiempoDevolConsumo > 0) {
						let tiempoDevolucion = moment(info.FechaConsu).add(
							$DATOSMONTAJE.TiempoDevolConsumo,
							"minutes"
						);
						if (tiempoDevolucion.isBefore(moment())) {
							abrirCerrarModal("#modal-solicitar-usuario", "show");
						} else {
							imprimirDevolucionConsumo = true;
							borrarCuentaProductoPedido();
						}
					} else {
						abrirCerrarModal("#modal-solicitar-usuario", "show");
					}
				}
			}
		}
	});

	$(".btnEditarProducto").click(function () {
		editarProductoPedidoNuevo = $(this).data("posi");
		productoActual = arrayProductosPedido[editarProductoPedidoNuevo];
		$("#Observacio").val("");
		let data = {
			headprodid: productoActual.headprodid,
			producto: productoActual.ProductoId,
			almacen: $INFOALMACEN["almacenid"],
			tipoVenta: tipoVentaSeleccionado.CodigEstru || null,
			consumo: productoActual["Id"],
			pendiente: productoActual.pendiente ? true : false,
		};
		$("#tituloIngredientes").hide();
		$("input[name=Termino]:checked").prop("checked", false);

		obtenerInformacion(data, "obtenerItemsProducto", "datosProducto");
	});

	$(".btnDetalleEstructura").click(function () {
		let posi = $(this).data("posi");
		if (arrayProductosPedido[posi]["headprodid"]) {
			let data = {
				headProd: arrayProductosPedido[posi]["headprodid"],
				consumo: arrayProductosPedido[posi]["Id"],
				almacen: $INFOALMACEN["almacenid"],
				pendiente: arrayProductosPedido[posi]["pendiente"] ? true : false,
			};
			obtenerInformacion(
				data,
				"estructuraventaProducto",
				"datosEstructuraProducto"
			);
		}
	});

	$(".btnDarDebaja").click(function () {
		permisoAccionActual = 2611;
		formValidateDataUser = "producto";
		let posi = $(this).data("posi");
		editarProductoPedidoNuevo = posi;
		abrirCerrarModal("#modal-solicitar-usuario", "show");
	});

	$(".btnEditarFamilia").click(function () {
		editarProductoPedidoNuevo = $(this).data("posi");
		if (arrayProductosPedido[editarProductoPedidoNuevo]["headprodid"]) {
			productoActual = arrayProductosPedido[editarProductoPedidoNuevo];
			let data = {
				producto: productoActual.headprodid,
			};
			obtenerInformacion(
				data,
				"obtenerFamiliasProd",
				"informacionFamiliaProducto"
			);
		}
	});

	$("#Valor").on("change", function () {
		$(".labelPromociones").html("").css("padding-inline", "");
		$("#bgProm").addClass("d-none");
		changeInputCantidad();
		productoActual.PromoPorce = 0;
		productoActual.PromoDescuen = 0;
		productoActual.PromocionId = "";
		productoActual.PromoProdu = "";
	});
}

function infoProductoEditar() {
	Object.keys(productoActual).forEach((ite) => {
		if (
			productoActual["inventames"] != "S" &&
			ite === "inventario" &&
			productoActual[ite].length
		) {
			productoActual[ite].forEach((op) => {
				if (op.Tipo != "O") {
					$("#item" + op["productoid"]).attr(
						"checked",
						op["elegido"] ? true : false
					);
					if (op.Tipo == "F" || op.Tipo == "V") {
						$("#tituloIngredientes").show();
					}
				}
			});
		} else if (ite === "Termino") {
			if (productoActual[ite] != "") {
				$(".termino-producto").show();
				$(`[data-valor='${productoActual[ite]}']`).attr("checked", true);
			} else {
				$(".termino-producto").hide();
				$("input[name=Termino]").prop("checked", false);
			}
		} else {
			if (ite == "Observacio") {
				productoActual[ite] = productoActual[ite].replace(
					/(_Sin_|_V_|_O_).*/,
					""
				);
			}
			$("#" + ite).val(productoActual[ite]);
		}
	});
	$("#cantProducto").val(productoActual.Cantidad ? productoActual.Cantidad : 1);
	$("#allevar").attr("checked", false);
	if (productoActual.allevar) {
		$("#allevar").attr("checked", true);
	}
	$("#PuestoMesa").val(
		(productoActual["PuestoMesa"] ? productoActual["PuestoMesa"] : "")
			.split(" ")
			.join("")
	);
	$("#cantProducto").prop("disabled", true);

	$("#cantRestarProd").show();
	if (restarProductoPermiso == 0) {
		$("#cantRestarProd").hide();
	}
}

function datosEstructuraProducto({ estructura }) {
	$("#estructuraPlato").html("");
	estructura.forEach((item) => {
		$("#estructuraPlato")
			.append(`<div class="d-flex align-items-center justify-content-between py-2 border-bottom">
			<div class="text-left col-3 px-0">
				<p class="m-0 font-weight-600">
					<span class="text-primary">${item.productoid}</span><br>
				</p>
			</div>
			<div class="text-left col-9 px-0">
				<p class="m-0 font-weight-600 text-center">
					<span class="text-primary">${item.nombre}</span>
				</p>
			</div>
		</div>`);
	});

	$("#estructuraObservacion").html(
		"<strong>Observacion: </strong>" +
			(estructura[0] && estructura[0]["Observacio"]
				? estructura[0]["Observacio"].replace(/(_Sin_|_V_|_O_).*/, "")
				: "")
	);
	abrirCerrarModal("#datosPlatoEstructura", "show");
}

function datosProducto({
	disponibles,
	noDisponibles,
	observaciones,
	agrandamiento,
	cantEstructura,
}) {
	if (productoActual.inventames != "S" && productoActual.estructura == "S") {
		if (!cantEstructura) {
			return alertify.error("El producto no tiene una estructura registrada");
		}
		if (!disponibles.length && !observaciones.length) {
			return alertify.error("El producto no tiene una estructura valida");
		}
	}
	$("#listaIngredientes").empty();
	$("#Observacio").val("");
	$("#PuestoMesa").val("");
	itemsDisponibleProducto = disponibles;
	itemsObservaciones = observaciones;
	if (
		productoActual.inventames != "S" &&
		productoActual.estructura == "S" &&
		itemsObservaciones.length > 0
	) {
		$("#btnCrearCargar").text("Observaciones");
	} else {
		$("#btnCrearCargar").text("Agregar");
	}
	if (cantidadProductoPermiso) {
		$("#btnCrearCargar, #cantProductoCont").show();
	}
	$(".labelPromociones").html("").css("padding-inline", "");
	$("#bgProm").addClass("d-none");
	if (productoActual.inventames != "S") {
		if (productoActual.estructura == "S") {
			if (disponibles.length) {
				let tempData = dataFijosVariables(
					disponibles,
					"#tituloIngredientes",
					"#listaIngredientes",
					productoActual
				);
				disponibles = [...tempData.datos];
			} else {
				if ($DATOSMONTAJE["verInvEstrVent"] == "S") {
					$("#cantProductoCont").hide();
				}
			}
		}
	} else {
		if (
			$DATOSMONTAJE.InventarioRojo != "S" &&
			+productoActual.invenactua <= 0
		) {
			$("#cantProductoCont").hide();
		}
	}
	itemsNoDisponiblesProducto = noDisponibles;
	if (editarProductoPedidoNuevo != -1) {
		infoProductoEditar();
	}
	abrirCerrarModal(".bd-Variables", "show", "#BusquedaProducto", "hide");
	$(".bd-Variables")
		.unbind()
		.on("shown.bs.modal", function (event) {
			$("#nombreProducto").children().text(productoActual.nombre);
			setTimeout(() => {
				if ($INFOALMACEN["SolicitarPuestoMesa"] == "S") {
					$("#PuestoMesa").focus();
				} else {
					$("#Observacio").focus();
				}
				$("#cantProducto").change();
			}, 500);

			if (!productoActual.PromoProdu) {
				let valor = addCommas(+productoActual.ValorOriginal);
				valor = valor.split(",").join("");
				$("#Valor").val(valor).attr("disabled", true);
				if (productoActual.PrecioAbierto == "S") {
					$("#Valor").attr("disabled", false);
				}
			}
			$("#prodDesayuno").hide();
			if (
				productoActual["EsDesayuno"] == "S" &&
				ReservaAplicaDesayuno == "S" &&
				TieneDesayunoPendiente == "S"
			) {
				$("#Valor").val(0);
				$("#prodDesayuno").show();
			}
		});
	$("#Termino-error").css("display", "none");
	$("input[name=Cantidad]").change();
	$("#btnAgrandamientos, #btnPromociones").hide();
	if (agrandamiento) {
		$("#btnAgrandamientos").show();
		$("#btnAgrandamientos")
			.unbind()
			.click(function () {
				let data = {
					headprodid: productoActual.headprodid,
					producto: productoActual.ProductoId,
					almacen: $INFOALMACEN["almacenid"],
					tipoVenta: tipoVentaSeleccionado.CodigEstru || null,
					pendiente: false,
					agrandamientos: true,
				};
				if (productoActual["Id"]) {
					data["consumo"] = productoActual.Id;
				}
				obtenerInformacion(
					data,
					"obtenerItemsProducto",
					"itemsProductoAgrandar"
				);
			});
		$(".btnCancelarCargarAgrandamientos")
			.unbind()
			.click(function () {
				abrirCerrarModal(
					".modal-agrandamientos",
					"hide",
					".bd-Variables",
					"show"
				);
			});
	}
	setTimeout(() => {
		changeInputCantidad();
	}, 200);
	if (productoActual.Promocion == "S") {
		let data = {
			almacen: $INFOALMACEN["almacenid"].trim(),
			diaSemana: obtenerDiaSemana(),
			headprodid: productoActual.headprodid,
			productoId: productoActual.ProductoId,
			grupoMenu: $INFOALMACEN["TipoMenuId"],
			tipoVenta: tipoVentaSeleccionado.CodigEstru || null,
			tercero: terceroIdPedido,
			codiVentId: tipoVentaSeleccionado.codiventid || null,
			grupoId: $(".card-tipo-comida.tipo-comida-seleccionado").data("grupo"),
			diaMes: moment().format("D"),
			mes: moment().format("MM"),
			anio: moment().format("YYYY"),
			semanaMes:
				Math.ceil(moment().date() / 7) > 3
					? "'4','U'"
					: "'" + Math.ceil(moment().date() / 7) + "'",
			diaSemanaCorto: obtenerDiaSemana().substr(0, 2).toUpperCase(),
			buscar: (valorBuscarProducto || "").trimEnd(),
			soloDesayuno: tercerosDesayuno.length > 0 ? 1 : 0,
			headReservaHotel: tercerosDesayuno.length > 0 ? HeadReservaIdHotel : 0,
		};
		obtenerInformacion(data, "obtenerPromociones", "promocionesProducto");
	} else {
		promocionesProd = 1;
	}
}

function consumoReactivar() {
	if (datosTerceroReactivar) {
		if ($TIPOCOMERC == "CLUB" && !datosTerceroReactivar.AccionId) {
			alertify.error("El tercero no tiene acción");
		}
		$(".accionIdPedido").html(datosTerceroReactivar.AccionId || "");
		$(".habitacionPedido").html(datosTerceroReactivar.NombreHabitacion || "");
		accionTercero = datosTerceroReactivar.AccionId || "";
		codBarraTercero = datosTerceroReactivar.barra || "";
		habitacionHotel = datosTerceroReactivar.HabitacionId || null;
		HeadReservaIdHotel = datosTerceroReactivar.HeadReservaHotel || null;
		$(".barraPedido").html(codBarraTercero);
		let vendedor = $VENDEDORES.find((op) => op.vendedorid == vendedorElegido);
		if (vendedor) {
			$(".vendedorPedido").html(vendedor.nombre);
			$("#btnFacturarFacturaElectronico").attr("data-vendfactura", "S");
			if (vendedor.PuedeFacturarEnPOS != "S") {
				$("#btnFacturarFacturaElectronico").attr("data-vendfactura", "N");
			}
		} else {
			$(".vendedorPedido").text("");
		}
		if ($TIPOCOMERC == "CLUB" && datosTerceroReactivar.firma != "S") {
			alertify.confirm(
				"Alerta",
				"El socio no está autorizado para firmar, solo puede facturar de contado",
				function (evt, value) {
					reactivarConsumoTerc();
				},
				function () {}
			);
		} else {
			reactivarConsumoTerc();
		}
	}
}

function reactivarConsumoTerc() {
	numeroPersonasPedido = numeroPersonasReactivar;
	let maxPer = $(".mesaId.mesa-seleccionada").data("personas")
		? $(".mesaId.mesa-seleccionada").data("personas")
		: null;
	$("#cantPersonas")
		.html(`<input type="number" name="NumPerEditar" style="color: #ffffff;" class="form-control form-control-floating" placeholder="Número de personas" id="NumPerEditar" data-campodb="Personas" value="${numeroPersonasPedido}" max="${maxPer}" min="1" required>
	`);
	accionCamposPedido();
	$(".clientePedido").html(datosTerceroReactivar.Nombre || "");
	$(".accionIdPedido").html(accionTercero || "");
	terceroIdPedido = datosTerceroReactivar.TerceroID
		? datosTerceroReactivar.TerceroID.trim()
		: null;

	ReservaAplicaDesayuno = datosTerceroReactivar.AplicaDesayuno;
	reservaHotel = datosTerceroReactivar.ReservaHotel;
	TieneDesayunoPendiente = datosTerceroReactivar.DesayunoPendiente;
	$("#btnCuentaHotel, #AplicoDesayuno").hide();
	if (cargarCuentaHotelPermiso && reservaHotel && reservaHotel != -1) {
		if (datosTerceroReactivar.reservaVigente) {
			$("#btnCuentaHotel").show();
		} else {
			reservaHotel = null;
		}
	}
	if (
		reservaHotel > 0 &&
		ReservaAplicaDesayuno == "S" &&
		TieneDesayunoPendiente == "N"
	) {
		$("#AplicoDesayuno").show();
	}
	informacionMesa(accionPos != "general" ? idMesaActual : false);
}

function promocionesProducto({ promGene, promoProd }) {
	promocionesProd = { promGene, promoProd };
	changeInputCantidad();
}

function changeInputCantidad(accion = "") {
	let cantidad = +(Number($("input[name=Cantidad]").val()) + "").replace(
		/[^0-9]/g,
		""
	);
	if (accion == "sumar") {
		cantidad += 1;
	} else if (accion == "restar" && cantidad != 1) {
		cantidad--;
		if (cantidad == 0) cantidad = 1;
		if (cantidad < 0) cantidad = 0;
	} else {
		if (cantidad == 0) cantidad = 1;
		if (cantidad < 0) cantidad = 0;
	}
	if (promocionesProd != undefined) {
		if (
			productoActual.Promocion == "S" &&
			promocionesProd.promGene !== undefined &&
			promocionesProd.promoProd !== undefined
		) {
			if (parseInt(productoActual.Valor) == $("#Valor").val()) {
				setTimeout(() => {
					validarPromociones(promocionesProd);
				}, 300);
			} else {
				$("#ValorTotal").html(
					'<strong> <label class="floating-label text-dark m-0 px-2" style="font-size: 14px;">Valor Total: </label></strong>' +
						'<strong><label class="floating-label text-dark bg-light m-0 py-1 px-2" style="font-size: 18px;"> $' +
						addCommas((+$("#Valor").val() * +cantidad).toFixed(0)) +
						'<hr class="m-0"></label></strong>'
				);
			}
		} else {
			$("#ValorTotal").html("");
			if (productoActual.PrecioAbierto.trim() != "S")
				$("#ValorTotal").html(
					'<strong> <label class="floating-label text-dark m-0 px-2" style="font-size: 14px;">Valor Total: </label></strong>' +
						'<strong><label class="floating-label text-dark bg-light m-0 py-1 px-2" style="font-size: 18px;"> $' +
						addCommas((+productoActual.ValorOriginal * +cantidad).toFixed(0)) +
						'<hr class="m-0"></label></strong>'
				);
		}
	} else if (promocionesProd == 1) {
		$("#ValorTotal").html("");
		if (productoActual.PrecioAbierto.trim() != "S")
			$("#ValorTotal").html(
				'<strong> <label class="floating-label text-dark m-0 px-2" style="font-size: 14px;">Valor Total: </label></strong> ' +
					'<strong><label class="floating-label text-dark bg-light m-0 py-1 px-2" style="font-size: 18px;"> $' +
					addCommas((+productoActual.ValorOriginal * +cantidad).toFixed(0)) +
					'<hr class="m-0"></label></strong>'
			);
	}
	$("input[name=Cantidad]").val(cantidad);
	if (productoActual.inventames != "S" && productoActual.estructura == "S") {
		if (itemsDisponibleProducto.length) {
			$("#cantMasProd").hide();
			$("#cantProducto").prop("disabled", true);
			if (editarProductoPedidoNuevo == -1) {
				$("#cantMasProd").show();
				$("#cantProducto").prop("disabled", false);
			}
			let validos = itemsDisponibleProducto.filter((it) => {
				if (it.Tipo != "V" && it.Tipo != "F") return true;

				if (
					$("[name=" + it.productoid + "]").length &&
					$("[name=" + it.productoid + "]").is(":checked")
				)
					return true;
			});
			if (
				validos.length > 0 &&
				!validarEstructuraHijos(validos, cantidad, true)
			) {
				if (accion == "sumar") {
					$("#cantMasProd").hide();
					$("#cantProducto").prop("disabled", true);
					$("input[name=Cantidad]").val(cantidad - 1);
				} else {
					$("input[name=Cantidad]").val(1);
				}
			}
			if (tercerosDesayuno.length && accion != "restar") {
				let catn = tercerosDesayuno.filter(
					(x) =>
						!x.ProductoDesayuno ||
						(x.ProductoDesayuno && !x.ProductoDesayuno.Id)
				);
				if (catn.length <= cantidad) {
					$("#cantMasProd").hide();
					$("input[name=Cantidad]").val(catn.length);
					$("#cantProducto").prop("disabled", true);
				}
			}
		} else {
			if ($DATOSMONTAJE["verInvEstrVent"] == "S") {
				$("#cantProductoCont").hide();
			}
		}
	} else if (productoActual.inventames == "S") {
		$("#cantMasProd").hide();
		$("#cantProducto").prop("disabled", true);
		if (editarProductoPedidoNuevo == -1) {
			$("#cantMasProd").show();
			$("#cantProducto").prop("disabled", false);
		}

		if (tercerosDesayuno.length && accion != "restar") {
			let catn = tercerosDesayuno.filter(
				(x) =>
					!x.ProductoDesayuno || (x.ProductoDesayuno && !x.ProductoDesayuno.Id)
			);
			if (catn.length <= cantidad) {
				$("#cantMasProd").hide();
				$("input[name=Cantidad]").val(catn.length);
				$("#cantProducto").prop("disabled", true);
				return;
			}
		}

		if ($DATOSMONTAJE.InventarioRojo == "S") return;

		if (accion != "restar" && +productoActual["invenactua"] <= cantidad) {
			if (accion == "sumar") {
				$("input[name=Cantidad]").val(cantidad);
			} else {
				$("input[name=Cantidad]").val(
					(+productoActual["invenactua"]).toFixed()
				);
			}
			$("#cantMasProd").hide();
			$("#cantProducto").prop("disabled", true);
		} else {
			if (+productoActual["invenactua"] == cantidad) {
				$("#cantMasProd").hide();
			}
		}
	}
}

function changeInputCantidadLetra(inputId, accion = "") {
	let input = $("#" + inputId);
	let dataStorage = input.data("storage");
	let minimo = input.data("min");
	let maximo = input.data("max");
	let cantidad = +input.val();

	if (accion == "sumar") {
		cantidad++;
	} else if (accion == "restar") {
		cantidad--;
	}

	if (cantidad < minimo) {
		cantidad = minimo;
	} else if (cantidad > maximo) {
		cantidad = maximo;
	}
	input.val(cantidad);

	localStorage.setItem(dataStorage, cantidad);

	$(document)
		.find(`.${dataStorage}`)
		.css({ "font-size": `${cantidad}px` });

	//Se hace la validación de la altura de la card
	disenoCard =
		localStorage.getItem("disenoProds") == null
			? 1
			: localStorage.getItem("disenoProds");
	baseHeight = disenoCard == 1 ? 135 : 100;
	if (
		localStorage.getItem("fontProds") != null &&
		localStorage.getItem("fontProds") > 12
	) {
		alto = localStorage.getItem("fontProds") - 12;
		alto = alto * (disenoCard == 1 ? 5 : 3);
		baseHeight += alto;
	}

	if (
		localStorage.getItem("fontPrecioProds") != null &&
		localStorage.getItem("fontPrecioProds") > 14
	) {
		alto = localStorage.getItem("fontPrecioProds") - 14;
		alto = alto * (disenoCard == 1 ? 3 : 1.1);
		baseHeight += alto;
	}

	$(document)
		.find(".producto-menu")
		.css({ height: `${baseHeight}px` });
}

function accionBotonesMesa() {
	$("#btnCambioMesas").click(function () {
		cambiarMesas = !$("#btnUnificarMesas").prop("disabled");
		$(this).css("border", cambiarMesas ? "solid 2px #9ccc65" : "none");
		$("#zonaMesa, #btnUnificarMesas, #btnMesasTemporales").prop(
			"disabled",
			cambiarMesas
		);
		setearVarMesas(cambiarMesas);
		$("#texto-boton-mesa").text(
			cambiarMesas ? "Seleccione la mesa a Cambiar" : ""
		);
		$("#tituloModalUnificarMesa").text("Cambiar Mesa");
	});

	$("#btnUnificarMesas").click(function () {
		unificarMesas = !$("#btnCambioMesas").prop("disabled");
		$(this).css("border", unificarMesas ? "solid 2px #9ccc65" : "none");
		$("#zonaMesa, #btnCambioMesas, #btnMesasTemporales").prop(
			"disabled",
			unificarMesas
		);
		setearVarMesas(unificarMesas);
		$("#texto-boton-mesa").text(
			unificarMesas ? "Seleccione la mesa a unificar" : ""
		);
		$("#tituloModalUnificarMesa").text("Unificar Mesas");
	});

	$("#btnMesasTemporales").click(function () {
		let agregar = !$(this).data("seleccion");
		$(this).css("border", agregar ? "solid 2px #6c757d" : "none");
		$("#zonaMesa, #btnCambioMesas, #btnUnificarMesas").prop(
			"disabled",
			agregar
		);
		$(this).data("seleccion", agregar);
		if (
			!$(".modal-mesas-activar.show").length &&
			!$("#modal-solicitar-usuario.show").length
		) {
			let datos = {
				zona: $("#zonaMesa").val(),
			};
			obtenerInformacion(datos, "mesasTemporales", "datosMesasTemporales");
		}
	});
}

function datosMesasTemporales({ datos }) {
	$("#lista-mesas-activar").empty();
	$("#btnCargarMesasTemporales")
		.removeClass("disabled")
		.prop("disabled", false);
	datos.forEach((it) => {
		$("#lista-mesas-activar")
			.append(`<div class="form-group col-3" style="cursor: pointer;" >
			<div class="custom-control custom-switch input-mesa-temp" data-mesa="${
				it.MesaId
			}" data-origi="${it.Activo}" data-mesaup="${it.Id}" data-consu="${
			it.CantConsu
		}" data-modificado="0">
				<input  type="checkbox" ${it.CantConsu > 0 ? "disabled" : ""} ${
			it.CantConsu > 0 || it.Activo ? "checked" : ""
		} class="custom-control-input ${
			it.CantConsu > 0 ? "custom-control-input-warning" : ""
		}" name="Mesa${it.MesaId}" id="Mesa${it.MesaId}">
				<label class="custom-control-label" for="Mesa${it.MesaId}">${it.MesaId}</label>
			</div>
		</div>`);
	});
	if (!datos.length) {
		$("#btnCargarMesasTemporales").addClass("disabled").prop("disabled", true);
		$("#lista-mesas-activar").html(
			'<div class="text-center w-100">No hay mesas temporales disponibles</div>'
		);
	}
	abrirCerrarModal(".modal-mesas-activar", "show");
	$(document).on("change", ".input-mesa-temp", function () {
		if ($(this).data("consu") > 0) {
			alertify.warning("La mesa tiene una cuenta cargada.");
			return;
		}
		let validate = $(this).find("input").is(":checked") ? "1" : "0";
		$(this).attr(
			"data-modificado",
			validate == $(this).data("origi") ? "0" : "1"
		);
	});
}

function setearVarMesas(valor) {
	mesaUno = valor ? mesaUno : null;
	mesaDos = valor ? mesaDos : null;
}

function borrarCuentaProductoPedido(resp) {
	abrirCerrarModal("#modal-solicitar-usuario", "hide");
	if (formValidateDataUser) {
		let mensaje = `¿Esta seguro de borrar la cuenta?`;
		if (formValidateDataUser === "producto") {
			mensaje = `¿Esta seguro de eliminar el producto de la cuenta?`;
		}
		alertify.confirm(
			"Alerta",
			mensaje,
			function (ok) {
				if (arrayProductosPedido[editarProductoPedidoNuevo]) {
					if (
						arrayProductosPedido[editarProductoPedidoNuevo]["Imprime"] == "P" &&
						arrayProductosPedido[editarProductoPedidoNuevo]["Despachado"] == "P"
					) {
						$("#formObservacionBorrar").submit();
						return;
					}
				}
				obtenerInformacion({}, "tiposDevoluciones", "dataTiposDevoluciones");
			},
			function (err) {
				formValidateDataUser = null;
				console.log("Error ", err);
			}
		);
	} else {
		alertify.warning("No se ha podido eliminar el producto.");
	}
}

function dataTiposDevoluciones({ datos, tipo }) {
	$("#tipoLista").html("");
	if (datos.length) {
		datos.forEach((item) => {
			$("#tipoLista").append(`<div class="col-3 p-1">
				<div class="card mb-1 h-100" style="box-shadow: none !important;">
					<div class="card-body p-1" onclick='tipoDevolucionCortesia(${JSON.stringify(
						item
					)}, "${tipo}")' style="border:2px solid #d4d4d4; cursor:pointer; border-radius: 5px; height: 80px;">
						<div class="container-item text-center" style="font-size: 13px; text-overflow: ellipsis; white-space: break-spaces;overflow: hidden;">${
							tipo === "cortesia" ? item.TipoCortId + " - " : ""
						} ${item.nombre ? item.nombre : item.Nombre}</div>
					</div>
				</div>
			</div>`);
		});
	} else {
		$("#tipoLista").append(`<div class="col-12 text-center p-1">
			No hay informacion disponible
		</div>`);
	}
	$("#tituloModalDevolucion").text(
		"Tipos de " + (tipo == "cortesia" ? "Cortesia" : "Devolución")
	);
	abrirCerrarModal(
		"#tiposDevolucionCortesia",
		"show",
		"#modal-solicitar-usuario",
		"hide"
	);
}

function tipoDevolucionCortesia(devolucion, tipo) {
	tipoDevolucionSeleccionada = devolucion;
	if (arrayProductosPedido[editarProductoPedidoNuevo]) {
		arrayProductosPedido[editarProductoPedidoNuevo]["tipodevol"] =
			devolucion.tipodevoid;

		if (formValidateDataUser == "producto" || formValidateDataUser == "venta") {
			abrirCerrarModal(
				"#observa-factura-borrar",
				"show",
				"#tiposDevolucionCortesia",
				"hide"
			);
		} else if (productoActual.Cantidad > dataAnteriorProducto.Cantidad) {
			abrirCerrarModal(
				"#observa-factura-borrar",
				"show",
				"#tiposDevolucionCortesia",
				"hide"
			);
		} else {
			editarProductoPedidoNuevo = -1;
			abrirCerrarModal("#modal-solicitar-usuario", "hide");
			guardarProducto();
		}
	} else {
		abrirCerrarModal(
			"#observa-factura-borrar",
			"show",
			"#tiposDevolucionCortesia",
			"hide"
		);
	}
}

function observacionesProducto(lista, producto, datosObservaciones, modal) {
	$(lista).html("");
	let elegidos = [];
	if (producto.inventario) {
		elegidos = producto.inventario.filter((op) => op.Tipo == "O" && op.elegido);
	}
	datosObservaciones.forEach((it) => {
		let checked = it.elegido;
		if (elegidos.length) {
			let enc = elegidos.find((x) => x.EstructuraId == it.EstructuraId);
			checked = enc ? enc.elegido : false;
		}
		$(lista).append(`<div class="col-12 custom-control custom-switch pr-0">
			<input type="checkbox" ${
				checked ? "checked" : ""
			} class="custom-control-input" name="${it.EstructuraId}" id="item${
			it.EstructuraId
		}">
			<label class="custom-control-label" for="item${it.EstructuraId}">${
			it.nombre
		}</label>
		</div>`);
	});
	abrirCerrarModal(modal, "show");
}

function datosReservas(reservas) {
	let estructura = "";
	$(`#lista-reservas-${tabReserva}`).empty();
	let tiempoEspera = zonaMesaActual["TiempoEsperaReserva"]
		? +zonaMesaActual["TiempoEsperaReserva"]
		: 0;
	reservas.forEach((item) => {
		let string = `<a href="#" class="list-group-item list-group-item-action flex-column align-items-start p-2 bor-bottom item-reserva" data-reserva="${
			item.Id
		}" onMouseOver="this.style.borderBottomColor = '${
			item.ColorEstado
		}'" onMouseOut="this.style.borderBottomColor = '#e1e1e1'">
			<div class="d-flex justify-content-between">
				<div>
					<div class="d-flex w-100 justify-content-between align-items-center">
						<h5 class="mb-1 text-truncate pr-2">${toTitleCase(item.nombre)}</h5>
						<!-- <small>${item.Hora}</small> -->
					</div>
					<small>Reserva en la mesa ${item.MesaId} a las ${item.Hora}</small>
				</div>
				${
					tabReserva == "proximas"
						? `<i class="fas fa-clock m-1 align-self-center text-primary"></i>`
						: tabReserva == "confirmadas"
						? `<i class="fas fa-check m-1 align-self-center text-primary"></i>`
						: tabReserva == "superadas"
						? `<i class="fas fa-times m-1 align-self-center text-danger"></i>`
						: ""
				}
			</div>
		</a>`;
		let horaMas = moment(item.Inicio).add(tiempoEspera, "minutes");
		if (
			tabReserva == "proximas" &&
			item["Estado"] == "CN" &&
			moment().isBefore(horaMas)
		) {
			estructura += string;
		} else {
			if (
				tabReserva == "confirmadas" &&
				moment().isBefore(moment(item.Fin)) &&
				item["Estado"] == "EM"
			) {
				estructura += string;
			} else if (moment().isSameOrAfter(horaMas)) {
				if (item["Estado"] == "CN" && item.consumo == null) {
					let data = {
						reserva: item["Id"],
						estadoReserva: "CC",
						fecha: moment(item["Inicio"]).format("YYYY-MM-DD"),
						horas: moment(item["Inicio"]).format("HH"),
						zona: zonaMesaActual["ZonaId"],
					};
					obtenerInformacion(
						data,
						"modificarEstadoReserva",
						"estadoReservaModificado"
					);
				} else if (
					tabReserva == "superadas" &&
					item["Estado"] == "CC" &&
					item["Cancelacion"] == null
				) {
					estructura += string;
				}
			}
		}
	});
	if (!reservas.length) {
		$(`#lista-reservas-${tabReserva}`).html(
			'<div class="text-center">No hay reservas disponibles</div>'
		);
	} else {
		$(`#lista-reservas-${tabReserva}`).html(
			estructura != ""
				? estructura
				: '<div class="text-center">No hay reservas disponibles</div>'
		);
		$(".item-reserva").click(function () {
			reservaActual = reservasActuales.find(
				(op) => op.Id == $(this).data("reserva")
			);
			if (reservaActual["Estado"] == "CN" || reservaActual["Estado"] == "EM") {
				if (tabReserva == "proximas") {
					alertify.confirm(
						"Alerta",
						`¿La persona ${reservaActual["nombre"]} ha llegado a la reserva?`,
						function (ok) {
							let data = {
								reserva: reservaActual["Id"],
								estadoReserva: "EM",
								fecha: moment(reservaActual["Inicio"]).format("YYYY-MM-DD"),
								horas: moment(reservaActual["Inicio"]).format("HH"),
								zona: zonaMesaActual["ZonaId"],
							};
							obtenerInformacion(
								data,
								"modificarEstadoReserva",
								"estadoReservaModificado"
							);
						},
						function (err) {
							console.error("Error ", err);
						}
					);
				} else {
					$("#numeroAccion").val(reservaActual["TerceroID"]);
					$("#btnBuscarTercero").click();
					$("#NumeroPersonas").val(reservaActual["Personas"]);
					idMesaActual = reservaActual["MesaId"];
					$("#cuentasPendienteMesa").html("");
					abrirCerrarModal(".bd-accion-modal-sm", "show");
					let mesa = mesasPlano.find(
						(it) => it["MesaId"] == reservaActual["MesaId"]
					);
					if (mesa) {
						$("#NumeroPersonas").attr("max", mesa.MaximoPersonas);
					}
				}
			} else {
				let next = moment().isAfter(
					moment(reservaActual.Inicio).add(tiempoEspera, "minutes")
				);
				if (next) {
					alertify.warning(
						"La reserva ya sobrepaso el tiempo maximo de espera."
					);
					return;
				}
			}
		});
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

function facturarPedido(consumoActualesPedido = []) {
	let data = {
		cargarCuentaPendiente,
		accesoCargarCuentaHotel,
		propinaPedido: (propinaPedido + "").split(",").join(""),
		accionPos,
		facturarConsumo: true,
		imprimirDevolucionConsumo,
		vendedorCarga: vendedorElegido || "",
		mesaId: idMesaActual,
		terceroIdPedido,
		terceroId: terceroPedidoEmpresa["TerceroID"]
			? terceroPedidoEmpresa["TerceroID"]
			: terceroIdPedido,
		CodigEstru: tipoVentaSeleccionado.CodigEstru || null,
		reservaHotel:
			accesoCargarCuentaHotel && reservaHotel > 0 ? reservaHotel : null,
		habitacionHotel:
			accesoCargarCuentaHotel &&
			reservaHotel > 0 &&
			habitacionHotel &&
			habitacionHotel != ""
				? habitacionHotel
				: null,
		AlmacenNoFisico: $INFOALMACEN.NoFisico,
		almacenid: $INFOALMACEN["almacenid"],
		soloDesayunoTerceros: [],
		HeadReservaHotel: HeadReservaIdHotel ? HeadReservaIdHotel : null,
		consumoActualesPedido: consumoActualesPedido,
		accionPedido: accionTercero,
		cargarCuentaEvento,
		EventoId: EventoId ? EventoId : null,
	};
	if (accesoCargarCuentaHotel && tercerosDesayuno.length) {
		data.soloDesayunoTerceros = tercerosDesayuno.map((x) => x.TerceroID);
	}
	obtenerInformacion(data, "facturarCuenta", "redirigirFacturar");
}

function redirigirFacturar(resp) {
	if (resp.idsPendientes) {
		sessionStorage.setItem("PFD", JSON.stringify(resp.idsPendientes));
	}
	$.redirectPost(
		base_url() + "Administrativos/Servicios/EstadoCuenta/Facturador",
		{
			consumos: JSON.stringify(resp.idInsertado),
			AlmacenId: $AlmacenId,
			TerceroId: terceroPedidoEmpresa["TerceroID"]
				? terceroPedidoEmpresa["TerceroID"]
				: terceroIdPedido,
			tipoVentaSeleccionado: JSON.stringify(tipoVentaSeleccionado),
			accionPos: accionPos,
			VendedorId: vendedorElegido,
			arrayProductosPedido: JSON.stringify(arrayProductosPedido),
			ConAccion: pedidoSinAccion,
			MesaId: idMesaActual ? idMesaActual : null,
			reservaHotel: reservaHotel + "",
			AccionPedido: accionTercero,
			reactivarConsumo: reactivarConsumo,
			datosTerceroReactivar: JSON.stringify(datosTerceroReactivar),
			numeroPersonasReactivar: numeroPersonasReactivar || 0,
			codBarraTercero: codBarraTercero,
			habitacionHotel:
				!habitacionHotel || habitacionHotel == "" ? null : habitacionHotel,
			terceroPedidoEmpresa: JSON.stringify(terceroPedidoEmpresa),
			dataTerceroPendiente: JSON.stringify(dataTerceroPendiente),
			ventanaCambioPedido: ventanaCambioPedido ? "S" : "N",
			almacenOriginal: dataOriginal.almacen.almacenid,
			factElectronicaDirecta: factElectronicaDirecta,
			dataFechasHotel: JSON.stringify(dataFechasHotel),
			HeadReservaIdHotel: HeadReservaIdHotel,
			TerceroIdConsumo: terceroIdPedido,
			consumosOcultos: $(".btnOcultarConsumos").hasClass("ocultarConsumos"),
		}
	);
}

function guardarCuenta() {
	/* Filtramos los nuevos y organizamos la informacion según la tabla */
	let data = {
		cargarCuentaPendiente,
		accesoCargarCuentaHotel,
		propinaPedido: (propinaPedido + "").split(",").join(""),
		accionPos,
		facturarConsumo: false,
		imprimirDevolucionConsumo,
		vendedorCarga: vendedorElegido || "",
		mesaId: idMesaActual,
		terceroIdPedido,
		terceroId: terceroPedidoEmpresa["TerceroID"]
			? terceroPedidoEmpresa["TerceroID"]
			: terceroIdPedido,
		CodigEstru: tipoVentaSeleccionado.CodigEstru || null,
		reservaHotel:
			accesoCargarCuentaHotel && reservaHotel > 0 ? reservaHotel : null,
		habitacionHotel:
			accesoCargarCuentaHotel &&
			reservaHotel > 0 &&
			habitacionHotel &&
			habitacionHotel != ""
				? habitacionHotel
				: null,
		AlmacenNoFisico: $INFOALMACEN.NoFisico,
		almacenid: $INFOALMACEN["almacenid"],
		soloDesayunoTerceros: [],
		HeadReservaHotel: HeadReservaIdHotel ? HeadReservaIdHotel : null,
		consumoActualesPedido: [],
		accionPedido: accionTercero,
		cargarCuentaEvento,
		EventoId: EventoId ? EventoId : null,
	};

	if (accesoCargarCuentaHotel && tercerosDesayuno.length) {
		if (arrayProductosPedido.length) {
			// data.soloDesayunoTerceros = tercerosDesayuno.map(x => x.TerceroID);
			data.soloDesayunoTerceros = arrayProductosPedido.map((x) => x.Id);
		} else {
			return alertify.warning(
				"No se encontraron desayunos agregados al pedido"
			);
		}
	}

	obtenerInformacion(data, "agregarCuenta", "cuentaFinalizada");
}

function guardarProducto() {
	if (accesoCargarCuentaHotel && tercerosDesayuno.length) {
		obtenerProductosTercerosDesayuno();
	} else {
		let datos = [];

		if (prodsAgregarNew.length) {
			datos = organizarDataConsumo(prodsAgregarNew, terceroIdPedido, true);

			let infor = {
				datos: datos,
				mesaId: idMesaActual || false,
				tercero: ("" + terceroIdPedido).trim(),
				accion: accionTercero,
				almacenid: $INFOALMACEN["almacenid"],
				AlmacenNoFisico: $INFOALMACEN.NoFisico,
				soloDesayuno: tercerosDesayuno.length > 0 ? 1 : 0,
				headReservaHotel: tercerosDesayuno.length > 0 ? HeadReservaIdHotel : 0,
				terceroEmpresa:
					terceroPedidoEmpresa && terceroPedidoEmpresa.TerceroID
						? ("" + terceroPedidoEmpresa.TerceroID).trim()
						: null,
			};

			obtenerInformacion(
				infor,
				"agregarProductoCuenta",
				"productoAgregadoCuenta"
			);
		} else {
			alertify.warning("No se encontraron productos agregados");
		}
	}
}

function modalaccionesTercero(acciones, elemento = null) {
	let estructura = "";
	$("#accionesCargarCuenta").html(estructura);
	acciones.forEach((it) => {
		estructura += `<div title="Accion" class="m-b-10 d-flex border rounded btnAccionCargar" style="align-items: center; cursor:pointer;" data-info="${it.AccionId}">
			<div class="pl-3" style="width: 100%;">
				<h6>${it.AccionId}</h6>
				<p class="m-b-0">${it.Tipo}</p>
			</div>
			<button type="button" title="Accion" class="btn btn-sm btn-secondary" style="max-height: 75px; height: 75px;">
				<i class="fas fa-share-square"></i>
			</button>
		</div>`;
	});
	$("#accionesCargarCuenta").html(estructura);
	abrirCerrarModal(
		".bd-accion-modal-sm",
		"hide",
		"#modal-accion-tercero",
		"show"
	);
	$(".btnAccionCargar")
		.unbind()
		.click(function () {
			accionTercero = $(this).data("info");
			if (elemento) {
				abrirCerrarModal("#modal-accion-tercero", "hide");
				cuentaTerceroConsumo["Accion"] = accionTercero;
				if (cuentaTerceroConsumo.datosCliente) {
					let tempData = Object.assign({}, cuentaTerceroConsumo);
					delete tempData.datosCliente;
					tempData.TerceroID = tempData.TerceroId;
					tempData.AccionId = accionTercero;
					terceroPedidoEmpresa = tempData;
				}
				seleccionTercero(elemento);
			} else {
				abrirCerrarModal(
					"#modal-accion-tercero",
					"hide",
					".bd-accion-modal-sm",
					"show"
				);
				$(".propAccionId").text(accionTercero);
				let tercero = $(".propTerceroID").text();
				let pos = tercerosAccion.findIndex((op) => op.TerceroID == tercero);
				tercerosAccion[pos]["AccionId"] = accionTercero;
				if (tercerosAccion[pos]["TipoDocumento"] == "31") {
					terceroPedidoEmpresa = tercerosAccion[pos];
					/* Se agrega para cuando salga la modal de accion, si es cambio de socio cambie la accion por el tercero nuevo */
					if (cambiarSocioCuenta) {
						$(".propAccionId").html(accionTercero);
					} else {
						$(".empresa-datos").html(
							`<strong>Empresa:</strong> ${tercerosAccion[pos]["Nombre"]} - <strong>Nit:</strong> ${tercerosAccion[pos]["TerceroID"]} - <strong>Acción:</strong> ${accionTercero}`
						);
						$("#numeroAccion").val(accionTercero);
						$("#btnBuscarTercero").click();
					}
				}
				setTimeout(() => {
					$("#NumeroPersonas").focus();
				}, 700);
			}
		});
}

function cuentaPendienteBorrado({ mensaje }) {
	permisoAccionActual = null;
	alertify.success(mensaje);
	informacionMesa(accionPos != "general" ? idMesaActual : false);
}

function darBajaProductoPedido(resp) {
	abrirCerrarModal("#modal-solicitar-usuario", "hide");
	alertify.confirm(
		"Alerta",
		`¿Esta seguro de dar de baja ${
			formValidateDataUser == "venta" ? "a los productos" : "al producto"
		}? <br> El comprobante de Dar de Baja se podra visualizar una vez.`,
		function (ok) {
			let data = {
				tercero: terceroIdPedido,
				mesa: idMesaActual,
				accion: accionTercero,
				imprimir: 0,
				UsuarioIdAprueba:
					usuarioIdA === "undefined" || usuarioIdA == null ? null : usuarioIdA,
			};
			if (formValidateDataUser === "producto") {
				data["Id"] = arrayProductosPedido[editarProductoPedidoNuevo]["Id"];
				data["Producto"] =
					arrayProductosPedido[editarProductoPedidoNuevo]["ProductoId"];
				data["Pendiente"] =
					arrayProductosPedido[editarProductoPedidoNuevo]["pendiente"];
			} else {
				let prods = [];
				$.each($(".platos-pedido-item.dar-baja-producto"), (pos, ele) => {
					prods.push($(ele).data("idcom"));
				});
				data["productos"] = prods;
			}
			obtenerInformacion(data, "darDeBajaProducto", "impresionDarDeBaja");
		},
		function (err) {
			darBajaVenta = false;
			$(".platos-pedido-item button").attr("disabled", false);
			console.log("Error ", err);
		}
	);
}

function impresionDarDeBaja(data) {
	if (data.idConsumos.length) {
		alertify.success(data.mensaje, 1, () => {
			let insertados = data.idConsumos.join("-");
			if (
				typeof tipoVentaSeleccionado.impresion == "undefined" ||
				tipoVentaSeleccionado.impresion == null
			) {
				tipoVentaSeleccionado.impresion = 1;
			}

			informacionMesa(accionPos != "general" ? idMesaActual : false);
			if (formValidateDataUser === "producto") {
				abrirCerrarModal("#ElegirVendedor", "hide");
			} else {
				$("#btnCancelarProceso").click();
			}

			abrirReporte(
				`${base_url()}reportes/imprimirDarDeBaja/${insertados}/${
					tipoVentaSeleccionado.codiventid
				}/${tipoVentaSeleccionado.impresion}`
			);
		});
	} else {
		alertify.error(data.mensaje);
	}
}

function sincronizarConsumo() {
	let data = {
		mesaId: idMesaActual || false,
		tercero: terceroIdPedido,
		accion: accionTercero,
		almacenid: $INFOALMACEN["almacenid"],
		AlmacenNoFisico: $INFOALMACEN.NoFisico,
		soloDesayuno: tercerosDesayuno.length > 0 ? 1 : 0,
		headReservaHotel: tercerosDesayuno.length > 0 ? HeadReservaIdHotel : 0,
		terceroEmpresa:
			terceroPedidoEmpresa && terceroPedidoEmpresa.TerceroID
				? ("" + terceroPedidoEmpresa.TerceroID).trim()
				: null,
	};
	obtenerInformacion(data, "productosConsumo", "consumoProductosTercero");
}

function socioValidoConfirmarConsumo(resp) {
	alertify.confirmacionConsumo(
		"Consumo de " + $(".clientePedido:first").text()
	);
}

function consumoAceptado(resp) {
	alertify.success(resp.mensaje);
	sincronizarConsumo();
}

alertify.dialog(
	"confirmacionConsumo",
	function () {
		return {
			setup: function () {
				var setup = alertify.confirm().setup();
				setup.buttons = [
					{
						text: "Aceptar",
						scope: "primary",
						className: "btn btn-success",
					},
					{
						text: "Rechazar",
						scope: "primary",
						className: "btn btn-danger",
					},
					{
						text: "Cancelar",
						scope: "primary",
						className: "btn btn-secondary",
					},
				];
				setup.options.title = "¿Que desea realizar con el consumo?";
				return setup;
			},
			main: function (message, efectivo, fpago, credito, compartircuenta) {
				this.message = message;
			},
			prepare: function () {
				this.setContent(this.message);
			},
			callback: function (closeEvent) {
				let { index } = closeEvent;
				if (index == 0 || index == 1) {
					irAceptarRechazarConsumo(!index);
				} else {
					alertify.confirm().callback.call(this, closeEvent);
				}
			},
			hooks: {
				onshow: function () {
					$(".btnTooltip").tooltip();
					$(".btnTooltip").each(function () {
						$(this).on("click", function (e) {
							e.stopPropagation();
						});
					});
				},
			},
		};
	},
	false,
	"confirm"
);

function irAceptarRechazarConsumo(valorConfirmacion) {
	alertify.confirm(
		"Alerta",
		`¿Esta seguro de ${
			valorConfirmacion ? "aceptar" : "rechazar"
		} el consumo de ${$(".clientePedido:first").text()}?`,
		function (evt, value) {
			let data = {
				confirmacion: valorConfirmacion,
				mesa: idMesaActual,
				tercero: terceroIdPedido,
				accion: accionTercero,
			};
			obtenerInformacion(data, "consumoAceptar", "consumoAceptado");
		},
		function () {}
	);
}

function itemsProductoAgrandar(resp) {
	let { disponibles } = resp;
	abrirCerrarModal(".bd-Variables", "hide", ".modal-agrandamientos", "show");
	$("#listaAgrandamientos").empty();
	disponibles.forEach((item) => {
		let prod = itemsDisponibleProducto.find(
			(it) => it.productoid == item.ProductoAgrandar
		);
		let check = false;
		if ((prod && prod.ActualAgrandamiento) || item.elegido) check = true;
		$("#listaAgrandamientos")
			.append(`<div class="col-12 custom-control custom-switch pr-0">
			<input type="checkbox" ${
				check ? "checked" : ""
			} class="custom-control-input" name="${item.ProductoAgrandar}" id="item${
			item.ProductoAgrandar
		}">
			<label class="custom-control-label" for="item${item.ProductoAgrandar}">${
			item.nombre
		}</label>
		</div>`);
	});
	$("#formAgrandamientos").submit(function (e) {
		e.preventDefault();
		let $fills = $("#formAgrandamientos input");
		let data = [];
		$.each($fills, (pos, input) => {
			const name = $(input).attr("name");
			let enc = disponibles.find((op) => op.ProductoAgrandar == name);
			if (enc && $(input).prop("checked")) {
				enc["elegido"] = true;
				enc["checked"] = true;
				enc["ActualAgrandamiento"] = true;
				data.push(enc);
			}
		});
		itemsDisponibleProducto = itemsDisponibleProducto
			.filter((it) => !it.ActualAgrandamiento)
			.concat(data);
		abrirCerrarModal(".modal-agrandamientos", "hide", ".bd-Variables", "show");
	});
}

!alertify.propinaAlert &&
	alertify.dialog("propinaAlert", function factory() {
		return {
			main: function (content, callback) {
				this.set("callback", callback);
				this.setContent(content);
			},
			setup: function () {
				return {
					options: {
						maximizable: false,
						resizable: false,
						title: "Propina",
						closable: false,
					},
					buttons: [
						{
							text: "Aceptar",
							key: 13,
							className: alertify.defaults.theme.ok,
						},
						{
							text: "Cancelar",
							key: 27,
							className: alertify.defaults.theme.cancel,
							cancel: true,
						},
					],
				};
			},
			settings: {
				selector: undefined,
				callback: undefined,
			},
			hooks: {
				onclose: function () {},
				onshow: function () {
					punto = false;
					$("#propinaInput")
						.unbind()
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
							integerDigits: 9,
							allowPlus: false,
							allowMinus: false,
						})
						.val(propinaPedido);

					$(document).find(".ajs-content .tecladoNumerico").remove();
					$(".tecladoNumerico")
						.clone()
						.appendTo($($(document).find(".ajs-content")))
						.removeClass("d-none");
				},
			},
			callback: function (closeEvent) {
				$(document).find(".ajs-content .tecladoNumerico").remove();
				if (closeEvent.index == 0) {
					propinaPedido = $("#propinaInput").val();
					guardarCuenta();
				} else {
					accesoCargarCuentaHotel = false;
				}
			},
		};
	});

$(document)
	.on("mousedown", ".teclado7", function (e) {
		e.preventDefault();
		// 103
		tecladoNumericoTouch("7");
	})
	.on("click", ".teclado8", function (e) {
		e.preventDefault();
		// 104
		tecladoNumericoTouch("8");
	})
	.on("click", ".teclado9", function (e) {
		e.preventDefault();
		// 105
		tecladoNumericoTouch("9");
	})
	.on("click", ".teclado4", function (e) {
		e.preventDefault();
		// 100
		tecladoNumericoTouch("4");
	})
	.on("click", ".teclado5", function (e) {
		e.preventDefault();
		// 101
		tecladoNumericoTouch("5");
	})
	.on("click", ".teclado6", function (e) {
		e.preventDefault();
		// 102
		tecladoNumericoTouch("6");
	})
	.on("click", ".teclado1", function (e) {
		e.preventDefault();
		// 97
		tecladoNumericoTouch("1");
	})
	.on("click", ".teclado2", function (e) {
		e.preventDefault();
		// 98
		tecladoNumericoTouch("2");
	})
	.on("click", ".teclado3", function (e) {
		e.preventDefault();
		// 99
		tecladoNumericoTouch("3");
	})
	.on("click", ".tecladoBorrar", function (e) {
		e.preventDefault();
		// 46
		var text = $(".alertify:not(.ajs-hidden)").find("input:eq(0)")[0];
		var t = text.value.substr(
			text.selectionStart,
			text.selectionEnd - text.selectionStart
		);
		var value = $(".alertify:not(.ajs-hidden)").find("input:eq(0)").val();
		if (value != "") {
			if (t == value && value != "") {
				value = "0";
			} else {
				value = value.replace(/,/g, "");
				value = parseFloat(value);
			}
			if (value != "") {
				value = parseFloat(value);
				var remover = 1;
				if (
					value - Math.floor(value) > 0 &&
					(value + "").split(".")[1].length == 1
				) {
					remover = 2;
				}
				value += "";
				value = value.substring(0, value.length - remover);
			}
		}
		setTimeout(function () {
			click = true;
			$(".alertify:not(.ajs-hidden)").find("input:eq(0)").val(value).focus();
		}, 0);
		$(".alertify:not(.ajs-hidden)")
			.find("input:eq(0)")
			.attr("data-valor", value);
	})
	.on("click", ".teclado0", function (e) {
		e.preventDefault();
		// 96
		tecladoNumericoTouch("0");
	})
	.on("click", ".tecladoPunto", function (e) {
		e.preventDefault();
		// 110
		var text = $(".alertify:not(.ajs-hidden)").find("input:eq(0)")[0];
		var t = text.value.substr(
			text.selectionStart,
			text.selectionEnd - text.selectionStart
		);
		var value = $(".alertify:not(.ajs-hidden)").find("input:eq(0)").val();
		punto = true;
		if (t == value && value != "") {
			value = "0.";
		} else {
			value = value.replace(/,/g, "");
			value = parseFloat(value);
			if (isNaN(value)) {
				value = "0.";
			}
			punto = true;
			if (value != "" && value - Math.floor(value) > 0) {
				value = Math.trunc(value);
			}
		}
		setTimeout(function () {
			click = true;
			$(".alertify:not(.ajs-hidden)").find("input:eq(0)").val(value).focus();
		}, 0);
		$(".alertify:not(.ajs-hidden)")
			.find("input:eq(0)")
			.attr("data-valor", value);
	});

function tecladoNumericoTouch(numero) {
	var text = $(".alertify:not(.ajs-hidden)").find("input:eq(0)")[0];
	var t = text.value.substr(
		text.selectionStart,
		text.selectionEnd - text.selectionStart
	);
	var value = $(".alertify:not(.ajs-hidden)").find("input:eq(0)").val();
	var decimales = 2;

	if (t == value && value != "") {
		value = "0";
		if (numero == 0) {
			punto = false;
			setTimeout(function () {
				click = true;
				$(".alertify:not(.ajs-hidden)").find("input:eq(0)").val(value).focus();
			}, 0);
			$(".alertify:not(.ajs-hidden)")
				.find("input:eq(0)")
				.attr("data-valor", value);
			return false;
		}
	} else {
		value = value.replace(/,/g, "");
		value = parseFloat(value);
		value += "";
	}

	var valorAnterior = $(".alertify:not(.ajs-hidden)")
		.find("input:eq(0)")
		.attr("data-valor");
	if (isNaN(valorAnterior)) {
		valorAnterior = "0";
	}
	if (isNaN(value)) {
		value = "0";
	}

	if (valorAnterior.indexOf(".") == -1) {
		valorAnterior = parseFloat(value);
	}
	value = valorAnterior + "";
	if (value.substr(-1) == "0" && value.indexOf(".") > -1) {
		value += numero;
	}

	if (
		(valorAnterior == "0" && numero == "0") ||
		(typeof valorAnterior !== "number" &&
			valorAnterior != "" &&
			(valorAnterior + "").split(".")[1].length >= decimales)
	) {
		setTimeout(function () {
			click = true;
			$(".alertify:not(.ajs-hidden)").find("input:eq(0)").focus();
		}, 0);
		return;
	}

	if (punto && isNaN(value)) {
		value = "0.";
	}

	if (punto && value.indexOf(".") == -1) {
		value += ".";
	}
	if (typeof value !== "string" && isNaN(value)) {
		value = numero;
	} else {
		if (
			typeof valorAnterior !== "number" &&
			valorAnterior.substr(-1) == "0" &&
			valorAnterior.indexOf(".") > -1
		) {
			value = valorAnterior;
			value += numero;
		} else {
			value += numero;
		}
	}

	punto = false;
	setTimeout(function () {
		click = true;
		$(".alertify:not(.ajs-hidden)").find("input:eq(0)").val(value).focus();
	}, 0);
	$(".alertify:not(.ajs-hidden)").find("input:eq(0)").attr("data-valor", value);
}

function datosHabitacionBuscar({ datos }) {
	$("#dataHabHotel").show();
	$("#HabitacionPedido").html("");
	if (datos.length) {
		let estruc = "";
		datos.forEach((it) => {
			estruc += `<option value="${it.HabitacionId}">${it.nombre}</option>`;
		});
		$("#HabitacionPedido").html(estruc);
		$("#HabitacionPedido")
			.unbind()
			.change(function () {
				$("#desayunoHabitacion").html("");
				$(".empresa-datos").html(``);
				terceroPedidoEmpresa = {};
				if ($("#HabitacionPedido").val() != "") {
					let hab = datos.find(
						(op) => op.HabitacionId == $("#HabitacionPedido").val()
					);
					if (hab.AplicaDesayuno == "S") {
						$("#desayunoHabitacion").html(
							`<b>Desayunos: ${+hab.TotalDesayuno}/${+hab.TotalTerceros}</b>`
						);
					}
					$("#btnBuscarTercero").click();
				} else {
					alertify.warning("Seleccione una habitación");
				}
			});
		$("#btnBuscarHabitacion")
			.unbind()
			.click(function () {
				$("#HabitacionPedido").change();
			});
		$("#HabitacionPedido").change();
	} else {
		$("#HabitacionPedido").html(
			'<option value="">No hay habitaciones disponibles</option>'
		);
	}
}

function datosEventosBuscar({ datos }) {
	$("#dataHabHotel").hide();
	$("#EventosPedido").html("");
	if (datos.length) {
		let estruc = "";
		datos.forEach((it) => {
			estruc += `<option value="${it.EventoId}">${it.Nombre}</option>`;
		});
		$("#EventosPedido").html(estruc);
		$("#EventosPedido")
			.unbind()
			.change(function () {
				$(".empresa-datos").html(``);
				terceroPedidoEmpresa = {};
				if ($("#EventosPedido").val() != "") {
					$("#btnBuscarTercero").click();
				} else {
					alertify.warning("Seleccione una habitación");
				}
			});

		$("#btnBuscarEvento")
			.unbind()
			.click(function () {
				$("#EventosPedido").change();
			});
		$("#EventosPedido").change();
	} else {
		$("#HabitacionPedido").html(
			'<option value="">No hay eventos disponibles</option>'
		);
	}
}

function obtenerDiaSemana() {
	let dia = moment().locale("es").format("dddd");
	if (dia == "Miércoles") {
		dia = "Miercoles";
	} else if (dia == "Sábado") {
		dia = "Sabado";
	}
	return dia;
}

function validarPromociones(promo, extra = {}) {
	$(".labelPromociones").html("").css("padding-inline", "");
	$("#bgProm").addClass("d-none");
	let promocion = promo;
	let validarDesc = 0;
	let labelPromociones = "";
	let validarObs = 0;
	let promoSelect = {};
	promoSelect.Ranc = {};
	promoSelect.Valo = {};
	promoSelect.Desc = {};
	promoSelect.Obse = {};
	promoSelect.Gene = {};
	promoSelect.Ranc.promos = {};
	promoSelect.Valo.promos = {};
	promoSelect.Desc.promos = {};
	promoSelect.Obse.promos = {};
	promoSelect.Gene.promos = {};
	if (promocion != undefined) {
		if (promocion["promGene"].length != 0) validarDesc = 1;
		if (promocion["promoProd"].length != 0) {
			for (var promo of promo["promoProd"]) {
				if (promo["Tipo"] == "RANC") {
					let cant = +$("#cantProducto").val();
					for (var i = 0; i < promo.Promos.length; i++) {
						if (
							cant >= parseInt(+promo.Promos[i].CantidadInicial) &&
							cant <= parseInt(+promo.Promos[i].CantidadFinal)
						) {
							if (+promo.Promos[i].Valor > 0) {
								promoSelect.Ranc.Valor = +promo.Promos[i].Valor;
								promoSelect.Ranc.valorProductoRanc1 = +promo.Promos[i].Valor;
								promoSelect.Ranc.promos.Descripcion =
									promo.Promos[i].Descripcion;
								promoSelect.Ranc.promos.CantidadInicial =
									promo.Promos[i].CantidadInicial;
								promoSelect.Ranc.promos.CantidadFinal =
									promo.Promos[i].CantidadFinal;
								validarDesc = 1;
							}
							if (
								+promo.Promos[i].Porcentaje ||
								+promo.Promos[i].Porcentaje > 0
							) {
								let valor =
									(+productoActual.ValorOriginal *
										+promo.Promos[i].Porcentaje) /
									100;
								promoSelect.Ranc.PromoDescuen = +valor;
								promoSelect.Ranc.PromoPorce = +promo.Promos[i].Porcentaje;
								promoSelect.Ranc.valorProductoRanc2 =
									+productoActual.ValorOriginal - valor;
								promoSelect.Ranc.promos.Descripcion =
									promo.Promos[i].Descripcion;
								promoSelect.Ranc.promos.CantidadInicial =
									promo.Promos[i].CantidadInicial;
								promoSelect.Ranc.promos.CantidadFinal =
									promo.Promos[i].CantidadFinal;
								validarDesc = 1;
							}
						} else {
							validarDesc = 1;
						}
					}
				}
				if (promo["Tipo"] == "VALO") {
					promoSelect.Valo.Valor = promo["Valor"];
					promoSelect.Valo.valorProductoValo = parseInt(promo["Valor"]);
					promoSelect.Valo.promos.Descripcion = promo["Descripcion"];
					validarDesc = 1;
				}
				if (promo["Tipo"] == "DESC") {
					promoSelect.Desc.PromoPorce = promo.Porcentaje;
					valor = (+productoActual.ValorOriginal * +promo["Porcentaje"]) / 100;
					promoSelect.Desc.PromoDescuen = valor;
					promoSelect.Desc.valorProductoDesc =
						+productoActual.ValorOriginal - valor;
					promoSelect.Desc.promos.Descripcion = promo["Descripcion"];
					validarDesc = 1;
				}
				if (promo["Tipo"] == "OBSE" && validarDesc == 0) {
					validarObs = 1;
					let cant = +$("#cantProducto").val();
					if (+promo.PorCada > cant) {
						alertify.warning(
							"La cantidad es menor a la cantidad minimo para la promoción"
						);
					}
					let cantProd =
						parseInt(cant / +promo.PorCada) * +promo.CantidadObsequio;
					if (promo.datosProd) {
						if (
							promo.datosProd.inventames == "N" &&
							promo.datosProd.estructura == "S"
						) {
							if (
								!validarEstructuraHijos(promo.datosProd.inventario, cantProd)
							) {
								alertify.warning(
									"No es posible agregar el producto, no cuenta con inventario suficiente."
								);
							}
						} else {
							if (
								promo.datosProd.inventames == "S" &&
								+promo.datosProd.invenactua < cantProd
							) {
								alertify.warning(
									"No es posible agregar el producto, no cuenta con inventario suficiente."
								);
							}
						}
					}
					if (cantProd > 0) {
						promo.datosProd.PromoProdu = promo["Tipo"];
						productoActual.PromoDatosProdObsequio = {
							...promo.datosProd,
							AccionId: accionTercero,
							Cantidad: cantProd,
							Observacio: "",
							Personas: numeroPersonasPedido,
							VendedorId: vendedorElegido,
							allevar: false,
							barra: codBarraTercero,
							nuevo: true,
							PromoDescuen: +promo.datosProd.Valor * cantProd,
							PorCada: promo.PorCada,
						};
						promoSelect.Obse.promos.Descripcion = promo["Descripcion"];
						promoSelect.Obse.promos.PorCada = promo["PorCada"];
						labelPromociones =
							"Promoción: " +
							promoSelect.Obse.promos.Descripcion +
							" por cada: " +
							parseInt(promoSelect.Obse.promos.PorCada);
					}
				}
			}
			const valoresSinCero = [
				promoSelect.Ranc.valorProductoRanc1,
				promoSelect.Ranc.valorProductoRanc2,
				promoSelect.Valo.valorProductoValo,
				promoSelect.Desc.valorProductoDesc,
			].filter(
				(valor) => valor !== 0 && typeof valor !== "undefined" && valor !== null
			);
			const valoresProducto = Math.min(...valoresSinCero);
			if (valoresProducto === promoSelect.Ranc.valorProductoRanc1) {
				productoActual.Valor = promoSelect.Ranc.valorProductoRanc1;
				productoActual.PromocionId = "";
				productoActual.PromoProdu = "RANC";

				labelPromociones =
					"Promoción: " +
					promoSelect.Ranc.promos.Descripcion +
					" de: " +
					parseInt(promoSelect.Ranc.promos.CantidadInicial) +
					" a " +
					parseInt(promoSelect.Ranc.promos.CantidadFinal);
			} else if (valoresProducto === promoSelect.Ranc.valorProductoRanc2) {
				productoActual.PromoDescuen = promoSelect.Ranc.PromoDescuen;
				productoActual.PromoPorce = promoSelect.Ranc.PromoPorce;
				productoActual.Valor = promoSelect.Ranc.valorProductoRanc2;
				productoActual.PromocionId = "";
				productoActual.PromoProdu = "RANC";

				labelPromociones =
					"Promoción: " +
					promoSelect.Ranc.promos.Descripcion +
					" de: " +
					parseInt(promoSelect.Ranc.promos.CantidadInicial) +
					" a " +
					parseInt(promoSelect.Ranc.promos.CantidadFinal);
			} else if (valoresProducto === promoSelect.Valo.valorProductoValo) {
				productoActual.Valor = promoSelect.Valo.valorProductoValo;
				productoActual.PromocionId = "";
				productoActual.PromoProdu = "VALO";

				labelPromociones = "Promoción: " + promoSelect.Valo.promos.Descripcion;
			} else if (valoresProducto === promoSelect.Desc.valorProductoDesc) {
				productoActual.PromoPorce = promoSelect.Desc.PromoPorce;
				productoActual.PromoDescuen = promoSelect.Desc.PromoDescuen;
				productoActual.Valor = promoSelect.Desc.valorProductoDesc;
				productoActual.PromocionId = "";
				productoActual.PromoProdu = "DESC";

				labelPromociones = "Promoción: " + promoSelect.Desc.promos.Descripcion;
			} else {
				productoActual.Valor = productoActual.ValorOriginal;
			}

			if (productoActual.Valor == 0) {
				productoActual.Valor = productoActual.ValorOriginal;
			}
		}
		if (
			(promocion["promGene"].length != 0 &&
				validarDesc == 1 &&
				validarObs == 0) ||
			(promocion["promGene"].length != 0 && validarDesc == 0 && validarObs == 0)
		) {
			for (var promo of promocion["promGene"]) {
				let valor =
					(+productoActual.ValorOriginal * +promo.PorcentajeDescuento) / 100;
				valorProductoGene = +productoActual.ValorOriginal - valor;
				if (valorProductoGene <= productoActual.Valor) {
					productoActual.PromocionId = promo.PromocionId;
					productoActual.PromoProdu = "GENE";
					productoActual.Valor = valorProductoGene;
					productoActual.PromoPorce = promo.PorcentajeDescuento;
					productoActual.PromoDescuen = valor;
					promoSelect.Gene.promos.Descripcion = promo["Tabla"];
					promoSelect.Gene.promos.PorcentajeDescuento =
						promo["PorcentajeDescuento"];
					labelPromociones =
						"Promoción: " +
						promoSelect.Gene.promos.Descripcion +
						" " +
						parseInt(promoSelect.Gene.promos.PorcentajeDescuento) +
						"%";
				}
			}
		}
		$(".labelPromociones").html(labelPromociones).css("padding-inline", "36px");
		if (labelPromociones.length > 0) $("#bgProm").removeClass("d-none");
		$("#Valor").val(+productoActual.Valor);
		$("#ValorTotal").html("");
		$("#ValorTotal").html(
			'<strong> <label class="floating-label text-dark m-0 px-2" style="font-size: 14px;">Valor Total: </label></strong>' +
				'<strong><label class="floating-label text-dark bg-light m-0 py-1 px-2" style="font-size: 18px;"> $' +
				addCommas(
					(+productoActual.Valor * +$("#cantProducto").val()).toFixed(0)
				) +
				'<hr class="m-0"></label></strong>'
		);
	}
}

$(document).on("click", "#btnBuscarVendedor", function () {
	buscarVendedor($("#buscarVendedor").val());
});

$(document).on("keyup", "#buscarVendedor", function (e) {
	e.stopImmediatePropagation();
	buscarVendedor($(this).val());
});

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

$(document).on("click", ".empresa-datos", function () {
	if ($(this).data("botonsearch") == "tercero") {
		if (terceroPedidoEmpresa["TerceroID"]) {
			$("#numeroAccion").val(terceroPedidoEmpresa["TerceroID"]);
			$("#btnBuscarTercero").click();
		}
	} else {
		terceroPedidoEmpresa = {};
		$(".empresa-datos").html("");
	}
});

function validarBtnHotelCuentaPendiente() {
	$("#btnCuentaHotel").hide();
	if (
		cargarCuentaHotelPermiso &&
		dataTerceroPendiente.ReservaHotel &&
		dataTerceroPendiente.ReservaHotel != -1
	) {
		if (dataTerceroPendiente.reservaVigente) {
			reservaHotel = dataTerceroPendiente.ReservaHotel;
			habitacionHotel = dataTerceroPendiente.HabitacionId;
			HeadReservaIdHotel = dataTerceroPendiente.HeadReservaHotel;
			$(".habitacionPedido").html(dataTerceroPendiente.NombreHabitacion || "");
			$("#btnCuentaHotel").show();
		} else {
			reservaHotel = null;
		}
	} else {
		reservaHotel = null;
	}
}

function validarConsumoReactivado() {
	let tot = arrayProductosPedido.filter((op) => {
		if (op.Despachado == "S" && op.Imprime == "S" && op.Entregado == 1) {
			return true;
		}
		return false;
	}).length;
	if (arrayProductosPedido.length > 0 && arrayProductosPedido.length == tot) {
		reactivarConsumo = true;
	} else {
		reactivarConsumo = false;
	}
}

$(document).on("change", "#Desayuno", function () {
	if ($(this).is(":checked")) return $("#Valor").val(0);
	let valor = addCommas(+productoActual.Valor).split(",").join("");
	$("#Valor").val(valor);
});

function almancesNoFisicos({ almacenes }) {
	if (almacenes.length == 1) {
		almacenNoFisico(almacenes[0]);
	} else {
		if (ventanaCambioPedido) {
			let alInfo = almacenes.find((it) => it.almacenid.trim() == $AlmacenId);
			if (alInfo) {
				almacenNoFisico(alInfo);
				return;
			}
		}
		let estructura = "";
		almacenes.forEach((op) => {
			estructura += `<div onclick='almacenNoFisico(${JSON.stringify(
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

function almacenNoFisico(almacen) {
	if (!almacen.TipoMenuId)
		return alertify.error("Este almacen no tiene tipo de menú");

	$(".contenedor-cargador").show();
	let data = {
		almacen: almacen["almacenid"],
	};
	if (ventanaCambioPedido) {
		data["tercero"] = terceroIdPedido;
	}
	obtenerInformacion(data, "obtenerAlmacen", "datosAlmacen");
	abrirCerrarModal("#almacenNoFisico", "hide");
}

function datosAlmacen({ almacen }) {
	$INFOALMACEN = almacen;
	tipoVentaSeleccionado = almacen.CodiVent;
	$AlmacenId = almacen.almacenid;
	$("#btnAccionesMesa").removeClass("d-flex").addClass("d-none");
	btnCarrito.forEach((op) => $(op).addClass("d-none"));
	ventanaCambioPedido = true;
	$(".almacenPedido").html(almacen.nombre);
	$(".totalCuentaActual").text("$0.00");
	informacionMesa(accionPos != "general" ? idMesaActual : false);
	$(".mesaPedido").text("");
	$("#btnCancelarAlmacenNoFisico").parent().removeClass("d-none");
	alertify.success("Ambiente modificado a punto de venta no fisico");
	$(".contenedor-cargador").hide();
}

$(document).on("click", "#btnCancelarModal", function () {
	regresarCuentaAnterior();
});

function regresarCuentaAnterior(general = false) {
	sessionStorage.removeItem("dataPos");
	if (!ventanaCambioPedido && general) {
		location.href = base_url() + "Administrativos/Servicios/PanelPrincipal";
		return;
	}
	$INFOALMACEN = dataOriginal.almacen;
	tipoVentaSeleccionado = dataOriginal.tipoVenta;
	$AlmacenId = $INFOALMACEN.almacenid;
	ventanaCambioPedido = false;
	btnCarrito.forEach((op) => $(op).removeClass("d-none"));
	$("#btnAccionesMesa").removeClass("d-none").addClass("d-flex");
	$(".mesaPedido").html(idMesaActual);
	$(".almacenPedido").html($INFOALMACEN.nombre);
	informacionMesa(accionPos != "general" ? idMesaActual : false);
	$("#btnCancelarAlmacenNoFisico").parent().addClass("d-none");
	abrirCerrarModal("#almacenNoFisico", "hide");
	$("#btnCancelarFam").click();
}

function hotelImprimir(consus) {
	obtenerInformacion(consus, "eliminarConsumoCuentaHotel");
	if ($INFOALMACEN["NoFisico"] == "S") {
		if (!ventanaCambioPedido) {
			location.href = base_url() + `Administrativos/Servicios/PanelPrincipal`;
		} else {
			location.reload();
		}
	} else {
		limpiarVariables();
	}
}

function informacionFamiliaProducto({ datos }) {
	if (editarProductoPedidoNuevo < 0) {
		prodsSelectFamilia = {
			1: [],
		};
	} else {
		prodsSelectFamilia = {
			1: arrayProductosPedido[editarProductoPedidoNuevo].ProductosFamilia,
		};
	}
	posPlatoActualFami = 1;
	abrirCerrarModal(".bd-Variables", "hide");
	datos.forEach((op, index) => {
		$("#lista-tipo-comidas")
			.append(`<div class="col-4 col-md-3 col-sm-4 col-lg-2 col-xl-2 card-tipo-familia px-1 mb-2" style="cursor:pointer; height: 100px; max-height: 100px;" data-familia="${
			op.FamiProdId
		}" data-activo="${index == 0 ? "S" : "N"}" data-veces="${
			op.VecesFami
		}" data-pos="${index}" title="${op.Nombre}">
			<div class="card mb-1 h-100" style="box-shadow: none !important;">
				<div class="card-body px-1 py-1" style="border:1px solid #b2b9be;">
					<div class="d-flex flex-column align-items-center justify-content-center h-100">
						${
							op.Imagen
								? `<img src="${op.Imagen}" style="width:auto; height: 75%; border-radius: 3px;max-width: 100%;">`
								: ""
						}
						<p class="text-center ${op.Imagen ? "text-truncate m-0" : "m-2"}" style="${
			op.Imagen ? "width: 95%; height: 25%;" : "font-size: 16px;"
		}">${op.Nombre}</p>
					</div>
				</div>
			</div>
		</div>`);
	});
	$(".card-tipo-comida, .producto-menu, #btnConfirmPlatoFam").hide();
	$("#btnAccionesMesa button, .formBuscarProductos input").prop(
		"disabled",
		true
	);
	$("#btnAceptarFam, #btnConfirmPlatoFam").prop("disabled", false);
	$("#btnProcesosFamilias").show();
	$("#productosMenu").removeClass("col-12").addClass("col-11");

	if (editarProductoPedidoNuevo != -1) {
		$("#btnAceptarFam, #btnConfirmPlatoFam").prop("disabled", true);
	}
	if (+$("#cantProducto").val() > 1) {
		$("#btnConfirmPlatoFam").prop("disabled", false).show();
		$("#btnAceptarFam").prop("disabled", true);
	}
	ocultarInforFlotante();
	validarProductosFamilia();
	$(".card-tipo-familia")
		.unbind()
		.click(function () {
			$(".formBuscarProductosFamilias, .platosFamiliaCant").hide();
			$("#valProdFami").val("");
			$(".card-tipo-familia")
				.attr("data-activo", "N")
				.children()
				.children()
				.removeClass("producto-seleccionado");
			$(this)
				.attr("data-activo", "S")
				.children()
				.children()
				.addClass("producto-seleccionado");
			$(".producto-menu-familia-padre").remove();
			let posi = $(this).data("pos");
			let elemento = $(".card-tipo-familia[data-pos=" + (+posi - 1) + "]");
			$("#btnAnteriorFam, #btnSiguienteFam").prop("disabled", false);
			if (!elemento.length) {
				$("#btnAnteriorFam").prop("disabled", true);
			} else {
				elemento = $(".card-tipo-familia[data-pos=" + (+posi + 1) + "]");
				if (!elemento.length) {
					$("#btnSiguienteFam").prop("disabled", true);
				}
			}
			obtenerProducsdDelMenu("informacionProdsFamilia", {
				familiaId: $(this).data("familia"),
			});
		});
	$("#btnAnteriorFam")
		.unbind()
		.click(function () {
			let posi = $(".card-tipo-familia[data-activo=S]").data("pos");
			let elemento = $(".card-tipo-familia[data-pos=" + (+posi - 1) + "]");
			$("#btnSiguienteFam").prop("disabled", false);
			if (elemento.length) {
				elemento.click();
			}
			if (!$(".card-tipo-familia[data-pos=" + (+posi - 2) + "]").length) {
				$("#btnAnteriorFam").prop("disabled", true);
			}
		});
	$("#btnSiguienteFam")
		.unbind()
		.click(function () {
			let posi = $(".card-tipo-familia[data-activo=S]").data("pos");
			let elemento = $(".card-tipo-familia[data-pos=" + (+posi + 1) + "]");
			$("#btnAnteriorFam").prop("disabled", false);
			if (elemento.length) {
				elemento.click();
			}
			if (!$(".card-tipo-familia[data-pos=" + (+posi + 2) + "]").length) {
				$("#btnSiguienteFam").prop("disabled", true);
			}
		});
	$("#btnCancelarFam")
		.unbind()
		.click(function () {
			reorganizarAnteFamilia(true);
			$(".contenido-plato-familia").hide();
			$("#productosMenu").removeClass("col-8");
		});
	$("#btnAnteriorFam").prop("disabled", true);
	if (datos.length == 1) {
		$("#btnSiguienteFam").prop("disabled", true);
	}
	$("#btnAceptarFam")
		.unbind()
		.click(function () {
			let hayProds = false;
			Object.keys(prodsSelectFamilia).forEach((it) => {
				if (prodsSelectFamilia[it].length) {
					hayProds = true;
				}
			});

			if (hayProds) {
				if (!prodsSelectFamilia[posPlatoActualFami].length) {
					delete prodsSelectFamilia[posPlatoActualFami];
					posPlatoActualFami--;
				}

				let llaves = Object.keys(prodsSelectFamilia);
				if (llaves.length - 1 < +$("#cantProducto").val()) {
					prodsSelectFamilia[posPlatoActualFami].forEach(
						(it) =>
							(it.Cantidad = +$("#cantProducto").val() - (llaves.length - 1))
					);
				} else {
					prodsSelectFamilia[posPlatoActualFami].forEach((it) =>
						editarProductoPedidoNuevo > -1 ? null : (it.Cantidad = 1)
					);
				}
				let prodsBuscar = {};
				Object.keys(prodsSelectFamilia).forEach((key) => {
					prodsBuscar[key] = prodsSelectFamilia[key].map(
						({ headprodid, ProductoId }) => {
							return { headprodid, ProductoId };
						}
					);
				});
				reorganizarAnteFamilia();
				productoActual.SeleccionoFamilia = true;
				if (editarProductoPedidoNuevo < 0) {
					$(".no-hay-items").remove();
				}
				$("#formIngredientes").submit();
			} else {
				alertify.warning("No se encontraron platos confirmados");
			}
		});
	$("#btnConfirmPlatoFam")
		.unbind()
		.click(function () {
			if (!prodsSelectFamilia[posPlatoActualFami].length) {
				alertify.warning("No ha seleccionado productos para este plato");
				return;
			}
			prodsSelectFamilia[posPlatoActualFami].forEach((it) => (it.Cantidad = 1));

			let llaves = Object.keys(prodsSelectFamilia);
			if (llaves.length == 0) {
				prodsSelectFamilia[1] = [];
				posPlatoActualFami = 1;
			} else {
				prodsSelectFamilia[llaves.length + 1] = [];
				posPlatoActualFami = llaves.length + 1;
			}
			$(".card-tipo-familia[data-pos=0]").click();

			if (+$("#cantProducto").val() == llaves.length + 1) {
				$("#btnConfirmPlatoFam").prop("disabled", true);
				$("#btnAceptarFam").prop("disabled", false);
			}
			validarProductosFamilia();
		});
	$(".card-tipo-familia:first()").click();
}

function informacionProdsFamilia({ datos }) {
	let estructuraHtml = "";
	$(".no-hay-items").remove();
	if (!datos.length) {
		$("#productosMenu").append(
			`<div class="col-12 text-center no-hay-items">No hay productos disponibles</div>`
		);
	} else {
		datos.forEach((op) => {
			let productoValido = op.veriInven == "SI" ? true : false;
			if (!productoValido && $DATOSMONTAJE["soloexiste"] == "S") {
				return op;
			}
			let selected = "";
			let pos = prodsSelectFamilia[posPlatoActualFami].findIndex(
				(it) => it.ProductoId == op.ProductoId
			);
			if (pos != -1) {
				selected = "producto-seleccionado";
				prodsSelectFamilia[posPlatoActualFami][pos].FamiProdId = op.FamiProdId;
			}
			estructuraHtml += `<div 
				class="producto-menu-familia-padre pb-2 px-1" style="max-width: 140px !important; height: 135px; width: 150px; cursor:${
					productoValido ? "pointer" : "no-drop"
				}; position: relative">
				<div class="producto-menu-familia card mb-2 h-100" style="box-shadow: 2px 4px 3px 1px rgb(69 90 100 / 30%);" id="produFam${
					op.ProductoId
				}" data-valido="${productoValido}" data-produ="${
				op.ProductoId
			}" title="${op.nombre}" data-familia="${op.FamiProdId}">
					<div class="card-body ${selected} px-2 py-1 d-flex justify-content-center align-items-center" style="border-radius:2px; ${
				productoValido ? "" : "background-color: #d6d6d6;"
			}">
						<p class="m-0 text-center" style="font-size: 12px; overflow-wrap: anywhere;" title=${
							op.nombre
						}>${op.nombre}</p>
					</div>
				</div>
				${
					editarProductoPedidoNuevo != -1
						? ""
						: `<button class="btn btn-sm bg-danger delete" data-produ="${
								op.ProductoId
						  }" title="Eliminar" style="position: absolute; right: 0px; top: 0px; ${
								selected == "" ? "display: none;" : ""
						  }">
					<i class="fas fa-times"></i>
				</button>`
				}
			</div>`;
		});
		$("#productosMenu").append(estructuraHtml);
		$(".formBuscarProductosFamilias, .platosFamiliaCant").show();
		$(".producto-menu-familia")
			.unbind()
			.on("click", function () {
				if ($(this).data("valido")) {
					let contx = this;
					let infoFami = $(".card-tipo-familia[data-activo=S]").data();
					let productoFami = datos.find(
						(it) => it.ProductoId == $(this).data("produ")
					);
					productoFami.ProdPadreVenta = productoActual.ProductoId;
					/* Se le suma 1 para simular que ya se agrego el producto y verificar si aun hay espacio disponible */
					let cantidad =
						prodsSelectFamilia[posPlatoActualFami].filter(
							(op) => op.FamiProdId == $(this).data("familia")
						).length + 1;
					if (cantidad > infoFami.veces) {
						alertify.warning(
							`Solo puede seleccionar ${infoFami.veces} producto(s)`
						);
					} else {
						let data = {
							headprodid: productoFami.headprodid,
							producto: productoFami.ProductoId,
							almacen: $INFOALMACEN["almacenid"],
							tipoVenta: tipoVentaSeleccionado.CodigEstru || null,
							pendiente: false,
						};
						data = $.Encriptar(data);
						$.ajax({
							url: rutaGeneral + "obtenerItemsProducto",
							type: "POST",
							dataType: "json",
							data: { encriptado: data, accionPos },
							success: (resp) => {
								let {
									disponibles,
									cantEstructura,
									observaciones,
									noDisponibles,
								} = JSON.parse($.Desencriptar(resp));

								let datosActualizar = {
									posicionFami: posPlatoActualFami,
									contexto: contx,
									cantidad: cantidad,
									veces: infoFami.veces,
								};
								if (
									productoFami.inventames != "S" &&
									productoFami.estructura == "S"
								) {
									if (cantEstructura == 0) {
										return alertify.error(
											"El producto no tiene una estructura registrada"
										);
									}
									if (!disponibles.length) {
										return alertify.error(
											"El producto no tiene una estructura valida"
										);
									}
									datosProductoFamilia(
										{ disponibles, observaciones, noDisponibles },
										productoFami,
										datosActualizar
									);
								} else if (productoFami.terminos == "S") {
									datosProductoFamilia(
										{ disponibles, observaciones, noDisponibles },
										productoFami,
										datosActualizar
									);
								} else {
									productoFami.Observacio = "";
									prodsSelectFamilia[posPlatoActualFami].push(productoFami);
									$(contx).children().addClass("producto-seleccionado");
									$(contx).next().show();
									if (cantidad == infoFami.veces) {
										$("#btnSiguienteFam").click();
									}
								}
							},
						});
					}
					platosFamilia();
				} else {
					alertify.warning("Producto no disponible");
				}
			});
		$(".producto-menu-familia-padre .delete")
			.unbind()
			.on("click", function () {
				let index = prodsSelectFamilia[posPlatoActualFami].findIndex(
					(op) => op.ProductoId == $(this).data("produ")
				);
				if (index != -1) {
					prodsSelectFamilia[posPlatoActualFami].splice(index, 1);
					$(`#produFam${$(this).data("produ")}`)
						.children()
						.removeClass("producto-seleccionado");
					$(this).hide();
				}
				platosFamilia();
			});
		$("#valProdFami")
			.unbind()
			.on("keyup", function () {
				let valor = $(this).val();

				if (Valor == "") {
					$(".producto-menu-familia-padre p").show();
					return;
				}

				$.each($(".producto-menu-familia-padre"), function (pos, it) {
					let temp = $(it).find("p");
					$(it).show();
					if (!temp.text().toLowerCase().includes(valor.toLowerCase()))
						$(it).hide();
				});
			});
		if (editarProductoPedidoNuevo != -1) {
			platosFamilia();
		}
	}
}

function reorganizarAnteFamilia(eliminar = false) {
	if (eliminar && editarProductoPedidoNuevo < 0) {
		delete productoActual.ProductosFamilia;
	}
	$(".card-tipo-familia, .producto-menu-familia-padre").remove();
	$("#btnAccionesMesa button, .formBuscarProductos input").prop(
		"disabled",
		false
	);
	$(".card-tipo-comida, .producto-menu").show();
	if (arrayProductosPedido.length) {
		$(".btn-floating").show();
	}
	$(
		"#btnProcesosFamilias, .formBuscarProductosFamilias, .contenido-plato-familia, .platosFamiliaCant"
	).hide();
	$("#productosMenu").removeClass("col-11").addClass("col-12");
	organizarAcumulado();
}

function prodEliminadoFamilia({ msj, posiPadre, posi }) {
	if (arrayProductosPedido[posiPadre].ProductosFamilia.length == 1) {
		arrayProductosPedido.splice(posiPadre, 1);
	} else {
		arrayProductosPedido[posiPadre].ProductosFamilia.splice(posi, 1);
	}
	alertify.success(msj);
	organizarAcumulado();
}

function platosFamilia() {
	let estructura = "";
	Object.keys(prodsSelectFamilia).forEach((op) => {
		if (prodsSelectFamilia[op].length) {
			estructura += `
				<div class="card-body plato-pedido-familia p-0">
					<div class="pt-2" id="famiProdPen${op}" data-target="#famiColPen${op}" data-toggle="collapse" aria-expanded="true" style="cursor: pointer">
						<div class="pl-0 m-0 font-weight-bold" style="font-size: 18px"> <ul class="mb-1 pl-3"><li>Plato ${op}</li></ul></div>
					</div>
				</div>
			`;
			prodsSelectFamilia[op].forEach((pl) => {
				estructura += `
					<div id="famiColPen${op}" class="collapse width" aria-labelledby="famiProdPen${op}" data-parent=".plato-pedido-familia">
						<div class="pl-3 m-0">- ${pl.ProductoId} | ${pl.nombre}</div>
					</div>
				`;
			});
		}
	});
	if (estructura != "") {
		$(".contenido-plato-familia").show();
		$("#productosMenu").addClass("col-8").removeClass("col-11");
		$("#lista-platos-familia").html(estructura);
	} else {
		$(".contenido-plato-familia").hide();
		$("#productosMenu").removeClass("col-8").addClass("col-11");
	}
}

function validarEstructuraHijos(hijos, cantidad, guardar = false) {
	if (!hijos.length) return false;

	for (let i = 0; i < hijos.length; i++) {
		if (hijos[i].estructura == "S" && hijos[i].inventames != "S") {
			if (!validarEstructuraHijos(hijos[i].estructuraHija, cantidad, guardar))
				return false;
		} else if (hijos[i].inventames == "S") {
			let val = cantidad * +hijos[i].Cantidad;
			if (guardar) {
				if (hijos[i].Multiplica == "S") {
					val = cantidad * +hijos[i].Cantidad;
				} else if (hijos[i].EmpaqueIni > 0 && hijos[i].EmpaqueFin > 0) {
					val = Math.ceil(+hijos[i].Cantidad / +hijos[i].EmpaqueFin);
				}
			}
			if (!(val <= +hijos[i].invenactua) && $DATOSMONTAJE.verInvEstrVent == "S")
				return false;
		}
	}
	return true;
}

function dataTipoVenta({ datos }) {
	if (datos) {
		tipoVentaSeleccionado = datos;
		if (
			tipoVentaSeleccionado.PagoPendiente == "S" &&
			tipoVentaSeleccionado.vendedor != "S"
		) {
			alertify.alert(
				"¡Alerta!",
				'<h3 class="mensaje-alerta">No es posible continuar, el tipo de venta tiene pago pendiente y no solicita vendedor.</h3>',
				function () {
					window.history.back();
				}
			);
			return;
		}

		if (tipoVentaSeleccionado.Personas != "S")
			$("#NumeroPersonas").prop("required", false);
		if (accionPos == "general") {
			if (reactivarConsumo) {
				consumoReactivar();
			} else if (
				tipoVentaSeleccionado.manejclien == "N" &&
				tercerosDesayuno.length <= 0
			) {
				if (tipoVentaSeleccionado.tercero[0]) {
					tercerosAccion = tipoVentaSeleccionado.tercero;
					terceroIdPedido = tipoVentaSeleccionado.tercero[0].TerceroID;
					accionTercero = tipoVentaSeleccionado.tercero[0].AccionId || "";
					$(".clientePedido").html(tipoVentaSeleccionado.tercero[0].Nombre);
					$(".accionIdPedido").html(accionTercero);
					validarVendedor();
				} else {
					alertify.error("No se encontro tercero por defecto para la venta");
				}
			} else {
				let dataPos = sessionStorage.getItem("dataPos");
				if (!dataPos) {
					abrirCerrarModal(".bd-accion-modal-sm", "show");
				}
			}
		}
	} else {
		alertify.warning("No ha seleccionado el tipo de venta");
	}
}

function validarIngresoTercero(enc) {
	if (enc.Baloteado == 1) {
		alertify.alert(
			"Alerta",
			(enc.EsCliente == 1
				? '<h3 class="mensaje-alerta">La persona'
				: "El socio") +
				" se encuentra bloqueado por la junta directiva, no se permite su ingreso.</h3>"
		);
		return false;
	}

	if (enc.TipoDocumento != "31" && enc.EsEmpleado == 0) {
		if ($INFOALMACEN["VerificarIngreso"] == "S") {
			if (
				!enc.Ingreso &&
				(!enc.ReservaHotel || enc.ReservaHotel == -1) &&
				!enc.AccionId &&
				enc.TipoDocumento != "31"
			) {
				alertify.warning(
					"No es posible continuar, no tiene ingreso registrado para hoy."
				);
				return false;
			} else if (
				enc.Ingreso &&
				enc.CantidadIngresoSedeActual == 0 &&
				enc.TipoDocumento != "31"
			) {
				alertify.error("El tercero tiene ingreso en otra sede.");
				return false;
			} else {
				if (enc.ReservaHotel && enc.ReservaHotel != -1) {
					if (
						accesoCargarCuentaHotel &&
						enc.SedeReservaHotel != $INFOALMACEN["SedeId"]
					) {
						alertify.error("La reserva se encuentra en otra sede.");
						return false;
					} else if (
						enc.SedeReservaHotel != $INFOALMACEN["SedeId"] &&
						!enc.Ingreso
					) {
						alertify.error(
							"El tercero tiene reserva de hotel en otra sede y no tiene ingreso registrado."
						);
						return false;
					} else if (
						!enc.AccionId &&
						enc.SalidaReservaHotel &&
						moment(enc.SalidaReservaHotel, "YYYY-MM-DD").isBefore(
							moment(moment().format("YYYY-MM-DD"), "YYYY-MM-DD")
						)
					) {
						alertify.warning("Tiene una reserva vencida en Hotel.");
						return false;
					}
				} else if (!enc.Ingreso && enc.TipoDocumento != "31") {
					alertify.warning(
						"No es posible continuar, no tiene ingreso registrado para hoy."
					);
					return false;
				}
			}
		} else {
			if (!enc.SuccessIngreso) {
				alertify.error(enc.MensajeIngreso);
				return false;
			}
			if (enc.ReservaHotel && enc.ReservaHotel != -1) {
				if (
					!enc.AccionId &&
					enc.SalidaReservaHotel &&
					moment(enc.SalidaReservaHotel, "YYYY-MM-DD").isBefore(
						moment(moment().format("YYYY-MM-DD"), "YYYY-MM-DD")
					)
				) {
					alertify.warning("Tiene una reserva vencida en Hotel.");
					return false;
				} else if (enc.SedeReservaHotel != $INFOALMACEN["SedeId"]) {
					alertify.error("El tercero tiene reserva de hotel en otra sede.");
					return false;
				}
			}
		}
	}
	return true;
}

function cuentasMesaTerceros({ cuentas }) {
	let estructura = "";
	$("#cuentasTerceroMesa").html(estructura);
	cuentas.forEach((it) => {
		let nombreEvento = "";
		if (it.EventoId && it.EventoId != -1) {
			nombreEvento = (it.NroEvento || "") + " - " + (it.NombreEvento || "");
		}
		estructura += `<div title="Ir a la cuenta" class="m-b-10 d-flex border rounded btnTerceroCambiarCuentaPendiente" style="align-items: center; cursor:pointer; ${
			it.TotalPendienteRojo > 0
				? "border-color: " + coloresMesa.ProdsPendientes.color + " !important;"
				: ""
		}" data-info="${(it.TerceroID + "").trim()}">
			<div class="pl-3" style="width: 100%;">
				<h6>${it.Nombre}</h6>
				<p class="m-b-0">${
					it.AccionId == ""
						? "<b>Documento: </b>" + it.TerceroID
						: "<b>Acción: </b>" + it.AccionId
				}</p>
				<p class="m-b-0">${
					it.NombreHabitacion == undefined
						? ""
						: "<b>Habitación: </b>" + it.NombreHabitacion
				}</p>
				<p class="m-b-0">${nombreEvento}</p>
			</div>
			<button type="button" title="Ir a la cuenta" class="btn btn-sm btn-secondary" style="max-height: 75px; height: 75px;">
				<i class="fas fa-share-square"></i>
			</button>
		</div>`;
	});
	$("#cuentasTerceroMesa").html(estructura);
	if (estructura == "") {
		$("#cuentasTerceroMesa").html(
			'<div class="m-b-10 text-center">No tiene cuentas disponibles</div>'
		);
	}
	abrirCerrarModal("#modal-cambiar-cuenta", "show");
	$(".btnTerceroCambiarCuentaPendiente")
		.unbind()
		.click(function () {
			let tercAnt = terceroIdPedido;
			terceroIdPedido = $(this).data("info");
			let enco = cuentas.find((x) => x.TerceroID == terceroIdPedido);
			accionTercero = enco.AccionId || "";
			codBarraTercero = enco.barra || "";
			$(".barraPedido").html(codBarraTercero);
			$(".habitacionPedido").html(enco.NombreHabitacion || "");
			$(".eventoPedido").html("");
			EventoId = null;
			$("#btnCuentaEvento").hide();
			if (enco.EventoId && enco.EventoId != -1) {
				EventoId = enco.EventoId;
				$(".eventoPedido").html(
					(enco.NroEvento || "") + " - " + (enco.NombreEvento || "")
				);
				$("#btnCuentaEvento").show();
			}

			habitacionHotel = enco.HabitacionId || "";
			HeadReservaIdHotel = enco.HeadReservaHotel || null;
			reservaHotel = null;
			if (
				cargarCuentaHotelPermiso &&
				enco.ReservaHotel &&
				enco.ReservaHotel != -1
			) {
				if (enco.reservaVigente) {
					reservaHotel = enco.ReservaHotel;
					$("#btnCuentaHotel").show();
				}
			}

			cuentaTerceroConsumo = { ...enco };

			let data = {
				mesaId: idMesaActual || false,
				tercero: terceroIdPedido,
				accion: accionTercero,
				tercAnt: tercAnt,
				newTerc: terceroIdPedido,
				accionPos: accionPos,
				almacenid: $INFOALMACEN["almacenid"],
				AlmacenNoFisico: $INFOALMACEN.NoFisico,
				soloDesayuno: tercerosDesayuno.length > 0 ? 1 : 0,
				headReservaHotel: tercerosDesayuno.length > 0 ? HeadReservaIdHotel : 0,
				terceroEmpresa:
					terceroPedidoEmpresa && terceroPedidoEmpresa.TerceroID
						? ("" + terceroPedidoEmpresa.TerceroID).trim()
						: null,
			};
			obtenerInformacion(data, "productosConsumo", "consumoProductosTercero");
			$(".card-tipo-comida.tipo-comida-seleccionado").click();
			validarBtnFacturaElectronica();
		});
}

function productoAgregadoCuenta({ mensaje, productos }) {
	prodsAgregarNew = [];
	alertify.success(mensaje);
	abrirCerrarModal("#elegitTercerosDesayuno", "hide");
	consumoProductosTercero({ datos: productos });
	/* Se vallida por si es submenu dar click al ultimo submenu */
	if (!lineaTiempoSubGrupos.length) {
		$(".tipo-comida-seleccionado").click();
		$(".linea-subgrupos").hide();
	} else {
		$(
			`.item-subgrupo[data-grupo=${
				lineaTiempoSubGrupos[lineaTiempoSubGrupos.length - 1].GrupoId
			}]`
		).click();
	}
	obtenerProductosTercerosDesayuno();
}

function cuentaFinalizada(resp) {
	if (reservaHotel > 0 && accesoCargarCuentaHotel) {
		let insertados = resp.idInsertado.join("-");
		let consus = {
			consumos: insertados,
			tercero: terceroIdPedido,
		};
		if (
			typeof tipoVentaSeleccionado.impresion == "undefined" ||
			tipoVentaSeleccionado.impresion == null
		) {
			tipoVentaSeleccionado.impresion = 1;
		}
		abrirReporte(
			`${base_url()}reportes/imprimirComprobanteConsumoHotel/${insertados}/${accionPos}/${
				tipoVentaSeleccionado.impresion
			}`,
			this,
			"hotelImprimir",
			consus,
			"onbeforeunload"
		);
	}

	if (EventoId > 0 && cargarCuentaEvento) {
		let insertados = resp.idInsertado.join("-");
		if (
			typeof tipoVentaSeleccionado.impresion == "undefined" ||
			tipoVentaSeleccionado.impresion == null
		) {
			tipoVentaSeleccionado.impresion = 1;
		}
		abrirReporte(
			`${base_url()}reportes/ComprobanteConsumoEvento/${insertados}/${accionPos}/${
				tipoVentaSeleccionado.impresion
			}`
		);
	}

	if (accesoCargarCuentaHotel && btnCargarCuentaClick && !btnTerceroPendiente) {
		let infoDesa = sessionStorage.getItem("regresoMesaDesayuno");
		if (infoDesa) {
			infoDesa = $.Desencriptar(JSON.parse(infoDesa));
			sessionStorage.removeItem("regresoMesaDesayuno");
			sessionStorage.setItem("accionPos", "pedido_mesa");
			location.href =
				base_url() +
				`Administrativos/Servicios/VistaGeneral/Mesas/${infoDesa
					.split('"')
					.join("")}`;
			return;
		}
		location.href = base_url() + `Administrativos/Servicios/CargueCuentaHotel`;
		return;
	}
	prodsAgregarNew = [];
	rastreoAbreCenta = false;
	cargarCuentaPendiente = false;
	cargarCuentaEvento = false;
	accesoCargarCuentaHotel = false;
	reservaHotel = null;
	EventoId = null;
	alertify.success(resp.mensaje);
	valorBuscarProducto = "";
	$("#btnCuentaHotel").hide();
	if (accionPos == "general") {
		location.href = base_url() + `Administrativos/Servicios/PanelPrincipal`;
		return;
	}
	$(".card-vendedor").removeClass("card-vendedor-seleccionado");
	$(".card-tipo-comida")
		.children()
		.children("div")
		.removeClass("producto-seleccionado");
	$("#valProducto").val("");
	$("#btnCambiarZona").hide();
	sessionStorage.removeItem("dataPos");
	limpiarVariables();
	abrirCerrarModal("#modal-accion-tercero", "hide");
	reservaActual = {};
}

function dataTercerosDesayuno({ terceros, reserva }) {
	tercerosDesayuno = terceros;
	HeadReservaIdHotel = reserva.HeadReservaId;
	habitacionHotel = reserva.HabitacionId;
	$("#cancelarModalAccion").click();
	$(".clientePedido").html(reserva.NombreTitular);
	$(".habitacionPedido").html(reserva.NombreHabitacion);
	$(".accionIdPedido").html(reserva.AccionTitular || "");
	$(".barraPedido").html(reserva.BarraTitular || "");
	$(".titulo-desayuno").html("Reserva " + (reserva.NumeroReserva || ""));
	numeroPersonasPedido = 1;
	terceroIdPedido = "0";
	[...btnCarrito, "#btnFacturarPedido"].forEach((op) =>
		$(op).addClass("d-none")
	);
	$("#btnCuentaHotel").show();
	validarVendedor();

	desayunosPendientesAlert(terceros);
}

function productosTerceroDesayuno({ terceros }) {
	$("#listaTercerosDesayuno").empty();
	tercerosDesayuno = terceros;
	if (prodsAgregarNew.length) {
		let dataProdDesayuno = Object.assign({}, prodsAgregarNew[0]);
		dataProdDesayuno.Desayuno = "S";
		dataProdDesayuno.Valor = 0;
		dataProdDesayuno.Cantidad = 1;
		dataProdDesayuno.HeadReservaIdHotel = HeadReservaIdHotel;
		let habitacionesStruc = {};
		terceros.forEach((op) => {
			if (!op.ProductoDesayuno.ProductoId) {
				let reserva = tercerosDesayunoOriginal.find(
					(x) => x.terceroid == op.TerceroID
				);
				if (reserva) {
					if (!habitacionesStruc[reserva.reservaId + ""]) {
						habitacionesStruc[reserva.reservaId + ""] = "";
					}
					habitacionesStruc[
						reserva.reservaId + ""
					] += `<div class="col-12 col-sm-4 col-md-4 col-lg-2 mb-2" style="cursor:pointer">
						<div class="card mb-1 h-100 card-tercero-desayuno" style="box-shadow: none !important;" data-tercero="${
							op.TerceroID
						}">
							<div class="card-body px-1 py-1 rounded" style="border:1px solid #b2b9be;">
								<div class="text-center">
									<img src="${
										!op.Foto
											? base_url() + "assets/images/user/nofoto.png"
											: op.Foto
									}" style="height: 68px; border-radius: 3px;">
								</div>
								<p style="text-align: center;font-size: 14px;margin-bottom:6px;margin-top: 3px;">${
									op.NombreTercero
								}</p>
								<p class="nameProd" style="text-align: center;font-size: 12px;margin-bottom:6px;">${
									op.ProductoDesayuno.nombre || ""
								}</p>
							</div>
							<button class="btn btn-sm bg-danger deleteDesayuno" data-tercero="${
								op.TerceroID
							}" title="Eliminar Desayuno" style="position: absolute; right: 0px; top: 0px; ${
						!op.ProductoDesayuno.ProductoId ? "display: none;" : ""
					}">
								<i class="fas fa-times"></i>
							</button>
						</div>
					</div>`;
				}
			}
		});

		Object.entries(habitacionesStruc).forEach((x) => {
			let reserva = tercerosDesayunoOriginal.find((t) => t.reservaId == +x[0]);
			if (reserva) {
				$("#listaTercerosDesayuno").append(`
					<div class="col-12 mb-2 font-weight-bold">
						<p class="mb-0" style="font-size: 20px;margin-bottom:6px;margin-top: 6px;">${reserva.nombre}</p>
						<hr class="my-0 mb-1">
					</div>
					${x[1]}
				`);
			}
		});

		$(".card-tercero-desayuno").on("click", function () {
			let tercero = "" + $(this).data("tercero");
			if (prodsAgregarNew.length) {
				let pos = terceros.findIndex((x) => x.TerceroID == tercero);
				if (pos > -1) {
					if (!terceros[pos]["ProductoDesayuno"].ProductoId) {
						terceros[pos]["ProductoDesayuno"] = dataProdDesayuno;
						if (prodsAgregarNew[0].Cantidad > 1) {
							$(this).find(".deleteDesayuno").show();
							$(this).addClass("bg-success");
							$(this).find(".nameProd").text(dataProdDesayuno.nombre);
							prodsAgregarNew[0].Cantidad--;
						} else {
							$("#btnElegirTercerosDesayuno").click();
						}
					} else {
						alertify.warning(
							terceros[pos].NombreTercero + " ya se le asigno desayuno"
						);
					}
				}
			} else {
				alertify.warning("No se encontraron productos agregados");
			}
		});
		$(".deleteDesayuno").on("click", function () {
			let tercero = $(this).data("tercero");
			let terc = terceros.find((x) => x.TerceroID == tercero);
			let data = {
				observacion: "",
				tercero: tercero,
				mesa: idMesaActual || false,
				tipoDevo: null,
				accion: null,
				Id: terc.ProductoDesayuno.Id,
				Producto: terc.ProductoDesayuno.ProductoId,
			};
			obtenerInformacion(data, "borrarDeCuenta", "productoDesayunoBorrado");
		});
		$("#btnElegirTercerosDesayuno")
			.unbind()
			.on("click", function () {
				let dataTerc = [];
				terceros.forEach((x) => {
					if (
						x.ProductoDesayuno &&
						x.ProductoDesayuno.ProductoId &&
						!x.ProductoDesayuno.Id
					) {
						let info = organizarDataConsumo([x.ProductoDesayuno], x.TerceroID);
						dataTerc.push(info[0]);
					}
				});

				if (dataTerc.length) {
					dataTerc = dataTerc.map((op) => {
						op.HabitacionId = habitacionHotel;
						let enc = tercerosDesayunoOriginal.find(
							(x) => x.terceroid == op.TerceroId
						);
						if (enc) {
							op.HabitacionId = enc.habitacion;
						}
						return op;
					});
					let infor = {
						datos: dataTerc,
						mesaId: idMesaActual || false,
						almacenid: $INFOALMACEN["almacenid"],
						AlmacenNoFisico: $INFOALMACEN.NoFisico,
						soloDesayuno: tercerosDesayuno.length > 0 ? 1 : 0,
						headReservaHotel:
							tercerosDesayuno.length > 0 ? HeadReservaIdHotel : 0,
						terceroEmpresa:
							terceroPedidoEmpresa && terceroPedidoEmpresa.TerceroID
								? ("" + terceroPedidoEmpresa.TerceroID).trim()
								: null,
					};
					obtenerInformacion(
						infor,
						"agregarProductoCuenta",
						"productoAgregadoCuenta"
					);
				} else {
					alertify.warning("No se encontro desayuno asignado");
				}
			});
		let catn = terceros.filter((x) => !x.ProductoDesayuno.ProductoId);
		if (catn.length <= prodsAgregarNew[0].Cantidad) {
			terceros = terceros.map((x) => {
				if (!x.ProductoDesayuno.ProductoId) {
					x.ProductoDesayuno = dataProdDesayuno;
				}
				return x;
			});
			$("#btnElegirTercerosDesayuno").click();
		} else {
			buscarTercero();
			abrirCerrarModal("#elegitTercerosDesayuno", "show");
		}
	}
	desayunosPendientesAlert(terceros);
}

function desayunosPendientesAlert(terceros) {
	let total = terceros.filter((x) => !x.ProductoDesayuno.ProductoId).length;
	if (total == 1) {
		$(".desayunospendientes")
			.html(total + " Desayuno Pendiente")
			.show();
	} else {
		$(".desayunospendientes")
			.html(total + " Desayunos Pendientes")
			.show();
	}
}

function productoDesayunoBorrado(resp) {
	alertify.success(resp.mensaje);
	obtenerProductosTercerosDesayuno();
}

function obtenerProductosTercerosDesayuno() {
	if (accesoCargarCuentaHotel && tercerosDesayuno.length) {
		let infor = {
			mesaId: idMesaActual || false,
			accion: accionTercero,
			almacenid: $INFOALMACEN["almacenid"],
			AlmacenNoFisico: $INFOALMACEN.NoFisico,
			tercerosBuscarDesayuno: tercerosDesayuno,
			headReservaHotel: HeadReservaIdHotel,
		};
		obtenerInformacion(
			infor,
			"obtenerProductoTercDesayuno",
			"productosTerceroDesayuno"
		);
	}
}

$(document).on("keyup", "#buscarTercero", function (e) {
	e.stopImmediatePropagation();
	buscarTercero($(this).val());
});

function buscarTercero(buscar = "") {
	var cont = 0;
	$("#buscarTercero").val(buscar);
	$(".card-tercero-desayuno").parent("div").removeClass("d-none");
	$("#listaTercerosDesayunoNoHay").hide();
	if (buscar == "") return;
	total = 0;
	$(".card-tercero-desayuno").filter(function (index, item) {
		total++;
		if ($(item).find("p").text().toLowerCase().includes(buscar.toLowerCase()))
			return true;
		$(item).parent("div").addClass("d-none");
		cont++;
		return false;
	});
	if (cont == total) {
		$("#listaTercerosDesayunoNoHay").show();
	}
}

function datosProductoFamilia(
	{ disponibles, observaciones, noDisponibles },
	datosProdF,
	dataActualiza
) {
	$("#listaIngredientesProductoFamilia").empty();
	$("#ObservacioFamilia").val("");
	$("#PuestoMesa").val("");
	if (observaciones.length) {
		$("#btnAgregaProdFamilia").text("Observaciones");
	} else {
		$("#btnAgregaProdFamilia").text("Agregar");
	}
	if (cantidadProductoPermiso) {
		$("#btnAgregaProdFamilia").show();
	}
	let mostrarAlerta = true;
	if (datosProdF.inventames != "S" && datosProdF.estructura == "S") {
		let tempData = dataFijosVariables(
			disponibles,
			"#tituloIngredientesFamilia",
			"#listaIngredientesProductoFamilia",
			datosProdF
		);
		disponibles = [...tempData.datos];
		mostrarAlerta = tempData.titulo;
	} else {
		$("#tituloIngredientesFamilia").hide();
	}
	$(".datos-prod-familia")
		.unbind()
		.on("shown.bs.modal", function (event) {
			$("#nombreProductoFamilia").children().text(datosProdF.nombre);
		});
	$("#TerminoProdFamilia-error").css("display", "none");

	$(".termino-producto-familia").hide();
	$("input[name=Termino]").prop("checked", false);
	if (datosProdF.terminos == "S") {
		$(".termino-producto-familia").show();
		$("input[name=TerminoProdFamilia]").attr("required", true);
		mostrarAlerta = true;
	}

	$("#formIngredientesFamilia")
		.unbind()
		.submit(function (e) {
			e.preventDefault();
			if ($(this).valid()) {
				let $fills = $(
					"#formIngredientesFamilia input, #formIngredientesFamilia textarea"
				);
				let data = { inventario: Array.from(disponibles), nuevo: true };
				$.each($fills, (pos, input) => {
					let value = $(input).val();
					let name = $(input).attr("name");
					if (name == "TerminoProdFamilia") {
						if ($(input).prop("checked")) {
							data["Termino"] = $(input).data("valor");
						}
					} else {
						if ($(input).attr("type") == "checkbox") {
							let pos = data.inventario.findIndex(
								(op) => op.productoid == name
							);
							if (pos != -1) {
								delete data.inventario[pos]["elegido"];
								if ($(input).is(":checked")) {
									data.inventario[pos]["elegido"] = true;
									data.inventario[pos]["checked"] = true;
								} else {
									delete data.inventario[pos]["checked"];
									data.inventario[pos]["elegido"] = false;
								}
							}
						} else {
							if (name == "ObservacioFamilia") name = "Observacio";
							data[name] = value;
						}
					}
				});

				if (noDisponibles.length) {
					let datos = [];
					noDisponibles.forEach((op) => {
						let enc = data.inventario.find(
							(it) => op.productoid == it.productoid
						);
						if (!enc) {
							datos.push(enc);
						}
					});
					data.inventario = data.inventario.concat(datos);
				}

				$(this)[0].reset();
				$("#formIngredientes :input").removeClass("is-invalid, input-invalid");
				$(this).validate().resetForm();
				/* Validamos si hay items de tipo O */
				abrirCerrarModal(".datos-prod-familia", "hide");
				if (observaciones.length) {
					observacionesProducto(
						"#listaObservacionesFamilia",
						datosProdF,
						observaciones,
						".modal-observaciones-producto-familia"
					);

					$("#formObservacionesProdFamilia")
						.unbind()
						.submit(function (e) {
							e.preventDefault();
							if ($(this).valid()) {
								let $fills = $("#formObservacionesProdFamilia input");
								let prodSelecteds = [];
								$.each($fills, (pos, input) => {
									const name = $(input).attr("name");
									let item = observaciones.find(
										(op) => op.EstructuraId == name
									);
									let itemProd = Object.assign({}, item);
									if ($(input).is(":checked")) {
										itemProd.elegido = true;
										itemProd.checked = true;
									} else {
										itemProd.elegido = false;
										delete itemProd.checked;
									}
									prodSelecteds.push(itemProd);
								});
								if (prodSelecteds.length) {
									data.inventario = data.inventario.concat(prodSelecteds);
								}
								datosProdF = { ...datosProdF, ...data };
								abrirCerrarModal(
									".modal-observaciones-producto-familia",
									"hide"
								);
								// Agregamos producto a la estructura
								prodsSelectFamilia[dataActualiza.posicionFami].push(datosProdF);
								$(dataActualiza.contexto)
									.children()
									.addClass("producto-seleccionado");
								$(dataActualiza.contexto).next().show();
								if (dataActualiza.cantidad == dataActualiza.veces) {
									$("#btnSiguienteFam").click();
								}
							} else {
								alertify.warning(
									"Los valores de las opciones no son correctos"
								);
							}
						});
				} else {
					// Agregamos producto a la estructura
					datosProdF = { ...datosProdF, ...data };
					prodsSelectFamilia[dataActualiza.posicionFami].push(datosProdF);
					$(dataActualiza.contexto)
						.children()
						.addClass("producto-seleccionado");
					$(dataActualiza.contexto).next().show();
					if (dataActualiza.cantidad == dataActualiza.veces) {
						$("#btnSiguienteFam").click();
					}
				}
			} else {
				alertify.error("Validar la información de los campos");
			}
		});

	if (mostrarAlerta) {
		abrirCerrarModal(".datos-prod-familia", "show");
	} else {
		$("#formIngredientesFamilia").submit();
	}
}

function dataFijosVariables(datos, titulo, lista, producto) {
	let ingredientes = { fijos: "", variables: "" };
	datos.forEach((item) => {
		if (item.Tipo != "" && item.Tipo != " ") {
			let tipo = item.Tipo == "F" ? "fijos" : "variables";
			ingredientes[
				tipo
			] += `<div class="col-12 custom-control custom-switch pr-0">
				<input type="checkbox" ${
					item.elegido == 1
						? "checked"
						: item.elegido == 0
						? ""
						: item.Tipo == "F" || item.checked
						? "checked"
						: ""
				} class="custom-control-input" name="${item.productoid}" id="item${
				item.productoid
			}">
				<label class="custom-control-label" for="item${item.productoid}">${
				item.nombre
			}</label>
			</div>`;
			if (item.elegido == 1) {
				item.checked = true;
				item.elegido = true;
			}
		}
	});
	let tituloData = false;
	if (
		producto.inventames != "S" &&
		(ingredientes.variables != "" || ingredientes.fijos != "")
	) {
		$(titulo).show();
		$(lista).html(`<div class="col-${
			ingredientes.variables == "" ? "12" : "6"
		} row">
			${ingredientes.fijos != "" ? `<div class="col-12">Fijos</div>` : ""}
			${ingredientes.fijos}
		</div>
		<div class="col-${ingredientes.fijos == "" ? "12" : "6"} row">
			${ingredientes.variables != "" ? `<div class="col-12">Variables</div>` : ""}
			${ingredientes.variables}
		</div>`);
		tituloData = true;
	} else {
		$(titulo).hide();
	}
	return { datos, titulo: tituloData };
}

function validarProductosFamilia() {
	let totalHay = Object.keys(prodsSelectFamilia).filter(
		(it) => prodsSelectFamilia[it].length
	).length;
	$(".platosFamiliaCant").text(
		`${+$("#cantProducto").val() - totalHay} Platos Pendientes`
	);
}

function validarBtnFacturaElectronica() {
	let element = $("#btnFacturarFacturaElectronico");

	if (tipoVentaSeleccionado.vendedor != "S") element.data("vendfactura", "S");

	if (tipoVentaSeleccionado.FacturaElectronica != "S") {
		if ((terceroIdPedido + "").trim().length < 4) {
			if (terceroPedidoEmpresa && terceroPedidoEmpresa["TerceroID"]) {
				if ((terceroPedidoEmpresa["TerceroID"] + "").trim().length < 4) {
					element.addClass("d-none");
				} else {
					if (element.attr("data-vendfactura") == "S") {
						element.removeClass("d-none");
					} else {
						element.addClass("d-none");
					}
				}
			} else {
				element.addClass("d-none");
			}
		} else {
			if (element.attr("data-vendfactura") == "S") {
				element.removeClass("d-none");
			} else {
				element.addClass("d-none");
			}
		}
	}
}

//Recortar los números sin redondear
function myRound(num, dec) {
	var exp = Math.pow(10, dec || 2);
	return parseInt(num * exp, 10) / exp;
}

function ocultarConsumos() {
	if ($(".btnOcultarConsumos").find("i").hasClass("fa-eye")) {
		$(".btnOcultarConsumos")
			.find("i")
			.removeClass("fa-eye")
			.addClass("fa-eye-slash");
		$(".btnOcultarConsumos").addClass("ocultarConsumos");
	} else {
		$(".btnOcultarConsumos")
			.find("i")
			.removeClass("fa-eye-slash")
			.addClass("fa-eye");
		$(".btnOcultarConsumos").removeClass("ocultarConsumos");
	}
	sincronizarConsumo();
}

function abrirModuloCuentasPendientes() {
	let cargaModulo = $.Deferred(function (dfd) {
		$(".modal-cuentas-pendientes-modulo").load(
			`${base_url()}Administrativos/Servicios/CuentasPendientes/cargarModuloModal`,
			{
				almacen: $INFOALMACEN.almacenid,
			},
			dfd.resolve
		);
	}).promise();

	$.when(cargaModulo).then(function () {
		abrirCerrarModal("#datosCuentasPendientes", "show");
		dataTable();
		$(".modal-cuentas-pendientes-modulo")
			.find("div")
			.removeClass(["card", "card-principal"]);
	});
}

function soloLetrasNumerosMesas(e, input) {
	key = e.keyCode || e.which;
	tecla = String.fromCharCode(key).toLowerCase();
	letras = "abcdefghijklmnopqrstuvwxyz1234567890";
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
