var language = {
	lengthMenu: "Mostrar _MENU_ registros por página.",
	zeroRecords: "No se ha encontrado ningún registro.",
	emptyTable: "Ningún dato disponible en esta tabla",
	info: "Mostrando _START_ a _END_ de _TOTAL_ entradas.",
	infoEmpty: "Registros no disponibles.",
	search: "",
	searchPlaceholder: "Buscar",
	loadingRecords: "Cargando...",
	processing: "Procesando...",
	paginate: {
		first: "Primero",
		last: "Último",
		next: "Siguiente",
		previous: "Anterior",
	},
	buttons: {
		pageLength: {
			_: "Mostrar %d registros",
			"-1": "Mostrar todo",
		},
		colvis: "Visibilidad Columnas",
		copy: "Copiar",
		csv: "CVS",
		excel: "Excel",
		pdf: "PDF",
		print: "Imprimir",
	},
	infoFiltered: "(_MAX_ Registros filtrados en total)",
};

//ASUP 01/03/2021 - Variables de datatables
var domBftrip =
	"<'row no-gutters pt-1 px-1 dataTablesFiltros'<'col-sm-12 col-md-6 mb-2 mb-md-0'B><'col-sm-12 col-md-6'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>";
var domBftri =
	"<'row no-gutters pt-1 px-1 dataTablesFiltros'<'col-sm-12 col-md-6 mb-2 mb-md-0'B><'col-sm-12 col-md-6'f>><'row'<'col-sm-12'tr>><'row'<'col-12'i>>";
var domBftr =
	"<'row no-gutters pt-1 px-1 dataTablesFiltros'<'col-sm-12 col-md-6 mb-2 mb-md-0'B><'col-sm-12 col-md-6'f>><'row'<'col-sm-12'tr>>";
var domlftrip =
	"<'row no-gutters pt-1 px-1 dataTablesFiltros'<'col-sm-6'l><'col-sm-6'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>";
var domlBftrip =
	"<'row no-gutters pt-1 px-1 dataTablesFiltros'<'col-sm-12'l><'col-sm-6'B><'col-sm-6'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>";
var domftrip =
	"<'row no-gutters pt-1 px-1 dataTablesFiltros'<'col-sm-12'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>";
var domftri =
	"<'row no-gutters pt-1 px-1 dataTablesFiltros'<'col-sm-12'f>><'row'<'col-sm-12'tr>><'row'<'col-12'i>>";
var domtri =
	"<'row no-gutters pt-1 px-1'><'row'<'col-sm-12'tr>><'row'<'col-12'i>>";

//Cargue por defecto de la datatable
$.extend(true, $.fn.dataTable.defaults, {
	processing: true,
	language,
	pageLength: 25,
	deferRender: true,
	dom: domBftrip,
	search: {
		return: true,
	},
	lengthMenu: [
		[10, 25, 50, -1],
		["10", "25", "50", "Todos"],
	],
	initComplete: function (settings, json) {
		let table = "#" + settings.sTableId;
		$(`${table}_filter input`).trigger("focus");

		$(`div${table}_filter input`).unbind();
		$(`div${table}_filter input`)
			.keyup(function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find(table).dataTable();
				}
			})
			.change(function (e) {
				e.preventDefault();
				table = $("body").find(table).dataTable();
				table.fnFilter(this.value);
			});

		setTimeout(() => {
			$(window).trigger("resize");
		}, 100);
	},
	buttons: [
		{
			extend: "copy",
			className: "copyButton",
			text: "Copiar",
			exportOptions: { columns: ":visible:not(.noExport)" },
		},
		{
			extend: "excel",
			action: newExportAction,
			text: "Excel",
			exportOptions: { columns: ":visible:not(.noExport)" },
		},
		{
			extend: "pdf",
			className: "pdfButton",
			tex: "PDF",
			exportOptions: { columns: ":visible:not(.noExport)" },
		},
		{
			extend: "print",
			className: "printButton",
			text: "Imprimir",
			exportOptions: { columns: ":visible:not(.noExport)" },
		},
	],
});

