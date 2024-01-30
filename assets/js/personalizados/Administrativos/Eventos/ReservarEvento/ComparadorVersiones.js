const rutaGeneral = base_url() + "Administrativos/Eventos/ReservarEvento/",
	objetosVersiones = {},
	estados = {
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
		FA: "Facturación",
		AC: "Activo",
	};

$(function () {
	nuevaReserva = $datosReserva.evento;
	versiones = nuevaReserva.cotizacion.versiones;

	versiones.sort(function (a, b) {
		if (a.Version > b.Version) {
			return 1;
		}
		if (a.Version < b.Version) {
			return -1;
		}
		return 0;
	});

	setTimeout(() => {
		$("#selectVersion2").val($idEvento);
		$("#selectVersion2").change();
	}, 200);

	$("#btnVolver").on("click", function () {
		window.history.back();
	});

	$("#selectVersion1").empty();
	$("#selectVersion1").append(
		`<option selected value="">Seleccionar...</option>`
	);
	versiones.forEach((it) => {
		const fecha = moment(it.FechaSolici, "YYYY-MM-DD HH:mm:ss").format(
			"YYYY-MM-DD hh:mm:ss A"
		);
		$("#selectVersion1").append(
			`<option data-version="${it.Version}" value="${it.EventoId}">${
				it.Version + " | " + estados[it.Estado] + " | " + fecha
			}</option>`
		);
		$("#selectVersion2").append(
			`<option data-version="${it.Version}" value="${it.EventoId}">${
				it.Version + " | " + estados[it.Estado] + " | " + fecha
			}</option>`
		);
	});

	$(document).change("#selectVersion1 #selectVersion2", function (e) {
		//Eliminamos las clsases de d-none a todos los option para evitar conflictos al momento de agregarlos nuevamente
		Object.values($("#selectVersion1").find("option")).forEach((element) => {
			$(element).removeClass("d-none");
		});
		Object.values($("#selectVersion2").find("option")).forEach((element) => {
			$(element).removeClass("d-none");
		});
		if (e.target.id == "selectVersion1") {
			//-----------------------------------------
			//le agregamos la clase d-none a la opcion que se haya seleccionado en esta
			if (e.target.value.length > 0) {
				$("#selectVersion2 option[value=" + e.target.value + "]").addClass(
					"d-none"
				);
			}
			//le agregamos la clase d-none a la opcion que tiene actualmente el otro panel
			$(
				"#selectVersion1 option[value=" + $("#selectVersion2").val() + "]"
			).addClass("d-none");
			//------------------------------------------

			//validamos en que versión esta el panel derecho para agrgar la clase d-none a los mayores a este
			valorVersion = $("#selectVersion2").val();
			valorVersion = $("#selectVersion2").find(
				"option[value=" + valorVersion + "]"
			)[0].attributes[0].value;
			Object.values($("#selectVersion1 option")).forEach((element) => {
				if (element.attributes !== undefined)
					if (element.attributes[0].value > valorVersion)
						element.classList.add("d-none");
			});

			if (e.target.value.length == 0) {
				$(".versionDespues").empty();
				$(".versionAntes").empty();
				cargarEvento($idEvento);
				$(".versionDespues").append(generaHTML(objetosVersiones[$idEvento]));
			} else {
				cargarEvento(e.target.value);
			}
		} else if (e.target.id == "selectVersion2") {
			//-----------------------------------------
			//le agregamos la clase d-none a la opcion que tiene actualmente el otro panel
			$("#selectVersion1 option[value=" + e.target.value + "]").addClass(
				"d-none"
			);
			//le agregamos la clase d-none a la opcion que se haya seleccionado en esta
			if ($("#selectVersion1").val().length > 0) {
				$(
					"#selectVersion2 option[value=" + $("#selectVersion1").val() + "]"
				).addClass("d-none");
			}
			//------------------------------------------

			//---------------------------------------------------------------------------
			cargarEvento(e.target.value);
			//Se le agrega la clase d-none a las versiones mayores de la seleccionada
			valorVersion = e.target.selectedOptions[0].attributes[0].value;
			valorAnterior = $("#selectVersion1").val();
			if (valorAnterior.length > 0) {
				valorAnterior = $("#selectVersion1").find(
					"option[value=" + valorAnterior + "]"
				)[0].attributes[0].value;
				if (valorVersion == 1 || valorAnterior > valorVersion)
					$("#selectVersion1").val("").change();
			} else {
				$("#selectVersion1").val("").change();
			}
			Object.values($("#selectVersion1 option")).forEach((element) => {
				if (element.attributes !== undefined) {
					if (element.attributes[0].value > valorVersion)
						element.classList.add("d-none");
				}
			});

			$(".versionDespues").empty();
			$(".versionDespues").append(generaHTML(objetosVersiones[e.target.value]));
		}
		anterior = $("#selectVersion1").val();
		despues = $("#selectVersion2").val();
		if (anterior.length > 0 && despues.length > 0) {
			delete valAnterior;
			delete valActual;
			let valAnterior = clonadoProfunto(objetosVersiones[anterior]);
			let valActual = clonadoProfunto(objetosVersiones[despues]);
			compararEventos(valAnterior, valActual);
		}
	});
});

