let tblObservaciones;
let cabecera = ["nombredepen", "nombreUsu", "Fecha", "Observacion"];
let vaGlobal;
let nroEvento = null;

var modalTemp =
	$(`<div id="modalPlaneadorCuerpos" data-keyboard="false" data-backdrop="static" class="modal fade" tabindex="-1"
role="dialog" aria-labelledby="modalPlaneadorCuerpos" aria-hidden="true">
<div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
        <div class="modal-header headerWebClub">
            <h5 class="modal-title">
                <i class="fas fa-align-center"></i>
                Gestor de actividades
            </h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="color: #fff;opacity:1;"><span aria-hidden="true">×</span></button>
        </div>
        <div class="modal-body p-3 m-0">
        </div>
    </div>
</div>
</div>`).on("hide.bs.modal", function () {
		$(".modal-body").empty();
	});

$(document.activeElement).append(modalTemp);

function cargarTabla(datoEvento) {
	if (tblObservaciones) {
		tblObservaciones.destroy();
	}
	tblObservaciones = dataTable(datoEvento);
	tblObservaciones = dtSS(tblObservaciones);
}

function dataTable(datoEvento) {
	return {
		data: {
			tblID: "#tblObservaciones",
			select: [
				"EO.ObservacionId",
				"EV.Nombre",
				"EO.Observacion",
				"S.nombre AS nomUsu",
				"EO.Tipo",
				"EO.Fecha",
				"S.nombre AS nombreUsu",
				"DP.Nombre AS nombredepen"
			],
			table: [
				"EventoObservacion EO",
				[
					["Evento EV", "EO.EventoId = EV.EventoId", "LEFT"],
					["Segur S", "S.usuarioId = EO.UsuarioId", "LEFT"],
					["Dependencia DP", "S.DependenciaId = DP.DependenciaId", "LEFT"],
				],
				[["EO.EventoId = " + datoEvento]],
			],
			column_order: ["nombredepen", "nombreUsu", "Fecha"],
			column_search: ["DP.Nombre", "S.nombre", "EO.Observacion", "EO.Fecha"],
			columnas: cabecera,
			orden: {
				Fecha: "ASC",
			},
		},
		language: $.Constantes.lenguajeTabla,
		processing: true,
		serverSide: true,
		order: [],
		draw: 10,
		columnDefs: [{
			"visible": false,
			"targets": 3
		}],
		fixedColumns: true,
		pageLength: 10,
		buttons: [
			{
				extend: "copy",
				className: "copyButton",
				text: "Copiar",
				exportOptions: { columns: ":not(:first-child)" },
				title: "Web_Club",
			},
			{
				extend: "csv",
				className: "csvButton",
				text: "CSV",
				exportOptions: { columns: ":not(:first-child)" },
				title: "Web_Club",
			},
			{
				extend: "excel",	
				action: newExportAction,
				text: "Excel",
				exportOptions: { columns: ":not(:first-child)" },
				title: "Web_Club",
			},
			{
				extend: "pdf",
				className: "pdfButton",
				tex: "PDF",
				exportOptions: { columns: ":not(:first-child)" },
				title: "Web_Club",
			},
			{
				extend: "print",
				className: "printButton",
				text: "Imprimir",
				exportOptions: { columns: ":not(:first-child)", title: "Web_Club" },
			},
		],
		dom: "Bfrtp",
		initComplete: function (settings, json) {
			$("div.dataTables_filter input").unbind();
			$("div.dataTables_filter input").keyup(function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find("#tblObservaciones").dataTable();
					table.fnFilter(this.value);
				}
			});
			$("div.dataTables_filter input").focus();
		},
		createdRow: function (row, data, dataIndex){
			setTimeout(() => {
				$(row).after(`<tr style="background-color: rgba(70, 128, 255, 0.03);">
								<td colspan="3">
								<div">
									<h6> OBSERVACIONES </h6>
									<p> ${data[3]} </p>
							
								</div>
								</td>
							</tr>`)
			}, 500);

		}
	};
}

