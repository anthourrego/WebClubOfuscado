

let cargaInicial = 0;
let $video;

$(function () {
	//no se puede eliminar este algoritmo por nada del mundo, esto reordena los grupos de los formularios
	$("[data-formulario]").each(function(){
		const grupoinicial = parseInt($(this).find("[data-grupo]:not([data-grupohijo])").data("grupo"));
		if(! isNaN(grupoinicial)) {
			$(this).find("[data-grupo]:not([data-grupohijo])").each(function(){
			const grupo = parseInt($(this).data("grupo"));
			$(this).attr("data-grupo", grupo - grupoinicial);
			});
		}
	});

	if($ParamVisualizar !== 'V' || $ParamVisualizar !== 'V'){
		fechaActual = new Date();
		const formatoFecha = fechaActual.toISOString().substring(0, 10);
		$('.FechaSolicitud').val(formatoFecha);
	}

	if ($ParamVisualizar === 'V') {
		cargarTabla();
	}

	// Muestra modal de inicio si el usuario tiene borrador
	if ($ParamVisualizar !== 'V' ) {
		$('#modalSolicitudId').modal('show');
	};

	$('#btnBuscarSolicitudAspirante').on('click', function (e) {
		e.preventDefault();
		const validaciones = [];
		$('.fvalidaCodigo').removeClass("is-invalid");
		$('.fvalidaCodigo').each(function () {
			if ($(this).val() === '') {
				validaciones.push('');
				$(this).addClass("is-invalid");
			}
		});
		if (validaciones.length <= 0) {
			$.ajax({
				url: `${base_url()}Formulario/buscarSolicitudBorrador`,
				type: "POST",
				dataType: "json",
				data: {
					numero: $('#numeroSolicitud').val(), 
					codigo: $('#codigoSolicitud').val(),
					tipoAspiranteId: $TipoAspirante
				},
				success: function (resp) {
					if (resp.success) {
						alertify.success(resp.mensaje);
						$ParamVisualizar = 'BO';
						$Numero = resp.data;
						cargarSolicitudAspirante(resp.data);
						cargarTabla();
					} else {
						alertify.error(resp.mensaje);
					}
				},
			});
			
		} else {
			alertify.error('Ingresar los valores requeridos');
		}

	});

	$('#cancelarModalInicial').on('click', function (e) {
		e.preventDefault();
		cargarTabla();
	})

	$('#agregaConyugeSolicitudAspirante').on('change', function (e) {
		if (e.currentTarget.checked) {
			$('.formConyuge').css('display', 'block');
		} else {
			$('.formConyuge').css('display', 'none');
		}
	})

	formulario = $(".Solicitud").find(".componentTercero");
	tipoTerceroCargado = "";
	formulario
		.on("change", "[data-formulario] .TerceroID", function () {
			dataformulario = $(this)
				.closest("[data-formulario]")
				.attr("data-formulario");
			imagenInicial = $(
				"[data-formulario=" + dataformulario + "]" + ".img-perfil"
			).attr("src");
			cedula = $(
				"[data-formulario=" + dataformulario + "]" + " .TerceroID"
			).val();
			if ($ParamVisualizar !== 'V' && $ParamVisualizar === 'BO' && cargaInicial <= 1) {
				cargaInicial ++;
			} else if ($ParamVisualizar !== 'V') {
				$documentoPrincipal = $("[data-formulario='SocioPrincipal'] [data-name='terceroid']").val();
				$documentoAcompana = $("[data-formulario='SocioAcompana'] [data-name='terceroid']").val();
				if ($documentoPrincipal === $documentoAcompana) {
					alertify.error('No puede ingresar el mismo documento');
					return;
				};
				cargaInicial ++;
				cargarTercero(cedula, dataformulario);
			}
			if (tipoTerceroCargado != "") {
				setTimeout(() => {
					$("[data-formulario=" + dataformulario + "]" + ".tipoTercero")
						.val(tipoTerceroCargado)
						.prop("disabled", true)
						.trigger("chosen:updated");
				}, 350);
			}
		})
		.on("change", "[data-formulario] .inputFoto", function () {
			const input = this;
			if (input.files && input.files[0]) {
				var reader = new FileReader();
				reader.onload = function (e) {
					var background = e.target.result;
					// aqui se valida que la imagen venga de una edicion

					$(input)
						.closest(".imagen-container")
						.find(".img-perfil")
						.attr("src", background)
						
					$(input).data('data','0');
				};
				reader.readAsDataURL(input.files[0]);
			}
		})
		.on("click", "[data-formulario] .subir-foto", function (e) {
			e.preventDefault();
			dataformulario = $(this)
				.closest("[data-formulario]")
				.attr("data-formulario");
			param = "inputFoto";
			$("[data-formulario=" + dataformulario + "]" + " ." + param).click();

			$("[data-formulario=" + dataformulario + "]" + " ." + param).on('change', function(e){
				$("[data-formulario=" + dataformulario + "] .img-perfil").attr("data-cambio", '0');
			});

		})
		.on("click", "[data-formulario] .btnFoto", function (e) {
			e.preventDefault();
			inputFoto = "TerceroID";
			dataformulario = $(this)
				.closest("[data-formulario]")
				.attr("data-formulario");
			modalFoto(inputFoto, dataformulario);
		})
		.on("click", ".btnCancelar", function (e) {
			e.preventDefault();
			window.location.href = `${base_url()}Administrativos/SolicitudSocio/SolicitudesAR`;
		})
		.on("change", "[data-formulario] input", function (e) {
			e.preventDefault();
			dataformulario = $(this)
				.closest("[data-formulario]")
				.attr("data-formulario");
			$(".btnGuardar").attr("disabled", false);
			
			$("[data-formulario=" + dataformulario + "] .NombreTercero").val(
				$(
					"[data-formulario=" + dataformulario + "] [data-db=nombruno]"
				).val() +
					" " +
					$(
						"[data-formulario=" + dataformulario + "] [data-db=nombrdos]"
					).val() +
					" " +
					$(
						"[data-formulario=" + dataformulario + "] [data-db=apelluno]"
					).val() +
					" " +
					$(
						"[data-formulario=" + dataformulario + "] [data-db=apelldos]"
					).val()
			);
			if ($("[data-formulario=" + dataformulario + "] .NombreTercero").val().length > 100) {
				$("[data-formulario=" + dataformulario + "] .NombreTercero").val($("[data-formulario=" + dataformulario + "] .NombreTercero").val().slice(0,100))
			}

			$("[data-formulario=presentacion1] [data-name=nombre],[data-formulario=presentacion2] [data-name=nombre]").val(
				$("[data-formulario=SocioPrincipal] [data-name=nombre]").val()
			);

			$("[data-formulario=presentacion1] [data-name=nombreConyuge],[data-formulario=presentacion2] [data-name=nombreConyuge]").val(
				$("[data-formulario=SocioAcompana] [data-name=nombre]").val()
			);
			
		})
		.on("change", "[data-formulario] .dptoTercero", function () {
			dataformulario = $(this)
				.closest("[data-formulario]")
				.attr("data-formulario");
			$.ajax({
				url: `${base_url()}Formulario/cargarCiudades/${$nit}`,
				type: "POST",
				async: false,
				dataType: "json",
				data: {
					dpto: $(this).val(),
				},
				success: function (resp) {
					if ($ParamVisualizar !== 'V') {
						$("[data-formulario=" + dataformulario + "] [data-db=ciudadid]").empty();
						resp.forEach((element) => {
							$("[data-formulario=" + dataformulario + "] [data-db=ciudadid]").append(
								`<option value="${element.ciudadid}">${element.nombre}</option>`
							);
						});
	
						$("[data-formulario=" + dataformulario + "] [data-db=ciudadid]").trigger("chosen:updated");
					}
				},
			})
		})
		.on("change", "[data-presentacion]", function (e) {
			e.preventDefault();
			presentacion  = $(this).data('presentacion');
			$(`[data-formulario=${presentacion}] [data-db=${$(this).data('db')}]`).val($(this).val());
		})
		.on("click", "[data-formulario] .subir-foto-firma", function (e) {
			e.preventDefault();
			dataformulario = $(this)
				.closest("[data-formulario]")
				.attr("data-formulario");
			param = "inputFirma";
			$("[data-formulario=" + dataformulario + "]" + " ." + param).click();
		})
		.on('change', '[data-formulario] .inputFirma', function (e) {
			const input = this;
			if (input.files && input.files[0]) {
				var reader = new FileReader();
				reader.onload = function (e) {
					var background = e.target.result;
					// aqui se valida que la imagen venga de una edicion

					$(input)
						.closest(".imagen-container")
						.find(".img-firma")
						.attr("src", background);
				};
				reader.readAsDataURL(input.files[0]);
			}
		})
		.on("change","[data-formulario] .inputFileTabla, [data-formulario] [data-grupohijo], [data-formulario] .valida", function (e) {
			e.preventDefault();
			dataformulario = $(this).closest("[data-formulario]").attr("data-formulario");
			
			$(this).css("border-bottom", "");

			// $(this).removeClass("is-invalid");

			var caracteresEspecialesPattern = /^[^\w\d\s.-]*[\w\d\s-]+(\.[\w\d\s-]+)?[^\w\d\s.-]*$/;
			var mensaje = '';
			var archivoValido = false;
			const tamanoMaximo = 2 * 1024 * 1024;

			if ($(this)[0].files !== null && $(this)[0].files !== undefined) {
				if ($(this)[0].files[0].size <= 0) {
					mensaje = 'El archivo no puede estar vacio';
				} else if ($(this)[0].files[0].size >= tamanoMaximo) {
					mensaje = 'El tamaño archivo excede los 2Mb';
				} else if (!caracteresEspecialesPattern.test($(this)[0].files[0].name)) {
					mensaje = 'El nombre del archivo no puede tener caracteres especiales';
				} else {
					mensaje = 'Archivo valido';
					archivoValido = true;
				}

				if (archivoValido) {
					alertify.success(mensaje);
				} else {
					alertify.error(mensaje);
					$(this).val(null);
					let id = e.currentTarget.id.split("-")[1];
					$(`#spanIputFile${id}`).text('Seleccione un archivo');
				}
			}

			validarInputTablaAdjunto();
			validarGrupos();
		});


		$("#modalFotoFormTerceroCerrar").on("click",  function (e) {
			e.preventDefault();
			$(".modalFoto").modal("hide");cesar
		})
		
	if ($Numero > 0) {
		setTimeout(() => {
			cargarSolicitudAspirante($Numero);
		}, 0);
	}

	$(".datepicker").datetimepicker({
		dateFormat:"YYYY-MM-DD",
		format: "YYYY-MM-DD",
		sideBySide: true,
		locale: "es",
	});

	$(".validafecha").on('blur',function(e){
		var inputValue = $(this).val();
		if(!isValidDate(inputValue)){
			alertify.error("Valide la información del campo, fecha no valida.");
			$(this).val('');
		}
	});

	function isValidDate(dateString) {
		var regxFecha = moment(dateString,'YYYY-MM-DD',true);
		// var regxFecha = /^\d{4}-\d{2}-\d{2}$/;
		// var dateObject = Date.parse(dateString);
		return regxFecha.isValid();
	}
	
	$(".datepicker").on('click',function(e){
		e.preventDefault();
	});

	$('[data-formulario] .btnDescargarCartaPresentacion').on('click', function (e) {
		e.preventDefault();
		let informacion = {
			nombre : '',
			nombreConyuge : '',
			nombreHijoUno : '',
			nombreHijoDos : '',
			nombreHijoTres : '',
			nombreHijoCuatro : '',
			tiempoConoce : '', 
			relacionesFamilia : '',
			claseNegocio : '',
			tiempoViveCiudad : '',
			conceptoConyuge : '',
			conceptoHijos : '',
			sociosConocen : ''
		};

		$(this).closest("[data-formulario]:visible")
			.find(".inputPresentacion")
			.each(function () {
				informacion[$(this).attr('data-name')] = $(this).val();
				if ($(this).attr('data-name') === 'tieneNegocio') {
					informacion[$(this).attr('data-name')] = $(this).find('option:selected').text();
				}
			});

		$.ajax({
			url: `${base_url()}Formulario/cartaPresentacion/${$nit}`,
			type: "POST",
			data: {
				info : informacion,
			},
			success: (resp) => {
				var ventimp = window.open();
				ventimp.document.write(resp);
				setTimeout(() => {
					ventimp.print();
					ventimp.close();
				}, 500)
			},
		})
	});

	$(".btnGuardar").click(function (e) {
		e.preventDefault();
		$('#modalFinalizarSolicitud').modal('show');
	});

	$('#btnGuardarBorradorSolicitudAspirante').on('click', function (e) {
		e.preventDefault();
		$('#modalFinalizarSolicitud').modal('hide');
		$(".valida").removeClass("is-invalid");
		const infoBasica = [];
		$('.fInfoBorrador:visible').each(function () {
			var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
			if ($(this).attr('data-name') === 'email' && !emailPattern.test($(this).val())) {
				$(this).addClass("is-invalid");
				infoBasica.push($(this).val());
				alertify.error('El correo ingresado no es valido');
				$('#modalFinalizarSolicitud').modal('hide');
				return;
			};
			if ($(this).val() === '') {
				$(this).addClass("is-invalid");
				infoBasica.push($(this).val());
			}
		});
		if (infoBasica.length <= 0) {
			enviarFormulario('BO');

		} else {
			alertify.error('Debe diligenciar los datos obligatorios del formulario.');
			$('#modalFinalizarSolicitud').modal('hide');
		}
	});

	$("#btnEnviarSolicitudAspirante").click(function (e) {
		e.preventDefault();
		$('#modalFinalizarSolicitud').modal('hide');
		var exepcionAdjunto = validarInputTablaAdjunto();
		var exepcion = 0;

		var exepcionGrupos = validarGrupos();
		// validacion para que todos los campos requeridos se completen
		$(".valida").css("border-bottom", "");

		$(".valida").removeClass("is-invalid");
		$(".valida:visible").each(function () {
			if ($(this).val() == "" || $(this).val() == null) {
				$(this).css("border-bottom", "1px solid red");
				// $(this).addClass("is-invalid");
				exepcion = 1;
			}
		});

		if (exepcion == 0 && exepcionAdjunto == 0 && exepcionGrupos.length == 0) {
			enviarFormulario('PE');
		} else {
			if (exepcionAdjunto == 1) {
				alertify.error("Valide la información de los adjuntos requeridos.");
			}
			alertify.error("Valide la información de los campos obligatorios.");
		}
	});

	const validarInputTablaAdjunto = () => {
		exepcion = 0;
		$(".inputFileTabla").each(function () {
			if ($ParamVisualizar === 'BO') {
				if (!$(this).val() && $(this).attr("required") === "required" && !$(this).data('requisitoagregado')) {
					$(this).closest("div").find("span").css("border", "1px solid red");
					exepcion = 1;
				} else {
					$(this).closest("div").find("span").css("border", "");
				}
			} else {
				if (!$(this).val() && $(this).attr("required") === "required") {
					$(this).closest("div").find("span").css("border", "1px solid red");
					exepcion = 1;
				} else {
					$(this).closest("div").find("span").css("border", "");
				}
			}
		});
		return exepcion;
	};

	const recorrerDatosObjetosTercero = (formTercero) => {
		const data = {};
		const rutaFoto = $(".img-perfil");
		$(formTercero)
			.find("[data-formulario]").not(':hidden')
			.each(function () {
				const nombreFormulario = $(this).attr("data-formulario");
				if (!data[nombreFormulario]) {
					data[nombreFormulario] = {};
				}
				data[nombreFormulario] = {};
				$(this)
					.find("[data-tabla]")
					.each(function () {
						const tabla = $(this).data("tabla");
						let valor;

						if (!data[nombreFormulario][tabla]) {
							data[nombreFormulario][tabla] = {};
						}

						const nombre = $(this).data("name");
						valor = $(this).val() != "" ? $(this).val() : null;

						// if (nombre == "foto") {
						// 	valor = rutaFoto.attr("src");
						// }

						if (nombre != undefined && nombre != "foto") {
							if (
								tabla == "ReferenciaAspirante" ||
								tabla == "AspiranteSocioHijos"
							) {
								if (valor) {
									if (!data[nombreFormulario][tabla]) {
										data[nombreFormulario][tabla] = [];
									}
									const grupo = parseInt($(this).attr('data-grupo'));
									if (!data[nombreFormulario][tabla][grupo]) {
										data[nombreFormulario][tabla][grupo] = {};
									}
									data[nombreFormulario][tabla][grupo][nombre] = valor;
								}
							} else {
								data[nombreFormulario][tabla][nombre] = valor;
							}
						}
					});
			});
		return data;
	};

	const enviarFormulario = (estado = 'BO') => {
		let dataCopia = recorrerDatosObjetosTercero(formulario);
		var jsonString = JSON.stringify(dataCopia);
		var formData = new FormData();
		formData.append("json_data", jsonString);
		formData.append("TipoAspirante", $TipoAspirante);
    	formData.append("estado", estado);
    	formData.append("ruta", base_url() + "Formulario/Solicitud/" + $nit + "/" + $TipoAspirante);
    
		formData.append("Numero", $('#numeroSolicitud').val() ? $('#numeroSolicitud').val() : 0);

		$("[data-formulario] .img-perfil").each(function () {
			let foto = $(this).attr('src');
			 if($(this).attr('data-cambio') == 1 && foto != "" ){
				var block = foto.split(";");
				var contentType = block[0].split(":")[1];
				var realData = block[1].split(',')[1];
				var blob = b64toBlob(realData,contentType);
				const nombre =
					$(this).closest("[data-formulario]").attr("data-formulario") +
					"_foto";
				formData.append(nombre, blob);
			 }
		});
	


		$("input[type=file].inputFoto").each(function () {
			if ($(this)[0].files.length > 0) {
				const nombre =
					$(this).closest("[data-formulario]").attr("data-formulario") +
					"_foto";
				formData.append(nombre, $(this)[0].files[0]);
			}
		});

		adjuntoRequisitos = [];
		indiceFirma = 0;
		$("input[type=file].inputFileTabla, input[type=file].inputFirma").each(function (indice) {
			if ($(this)[0].files.length > 0) {
				Tipos = $(this).data("tipo");
				if (Tipos === 'FR') {
					fileName = `${$(this).data("nombre")}_${indiceFirma}`;
					indiceFirma ++;
				} else {
					fileName = Tipos + "_" + indice;
				}
				formData.append(fileName, $(this)[0].files[0]);

				adjuntoRequisitos.push({
					tipo: Tipos,
					requerido: $(this).data("requerido"),
					nombre: $(this).data("nombre"),
					fileName: fileName,
					requisitoAgregado: $(this).data('requisitoagregado'),
					requisitoid: $(this).data("requisitoid"), //tener presente para saber si el usuario cambio archivos
				});
			}
		});

		formData.append("adjuntoRequisitos", JSON.stringify(adjuntoRequisitos));

		$.ajax({
			url: `${base_url()}Formulario/GuardarSolicitud/${$nit}`,
			type: "POST",
			dataType: "json",
			data: formData,
			processData: false,
			contentType: false,
			success: function (resp) {
				if (!resp.valido) {
					alertify.error(resp.mensaje);
				} else {
					alertify.success(resp.mensaje);
					setTimeout(() => {
						location.reload();
					}, 1000);
				}
			},
		});
	}

	const modalFoto = (inputFoto, dataformulario) => {
		if (inputFoto == "TerceroID") {
			lastModal = null;
		}
		let validaDocumento = $(
			"[data-formulario=" + dataformulario + "]" + " ." + inputFoto
		).val();

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
									
									$("[data-formulario=" + dataformulario + "] [data-imagen=foto]")
									.closest(".imagen-container")
									.find(".img-perfil")
									.attr("src", foto);

									$("[data-formulario=" + dataformulario + "] .img-perfil")
									.attr("data-cambio", '1');

									//Reanudar reproducción
									// $video.play();
									detenerCamara();
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

				const detenerCamara = () => {
					if($video.srcObject){
						var tracks = $video.srcObject.getTracks();
						tracks.forEach(function(track){
							track.stop();
						});
					}
				}
			})();
		} else {
			if (inputFoto == "TerceroID") {
				alertify.error("No hay un cliente cargado");
			} else {
				alertify.error("No hay un beneficiario cargado");
			}
		}
	};



	const cargarTercero = (cedula, dataformulario) => {
		$.ajax({
			url: `${base_url()}Formulario/cargarTercero/${$nit}`,
			type: "POST",
			dataType: "json",
			data: {
				codigo: cedula,
				TipoAspirante : $TipoAspirante,
				RASTREO: RASTREO("Carga Tercero " + cedula, "Terceros"),
			},
			success: function (resp) {
				$terceroSocio = resp;
				if (resp.datosTercero.length > 0) {
					$(".btnGuardar").attr("disabled", false);
					// resp.datosTercero.forEach((element) => {
					llenarFormularios(dataformulario, resp.datosTercero[0]);
					// });

					data = recorrerDatosObjetosTercero(formulario);
				} else {
					$("[data-formulario=" + dataformulario + "] :input").css("border-bottom", "d");

					$("[data-formulario="+ dataformulario +"] input, [data-formulario="+ dataformulario +"] select, [data-formulario="+ dataformulario +"] .inputPresentacion")
					.not("[data-formulario="+ dataformulario +"] .TerceroID")
					.not("[data-formulario="+ dataformulario +"] [data-db=tipo]")
					.not("[data-formulario="+ dataformulario +"] [data-tipo]")
					.not("[data-formulario="+ dataformulario +"] [data-db=FechaSolicitud]")
					
					.val('')
					.trigger("chosen:udated");

					$(
						"[data-formulario=" +
							dataformulario +
							"] input, [data-formulario=" +
							dataformulario +
							"] select, [data-formulario=" +
							dataformulario +
							"] .btnFoto, [data-formulario=" +
							dataformulario +
							"] .subir-foto"
					).not("[data-formulario=" +
						dataformulario +
						"] .TerceroID , .FechaSolicitud")
						.prop("disabled", false);
					
					$("[data-formulario=" + dataformulario + "] [data-imagen=foto]")
						.closest(".imagen-container")
						.find(".img-perfil")
						.attr("src", base_url() + "assets/images/user/nofoto.png");

						
					$("[data-formulario=" + dataformulario + "] .img-perfil")
						.attr("data-cambio", '0');
				}
			},
		});
	};

	//esta funcion es para actualizar los select cuando cargamos un tercero.
	// const actualizarSelect = (selectId, idselect, nombreselect) => {
	// 	$(selectId).val(idselect).change().trigger("chosen:updated");
	// };

	const validarGrupos = () => {
		const arrFaltan = [];
		$("[data-grupohijo]").removeClass("is-invalid");
		$("[data-grupohijo]").each(function () {
			const grupohijo = $(this).data("grupohijo");
			if (!($(this).val() == "" || $(this).val() == null)) {
				$(`[data-grupohijo=${grupohijo}]`).each(function () {
					if ($(this).val() == "" || $(this).val() == null) {
						$(this).addClass("is-invalid");
						arrFaltan.push($(this));
					}

					///se llenan los hijos en la carta de presentación
					if (
						$(this).data("name") == "nombre" &&
						$(this).data("tabla") == "AspiranteSocioHijos"
					) {
						$(`[data-hijo=${grupohijo}]`).val($(this).val());
					}
				});
			}
		});

		return arrFaltan;
	};

	const cargarSolicitudAspirante = (Numero) => {
		$.ajax({
			url: `${base_url()}Formulario/cargarSolicitudAspirante/${$nit}`,
			type: "POST",
			dataType: "json",
			data: {
				Numero: Numero,
				RASTREO: RASTREO(
					"Carga Solicitud Aspirante " + Numero,
					"Solictid Aspirante"
				),
			},
			success: function (resp) {
				if (resp.HeadSolicitudAspirante[0].FechaSolicitud) {
					$(".FechaSolicitud").val(resp.HeadSolicitudAspirante[0].FechaSolicitud).prop('disabled',true);
				}	
				if (resp.cantidadAspirantes >= 2) {
					$('.formConyuge').css('display', 'block');
					$("[data-formulario]").each(function(){
						const grupoinicial = parseInt($(this).find("[data-grupo]:not([data-grupohijo])").data("grupo"));
						if(! isNaN(grupoinicial)) {
							$(this).find("[data-grupo]:not([data-grupohijo])").each(function(){
							const grupo = parseInt($(this).data("grupo"));
							$(this).attr("data-grupo", grupo - grupoinicial);
							});
						}
					});
				}
				Object.entries(resp).forEach(function ([key, values]) {		
					llenarFormularios(key, values);
				});
			},
		});
	};

	const llenarFormularios = (dataformulario, element) => {
		if (dataformulario === 'adjuntos') {
			$('.img-firma:visible').each(function (e) {
				if( element[e] !== undefined){
					let ruta = `${base_url()}Formulario/obtenerArchivo/${$nit}/SolicitudAspirante/${element[e].Adjunto}/${element[e].Numero}`;
					$(this).attr('src', ruta);
				}
			})
		}
		
		if ($ParamVisualizar !== 'V' && $ParamVisualizar !== 'BO' || cargaInicial > 1) { 
			Object.entries(element).forEach(function ([key, values]) {
					if (key == "foto") {
						if (values !== "" && values !== null) {
							$("[data-formulario=" + dataformulario + "] [data-imagen=foto]")
								.closest(".imagen-container")
								.find(".img-perfil")
								.attr("src", values);

							$("[data-formulario=" + dataformulario + "] .img-perfil")
								.attr("data-cambio", '1');
						} else {
							$("[data-formulario=" + dataformulario + "] [data-imagen=foto]")
								.closest(".imagen-container")
								.find(".img-perfil")
								.attr("src", base_url() + "assets/images/user/nofoto.png");
							$("[data-formulario=" + dataformulario + "] .img-perfil")
								.attr("data-cambio", '0');
						}
					}else{
						$(`[data-formulario=${dataformulario}]`)
							.find(
								`[data-db=${key}]:not([data-grupo])`
							)
							.val(values)
							.change()
							.trigger("chosen:updated");
					}
			});

		} else {
			Object.entries(element).forEach(function ([key, values]) {
				if (key == "AspiranteSocioHijos") {
					Object.entries(values).forEach(([key2, value2]) => {
						Object.entries(value2).forEach(([key3, value3]) => {
							$(`[data-formulario=${dataformulario}]`)
								.find(
									`[data-tabla=AspiranteSocioHijos][data-db=${key3}][data-grupohijo=${key2}]`
								)
								.val(value3)
								.change()
								.trigger("chosen:updated");
						});
					});
				} else if (key == "ReferenciaAspirante") {
					Object.entries(values).forEach(([key2, value2]) => {
						Object.entries(value2).forEach(([key3, value3]) => {
							$(`[data-formulario=${dataformulario}]`)
								.find(
									`[data-tabla=ReferenciaAspirante][data-tipo=${value2.tipo}][data-db=${key3}][data-grupo=${key2}]`
								)
								.val(value3)
								.change()
								.trigger("chosen:updated");
						});
					});
				} else {
					if (key == "AspiranteSocio") {
						tabla = "AspiranteSocio";
					} else {
						tabla = "AspiranteSocioHijos";
					}
	
					Object.entries(values).forEach(([key2, value2]) => {
						if (key2 == "foto") {
							if (value2 !== "" && value2 !== null) {
								$("[data-formulario=" + dataformulario + "] [data-imagen=foto]")
									.closest(".imagen-container")
									.find(".img-perfil")
									.attr("src", value2);
								$("[data-formulario=" + dataformulario + "] .img-perfil")
									.attr("data-cambio", '1');
							} else {
								$("[data-formulario=" + dataformulario + "] [data-imagen=foto]")
									.closest(".imagen-container")
									.find(".img-perfil")
									.data("cambio",0)
									.attr("src", base_url() + "assets/images/user/nofoto.png");
								$("[data-formulario=" + dataformulario + "] .img-perfil")
									.attr("data-cambio", '0');
							}
						} else {
							$(`[data-formulario=${dataformulario}]`)
								.find(`[data-db=${key2}][data-tabla=${tabla}]`)
								.val(value2)
								.change()
								.trigger("chosen:updated");
						}
					});
				}
			});

			$("[data-formulario=" + dataformulario + "] .NombreTercero").val(
				$("[data-formulario=" + dataformulario + "] [data-db=nombruno]").val() +
					" " +
					$("[data-formulario=" + dataformulario + "] [data-db=nombrdos]").val() +
					" " +
					$("[data-formulario=" + dataformulario + "] [data-db=apelluno]").val() +
					" " +
					$("[data-formulario=" + dataformulario + "] [data-db=apelldos]").val()
			);
			if ($("[data-formulario=" + dataformulario + "] .NombreTercero").val().length > 100) {
				$("[data-formulario=" + dataformulario + "] .NombreTercero").val($("[data-formulario=" + dataformulario + "] .NombreTercero").val().slice(0,100))
			}
	
			$("[data-formulario=Presentacion] [data-name=nombre]").val(
				$("[data-formulario=SocioPrincipal] [data-name=nombre]").val()
			);
			$("[data-formulario=Presentacion] [data-name=nombreConyuge]").val(
				$("[data-formulario=SocioAcompana] [data-name=nombre]").val()
			);

			$("[data-formulario=" + dataformulario + "] [data-name=chosen]-select").trigger("chosen:updated");
			if ($ParamVisualizar === 'V') {
				$("[data-formulario="+ dataformulario +"]  input, select, .btnFoto, .subir-foto").prop("disabled", true);
			} else {
				$("[data-formulario="+ dataformulario +"]  input, select, .btnFoto, .subir-foto").prop("disabled", false);
			}
			$(".FechaSolicitud").prop('disabled',true);
		}		
		$('#modalSolicitudId').modal('hide');
	};

	function cargarTabla() {
		$('#tablaRequisitos tbody').html('');
		$.ajax({
			url: `${base_url()}Formulario/tipoAspiranteRequisitos`,
			type: "POST",
			dataType: "json",
			async: false,
			data: {
				numeroSolicitud: $Numero, 
				tipoAspirante: $TipoAspirante,
				visualizacion: $ParamVisualizar
			},
			success: function (resp) {
				if ($ParamVisualizar === 'BO') {
					const columnaAdjuntoPrevio = '<th class="text-center">Archivo Previo</th>'
					$('#tablaRequisitos thead .archivoAdjunto').after(columnaAdjuntoPrevio);
				}
				resp.data.forEach(element => {
					let columnaAdjuntos = '';
					let columnaSubirAdjuntos = '';
					let columnaAdjuntosPrevios = '';
					if (element.Adjunto !== null) {
						extencion = element.Adjunto.split('.')[1];
						if (extencion == 'jpg' || extencion == 'jpeg' || extencion == 'png' || extencion == 'gif') {
							columnaAdjuntos = `<button type="button" class="btn btn-success btn-sm btnVerRequisito" id="${element.Adjunto}"><i class="fas fa-eye"></i></button>`;
						} else {
							columnaAdjuntos = `
								<a id="linkDownload-${element.Adjunto}" download="${element.NombreRequisito}">
									<button type="button" class="btn btn-info btn-sm btnDescargarRequisito" id="btnDownload-${element.Adjunto}" name="${element.NombreRequisito}">
										<i class="fas fa-download"></i>
									</button>
								</a>`
						}
					} else {
						columnaAdjuntos = 'No tiene archivo'
					};
					if ($ParamVisualizar !== 'V') {
						columnaSubirAdjuntos = `
							<div class="contenidoFile">
								${element.archivosAgregado !== null 
									? `<span id="spanIputFile${element.RequisitoId}" class="spanFile is-valid">${element.NombreRequisito}</span>`
									: `<span id="spanIputFile${element.RequisitoId}" class="spanFile">Seleccione un archivo</span>`
								}
								<label for="archivoDilifenciado-${element.RequisitoId}" class="btn btn-success btn-sm"><i class="fas fa-upload"></i></label>
								<input type="file" data-nombre="${element.NombreRequisito}" data-requerido="${element.Requerido}" data-tipo="${element.Tipo}" data-requisitoagregado="${element.requisitoAgregado}"  hidden class="inputFileTabla" id="archivoDilifenciado-${element.RequisitoId}" ${element.Requerido === 'S' ? 'required' : ''}>
							</div>`
					};
					if ($ParamVisualizar === 'BO') {
						if (element.archivosAgregado !== null) {
							extencion = element.archivosAgregado.split('.')[1];
							if (extencion == 'jpg' || extencion == 'jpeg' || extencion == 'png' || extencion == 'gif') {
								columnaAdjuntosPrevios = `<button type="button" class="btn btn-success btn-sm btnVerRequisitoPrevio" id="${element.archivosAgregado}"><i class="fas fa-eye"></i></button>`;
							} else {
								columnaAdjuntosPrevios = `
									<a id="linkDownload-${element.archivosAgregado}" download="${element.NombreRequisito}">
										<button type="button" class="btn btn-info btn-sm btnDescargarRequisitoPrevio" id="btnDownload-${element.archivosAgregado}" name="${element.NombreRequisito}">
											<i class="fas fa-download"></i>
										</button>
									</a>`
							}
						} else {
							columnaAdjuntosPrevios = 'No tiene archivo'
						};
					}
					let fila = `<tr>
									<th class="text-center">${element.NombreAspirante}</th>
									<th class="text-center">${element.NombreRequisito}</th>
									<th class="text-center">${element.NombreTipo}</th>
									<th class="text-center">${element.NombreRequerido}</th>
									<th class="text-center">${columnaAdjuntos}</th>
									${$ParamVisualizar === 'BO' ? `<th class="text-center">${columnaAdjuntosPrevios}</th>` : ''}
									${$ParamVisualizar !== 'V' ? `<th class="text-center">${columnaSubirAdjuntos}</th>` : ''}
								</tr>`

					$('#tablaRequisitos tbody').append(fila);
				});

				$(".btnVerRequisito").on("click", (e) => {
					e.preventDefault();
					let ruta = '';
					if ($ParamVisualizar === 'V') { 
						ruta = `${base_url()}Formulario/obtenerArchivo/${$nit}/SolicitudAspirante/${e.currentTarget.id}/${$Numero}`;
					} else {
						ruta = `${base_url()}Formulario/obtenerArchivoimg/${$nit}/RequisitosSolicitud/${e.currentTarget.id}`;
					}
				
					window.open(ruta);
				});
			
				$(".btnDescargarRequisito").on("click", (e) => {
					e.preventDefault();
					let nombreAdjunto = e.currentTarget.name;
					let adjunto = e.currentTarget.id.split("-")[1];
					let ruta = '';
					const link = document.getElementById(`linkDownload-${adjunto}`);
					if ($ParamVisualizar === 'V') {
						ruta = `${base_url()}Formulario/downloadArchivo/${$nit}/SolicitudAspirante/${adjunto}/${nombreAdjunto}/${$Numero}`;
					} else {
						ruta = `${base_url()}Formulario/downloadArchivo/${$nit}/RequisitosSolicitud/${adjunto}/${nombreAdjunto}/null`;
					}
					link.setAttribute("href", ruta);
					link.click();
				});
			
				$(".btnVerRequisitoPrevio").on("click", (e) => {
					e.preventDefault();
					let ruta = '';
					ruta = `${base_url()}Formulario/obtenerArchivo/${$nit}/SolicitudAspirante/${e.currentTarget.id}/${$Numero}`;	
					window.open(ruta);
				});
			
				$(".btnDescargarRequisitoPrevio").on("click", (e) => {
					e.preventDefault();
					let nombreAdjunto = e.currentTarget.name;
					let adjunto = e.currentTarget.id.split("-")[1];
					let ruta = '';
					const link = document.getElementById(`linkDownload-${adjunto}`);
					ruta = `${base_url()}Formulario/downloadArchivo/${$nit}/SolicitudAspirante/${adjunto}/${nombreAdjunto}/${$Numero}`;
					link.setAttribute("href", ruta);
					link.click();
				});

				$(".inputFileTabla").change((e) => {
					let id = e.currentTarget.id.split("-")[1];
					$(`#spanIputFile${id}`).text(e.target.files[0].name);
				});

			},
		});
	}

	function b64toBlob(b64Data, contentType, sliceSize) {
		contentType = contentType || '';
		sliceSize = sliceSize || 512;
	
		var byteCharacters = atob(b64Data);
		var byteArrays = [];
	
		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			var slice = byteCharacters.slice(offset, offset + sliceSize);
	
			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}
	
			var byteArray = new Uint8Array(byteNumbers);
	
			byteArrays.push(byteArray);
		}
	
		var blob = new Blob(byteArrays, { type: contentType });
		return blob;
	}
});
