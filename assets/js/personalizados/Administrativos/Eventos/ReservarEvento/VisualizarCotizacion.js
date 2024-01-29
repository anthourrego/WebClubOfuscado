let hayCambiosSinGuardar = false,
	cambiosEvento = false;
const totalesOriginales = {
	totalFijos: dataOriginal.complementos.elementosFijos.reduce(
		(total, producto) => total + (producto.incluir ? producto.total : 0),
		0
	),
	totalMenus: dataOriginal.complementos.menus.reduce(
		(total, producto) => total + (producto.incluir ? producto.total : 0),
		0
	),
	totalOtros: dataOriginal.complementos.otros.reduce(
		(total, producto) => total + (producto.incluir ? producto.total : 0),
		0
	),
	totalServicios: dataOriginal.complementos.servicios.reduce(
		(total, producto) => total + (producto.incluir ? producto.total : 0),
		0
	),

	totalTotal: 0,
};

totalesOriginales.totalTotal =
	totalesOriginales.totalFijos +
	totalesOriginales.totalMenus +
	totalesOriginales.totalOtros +
	totalesOriginales.totalServicios;

const totales = {
	totalFijos: 0,
	totalMenus: 0,
	totalOtros: 0,
	totalServicios: 0,

	totalTotal: 0,
};

// Funciones / Métodos

const actualizarTotales = () => {
	totales.totalFijos = data.complementos.elementosFijos.reduce(
		(total, producto) => total + (producto.incluir ? producto.total : 0),
		0
	);
	totales.totalMenus = data.complementos.menus.reduce(
		(total, producto) => total + (producto.incluir ? producto.total : 0),
		0
	);
	totales.totalOtros = data.complementos.otros.reduce(
		(total, producto) => total + (producto.incluir ? producto.total : 0),
		0
	);
	totales.totalServicios = data.complementos.servicios.reduce(
		(total, producto) => total + (producto.incluir ? producto.total : 0),
		0
	);

	totales.totalTotal =
		totales.totalFijos +
		totales.totalMenus +
		totales.totalOtros +
		totales.totalServicios;

	$("#pTotal").text(`$ ${addCommas(totales.totalTotal)}`);
};