function mostrarModalPlaneadorCuerpos(datoEvento) {
	vaGlobal = datoEvento;
	//agregamos el archivo HTML a el contenido del modal, consultamos por el id del evento los cuerpos de este, y consultamos los vendedores
	$.ajax({
		url: rutaGeneral + "cargarDatosPlaneador",
		type: "POST",
		data: {
			datoEvento,
		},
		dataType: "json",
		success: function (respuesta) {
			nroEvento = respuesta.nroEvento;
			//insertamos el html y actualizamos el chosen
			$(".modal-body").html(respuesta.cargueHtml);
			cargarTabla(datoEvento);
			$("#vendedoresEvento").empty();
			respuesta.vendedores.forEach((it) => {
				$("#vendedoresEvento").append(
					`<option value="${it.vendedorid}">${it.nombre}</option>`
				);
			});
			respuesta.MeseroId.forEach((mesero) => {
				$("#vendedoresEvento").find("option[value='"+mesero.MeseroId+"']").prop('selected',true);
			});
			$("#vendedoresEvento").trigger("chosen:updated");
			$(".chosen-select").chosen({ width: "100%" });
			//insertamos una nueva sesión html con los resueltados de los cuerpos
			let i = 1;
			Object.keys(respuesta.cuerpos).forEach((it) => {
				const dependencia = respuesta.cuerpos[it];
				const inConTrim = it.replace(/\s/g, "");

				if (inConTrim != "" || inConTrim.length !== 0) {
					$(".divCuerpos")
						.append(`<table id="tabla${inConTrim}" class="table table-bordered table-condensed nowrap" cellspacing="0" style="margin-bottom: 8px;"">
												<tbody>
													<tr>
														<td class="headTabla" colspan="2" style="vertical-align: middle; padding-left: 20px;">
															<div class="d-flex justify-content-between">
																<div>
																	<span class="fas fa-users-cog fa-lg"></span>
																	<label class="ml-2" style="font-size: larger; ">${it}</label>
																</div>
																<div class="d-flex justify-content-end">
																	<div class="vertical-line"></div>
																	<span  type="button" class="align-self-center fas fa-arrow-circle-down fa-lg mx-2 collapsed" data-toggle="collapse" data-target="#${inConTrim}"  aria-expanded="true" ></span>
																</div>
															</div>
														</td>
													</tr>
													<tr>
														<td>
															<div id="${inConTrim}" data-depenvoid="void" class="collapse show">
																
															</div>
														</td>
													</tr>
											</tbody>
											</table>
										`);
				}
				dependencia.map((it) => {
					let nombreConTrim;
					if (it.nombreDependencia != null) {
						nombreConTrim = it.nombreDependencia.replace(/\s/g, "");
					} else {
						nombreConTrim = 0;
					}
					const valorPorcentaje =
						it.Porcentaje == null
							? 0
							: isNaN(parseInt(it.Porcentaje))
							? 0
							: parseInt(it.Porcentaje);
					const cuerpitos = $(`<tr class="filasCuerpos${it.DependenciaId + it.CuerpoId}">
											<td  colspan="2" class="headTabla2">
												<h6 style="margin: 0px; padding-left: 5px;"> ${it.nombreCuerpo} <span type="button"  class=" botonModaltext${i} botonDesc fas fa-info-circle fa-lg"></span></h6>  
											</td>
											<td style="display: contents;" class="pl-1">
											<div class="form-group mb-0  pl-1 pr-1">
												<input class="form-control form-control-floating porcentajesC align-text-center" data-actividadCuerpo = "${it.DependenciaId+"-"+it.CuerpoId}" data-validPorcen disabled ${it.actividades != undefined ? "data-cantAtividades =" + it.actividades.length +" " + "data-cuerpoActivi =" + it.CuerpoId: "" }  data-cuerpoId="${it.CuerpoId}" data-cuerpo="${it.EventoCuerpoId}" value="${it.actividades != undefined ? valorPorcentaje : 100}" name="ProgresoCuerpo" placeholder="ProgresoCuerpo" style="font-weight: bold;"/> 
												<label for="ProgresoCuerpo" class='floating-label'>Progreso</label>
											</div>
											</td>
										</tr>`).on("click", ".botonModaltext" + i, function (e) {
						e.preventDefault();
							alertify.alert("Descripción del cuerpo", it.Texto);
					});

					i++;
					if (nombreConTrim != 0) {
						$("#" + nombreConTrim).append(cuerpitos);
					} else {
						$('[data-depenvoid="void"]').append(cuerpitos);
					}
					barraProgresoAct = 0;
					if(it.actividades != undefined){
						if(it.actividades.length > 0 || it.actividades != null){

							it.actividades.forEach(element => {
								
								const valorPorcentaje =
								element.Porcentaje == null
									? 0
									: isNaN(parseInt(element.Porcentaje))
									? 0
									: parseInt(element.Porcentaje);

								const actividades = $(`<tr >
														<td  colspan="2" class="headTabla2" style="background-color: white !important;">
															<h6 style="margin: 0px;"> <p> ${element.Actividad} </p></h6>  
														</td>
														<td style="display: contents;" class="pl-1">
														<div class="form-group mb-0  pl-1 pr-1">
															<input class="form-control form-control-floating porcentajesC align-text-center" data-cuerpoActividad = "${it.DependenciaId+"-"+it.CuerpoId}" data-actividadId="${element.ActividadId}" value="${valorPorcentaje}" name="ProgresoCuerpo" placeholder="ProgresoCuerpo"/> 
															<label for="ProgresoCuerpo" class='floating-label'>Progreso</label>
														</div>
														</td>
													</tr>`);
									$('.filasCuerpos'+it.DependenciaId+it.CuerpoId).after(actividades);
							})
						}
					}

					$(".porcentajesC").each(function () {
						$(this)
							.unbind()
							.inputmask("remove")
							.inputmask({
								alias: "numeric",
								min: 0,
								max: 100,
								greedy: false,
								rightalign: false,
								suffix: " %",
								allowMinus: false,
							})
							.on("input", function () {
								var value = parseInt($(this).val(), 10);
								if (isNaN(value) || value < 0) {
									$(this).val(0);
								} else if (value > 100) {
									$(this).val(100);
								}
							})
							.on("focus", function () {
								$(this).select();
							});
					});
				});
			});
			if (!respuesta.ValidUsuario) {
				$("#vendedoresEvento").attr("disabled", true).trigger("chosen:updated");
				$("#vendedoresEvento").attr("readonly", true).trigger("chosen:updated");
			}
			const divProgreso = $(`<div class="row">
									<div class="col-12 seccionProgreso" style="padding-bottom: 20px;">
										<div
											class="row mx-0 my-0 p-0"
											style="justify-content: space-between"
										>
											<label for="ProgresoTotal" class="mb-1">
												<b>Total Progreso</b></label
											>
											<p id="porcentajeBar" style="text-align: end; width: 20%; font-size: 1.5em; margin: 0px"></p>
										</div>

										<div class="progress" style="height: 20px">
											<div
												id="barraProgreso"
												class="progress-bar progress-bar-striped progress-bar-animated"
												role="progressbar"
												id="ProgresoTotal"
												aria-valuemin="0"
												aria-valuemax="100"
											></div>
										</div>
									</div>
									<div class="col-12 d-flex" style="justify-content: space-between;padding-top: 10px;padding-right: 6px;padding-left: 6px;">
										<div class="col-12" style="margin: 0px;padding: 6px;padding-bottom: 20px;">
											<div class="form-group mb-0">
												<textarea maxlength="9000" type="text" id="ObservacionCuerpos" class="form-control form-control-floating border" name="ObservacionCuerpos" row="1"  style="overflow-y: hidden"></textarea>
												<label for="ObservacionCuerpos" id="labelObser" class="floating-label" style="padding: 0px; margin: 0px">
													Observaciones Generales</label>
											</div>
										</div>
									</div>
									<div class="modal-footer col-12" style="margin: opx;padding: 0px;padding-top: 6px;">
										<div>
											<button type="button" id="registrarAvance" disabled class="btn btn-success">Registrar</button>
											<input type="text" id="idEvento" value="${datoEvento}" hidden>
											<input type="text" id="nombreEvento" value="${respuesta.nombreEvento}" hidden>
										</div>
									</div>
								</div>`);
			$(".divProgreso").append(divProgreso);
			if (respuesta.cuerpos.length == 0) {
				$(".seccionProgreso").addClass("d-none");
			}else{
				validaBarraPorcentaje();
			}
		},
	});
	$("#modalPlaneadorCuerpos").modal("show");
}

