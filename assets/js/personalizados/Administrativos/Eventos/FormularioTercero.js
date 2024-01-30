function terceroComponent(config = {}) {
	this.__config = {};
	this.__config.tercero = config.tercero !== undefined ? config.tercero : "";
	this.__config.tipoTercero = config.tipoTercero !== undefined ? config.tipoTercero : "";
	this.__config.exigeD = config.exigeD !== undefined ? config.exigeD : "N";
	this.__config.modulo = config.modulo !== undefined ? config.modulo : "";
	this.__config.paneles =
		config.paneles !== undefined
			? config.paneles
			: ["DatosPrincipales", "DireccionResidencia", "OtrosDatos"];

	//validaciones para saber si falta alguna libreria para que funcione bien el modulo
	try {
		if (
			!(
				typeof jQuery !== "undefined" &&
				typeof jQuery.fn.chosen !== "undefined" &&
				typeof jQuery.fn.datetimepicker !== "undefined" &&
				typeof jQuery.fn.inputmask !== "undefined"
			)
		) {
			console.log(
				"Librerias necesarias: ",
				"chosen: ",
				jQuery.fn.chosen,
				"datetimepicker: ",
				jQuery.fn.datetimepicker,
				"inputmask: ",
				jQuery.fn.inputmask
			);
		}
	} catch (error) {
		console.log(error);
	}

	return new Promise(function (resolve, reject) {
		// Variables
		let cedula = "",
			tipo = "",
			$accionId,
			lastModal = null,
			formulario = null,
			TerceroIdCargado = this.__config.tercero;
			tipoTerceroCargado = this.__config.tipoTercero;
			exigeD = this.__config.exigeD;
			modulo = this.__config.modulo;
			paneles = this.__config.paneles;

		const estructura = {
			contentDatosPersonales: {
				foto: "",
				TerceroID: "",
				tipoTercero: "",
				apelldos: "",
				apelluno: "",
				celular: "",
				ciudanacim: null,
				digitverif: "",
				email: "",
				email2: "",
				estadocivilid: null,
				fechanacim: "",
				foto: "",
				nombrdos: "",
				nombre: "",
				nombruno: "",
				numercredi: "",
				razonsocia: "",
				sexo: null,
				tipodocuId: null,
			},
			contentDatosDireccion: {
				barrioid: null,
				ciudadid: null,
				direccion: "",
				dptoid: null,
				paisid: null,
				telefono: "",
				zonaid: null,
			},
			contentDatosComplementarios: {
				hijos: "0",
				ocupacion: "",
				profesionid: null,
			},
		};
		const datosTerceroCambios = {
			TerceroID: "Documento",
			tipodocuId: "Tipo de Documento",
			tipoTercero: "Tipo de Tercero",
			nombre: "Nombre",
			razonsocia: "Razón Social",
			nombruno: "Primer Nombre",
			nombrdos: "Segundo Nombre",
			apelluno: "Primer Apellido",
			apelldos: "Segundo Apellido",
			email: "E-Mail 1",
			email2: "E-Mail 2",
			Celular: "Celular",
			Sexo: "Genero",
			numercredi: "Número de Tarjeta",
			fechanacim: "Fecha de Nacimiento",
			ciudanacim: "Ciudad de Nacimiento",
			direccion: "Dirección",
			paisid: "Pais",
			dptoid: "Departamento",
			ciudadid: "Ciudad",
			barrioid: "Barrio",
			zonaid: "Zona",
			telefono: "Teléfonos",
			profesionid: "Profesión",
			ocupacion: "Ocupación",
			hijos: "Número de Hijos",
			foto: "Foto",
		};

		$("#modalTerceroComponent").remove();

		$.ajax({
			url: `${base_url()}Administrativos/Eventos/FormularioTercero/cargarVista`,
			type: "POST",
			async: false,
			data: {
				config: JSON.stringify(this.__config.paneles),
			},
			success: function (data) {
				// 1. Crea el modal
				const html = `
				<div id="modalTerceroComponent" data-keyboard="false" class="modal fade" tabindex="-1" data-backdrop='static' role="dialog" aria-labelledby="modalCrearLabel" aria-hidden="true" style="overflow:auto;">
					<div class="modal-dialog modal-xl" role="document">
						<div class="modal-content" >
							<div class="modal-header headerWebClub">
								<h5 class="modal-title">
									<i class="fas fa-user"></i>
									Formulario Tercero
								</h5>
							</div>
							<div class="modal-body pb-0">
								${data}
							</div>
						</div>
					</div>
				</div>
			`;
				//2. agrego la modal al cuerpo del codumento
				$("body").append(html);

				formulario = $("#modalTerceroComponent").find(".componentTercero");

				//3. le agregamos los datos de la vista a la modal
				$("#modalTerceroComponent").modal("show");
			},
		});

		// EVENT LISTENER

		formulario
			.on("change", ".TerceroID", function () {
				imagenInicial = $(".img-perfil").attr("src");

				cedula = $(this).val();
				cargarTercero(cedula);
				if (modulo != '') {
					setTimeout(() => {
						
						$(".tipoTercero").val(tipoTerceroCargado).prop('disabled',true).trigger("chosen:updated");
					}, 350);
				}
			})
			.on("change", "[data-db=tipodocuId]", function () {
				if ($(this).val() == "31") {
					if (modulo == 'modalClientes') {
						$('.label-razonsocia, .razonSocialDiv').css('display','');
					}
					$(".label-razonsocia").html(
						'<span class="text-danger"> *</span> Razón Social'
					);
					$(".razonsocia").attr("required", true).addClass('valida');
					$(".label-nombruno").html("Primer Nombre");
					$(".label-apelluno").html("Primer Apellido");
					$('.nombruno, .apelluno').removeClass('valida');		
					$('.nombruno, .apelluno').css("border", "")		
					$("[data-db=digitverif]")
						.focusin()
						.val(calcularDigitoVerificacion(cedula))
						.focusout();
					$("[data-db=nombre]").val($("[data-db=razonsocia]").val());
					if ($('.TerceroID').val().length >= 16) {
						alertify.error("El NIT no puede exceder los 16 caracteres. Por favor ajuste la longitud del documento.");
					}
				} else {
					if (modulo == 'modalClientes') {
						$('.label-razonsocia, .razonSocialDiv').css('display','none');
					}
					$('.nombruno, .apelluno').addClass('valida');		
					$(".label-nombruno").html(
						'<span class="text-danger">*</span> Primer Nombre'
					);
					$(".label-apelluno").html(
						'<span class="text-danger">*</span> Primer Apellido '
					);
					$(".label-razonsocia").html("Razón Social");
					$(".razonsocia").attr("required", false);
					$("[data-db=digitverif]").focusin().val("").focusout();
					$("[data-db=nombre]").val(
						$("[data-db=nombruno]").val() +
							" " +
							$("[data-db=nombrdos]").val() +
							" " +
							$("[data-db=apelluno]").val() +
							" " +
							$("[data-db=apelldos]").val()
					);
				}
			})
			.on("change", ".inputFoto", function () {
				const input = this;
				if (input.files && input.files[0]) {
					var reader = new FileReader();
					reader.onload = function (e) {
						var background = e.target.result;
						// aqui se valida que la imagen venga de una edicion

						$(input)
							.closest(".imagen-container")
							.find(".img-perfil")
							.attr("src", background);
					};
					reader.readAsDataURL(input.files[0]);
				}
			})
			.on("change", ".ciudadTercero", function () {
				const selectOption = $(".ciudadTercero").find('option:selected');
				const deptoIdciudad = selectOption.attr('dataid')
				actualizarSelect(
					".dptoTercero",
					deptoIdciudad					
				);
			})
			.on("click", ".btnGuardar", function (e) {
				e.preventDefault();
				var exepcion = 0;
				//validacion para que todos los campos requeridos se completen
				$(".valida").each(function () {
					if ($(this).val() == "" || $(this).val() == null ) {
						$(this).css("border-bottom", "1px solid red");
						$(this).css(
							"border-bottom",
							"1px solid red"
						);
						exepcion = 1;
					} else {
						$(this).css("border-bottom", "");
						if ($(".tipodocuId").val() == null) {
							$(".tipodocuIdselect").css("border", "1px solid red");
							$(".tipodocuIdselect").css("border-radius", "4px");
						} else {
							$(".tipodocuIdselect").css("border", "");
							$(".tipodocuIdselect").css("border-radius", "");
						}
						if ($(".tipoTercero").val() == null) {
							$(" .tipoTerceroselect").css("border", "1px solid red");
							$(" .tipoTerceroselect").css("border-radius", "4px");
						} else {
							$(" .tipoTerceroselect").css("border", "");
							$(" .tipoTerceroselect").css("border-radius", "");
						}
						// esta validacion es para cuando exigaDatos y se valla a facturar pide otros campos obligatorios para pintar los select que sepan
						// que es obligatorio
						if ( exigeD== 'S') {
							if ($(".paisTercero").val() == null || $(".dptoTercero").val() == null ) {
								$(" .selectExigeDatos").css("border", "1px solid red");
								$(" .selectExigeDatos").css("border-radius", "4px");
							} else {
								$(" .selectExigeDatos").css("border", "");
								$(" .selectExigeDatos").css("border-radius", "");
							}
						}
					}
				});
				if (exepcion == 0) {
					let dataCopia = recorrerDatosObjetosTercero(formulario);
					const copia = obtenerCambios(data, dataCopia);
					const cambiosDatos = JSON.stringify(copia);
					let copiatrasformada = {};
					let dataObjetoPlano = {};
					rastreo = [];

					//convertir el objeto copia que viene anidado en un objeto corriente para validar sea mas sencilla
					for (const propiedad in copia) {
						if (copia.hasOwnProperty(propiedad)) {
							const partes = propiedad.split(".");
							const dato = partes[0];
							const propiedadDato = partes[1];
							copiatrasformada[propiedadDato] = copia[propiedad];
						}
					}

					//convertir el objeto data que viene anidado en un objeto plano para validar sea mas sencilla
					for (const categoria in data) {
						if (data.hasOwnProperty(categoria)) {
							const subObjeto = data[categoria];
							for (const propiedad in subObjeto) {
								if (subObjeto.hasOwnProperty(propiedad)) {
									const valor = subObjeto[propiedad];
									const clave = `${propiedad}`;
									dataObjetoPlano[clave] = valor;
								}
							}
						}
					}
					//aqui se valida la parte para crear el rasteo como esta en el erp que es dato anterio con dato nuevo y nombre de
					//campo visible para la vista y no con los datos de la tabla.
					for (const propiedad in datosTerceroCambios) {
						if (
							datosTerceroCambios.hasOwnProperty(propiedad) &&
							dataObjetoPlano.hasOwnProperty(propiedad) &&
							copiatrasformada.hasOwnProperty(propiedad)
						) {
							nombre = datosTerceroCambios[propiedad];
							valorOriginal = dataObjetoPlano[propiedad];
							valorActual = copiatrasformada[propiedad];
							rastreo.push({ nombre, valorOriginal, valorActual });
						}
					}

					$.ajax({
						url: `${base_url()}Administrativos/Eventos/FormularioTercero/CETercero`,
						type: "POST",
						dataType: "json",
						data: {
							cambios: cambiosDatos,
							dataCopia: dataCopia,
							tercero: $(".TerceroID").val(),
							rastreo: rastreo,
						},
						success: function (registro) {
							if (registro == "1") {
								alertify.success("Se actualizó el tercero correctamente");
								$codigo = 1;
							} else if (registro == "2") {
								alertify.success(
									"Se creo el tercero correctamente"
								);
								$codigo = 2;
							} else {
								alertify.error("Ocurrio un error.");
							}
							$("#modalTerceroComponent").modal("hide");
							setTimeout(() => {
								$("#modalTerceroComponent").remove();
							}, 150);
							resolve({
								codigo: $codigo,
								data: dataCopia,
							});
							if (modulo != 'modalClientes') {
								$("body").css("overflow", "auto");
							}
						},
					});
				} else {
					alertify.error("Valide la información de los campos.");
				}
			})
			.on("click", ".subir-foto", function (e) {
				e.preventDefault();
				param = "inputFoto";
				$("." + param).click();
			})
			.on("click", ".btnFoto", function (e) {
				e.preventDefault();
				inputFoto = "TerceroID";
				modalFoto(inputFoto);
			})
			.on("click", ".btnCancelar", function (e) {
				e.preventDefault();
				$("#modalTerceroComponent").modal("hide");
				setTimeout(() => {
					$("#modalTerceroComponent").remove();
				}, 150);
				reject({
					codigo: 0,
				});
				if (modulo != 'modalClientes') {
					$("body").css("overflow", "auto");
				}
			})
			.on("click", "#modalFotoFormTerceroCerrar", function (e) {
				e.preventDefault();
				$("body").css("overflow", "hidden");
				$(".modalFoto").modal("hide");
			})
			.on("change", function (e) {
				e.preventDefault();
				$(".btnGuardar").attr("disabled", false);
				if ($("[data-db=tipodocuId]").val() != "31") {
					$("[data-db=nombre]").val(
						$("[data-db=nombruno]").val() +
							" " +
							$("[data-db=nombrdos]").val() +
							" " +
							$("[data-db=apelluno]").val() +
							" " +
							$("[data-db=apelldos]").val()
					);
				} else {
					$("[data-db=nombre]").val($("[data-db=razonsocia]").val());
				}
			});

		// FUNCIONES

		const recorrerDatosObjetosTercero = (formTercero) => {
			const data = {};
			const rutaFoto = $(".img-perfil");
			$(formTercero)
				.find("[data-tipo]")
				.each(function () {
					const tipo = $(this).data("tipo");
					let valor;

					if (!data[tipo]) {
						data[tipo] = {};
					}

					$(this)
						.find("[data-name]")
						.each(function () {
							const nombre = $(this).data("name");
							valor = $(this).val();
							if (nombre == "foto") {
								valor = rutaFoto.attr("src");
							}
							data[tipo][nombre] = valor;
						});
				});
			return data;
		};

		const cargarTercero = (cedula) => {
			$.ajax({
				url: `${base_url()}Administrativos/Eventos/FormularioTercero/cargarTercero`,
				type: "POST",
				dataType: "json",
				data: {
					codigo: cedula,
					RASTREO: RASTREO("Carga Tercero " + cedula, "Terceros"),
				},
				success: function (resp) {
					$terceroSocio = resp;
					if (resp.datosTercero.length > 0) {
						$(".btnGuardar").attr("disabled", false);
						resp.datosTercero.forEach((element) => {
							if (element.EsCliente != null) {
								$tipoDocumento = "EsCliente";
							} else if (element.EsProveedor != null) {
								$tipoDocumento = "EsProveedor";
							} else if (element.EsEmpleado != null) {
								$tipoDocumento = "EsEmpleado";
							}
							$accionId = element.Accionid;
							$Tipo = element.Tipo;
							actualizarSelect(
								".tipodocuId",
								element.tipodocuid,
								element.nombre
							);
							$(".tipoTercero").val($tipoDocumento).trigger("chosen:updated");
							actualizarSelect(
								".estadocivilid",
								element.estadocivilid,
								element.estadocivilid
							);
							actualizarSelect(".sexo", element.sexo, element.sexo);
							actualizarSelect(
								".ciudanacim",
								element.ciudanacim,
								element.ciudanacimNombre
							);
							actualizarSelect(
								".paisTercero",
								element.paisid,
								element.paisidNombre
							);
							actualizarSelect(
								".dptoTercero",
								element.dptoid,
								element.dptoNombre
							);
							actualizarSelect(
								".ciudadTercero",
								element.ciudadid,
								element.ciudadidNombre
							);
							actualizarSelect(
								".barrioTercero",
								element.barrioid,
								element.barrioidNombre
							);
							actualizarSelect(
								".zonaTercero",
								element.zonaid,
								element.zonaidNombre
							);
							actualizarSelect(
								".profesionTercero",
								element.profesionid,
								element.profesionidNombre
							);
							$(".digitverif").val(element.digitverif);
							$(".razonsocia").val(element.razonsocia);
							$(".nombreTercero").val(
								element.nombruno +
									" " +
									element.nombrdos +
									" " +
									element.apelluno +
									" " +
									element.apelldos
							);
							$(".nombruno").val(element.nombruno);
							$(".nombrdos").val(element.nombrdos);
							$(".apelluno").val(element.apelluno);
							$(".apelldos").val(element.apelldos);
							$(".email").val(element.email);
							$(".email2").val(element.email2);
							$(".celular").val(element.celular);
							$(".numercredi").val(element.numercredi);
							$(".fechanacim").val(element.fechanacim);
							$(".direccion").val(element.direccion);
							$(".telefono").val(element.telefono);
							$(".ocupacion").val(element.ocupacion);
							$(".hijos").val(element.hijos);
							$(".foto").val(element.foto);

							if (element.tipodocuid == "31") {
								$("[data-db=digitverif]")
									.focusin()
									.val(calcularDigitoVerificacion(cedula))
									.focusout();
								$("[data-db=nombre]")
									.focusin()
									.val($("[data-db=razonsocia]").val())
									.focusout();
							} else {
								$("[data-db=digitverif]").focusin().val("").focusout();
								$("[data-db=nombre]")
									.focusin()
									.val(
										$("[data-db=nombruno]").val() +
											" " +
											$("[data-db=nombrdos]").val() +
											" " +
											$("[data-db=apelluno]").val() +
											" " +
											$("[data-db=apelldos]").val()
									)
									.focusout();
								$("#h2Cliente").text(
									$("[data-db=nombruno]").val() +
										" " +
										$("[data-db=nombrdos]").val() +
										" " +
										$("[data-db=apelluno]").val() +
										" " +
										$("[data-db=apelldos]").val()
								);
							}
							$(".tipodocuId").change();

							if (element.foto !== "" && element.foto !== null) {
								$("[data-imagen=foto]")
									.closest(".imagen-container")
									.find(".img-perfil")
									.attr("src", element.foto);
							} else {
								$("[data-imagen=foto]")
									.closest(".imagen-container")
									.find(".img-perfil")
									.attr("src", base_url() + "assets/images/user/nofoto.png");
							}
							$(".btnGuardar").attr("disabled", true);
						});

						$(".FormularioTercero input, select, .btnFoto, .subir-foto")
							.not(".TerceroID")
							.prop("disabled", false);
						$(".chosen-select").trigger("chosen:updated");
						data = recorrerDatosObjetosTercero(formulario);
					} else {
						// $(".modalConsultarCrear").modal("show");
						data = { ...estructura };

						$(".FormularioTercero :input").removeClass("is-invalid");
						$(".FormularioTercero input,select, .btnFoto, .subir-foto")
							.not(".TerceroID")
							.prop("disabled", false);
						$(".chosen-select").trigger("chosen:updated");
						$("[data-imagen=foto]")
							.closest(".imagen-container")
							.find(".img-perfil")
							.attr("src", base_url() + "assets/images/user/nofoto.png");
					}
				},
			});
		};

		//esta funcion es para actualizar los select cuando cargamos un tercero.
		const actualizarSelect = (selectId, idselect, nombreselect) => {
			$(selectId).val(idselect).change().trigger("chosen:updated");
		};

		const calcularDigitoVerificacion = (myNit) => {
			var vpri, x, y, z;

			myNit = myNit.replace(/\s/g, ""); // Espacios

			myNit = myNit.replace(/,/g, ""); // Comas

			myNit = myNit.replace(/\./g, ""); // Puntos

			myNit = myNit.replace(/-/g, ""); // Guiones

			if (isNaN(myNit)) {
				console.log("El nit/cédula '" + myNit + "' no es válido(a).");

				return "";
			}

			vpri = new Array(16);

			z = myNit.length;

			vpri[1] = 3;

			vpri[2] = 7;

			vpri[3] = 13;

			vpri[4] = 17;

			vpri[5] = 19;

			vpri[6] = 23;

			vpri[7] = 29;

			vpri[8] = 37;

			vpri[9] = 41;

			vpri[10] = 43;

			vpri[11] = 47;

			vpri[12] = 53;

			vpri[13] = 59;

			vpri[14] = 67;

			vpri[15] = 71;

			x = 0;
			y = 0;

			for (var i = 0; i < z; i++) {
				y = myNit.substr(i, 1);
				x += y * vpri[z - i];
			}

			y = x % 11;

			return y > 1 ? 11 - y : y;
		};

		const obtenerCambios = (objetoOriginal, objetoModificado) => {
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
		};

		const modalFoto = (inputFoto) => {
			if (inputFoto == "TerceroID") {
				lastModal = null;
			} else {
				lastModal = "modalBeneficiario";
			}
			let validaDocumento = $("." + inputFoto).val();

			if (validaDocumento != "") {
				$(".modalFoto").modal("show");
				/*
					Tomar una fotografía y guardarla en un archivo v3
					@date 2018-10-22
					@author parzibyte
					@web parzibyte.me/blog
				*/
				const tieneSoporteUserMedia = () =>
					!!(
						navigator.getUserMedia ||
						navigator.mozGetUserMedia ||
						navigator.mediaDevices.getUserMedia ||
						navigator.webkitGetUserMedia ||
						navigator.msGetUserMedia
					);
				const _getUserMedia = (...arguments) =>
					(
						navigator.getUserMedia ||
						navigator.mozGetUserMedia ||
						navigator.mediaDevices.getUserMedia ||
						navigator.webkitGetUserMedia ||
						navigator.msGetUserMedia
					).apply(navigator, arguments);

				// Declaramos elementos del DOM
				const $video = document.querySelector("#video"),
					$canvas = document.querySelector("#canvas"),
					$estado = document.querySelector("#estado"),
					$boton = document.querySelector(".btnFotoModal"),
					$listaDeDispositivos = document.querySelector("#listaDeDispositivos");

				const limpiarSelect = () => {
					for (let x = $listaDeDispositivos.options.length - 1; x >= 0; x--)
						$listaDeDispositivos.remove(x);
				};
				const obtenerDispositivos = () =>
					navigator.mediaDevices.enumerateDevices();

				// La función que es llamada después de que ya se dieron los permisos
				// Lo que hace es llenar el select con los dispositivos obtenidos
				const llenarSelectConDispositivosDisponibles = () => {
					limpiarSelect();
					obtenerDispositivos().then((dispositivos) => {
						const dispositivosDeVideo = [];
						dispositivos.forEach((dispositivo) => {
							const tipo = dispositivo.kind;
							if (tipo === "videoinput") {
								dispositivosDeVideo.push(dispositivo);
							}
						});

						// Vemos si encontramos algún dispositivo, y en caso de que si, entonces llamamos a la función
						if (dispositivosDeVideo.length > 0) {
							// Llenar el select
							dispositivosDeVideo.forEach((dispositivo) => {
								const option = document.createElement("option");
								option.value = dispositivo.deviceId;
								option.text = dispositivo.label;
								$listaDeDispositivos.appendChild(option);
							});
						}
					});
				};

				(function () {
					// Comenzamos viendo si tiene soporte, si no, nos detenemos
					if (!tieneSoporteUserMedia()) {
						alert("Lo siento. Tu navegador no soporta esta característica");
						$estado.innerHTML =
							"Parece que tu navegador no soporta esta característica. Intenta actualizarlo.";
						return;
					}
					//Aquí guardaremos el stream globalmente
					let stream;

					// Comenzamos pidiendo los dispositivos
					obtenerDispositivos().then((dispositivos) => {
						// Vamos a filtrarlos y guardar aquí los de vídeo
						const dispositivosDeVideo = [];

						// Recorrer y filtrar
						dispositivos.forEach(function (dispositivo) {
							const tipo = dispositivo.kind;
							if (tipo === "videoinput") {
								dispositivosDeVideo.push(dispositivo);
							}
						});

						// Vemos si encontramos algún dispositivo, y en caso de que si, entonces llamamos a la función
						// y le pasamos el id de dispositivo
						if (dispositivosDeVideo.length > 0) {
							// Mostrar stream con el ID del primer dispositivo, luego el usuario puede cambiar
							mostrarStream(dispositivosDeVideo[0].deviceId);
						}
					});

					const mostrarStream = (idDeDispositivo) => {
						_getUserMedia(
							{
								video: {
									// Justo aquí indicamos cuál dispositivo usar
									deviceId: idDeDispositivo,
								},
							},
							(streamObtenido) => {
								// Aquí ya tenemos permisos, ahora sí llenamos el select,
								// pues si no, no nos daría el nombre de los dispositivos
								llenarSelectConDispositivosDisponibles();

								// Escuchar cuando seleccionen otra opción y entonces llamar a esta función
								$listaDeDispositivos.onchange = () => {
									// Detener el stream
									if (stream) {
										stream.getTracks().forEach(function (track) {
											track.stop();
										});
									}
									// Mostrar el nuevo stream con el dispositivo seleccionado
									mostrarStream($listaDeDispositivos.value);
								};

								// Simple asignación
								stream = streamObtenido;

								// Mandamos el stream de la cámara al elemento de vídeo
								$video.srcObject = stream;
								$video.play();

								//Escuchar el click del botón para tomar la foto
								//Escuchar el click del botón para tomar la foto
								$($boton)
									.unbind()
									.on("click", function () {
										//Pausar reproducción
										$video.pause();

										//Obtener contexto del canvas y dibujar sobre él
										let contexto = $canvas.getContext("2d");
										$canvas.width = $video.videoWidth;
										$canvas.height = $video.videoHeight;
										contexto.drawImage(
											$video,
											0,
											0,
											$canvas.width,
											$canvas.height
										);

										let foto = $canvas.toDataURL(); //Esta es la foto, en base 64
										$(".imagen-container")
											.find(".img-perfil")
											.attr("src", foto);
										//Reanudar reproducción
										$video.play();
										$(".modalFoto").modal("hide");
									});
							},
							(error) => {
								console.log("Permiso denegado o error: ", error);
								$estado.innerHTML =
									"No se puede acceder a la cámara, o no diste permiso.";
							}
						);
					};
				})();
			} else {
				if (inputFotob == "TerceroID") {
					alertify.error("No hay un cliente cargado");
				} else {
					alertify.error("No hay un beneficiario cargado");
				}
			}
		};

		// PROCEDIMIENTOS

		RastreoIngresoModulo("Formulario Tercero");
		if (TerceroIdCargado != "") {
			$(".TerceroID").val(TerceroIdCargado);
			$(".TerceroID").trigger("change").attr('disabled',true);
			$("body").css("overflow", "hidden");
		}
		$(".FormularioTercero input,select")
			.not(".TerceroID")
			.prop("disabled", true);
		$(".chosen-select").trigger("chosen:updated");

		$(".celular").inputmask({
			alias: "numeric",
			min: 0,
			max: 100,
			greedy: false,
			rightAlign: false,
		});

		$(".datepicker").datetimepicker({
			format: "YYYY-MM-DD",
			sideBySide: true,
			locale: "es",
		});

		$(".chosen-select").chosen({ no_results_text: "No se encontraron datos" });

		if (modulo == 'modalClientes') {
			$('.EstadoCivildiv, .generoDiv, .TarjetaDiv, .fechaNaciDiv, .ciudNaciDiv, .label-razonsocia, .razonSocialDiv, .email2Div, .TipoTerceroDiv').css('display','none');
			$('.fechanacim').removeClass('valida');
			if (exigeD == 'S') {
				$('.email, .direccion, .paisTercero, .dptoTercero, .ciudadTercero, .telefono').addClass('valida');
				const span = $('<span>').text('* ').addClass('text-danger');
				$(".labelTerceroExigeDatos").prepend(span);
			}else{
				$('.email, .direccion, .paisTercero, .dptoTercero, .ciudadTercero, .telefono').removeClass('valida');
				span= $('.emailSinDatos')[0]
				console.log($('.emailSinDatosspan'));
				span.removeChild($('.emailSinDatosspan')[0]);
			}
		}
	});
}