function clonadoProfunto(objeto) {
	if (objeto === null || typeof objeto !== "object") {
		return objeto;
	}

	if (Array.isArray(objeto)) {
		const arrClone = [];
		for (let i = 0; i < objeto.length; i++) {
			arrClone[i] = clonadoProfunto(objeto[i]);
		}
		return arrClone;
	}

	const objClone = {};
	for (const key in objeto) {
		if (objeto.hasOwnProperty(key)) {
			objClone[key] = clonadoProfunto(objeto[key]);
		}
	}
	return objClone;
}

function cargarEvento(eventoId) {
	$.ajax({
		url: rutaGeneral + "cargarVersiones",
		type: "POST",
		async: false,
		data: {
			eventoId: eventoId,
		},
		success: (res) => {
			objetosVersiones[eventoId] = JSON.parse(res);
		},
	});

	//Eliminamos datos que no se utilizaran para evitar conflictos al momento de comparar
	delete objetosVersiones[eventoId].cotizacion.cuerpos;
	delete objetosVersiones[eventoId].cotizacion.estado;
	delete objetosVersiones[eventoId].cotizacion.eventoId;
	delete objetosVersiones[eventoId].cotizacion.ultimaVersion;
	delete objetosVersiones[eventoId].cotizacion.versiones;
}

function compararEventos(anterior, actual) {
	$(".versionAntes").empty();
	$(".versionDespues").empty();

	for (value in anterior) {
		nuevoValor = comparacionVeriones(anterior, actual, value);
	}

	Htmlant = generaHTML(anterior);
	HtmlDes = generaHTML(actual);

	$(".versionAntes").append(Htmlant);
	$(".versionDespues").append(HtmlDes);

	totalFijos = $(".totalFijos");
	if (totalFijos.length != 0) {
		if (totalFijos[0].textContent != totalFijos[1].textContent) {
			$(".totalFijos").css("background-color", "#F9E79F");
		}
	}
	totalMenus = $(".totalMenus");
	if (totalMenus.length != 0) {
		if (totalMenus[0].textContent != totalMenus[1].textContent) {
			$(".totalMenus").css("background-color", "#F9E79F");
		}
	}
	subtotal = $(".subtotal");
	if (subtotal.length != 0) {
		if (subtotal[0].textContent != subtotal[1].textContent) {
			$(".subtotal").css("background-color", "#F9E79F");
		}
	}
	ivaTotal = $(".ivaTotal");
	if (ivaTotal.length != 0) {
		if (ivaTotal[0].textContent != ivaTotal[1].textContent) {
			$(".ivaTotal").css("background-color", "#F9E79F");
		}
	}
	totalImpo = $(".totalImpo");
	if (totalImpo.length != 0) {
		if (totalImpo[0].textContent != totalImpo[1].textContent) {
			$(".totalImpo").css("background-color", "#F9E79F");
		}
	}
	totalesEven = $(".totalesEven");
	if (totalesEven.length != 0) {
		if (totalesEven[0].textContent != totalesEven[1].textContent) {
			$(".totalesEven").css("background-color", "#F9E79F");
		}
	}
}