function addCommas(nStr, decimales = 0) {
	if (nStr != "null" && nStr > 0) {
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

function modificarProducto(self, campo = null, valor = null) {
	const productoid = $(self)
		.closest("[data-productoid]")
		.attr("data-productoid")
		.trim();
	const tipo = $(self).closest("[data-productoid]").attr("data-tipo").trim();

	if (tipo === "F") {
		const menu = $(self).closest("[data-productoid]").attr("data-menu").trim();

		const index = data.complementos.elementosFijos.findIndex(
			(producto) => producto.menu == menu && producto.ProductoId == productoid
		);

		if (campo !== null && valor !== null) {
			data.complementos.elementosFijos[index][campo] = valor;
		}
		return data.complementos.elementosFijos[index];
	} else if (tipo === "M") {
		const menu = $(self).closest("[data-productoid]").attr("data-menu").trim();

		const index = data.complementos.menus.findIndex(
			(producto) => producto.menu == menu && producto.ProductoId == productoid
		);

		if (campo !== null && valor !== null) {
			data.complementos.menus[index][campo] = valor;
		}
		return data.complementos.menus[index];
	} else if (tipo === "O") {
		const index = data.complementos.otros.findIndex(
			(producto) => producto.ProductoId == productoid
		);

		if (campo !== null && valor !== null) {
			data.complementos.otros[index][campo] = valor;
		}
		return data.complementos.otros[index];
	} else if (tipo === "S") {
		const index = data.complementos.servicios.findIndex(
			(producto) => producto.ProductoId == productoid
		);

		if (campo !== null && valor !== null) {
			data.complementos.servicios[index][campo] = valor;
		}
		return data.complementos.servicios[index];
	}
}

function actualizarProducto(self, producto) {
	$(self)
		.closest("[data-productoid]")
		.find(".pUnidades")
		.addClass("d-flex")
		.html(
			`<input
				type="text"
				class="form-control form-control-floating inputValorProducto"
				placeholder="Cantidad"
			>`
		)
		.find("input")
		.val(producto.cantidad)
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
			suffix: ` unidad${producto.cantidad == 1 ? "" : "es"}`,
			integerDigits: 9,
			allowPlus: false,
			allowMinus: false,
		})
		.on("focus", function () {
			var selfie = this;
			setTimeout(function () {
				$(selfie).select();
			}, 0);
		})
		.on("keyup", function () {
			let val = $(this).val();
			let newVal = parseFloat(val.replace(/[$,]| c\/u/g, "").trim());
			hayCambiosSinGuardar = true;
			$(this)
				.off("inputmask")
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
					suffix: ` unidad${newVal == 1 ? "" : "es"}`,
					integerDigits: 9,
					allowPlus: false,
					allowMinus: false,
				});
		})
		.on("blur", function () {
			let val = $(this).val();
			let newVal = parseFloat(val.replace(/[$,]| c\/u/g, "").trim());
			if (isNaN(newVal)) {
				newVal = 0;
			}
			const tipo = $(this)
				.closest("[data-productoid]")
				.attr("data-tipo")
				.trim();

			producto.cantidad = newVal;

			if (producto.cantidad == 0) {
				$(this).closest("[data-productoid]").find(".btnRemover").click();
			} else {
				$(this)
					.closest("[data-productoid]")
					.find(".btnMenos")
					.attr("disabled", false);
			}

			if (
				tipo === "F" &&
				producto.cantidadMax &&
				producto.cantidad > producto.cantidadMax
			) {
				producto.cantidad = producto.cantidadMax;
				$(this)
					.closest("[data-productoid]")
					.find(".btnMas")
					.attr("disabled", true);

				alertify.warning(
					`No puede digitar una cantidad superior a ${
						producto.cantidadMax
					} unidad${
						producto.cantidadMax > 1 ? "es" : ""
					} para este elemento fijo`
				);
			}

			producto.total = producto.cantidad * producto.Valor;
			actualizarProducto(self, producto);
			actualizarTotales();
		});

	if (!producto.incluir) {
		$(self)
			.closest("[data-productoid]")
			.find("input")
			.css("text-decoration", "line-through")
			.attr("readonly", true);
	}

	$(self)
		.closest("[data-productoid]")
		.find(".pTotal")
		.html(`$&nbsp;${addCommas(producto.total)}`);
}

function obtenerCambios(objetoOriginal, objetoModificado) {
	const cambios = {};

	function compararPropiedades(propOriginal, propModificada, ruta) {
		if (
			typeof propOriginal !== "object" ||
			typeof propModificada !== "object"
		) {
			if (propOriginal !== propModificada) {
				cambios[ruta] = propModificada;
			}
		} else {
			for (let clave in propModificada) {
				if (propModificada.hasOwnProperty(clave)) {
					compararPropiedades(
						propOriginal[clave],
						propModificada[clave],
						ruta ? ruta + "." + clave : clave
					);
				}
			}
		}
	}

	compararPropiedades(objetoOriginal, objetoModificado, "");

	return cambios;
}

function buscarProducto(objeto, cadena) {
	const partes = cadena.split(".");
	let valor = objeto;
	let objetoContenedor = objeto;

	for (let parte of partes) {
		if (valor && valor.hasOwnProperty(parte)) {
			objetoContenedor = valor;
			valor = valor[parte];
		} else {
			valor = undefined;
			break;
		}
	}

	return objetoContenedor;
}

function compararObjetos(objeto1, objeto2) {
	objeto1 = copiarObjeto(objeto1);
	objeto2 = copiarObjeto(objeto2);

	for (let clave in objeto1) {
		if (objeto1.hasOwnProperty(clave)) {
			if (objeto1[clave] !== objeto2[clave]) {
				return false;
			}
		}
	}

	return true;
}

function copiarObjeto(objeto) {
	const {
		cantidad,
		incluir,
		incluirOriginal,
		cantidadOriginal,
		...objetoCopia
	} = objeto;

	return objetoCopia;
}

