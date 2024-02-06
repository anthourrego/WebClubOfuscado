var dtVariables;
$(document).ready(function () {
	RastreoIngresoModulo("Modifica Reporte");

	dtVariables = $("#tblVariables").DataTable({
		order: [],
		language: {
			lengthMenu: "Mostrar _MENU_ registros por página.",
			zeroRecords: "No se ha encontrado ningún registro.",
			info: "Mostrando página _PAGE_ de _PAGES_",
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
			infoFiltered: "(_MAX_ Registros filtrados en total)",
		},
		pageLength: -1,
		dom: "<'row'<'col-12'f>><'row'<'col-md-12't>><'row'<'col-md-6'><'col-md-6'>>r",
	});

	$(".chosen-select").chosen({ width: "100%" });
});

var arrMostrar = [];

$("[data-filtro]").click(function (e) {
	e.preventDefault();
	var boton = $(this).data("boton");
	console.log("boton", boton);

	$("#tblVariables")
		.find("tbody tr")
		.each(function () {
			$(this).removeClass("d-none");
		});

	$(".btnSelector")
		.not($(this).closest("div"))
		.removeClass("botonSeleccionado");
	if ($(this).closest("div").hasClass("botonSeleccionado")) {
		$(this).closest("div").removeClass("botonSeleccionado");
	} else {
		$(this).closest("div").addClass("botonSeleccionado");
		$("#tblVariables")
			.find("tbody tr")
			.each(function () {
				var coincide = 0;
				$(this)
					.find("td:eq(2)")
					.find("button")
					.each(function () {
						if ($(this).data("boton") == boton) {
							coincide = 1;
							return;
						}
					});
				if (coincide == 0) {
					$(this).addClass("d-none");
				}
			});
	}
});
