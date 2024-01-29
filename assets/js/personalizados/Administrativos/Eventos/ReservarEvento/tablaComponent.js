// Clase Tabla
class Tabla {
	constructor(selector, config = {}) {
		this.__selector = selector;

		this.__config = {};

		this.__config.data = config.data !== undefined ? config.data : [];
		this.__config.editable =
			config.editable !== undefined ? config.editable : false;
		this.__config.menus = config.menus !== undefined ? config.menus : false;
		// Permite los menús
		this.__config.menusEditables =
			config.menusEditables !== undefined ? config.menusEditables : false;
		this.__config.tipo = config.tipo !== undefined ? config.tipo : "html";
		// En caso de que los productos sean editables en cantidad pero se limiten a una cantidad máxima
		this.__config.cantidadMax =
			config.cantidadMax !== undefined ? config.cantidadMax : false;
		// Parámetro para habilitar o no la opción de descartar productos
		this.__config.descartarProductos =
			config.descartarProductos !== undefined
				? config.descartarProductos
				: true;
		// Parámetro para indicar la cantidad mínima de cantidad
		this.__config.cantidadMin =
			config.cantidadMin !== undefined ? config.cantidadMin : 1;
		// Formulario para agregar productos por código
		this.__config.agregarProductos =
			config.agregarProductos !== undefined ? config.agregarProductos : false;
		// Filtro para búsqueda de productos
		this.__config.productos =
			config.productos !== undefined ? config.productos : [];
		// Mostrar precios por producto
		this.__config.precios =
			config.precios !== undefined ? config.precios : true;
		// Precio abierto
		this.__config.precioAbierto =
			config.precioAbierto !== undefined ? config.precioAbierto : false;

		this.__productoSeleccionado = {};

		if (this.__config.tipo === "html") {
			this.pintarTablaHTML();
		} else {
			this.pintarDataTables();
		}

		this.__id = Math.floor(Math.random() * 100) + 1;
	}

