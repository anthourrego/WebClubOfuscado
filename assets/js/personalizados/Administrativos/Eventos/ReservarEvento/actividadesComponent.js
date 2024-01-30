class Actividades {
	constructor(selector, config = {}) {
		this.__id = Math.floor(Math.random() * 100) + 1;
		this.__selector = selector;
		this.__config = {};
		this.__config.data = config.data !== undefined ? config.data : [];
		this.__tmpActividades = Array(config.data.length).fill(null);

		this.draw();
	}

	printData() {
		const self = this,
			selector = $(this.__selector);
		const div = $(`<div class="actividadesComponent"></div>`);

		this.__config.data.forEach((dependencia, i) => {
			const list = $(`<ul class="list-group list-group-flush"></ul>`);
			if (typeof dependencia.actividades === "undefined") {
				dependencia.actividades = [];
			}

			div.append(`<h5 class="mb-0">
				<i class="fas fa-tasks mr-2"></i> ${dependencia.nombre}
			</h5>`);

			dependencia.actividades.forEach((actividad) => {
				list.append(`<li class="list-group-item d-flex pr-0 pl-4 py-2">
					<textarea
						class="textareaActividad"
						data-actividadid="${actividad.id}"
						data-dependenciaid="${dependencia.id}"
						style="height: 31px; min-height: 31px;"
					>${actividad.nombre}</textarea>
					<button
						class="btn btn-danger btn-sm btnEliminarActividad rounded-pill"
						title="Eliminar Actividad"
					><i class="fas fa-trash"></i></button>
				</li>`);
			});

			list.append(`<li class="list-group-item d-flex pr-0 pl-4 py-2">
				<textarea
					class="textareaActividad nuevaActividad"
					data-dependenciaid="${dependencia.id}"
					placeholder="Nueva actividad"
					style="height: 31px; min-height: 31px;"
				>${self.__tmpActividades[i] != null ? self.__tmpActividades[i] : ""}</textarea>
				<button
					class="btn btn-success btn-sm btnGuardarActividad d-none rounded-pill"
					title="Guardar Actividad"
				><i class="fas fa-save"></i></button>
			</li>`);

			div.append(list);
		});

		$(this.__selector).html(div);

		selector
			.unbind()
			.on("change", ".textareaActividad:not(.nuevaActividad)", function () {
				const dependenciaId = $(this).attr("data-dependenciaid");
				const actividadId = $(this).attr("data-actividadid");
				const data = [...self.getData()];
				const index = data.findIndex(
					(dependencia) => dependencia.id == dependenciaId
				);
				const indexActividad = data[index].actividades.findIndex(
					(actividad) => actividad.id == actividadId
				);
				data[index].actividades[indexActividad].nombre = $(this).val().trim();
				self.setData(data);
			})
			.on("click", ".btnEliminarActividad", function (e) {
				e.preventDefault();
				const dependenciaId = $(this)
					.closest("li")
					.find(".textareaActividad")
					.attr("data-dependenciaid");
				const actividadId = $(this)
					.closest("li")
					.find(".textareaActividad")
					.attr("data-actividadid");
				const data = [...self.getData()];
				const index = data.findIndex(
					(dependencia) => dependencia.id == dependenciaId
				);
				const indexActividad = data[index].actividades.findIndex(
					(actividad) => actividad.id == actividadId
				);
				data[index].actividades.splice(indexActividad, 1);
				self.setData(data);
			})
			.on("change", ".textareaActividad.nuevaActividad", function () {
				const indexInput = $(".textareaActividad.nuevaActividad").index(this);
				self.__tmpActividades[indexInput] = $(this).val().trim();
			})
			.on("click", ".btnGuardarActividad", function (e) {
				e.preventDefault();
				const textareaActividad = $(this)
					.closest("li")
					.find(".textareaActividad");
				const dependenciaId = textareaActividad.attr("data-dependenciaid");
				const nombre = textareaActividad.val().trim();
				if (nombre != "") {
					const id = (Math.floor(Math.random() * 100) + 1) * -1;
					const actividad = {
						id,
						nombre,
					};
					const data = [...self.getData()];
					const index = data.findIndex(
						(dependencia) => dependencia.id == dependenciaId
					);
					data[index].actividades.push(actividad);
					const indexInput = $(".textareaActividad.nuevaActividad").index(
						textareaActividad
					);
					self.__tmpActividades[indexInput] = null;
					self.setData(data);
					setTimeout(() => {
						$(self.__selector)
							.find(`[data-dependenciaid=${dependenciaId}].nuevaActividad`)
							.focus();
					}, 10);
				} else {
					$(this)
						.closest("li")
						.find(".textareaActividad")
						.select()[0]
						.reportValidity();
					$(".ajs-message.ajs-warning.ajs-visible").remove();
					alertify.warning("Complete el campo para almacenar la actividad");
				}
			})
			.on("focus", ".nuevaActividad", function () {
				$(".btnGuardarActividad").addClass("d-none");
				$(this)
					.closest("li")
					.find(".btnGuardarActividad")
					.removeClass("d-none");
			});

		selector.find("textarea").each(function () {
			$(this).trigger("input");
		});
	}

	setData(data) {
		this.__config.data = data;

		this.draw();
	}

	addData(data) {
		this.__config.data.push(...data);

		this.draw();
	}

	draw() {
		this.printData();
		$(this.__selector).trigger("update");
	}

	getData() {
		return this.__config.data;
	}
}
