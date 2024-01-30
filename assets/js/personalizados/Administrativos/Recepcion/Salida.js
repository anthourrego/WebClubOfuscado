let rutaGeneral = base_url() + "Administrativos/Recepcion/Salida/";
let usuariosRegistrar = [];
let busqueda = false;
let busquedaClick = false;
let $CREAR = 0;
let MODIFICAR = 0;
let socioIngresoEspecial = [];
let conteoFechasInvitado = 0;
let ingresoModal = false;
let ultimaPlacaBuscada = "";
let $sqlConsumosPendientes;
let $socios;

let dataAjax = {
	cliente: "",
};
var $ID = "";
let $IDbarra = "";
let lastFocus = "";
let lastID = "";
let INGRESOMESINVITADOS = 0;
let validarLectorTercero = false;
let validarVacuna = false;

//vARIABLES DEL LECTOR
var barra = [],
	textoBarra = "",
	scanner = true,
	RegistroId = null,
	inputChecked = "#codigo",
	arrUser = [];
var inputStart, inputStop, firstKey, lastKey, timing, userFinishedEntering;
var minChars = 2;

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

function listaPlacasAsociadas(disabledSearch = false) {
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
						alertify.myAlert().set("resizable", true).resizeTo("90%", "100%");
					},
				});

				alertify.myAlert(data);

				var $tblID = "#tblBusqueda";
				dtSS({
					data: {
						tblID: $tblID,
					},
					bAutoWidth: false,
					columnDefs: [{ targets: [0], width: "1%" }],
					ajax: {
						url: rutaGeneral + "DTBuscarSocioPlaca",
						type: "POST",
					},
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

						$("div.dataTables_filter input").prop("disabled", disabledSearch);
					},
					oSearch: { sSearch: ultimaPlacaBuscada },
					createdRow: function (row, data, dataIndex) {
						$(row).click(function () {
							$("#formPlaca input[name='tercero']").val(data[0]);
							$("#codigo").val(data[0]);
							$("#placa").val(data[2]);
							$("#formBuscar").submit();
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
		JSON.stringify(["Código", "Nombre", "Placa", "Acción"])
	);
	alertify.ajaxAlert(base_url() + "Busqueda/DataTable?campos=" + campos);
}

$(function () {
	RastreoIngresoModulo("Salida");
	$("#nroAccion").val("");
	sessionStorage.clear();
	if ($DATOSALMACEN == "" || $DATOSALMACEN == null) {
		alertify.alert(
			"¡Alerta!",
			"<h3 class='mensaje-alerta'>Su usuario no tiene ningún almacén asociado y/o se encuentra inactivo.</h3>",
			function () {
				window.location.href = base_url();
			}
		);
	}

	if ($DATOSSEDE == "" || $DATOSSEDE == null) {
		alertify.alert(
			"¡Alerta!",
			"<h3 class='mensaje-alerta'>El almacén asociado no tienen una sede vinculada y/o se encuentra inactiva.</h3>",
			function () {
				window.location.href = base_url();
			}
		);
	}
	$("[data-codigo]").focusin().change();

	$(document).on("click", ".col-form-label-md", function () {
		var self = this;
		setTimeout(function () {
			$(self).next().find("input, select, textarea").focus();
		}, 0);
	});

	$("[readonly]").each(function () {
		$(this).attr("disabled", true);
	});

	$(
		"input[data-db]:not([data-codigo]), input[data-crud], textarea[data-db]"
	).attr("readonly", true);
	$(
		"select[data-db]:not([data-codigo]), select[data-crud], .btnEliminar, input[type=file]:not(#adj), #btnFoto"
	).attr("disabled", true);

	$("[data-codigo]").on("keypress", function (e) {
		if (e.which == 13) {
			e.preventDefault();
			$(this).change();
		}
	});

	//-------------------------------------------------------------------------------------------------------------------

	$(document).on(
		"change",
		"[data-db]:not([data-codigo])input[type=checkbox]",
		function () {
			if ($(this).is(":checked")) {
				var value = "1",
					lastFocus = "0";
			} else {
				var value = "0",
					lastFocus = "1";
			}
			$(this).val(value);
			$(this).focusout();
		}
	);

	$("#codigo, #codigoLector, #placa").on("keydown", function (e) {
		if (!$("#checkLector, #checkLector2").is(":checked")) {
			form = $(this).closest("form");
			if (e.which == 13) {
				$("#formBuscar input[name='ingresoModal']").val(0);
				form.submit();
				if ($(this).val().length == 0) {
					setTimeout(() => {
						$(this).focus();
					}, 350);
				}
			}
		}
	});

	$("#formBuscar").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			let datos = new FormData(this);
			datos.set("validaLector", $("#checkLector").is(":checked"));
			datos.set("moduloLector", "Salida Ingreso");
			$.ajax({
				url: rutaGeneral + "cargarIngresos",
				type: "POST",
				data: datos,
				dataType: "json",
				processData: false,
				contentType: false,
				cache: false,
				success: (resp) => {
					$sqlConsumosPendientes = resp["datosPendientes"];
					$socios = resp["personasIngresadas"];
					select = 0;
					$("#cardSocio .img-persona").attr(
						"src",
						base_url() + "assets/images/user/nofoto.png"
					);
					$("#contenedorBeneficiarios").empty()
						.append(`<div class='col-12 d-none noDisponible'>
							<div class='alert alert-secondary text-center'>
								<h5 class='mb-0'>No se han encontrado resultados</h5>
							</div>
						</div>`);
					$("#nroAccion")
						.closest(".input-group")
						.find(".input-group-text")
						.text("Acción");
					$("#cardSocio .img-persona").attr(
						"src",
						base_url() + "assets/images/user/nofoto.png"
					);

					$(
						"#estado, #tipoCliente, #textIngreso, #ingresosS,#btnRegistrarSalida, #bntCancelar, #btnAgregarInvitado, #btnEntradaOtrosClubes, #btnEntradaEventos, #invitadorDia, #invitadorMes, #codigoLector, #btnLector, #IngresoCanjeId, #nombreClub"
					)
						.val("")
						.prop("disabled", true);
					$("#checkLector2").prop("disabled", true);
					$("#nroAccion").val("");
					if ($socios.length != 0) {
						terceroPrincipal =
							resp.socioPrincipal != ""
								? resp.socioPrincipal
								: $socios[0].TitularId;
						$("#bntCancelar, #buscarBeneficiarios").prop("disabled", false);
						for (let tercero of $socios) {
							if (resp.ReservaId != null) {
								$("#btnAccion").text("Reserva");
								$("#nroAccion").val(resp.ReservaId);
							}
							$("#codigo").val(terceroPrincipal);
							let fotico =
								tercero.foto == null
									? base_url() + "assets/images/user/nofoto.png"
									: "data:image/jpeg;base64," + tercero.foto;

							switch (tercero.Tipo) {
								case "R ":
									$tipoNombre = "Representante";
									break;
								case "M ":
									$tipoNombre = "Socio";
									break;
								case "B ":
									$tipoNombre = "Beneficiario";
									break;
								case "I ":
									$tipoNombre = "Invitado";
									break;
								case "E ":
									$tipoNombre = "Especial";
									break;
								case "C ":
									$tipoNombre = "Canje";
									break;
								case "T ":
									$tipoNombre = "Torneo";
									break;
								case "H ":
									$tipoNombre = "Hotel";
									break;
								case "PV":
									$tipoNombre = "Proveedor";
									break;
								case "EM":
									$tipoNombre = "Empleado";
									break;
								default:
									$tipoNombre = "Otro";
									break;
							}

							$("#contenedorBeneficiarios").append(`
								<div class="col-10 col-sm-6 col-lg-4 items p-1">
									<div class="card widget-statstic-card cardTercero mb-0" data-tercero='${
										tercero.TerceroId
									}' data-select='0' id="${
								tercero.TerceroId
							}" style="cursor:pointer">
										<div class="row no-gutters">
											<div class="col-md-4">
												<div class="rounded bg-light w-100 text-center">
													<img class="img-persona rounded" src="${fotico}">
												</div>
											</div>
											<div class="col-md-8">
												<div class="card-body px-2 pb-1">
													<p title="${
														tercero.AccionId
													}" class="card-text my-0 w-100 text-truncate"><b>Accion: </b>${
								tercero.AccionId != null ? tercero.AccionId : ""
							}</p>
													<p title="${
														tercero.TerceroId
													}" class="card-text my-0 w-100 text-truncate"><b>Documento: </b>${
								tercero.TerceroId
							}</p>
													<p title="${
														tercero.barra || ""
													}" class="card-text my-0 w-100 text-truncate "><b>Barra: </b>${
								tercero.barra || ""
							}</p>
													<p title="${tercero.nombre}" class="card-text my-0 w-100 text-truncate">${
								tercero.nombre
							}</p>
													
													<p title="${
														tercero.TipoSocio || ""
													}" class="card-text my-0 w-100 text-truncate font-beneficiarios"><b>Tipo:</b> ${$tipoNombre}</p>
													<p title="${
														tercero.estado || ""
													}" class="card-text my-0 w-100 text-truncate font-beneficiarios"><b>Estado:</b> ${
								tercero.Estado != null ? tercero.Estado : "Invitado Activo"
							}</p>
													<p title="${
														tercero.club || ""
													}" class="card-text my-0 w-100 text-truncate font-beneficiarios"><b></b> ${
								tercero.club != null ? tercero.club : ""
							}</p>
													<div class="form-group mt-3 form-group-placa">
														<input id="placa${tercero.TerceroId}" disabled placeholder="Placa" name="placa${
								tercero.TerceroId
							}" class="form-control form-control-sm form-control-floating font-beneficiarios" autocomplete="off" type="text" >
														<label class="floating-label" for="placa${tercero.TerceroId}">${
								tercero.Placa != null ? tercero.Placa : ""
							}</label>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>`);

							if ($("#codigo").val() === tercero.TerceroId) {
								$(`#${tercero.TerceroId}`).click();
							}

							if (tercero.AccionId) {
								$("#nroAccion").val(tercero.AccionId);
							}
						}
					} else {
						if ($socios == "") {
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
												alertify
													.myAlert()
													.set("resizable", true)
													.resizeTo("80%", "90%");
											},
										});

										alertify.myAlert(data);

										dtSS({
											data: {
												tblID: "#tblBusqueda",
											},
											ajax: {
												url: rutaGeneral + "DTBuscarSocio",
												type: "POST",
											},
											bAutoWidth: false,
											columnDefs: [{ targets: [0], width: "1%" }],
											ordering: false,
											draw: 10,
											pageLength: 10,
											oSearch: { sSearch: $("#codigo").val() },
											createdRow: function (row, data, dataIndex) {
												$(row).click(function () {
													$("#formBuscar input[name='ingresoModal']").val(1);
													$("#codigo").val(data[0].trim());
													$("#formBuscar").submit();
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
								JSON.stringify(["Código", "Nombre", "Barra", "Acción"])
							);
							alertify.ajaxAlert(
								base_url() + "Busqueda/DataTable?campos=" + campos
							);
						} else {
							alertify.warning(
								"No hay ingresos registrados del tercero " + $("#codigo").val()
							);
							$("#cardSocio .img-persona").attr(
								"src",
								base_url() + "assets/images/user/nofoto.png"
							);
							$("#contenedorBeneficiarios").empty()
								.append(`<div class='col-12 d-none noDisponible'>
									<div class='alert alert-secondary text-center'>
										<h5 class='mb-0'>No se han encontrado resultados</h5>
									</div>
								</div>`);
							$("#codigo, #placa, #formPlaca input[name='tercero']").val("");
							$(
								"#estado, #tipoCliente, #textIngreso, #btnRegistrar, #bntCancelar, #btnAgregarInvitado, #btnEntradaOtrosClubes, #btnEntradaEventos, #invitadorDia, #placaS, #invitadorMes, #codigoLector, #btnLector, #IngresoCanjeId, #nombreClub, #buscarBeneficiarios"
							)
								.val("")
								.prop("disabled", true);
							$("#checkLector2").prop("disabled", true);
							$("#cardSocio .card-text").empty();
							$("#cardSocio")
								.removeClass(
									"bg-danger bg-success bg-c-yellow text-white border"
								)
								.addClass("disabled")
								.data("tercero", "")
								.data("select", "3");
							$("#cardSocio").find(".st-icon, .st-icon3").addClass("d-none");
							$("#placaS").next("label").text("Placa");
							$("#textIngreso").html("");
						}
					}
				},
			});
		}
	});

	$("#btnRegistrarSalida").on("click", function (e) {
		e.preventDefault();
		let card = $(".cardTercero").closest(".card");
		let terceroSalida = [];
		card = card.closest(".bg-success");
		for (let datos of card) {
			terceroRegistrar = datos.getAttribute("data-tercero");
			for (let tercero of $socios) {
				if (tercero.TerceroId == terceroRegistrar) {
					terceroSalida.push(tercero);
				}
			}
		}
		$.ajax({
			url: rutaGeneral + "SalidaTercero",
			type: "POST",
			data: { datos: terceroSalida },
			cache: false,
			dataType: "json",
			success: (resp) => {
				if (resp.success) {
					$("#cardSocio .img-persona").attr(
						"src",
						base_url() + "assets/images/user/nofoto.png"
					);
					$("#contenedorBeneficiarios, #contenedorInvitados").empty()
						.append(`<div class='col-12 d-none noDisponible'>
							<div class='alert alert-secondary text-center'>
								<h5 class='mb-0'>No se han encontrado resultados</h5>
							</div>
						</div>`);
					$("#codigo, #placa, #formPlaca input[name='tercero']").val("");
					$(
						"#estado, #tipoCliente, #textIngreso, #btnRegistrarSalida, #bntCancelar, #buscarBeneficiarios, #btnAgregarInvitado, #btnEntradaOtrosClubes, #btnEntradaEventos, #invitadorDia, #placaS, #invitadorMes, #codigoLector, #btnLector, #IngresoCanjeId, #nombreClub"
					)
						.val("")
						.prop("disabled", true);
					$("#checkLector2").prop("disabled", true);
					$("#cardSocio .card-text").empty();
					$("#cardSocio")
						.removeClass("bg-danger bg-success bg-c-yellow text-white border")
						.addClass("disabled")
						.data("tercero", "")
						.data("select", "3");
					$("#cardSocio").find(".st-icon, .st-icon3").addClass("d-none");
					$("#placaS").next("label").text("Placa");
					$("#textIngreso").html("");
					$("#nroAccion").val("");

					usuariosRegistrar = [];
					alertify.success(resp.msj);
				} else {
					alertify.error("Error al realizar la salida.");
				}
			},
		});
	});

	$("#bntCancelar").on("click", function () {
		$("#cardSocio .img-persona").attr(
			"src",
			base_url() + "assets/images/user/nofoto.png"
		);
		$(
			"#contenedorBeneficiarios, #contenedorInvitados"
		).empty().append(`<div class='col-12 d-none noDisponible'>
				<div class='alert alert-secondary text-center'>
					<h5 class='mb-0'>No se han encontrado resultados</h5>
				</div>
			</div>`);
		$("#codigo, #placa, #formPlaca input[name='tercero']").val("");
		$(
			"#estado, #tipoCliente, #nroAccion, #textIngreso,#btnRegistrarSalida, #bntCancelar, #btnAgregarInvitado, #btnEntradaOtrosClubes, #btnEntradaEventos, #invitadorDia, #invitadorMes, #codigoLector, #btnLector, #IngresoCanjeId, #nombreClub, #buscarBeneficiarios"
		)
			.val("")
			.prop("disabled", true);
		$("#checkLector2").prop("disabled", true);
		$("#nombreClub").closest("div").addClass("d-none");
		$("#nroAccion, #tipoCliente, #estado, #invitadorDia, #btnAgregarInvitado")
			.closest("div")
			.removeClass("d-none");
		$("#placaS").next("label").text("Placa");
		$("#cardSocio .card-text").empty();
		$("#cardSocio").find(".st-icon, .st-icon3").addClass("d-none");
		$("#textIngreso").html("");
		$("#cardSocio")
			.removeClass("bg-danger bg-success text-white border bg-c-yellow")
			.addClass("disabled")
			.data("tercero", "")
			.data("select", "3");
		usuariosRegistrar = [];
		setTimeout(() => {
			$("#codigo").focus();
		}, 0);
	});

	$("#formLector").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			let codigo = $("#codigoLector").val().trim();

			if (codigo.length > 0) {
				socio = socios.find((socio) => socio.barra.trim() == codigo);

				if (!socio) {
					socio = socios.find((socio) => socio.TerceroID.trim() == codigo);
				}

				if (socio) {
					if (socio.PermitirIngreso <= 0) {
						alertify.warning("El tercero ha superado límite de ingresos.");
					} else if (socio.Baloteado > 0) {
						alertify.warning("El tercero se encuentra bloqueado.");
					} else if (socio.Ingreso) {
						alertify.warning("El tercero ya se encuentra dentro del club.");
					} else if (socio.Titular) {
						if ($("#cardSocio").data("select") != "3") {
							$("#cardSocio")
								.addClass("bg-success")
								.addClass("text-white")
								.data("select", "1");
							usuariosRegistrar.push(
								$("#cardSocio").data("tercero").toString()
							);
						} else {
							alertify.warning("El titular ya se encuentra seleccionado.");
						}
					} else {
						card = $("#card" + socio.TerceroID);
						if (card.data("select") != "3") {
							if (card.data("tercero") != "" && card.data("select") == 0) {
								card
									.addClass("bg-success")
									.addClass("text-white")
									.data("select", "1");
								usuariosRegistrar.push(card.data("tercero").toString());
							} else {
								alertify.warning("El socio ya se encuentra seleccionado.");
							}
						}
					}
				}

				setTimeout(() => {
					$("#codigoLector").val("").focus();
				}, 500);
			}
		}
	});

	$(document).on("click", ".cardTercero", function () {
		const terceroSeleccionado = $("#codigo").val();
		let card = $(this).closest(".card");
		let encontrado = true;
		if (card.data("tercero") != "" && card.data("select") == 0) {
			$.each(
				$sqlConsumosPendientes.sqlConsumosPendientes,
				function (index, pendientes) {
					if (pendientes.TerceroId == card.data("tercero")) {
						alertify.alert("Advertencia", pendientes.mensaje, function () {});
						encontrado = false;
						return false;
					}
				}
			);
			if (encontrado) {
				card.addClass("bg-success").addClass("text-white").data("select", "1");
				usuariosRegistrar.push(card.data("tercero").toString());
				$("#btnRegistrarSalida").attr("disabled", false);
			}
			if (usuariosRegistrar.length > 0) {
				$("#btnRegistrarSalida").prop("disabled", false);
			} else {
				$("#btnRegistrarSalida").prop("disabled", true);
			}
		} else {
			card
				.removeClass("bg-success")
				.removeClass("text-white")
				.data("select", "0");
			//Filtramos para eliminar el usuario deseleccionado
			usuariosRegistrar = usuariosRegistrar.filter(
				(i) => i != card.data("tercero")
			);
			$("#btnRegistrarSalida").attr("disabled", false);
			if (usuariosRegistrar.length > 0) {
				$("#btnRegistrarSalida").prop("disabled", false);
			} else {
				$("#btnRegistrarSalida").prop("disabled", true);
			}
		}
	});

	//Buscador de Beneficiaros y Invitador
	$("#buscarBeneficiarios").on("keyup", function () {
		let nombre = $(this).data("nombre");

		var rex = new RegExp($(this).val(), "i");

		$(`#contenedor${nombre} .items`).addClass("d-none");

		$(`#contenedor${nombre} .items`)
			.filter(function () {
				return rex.test($(this).find(".card-text").text());
			})
			.removeClass("d-none");

		if (
			$(`#contenedor${nombre} .items:not(.d-none)`).length <= 0 &&
			$(this).val().length > 0
		) {
			$(`#contenedor${nombre}`).find(".noDisponible").removeClass("d-none");
		} else {
			$(`#contenedor${nombre}`).find(".noDisponible").addClass("d-none");
		}
	});

	$(".imagen-container").on({
		mouseenter: function () {
			$(".cambio-foto").attr("hidden", false);
		},
		mouseleave: function () {
			$(".cambio-foto").attr("hidden", true);
		},
	});

	$(document).on("click", ".st-icon", function () {
		MODIFICAR = 1;
		$("#modalTerceros .modal-title").html(
			'<i class="fas fa-user-edit"></i> Modificar tercero'
		);
		$("#checkLectorTercero").prop("disabled", true);
		$("[data-codigo]")
			.val($(this).closest(".card").data("tercero"))
			.change()
			.attr("readonly", true);
		$("#modalTerceros").modal("show");
	});

	//Lector de cedula eventos
	$("#checkLector, #checkLectorTercero, #checkLector2").on(
		"click",
		function () {
			inputChecked = "#" + $(this).val();
			$(this).is(":checked") ? propForm(true) : propForm(false);
		}
	);

	$("#codigo, #codigoLector, #TerceroID").on("focusout", function () {
		if ($("#checkLector, #checkLectorTercero, #checkLector2").is(":checked")) {
			setTimeout(function () {
				$(inputChecked).focus();
			}, 50);
		}
	});

	$(document).on("focus", "#codigo, #TerceroID, #codigoLector", function () {
		if ($("#checkLector, #checkLectorTercero, #checkLector2").is(":checked")) {
			if (scanner == false) {
				barra = [];
				textoBarra = "";
				scanner = false;
				inputStart = null;
				inputStop = null;
				firstKey = null;
				lastKey = null;
			}
		}
	});

	$("#codigo, #TerceroID, #codigoLector").keydown(function (e) {
		if ($("#checkLector, #checkLectorTercero, #checkLector2").is(":checked")) {
			if (inputChecked == "#codigo") {
				$("#checkLector").prop("disabled", true);
			} else if (inputChecked == "#codigoLector") {
				$("#checkLector2").prop("disabled", true);
			} else {
				$("#checkLectorTercero").prop("disabled", true);
			}

			if (!(barra == [] && $(inputChecked).val() == "")) {
				// restart the timer
				if (timing) {
					clearTimeout(timing);
				}

				// handle the key event
				if (e.which == 13) {
					// Enter key was entered

					// don't submit the form
					e.preventDefault();

					// has the user finished entering manually?
					if ($(inputChecked).val().trim().length >= minChars) {
						userFinishedEntering = true; // incase the user pressed the enter key
						inputComplete();
					}
					arrUser = $(inputChecked).val().split("-");

					setTimeout(function () {
						//$("#nomV").val("").focus()
						$(inputChecked).val(arrUser[0]);
						//$("#nomV").val(arrUser[3]+" "+arrUser[4]+" "+arrUser[1]+" "+arrUser[2]);
						if (inputChecked == "#codigo") {
							$("#formBuscar").submit();
							$("#checkLector").prop("disabled", false).click();
						} else if (inputChecked == "#codigoLector") {
							$("#formLector").submit();
							$("#checkLector2").prop("disabled", false).click();
						} else {
							validarLectorTercero = $("#checkLectorTercero").is(":checked");
							$(inputChecked).change();
							$("#checkLectorTercero").prop("disabled", false).click();
							setTimeout(() => {
								$("#checkLectorTercero").focus();
							}, 200);
						}
						//location.reload();
					}, 100);
				} else {
					// some other key value was entered

					// could be the last character
					inputStop = performance.now();
					lastKey = e.which;

					// don't assume it's finished just yet
					userFinishedEntering = false;

					// is this the first character?
					if (e.which == 9) {
						e.preventDefault();
						$(inputChecked).val($(inputChecked).val().trim() + "-");
						setTimeout(function () {
							$(inputChecked).focus();
						}, 100);
						return;
					}
					if (e.which == 16) {
						e.stopPropagation();
						$(inputChecked).val($(inputChecked).val().trim());
						return;
					}
					if (e.which == 32) {
						e.stopPropagation();
						$(inputChecked).val($(inputChecked).val().trim());
						return;
					}

					if (!inputStart) {
						firstKey = e.which;
						inputStart = inputStop;

						// watch for a loss of focus
						$("body").on("blur", inputChecked, inputBlur);
					}

					// start the timer again
					timing = setTimeout(inputTimeoutHandler, 500);
				}
			}
		}
	});

	$(document)
		.off("keydown")
		.on("keypress", function (e) {
			if (
				$("#checkLector, #checkLector2, #checkLectorTercero").is(":checked")
			) {
				if (e.which == 13) {
					e.preventDefault();
				} else {
					textoBarra += e.key;
				}

				if (e.which == 13 && scanner == true) {
					e.preventDefault();
				}
			}
		});

	$(document).on("keyup", "#codigo, #TerceroID, #codigoLector", function () {
		if ($(this).next().find("input").prop("disabled")) {
			$(this).val($(this).val().replace(/^000/, ""));
		}
	});

	//Validar la placa del tercero asociado
	$("#formPlaca").on("submit", function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			$.ajax({
				url: rutaGeneral + "validarPlacaTercero",
				type: "POST",
				data: new FormData(this),
				processData: false,
				contentType: false,
				cache: false,
				dataType: "json",
				success: function (resp) {
					$("#listaPlacas").closest(".input-group-append").addClass("d-none");
					if (resp.PlacaInicial.length > 0) {
						ultimaPlacaBuscada = resp.PlacaInicial[0].Placa.trim();
					}

					if (resp.PlacaInicial.length == 1) {
						let dataPlaca = resp.PlacaInicial[0];
						$("#formPlaca input[name='tercero']").val(dataPlaca.TerceroId);
						$("#codigo").val(dataPlaca.TerceroId);
						$("#formBuscar").submit();
					} else if (resp.PlacaInicial.length > 1) {
						listaPlacasAsociadas();
					} else {
						alertify.warning("No se han encontrado resultados.");
					}

					if (resp.PlacaSecundaria.length >= 1) {
						$("#listaPlacas")
							.closest(".input-group-append")
							.removeClass("d-none");
					}
				},
			});
		}
	});

	$("#listaPlacas").on("click", function () {
		let placaActual = $("#placa").val().trim();
		if (placaActual == ultimaPlacaBuscada) {
			listaPlacasAsociadas(true);
		} else {
			$("#listaPlacas").closest(".input-group-append").addClass("d-none");
			alertify.warning(
				"La placa buscada no coincide con la ultima busqueda realizada."
			);
		}
	});

	$(".toUpperTrim").keyup(function () {
		$(this).val($(this).val().toUpperCase().trim());
	});

	$("#fechaIni").on("dp.change", function (e) {
		$("#fechaFin").data("DateTimePicker").minDate(e.date);
	});
	$("#fechaFin").on("dp.change", function (e) {
		$("#fechaIni").data("DateTimePicker").maxDate(e.date);
	});

	$("#btnSalidaMasiva").on("click", function (e) {
		$("#salidaMasivaModal").modal("show");
		const fechaActual = new Date();
		const formatoFecha = fechaActual.toISOString().substring(0, 10);
		$("#fechaIni").val(formatoFecha);
		$("#fechaFin").val(formatoFecha);
	});

	$("#guardarSalidaMasiva").on("click", function (e) {
		e.preventDefault();
		fechaIni = $("#fechaIni").val();
		fechaFin = $("#fechaFin").val();
		alertify.confirm(
			"Advertencia",
			`¿Está seguro que desea realizar la salida masiva entre las fechas ${fechaIni} a ${fechaFin}`,
			function (ok) {
				$.ajax({
					url: rutaGeneral + "salidaMasiva",
					type: "POST",
					data: {
						fechaIni: fechaIni,
						fechaFin: fechaFin,
					},
					cache: false,
					dataType: "json",
					success: (resp) => {
						console.log(resp);
						if (resp.datos.length > 0) {
							if (resp.success) {
								alertify.success("Salidas exitosamente");
								$("#cardSocio .img-persona").attr(
									"src",
									base_url() + "assets/images/user/nofoto.png"
								);
								$("#contenedorBeneficiarios").empty()
									.append(`<div class='col-12 d-none noDisponible'>
										<div class='alert alert-secondary text-center'>
											<h5 class='mb-0'>No se han encontrado resultados</h5>
										</div>
									</div>`);
								$("#codigo, #placa, #formPlaca input[name='tercero']").val("");
								$(
									"#estado, #tipoCliente, #textIngreso, #btnRegistrar, #bntCancelar, #btnAgregarInvitado, #btnEntradaOtrosClubes, #btnEntradaEventos, #invitadorDia, #placaS, #invitadorMes, #codigoLector, #btnLector, #IngresoCanjeId, #nombreClub, #buscarBeneficiarios"
								)
									.val("")
									.prop("disabled", true);
								$("#checkLector2").prop("disabled", true);
								$("#cardSocio .card-text").empty();
								$("#cardSocio")
									.removeClass(
										"bg-danger bg-success bg-c-yellow text-white border"
									)
									.addClass("disabled")
									.data("tercero", "")
									.data("select", "3");
								$("#cardSocio").find(".st-icon, .st-icon3").addClass("d-none");
								$("#placaS").next("label").text("Placa");
								$("#textIngreso").html("");
							} else {
								alertify.error("Error al momento de generar la salida masiva");
							}
						} else {
							alertify.warning("No hay datos para eliminar en estas fechas");
						}
						$("#salidaMasivaModal").modal("hide");
					},
				});
			},
			function (err) {
				console.log("Error ", err);
			}
		);
	});

	$("#cerrarMasivo").on("click", function (e) {
		$("#salidaMasivaModal").modal("hide");
	});
});