function buttonsDT(options, btnAdicional = []) {
	let btns = [];
	let botones = {
		copy: {
			extend: "copy",
			className: "copyButton",
			text: "Copiar",
			exportOptions: { columns: ":visible:not(.noExport)" },
		},
		csv: {
			extend: "csv",
			className: "csvButton",
			text: "CSV",
			exportOptions: { columns: ":visible:not(.noExport)" },
		},
		excel: {
			extend: "excel",
			action: newExportAction,
			text: "Excel",
			exportOptions: { columns: ":visible:not(.noExport)" },
		},
		pdf: {
			extend: "pdf",
			className: "pdfButton",
			text: "PDF",
			pageSize: "letter",
			exportOptions: { columns: ":visible:not(.noExport)" },
		},
		print: {
			extend: "print",
			action: newExportAction,
			className: "printButton",
			text: "Imprimir",
			pageSize: "letter",
			exportOptions: { columns: ":visible:not(.noExport)" },
		},
		pageLength: { extend: "pageLength" },
		colvis: { extend: "colvis" },
	};

	options.forEach((it) => {
		btns.push(botones[it]);
	});

	btnAdicional.forEach((btnAdd) => {
		btns.push(btnAdd);
	});

	return btns;
}

// 01/08/2018 JCSM - Datatable Server Side Full
function dtSS($parametros) {
	try {
		var $tblID = $parametros.data.tblID;
	} catch (e) {
		console.error("No hay tblID definida");
		return false;
	}
	var settings = {
		processing: true,
		serverSide: true,
		order: [],
		draw: 25,
		language,
		pageLength: 25,
		deferRender: true,
		ajax: {
			url: base_url() + "DataTables/dtSS/",
			type: "POST",
			data: {
				select: JSON.stringify($parametros.data.select),
				table: JSON.stringify($parametros.data.table),
				column_order: JSON.stringify($parametros.data.column_order),
				column_search: JSON.stringify($parametros.data.column_search),
				orden: $parametros.data.orden,
				columnas: JSON.stringify($parametros.data.columnas),
				group_by: JSON.stringify($parametros.data.group_by),
				having: JSON.stringify($parametros.data.having),
				or_where: JSON.stringify($parametros.data.or_where),
				where_in: JSON.stringify($parametros.data.where_in),
			},
		},
		initComplete: function (settings, json) {
			var self = this;
			$(this)
				.closest(".dataTables_wrapper")
				.find("div.dataTables_filter input")
				.attr("type", "text")
				.unbind()
				.keyup(function (e) {
					e.preventDefault();
					if (e.keyCode == 13) {
						table = $("body").find($tblID).dataTable();
						// table.fnFilter(this.value);
						self.fnFilter(this.value);
					}
				});
			setTimeout(() => {
				$("div.dataTables_filter input").select();
			}, 1000);
		},
		lengthMenu: [
			[10, 25, 50, -1],
			["10", "25", "50", "Todos"],
		],
		dom: "<'row'<'col-md-6'l><'col-md-6'f>><'row'<'col-md-12't>><'row'<'col-md-6'Bi><'col-md-6'p>>r",
		buttons: [
			{ extend: "copy", className: "copyButton", text: "Copiar" },
			{ extend: "csv", className: "csvButton", text: "CSV" },
			//{ extend: 'excel', className: 'excelButton', text: 'Excel' },
			{ extend: "excel", action: newExportAction, text: "Excel" },
			{ extend: "pdf", className: "pdfButton", tex: "PDF" },
			{ extend: "print", className: "printButton", text: "Imprimir" },
		],
	};
	delete $parametros["data"];
	for (var attrname in $parametros) {
		settings[attrname] = $parametros[attrname];
		delete $parametros[attrname];
	}
	settings = Object.assign(settings, $parametros);
	var dt = $($tblID).DataTable(settings);
	return dt;
}

var oldExportAction = function (self, e, dt, button, config) {
	if (button[0].className.indexOf("buttons-excel") >= 0) {
		if ($.fn.dataTable.ext.buttons.excelHtml5.available(dt, config)) {
			$.fn.dataTable.ext.buttons.excelHtml5.action.call(
				self,
				e,
				dt,
				button,
				config
			);
		} else {
			$.fn.dataTable.ext.buttons.excelFlash.action.call(
				self,
				e,
				dt,
				button,
				config
			);
		}
	} else if (button[0].className.indexOf("buttons-print") >= 0) {
		$.fn.dataTable.ext.buttons.print.action(e, dt, button, config);
	}
};

var newExportAction = function (e, dt, button, config) {
	var self = this;
	var oldStart = dt.settings()[0]._iDisplayStart;

	dt.one("preXhr", function (e, s, data) {
		// Just this once, load all data from the server...
		data.start = 0;
		//data.length = 2147483647;
		data.length = -1;

		dt.one("preDraw", function (e, settings) {
			// Call the original action function
			oldExportAction(self, e, dt, button, config);

			dt.one("preXhr", function (e, s, data) {
				// DataTables thinks the first item displayed is index 0, but we're not drawing that.
				// Set the property to what it was before exporting.
				settings._iDisplayStart = oldStart;
				data.start = oldStart;
			});

			// Reload the grid with the original page. Otherwise, API functions like table.cell(this) don't work properly.
			setTimeout(dt.ajax.reload, 0);

			// Prevent rendering of the full data to the DOM
			return false;
		});
	});

	// Requery the server with the new one-time export settings
	dt.ajax.reload();
};