function strModificaciones() {
	let str = "";
	let observacion = "";

	const cambios = obtenerCambios(dataOriginal, data);
	const complementos = {
		elementosFijos: [],
		menus: [],
		otros: [],
		servicios: [],
	};

	if (Object.keys(cambios).length > 0) {
		for (let cambio in cambios) {
			const partes = cambio.split(".");
			if (
				partes[partes.length - 1] === "cantidad" ||
				partes[partes.length - 1] === "incluir"
			) {
				const producto = buscarProducto(data, cambio);
				const productoOriginal = buscarProducto(dataOriginal, cambio);

				if (complementos[partes[1]].length > 0) {
					let encontrado = -1;
					for (const key in complementos[partes[1]]) {
						if (compararObjetos(complementos[partes[1]][key], producto)) {
							encontrado = key;
						}
					}
					if (encontrado === -1) {
						complementos[partes[1]].push({
							...producto,
							cantidadOriginal: productoOriginal.cantidad,
							incluirOriginal: productoOriginal.incluir,
						});
					} else {
						if (partes[partes.length - 1] === "cantidad") {
							complementos[partes[1]][encontrado].cantidad = producto.cantidad;
							complementos[partes[1]][encontrado].cantidadOriginal =
								productoOriginal.cantidad;
						} else {
							complementos[partes[1]][encontrado].incluir = producto.incluir;
							complementos[partes[1]][encontrado].incluirOriginal =
								productoOriginal.incluir;
						}
					}
				} else {
					complementos[partes[1]].push({
						...producto,
						cantidadOriginal: productoOriginal.cantidad,
						incluirOriginal: productoOriginal.incluir,
					});
				}
			} else if (partes[partes.length - 1] === "observacion") {
				observacion = `<p><s>${dataOriginal.datosBasicos.observacion}</s></p>
				<p>${data.datosBasicos.observacion}</p>`;
			}
		}

		if (Object.keys(complementos).length > 0) {
			// Elementos Fijos

			// Filtramos costo de los lugares
			const elementosFijos = complementos.elementosFijos.filter(
				(producto) => producto.ElementoId !== -1
			);
			// Objeto donde se agruparán los objetos por el lugar
			const fijosObjetosAgrupados = elementosFijos.reduce(
				(acumulador, objeto) => {
					const menu = objeto.menu;
					if (!acumulador[menu]) {
						acumulador[menu] = [];
					}
					acumulador[menu].push(objeto);
					return acumulador;
				},
				{}
			);
			// Array de objetos agrupados por el lugar
			const fijosArrayAgrupado = Object.entries(fijosObjetosAgrupados).map(
				([menu, objetos]) => ({ menu, objetos })
			);
			const strFijos = fijosArrayAgrupado.reduce(
				(acumulador, menu) =>
					acumulador +
					`<li><small>${menu.objetos[0].nombreMenu}</small>
						<ul>
						${menu.objetos.reduce(
							(acumulador2, menu2) =>
								acumulador2 +
								(menu2.incluir
									? `
								<li><small>${menu2.nombre} <s>x ${menu2.cantidadOriginal}</s></small> <b>x ${menu2.cantidad}</b></li>
								`
									: `
								<li><small><s>${menu2.nombre} x ${menu2.cantidadOriginal}</s></small></li>`),
							""
						)}
						</ul>
					</li>`,
				""
			);

			// Menús

			const menus = complementos.menus;
			// Objeto donde se agruparán los objetos por el menú
			const menusObjetosAgrupados = menus.reduce((acumulador, objeto) => {
				const menu = objeto.menu;
				if (!acumulador[menu]) {
					acumulador[menu] = [];
				}
				acumulador[menu].push(objeto);
				return acumulador;
			}, {});
			// Array de objetos agrupados por el menú
			const menusArrayAgrupado = Object.entries(menusObjetosAgrupados).map(
				([menu, objetos]) => ({ menu, objetos })
			);
			const strMenus = menusArrayAgrupado.reduce(
				(acumulador, menu) =>
					acumulador +
					`<li><small>${menu.objetos[0].nombreMenu}</small>
						<ul>
						${menu.objetos.reduce(
							(acumulador2, menu2) =>
								acumulador2 +
								(menu2.incluir
									? `
								<li><small>${menu2.nombre} <s>x ${menu2.cantidadOriginal}</s></small> <b>x ${menu2.cantidad}</b></li>
								`
									: `
								<li><small><s>${menu2.nombre} x ${menu2.cantidadOriginal}</s></small></li>`),
							""
						)}
						</ul>
					</li>`,
				""
			);

			// Otros

			const otros = complementos.otros;
			const strOtros = otros.reduce(
				(acumulador, producto) =>
					acumulador +
					(producto.incluir
						? `
						<li><small>${producto.nombre} <s>x ${producto.cantidadOriginal}</s></small> <b>x ${producto.cantidad}</b></li>
						`
						: `<li><small><s>${producto.nombre} x ${producto.cantidadOriginal}</s></small></li>`),
				""
			);

			// Servicios

			const servicios = complementos.servicios;
			const strServicios = servicios.reduce(
				(acumulador, producto) =>
					acumulador +
					(producto.incluir
						? `
						<li><small>${producto.nombre} <s>x ${producto.cantidadOriginal}</s></small> <b>x ${producto.cantidad}</b></li>
						`
						: `<li><small><s>${producto.nombre} x ${producto.cantidadOriginal}</s></small></li>`),
				""
			);

			const strComplementos = `
				${
					strFijos.length
						? `<p class="mb-0">Elementos Fijos</p>
							<ul>
								${strFijos}
							</ul>`
						: ""
				}
	
				${
					strMenus.length
						? `<p class="mb-0">Menú</p>
							<ul>
								${strMenus}
							</ul>`
						: ""
				}
				
				${
					strOtros.length
						? `<p class="mb-0">Otros</p>
							<ul>
								${strOtros}
							</ul>`
						: ""
				}
	
				${
					strServicios.length
						? `<p class="mb-0">Servicios</p>
							<ul>
								${strServicios}
							</ul>`
						: ""
				}
	
				${
					strFijos.length
						? `<p><strong>Total Elementos:</strong> <s>$ ${addCommas(
								totalesOriginales.totalFijos
						  )}</s> $ ${addCommas(totales.totalFijos)}</p>`
						: ""
				}
	
				${
					strMenus.length
						? `<p><strong>Total Menú:</strong> <s>$ ${addCommas(
								totalesOriginales.totalMenus
						  )}</s> $ ${addCommas(totales.totalMenus)}</p>`
						: ""
				}
				
				${
					strOtros.length
						? `<p><strong>Total Otros:</strong> <s>$ ${addCommas(
								totalesOriginales.totalOtros
						  )}</s> $ ${addCommas(totales.totalOtros)}</p>`
						: ""
				}
	
				${
					strServicios.length
						? `<p><strong>Total Servicios:</strong> <s>$ ${addCommas(
								totalesOriginales.totalServicios
						  )}</s> $ ${addCommas(totales.totalServicios)}</p>`
						: ""
				}

				${
					strFijos.length ||
					strMenus.length ||
					strOtros.length ||
					strServicios.length
						? `<p><strong>Total:</strong> <s>$ ${addCommas(
								totalesOriginales.totalTotal
						  )}</s> $ ${addCommas(totales.totalTotal)}</p>`
						: ""
				}
			`;

			str = strComplementos;
		}

		cambiosEvento = true;

		return `<div class="divCambios">
			<h5>Valide los cambios efectuados en la cotización: </h5>
			<br/>
			${str}
			${
				observacion !== ""
					? `<h5>Observaciones:</h5>
			${observacion}`
					: ""
			}
		</div>`;
	} else {
		cambiosEvento = false;

		return "No se realizó ningún cambio en la cotización.";
	}
}