//Funcion del lector
function propForm(prop) {
	setTimeout(() => {
		$("button, select")
			.not(
				"#btnCrear, #btnBuscar, .btnCerrarModalConsultarCrear, #btnCerrarModalConsultarCrear"
			)
			.prop("disabled", prop);
		$("input, a, textarea")
			.not(
				"#codigo, #codigoLector, #checkLector, #checkLectorTercero, #checkLector2, [data-db='TerceroID']"
			)
			.prop("readonly", prop);
	}, 100);

	setTimeout(function () {
		$(inputChecked).focus();
	}, 0);

	if ($ID == "") {
		$(
			"input[data-db]:not([data-codigo]), input[data-crud], textarea[data-db]"
		).attr("readonly", true);
		$(
			"select[data-db]:not([data-codigo]), select[data-crud], .btnEliminar, input[type=file]:not(#adj), .btnAgregar, .btnEliminar, #btnEliminarCliente,[data-db]input[type=checkbox]:not(.noBloquear),[data-crud]input[type=checkbox], #btnFoto"
		).attr("disabled", true);
	}
}

function inputBlur() {
	clearTimeout(timing);
	if ($(inputChecked).val().trim().length >= minChars) {
		userFinishedEntering = true;
		inputComplete();
	}
}

function resetValues() {
	barra = [];
	textoBarra = "";
	scanner = false;

	inputStart = null;
	inputStop = null;
	firstKey = null;
	lastKey = null;
	setTimeout(function () {
		$(inputChecked).val("").focus();
	}, 0);
	inputComplete();
}

