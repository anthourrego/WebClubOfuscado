let hayCambiosSinGuardar = false;
const totales = {
	totalFijos: 0,
	totalMenus: 0,
	totalOtros: 0,
	totalServicios: 0,

	totalTotal: 0,
};
let almacenMenu = 0;

let minFechaIniEvento = new Date(9999, 0, 1),
	maxFechaFinEvento = new Date(1000, 11, 31);

nuevaReserva.disponibilidad.lugares.forEach((lugar) => {
	let fechaIni = new Date(lugar.fechaini),
		fechaFin = new Date(lugar.fechafin);
	if (fechaIni < minFechaIniEvento) {
		minFechaIniEvento = fechaIni;
	}
	if (fechaFin > maxFechaFinEvento) {
		maxFechaFinEvento = fechaFin;
	}
});

const tblElementosFijos = new Tabla("#tblElementosFijos", {
	cantidadMax: true,
	descartarProductos: false,
	cantidadMin: 0,
	menus: true,
	precios: false,
});
const tblMenu = new Tabla("#tblMenu", {
	editable: true,
	menus: true,
	menusEditables: true,
	precioAbierto: true,
});
const tblOtros = new Tabla("#tblOtros", {
	editable: true,
	agregarProductos: true,
	productos: ["C"],
	precioAbierto: true,
});
const tblServicios = new Tabla("#tblServicios", {
	editable: true,
	agregarProductos: true,
	productos: ["M"],
	precioAbierto: true,
});

$(function () {
	$(window).on("beforeunload", () => {
		if (hayCambiosSinGuardar) {
			return "¿Estás segur@ que quieres salir? Hay cambios sin guardar";
		}
	});

	if (!nuevaReserva.disponibilidad) {
		window.location.href =
			base_url() + "Administrativos/Eventos/ReservarEvento/Disponibilidad";
	} else if (!nuevaReserva.datosBasicos) {
		window.location.href =
			base_url() + "Administrativos/Eventos/ReservarEvento/DatosBasicos";
	}

	if (!nuevaReserva.datosBasicos.menu) {
		$('a[href="#datosMenu"]').closest("li").addClass("d-none");
		$("#totalMenus").closest("div.row").addClass("d-none");
	}

	$.ajax({
		url: rutaGeneral + "cargarMenus",
		type: "POST",
		dataType:'JSON',
		data: {
			SedeId : nuevaReserva.disponibilidad.sede,
		},
		success: function (respuesta) {
			if (respuesta.length) {
				menus = respuesta;
				data = respuesta.filter((value) => {
					if(value.SedeId == nuevaReserva.disponibilidad.sede && value.almacenid == almacenIdEventos ){
						return true;
					}else{
						return false;
					}
				});
				almacenMenu = data.length ? almacenIdEventos : menus[0].almacenid;
				almacenIdEventos = almacenMenu;
			}
		},
	});

	// Event listeners

	$(document).on("updateTbl", function () {
		totales.totalTotal =
			totales.totalFijos +
			totales.totalMenus +
			totales.totalOtros +
			totales.totalServicios;

		$("#totalElementos").val(`$ ${addCommas(totales.totalFijos)}`);
		$("#totalMenus").val(`$ ${addCommas(totales.totalMenus)}`);
		$("#totalOtros").val(`$ ${addCommas(totales.totalOtros)}`);
		$("#totalServicios").val(`$ ${addCommas(totales.totalServicios)}`);
		$("#totalTotal").val(`$ ${addCommas(totales.totalTotal)}`);

		hayCambiosSinGuardar = true;
	});

	$("#tblElementosFijos").on("update", function () {
		const elementosFijos = tblElementosFijos.getData();

		totales.totalFijos = elementosFijos.reduce(
			(acumulador, producto) => acumulador + parseFloat(producto.total),
			0
		);

		$(document).trigger("updateTbl");
	});

	$("#tblMenu").on("update", function () {
		const menu = tblMenu.getData();

		totales.totalMenus = menu.reduce(
			(acumulador, producto) => acumulador + parseFloat(producto.total),
			0
		);

		$(document).trigger("updateTbl");
	});

	$("#tblOtros").on("update", function () {
		const otros = tblOtros.getData();

		totales.totalOtros = otros.reduce(
			(acumulador, producto) => acumulador + parseFloat(producto.total),
			0
		);

		$(document).trigger("updateTbl");
	});

	$("#tblServicios").on("update", function () {
		const servicios = tblServicios.getData();

		totales.totalServicios = servicios.reduce(
			(acumulador, producto) => acumulador + parseFloat(producto.total),
			0
		);

		$(document).trigger("updateTbl");
	});

	$("#btnSiguiente").on("click", function (e) {
		e.preventDefault();

		const complementos = {
			elementosFijos: tblElementosFijos.getData(),
			menus: tblMenu.getData(),
			otros: tblOtros.getData(),
			servicios: tblServicios.getData(),
		};

		const disponibilidad = { ...nuevaReserva.disponibilidad };

		complementos.elementosFijos.forEach((producto) => {
			if (producto.ElementoId === -1) {
				const index = disponibilidad.lugares.findIndex(
					(lugar) => lugar.lugarid === producto.menu
				);
				disponibilidad.lugares[index].Valor = producto.Valor;
			}
		});

		sessionStorage.setItem(
			"newRESDisponibilidad",
			JSON.stringify(disponibilidad)
		);
		sessionStorage.setItem("newRESComplementos", JSON.stringify(complementos));

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

		if (nuevaReserva.datosBasicos.manejalista) {
			location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Invitados`;
		} else {
			location.href = `${base_url()}Administrativos/Eventos/ReservarEvento/Cotizacion`;
		}
	});

	// Métodos

	// Procedimientos

	// Si se está editando del session
	if (nuevaReserva.complementos) {
		tblElementosFijos.setData(nuevaReserva.complementos.elementosFijos);
		tblMenu.setData(nuevaReserva.complementos.menus);
		tblOtros.setData(nuevaReserva.complementos.otros);
		tblServicios.setData(nuevaReserva.complementos.servicios);

		hayCambiosSinGuardar = false;

		if (nuevaReserva.complementos.elementosFijos.length <= 0) {
			$('a[href="#datosElemento"]').closest("li").addClass("d-none");
			$("#totalElementos").closest("div.row").addClass("d-none");
			$('a[href="#datosOtros"]').click();
		}
	} else {
		const lugares = nuevaReserva.disponibilidad.lugares.map(
			(lugar) => lugar.lugarid
		);
		$.ajax({
			url: rutaGeneral + "CargarElementosFijos",
			type: "POST",
			data: {
				lugares: JSON.stringify(lugares),
			},
			success: function (respuesta) {
				const res = JSON.parse(respuesta);
				if (res.length) {
					tblElementosFijos.setData(res);
				} else {
					$('a[href="#datosElemento"]').closest("li").addClass("d-none");
					$("#totalElementos").closest("div.row").addClass("d-none");
					$('a[href="#datosOtros"]').click();
				}

				hayCambiosSinGuardar = false;
			},
		});
	}

	if (!nuevaReserva.datosBasicos.manejalista) {
		const btnSiguiente = $("#btnSiguiente").html();
		const nuevoHtml = btnSiguiente.replace("Invitados", "Cotización");
		$("#btnSiguiente").html(nuevoHtml);
	}
});