function confirmarCoti(estado) {
	data.complementos.elementosFijos = data.complementos.elementosFijos.filter(
		(producto) => producto.incluir === true
	);
	data.complementos.menus = data.complementos.menus.filter(
		(producto) => producto.incluir === true
	);
	data.complementos.otros = data.complementos.otros.filter(
		(producto) => producto.incluir === true
	);
	data.complementos.servicios = data.complementos.servicios.filter(
		(producto) => producto.incluir === true
	);

	$.ajax({
		url: rutaGeneral + `Evento/Confirmar/${$nit}/${$documento}/${$eventoId}`,
		type: "POST",
		data: {
			data: { data: JSON.stringify({ ...data }), estado, cambiosEvento },
		},
		success: (res) => {
			if (res != 0) {
				hayCambiosSinGuardar = false;

				alertify.alert(
					`Cotización ${estado == "CC" ? "confirmada" : "rechazada"}`,
					`La cotización ha sido <b>${
						estado == "CC" ? "Confirmada" : "Rechazada"
					}</b> satisfactoriamente, se notificará al respectivo asesor comercial para proceder con el evento y se le notificará en caso de actualizaciones`,
					function () {
						window.close();
						location.reload();
					}
				);
			} else {
				alertify.alert(
					"Error",
					`Ocurrió un error al momento de ${
						estado == "CC" ? "Confirmar" : "Rechazar"
					} la cotización`
				);
			}
		},
	});
}