var graficarAction = function (e, dt, button, config) {
	var self = this;

	var oldStart = dt.settings()[0]._iDisplayStart;
	dt.one("preXhr", function (e, s, data) {
		// Just this once, load all data from the server...
		data.start = 0;
		//data.length = 2147483647;
		data.length = -1;

		dt.one("preDraw", function (e, settings) {
			newGraficarAction(e, dt, button, config);
			//oldExportAction(self, e, dt, button, config);
			dt.one("preXhr", function (e, s, data) {
				// DataTables thinks the first item displayed is index 0, but we're not drawing that.
				// Set the property to what it was before exporting.
				settings._iDisplayStart = oldStart;
				data.start = oldStart;
			});

			// Reload the grid with the original page. Otherwise, API functions like table.cell(this) don't work properly.
			setTimeout(dt.ajax.reload, 0);

			// Prevent rendering of the full data to the DOM
			return false;
		});
	});
	// Requery the server with the new one-time export settings
	dt.ajax.reload();
};

var newGraficarAction = function newGraficarAction(e, dt, button, config) {
	var optData = "",
		optValue = "";
	for (var i = 0; i < config.columnas.data.length; i++) {
		optData +=
			"<option selected value='" +
			config.columnas.data[i] +
			"'>" +
			dt.column(config.columnas.data[i]).header().innerHTML +
			"</option>";
	}
	for (var i = 0; i < config.columnas.value.length; i++) {
		optValue +=
			"<option value='" +
			config.columnas.value[i] +
			"'>" +
			dt.column(config.columnas.value[i]).header().innerHTML +
			"</option>";
	}

	var graficaData = dt.columns([config.columnas.data[0]]).data().toArray();

	var graficarInformacion = dt.columns(config.columnas.data).data().toArray();
	//var newArray = graficarInformacion[0].map(function(e,i){return[e,graficarInformacion[1][i]]});

	var newArray;
	var graficaValue = dt.columns([config.columnas.value[0]]).data().toArray();

	//var graficarInformacion = dt.columns([config.columnas.data[0],config.columnas.value[0]]).data().toArray();
	//var newArray = graficarInformacion[0].map(function(e,i){return[e,graficarInformacion[1][i]]});
	var colores = [];

	for (var i = 0; i < graficaData[0].length; i++) {
		colores.push(colorRGB());
	}

	alertify.cAlert().set({
		onshow: function () {
			$(".modal").addClass("hidden");

			$("#cInfo").change(function () {
				graficarInformacion = dt.columns($(this).val()).data().toArray();
				$("#cType").change();
			});

			$("#cValor").change(function () {
				graficaValue = dt
					.columns([$(this).val()])
					.data()
					.toArray();
				$("#cType").change();
			});

			$(".bImg").click(function (e) {
				e.preventDefault();
				var winPrint = window.open("", "_blank");
				if (winPrint != null) {
					winPrint.document.write(
						"<a id='img' href='" +
							cAlertify.toDataURL("image/png") +
							"' download='grafica.png'><img src='" +
							cAlertify.toDataURL("image/png") +
							"'/></a>"
					);
					winPrint.focus();
					winPrint.document.getElementById("img").click();
				}
			});

			$("#cType").change(function () {
				if (graficarInformacion.length > 1) {
					for (var j = 0; j < graficarInformacion.length - 1; j++) {
						if (j == 0) {
							newArray = graficarInformacion[j].map(function (e, i) {
								return [e, graficarInformacion[j + 1][i]];
							});
						} else {
							newArray = newArray.map(function (e, i) {
								return e.concat(graficarInformacion[j + 1][i]);
							});
						}
					}
				} else {
					newArray = graficarInformacion[0];
				}

				$(".chartjs-hidden-iframe, #cAlertify").remove();
				$("#cDiv").append("<canvas id='cAlertify'></canvas>");
				var cAlertify = document.getElementById("cAlertify");
				var cConfig = {
					type: $("#cType").val(),
					data: {
						labels: newArray,
						datasets: [
							{
								label: $("#cValor").find("option:selected").text(),
								data: graficaValue[0],
								backgroundColor: colores,
								borderColor: colores,
								borderWidth: 0,
							},
						],
					},
					options: {
						responsive: true,
						legend: {
							display: true,
							position: "top",
						},
						tooltips: {
							callbacks: {
								label: function (tooltipItem, data) {
									var valor = data.datasets[0].data[tooltipItem.index];
									return (
										data.datasets[0].label +
										": " +
										Number(valor)
											.toFixed(2)
											.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
									);
								},
								/*title: function(tooltipItem, data){
									//return 'hola';
									//return tooltipItem[0];
									//return data['datasets'][0]['data'][tooltipItem['index']];
									return data.datasets[0].data[tooltipItem.index];
								}*/
							},
						},
					},
				};
				switch ($("#cType").val()) {
					case "line":
						delete cConfig.data.datasets[0].backgroundColor;
						cConfig.data.datasets[0].borderColor = colorRGB();
						cConfig.data.datasets[0].fill = false;
						cConfig.options.elements = {
							line: {
								tension: 0,
								fill: false,
							},
						};
						cConfig.options.scales = {
							yAxes: [
								{
									ticks: {
										callback: function (valor, index, valores) {
											return Number(valor)
												.toFixed(2)
												.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
										},
									},
								},
							],
						};
						break;
					case "bar":
						cConfig.options.scales = {
							yAxes: [
								{
									ticks: {
										callback: function (valor, index, valores) {
											return Number(valor)
												.toFixed(2)
												.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
										},
									},
								},
							],
						};
						break;
					case "horizontalBar":
						break;
					case "radar":
						delete cConfig.data.datasets[0].backgroundColor;
						cConfig.data.datasets[0].borderColor = colorRGB();
						cConfig.data.datasets[0].fill = false;
						break;
					case "pie":
						break;
				}
				chart = new Chart(cAlertify, cConfig);
			});

			$("#cType").change();
		},
	});

	alertify.cAlert().set({
		onclose: function () {
			chart.destroy();
			alertify.cAlert().set({ onshow: null });
			$(".modal").removeClass("hidden");
			$(".ajs-modal").unbind();
			delete alertify.ajaxAlert;
		},
	});

	$(".ajs-content").css("display", "flex");

	alertify.cAlert(
		"<div class='col-sm-12' style='margin-top:5px;'> \
		<div class='row'> \
			<div class='col-sm-6'> \
				<div class='row'> \
					<div class='col-sm-6'> \
						<label style='float:right;'>Información&nbsp;:</label> \
						<button class='btn-sm btn btn-primary bImg' style='width:100%;'>Guardar Imágen</button> \
					</div> \
					<div class='col-sm-6'> \
						<select multiple class='form-control input-sm form-group' id='cInfo' style='width:100%;display:block;'>" +
			optData +
			"</select> \
					</div> \
				</div> \
			</div> \
			<div class='col-sm-6'> \
				<div class='row'> \
					<div class='col-sm-3'> \
						<label style='float:right;'>Valores&nbsp;:</label> \
					</div> \
					<div class='col-sm-9'> \
						<select class='form-control input-sm form-group' id='cValor' style='width:100%;display:block;'>" +
			optValue +
			"</select> \
					</div> \
					<div class='col-sm-3'> \
						<label style='float:right;'>Gráfica&nbsp;:</label> \
					</div> \
					<div class='col-sm-9'> \
						<select class='form-control input-sm form-group' id='cType' style='width:100%;display:block;'> \
							<option value='line'>Lineal</option> \
							<option value='bar'>Barras Verticales</option> \
							<option value='horizontalBar'>Barras Horizontales</option> \
							<option value='radar'>Radar</option> \
							<option value='doughnut'>Dona</option> \
							<option value='pie'>Tarta</option> \
							<option value='polarArea'>Area Polar</option> \
						</select> \
					</div> \
				</div> \
			</div> \
		</div> \
			<div style='min-height: 250px;' id='cDiv'> \
				<canvas id='cAlertify'></canvas> \
			</div> \
		</div> \
	"
	);
};

var chart;

function colorRGB() {
	var num = Math.round(0xffffff * Math.random());
	var r = num >> 16;
	var g = (num >> 8) & 255;
	var b = num & 255;
	var c = 1 >> 9;
	var A = 0.5;
	return "rgba(" + r + ", " + 47 + ", " + b + ", " + A + ")";
	return colorRGB;
}

alertify.cAlert ||
	alertify.dialog("cAlert", function factory() {
		return {
			main: function (content) {
				this.setContent(content);
			},
			setup: function () {
				return {
					options: {
						basic: true,
						maximizable: true,
						resizable: false,
						padding: false,
					},
				};
			},
		};
	});