function comparacionVeriones(antiguo, nuevo, posicion) {
	productosAnt = {};
	productosAct = {};
	nuevosProductos = [];
	mismoProductos = [];
	productosEliminados = [];

	/* 
console.log(nuevo);
 */
	/*  console.log(antiguo); */
	//se recibe los datos por cada uno de las llaves principales de la primera versión

	//verificamos por cada una de la llaves principales de acuerdo a la estructura que contiene esta
	//NOTA: la validación .toString.includes(), es para evitar que se agregué nuevamente el texto el cual realiza el cambio de color del registro ya que si se agrega por segunda vez, s eva a ver en el HTML

	//verificamos por la llave de complementos
	if (posicion == "complementos") {
		//itera por cada una de las llamves internas de complementos
		for (valores in antiguo.complementos) {
			//verifica si la llave es menus, ya que esta maneja una estructura diferente al resto
			if (valores == "menus") {
				antiguo.complementos[valores].forEach((element) => {
					mismoProductos.push(element.ProductoId);
				});

				//---------------------------------------------------
				//---------------------------------------------------

				//esta pedazo de codigo que se repite en diferentes ocasiones sirve para: primero agregar en un array los ids de los registros que tiene una version

				nuevo.complementos[valores].forEach((element) => {
					productosEliminados.push(element.ProductoId);
				});

				//segundo para dentro de los registros de la otra versión, hacemos un filtro dentro de esta y con every comparamos todos los valores del array anterior con cada uno de los registros de la versión con el filtro
				//ya sea si se encuentra o no se enceuntra, se le agrega el atributo para el html
				//para los atributos de eliminado, se agregan en el segundo panel y se marcan en rojo, para el primer panel se muestran normal
				antiguo.complementos[valores].filter(function (e) {
					if (productosEliminados.every((elem) => elem != e.ProductoId)) {
						const nuevoValor = Object.assign({}, e);
						if (!nuevoValor.nombre.toString().includes("(eliminado)"))
							nuevoValor.nombre = nuevoValor.nombre + "(eliminado)";
						nuevo.complementos[valores].push(nuevoValor);
					}
				});

				//---------------------------------------------------
				//---------------------------------------------------

				nuevo.complementos[valores].filter(function (e) {
					if (mismoProductos.every((elem) => elem != e.ProductoId)) {
						if (!e.nombre.toString().includes("(nuevo)"))
							e.nombre = e.nombre + "(nuevo)";
					}
				});

				antiguo.complementos[valores].forEach((element) => {
					nuevo.complementos[valores].forEach((elementNu) => {
						if (
							element.ProductoId == elementNu.ProductoId &&
							element.nombreMenu == elementNu.nombreMenu &&
							element.cantidad != elementNu.cantidad
						) {
							if (!element.nombre.toString().includes("(cambio)"))
								element.nombre = element.nombre + "(cambio)";
							if (!elementNu.nombre.toString().includes("(cambio)"))
								elementNu.nombre = elementNu.nombre + "(cambio)";
						}
						if (
							element.ProductoId == elementNu.ProductoId &&
							element.nombreMenu == elementNu.nombreMenu &&
							(element.desde != elementNu.desde ||
								element.hasta != elementNu.hasta)
						) {
							if (element.desde == null && elementNu.desde != null) {
								if (!elementNu.desde.toString().includes("(nuevo)"))
									elementNu.desde = elementNu.desde + "(nuevo)";
							} else if (elementNu.desde == null && element.desde != null) {
								elementNu.desde = element.desde;
								elementNu.hasta = element.hasta;
								elementNu.hora = element.hora;
								if (!elementNu.desde.toString().includes("(eliminado)"))
									elementNu.desde = elementNu.desde + "(eliminado)";
							} else if (element.desde != null && elementNu.desde != null) {
								if (!element.desde.toString().includes("(cambio)"))
									element.desde = element.desde + "(cambio)";
								if (!elementNu.desde.toString().includes("(cambio)"))
									elementNu.desde = elementNu.desde + "(cambio)";
							}
						}
					});
				});
			} else {
				//para el resto como manejan una estructura similar, se utiliza el mismo código
				mismoProductos = [];
				productosEliminados = [];

				antiguo.complementos[valores].forEach((element) => {
					mismoProductos.push(element.ProductoId);
				});

				nuevo.complementos[valores].forEach((element) => {
					productosEliminados.push(element.ProductoId);
				});

				antiguo.complementos[valores].filter(function (e) {
					if (productosEliminados.every((elem) => elem != e.ProductoId)) {
						const nuevoValor = Object.assign({}, e);
						if (!nuevoValor.nombre.toString().includes("(eliminado)"))
							nuevoValor.nombre = nuevoValor.nombre + "(eliminado)";
						nuevo.complementos[valores].push(nuevoValor);
					}
				});

				nuevo.complementos[valores].filter(function (e) {
					if (mismoProductos.every((elem) => elem != e.ProductoId)) {
						if (!e.nombre.toString().includes("(nuevo)"))
							e.nombre = e.nombre + "(nuevo)";
					}
				});

				antiguo.complementos[valores].forEach((element) => {
					nuevo.complementos[valores].forEach((elementNu) => {
						if (
							element.ProductoId == elementNu.ProductoId &&
							element.nombreMenu == elementNu.nombreMenu &&
							element.cantidad != elementNu.cantidad
						) {
							if (!element.nombre.toString().includes("(cambio)"))
								element.nombre = element.nombre + "(cambio)";
							if (!elementNu.nombre.toString().includes("(cambio)"))
								elementNu.nombre = elementNu.nombre + "(cambio)";
						}
					});
				});
			}
		}
	}
	//--------------------------------------------------------------------------------------------
	//verificamos por la llave de cotización
	if (posicion == "cotizacion") {
		for (value in antiguo.cotizacion) {
			if (antiguo.cotizacion[value] == null) antiguo.cotizacion[value] = "";
			if (nuevo.cotizacion[value] == null) nuevo.cotizacion[value] = "";
			if (antiguo.cotizacion[value] != nuevo.cotizacion[value]) {
				if (!antiguo.cotizacion[value].toString().includes("(cambio)"))
					antiguo.cotizacion[value] = antiguo.cotizacion[value] + "(cambio)";
				if (!nuevo.cotizacion[value].toString().includes("(cambio)"))
					nuevo.cotizacion[value] = nuevo.cotizacion[value] + "(cambio)";
			}
		}
	}
	//--------------------------------------------------------------------------------------------
	//verificamos por la llave de datos básicos
	if (posicion == "datosBasicos") {
		//verficamos por cada una de las llaves internas de datos basicos
		for (value in antiguo.datosBasicos) {
			//Ya que tercero maneja una estructura diferente al resto, se valida de manera diferente
			if (value == "tercero") {
				for (valores in antiguo.datosBasicos[value]) {
					if (
						antiguo.datosBasicos[value][valores] !=
						nuevo.datosBasicos[value][valores]
					) {
						if (
							!antiguo.datosBasicos[value][valores]
								.toString()
								.includes("(cambio)")
						)
							antiguo.datosBasicos[value][valores] =
								antiguo.datosBasicos[value][valores] + "(cambio)";
						if (
							!nuevo.datosBasicos[value][valores]
								.toString()
								.includes("(cambio)")
						)
							nuevo.datosBasicos[value][valores] =
								nuevo.datosBasicos[value][valores] + "(cambio)";
					}
				}
			} else {
				if (antiguo.datosBasicos[value] == null)
					antiguo.datosBasicos[value] = "";
				if (nuevo.datosBasicos[value] == null) nuevo.datosBasicos[value] = "";
				if (antiguo.datosBasicos[value] != nuevo.datosBasicos[value]) {
					if (!antiguo.datosBasicos[value].toString().includes("(cambio)"))
						antiguo.datosBasicos[value] =
							antiguo.datosBasicos[value] + "(cambio)";
					if (!nuevo.datosBasicos[value].toString().includes("(cambio)"))
						nuevo.datosBasicos[value] = nuevo.datosBasicos[value] + "(cambio)";
				}
			}
		}
	}
	//--------------------------------------------------------------------------------------------------
	//Al verificar en la disponibilidad, primero se comparan los lugares que tiene la primera version, con la segunda
	if (posicion == "disponibilidad") {
		mismoProductos = [];
		productosEliminados = [];
		antiguo.disponibilidad.lugares.forEach((element) => {
			mismoProductos.push(element.lugarid);
		});

		nuevo.disponibilidad.lugares.forEach((element) => {
			productosEliminados.push(element.lugarid);
		});

		antiguo.disponibilidad.lugares.filter(function (e) {
			if (productosEliminados.every((elem) => elem != e.lugarid)) {
				const nuevoValor = Object.assign({}, e);
				if (!nuevoValor.Nombre.toString().includes("(eliminado)"))
					nuevoValor.Nombre = nuevoValor.Nombre + "(eliminado)";
				nuevo.disponibilidad.lugares.push(nuevoValor);
			}
		});

		nuevo.disponibilidad.lugares.filter(function (e) {
			if (mismoProductos.every((elem) => elem != e.lugarid)) {
				if (!e.Nombre.toString().includes("(nuevo)"))
					e.Nombre = e.Nombre + "(nuevo)";
			}
		});

		//iteramos dentro de la llave de disponibilidad
		for (value in antiguo.disponibilidad) {
			//ya que lugares maneja una estructura diferente al resto, se realiza una validación diferente para esta
			if (value == "lugares") {
				for (valores in antiguo.disponibilidad[value]) {
					for (valores2 in antiguo.disponibilidad[value][valores]) {
						if (
							antiguo.disponibilidad[value][valores][valores2] !=
							nuevo.disponibilidad[value][valores][valores2]
						) {
							if (
								!antiguo.disponibilidad[value][valores][valores2]
									.toString()
									.includes("(cambio)") &&
								!antiguo.disponibilidad[value][valores][valores2]
									.toString()
									.includes("(eliminado)")
							)
								antiguo.disponibilidad[value][valores][valores2] =
									antiguo.disponibilidad[value][valores][valores2] + "(cambio)";
							if (
								typeof nuevo.disponibilidad[value][valores][valores2] !==
									"undefined" &&
								nuevo.disponibilidad[value][valores][valores2] !== null &&
								!nuevo.disponibilidad[value][valores][valores2]
									.toString()
									.includes("(cambio)") &&
								!antiguo.disponibilidad[value][valores][valores2]
									.toString()
									.includes("(eliminado)")
							)
								nuevo.disponibilidad[value][valores][valores2] =
									nuevo.disponibilidad[value][valores][valores2] + "(cambio)";
						}
					}
				}
			} else {
				//se valida el resto de las propiedades
				if (antiguo.disponibilidad[value] == null)
					antiguo.disponibilidad[value] = "";
				if (nuevo.disponibilidad[value] == null)
					nuevo.disponibilidad[value] = "";
				if (antiguo.disponibilidad[value] != nuevo.disponibilidad[value]) {
					if (!antiguo.disponibilidad[value].toString().includes("(cambio)"))
						antiguo.disponibilidad[value] =
							antiguo.disponibilidad[value] + "(cambio)";
					if (!nuevo.disponibilidad[value].toString().includes("(cambio)"))
						nuevo.disponibilidad[value] =
							nuevo.disponibilidad[value] + "(cambio)";
				}
			}
		}
	}
}

