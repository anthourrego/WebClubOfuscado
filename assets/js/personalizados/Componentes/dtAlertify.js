let gOpenModal = null;

function dtAlertify(config = {}) {
	const mergeOptions = (defaults, options) => {
		const merged = { ...defaults };

		for (let key in options) {
			if (options.hasOwnProperty(key)) {
				if (typeof options[key] === "object" && !Array.isArray(options[key])) {
					merged[key] = mergeOptions(merged[key], options[key]);
				} else {
					merged[key] = options[key];
				}
			}
		}

		return merged;
	};

	return new Promise(function (resolve, reject) {
		const defaultConfig = {
			titulo: "Búsqueda",
			filtroInicial: "",
			campos: [],

			dtConfig: {
				data: {
					tblID: "[id=tblBusqueda]",
				},
				bAutoWidth: false,
				columnDefs: [{ targets: [0], width: "3%" }],
				ordering: false,
				draw: 10,
				pageLength: 10,
				oSearch: {
					sSearch: "",
				},
				createdRow: function (row, data, dataIndex) {
					$(row).click(function () {
						alertify.dtAlertify().close();
						resolve(data);
					});
				},
				scrollY: screen.height - 400,
				scroller: {
					loadingIndicator: false,
				},
				dom: domftri,
			},
		};

		const mergedConfig = mergeOptions(defaultConfig, config);

		mergedConfig.dtConfig.oSearch.sSearch = mergedConfig.filtroInicial;

		alertify.dtAlertify().set({
			title: mergedConfig.titulo,
		});

		alertify.ajaxAlert = function (url) {
			$.ajax({
				url: url,
				success: function (data) {
					alertify.dtAlertify().set({
						onclose: function () {
							alertify.dtAlertify().set({ onshow: null });
							$(".ajs-modal").unbind();
							delete alertify.ajaxAlert;
							$("[id=tblBusqueda]").unbind().remove();

							if (gOpenModal !== null) {
								$(gOpenModal).modal("show");
								gOpenModal = null;
							}
						},
						onshow: function () {
							if ($(".modal.show").length > 0) {
								gOpenModal = $(".modal.show");
								$(gOpenModal).modal("hide");
							}
						},
					});
					alertify.dtAlertify(data);

					dtSS(mergedConfig.dtConfig);
				},
			});
		};

		const campos = encodeURIComponent(JSON.stringify(config.campos));
		alertify.ajaxAlert(base_url() + "Busqueda/DataTable?campos=" + campos);
	});
}

alertify.dtAlertify ||
	alertify.dialog("dtAlertify", function factory() {
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
						alertify.dtAlertify().destroy();
					}, 0);
				},
			},
		};
	});