function isScannerInput() {
	return (
		(inputStop - inputStart) / $(inputChecked).val().trim().length < 30 &&
		$(inputChecked).val() != ""
	);
}

function isUserFinishedEntering() {
	return !isScannerInput() && userFinishedEntering;
}

function inputTimeoutHandler() {
	// stop listening for a timer event
	clearTimeout(timing);
	// if the value is being entered manually and hasn't finished being entered
	if (!isUserFinishedEntering() || $(inputChecked).val().trim().length < 3) {
		// keep waiting for input
		return;
	} else {
		reportValues();
	}
}

function inputComplete() {
	// stop listening for the input to lose focus
	$("body").off("blur", inputChecked, inputBlur);
	// report the results
	reportValues();
}

function reportValues() {
	// update the metrics
	$("#startTime").text(inputStart == null ? "" : inputStart);
	$("#firstKey").text(firstKey == null ? "" : firstKey);
	$("#endTime").text(inputStop == null ? "" : inputStop);
	$("#lastKey").text(lastKey == null ? "" : lastKey);
	$("#totalTime").text(
		inputStart == null ? "" : inputStop - inputStart + " milliseconds"
	);
	if (!inputStart) {
		// clear the results
		setTimeout(function () {
			$(inputChecked).focus().select();
		}, 3000);
	} else {
		// prepend another result item
		var inputMethod = isScannerInput() ? "Scanner" : "Keyboard";
		if (isScannerInput()) {
			scanner = true;
			if (barra.length == 0) {
				barra.push(textoBarra.trim());
				textoBarra = "";
			}
		}
		setTimeout(function () {
			$(inputChecked).focus().select();
		}, 0);
		inputStart = null;
	}
}

setInterval(function () {
	barra = [];
	textoBarra = "";
	scanner = false;

	inputStart = null;
	inputStop = null;
	firstKey = null;
	lastKey = null;
}, 2000);