function generaHTML(objetoVersion) {
	nuevaReserva = "";
	nuevaReserva = objetoVersion;
	let htmlDetalle = "";

	if (nuevaReserva.disponibilidad) {
		let FORMAT = "DD/MM/YYYY";
		let allDay = true;
		let minFechaIni = new Date(9999, 0, 1),
			maxFechaFin = new Date(1000, 11, 31);
		let strFechas = "";
		const FORMATHOURS = "h:mm a";
		let strLugares = "<ul>";
		i = 0;
		nuevaReserva.disponibilidad.lugares.forEach((lugar) => {
			let fechaIni = new Date(eliminaTexto(lugar.fechaini)),
				fechaFin = new Date(eliminaTexto(lugar.fechafin));
			if (fechaIni < minFechaIni) {
				minFechaIni = fechaIni;
			}
			if (fechaFin > maxFechaFin) {
				maxFechaFin = fechaFin;
			}
			if (!lugar.allDay) {
				allDay = false;
				FORMAT = `DD/MM/YYYY ${FORMATHOURS}`;
			}
			let tipoMontaje = "";
			if (lugar.tipomontaje) {
				tipoMontaje = ` [${eliminaTexto(lugar.TMNombre)}]`;
			}
			strLugares += `<li style="background-color: ${validaCambio(
				lugar.fechaini
			)} ${validaCambio(lugar.fechafin)} ${validaCambio(
				lugar.Nombre
			)} ${validaCambio(lugar.TLNombre)}">${eliminaTexto(
				lugar.Nombre
			)} / ${eliminaTexto(lugar.TLNombre)}${tipoMontaje} ${
				nuevaReserva.disponibilidad.agrupar
					? ""
					: `(${moment(fechaIni).format(FORMAT)} - ${moment(fechaFin).format(
							FORMAT
					  )})`
			} </li>`;
			i++;
		});
		strLugares += "</ul>";
		if (allDay) {
			strFechas = `${moment(minFechaIni).format(FORMAT)} - ${moment(
				maxFechaFin
			).format(FORMAT)}`;
		} else {
			strFechas = `${moment(minFechaIni).format(FORMAT)} - ${moment(
				maxFechaFin
			).format(FORMAT)}`;
		}
		const strDisponibilidad = `
            <h4>Disponibilidad</h4>
            <p style="background-color: ${validaCambio(
							nuevaReserva.disponibilidad.nombre
						)}">${eliminaTexto(nuevaReserva.disponibilidad.nombre)}</p>
            <p id="fechaEven">${strFechas}</p>
            <p style="background-color: ${validaCambio(
							nuevaReserva.disponibilidad.tipoeventonombre
						)}"><strong>Tipo de Evento:</strong> ${eliminaTexto(
			nuevaReserva.disponibilidad.tipoeventonombre
		)}</p>
            <p style="background-color: ${validaCambio(
							nuevaReserva.disponibilidad.personas
						)}"><strong>Personas:</strong> ${addCommas(
			eliminaTexto(nuevaReserva.disponibilidad.personas)
		)}</p>
            <p><strong>Lugares:</strong></p>
            ${strLugares}
        `;

		htmlDetalle += strDisponibilidad;
	}

	if (nuevaReserva.datosBasicos) {
		const strDatosBasicos = `
            <h4>Datos Básicos</h4>
            ${
							nuevaReserva.datosBasicos.interno
								? `<p style="background-color: ${validaCambio(
										nuevaReserva.datosBasicos.interno
								  )}">Es Interno</p>`
								: ""
						}
            ${
							nuevaReserva.datosBasicos.menu
								? `<p style="background-color: ${validaCambio(
										nuevaReserva.datosBasicos.menu
								  )}">Aplica Menú</p>`
								: ""
						}
            ${
							nuevaReserva.datosBasicos.interno &&
							nuevaReserva.datosBasicos.boleteria
								? `<p style="background-color: ${validaCambio(
										nuevaReserva.datosBasicos.boleteria
								  )}">Boletería</p>`
								: ""
						}
            <p style="background-color: ${validaCambio(
							nuevaReserva.datosBasicos.medioReservaNombre
						)}"><strong>Medio de la Reserva:</strong> ${eliminaTexto(
			nuevaReserva.datosBasicos.medioReservaNombre
		)}</p>
            <p style="background-color: ${validaCambio(
							nuevaReserva.datosBasicos.vendedorNombre
						)}"><strong>Asesor Comercial:</strong> ${eliminaTexto(
			nuevaReserva.datosBasicos.vendedorNombre
		)}</p>
            <p><strong>Tercero:</strong></p>
            <ul>
                <li style="background-color: ${validaCambio(
									nuevaReserva.datosBasicos.tercero.terceroid
								)}"><strong>N° documento:</strong> ${eliminaTexto(
			nuevaReserva.datosBasicos.tercero.terceroid
		)}</li>
                ${
									nuevaReserva.datosBasicos.tercero.accion
										? `<li style="background-color: ${validaCambio(
												nuevaReserva.datosBasicos.tercero.accion
										  )}"><strong>Acción:</strong> ${eliminaTexto(
												nuevaReserva.datosBasicos.tercero.accion
										  )}</li>`
										: ""
								} 
                <li style="background-color: ${validaCambio(
									nuevaReserva.datosBasicos.tercero.nombre
								)}"><strong>Nombre:</strong> ${eliminaTexto(
			nuevaReserva.datosBasicos.tercero.nombre
		)}</li>
                <li style="background-color: ${validaCambio(
									nuevaReserva.datosBasicos.tercero.email
								)}"><strong>Email:</strong> ${eliminaTexto(
			nuevaReserva.datosBasicos.tercero.email
		)}</li>
                <li style="background-color: ${validaCambio(
									nuevaReserva.datosBasicos.tercero.telefono
								)}"><strong>Teléfono:</strong> ${eliminaTexto(
			nuevaReserva.datosBasicos.tercero.telefono
		)}</li>
            </ul>
        `;

		htmlDetalle += strDatosBasicos;

		if ($datosMontaje.SolicitaGeneroEventos == "S") {
			htmlDetalle += `
                <p style="background-color: ${validaCambio(
									nuevaReserva.datosBasicos.hombres
								)}"><strong>Hombres:</strong> ${eliminaTexto(
				nuevaReserva.datosBasicos.hombres
			)}</p>
                <p style="background-color: ${validaCambio(
									nuevaReserva.datosBasicos.mujeres
								)}"><strong>Mujeres:</strong>${eliminaTexto(
				nuevaReserva.datosBasicos.mujeres
			)}</p>
                <p style="background-color: ${validaCambio(
									nuevaReserva.datosBasicos.ninos
								)}"><strong>Niños:</strong> ${eliminaTexto(
				nuevaReserva.datosBasicos.ninos
			)}</p>
                <p style="background-color: ${validaCambio(
									nuevaReserva.datosBasicos.ninas
								)}"><strong>Niñas:</strong> ${eliminaTexto(
				nuevaReserva.datosBasicos.ninas
			)}</p>
                <p style="background-color: ${validaCambio(
									nuevaReserva.datosBasicos.observacion
								)}"><strong>Observaciones:</strong> ${eliminaTexto(
				nuevaReserva.datosBasicos.observacion
			)}</p>	
            `;
		}
	}

	if (nuevaReserva.complementos) {
		const totales = {
			totalFijos: 0,
			totalMenus: 0,
			totalOtros: 0,
			totalServicios: 0,
			totalIva: 0,
			totalImpoConsumo: 0,
			totalTotal: 0,
			totalLugares: 0,
		};

		for (const value of Object.values(nuevaReserva.complementos)) {
			for (const value2 of Object.values(value)) {
				if (value2.ivaid == "8.0000") {
					totales.totalImpoConsumo +=
						((value2.total / (1 + value2.ivaid / 100)) * value2.ivaid) / 100;
				} else {
					totales.totalIva +=
						((value2.total / (1 + value2.ivaid / 100)) * value2.ivaid) / 100;
				}
			}
		}

		// Elementos Fijos

		// Filtramos costo de los lugares
		const elementosFijos = nuevaReserva.complementos.elementosFijos.filter(
			(producto) => producto.ElementoId !== -1
		);

		totales.totalFijos = elementosFijos.reduce(
			(acumulador, producto) => acumulador + parseFloat(producto.total),
			0
		);

		const lugares = nuevaReserva.complementos.elementosFijos.filter(
			(producto) => producto.ElementoId == -1
		);

		totales.totalLugares = lugares.reduce(
			(acumulador, producto) => acumulador + parseFloat(producto.total),
			0
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
				`<li><small style="background-color: ${validaCambio(
					menu.objetos[0].nombreMenu
				)}">${eliminaTexto(menu.objetos[0].nombreMenu)}</small>
                    <ul>
                    ${menu.objetos.reduce(
											(acumulador2, menu2) =>
												acumulador2 +
												`<li style="background-color: ${validaCambio(
													menu2.nombre
												)} ${validaCambio(
													menu2.cantidad
												)}"><small>${eliminaTexto(
													menu2.nombre
												)} x ${eliminaTexto(menu2.cantidad)}</small></li>`,
											""
										)}
                    </ul>
                </li>`,
			""
		);

		// Menús
		const menus = nuevaReserva.complementos.menus;
		totales.totalMenus = menus.reduce(
			(acumulador, producto) => acumulador + parseFloat(producto.total),
			0
		);

		totales.totalMenus = menus.reduce(
			(acumulador, producto) => acumulador + parseFloat(producto.total),
			0
		);

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

		const strMenus = menusArrayAgrupado.reduce((acumulador, menu) => {
			desde =
				menu.objetos[0].hasOwnProperty("desde") && menu.objetos[0].desde
					? menu.objetos[0].desde
					: " ";
			hasta =
				menu.objetos[0].hasOwnProperty("hasta") && menu.objetos[0].hasta
					? " " + menu.objetos[0].hasta
					: " ";
			hora =
				menu.objetos[0].hasOwnProperty("hora") && menu.objetos[0].hora
					? " " + menu.objetos[0].hora
					: " ";

			return (
				acumulador +
				`<li>	
                    <span style="background-color: ${validaCambio(
											menu.objetos[0].nombreMenu
										)}">${eliminaTexto(menu.objetos[0].nombreMenu)}</span>
                    <span style="float: right;text-align: right;font-style:italic;font-size: smaller; background-color: ${validaCambio(
											desde
										)} ${validaCambio(hasta)} ${validaCambio(hora)}">${
					eliminaTexto(desde) + eliminaTexto(hasta) + eliminaTexto(hora)
				}
                    </span>
                    <ul>
                    ${menu.objetos.reduce(
											(acumulador2, menu2) =>
												acumulador2 +
												`<li>
                                <small style="background-color: ${validaCambio(
																	menu2.nombre
																)} ${validaCambio(
													menu2.cantidad
												)}">${eliminaTexto(menu2.nombre)} x ${eliminaTexto(
													menu2.cantidad
												)}</small>
                                ${
																	menu2.Observacion
																		? `<br><small style="font-size: small;font-style: italic;margin: 0; background-color: ${validaCambio(
																				menu2.Observacion
																		  )};">${eliminaTexto(
																				menu2.Observacion
																		  )}</small>`
																		: ""
																}
                            </li>`,
											""
										)}
                    </ul>
                </li>`
			);
		}, "");

		// Otros
		const otros = nuevaReserva.complementos.otros;
		totales.totalOtros = otros.reduce(
			(acumulador, producto) => acumulador + parseFloat(producto.total),
			0
		);

		const strOtros = otros.reduce(
			(acumulador, producto) =>
				acumulador +
				`<li><small style="background-color: ${validaCambio(
					producto.nombre
				)} ${validaCambio(producto.cantidad)}">${eliminaTexto(
					producto.nombre
				)} x ${eliminaTexto(producto.cantidad)}</small></li>`,
			""
		);

		// Servicios
		const servicios = nuevaReserva.complementos.servicios;
		totales.totalServicios = servicios.reduce(
			(acumulador, producto) => acumulador + parseFloat(producto.total),
			0
		);

		const strServicios = servicios.reduce(
			(acumulador, producto) =>
				acumulador +
				`<li><small style="background-color: ${validaCambio(
					producto.nombre
				)} ${validaCambio(producto.cantidad)}">${eliminaTexto(
					producto.nombre
				)} x ${eliminaTexto(producto.cantidad)}</small></li>`,
			""
		);

		totales.totalTotal =
			totales.totalFijos +
			totales.totalMenus +
			totales.totalOtros +
			totales.totalServicios +
			totales.totalLugares;

		const strComplementos = `
            <h4>Complementos</h4>

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
								? `<p class="totalFijos"><strong>Total Elementos:</strong> $ ${addCommas(
										totales.totalFijos
								  )}</p>`
								: `<p class="totalFijos"><strong>Total Elementos:</strong> $ 0 </p>`
						}

            ${
							strMenus.length
								? `<p class="totalMenus"><strong>Total Menú:</strong> $ ${addCommas(
										totales.totalMenus
								  )}</p>`
								: `<p class="totalMenus"><strong>Total Menú:</strong> $ 0</p>`
						}
            
            ${
							strOtros.length
								? `<p class="totalOtros"> <strong>Total Otros:</strong> $ ${addCommas(
										totales.totalOtros
								  )}</p>`
								: `<p class="totalOtros"> <strong>Total Otros:</strong> $ 0</p>`
						}

            ${
							strServicios.length
								? `<p class="totalServicios"><strong>Total Servicios:</strong> $ ${addCommas(
										totales.totalServicios
								  )}</p>`
								: `<p class="totalServicios"><strong>Total Servicios:</strong> $ 0</p>`
						}
            
            <p class="subtotal"><strong>Sub Total:</strong> $ ${addCommas(
							totales.totalTotal - totales.totalImpoConsumo - totales.totalIva
						)}</p>
            <p class="ivaTotal"><strong>Total Iva:</strong> $ ${addCommas(
							totales.totalIva
						)}</p>
            <p class="totalImpo"><strong>Total ImpoConsumo:</strong> $ ${addCommas(
							totales.totalImpoConsumo
						)}</p>
            <p class=totalesEven><strong>Total:</strong> $ ${addCommas(
							totales.totalTotal
						)}</p>
        `;

		htmlDetalle += strComplementos;
	}

	if (nuevaReserva.invitados) {
		const strInvitados = `
            <h4>Invitados</h4>
            <p style="background-color: ${validaCambio(
							nuevaReserva.invitados.length
						)}">${addCommas(
			eliminaTexto(nuevaReserva.invitados.length)
		)} invitados cargados</p>
        `;

		htmlDetalle += strInvitados;
	}

	if (nuevaReserva.invitados) {
		const strCotizacion = `
        <h4>Cotización</h4>
        <p style="background-color: ${validaCambio(
					nuevaReserva.cotizacion.evento
				)}"><strong>Consecutivo: </strong>${eliminaTexto(
			nuevaReserva.cotizacion.evento
		)}</p>
        <p style="background-color: ${validaCambio(
					nuevaReserva.cotizacion.version
				)}"><strong>Versión: </strong>${eliminaTexto(
			nuevaReserva.cotizacion.version
		)}</p>
        `;

		htmlDetalle += strCotizacion;
	}

	return htmlDetalle;
}

function eliminaTexto(texto) {
	if (texto != undefined) {
		texto = texto.toString();
		texto = texto.replace("(cambio)", "");
		texto = texto.replace("(nuevo)", "");
		texto = texto.replace("(eliminado)", "");
	}
	return texto;
}

function validaCambio(validar) {
	let nuevoValor = "";
	if (validar != undefined) {
		let cambio = "(cambio)";
		let nuevo = "(nuevo)";
		let eliminado = "(eliminado)";
		if (validar.toString().includes(cambio)) {
			nuevoValor = "#F9E79F;";
		} else if (validar.toString().includes(nuevo)) {
			nuevoValor = "#B8E994;";
		} else if (validar.toString().includes(eliminado)) {
			nuevoValor = "#F5A9BC;";
		}
	}

	return nuevoValor;
}
