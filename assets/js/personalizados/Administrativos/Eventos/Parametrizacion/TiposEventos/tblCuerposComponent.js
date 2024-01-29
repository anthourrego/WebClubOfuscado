class TblCuerpo {
	constructor(selector, tipo, config = {}) {
		this.__selector = selector;
		this.__tipo = tipo;
		this.__config = {};

		this.__config.data = config.data !== undefined ? config.data : [];
		this.__config.dt = null;
		this.__config.eliminados = [];
		this.__config.dEliminados = [];

		this.pintarDT();

		const self = this;
		$(selector).on("click", ".btnCuerpo", function (e) {
			e.preventDefault();

			const data = {
				select: ["CuerpoId", "Nombre"],
				table: [
					"CuerpoDocumento",
					[],
					[
						["Estado <>", "I"],
						[self.__tipo, 1],
					],
				],
				column_order: ["CuerpoId", "Nombre"],
				orden: { CuerpoId: "ASC" },
				column_search: ["Nombre"],
				columnas: ["CuerpoId", "Nombre"],
			};

			if (self.__config.data.length > 0) {
				const cuerpos = [
					...new Set(self.__config.data.map((cuerpo) => cuerpo.CuerpoId)),
				];
				data.table[2].push([`CuerpoId NOT IN (${cuerpos})`]);
			}

			dtAlertify({
				titulo: "Cuerpos de Documentos",
				campos: ["CuerpoId", "Nombre"],
				dtConfig: {
					data,
					orderable: true,
					columns: [
						{
							data: 0,
							visible: false,
						},
						{ data: 1 },
					],
				},
			}).then((res) => {
				let Orden = 1,
					TipoEventoCuerpoId = -1;
				if (self.__config.data.length > 0) {
					Orden = self.__config.data[self.__config.data.length - 1].Orden + 1;
					TipoEventoCuerpoId =
						self.__config.data[self.__config.data.length - 1]
							.TipoEventoCuerpoId - 1;
				}

				self.addData({
					TipoEventoCuerpoId,
					Orden,
					CuerpoId: res[0],
					Cuerpo: res[1],
					Dependencia: null,
					DependenciaId: null,
				});
			});
		});
	}

	setData(data) {
		this.__config.data = data;

		this.refresh();
	}

	addData(data) {
		this.__config.data.push({ ...data });

		this.refresh();
	}

	pintarDT() {
		const self = this;
		const tabla = $(this.__selector)
			.html(
				`<table class="table table-bordered table-sm table-hover table-fixed table-striped display filtro-columnas w-100"></table>`
			)
			.find("table")
			.DataTable({
				destroy: true,
				data: this.__config.data,
				autoWidth: false,
				ordering: false,
				paging: false,
				rowsGroup: ["TipoEventoCuerpoId:name", "Orden:name", "Cuerpo:name"],
				columns: [
					{
						title: "Acciones",
						data: "TipoEventoCuerpoId",
						name: "TipoEventoCuerpoId",
						width: "5%",
						className: "align-middle",
					},
					{
						title: "Orden",
						data: "Orden",
						name: "Orden",
						width: "5%",
						className: "align-middle",
					},
					{
						title: "CuerpoId",
						data: "CuerpoId",
						name: "CuerpoId",
						visible: false,
						className: "align-middle",
					},
					{
						title: "Cuerpo",
						data: "Cuerpo",
						name: "Cuerpo",
						className: "align-middle",
					},
					{
						title: "Dependencias",
						data: "Dependencia",
						name: "Dependencia",
						className: "align-middle",
						colspan: 2,
					},
					{
						title: "",
						data: "DependenciaId",
						name: "DependenciaId",
						width: "1%",
						className: "align-middle tdDependencias",
					},
				],
				buttons: [
					{
						className: "btnFiltros btnCuerpo",
						attr: { title: "Agregar" },
						text: '<i class="fas fa-plus"></i> <strong> Agregar Cuerpo</strong>',
					},
				],
				createdRow: function (row, data, dataIndex) {
					$(row).find("td:eq(0)").html(`
						<div class="text-center">
							<button class="dependenciasCuerpo btn btn-info btn-xs" title="Agregar Dependencia">
								<i class="fas fa-sitemap"></i>
							</button>
							<button class="bajarCuerpo btn btn-secondary btn-xs" title="Bajar">
								<i class="fas fa-arrow-down"></i>
							</button>
							<button class="subirCuerpo btn btn-secondary btn-xs" title="Subir">
								<i class="fas fa-arrow-up"></i>
							</button>
							<button class="eliminarCuerpo btn btn-danger btn-xs" title="Eliminar">
								<i class="fas fa-trash"></i>
							</button>
						</div>
					`);

					if (data.DependenciaId !== null) {
						$(row).find(".tdDependencias").html(`
							<div class="text-center">
								<button class="eliminarDependencia btn btn-danger btn-xs" title="Eliminar Dependencia">
									<i class="fas fa-trash"></i>
								</button>
							</div>
						`);
					}

					if (data.Orden === 1) {
						$(row).find(".subirCuerpo").attr("disabled", true);
					}
					if (
						data.Orden ===
						self.__config.data[self.__config.data.length - 1].Orden
					) {
						$(row).find(".bajarCuerpo").attr("disabled", true);
					}
					$(row)
						.on("click", ".dependenciasCuerpo", function (e) {
							e.preventDefault();
							const { CuerpoId } = data;

							const tblData = {
								select: ["DependenciaId", "Nombre"],
								table: ["Dependencia", [], [["Estado <>", "I"]]],
								column_order: ["DependenciaId", "Nombre"],
								orden: { DependenciaId: "ASC" },
								column_search: ["Nombre"],
								columnas: ["DependenciaId", "Nombre"],
							};

							if (data.DependenciaId !== null) {
								const dependencias = [
									...new Set(
										self.__config.data
											.filter((cuerpo) => cuerpo.CuerpoId == CuerpoId)
											.map((cuerpo) => cuerpo.DependenciaId)
									),
								];
								tblData.table[2].push([
									`DependenciaId NOT IN (${dependencias})`,
								]);
							}

							dtAlertify({
								titulo: "Dependencias",
								campos: ["Id", "Nombre"],
								dtConfig: {
									data: tblData,
									orderable: true,
									columns: [{ data: 0 }, { data: 1 }],
								},
							}).then((res) => {
								if (data.DependenciaId === null) {
									const index = self.__config.data.findIndex(
										(cuerpo) => cuerpo.CuerpoId == data.CuerpoId
									);
									if (index !== -1) {
										self.__config.data[index].DependenciaId = res[0];
										self.__config.data[index].Dependencia = res[1];
									}
								} else {
									self.addData({
										TipoEventoCuerpoId: data.TipoEventoCuerpoId,
										Orden: data.Orden,
										CuerpoId: data.CuerpoId,
										Cuerpo: data.Cuerpo,
										DependenciaId: res[0],
										Dependencia: res[1],
									});
								}

								self.refresh();
							});
						})
						.on("click", ".bajarCuerpo", function (e) {
							e.preventDefault();

							const { Orden } = data;
							self.__config.data = self.__config.data.map((cuerpo) => {
								if (cuerpo.Orden == Orden) {
									cuerpo.Orden++;
								} else if (cuerpo.Orden == Orden + 1) {
									cuerpo.Orden--;
								}
								return cuerpo;
							});

							self.refresh();
						})
						.on("click", ".subirCuerpo", function (e) {
							e.preventDefault();

							const { Orden } = data;
							self.__config.data = self.__config.data.map((cuerpo) => {
								if (cuerpo.Orden == Orden) {
									cuerpo.Orden--;
								} else if (cuerpo.Orden == Orden - 1) {
									cuerpo.Orden++;
								}
								return cuerpo;
							});

							self.refresh();
						})
						.on("click", ".eliminarCuerpo", function (e) {
							e.preventDefault();

							alertify.confirm(
								"Advertencia",
								"¿Está seguro de remover el cuerpo con sus dependencias asociadas a este tipo de evento?",
								function () {
									if (data.TipoEventoCuerpoId > 0) {
										self.__config.eliminados.push(data.TipoEventoCuerpoId);
									}
									const { Orden, CuerpoId } = data;
									self.__config.data = self.__config.data
										.filter((cuerpo) => cuerpo.CuerpoId != CuerpoId)
										.map((cuerpo) => {
											if (cuerpo.Orden > Orden) {
												cuerpo.Orden--;
											}
											return cuerpo;
										});

									self.refresh();
								},
								function () {}
							);
						})
						.on("click", ".eliminarDependencia", function (e) {
							e.preventDefault();

							if (data.TipoEventoCuerpoId > 0) {
								self.__config.dEliminados.push({
									TipoEventoCuerpoId: data.TipoEventoCuerpoId,
									DependenciaId: data.DependenciaId,
								});
							}
							const { CuerpoId, DependenciaId } = data;
							const index = self.__config.data.findIndex(
								(cuerpo) =>
									cuerpo.CuerpoId == data.CuerpoId &&
									cuerpo.DependenciaId == DependenciaId
							);
							const dependencias = self.__config.data.filter(
								(cuerpo) => cuerpo.CuerpoId == CuerpoId
							).length;

							if (dependencias == 1) {
								self.__config.data[index].DependenciaId = null;
								self.__config.data[index].Dependencia = null;
							} else {
								self.__config.data = self.__config.data.filter(
									(cuerpo) =>
										!(
											cuerpo.CuerpoId == CuerpoId &&
											cuerpo.DependenciaId == DependenciaId
										)
								);
							}

							self.refresh();
						});
				},
				initComplete: function () {
					$(self.__selector).find("th:last").remove();
					$(self.__selector).find("th:last").attr("colspan", 2);
				},
			});

		this.__config.dt = tabla;

		return tabla;
	}

	refresh() {
		if (this.__config.data.length > 0) {
			this.__config.data = this.__config.data.sort((a, b) => a.Orden - b.Orden);
		}
		this.pintarDT();

		$(this.__selector).trigger("update");
	}

	getData() {
		return this.__config.data;
	}
}
