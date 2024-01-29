let filtroTipoLugar = "",
	fechaIni = "",
	fechaFin = "",
	personas = 1,
	agrupar = false;

const arrLugares = [];

$(function () {
	// Procedimientos antes de event listeners

	// 1. Obtener datos del session storage
	if (!nuevaReserva.disponibilidad) {
		$("#fechaFin").val("");
		$("#fechaIni").val(moment().format("YYYY-MM-DD"));
		setTimeout(() => {
			$("#fechaIni").trigger("dp.change");
		}, 1000);
		$("#personas").val(1);
	} else {
		if (nuevaReserva.disponibilidad.lugares.length === 0) {
			sessionStorage.removeItem("newRESDisponibilidad");
			location.reload();
		}

		$("#fechaIni").val(nuevaReserva.disponibilidad.fechaini);
		$("#fechaFin").val(nuevaReserva.disponibilidad.fechafin);
		$("#personas").val(nuevaReserva.disponibilidad.personas);

		$("#lugaresComponent").removeClass("d-none");

		let lugares = nuevaReserva.disponibilidad.lugares.map(
			(reserva) => reserva.lugarid
		);

		$.ajax({
			url: rutaGeneral + "filtrarDisponibilidad",
			type: "POST",
			data: {
				fechaIni: nuevaReserva.disponibilidad.fechaini,
				fechaFin: nuevaReserva.disponibilidad.fechafin,
				personas: nuevaReserva.disponibilidad.personas,
				lugares: lugares.toString(),
			},
			success: (res) => {
				const data = JSON.parse(res);
				data.lugares.map((lugar) => {
					let FORMAT = "DD/MM/YYYY";
					let index = nuevaReserva.disponibilidad.lugares.findIndex(
						(sesslugar) => sesslugar.lugarid === lugar.LugarId
					);

					let $clone = $("#lugar-example")
						.clone()
						.removeClass("d-none")
						.removeAttr("id")
						.attr("data-lugarid", lugar.LugarId)
						.attr("data-tipolugarid", lugar.TipoLugarId);

					if (lugar.Icono) {
						$clone
							.find("img")
							.attr(
								"src",
								base_url() + `uploads/${NIT()}/Lugares/${lugar.Icono}`
							);
					}

					$clone.html(function () {
						return $(this)
							.html()
							.replace("{GrupoMinimo}", lugar.GrupoMinimo)
							.replace("{GrupoMaximo}", lugar.GrupoMaximo)
							.replace(/{Nombre}/g, lugar.Nombre)
							.replace("{TipoLugarNombre}", lugar.TipoLugarNombre);
					});

					if (
						!nuevaReserva.disponibilidad.lugares.find(
							(item) => item.lugarid === lugar.LugarId
						).allDay
					) {
						FORMAT += " h:mm a";
					}
					const inicio = moment(
						nuevaReserva.disponibilidad.lugares[index].fechaini
					).format(FORMAT);
					const fin = moment(
						nuevaReserva.disponibilidad.lugares[index].fechafin
					).format(FORMAT);
					const title = `
						<b>Evento:</b> ${nuevaReserva.disponibilidad.nombre}
						<br/><b>Tipo:</b>  ${nuevaReserva.disponibilidad.description}
						<br/><b>Inicio:</b> ${inicio}
						<br/><b>Fin:</b> ${fin}
					`;

					$clone.appendTo("#lugaresComponent div:eq(0)");

					$("#lugaresComponent div:eq(0)")
						.find(
							`[data-lugarid="${lugar.LugarId}"] .card .lugar-card-container`
						)
						.tooltip({
							html: true,
							title,
							placement: "right",
						})
						.on("click", function () {
							const lugarid = $(this)
								.closest("[data-lugarid]")
								.attr("data-lugarid");
							alertify.confirm(
								"Descartar lugar",
								"¿Desea no incluir el lugar seleccionado en la cotización del evento actual?",
								function () {
									if (index !== -1) {
										nuevaReserva.disponibilidad.lugares.splice(index, 1);
									}
									const disponibilidadJSON = JSON.stringify(
										nuevaReserva.disponibilidad
									);
									if (nuevaReserva.disponibilidad.lugares.length === 0) {
										sessionStorage.removeItem("newRESDisponibilidad");
									} else {
										sessionStorage.setItem(
											"newRESDisponibilidad",
											disponibilidadJSON
										);
									}
									location.reload();
								},
								function () {}
							);
						});
				});
			},
		});

		$("#divContinuar").removeClass("d-none");
		$("[data-href=DatosBasicos]")
			.removeClass("disabled")
			.closest("li")
			.removeAttr("disabled");

		if (nuevaReserva.disponibilidad.agrupar) {
			$(".custom-switch-div")
				.removeClass("d-none")
				.find("input")
				.prop("checked", true);
			agrupar = true;
			$("#Agrupar").attr("disabled", true);
		} else {
			$(".custom-switch-div")
				.removeClass("d-none")
				.find("input")
				.prop("checked", false);
			agrupar = false;
		}

		if (nuevaReserva.disponibilidad.lugares.length > 1) {
			$("#Agrupar").attr("disabled", true);
		}

		$("#fechaIni, #fechaFin, #personas, #btnFiltrarDisponibilidad").each(
			function () {
				$(this).attr("disabled", true);
			}
		);

		$("#btnReiniciar").removeClass("d-none");
		$("#btnFiltrarDisponibilidad").addClass("w-75");
	}

	// Event listeners

	$("#btnAyuda").on("click", function (e) {
		e.preventDefault();
		$("#modalAyuda").modal("toggle");
	});

	$("#frmFiltros").on("submit", function (e) {
		e.preventDefault();
		fechaIni = $("#fechaIni").val();
		fechaFin = $("#fechaFin").val();
		personas = parseInt($("#personas").val());

		const dataAJAX = {
			fechaIni,
			fechaFin,
			personas,
		};

		$("#lugares").html("");
		$("#filtros").addClass("d-none").find(".btn-filter:not(:first)").remove();

		if (nuevaReserva.disponibilidad) {
			const excluidos = nuevaReserva.disponibilidad.lugares
				.map((reserva) => reserva.lugarid)
				.toString();
			dataAJAX.excluidos = excluidos;
		}

		if (agrupar) {
			dataAJAX.agrupar = {
				fechaini: nuevaReserva.disponibilidad.lugares[0].fechaini,
				fechafin: nuevaReserva.disponibilidad.lugares[0].fechafin,
				allDay: nuevaReserva.disponibilidad.lugares[0].allDay,
			};
		}

		$.ajax({
			url: rutaGeneral + "filtrarDisponibilidad",
			type: "POST",
			data: dataAJAX,
			success: (res) => {
				const data = JSON.parse(res);

				arrLugares.length = 0;
				arrLugares.push(...data.lugares);

				data.lugares.map((lugar) => {
					var $clone = $("#lugar-component")
						.clone()
						.removeClass("d-none")
						.removeAttr("id")
						.attr("data-lugarid", lugar.LugarId)
						.attr("data-tipolugarid", lugar.TipoLugarId)
						.attr("data-estado", lugar.estado);

					$clone.find(".lugar-badge-capacidad p").html(function () {
						return $(this)
							.html()
							.replace("{cantidadMin}", lugar.GrupoMinimo)
							.replace("{cantidadMax}", lugar.GrupoMaximo);
					});

					$clone.find(".lugar-badge-tipo").text(function () {
						return $(this).text().replace("{tipo}", lugar.TipoLugarNombre);
					});

					$clone.find(".lugar-nombre").text(function () {
						return $(this).text().replace("{nombre}", lugar.Nombre);
					});

					$clone.find(".lugar-responsive-nombre").text(function () {
						return $(this).text().replace("{nombre}", lugar.Nombre);
					});

					if (lugar.Icono) {
						$clone
							.find("img")
							.attr(
								"src",
								base_url() + `uploads/${NIT()}/Lugares/${lugar.Icono}`
							);
					}

					if (
						!(personas >= lugar.GrupoMinimo && personas <= lugar.GrupoMaximo)
					) {
						$clone.addClass("excede");
						if (agrupar || !nuevaReserva.disponibilidad) {
							if (personas >= lugar.GrupoMinimo) {
								$clone.addClass("noExcede");
							}
						}
					}

					if (lugar.Estado == "O") {
						$clone.addClass("ocupado");
					}
					// Validaciones para cuando se hace el filtro por una fecha específica

					// Validaciones para cuando se hace el filtro con rango de fechas
					if (fechaIni !== "" && fechaFin !== "" && lugar.Estado == "O") {
						$clone.addClass("validacion-ocupado");
					}

					$clone.appendTo("#lugares");
				});

				$("#filtros").removeClass("d-none").addClass("d-flex");

				data.tipoLugares.map((tipoLugar) => {
					var $clone = $("#filtroTodos")
						.clone()
						.removeAttr("id")
						.removeClass("btn-primary")
						.addClass("btn-light")
						.text(tipoLugar.Nombre)
						.attr("data-id", tipoLugar.TipoLugarId);

					$clone.appendTo("#filtros");
				});

				if (agrupar) {
					validarDisponibilidad();
				}
			},
		});
	});

	$(document)
		.on("click", ".lugar-component:not(.thumbnail)", function (e) {
			e.preventDefault();
			if (agrupar) {
				if ($(this).hasClass("excede")) {
					if ($(this).hasClass("noExcede")) {
						$(this).toggleClass("seleccionado");
						validarDisponibilidad();
					}
				} else {
					$(this).toggleClass("seleccionado");
					validarDisponibilidad();
				}
			} else {
				if ($(this).hasClass("excede")) {
					if ($(this).hasClass("noExcede")) {
						const lugarid = $(this).attr("data-lugarid");
						alertify.confirm(
							"Advertencia",
							"El lugar seleccionado no satisface la cantidad de personas digitada, tras elegir el horario regresará a esta pestaña para seleccionar otros lugares donde ubicará a las personas restantes",
							function () {
								seleccionarLugar(lugarid, true);
							},
							function () {}
						);
					} else {
						alertify.alert(
							"Advertencia",
							"El número de personas que asistirán al evento excede o es menor a la capacidad del lugar seleccionado"
						);
					}
				} else if ($(this).hasClass("validacion-ocupado")) {
					alertify.alert(
						"Advertencia",
						"El lugar seleccionado se encuentra ocupado en las fechas establecidas"
					);
				} else {
					seleccionarLugar($(this).attr("data-lugarid"));
				}
			}
		})
		.on("click", ".btn-filter", function (e) {
			e.preventDefault();
			$(".btn-filter.btn-primary")
				.removeClass("btn-primary")
				.addClass("btn-light");
			$(this).removeClass("btn-light").addClass("btn-primary");
			filtroTipoLugar = $(this).attr("data-id");

			$(".lugar-component:not(.thumbnail):not([id])")
				.removeClass("d-none")
				.removeClass("ocultar");

			if (filtroTipoLugar !== "") {
				$(".lugar-component:not(.thumbnail):not([id])").map(function () {
					if (!$(this).is(`[data-tipolugarid="${filtroTipoLugar}"]`)) {
						$(this).addClass("ocultar");
					}
				});
			}
		})
		.on("animationend", ".lugar-component.ocultar", function () {
			$(this).addClass("d-none");
		});

	$("#fechaIni").on("dp.change", function () {
		const fIni = $(this).val().trim();
		const fFin = $("#fechaFin").val().trim();
		const fIniDate = moment(fIni).toDate();
		if (fIni === "") {
			$("#fechaFin").attr("disabled", true);
		} else if (fFin !== "") {
			const fFinDate = moment(fFin).toDate();
			if (fIniDate > fFinDate) {
				$("#fechaFin").val("");
			}
		}
		$("#fechaFin").datetimepicker("destroy").datetimepicker({
			minDate: fIniDate,
			format: "YYYY-MM-DD",
			locale: "es",
		});

		if (!nuevaReserva.disponibilidad) {
			$("#lugares").html("");
			$("#filtros").removeClass("d-flex").addClass("d-none");
		}
	});

	$("#fechaFin").on("dp.change", function () {
		const fIni = $("#fechaIni").val().trim();
		const fFin = $(this).val().trim();

		const fIniDate = moment(fIni).toDate();
		const fFinDate = moment(fFin).toDate();

		if (fIniDate > fFinDate) {
			$("#fechaFin").val("");
		}

		if (!nuevaReserva.disponibilidad) {
			$("#lugares").html("");
			$("#filtros").removeClass("d-flex").addClass("d-none");
		}
	});

	$(".data-int")
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

	$("#personas").on("change", function () {
		if (isNaN($(this).val()) || $(this).val() == 0) {
			$(this).val(1);
		}
		if (!nuevaReserva.disponibilidad) {
			$("#lugares").html("");
			$("#filtros").removeClass("d-flex").addClass("d-none");
		}
	});

	$("#Agrupar").on("change", function () {
		if ($(this).is(":checked")) {
			agrupar = true;

			$(".excede").each(function () {
				$(this).addClass("noExcede");
			});
		} else {
			agrupar = false;
			$(".excede").each(function () {
				$(this).removeClass("noExcede");
			});
		}
		$("#btnFiltrarDisponibilidad")
			.attr("disabled", false)
			.click()
			.attr("disabled", true);
	});

	$("#btnSiguiente").on("click", function (e) {
		e.preventDefault();
		const lugaresSeleccionados = [];
		if (agrupar) {
			$(".seleccionado").each(function () {
				const lugarId = $(this).attr("data-lugarid").trim();
				lugaresSeleccionados.push(
					arrLugares.find((lugar) => lugar.LugarId === lugarId)
				);
			});

			lugaresSeleccionados.forEach((lugar) => {
				const objLugar = {
					GrupoMaximo: lugar.GrupoMaximo,
					GrupoMinimo: lugar.GrupoMinimo,
					Icono: lugar.Icono,
					Nombre: lugar.Nombre,
					TLNombre: lugar.TipoLugarNombre,
					TMNombre: null,
					allDay: nuevaReserva.disponibilidad.lugares[0].allDay,
					fechafin: nuevaReserva.disponibilidad.lugares[0].fechafin,
					fechaini: nuevaReserva.disponibilidad.lugares[0].fechaini,
					lugarid: lugar.LugarId,
				};

				nuevaReserva.disponibilidad.lugares.push(objLugar);
			});

			nuevaReserva.disponibilidad.agrupar = agrupar;

			// Guarda en el session storage
			const disponibilidadJSON = JSON.stringify(nuevaReserva.disponibilidad);
			sessionStorage.setItem("newRESDisponibilidad", disponibilidadJSON);

			// Si está en modo edición
			if (
				nuevaReserva.cotizacion &&
				typeof nuevaReserva.cotizacion.edicion !== "undefined"
			) {
				const cotizacionJSON = JSON.stringify({
					...nuevaReserva.cotizacion,
					cambiosEvento: true,
				});
				sessionStorage.setItem("newRESCotizacion", cotizacionJSON);

				// Actualizo los elementos fijos, eliminando aquellos de lugares que ahora no hay

				const lugares = nuevaReserva.disponibilidad.lugares.map(
					(lugar) => lugar.lugarid
				);

				nuevaReserva.complementos.elementosFijos =
					nuevaReserva.complementos.elementosFijos.filter((producto) =>
						lugares.includes(producto.menu)
					);

				const menus = [
					...new Set(
						nuevaReserva.complementos.elementosFijos.map(
							(elemento) => elemento.menu
						)
					),
				];

				const lugaresFaltantes = lugares.filter(
					(lugar) => !menus.includes(lugar)
				);

				$.ajax({
					url: rutaGeneral + "CargarElementosFijos",
					type: "POST",
					async: false,
					data: {
						lugares: JSON.stringify(lugaresFaltantes),
					},
					success: function (respuesta) {
						const res = JSON.parse(respuesta);
						if (res.length) {
							res.forEach((producto) =>
								nuevaReserva.complementos.elementosFijos.push(producto)
							);
							const complementosJSON = JSON.stringify(
								nuevaReserva.complementos
							);
							sessionStorage.setItem("newRESComplementos", complementosJSON);
						}
					},
				});
			}
		}
		location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/DatosBasicos`;
	});

	$("#btnReiniciar").on("click", function (e) {
		e.preventDefault();
		alertify.confirm(
			"Advertencia",
			"¿Está seguro de comenzar la reserva de cero y perder los datos seleccionados?",
			function () {
				sessionStorage.removeItem("newRESDisponibilidad");
				sessionStorage.removeItem("newRESDatosBasicos");
				sessionStorage.removeItem("newRESComplementos");
				sessionStorage.removeItem("newRESInvitados");
				sessionStorage.removeItem("newRESCotizacion");

				location.reload();
			},
			function () {}
		);
	});

	// Funciones / Métodos

	function seleccionarLugar(lugarid, regresar = false) {
		const lugares = [lugarid];
		// Agregamos los lugares seleccionados previamente
		if (nuevaReserva.disponibilidad) {
			nuevaReserva.disponibilidad.lugares.forEach((reserva) =>
				lugares.push(reserva.lugarid)
			);
		}

		const data = {
			fechaini: fechaIni,
			personas,
			lugares,
			regresar,
		};

		if (fechaFin !== "") {
			if (
				(fechaFin !== fechaIni && nuevaReserva.disponibilidad === null) ||
				(fechaFin !== fechaIni && nuevaReserva.disponibilidad.lugares[0].allDay)
			) {
				const originalDate = new Date(fechaFin);
				let newDate = new Date(originalDate);
				newDate.setDate(originalDate.getDate() + 1);
				fechaFin = newDate.toISOString().slice(0, 10);
			}
			data.fechafin = fechaFin;
		} else {
			data.fechafin = fechaIni;
		}

		var parsedUrl = new URL(
			`${base_url()}Administrativos/Eventos/ReservarEvento/Calendario`
		);

		Object.keys(data).forEach(function (key) {
			parsedUrl.searchParams.append(key, data[key]);
		});

		const url = parsedUrl.toString();

		location.href = url;
	}

	function validarDisponibilidad() {
		let grupoMaximo = 0;
		nuevaReserva.disponibilidad.lugares.forEach(
			(lugar) => (grupoMaximo += lugar.GrupoMaximo)
		);

		$(".seleccionado").each(function () {
			const arrCapacidad = $(this)
				.find(".lugar-badge-capacidad p")
				.text()
				.trim()
				.split(" - ");
			grupoMaximo += parseInt(arrCapacidad[1]);
		});

		$("#personas")
			.inputmask("remove")
			.val(`${personas} / ${grupoMaximo}`)
			.attr("title", "Personas / Capacidad total")
			.tooltip();

		if (grupoMaximo >= personas) {
			$("#btnSiguiente").attr("disabled", false);

			if ($(".ajs-message.ajs-warning.ajs-visible").length) {
				$(".ajs-message.ajs-warning.ajs-visible").click();
				alertify.set("notifier", "position", "bottom-left");
			}
		} else {
			if (!$(".ajs-message.ajs-warning.ajs-visible").length) {
				alertify.set("notifier", "position", "bottom-right");
				alertify.warning(
					`Selecciona suficientes lugares para cubrir la capacidad total de ${personas} personas en tu evento`,
					0
				);
			}
			$("#btnSiguiente").attr("disabled", true);
		}
	}

	// Procedimientos fuera de event listeners

	if (nuevaReserva.disponibilidad) {
		$("#frmFiltros").submit();
	}

	if (
		nuevaReserva.cotizacion &&
		typeof nuevaReserva.cotizacion.edicion !== "undefined"
	) {
		$("#btnReiniciar").addClass("d-none");
	}
});