// Event listeners

$(document)
	.on("change", "#observaciones", function () {
		hayCambiosSinGuardar = true;

		data.datosBasicos.observacion = $(this).val().trim();
	})
	.on("click", "#btnConfirmar", function (e) {
		e.preventDefault();

		alertify
			.confirm(
				"Confirmar Cotización",
				strModificaciones(),
				function () {
					confirmarCoti("CC");
				},
				function () {}
			)
			.set("labels", { ok: "Aceptar", cancel: "Cancelar" });
	})
	.on("click", "#btnRechazar", function (e) {
		e.preventDefault();

		alertify
			.confirm(
				"Rechazar Cotización",
				strModificaciones(),
				function () {
					confirmarCoti("RE");
				},
				function () {}
			)
			.set("labels", { ok: "Aceptar", cancel: "Cancelar" });
	});

$(function () {
	$(window).on("beforeunload", () => {
		if (hayCambiosSinGuardar) {
			return "¿Estás segur@ que quieres salir? Hay cambios sin guardar";
		}
	});

	alertify.defaults.transition = "slide";
	alertify.defaults.theme.ok = "btn btn-primary";
	alertify.defaults.theme.cancel = "btn btn-secondary";
});

// Procedimientos

if (!data.cotizacion.ultimaVersion) {
	alertify.alert(
		"Advertencia",
		"Está visualizando una versión desactualizada de la cotización, se enviará automáticamente a la última versión disponible",
		function () {
			const currentUrl = window.location.href;
			const lastSlashIndex = currentUrl.lastIndexOf("/");
			const baseUrl = currentUrl.substring(0, lastSlashIndex + 1);

			window.location.href = baseUrl + data.cotizacion.versiones[0].EventoId;
		}
	);
} else {
	if (data.cotizacion.estado === "CT") {
		$("[data-productoid]").each(function () {
			const producto = modificarProducto(this);
			actualizarProducto(this, producto);
		});

		$("[data-productoid]")
			.append(
				`<td class="tdBotones">
				<div class="btn-group-vertical btn-group-sm" role="group">
					<button type="button" class="btn btn-outline-secondary btnMas" title="Agregar">
						<i class="fas fa-plus"></i>
					</button>
					<button type="button" class="btn btn-outline-secondary btnMenos" title="Restar">
						<i class="fas fa-minus"></i>
					</button>
					<button type="button" class="btn btn-danger btnRemover" title="Descartar Producto">
						<i class="fas fa-trash"></i>
					</button>
				</div>
			</td>`
			)
			.on("click", ".btnMas", function (e) {
				e.preventDefault();
				hayCambiosSinGuardar = true;

				const producto = modificarProducto(this);
				const tipo = $(this)
					.closest("[data-productoid]")
					.attr("data-tipo")
					.trim();
				producto.cantidad += 1;
				if (
					tipo === "F" &&
					producto.cantidadMax &&
					producto.cantidad > producto.cantidadMax
				) {
					producto.cantidad -= 1;
				}
				producto.total = producto.cantidad * producto.Valor;

				$(this).closest(".tdBotones").find(".btnMenos").attr("disabled", false);

				actualizarProducto(this, producto);

				actualizarTotales();
			})
			.on("click", ".btnMenos", function (e) {
				e.preventDefault();
				hayCambiosSinGuardar = true;

				const producto = modificarProducto(this);
				if (producto.cantidad > 1) {
					producto.cantidad -= 1;
					producto.total = producto.cantidad * producto.Valor;

					$(this)
						.closest("[data-productoid]")
						.find(".btnMas")
						.attr("disabled", false);
				} else {
					$(this).attr("disabled", true);
					$(this).closest("[data-productoid]").find(".btnRemover").click();
				}

				actualizarProducto(this, producto);

				actualizarTotales();
			})
			.on("click", ".btnRemover", function (e) {
				e.preventDefault();
				hayCambiosSinGuardar = true;

				$(this)
					.closest("[data-productoid]")
					.find("p, .inputValorProducto")
					.each(function () {
						$(this).css("text-decoration", "line-through");
					});
				$(this)
					.closest("[data-productoid]")
					.find(".inputValorProducto")
					.attr("readonly", true);
				$(this).removeClass("btnRemover btn-danger");
				$(this).addClass("btnAgregar btn-success");
				$(this).html(`<i class="fas fa-undo"></i>`);
				$(this).attr("title", "Conservar Producto");
				$(this)
					.closest("[data-productoid]")
					.find(".btnMas, .btnMenos")
					.attr("disabled", true);

				modificarProducto(this, "incluir", false);

				actualizarTotales();
			})
			.on("click", ".btnAgregar", function (e) {
				e.preventDefault();
				hayCambiosSinGuardar = true;

				$(this)
					.closest("[data-productoid]")
					.find("p, .inputValorProducto")
					.each(function () {
						$(this).css("text-decoration", "none");
					});
				$(this)
					.closest("[data-productoid]")
					.find(".inputValorProducto")
					.attr("readonly", false);
				$(this).removeClass("btnAgregar btn-success");
				$(this).addClass("btnRemover btn-danger");
				$(this).html(`<i class="fas fa-trash"></i>`);
				$(this).attr("title", "Descartar Producto");
				$(this)
					.closest("[data-productoid]")
					.find(".btnMas, .btnMenos")
					.attr("disabled", false);

				const tipo = $(this)
					.closest("[data-productoid]")
					.attr("data-tipo")
					.trim();

				if (tipo === "F") {
					const producto = modificarProducto(this);

					if (producto.cantidadMax === producto.cantidad) {
						$(this)
							.closest("[data-productoid]")
							.find(".btnMas")
							.attr("disabled", true);
					}
				}

				modificarProducto(this, "incluir", true);

				actualizarTotales();
			})
			.find(".btnMas")
			.each(function () {
				const tipo = $(this)
					.closest("[data-productoid]")
					.attr("data-tipo")
					.trim();

				if (tipo === "F") {
					const producto = modificarProducto(this);

					if (producto.cantidadMax === producto.cantidad) {
						$(this).attr("disabled", true);
					}
				}
			});

		$("#divButtons").show();
		$(".divComentarios").show();
		$("#divAplicacion").hide();
	} else {
		const estadosFinales = ["NU", "CO", "EX", "VE", "FI", "AC"];

		let strAlert = `Esta cotización se encuentra en modo previsualización, `;
		if (estadosFinales.includes(data.cotizacion.estado)) {
			strAlert += `actualmente se encuentra en estado <b>${data.cotizacion.versiones[0].Estado}</b> por lo que no se puede modificar`;
		} else {
			strAlert += `debe de contactar con su respectivo asesor comercial para modificarla en caso de requerirlo ya que se encuentra en estado <b>${data.cotizacion.versiones[0].Estado}</b>`;
		}

		$("#divAplicacion").find("a").closest("td").html(strAlert);
	}
}

actualizarTotales();