function validaBarraPorcentaje (){
	//actividades
	let conteoCuerpos = {}
	let sumatoriActivida = {};
	let conteoActividad = {};
	let validarActividadesPor = [];
	let validaCuerposPor = [];
	let sumatoriaPorcentaje = [];
	let cuerposActividad = $('[data-cuerpoActividad]');
	let actividadCuerpo = $('[data-cantAtividades]');

	//---------------------------------------------------------------------------
	//Obtenemos el resultado de las actividades por cada cuerpo
	Object.values(cuerposActividad).forEach((it) => {
		if (it.tagName === "INPUT") {
			validarActividadesPor.push([it.getAttribute("data-cuerpoActividad"), parseInt(it.value)]);
		}
	});

	Object.values(actividadCuerpo).forEach((it) => {
		if (it.tagName === "INPUT") {
			validaCuerposPor.push([it.getAttribute("data-cuerpoId")]);
		}
	});
	
	validarActividadesPor.forEach(element => {
		const clave = element[0];
		const valor = element[1];

		if(sumatoriActivida.hasOwnProperty(clave)){
			sumatoriActivida[clave] += valor;
			conteoActividad[clave] += 1;
		}else{
			sumatoriActivida[clave] = valor;
			conteoActividad[clave] = 1;
		}
	});

	const resultado ={};
	for(const clave in conteoActividad){
		if(sumatoriActivida.hasOwnProperty(clave)){
			resultado[clave] = sumatoriActivida[clave] / conteoActividad[clave];
		}
	}

	//contamos la cantidad de cuerpos que tienen el mismo cuerpoid y tienen actividades
	validaCuerposPor.forEach(it => {
		if(!conteoCuerpos[it[0]]){ 
			conteoCuerpos[it[0]] = 1;
		}else{
			conteoCuerpos[it[0]] += 1;
		}
	})

	//insertamos el porcentaje del resultado de las actividades a su cuerpo correspontiente
	for(const valor in resultado){
		$('[data-actividadCuerpo='+ valor +']').val(resultado[valor]);
	}

	Object.values(actividadCuerpo).forEach((it) => {
		if (it.tagName === "INPUT") {
			for(const valor in conteoCuerpos){
				if(valor == it.getAttribute("data-cuerpoId")){
					it.value = (parseInt(it.value) / conteoCuerpos[valor]).toFixed(1);
				}
			}
		}
	});

	Object.values(actividadCuerpo).forEach((it) => {
		if (it.tagName === "INPUT") {
			sumatoriaPorcentaje.push([it.getAttribute("data-cuerpoId") , parseInt(it.value)] );
		}
	});

	sumatotal = {};
	sumatoriaPorcentaje.forEach(it => {
		if(!sumatotal[it[0]]){ 
			sumatotal[it[0]] = it[1];
		}else{
			sumatotal[it[0]] += it[1];
		}
	})

	for(const valor in sumatotal){
		$('[data-cuerpoActivi='+ valor +']').val(sumatotal[valor] == 99 ? 100 : sumatotal[valor] );
	}

	//-------------------------------------------------------------------------------------------
	//cuerpos principales
	let barraProgreso = 0;
	elementos = $("[data-validPorcen]");
	Object.values(elementos).forEach((it) => {
		if (it.tagName === "INPUT") {
			barraProgreso += parseInt(it.value);
		}
	});

	barraProgreso2 = (barraProgreso / elementos.length).toFixed(0);
	barraProgreso = (barraProgreso / elementos.length).toFixed(1);

	$("#barraProgreso").attr("area-valuenow", barraProgreso);
	$("#barraProgreso").css("width", barraProgreso + "%");
	$("#barraProgreso").css("line-height", "5px");
	$(".progress-bar-animated").css(
		"-webkit-animation",
		"progress-bar-stripes 2s linear infinite"
	);
	$("#barraProgreso")
		.removeClass("bg-danger")
		.removeClass("bg-warning")
		.removeClass("bg-success");

	if (barraProgreso >= 0 && barraProgreso <= 33) {
		$("#barraProgreso").addClass("bg-danger");
		$("#porcentajeBar").html("<b>" + barraProgreso2 + "%</b>").css("color", "red");
		$("#porcentajeBar").attr('data-porcen' , barraProgreso2);
	} else if (barraProgreso > 33 && barraProgreso < 66) {
		$("#barraProgreso").addClass("bg-warning");
		$("#barraProgreso").css("line-height", "20px");
		$("#porcentajeBar").html("<b>" + barraProgreso2 + "%</b>").css("color", "#ffba57");
		$("#porcentajeBar").attr('data-porcen' , barraProgreso2);
	} else if (barraProgreso >= 66) {
		$("#barraProgreso").addClass("bg-success");
		$("#porcentajeBar").html("<b>" + barraProgreso2 + "%</b>").css("color", "green");
		$("#porcentajeBar").attr('data-porcen' , barraProgreso2);
	}
}

