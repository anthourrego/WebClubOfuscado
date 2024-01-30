const rutaGeneral = "Administrativos/Eventos/ReservaLugar/";
let anioMes;
// Drag & Drop super elaborado por el Mg. Ing. Camilo Sepúlveda
let isMouseDown = false,
	posIni = 0,
	posFin = 0,
	ultimoOver = null;

$(function () {
	RastreoIngresoModulo("Calendario Eventos");

	iniciarCalendario({ vista: "lectura" });

	anioMes = configInicial.mesAnio.split("-");
});

$(document)
	.on("mouseleave", ".estructuraCalendario", function () {
		isMouseDown = false;
		posIni = 0;
		posFin = 0;
		ultimoOver = null;
		$(".seleccionado").removeClass("seleccionado");
	})
	.on("mouseover", ".estructuraCalendario td", function () {
		if ($(this).find("div").length === 0) {
			if (!isMouseDown) {
				if ($(this).is("[data-toggle]")) {
					if (!$(this).is(ultimoOver)) {
						const dia = $(this).index();
						const fecha = new Date(anioMes[1], anioMes[0] - 1, dia);
						const hoy = new Date();
						hoy.setDate(hoy.getDate() + 1);
						hoy.setHours(0, 0, 0, 0);

						if (fecha.getTime() >= hoy.getTime()) {
							ultimoOver = $(this);
							$(".seleccionado").removeClass("seleccionado");
							$(this).addClass("seleccionado");
						} else if(fecha.getTime() < hoy.getTime()) {
							$(".seleccionado").removeClass("seleccionado");
							ultimoOver = null;
						}
					}
				}
			} else {
				posFin = $(this).closest("td").index();

				for (let i = posIni; i <= posFin; i++) {
					const tmpTD = $(".seleccionado").closest("tr").find(`td:eq(${i})`);

					if (tmpTD.find("div").length > 0) {
						break;
					} else {
						tmpTD.addClass("seleccionado2");
					}
				}
				$(".seleccionado").removeClass("seleccionado");
				$(".seleccionado2")
					.addClass("seleccionado")
					.removeClass("seleccionado2");
			}
		} else {
			if (!isMouseDown) {
				$(".seleccionado").removeClass("seleccionado");
			}
		}
	})
	.on("mousedown", "td.seleccionado", function (e) {
		e.preventDefault();
		isMouseDown = true;
		posIni = $(this).closest("td").index();
		posFin = posIni;
	})
	.on("mouseup", function (e) {
		e.preventDefault();
		isMouseDown = false;

		if ($(".seleccionado").length > 0) {
			const lugar = $(".seleccionado").closest("tr").find("td[data-lugar]");
			const evento = {
				mesAnio: configInicial.mesAnio,
				ini: posIni,
				fin: posFin,
				lugar: lugar.attr("data-lugar"),
				sede: lugar.attr("data-sede"),
				almacen: lugar.attr("data-almacen"),
				min: parseInt(lugar.attr("data-min")),
				max: parseInt(lugar.attr("data-max")),
			};
			alertify.prompt(
				"Crear Evento",
				`¿Desea reservar un evento para la fecha seleccionada en el lugar elegido? digite el número de personas`,
				"1",
				function (evt, value) {
					let regresar = false;
					value = parseInt(value);
					if (value > evento.max) {
						regresar = true;
					} else if (value < evento.min) {
						alertify.alert(
							"Advertencia",
							`El número de personas que asistirán al evento es menor a la capacidad mínima del lugar seleccionado (${evento.min})`
						);

						return false;
					}

					const data = {
						fechaini: `${anioMes[1]}-${String(anioMes[0]).padStart(
							2,
							"0"
						)}-${String(evento.ini).padStart(2, "0")}`,
						personas: value,
						lugares: evento.lugar,
						regresar,
						sede: evento.sede,
						almacen: evento.almacen,
						autoselect: true,
					};

					const tmpFechaFin = new Date(anioMes[1], anioMes[0], evento.fin);
					const fechaFin = new Date(
						`${tmpFechaFin.getFullYear()}-${tmpFechaFin.getMonth()}-${tmpFechaFin.getDate()}`
					);
					fechaFin.setDate(fechaFin.getDate() + 2);

					data.fechafin = `${fechaFin.getFullYear()}-${String(
						fechaFin.getMonth() + 1
					).padStart(2, "0")}-${String(fechaFin.getDate()).padStart(2, "0")}`;

					sessionStorage.removeItem("newRESDisponibilidad");
					sessionStorage.removeItem("newRESDatosBasicos");
					sessionStorage.removeItem("newRESComplementos");
					sessionStorage.removeItem("newRESInvitados");
					sessionStorage.removeItem("newRESCotizacion");

					setTimeout(() => {
						var parsedUrl = new URL(
							`${base_url()}Administrativos/Eventos/ReservarEvento/Calendario`
						);

						Object.keys(data).forEach(function (key) {
							parsedUrl.searchParams.append(key, data[key]);
						});

						const url = parsedUrl.toString();

						location.href = url;
					}, 10);
				},
				function () {
					$(".seleccionado").removeClass("seleccionado");
				}
			);
		}
	})
	.on("keydown", ".ajs-input", function (e) {
		if (
			!(
				(e.key >= "0" && e.key <= "9") ||
				e.key === "Backspace" ||
				e.key === "Delete" ||
				e.key === "Enter" ||
				e.key === "Tab"
			)
		) {
			e.preventDefault();
		}
	});
