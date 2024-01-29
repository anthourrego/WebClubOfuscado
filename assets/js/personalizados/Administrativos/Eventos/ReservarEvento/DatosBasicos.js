const terceros = [];
let hayCambiosSinGuardar = false,
	lugarSeleccionado = null,
	$ID = "",
	tipoMontajeSeleccionado = "",
	terceroId = null;

$(function () {
	$(window).on("beforeunload", () => {
		if (hayCambiosSinGuardar) {
			return "¿Estás segur@ que quieres salir? Hay cambios sin guardar";
		}
	});

	if (!nuevaReserva.disponibilidad) {
		hayCambiosSinGuardar = false;
		window.location.href =
			base_url() + "Administrativos/Eventos/ReservarEvento/Disponibilidad";
	} else {
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
							.find("img:eq(0)")
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
							`[data-lugarid=${lugar.LugarId}] .card:not(.card-tipomontaje) .lugar-card-container`
						)
						.tooltip({
							html: true,
							title,
							placement: "right",
						});

					$("#lugaresComponent div:eq(0)")
						.find(`[data-lugarid=${lugar.LugarId}] .card-tipomontaje`)
						.tooltip();
				});
				$("#lugaresComponent").trigger("loadData");
			},
		});
	}

	$("#DatosBasicos").trigger("reset");
	$("#TipoEvento").val(nuevaReserva.disponibilidad.tipoevento);
	$("#Personas").val(nuevaReserva.disponibilidad.personas);
	$("#Hombres").val(nuevaReserva.disponibilidad.personas);

	// Event listeners

	$("#TipoMontaje").on("change", function () {
		const tipoMontaje = $(this).is(":checked");
		if (tipoMontaje) {
			$(".card-tipomontaje").removeClass("d-none").addClass("d-block");
		} else {
			$(".card-tipomontaje").addClass("d-none").removeClass("d-block");
		}
	});

	$(document)
		.on("click", ".card-tipomontaje", function () {
			lugarSeleccionado = $(this)
				.closest("[data-lugarid]")
				.attr("data-lugarid");
			if ($(this).attr("data-tipomontaje").trim() !== "") {
				tipoMontajeSeleccionado = $(this).attr("data-tipomontaje").trim();
			} else {
				tipoMontajeSeleccionado = "";
			}
			$("#modalTiposMontaje").modal("show");
		})
		.on("click", ".card-montaje-option", function () {
			const tipoMontajeId = $(this).attr("data-tipomontajeid");
			const img = $(this).find("img").attr("src");
			const nombre = $(this).find(".card-footer").text().trim();

			$(`[data-lugarid=${lugarSeleccionado}]`)
				.find("[data-tipomontaje]")
				.attr("data-tipomontaje", tipoMontajeId)
				.find("img")
				.attr("src", img);

			$(`[data-lugarid=${lugarSeleccionado}]`)
				.find("[data-tipomontaje]")
				.attr("data-tipomontaje", tipoMontajeId)
				.find(".card-footer")
				.html(`<small>${nombre}</small>`);

			$("#modalTiposMontaje").modal("hide");
		});

	$("#modalTiposMontaje").on("shown.bs.modal", function () {
		$(this)
			.find(
				`[data-tipomontajeid=${
					tipoMontajeSeleccionado === "" ? '""' : tipoMontajeSeleccionado
				}]`
			)
			.addClass("shadow");
	});

	$("#modalTiposMontaje").on("hidden.bs.modal", function () {
		$("[data-tipomontajeid]").each(function () {
			$(this).removeClass("shadow");
		});
	});

	$("#Interno").on("change", function () {
		const interno = $(this).is(":checked");
		if (interno) {
			$("#Boleteria")
				.closest(".custom-switch")
				.removeClass("d-none")
				.addClass("d-block");
		} else {
			$("#Boleteria")
				.closest(".custom-switch")
				.addClass("d-none")
				.removeClass("d-block");
		}
	});

	$("#DatosBasicos")
		.on("change", "input, select", function () {
			hayCambiosSinGuardar = true;
		})
		.on("change", "#vendedorId", function () {
			const value = $(this).val(),
				tabla = $(this).attr("data-foranea");

			var self = this;
			if ($(self).attr("data-foranea")) {
				if (value != "") {
					const nombre = $(self).attr("data-foranea-codigo");
					const tblNombre = "nombre";
					$.ajax({
						url: rutaGeneral + "CargarForanea",
						type: "POST",
						data: {
							tabla: tabla,
							value: value,
							nombre: nombre,
							tblNombre: tblNombre,
						},
						success: function (respuesta) {
							if (respuesta == 0) {
								DTalertifyBusqueda(self, tblNombre, value);
							} else {
								respuesta = JSON.parse(respuesta);

								$(self)
									.closest(".input-group")
									.find("span")
									.text(respuesta[0][tblNombre])
									.attr("title", respuesta[0][tblNombre]);
							}
						},
					});
				} else {
					$(self)
						.closest(".input-group")
						.find("span")
						.text("")
						.attr("title", "");
				}
			}
		})
		.on("submit", function (e) {
			e.preventDefault();

			const ndocumento = $("#TerceroId").val().trim();
			const data = {
				datosBasicos: {
					interno: $("#Interno").is(":checked"),
					menu: $("#Menu").is(":checked"),
					manejalista: $("#ManejaLista").is(":checked"),
					boleteria:
						$("#Interno").is(":checked") && $("#Boleteria").is(":checked"),
					medioreserva: $("#MedioReserva").val().trim(),
					vendedor: $("#vendedorId").val().trim(),
					tercero: {
						terceroid: terceroId,
						accion: ndocumento !== terceroId ? ndocumento : null,
						email: $("#Email").val().trim(),
						telefono: $("#Telefono").val().trim(),
					},
					hombres: parseInt($("#Hombres").val() ? $("#Hombres").val() : 0),
					mujeres: parseInt($("#Mujeres").val() ? $("#Mujeres").val() : 0),
					ninos: parseInt($("#Ninos").val() ? $("#Ninos").val() : 0),
					ninas: parseInt($("#Ninas").val() ? $("#Ninas").val() : 0),
					tiposmontaje: $("#TipoMontaje").is(":checked"),
					observacion: $("#Observacion").val().trim(),
				},
				disponibilidad: {
					tipoevento: $("#TipoEvento").val(),
				},
			};

			const sessReserva = {};
			sessReserva.disponibilidad = sessionStorage.getItem(
				"newRESDisponibilidad"
			);
			if (sessReserva.disponibilidad) {
				sessReserva.disponibilidad = JSON.parse(sessReserva.disponibilidad);
			}
			sessReserva.datosBasicos = sessionStorage.getItem("newRESDatosBasicos");
			if (!sessReserva.datosBasicos) {
				sessReserva.datosBasicos = {};
			} else {
				sessReserva.datosBasicos = JSON.parse(sessReserva.datosBasicos);
			}

			const personas =
				data.datosBasicos.hombres +
				data.datosBasicos.mujeres +
				data.datosBasicos.ninos +
				data.datosBasicos.ninas;
			if (nuevaReserva.disponibilidad.personas !== personas) {
				alertify.alert(
					"Advertencia",
					`La cantidad total de hombres, mujeres, niños y niñas (${personas}) no coincide con el número de personas del evento (${addCommas(
						nuevaReserva.disponibilidad.personas
					)})
					<br/><br/>
					Revise que estos valores coincidan para poder continuar`
				);

				return false;
			}
			Object.assign(sessReserva.disponibilidad, data.disponibilidad);
			Object.assign(sessReserva.datosBasicos, data.datosBasicos);

			if (data.datosBasicos.tiposmontaje) {
				sessReserva.disponibilidad.lugares.forEach((lugar) => {
					const tipoMontaje = $(`[data-lugarid=${lugar.lugarid}]`)
						.find(`[data-tipomontaje]`)
						.attr("data-tipomontaje");

					if (tipoMontaje !== "") {
						lugar.tipomontaje = tipoMontaje;
					} else {
						if (lugar.tipomontaje) {
							delete lugar.tipomontaje;
						}
					}
				});
			} else {
				sessReserva.disponibilidad.lugares.forEach((lugar) => {
					if (lugar.tipomontaje) {
						delete lugar.tipomontaje;
					}
				});
			}

			sessionStorage.setItem(
				"newRESDisponibilidad",
				JSON.stringify(sessReserva.disponibilidad)
			);
			sessionStorage.setItem(
				"newRESDatosBasicos",
				JSON.stringify(sessReserva.datosBasicos)
			);

			if (
				!sessReserva.datosBasicos.menu &&
				nuevaReserva.complementos &&
				nuevaReserva.complementos.menus.length
			) {
				nuevaReserva.complementos.menus.length = 0;

				sessionStorage.setItem(
					"newRESComplementos",
					JSON.stringify(nuevaReserva.complementos)
				);
			}

			// Si quita la lista de invitados
			if (
				!sessReserva.datosBasicos.manejalista &&
				nuevaReserva.invitados &&
				nuevaReserva.invitados.length
			) {
				nuevaReserva.invitados.length = 0;

				sessionStorage.setItem(
					"newRESInvitados",
					JSON.stringify(nuevaReserva.invitados)
				);
			}

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
			}

			hayCambiosSinGuardar = false;

			location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Complementos`;
		});

	$("#TerceroId").on("change", function (e) {
		e.preventDefault();
		terceroId = $(this).val().trim();
		let self = this;
		$("#btnSiguiente").attr("disabled", true);

		$("#frmTercero")
			.find("input:not(.personasInput, #TerceroId), select")
			.each(function () {
				$(this).val("").attr("readonly", true).attr("disabled", true);
			});
		$("#Nombre").html("");
		terceros.splice(0);
		$("#Foto").attr("src", base_url() + "assets/images/user/nofoto.png");

		if (terceroId !== "") {
			$.ajax({
				url: rutaGeneral + "obtenerAccion",
				type: "POST",
				data: {
					terceroId,
				},
				success: (res) => {
					const data = JSON.parse(res);
					if (data.length > 0) {
						$("#btnSiguiente").attr("disabled", false);
						for (let i = 0; i < data.length; i++) {
							terceros.push(data[i]);
							$("#Nombre").append(
								`<option value="${data[i].terceroId.trim()}">${
									data[i].nombre
								}</option>`
							);
						}
						$("#Nombre")
							.attr("readonly", false)
							.attr("disabled", false)
							.change();

						if (
							data.length === 1 &&
							data[0].barra &&
							data[0].barra.trim() === $("#TerceroId").val().trim()
						) {
							$("#TerceroId").val(data[0].terceroId);
						}
						$("#Nombre").trigger("loadData");
					} else {
						$("#TerceroId").val("");

						DTalertifyBusqueda(self, "nombre", terceroId);
					}
				},
			});
		}
	});

	$("#Nombre").on("change", function () {
		terceroId = $(this).val().trim();
		if (terceroId !== "") {
			const persona = terceros.filter(
				(tercero) => tercero.terceroId.trim() === terceroId
			)[0];
			$("#Email")
				.val(persona.email)
				.attr("readonly", false)
				.attr("disabled", false);
			$("#Telefono")
				.val(persona.telefono)
				.attr("readonly", false)
				.attr("disabled", false);
			$("#Foto").attr("src", persona.foto);
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

	// Métodos

	function DTalertifyBusqueda(self, tblNombre, value) {
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
							column_order: [$(self).attr("data-foranea-codigo"), tblNombre],
							column_search: [$(self).attr("data-foranea-codigo"), tblNombre],
							orden: {},
							columnas: [$(self).attr("data-foranea-codigo"), tblNombre],
						},
						bAutoWidth: false,
						processing: true,
						serverSide: true,
						columnDefs: [{ targets: [0], width: "1%" }],
						order: [],
						ordering: false,
						draw: 10,
						language: $.Constantes.lenguajeTabla,
						pageLength: 10,
						initComplete: function () {
							setTimeout(function () {
								$("div.dataTables_filter input").focus();
								$(".alertify").animate(
									{
										scrollTop: $("div.dataTables_filter input").offset().top,
									},
									2000
								);
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
					dtSS(config);
				},
			});
		};
		alertify.ajaxAlert(base_url() + "Busqueda/DataTable");
	}

	// Procedimientos

	if (nuevaReserva.datosBasicos) {
		$("#Nombre").on("loadData", function () {
			$("#Nombre").val(nuevaReserva.datosBasicos.tercero.terceroid).change();
			$("#Email").val(nuevaReserva.datosBasicos.tercero.email);
			$("#Telefono").val(nuevaReserva.datosBasicos.tercero.telefono);

			hayCambiosSinGuardar = false;
			$("#Nombre").off("loadData");
		});
		if (nuevaReserva.datosBasicos.tercero.accion) {
			$("#TerceroId").val(nuevaReserva.datosBasicos.tercero.accion).change();
		} else {
			$("#TerceroId").val(nuevaReserva.datosBasicos.tercero.terceroid).change();
		}
		$("#Interno").prop("checked", nuevaReserva.datosBasicos.interno).change();
		$("#Menu").prop("checked", nuevaReserva.datosBasicos.menu).change();
		$("#ManejaLista")
			.prop("checked", nuevaReserva.datosBasicos.manejalista)
			.change();
		$("#Boleteria")
			.prop("checked", nuevaReserva.datosBasicos.boleteria)
			.change();
		$("#MedioReserva").val(nuevaReserva.datosBasicos.medioreserva).change();
		$("#vendedorId").val(nuevaReserva.datosBasicos.vendedor).change();
		$("#Hombres").val(nuevaReserva.datosBasicos.hombres).change();
		$("#Mujeres").val(nuevaReserva.datosBasicos.mujeres).change();
		$("#Ninos").val(nuevaReserva.datosBasicos.ninos).change();
		$("#Ninas").val(nuevaReserva.datosBasicos.ninas).change();
		if (nuevaReserva.datosBasicos.tiposmontaje) {
			$("#lugaresComponent").on("loadData", function () {
				$("#TipoMontaje")
					.prop("checked", nuevaReserva.datosBasicos.tiposmontaje)
					.change();
				$("[data-lugarid]:not(#lugar-example)").each(function () {
					const lugar = nuevaReserva.disponibilidad.lugares.filter(
						(tmpLugar) => tmpLugar.lugarid === $(this).attr("data-lugarid")
					)[0];
					if (lugar.tipomontaje) {
						lugarSeleccionado = $(this).attr("data-lugarid");
						$(
							`.card-montaje-option[data-tipomontajeid=${lugar.tipomontaje}]`
						).click();
					}
				});

				hayCambiosSinGuardar = false;
				$("#lugaresComponent").off("loadData");
			});
		}
		$("#Observacion").val(nuevaReserva.datosBasicos.observacion).change();
	}
});

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