$(document).on("click", "#registrarAvance", function (e) {
	e.preventDefault();
	let validarAvance = [];
	let validarActividades =[];
	let valoresAvance = {};
	MeseroId = $("#vendedoresEvento").val();
	idEvento = $("#idEvento").val();
	nombreEvento = $("#nombreEvento").val();
	valObservacion = $("#ObservacionCuerpos").val();
	pocentajeTotal = $('#porcentajeBar').attr('data-porcen') === undefined ? '' : $('#porcentajeBar').attr('data-porcen');

	//----------------------------------------------------------
	elementos = $("[data-cantAtividades]");
	Object.values(elementos).forEach((it) => {
		if (it.tagName === "INPUT") {
			validarAvance.push([it.getAttribute("data-cuerpo"), parseInt(it.value)]);
		}
	});

	validarAvance.forEach(it => {
		valoresAvance[it[0]] = it[1];
	})

	resultado = [];
	for(const valor in valoresAvance){
		resultado.push([valor, valoresAvance[valor]]);
	}

	//---------------------------------------------------------------
	elementosActividades = $("[data-actividadId]");
	Object.values(elementosActividades).forEach((it) => {
		if (it.tagName === "INPUT") {
			validarActividades.push([it.getAttribute("data-actividadId"), parseInt(it.value)]);
		}
	});
	//--------------------------------------------------------------

	$.ajax({
		url: rutaGeneral + "registrarAvance",
		type: "POST",
		data: {
			resultado,
			MeseroId,
			idEvento,
			valObservacion,
			validarActividades,
			nombreEvento,
			nroEvento,
			pocentajeTotal
		},
		dataType: "json",
		success: function (respuesta) {
			if (respuesta) {
				$(".modal-body").empty();
				mostrarModalPlaneadorCuerpos(vaGlobal);
				alertify.success("Se registraron los datos correctamente");
				tblObservaciones.ajax.reload();
				$("#ObservacionCuerpos").val("");
			}
		},
	});
	tblEventos.ajax.reload();
});

$(document).change("#Cuerpos-tab", function (e) {
	if (e.target.id != "buscar1") { 
		$("#registrarAvance").attr("disabled", false);
	} 
});


$(document).on('change focusout', '[data-actividadid]', function(){
	validaBarraPorcentaje();
})