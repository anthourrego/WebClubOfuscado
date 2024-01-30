function menusComponent(nombreMenu = "", productosSeleccionados = []) {
	const strModal = `
    <div
      class="modal fade"
      id="modalMenu"
      data-backdrop="static"
      data-keyboard="false"
      aria-labelledby="modalMenuLabel"
      aria-hidden="true"
	  style="overflow:auto;"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header headerWebClub headerMenu">
            <h5 class="modal-title">
              <i class="fas fa-utensils"></i> Menús${
								nombreMenu !== "" ? " / " + nombreMenu : ""
							}
            </h5>
            <select class="form-control form-control-sm selectMenu">
              ${menus.map(
								(menu) =>
									`<option value="${menu.almacenid}">${menu.Almacen} | ${menu.TipoMenuTouch}</option>`
							)}
            </select>
          </div>
          <div class="modal-body">
            <div class="row">
			
			
				<div class="col-11 col-sm-11 col-md-11 col-lg-11 formBuscarProductos titleDisponible">
					<div class="form-group form-valid mb-0" style="padding-top:10px !important">
						<input type="text" name="valProducto" class="form-control form-control-floating valProducto" placeholder="Código o Nombre" id="valProducto" style="	z-index: 99;background: transparent;position: relative;">
						<label class="floating-label nombre-produc-buscar valProducto" for="valProducto">Código o Nombre Producto</label>
					</div>
				</div>
				<div class="col-1 col-sm-1 col-md-1 formBuscarProductos">
					<button style="display: none" title="Limpiar" type="button" id="btnLimpiarBuscadorProducto" class="btn btn-danger">
						<i class="fas fa-times-circle"></i>
					</button>
				</div>
				
			
              <div class="col div-tipos-comida">
                <div class="mt-2 px-1" id="tiposComida">
                  <div
                    class="row mx-0 px-0 col-12 flex-nowrap"
                    id="lista-tipo-comidas"
                    style="overflow-x: auto; overflow-y: hidden"
                  ></div>
                </div>
                <hr class="m-2" />
                <nav aria-label="breadcrumb" class="linea-subgrupos d-none"></nav>
                <div class="prods-padre row mx-0">
                  <div class="col-12 col-md-5 my-2 formBuscarProductosFamilias d-none">
                    <div class="form-group form-valid mb-0">
                      <input
                        type="text"
                        name="valProdFami"
                        class="form-control form-control-floating"
                        placeholder="Nombre"
                        id="valProdFami"
                      />
                      <label
                        class="floating-label nombre-produc-buscar"
                        for="valProdFami"
                      >
                        Nombre Producto
                      </label>
                    </div>
                  </div>
                  <div
                    class="row mt-2 mb-3 mx-0 col-12 px-0"
                    id="productosMenu"
                  ></div>
                  <div class="contenido-plato-familia col-3 d-none">
                    <div id="lista-platos-familia"></div>
                  </div>
                  <div
                    class="col-1 btn-group-vertical d-none"
                    role="group"
                    id="btnProcesosFamilias"
                    style="max-height: 330px"
                  >
                    <button
                      title="Anterior"
                      type="button"
                      class="btn btn-secondary"
                      id="btnAnteriorFam"
                      style="font-size: 30px"
                    >
                      <i class="fas fa-arrow-alt-circle-left"></i>
                    </button>
                    <button
                      title="Cancelar"
                      type="button"
                      class="btn btn-danger"
                      id="btnCancelarFam"
                      style="font-size: 30px"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                    <button
                      title="Confirmar Plato"
                      type="button"
                      class="btn btn-primary"
                      id="btnConfirmPlatoFam"
                      style="font-size: 30px"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button
                      title="Agregar Platos"
                      type="button"
                      class="btn btn-success"
                      id="btnAceptarFam"
                      style="font-size: 30px"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                    <button
                      title="Siguiente"
                      type="button"
                      class="btn btn-secondary"
                      id="btnSiguienteFam"
                      style="font-size: 30px"
                    >
                      <i class="fas fa-arrow-alt-circle-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer p-2">
            <button
              id="cancelarMenu"
              type="button"
              class="btn btn-dark"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              form="formCargarAccion"
              id="btnAceptarMenu"
              disabled
            >
              Confirmar Menú
            </button>
          </div>
        </div>
      </div>
    </div>;  
  `;

	const strModalBusqueda = `
  	<div id="BusquedaProducto" data-keyboard="false" data-backdrop="static" class="modal fade" role="dialog" aria-labelledby="BusquedaProductoLabel" aria-hidden="true" style="overflow:auto;">
		<div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
			<div class="modal-content">
				<div class="modal-header headerWebClub">
					<h5 class="modal-title" id="BusquedaProductoLabel">
						<i class="far fa-image"></i>
						Resultado de la búsqueda
					</h5>
				</div>
				<div class="modal-body">
					<div class="row mt-2 mb-3 mx-0" id="productosMenuBusqueda"></div>
				</div>
				<div class="modal-footer p-2">
					<button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="$('#btnLimpiarBuscadorProducto').click()" id="btnCancelarBusquedaProducto">Cancelar</button>
				</div>
			</div>
		</div>
	</div>
  `;

	return new Promise(function (resolve, reject) {
		modalVisible = false;
		const rutaControlador =
			base_url() + "Administrativos/Eventos/MenusComponent/";

		let productoActual = {};
		let ListaGruopos = [];

		const obtenerGruposMenu = (mesa, subgrupoMenu = "N") => {
			//const example = {
			// AlmacenNoFisico: null,
			// accesoCargarCuentaHotel: 0, -- aplica solo si se entra desde modulo cargue cuenta hotel
			// accion: "5346",
			// almacenid: "005",
			// diaSemana: "Martes", -- aplica horario grupo menu
			// headReservaHotel: 0, -- no aplica no se usa
			// mesaId: false,
			// rastreoAbreCenta: true, -- aplica solo papra guardar el rastreo de mesa abierta o cuenta abierta
			// soloDesayuno: 0, -- aplica si se necesita contar desayunos en grupo menu
			//subgrupo: "N",
			// tercero: "19189208",-- se usa para la mesa en edicion
			// terceroEmpresa: null,
			// tipoMenu: "01",
			// tipoVenta: null,
			// zona: "01",
			// };

			let data = {
				// AlmacenNoFisico: $INFOALMACEN.NoFisico,
				// accesoCargarCuentaHotel: accesoCargarCuentaHotel ? 1 : 0,
				// almacenid: $INFOALMACEN["almacenid"],
				// diaSemana: obtenerDiaSemana(),
				// headReservaHotel: tercerosDesayuno.length > 0 ? HeadReservaIdHotel : 0,
				// mesaId: mesa,
				// rastreoAbreCenta: accionPos == "general" ? rastreoAbreCenta : true,
				// soloDesayuno: tercerosDesayuno.length > 0 ? 1 : 0,
				subgrupo: subgrupoMenu,
				// tercero: terceroIdPedido,
				// terceroEmpresa:
				// 	terceroPedidoEmpresa && terceroPedidoEmpresa.TerceroID
				// 		? ("" + terceroPedidoEmpresa.TerceroID).trim()
				// 		: null,
				// tipoMenu: $INFOALMACEN["TipoMenuId"],
				// tipoVenta: tipoVentaSeleccionado.CodigEstru || null,
				// zona: zonaMesaActual["ZonaId"] || "",
			};

			// if (accionTercero) {
			// 	data["accion"] = accionTercero;
			// }

			const info = {
				...data,
				AlmacenMenuId: tmpAlmacenMenuId,
				sedeId: nuevaReserva.disponibilidad.sede,
			};

			const AlmacenMenuId = $(".selectMenu").val();
			if(AlmacenMenuId != "" && AlmacenMenuId != null) {
				info.AlmacenMenuId = AlmacenMenuId;
			} else if (nuevaReserva.disponibilidad.almacen != null) {
				info.AlmacenMenuId = nuevaReserva.disponibilidad.almacen;
			}

			$.ajax({
				url: rutaControlador + "obtenerGrupoMenu",
				type: "POST",
				dataType: "json",
				data: {
					info,
				},
				success: function (res) {
					if (res.valido) {
						clickMesa(res);
						$(".valProducto").attr("hidden", false);
					} else {
						$(".valProducto").attr("hidden", true);
						$(".popover").popover("hide");
						$(".titleDisponible").html(res.mensaje);
						return alertify.warning(res.mensaje);
					}
				},
			});

			//Validamos para cuando sea de cargue desayuno recargue los productos cargados
			// if (accesoCargarCuentaHotel) {
			// sincronizarConsumo();
			// }
		};

		const clickMesa = ({ datos, /*consumo, montaje,*/ subgrupo }) => {
			$(".popover").popover("hide");
			ListaGruopos = datos;
			// $DATOSMONTAJE = montaje;
			fontProds = "";
			baseHeight = 100;
			/*if (
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
            }*/

			if (subgrupo == "N") {
				$(".linea-subgrupos").addClass("d-none");
				// .hide();
				ListaGruopos = [];
				datos.forEach((op) => {
					ListaGruopos.push(op.GrupoId);
					$("#lista-tipo-comidas")
						.append(`<div class="col-4 col-md-3 col-sm-4 col-lg-2 col-xl-2 card-tipo-comida px-1 mb-2" data-grupo="${
						op.GrupoId
					}" style="cursor:pointer; height: ${baseHeight}px; max-height: ${baseHeight}px;" title="${
						op.Nombre
					}">
                        <div class="card mb-1 h-100" style="box-shadow: none !important;">
                            <div class="card-body px-1 py-1" style="border:1px solid #b2b9be;">
                                <div class="d-flex flex-column align-items-center justify-content-center h-100" ${
																	!op.Imagen
																		? `style="background-color: #${op.Color};"`
																		: ""
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
				// $(".btn-Reservas").addClass("d-none");
				// .hide();
				$(".card-tipo-comida").on("click", function () {
					/*if ($DATOSMONTAJE["LimitarBusqueda"] != "N") {
                        $(".formBuscarProductos").removeClass("d-none");
                        // .show();
                    }*/
					$(".card-tipo-comida").removeClass("tipo-comida-seleccionado");
					$(this).addClass("tipo-comida-seleccionado");
					valorBuscarProducto = "";
					// $("#valProducto").val("");
					$(".card-tipo-comida")
						.children()
						.children("div")
						.removeClass("producto-seleccionado");
					$(this).children().children("div").addClass("producto-seleccionado");
					// if (!terceroIdPedido || !vendedorElegido) {
					// 	if (!terceroIdPedido) {
					// 		return alertify.warning("No hay persona identificada para el pedido");
					// 	} else {
					// 		if (accesoCargarCuentaHotel && tercerosAccion.length) {
					// 			$("#numeroAccion").val(terceroIdPedido);
					// 			return alertify.warning(
					// 				"No hay persona identificada para el pedido"
					// 			);
					// 		} else {
					// 			if (
					// 				tipoVentaSeleccionado.vendedor &&
					// 				tipoVentaSeleccionado.vendedor == "S"
					// 			) {
					// 				validarVendedor();
					// 				return;
					// 			}
					// 		}
					// 	}
					// }

					/* Se limpia para reiniciar las migas de pan */
					$(".linea-subgrupos").addClass("d-none");
					// .hide();
					lineaTiempoSubGrupos = [];

					let data = {
						grupoId: $(this).data("grupo"),
					};

					const Imagen =
						$(this).find("img").length > 0
							? $(this).find("img").attr("src")
							: null;

					lineaTiempoSubGrupos.push({
						Color: $(this).css("background-color"),
						GrupoId: $(this).data("grupo"),
						Imagen,
						Nombre: $(this).find("p").text().trim(),
					});
					organizarSubGruposLineaTiempo(datos[0]);

					obtenerProducsdDelMenu("clickTipoMenu", data);
				});
				/*$POST = true;
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
                }*/
				/*if (arrayProductosPedido.length > 0 && consumo.length > 0) {
                    if (terceroIdPedido) {
                        organizarAcumulado();
                        $(".btn-floating").removeClass("d-none");
                        // .show();
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
                } else {
                    $(".totalCuentaActual").text("$0.00");
                }*/
				// $(".formBuscarProductos").addClass("d-none");

				$("#productosMenu").empty();
				// $(".formBuscarProductos").removeClass("d-none");
			} else {
				if (datos.length) {
					obtenerProducsdDelMenu("clickTipoMenu", {
						grupoId: datos[0].GrupoId,
					});
					lineaTiempoSubGrupos.push(datos[0]);
					organizarSubGruposLineaTiempo(datos[0]);
				} else {
					alertify.warning("No se encontro subgrupo asociado");
				}
			}
		};

		const obtenerProducsdDelMenu = (funcionRetorno, dataExtra = {}) => {
			//const example = {
			//almacen: "005 ",
			// anio: "2023",
			//codiVentId: 4,
			// diaMes: "7", --Promocion
			// diaSemana: "Miercoles", --Promocion
			// diaSemanaCorto: "MI", --Promocion
			// grupoId: 387, -- cada grupo del tipo de menu
			// grupoMenu: "01",  --Promocion
			// headReservaHotel: 0, // No se usa en esta query
			// lista: 1,
			// mes: "06", --Promocion
			// semanaMes: "'1'", --Promocion
			// soloDesayuno: 0,
			// tercero: "19189208", -- Tipo de cartera y lista de precio
			// tipoMenu: "01", -- Se utiliza solo cuando se busca producto
			// tipoVenta: null,

			// NoValidaInventario: true,
			//};
			///const data = {
			// diaSemana: obtenerDiaSemana(),
			// diaMes: moment().format('D'),
			// mes: moment().format('MM'),
			// anio: moment().format('YYYY'),
			// semanaMes: Math.ceil(moment().date() / 7) > 3 ? "'4','U'" : "'" + Math.ceil(moment().date() / 7) + "'",
			// diaSemanaCorto: obtenerDiaSemana().substr(0, 2).toUpperCase(),
			// almacen: $INFOALMACEN['almacenid'],
			// tercero: terceroIdPedido,
			// grupoMenu: $INFOALMACEN['TipoMenuId'],
			// lista: (tipoVentaSeleccionado.precio || null),
			// tipoVenta: (tipoVentaSeleccionado.CodigEstru || null),
			// codiVentId: (tipoVentaSeleccionado.codiventid || null),
			// tipoMenu: $INFOALMACEN['TipoMenuId'],
			// soloDesayuno: (tercerosDesayuno.length > 0 ? 1 : 0),
			// headReservaHotel: (tercerosDesayuno.length > 0 ? HeadReservaIdHotel : 0)
			//};

			$.ajax({
				url: rutaControlador + "obtenerProductos",
				type: "POST",
				data: {
					// info: { ...data, ...dataExtra },
					info: {
						...dataExtra,
						AlmacenMenuId: tmpAlmacenMenuId,
						grupos: ListaGruopos,
					},
				},
				success: function (res) {
					clickTipoMenu(JSON.parse(res));
				},
			});

			// obtenerInformacion({ ...data, ...dataExtra }, 'obtenerProductos', funcionRetorno);
		};

		const clickTipoMenu = ({ datos }) => {
			let estructuraHtml = "";
			$("#productosMenu").empty();
			datos.forEach((op) => {
				/* Se valida aplica sub grupo para que siempre se habilite */
				let productoValido =
					op.veriInven == "SI" || op.AplicaSubGrupo > 0 ? true : false;

				if (!productoValido) {
					// && $DATOSMONTAJE["soloexiste"] == "S"
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
				/*if (
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
                }*/

				fontPrecioProds = "";
				/*if (
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
                }*/

				let productoSeleccionado = false;
				productosSeleccionados.forEach((item) => {
					if (item.ProductoId === op.ProductoId) {
						productoSeleccionado = true;
					}
				});

				if (productoSeleccionado) {
					$(".btnGroupAgregarMenu").find(".btn-danger").removeClass("d-none");
				}

				if (disenoProds == 1) {
					estructuraHtml += `<div 
                            class="producto-menu pb-2 px-1 ${
															productoSeleccionado ? "productoSeleccionado" : ""
														}"
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
                                <div class="${
																	op.Imagen
																		? "d-flex align-items-center"
																		: "d-none"
																} col-4">
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
																					!op.Imagen
																						? "-webkit-line-clamp: 4;"
																						: ""
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
						const idMesaActual = null;
						obtenerGruposMenu(idMesaActual, subgrupo);
					} else {
						if ($(this).data("valido")) {
							// if (tercerosDesayuno.length) {
							// 	let catn = tercerosDesayuno.filter(x => !x.ProductoDesayuno || (x.ProductoDesayuno && !x.ProductoDesayuno.Id));
							// 	if (!catn.length) {
							// 		return alertify.warning("Todos los huespedes tienen desayuno");
							// 	}
							// }
							const produ = $(this).data("produ").trim();

							productoActual = {
								...datos.find((it) => it.ProductoId == produ),
							};
							tipoVentaSeleccionado = {
								PreciAbier: "S",
							};
							if (
								+productoActual["Valor"] <= 0 &&
								// $DATOSMONTAJE["ventaceros"] != "S" &&
								tipoVentaSeleccionado.PreciAbier != "S"
							) {
								alertify.error("El producto no posee un valor de venta");
								return;
							}
							/*if (productoActual.terminos == "S") {
                                $(".termino-producto").removeClass("d-none");
                                $("input[name=Termino]").attr("required", true);
                            } else {
                                $(".termino-producto").addClass("d-none");
                                $("input[name=Termino]").prop("checked", false);
                            }*/
							$("input[name=Cantidad]").val(1);
							// $("#allevar").attr("checked", false);
							/*let data = {
                                headprodid: productoActual.headprodid,
                                producto: productoActual.ProductoId,
                                // almacen: $INFOALMACEN["almacenid"],
                                // tipoVenta: tipoVentaSeleccionado.CodigEstru || null,
                                tipoVenta: null,
                                pendiente: false,
                            };*/
							// $("#tituloIngredientes").addClass("d-none");
							// editarProductoPedidoNuevo = -1;
							// prodsSelectFamilia = {};
							// posPlatoActualFami = -1;
							// $("#cantProducto").prop("disabled", false);
							// $("#btnEliminarPromocion").addClass("d-none");
							// .hide();

							if ($(this).hasClass("productoSeleccionado")) {
								productosSeleccionados.forEach(
									(productoSeleccionado, index) => {
										if (productoSeleccionado.ProductoId.trim() === produ) {
											productosSeleccionados.splice(index, 1);
										}
									}
								);

								$(this).removeClass("productoSeleccionado");

								if ($(".productoSeleccionado").length === 0) {
									$(".btnGroupAgregarMenu")
										.find(".btn-danger")
										.addClass("d-none");
								}
							} else {
								productoActual.AlmacenMenuId = tmpAlmacenMenuId;
								productosSeleccionados.push(productoActual);

								$(this).addClass("productoSeleccionado");

								$(".btnGroupAgregarMenu")
									.find(".btn-danger")
									.removeClass("d-none");
							}
							$("#BusquedaProducto").modal("hide");
							$("#modalMenu").modal("show");
							$(".producto-seleccionado").click();

							menusSeleccionados();

							if (productosSeleccionados.length) {
								$("#btnAceptarMenu").attr("disabled", false);
							} else {
								$("#btnAceptarMenu").attr("disabled", true);
							}
						} else {
							alertify.warning("Producto no disponible");
						}
					}
				}, 10);
			});
			$("#tabProductos").click();

			$("#btnLimpiarBuscadorProducto").click(function () {
				$("#btnLimpiarBuscadorProducto").hide();
				$("#valProducto").val("").focus();
			});

			$("#btnCancelarBusquedaProducto").click(function (e) {
				e.preventDefault();
				modalVisible = false;
				$("#modalMenu").modal("show");
				$("#BusquedaProducto").modal("hide");
				$(".producto-seleccionado").click();
			});
		};

		const organizarSubGruposLineaTiempo = (eliminar = -1) => {
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
				.html(
					`<ol class="breadcrumb mb-1 position-relative olBreadcrumb">
                        ${estructura}
                    </ol>
                    <div class="btn-group btnGroupAgregarMenu">
                        <button type="button" class="btn btn-danger d-none" title="Descartar menú">
                            <i class="fa fa-times" />
                        </button>
                        <button type="button" class="btn btn-success">
                            Agregar Menú
                        </button>
                    </button>`
				)
				.removeClass("d-none")
				.on("click", ".item-subgrupo", function () {
					console.log("funca");
					let data = $(this).data();
					organizarSubGruposLineaTiempo(data.pos);
					obtenerProducsdDelMenu("clickTipoMenu", { grupoId: data.grupo });
				})
				.find(".btnGroupAgregarMenu")
				.on("click", ".btn-success", function (e) {
					e.preventDefault();

					$("[data-produ]:not(.productoSeleccionado)").each(function () {
						if ($(this).attr("data-produ") !== "null") {
							$(this).click();
						}
					});
				})
				.on("click", ".btn-danger", function (e) {
					e.preventDefault();

					$("[data-produ].productoSeleccionado").each(function () {
						if ($(this).attr("data-produ") !== "null") {
							$(this).click();
						}
					});
				});
		};

		const delay = (callback) => {
			var timer = 0;
			return () => {
				clearTimeout(timer);
				timer = setTimeout(function () {
					callback.apply(this, arguments);
				}, 700);
			};
		};

		const menusSeleccionados = () => {
			const almacenesMenus = productosSeleccionados.reduce(
				(almacenes, objeto) => {
					if (!almacenes.includes(objeto.AlmacenMenuId)) {
						almacenes.push(objeto.AlmacenMenuId);
					}
					return almacenes;
				},
				[]
			);

			$("#modalMenu")
				.find(".selectMenu option")
				.each(function () {
					if ($(this).text().substring(0, 2) === "* ") {
						$(this).text($(this).text().substring(2));
					}
				})
				.each(function () {
					if (almacenesMenus.includes($(this).val())) {
						$(this).text(`* ${$(this).text()}`);
					}
				});
		};

		$("body").append(strModal);
		$("body").append(strModalBusqueda);

		// obtenerGruposMenu(false);
		$("#modalMenu").modal("show");
		setTimeout(() => {
			$("#modalMenu").find(".selectMenu").val(almacenIdEventos).change();
		}, 500);

		$("#valProducto").change(
			delay(function () {
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
					obtenerProducsdDelMenu("clickTipoMenu", data);
				}
			})
		);

		menusSeleccionados();

		$("#modalMenu")
			.on("hidden.bs.modal", function () {
				if (!modalVisible) {
					$(this).remove();
				}
			})
			.on("click", "#btnAceptarMenu", function (e) {
				e.preventDefault();
				resolve(productosSeleccionados);
				$("#modalMenu").modal("hide");
			})
			.on("click", "#cancelarMenu", function (e) {
				e.preventDefault();
				if (productosSeleccionados.length) {
					if (
						confirm(
							"Tiene productos seleccionados que no se guardarán, ¿Está seguro de cancelar?"
						)
					) {
						reject({});
						$("#modalMenu").modal("hide");
					}
				} else {
					resolve(productosSeleccionados);
					$("#modalMenu").modal("hide");
				}
			})
			.on("change", ".selectMenu", function () {
				tmpAlmacenMenuId = $(this).val();

				$("#lista-tipo-comidas").html("");
				$("#productosMenu").html("");

				obtenerGruposMenu(false);
			});

		function productosBusqueda(resp) {
			$("#productosMenuBusqueda").html(resp);
			valorBuscarProducto = "";
			modalVisible = true;
			$("#modalMenu").modal("hide");
			$("#BusquedaProducto").modal("show");
		}
	});
}