	// Método para pintar una tabla básica HTML utilizando jQuery
	pintarTablaHTML() {
		this.__config.tipo = "html";

		const tabla = $(this.__selector),
			self = this;

		tabla.empty();

		const tablaContenedora = $(`
			<table
				border="0"
				cellpadding="0"
				cellspacing="0"
				align="center"
				width="100%"
				class="mb-4"
			></table>
		`);
		const tbody = $("<tbody></tbody>");

		// Objeto donde se agruparán los objetos por el menú
		const objetosAgrupados = this.__config.data.reduce((acumulador, objeto) => {
			const menu = objeto.menu;
			if (!acumulador[menu]) {
				acumulador[menu] = [];
			}
			acumulador[menu].push(objeto);
			return acumulador;
		}, {});

		// Array de objetos agrupados por el menú
		const arrayAgrupado = Object.entries(objetosAgrupados).map(
			([menu, objetos]) => ({ menu, objetos })
		);

		arrayAgrupado.forEach((menu) => {
			const objetos = menu.objetos;
			if (menu.objetos.length > 0) {
				menu.nombreMenu = menu.objetos[0].nombreMenu;
				if (menu.objetos[0].ElementoId === -1) {
					menu.Valor = menu.objetos[0].Valor;
					menu.ProductoId = menu.objetos[0].ProductoId;

					objetos.shift();
				}
			}
		});

		arrayAgrupado.forEach((menu) => {
			tbody.append(`<tr>
				<td height="20"></td>
			</tr>`);

			const menuTR = $("<tr></tr>");
			menuTR.append(`<td width="40"></td>`);

			const menuTD = $(`<td>
				<table style="border: 1px solid #e6ebf1" cellpadding="0" cellspacing="0" align="center" width="100%" data-menu="${
					menu.menu
				}">
					<tbody>
						<tr>
							<td style="padding: 15px" class="position-relative">
								${
									this.__config.menus
										? this.__config.menusEditables
											? `
									<div class="form-group pr-5">
										<input
											type="text"
											class="form-control form-control-floating inputTitulo"
											placeholder="Nombre Menú"
											value="${menu.nombreMenu}"
										/>
										<button
											title="Seleccionar productos menú"
											class="btnSeleccionarMenu"
										>
											<i class="fas fa-utensils"></i>
										</button>
									</div>
									`
											: `<p class="pTitulo ${
													menu.objetos.length ? "" : "mb-0 pb-0"
											  }">${menu.nombreMenu}</p> ${
													typeof menu.Valor !== "undefined"
														? `<input
															type="text"
															class="form-control form-control-floating inputValorLugar"
															placeholder="Valor"
															value="${parseFloat(menu.Valor)}"
														/>`
														: ""
											  }`
										: ""
								}
							</td>
						</tr>
					</tbody>
				</table>
			</td>`)
				.on("change", ".inputTitulo", function () {
					const newTitle = $(this).val();

					const data = [...self.getData()];

					data.forEach((item) => {
						if (item.menu === menu.menu) {
							item.nombreMenu = newTitle;
						}
					});

					self.setData(data);
				})
				.on("click", ".btnSeleccionarMenu", function (e) {
					e.preventDefault();
					const nombreMenu = $(this).closest("table").find("input").val();
					tmpAlmacenMenuId =
						menu.objetos[menu.objetos.length - 1].AlmacenMenuId;
					menusComponent(nombreMenu, menu.objetos)
						.then((menusData) => {
							const menu = $(this).closest("[data-menu]").attr("data-menu");

							const data = [...self.getData()];

							const filteredData = data.filter((item) => item.menu !== menu);

							const menus = menusData.map((producto) => {
								const {
									ProductoId,
									Imagen,
									Valor,
									nombre,
									ivaid,
									ValorOriginal,
									minimo,
									maximo,
									AlmacenMenuId,
								} = producto;
								return {
									menu,
									nombreMenu,
									ProductoId,
									Imagen,
									Valor: parseFloat(Valor),
									nombre,
									cantidad: producto.cantidad ? producto.cantidad : 1,
									total: parseFloat(Valor),
									ivaid,
									ValorOriginal,
									minimo,
									maximo,
									AlmacenMenuId,
								};
							});

							const updatedData = [...menus, ...filteredData];

							updatedData.sort((a, b) => a.menu - b.menu);

							self.setData(updatedData);
						})
						.catch((e) => {
							if (typeof e === "object" && Object.keys({}).length === 0) {
								console.log("No se seleccionó ningún producto");
							} else {
								console.error(e);
							}
						});
				})
				.on("focus", "input", function () {
					$(this).select();
				});
			menuTD
				.find(".inputValorLugar")
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
					prefix: "$ ",
					integerDigits: 9,
					allowPlus: false,
					allowMinus: false,
				})
				.focus(function () {
					var selfie = this;
					setTimeout(function () {
						$(selfie).select();
					}, 0);
				})
				.val(parseFloat(menu.Valor))
				.change(function () {
					let val = $(this).val();
					let newVal = parseFloat(val.replace(/[$,]/g, ""));

					const index = self
						.getData()
						.findIndex(
							(producto) =>
								producto.ProductoId === menu.ProductoId &&
								producto.menu === menu.menu &&
								producto.ElementoId === -1
						);
					if (index !== -1) {
						const data = self.getData();
						data[index].Valor = newVal;
						data[index].total = newVal;
						self.setData(data);
					}
				});

			menu.objetos.forEach((producto) => {
				const productoTable = $(`
				<table width="100%" data-productoid="${producto.ProductoId}">
					<tbody>
						<tr>
							<td width="50">
							${
								producto.Imagen
									? `
							<img height="60px"
								src="${producto.Imagen}"
								alt="" style="
									display: block;
									height: auto;
									max-height: 70px;
									margin-left: auto;
									margin-right: auto;
									max-width: 100%;
								" class="CToWUd" data-bit="iit"
							/>
							`
									: ""
							}
							</td>
							<td width="10px"></td>
							<td>
								<p class="mb-0">${producto.nombre}</p>
								${
									self.__config.precios
										? `<p class="mb-0" style="
											color: #303336;
											line-height: 1.5;
											letter-spacing: -0.5;
											font-size: 14px;
										">
											$ ${addCommas(producto.total)}
										</p>
										${
											self.__config.precioAbierto &&
											parseFloat(producto.minimo) > 0 &&
											parseFloat(producto.maximo) > 0
												? `<div class="divEditarValor">
													<input
														type="text"
														class="form-control form-control-floating inputValorProducto"
														placeholder="Valor"
														value="${parseFloat(producto.Valor)}"
													/>
													<i class="fas fa-pen editarValor"></i>
												</div>`
												: `<p class="mb-0" style="
													color: #9fa2a2;
													line-height: 1.5;
													letter-spacing: -0.5;
													font-size: 14px;
												">
													$ ${addCommas(producto.Valor)} c/u
												</p>`
										}
										`
										: ""
								}
							</td>
							<td align="right" width="150px">
								<div class="input-group">
									<button class="btnTabla restar" title="${
										producto.cantidad > self.__config.cantidadMin
											? "Quitar"
											: "Descartar"
									}">
										<i class="fas fa-${
											producto.cantidad > self.__config.cantidadMin
												? "minus"
												: "trash"
										}"></i>
									</button>
									<input
										type="text"
										class="form-control form-control-floating px-0 text-center cantidad data-int"
										placeholder="Nombre Menú"
										value="${producto.cantidad}"
									/>
									${
										self.__config.cantidadMax && producto.cantidadMax > -1
											? `
										<label class="labelCantidadMax">max: ${addCommas(producto.cantidadMax)}</label>
									`
											: ""
									}
									<button class="btnTabla sumar" title="Agregar">
										<i class="fas fa-plus"></i>
									</button>
								</div>
							</td>
						</tr>
						<tr style="height: 12px">
							<td></td>
						</tr>
					</tbody>
				</table>
				`);

				productoTable
					.on("click", ".restar", function (e) {
						e.preventDefault();

						const data = [...self.getData()];

						const productoEditar = data.find((item) => {
							if (self.__config.menus) {
								return (
									item.menu == menu.menu &&
									item.ProductoId === producto.ProductoId
								);
							} else {
								return item.ProductoId === producto.ProductoId;
							}
						});

						if (productoEditar) {
							if (productoEditar.cantidad - 1 < self.__config.cantidadMin) {
								if (self.__config.descartarProductos) {
									const indexToRemove = data.findIndex((item) => {
										if (self.__config.menus) {
											return (
												item.menu === menu.menu &&
												item.ProductoId === producto.ProductoId
											);
										} else {
											return item.ProductoId === producto.ProductoId;
										}
									});

									if (indexToRemove !== -1) {
										data.splice(indexToRemove, 1);

										alertify.warning("Producto descartado del menú");
									}
								} else {
									alertify.warning("No se puede descartar");
								}
							} else {
								productoEditar.cantidad = productoEditar.cantidad - 1;
								productoEditar.total =
									productoEditar.Valor * productoEditar.cantidad;
							}
						}

						self.setData(data);
					})
					.on("click", ".sumar", function (e) {
						e.preventDefault();

						const data = [...self.getData()];

						const productoEditar = data.find((item) => {
							if (self.__config.menus) {
								return (
									item.menu == menu.menu &&
									item.ProductoId === producto.ProductoId
								);
							} else {
								return item.ProductoId === producto.ProductoId;
							}
						});

						if (productoEditar) {
							productoEditar.cantidad = productoEditar.cantidad + 1;

							if (
								self.__config.cantidadMax &&
								productoEditar.cantidad > producto.cantidadMax
							) {
								productoEditar.cantidad = producto.cantidadMax;
							}

							productoEditar.total =
								productoEditar.Valor * productoEditar.cantidad;
						}

						self.setData(data);
					})
					.on("focus", ".cantidad", function () {
						$(this).select();
					})
					.on("change", ".cantidad", function () {
						const data = [...self.getData()];

						const productoEditar = data.find((item) => {
							if (self.__config.menus) {
								return (
									item.menu === menu.menu &&
									item.ProductoId === producto.ProductoId
								);
							} else {
								return item.ProductoId === producto.ProductoId;
							}
						});

						if (productoEditar) {
							let cantidad = parseInt($(this).val());
							let eliminar = false;

							if (cantidad <= 0 || isNaN(cantidad)) {
								cantidad = self.__config.cantidadMin;
								eliminar = true;
							}

							if (
								self.__config.cantidadMax &&
								cantidad > producto.cantidadMax
							) {
								cantidad = producto.cantidadMax;
							}
							productoEditar.cantidad = cantidad;
							productoEditar.total =
								productoEditar.Valor * productoEditar.cantidad;

							// Elimina el producto
							if (self.__config.descartarProductos && eliminar) {
								const indexToRemove = data.findIndex((item) => {
									if (self.__config.menus) {
										return (
											item.menu === menu.menu &&
											item.ProductoId === producto.ProductoId
										);
									} else {
										return item.ProductoId === producto.ProductoId;
									}
								});

								if (indexToRemove !== -1) {
									data.splice(indexToRemove, 1);

									alertify.warning("Producto descartado del menú");
								}
							}
						}

						self.setData(data);
					});

				productoTable
					.find(".data-int")
					.inputmask({
						groupSeparator: "",
						alias: "integer",
						placeholder: "0",
						autoGroup: !0,
						digitsOptional: !1,
						clearMaskOnLostFocus: !1,
						rightAlign: false,
					})
					.focus(function () {
						$(this).select();
					});

				productoTable
					.find(".inputValorProducto")
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
						prefix: "$ ",
						suffix: " c/u",
						integerDigits: 9,
						allowPlus: false,
						allowMinus: false,
					})
					.focus(function () {
						var selfie = this;
						setTimeout(function () {
							$(selfie).select();
						}, 0);
					})
					.val(parseFloat(producto.Valor))
					.change(function () {
						let val = $(this).val();
						let newVal = parseFloat(val.replace(/[$,]| c\/u/g, "").trim());

						// const index = self
						// 	.getData()
						// 	.findIndex(
						// 		(producto) =>
						// 			producto.ProductoId === menu.ProductoId &&
						// 			producto.ElementoId === -1
						// 	);
						// if (index !== -1) {
						// 	const data = self.getData();
						// 	data[index].Valor = newVal;
						// 	data[index].total = newVal;
						// 	self.setData(data);
						// }

						const data = [...self.getData()];

						const index = data.findIndex((item) => {
							if (self.__config.menus) {
								return (
									item.menu === menu.menu &&
									item.ProductoId === producto.ProductoId
								);
							} else {
								return item.ProductoId === producto.ProductoId;
							}
						});

						if (index !== -1) {
							if (newVal > parseFloat(data[index].maximo)) {
								data[index].Valor = parseFloat(data[index].ValorOriginal);
								data[index].total =
									parseFloat(data[index].ValorOriginal) * data[index].cantidad;

								alertify.warning(
									`El valor digitado es mayor al máximo admitido ($ ${addCommas(
										data[index].maximo
									)})`
								);
							} else if (newVal < parseFloat(data[index].minimo)) {
								data[index].Valor = parseFloat(data[index].ValorOriginal);
								data[index].total =
									parseFloat(data[index].ValorOriginal) * data[index].cantidad;

								alertify.warning(
									`El valor digitado es menor al mínimo admitido ($ ${addCommas(
										data[index].minimo
									)})`
								);
							} else {
								data[index].Valor = newVal;
								data[index].total = newVal * data[index].cantidad;
							}

							self.setData(data);
						}
					});

				menuTD.find("td:eq(0)").append(productoTable);
			});

			menuTR.append(menuTD);

			menuTR.append(`<td width="40"></td>`);

			tbody.append(menuTR);
		});

		// Si es editable, agrega al final el botón de agregar un nuevo menú
		if (this.__config.editable) {
			if (this.__config.menus) {
				const tablaEditar = $(`
					<tr>
						<td height="20"></td>
					</tr>
					<tr
						data-menu="${this.__config.data.length}"
					>
						<td width="40"></td>
						<td>
							<table
								style="border: 1px solid #e6ebf1"
								cellpadding="0"
								cellspacing="0"
								align="center"
								width="100%"
							>
								<tbody>
									<tr>
										<td style="padding: 15px">
											<p
												style="
													color: #303336;
													line-height: 1.8;
													letter-spacing: -0.5;
													font-size: 14px;
													font-weight: 600;
												"
												class="mb-0"
											></p>
											<div class="form-group pr-5">
												<input
													type="text"
													class="form-control form-control-floating"
													placeholder="Nombre Menú"
													value="Nuevo Menú"
												/>
												<button
													title="Seleccionar productos menú"
													class="btnSeleccionarMenu"
												>
													<i class="fas fa-utensils"></i>
												</button>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</td>
						<td width="40"></td>
					</tr>
				`)
					.on("click", ".btnSeleccionarMenu", function (e) {
						e.preventDefault();
						const nombreMenu = $(this).closest("table").find("input").val();
						tmpAlmacenMenuId = almacenIdEventos;
						menusComponent(nombreMenu)
							.then((data) => {
								const menu = $(this).closest("[data-menu]").attr("data-menu");
								self.addData(
									data.map((producto) => {
										const {
											ProductoId,
											Imagen,
											Valor,
											nombre,
											ivaid,
											maximo,
											minimo,
											AlmacenMenuId,
										} = producto;
										return {
											menu,
											nombreMenu,
											ProductoId,
											Imagen,
											Valor: parseFloat(Valor),
											ValorOriginal: parseFloat(Valor),
											nombre,
											cantidad: nuevaReserva.disponibilidad.personas,
											total:
												parseFloat(Valor) *
												nuevaReserva.disponibilidad.personas,
											ivaid,
											maximo,
											minimo,
											AlmacenMenuId,
										};
									})
								);
							})
							.catch(() => {
								console.log("No se seleccionó ningún producto");
							});
					})
					.on("focus", "input", function () {
						$(this).select();
					});
				tbody.append(tablaEditar);
			}
			if (this.__config.agregarProductos) {
				const formProducto = $(`<tr><td width="40"></td><td>
					<form class="mb-3" id="agregarProducto" autocomplete="off" novalidate="novalidate">
						<div class="row">
							<div class="col-12 col-md-8 col-xl-7 mt-3 input-group">
								<div class="form-group mb-0 w-25">
									<input type="text" aria-describeby="prodText" id="ProductoIdElemento${this.__id}"
										class="form-control form-control-floating ProductoIdElemento" name="ProductoIdElemento${this.__id}"
										placeholder="Código Producto">
									<label for="ProductoIdElemento${this.__id}" class="floating-label">Producto</label>
								</div>
								<div class="input-group-append w-75">
									<span class="input-group-text pl-2 w-100" id="prodText">
										<span class="mw-100 text-truncate nombre-prod"></span>
									</span>
								</div>
							</div>
							<div class="col-6 col-md-2 col-xl-3 form-valid mt-3">
								<div class="form-group mb-0">
									<input type="text" id="CantidadElemento" class="form-control form-control-floating data-int"
										name="CantidadElemento" min="1" placeholder="Valor" value="1" readonly>
									<label for="CantidadElemento" class="floating-label">Cantidad</label>
								</div>
							</div>
							<div class="col-6 col-md-2 col-xl-2 mt-3 align-items-end justify-content-end d-flex">
								<button type="submit" class="btn btn-primary col" id="btnCrearElemento" form="formCrearElemento" disabled>
									<i class="fas fa-plus"></i>
								</button>
							</div>
						</div>
					</form>
				</td><td width="40"></td></tr>`)
					.on("change", ".ProductoIdElemento", function () {
						const value = $(this).val(),
							tabla = "producto";

						var self2 = this;

						self.__productoSeleccionado = {};

						$(self2)
							.closest("td")
							.find("[id=btnCrearElemento]")
							.attr("disabled", true);

						$(self2)
							.closest("td")
							.find("[id=CantidadElemento]")
							.val(1)
							.attr("readonly", true);

						if (value != "") {
							const nombre = "productoid";
							const tblNombre = "nombre";
							$.ajax({
								url: rutaGeneral + "CargarForanea",
								type: "POST",
								data: {
									tabla,
									value,
									nombre,
									tblNombre,
									productos: JSON.stringify(self.__config.productos),
								},
								success: function (respuesta) {
									if (respuesta == 0) {
										alertify.ajaxAlert = function (url) {
											$.ajax({
												url: url,
												async: false,
												success: function (data) {
													alertify.myAlert().set({
														onclose: function () {
															alertify.myAlert().set({ onshow: null });
															$(".ajs-modal").unbind();
															delete alertify.ajaxAlert;
															$("#tblBusqueda").unbind().remove();
														},
														onshow: function () {},
													});
													alertify.myAlert(data);

													dtSS({
														data: {
															tblID: "#tblBusqueda",
														},
														ajax: {
															url: rutaGeneral + "DTBuscarProducto",
															type: "POST",
															data: {
																where_in: JSON.stringify(
																	self.__config.productos
																),
															},
														},
														bAutoWidth: false,
														columnDefs: [{ targets: [0], width: "3%" }],
														ordering: false,
														draw: 10,
														pageLength: 10,
														oSearch: {
															sSearch: $(self.__selector)
																.find(".ProductoIdElemento")
																.val(),
														},
														createdRow: function (row, data, dataIndex) {
															$(row).click(function () {
																$(self.__selector)
																	.find(".ProductoIdElemento")
																	.val(data[0])
																	.change();
																alertify.myAlert().close();
															});
														},
														scrollY: screen.height - 400,
														scroller: {
															loadingIndicator: false,
														},
														dom: domftri,
													});
												},
											});
										};
										var campos = encodeURIComponent(
											JSON.stringify(["ProductoId", "Nombre"])
										);
										alertify.ajaxAlert(
											base_url() + "Busqueda/DataTable?campos=" + campos
										);
									} else {
										respuesta = JSON.parse(respuesta);

										$(self2)
											.closest(".input-group")
											.find("span")
											.text(respuesta[0][tblNombre])
											.attr("title", respuesta[0][tblNombre]);

										$(self2)
											.closest("td")
											.find("[id=btnCrearElemento]")
											.attr("disabled", false);

										let cantidad = 1;

										const index = self
											.getData()
											.findIndex(
												(producto) =>
													producto.ProductoId === respuesta[0].ProductoId
											);
										if (index !== -1) {
											cantidad = self.getData()[index].cantidad;
										}

										$(self2)
											.closest("td")
											.find("[id=CantidadElemento]")
											.val(cantidad)
											.attr("readonly", false);

										self.__productoSeleccionado = respuesta[0];

										$("[id=CantidadElemento]").focus().select();
									}
								},
							});
						} else {
							$(self2)
								.closest(".input-group")
								.find("span")
								.text("")
								.attr("title", "");
						}
					})
					.on("click", "[id=btnCrearElemento]", function (e) {
						e.preventDefault();

						const index = self
							.getData()
							.findIndex(
								(producto) =>
									producto.ProductoId === self.__productoSeleccionado.ProductoId
							);

						if (index !== -1) {
							const newData = self.getData();
							newData[index] = {
								...newData[index],
								cantidad: self.__productoSeleccionado.cantidad,
							};
							self.setData(newData);
						} else {
							self.addData([self.__productoSeleccionado]);
						}

						$(self.__selector).find(".ProductoIdElemento").focus();
					})
					.on("change", "[id=CantidadElemento]", function (e) {
						e.preventDefault();
						self.__productoSeleccionado.cantidad = parseInt($(this).val());
						self.__productoSeleccionado.total =
							self.__productoSeleccionado.Valor * parseInt($(this).val());
					});

				formProducto
					.find(".data-int")
					.inputmask({
						groupSeparator: "",
						alias: "integer",
						placeholder: "0",
						autoGroup: !0,
						digitsOptional: !1,
						clearMaskOnLostFocus: !1,
						rightAlign: false,
					})
					.focus(function () {
						$(this).select();
					});

				tbody.prepend(formProducto);
			}
		}

		tablaContenedora.append(tbody);

		tabla.append(tablaContenedora);
	}

	pintarTablaBasica() {
		// Crear el encabezado de la tabla
		const encabezadoFila = $("<tr></tr>");

		for (let key in this.__config.data[0]) {
			const encabezadoCelda = $("<th></th>").text(key);
			encabezadoFila.append(encabezadoCelda);
		}

		tabla.append($("<thead></thead>").append(encabezadoFila));

		// Crear las filas de la tabla
		const cuerpo = $("<tbody></tbody>");

		this.__config.data.forEach((objeto) => {
			const fila = $("<tr></tr>");

			for (let key in objeto) {
				const celda = $("<td></td>").text(objeto[key]);
				fila.append(celda);
			}

			cuerpo.append(fila);
		});

		// tabla.append(cuerpo);
	}

	// Método para pintar una tabla utilizando DataTables sobre el mismo elemento HTML
	pintarDataTables() {
		this.__config.tipo = "dt";

		const tabla = $(this.__selector)
			.html("<table></table>")
			.find("table")
			.DataTable({
				destroy: true,
				data: this.__config.data,
				columns: Object.keys(this.__config.data[0]).map((key) => ({
					title: key,
					data: key,
				})),
			});

		return tabla;
	}

	setData(data) {
		this.__config.data = data;

		this.refresh();
	}

	addData(data) {
		this.__config.data.push(...data);

		this.refresh();
	}

	refresh() {
		if (this.__config.tipo === "html") {
			this.pintarTablaHTML();
		} else {
			this.pintarDataTables();
		}

		$(this.__selector).trigger("update");
	}

	getData() {
		return this.__config.data;
	}
}

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
					}, 1000);
				},
			},
		};
	});
