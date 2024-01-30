var modalFecha = false;
var inputModalFecha = "";
var formatoModalFecha = "";

var $DATETABLAFECHA = `<div class="input-group">
						<input type="text" class="form-control form-control-sm mFecha" data-formato="YYYY-MM-DD" maxlength="15">
						<a href="#" class="input-group-append input-group-addon text-decoration-none mFecha" data-formato="YYYY-MM-DD" title="Desplegar Calendario">
							<span class="input-group-text fas fa-calendar-alt d-flex m-0 px-1"></span>
						</a>
					</div>`;
var $DATETABLAHORA = `<div class="input-group">
						<input type="text" class="form-control form-control-sm mFecha" data-formato="hh:mm A" maxlength="15">
						<a href="#" class="input-group-append input-group-addon text-decoration-none mFecha" data-formato="hh:mm A" title="Desplegar Calendario">
							<span class="input-group-text fas fa-clock d-flex m-0 px-1"></span>
						</a>
					</div>`;

$(document).ready(function(){
	$('.datepicker').datetimepicker({
		format: 'YYYY-MM-DD',
		locale: 'es',
		icons: {
			time: "fas fa-clock",
			date: "fa fa-calendar",
			up: "fa fa-arrow-up",
			down: "fa fa-arrow-down"
		}
	});

	$('.datetimepicker').datetimepicker({
		format: 'YYYY-MM-DD HH:mm:ss',
		locale: 'es',
		icons: {
			time: "fas fa-clock",
			date: "fa fa-calendar",
			up: "fa fa-arrow-up",
			down: "fa fa-arrow-down"
		}
	});
	
	$('.aniopicker').datetimepicker({
		format: 'YYYY',
		locale: 'es'
	});
	$('.mespicker').datetimepicker({
		format: 'MM',
		locale: 'es'
	});
	$('.mesaniopicker').datetimepicker({
		format: 'MM-YYYY',
		locale: 'es'
	});
	$('.timepicker').datetimepicker({
		format: 'HH:mm',
		locale: 'es'
	});
	$('.minitimepicker').datetimepicker({
		format: 'HH',
		locale: 'es'
	});
	$('.timesspicker').datetimepicker({
		format: 'HH:mm:ss',
		locale: 'es'
	});

	$('.timepickerLT').datetimepicker({
		format: 'hh:mm A'
	});

	$(document).on("focus", ".dateFecha", function(){
		$(this).next().click();
	});

	$(document).on("focus", ".dateFechaFloating", function(){
		$(this).next().next().click();
	});

	$(document).on("focusin",'.mFecha',function(){
		formatoModalFecha = $(this).data("formato");
		inputModalFecha = $(this);
		var date = inputModalFecha.val();

		if (modalFecha == true) {
			$("#calendarFecha").datetimepicker("destroy");
		}

		if (formatoModalFecha == "hh:mm A") {
			date = date == "" ? '' : moment(date, "hh:mm A").format("YYYY-MM-DD HH:mm");
		}
		
		$('#calendarFecha').datetimepicker({
			inline: true,
			sideBySide: true,
			format: formatoModalFecha,
			locale: 'es',
			date
		});

		modalFecha = true;

		$("#mFecha").modal("show");
	});

	$('#calendarFecha').on("dp.change", function(e) {
		inputModalFecha.val(moment(e.date).format(formatoModalFecha));
	});
});
//! moment.js locale configuration
//! locale : spanish (es)
//! author : Julio Napurí : https://github.com/julionc

(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('../moment')) :
   typeof define === 'function' && define.amd ? define(['moment'], factory) :
   factory(global.moment)
}(this, function (moment) { 'use strict';


	var monthsShortDot = 'Ene._Feb._Mar._Abr._May._Jun._Jul._Ago._Sep._Oct._Nov._Dic.'.split('_'),
		monthsShort = 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_');

	var es = moment.defineLocale('es', {
		months : 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
		monthsShort : function (m, format) {
			if (/-MMM-/.test(format)) {
				return monthsShort[m.month()];
			} else {
				return monthsShortDot[m.month()];
			}
		},
		weekdays : 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
		weekdaysShort : 'Dom._Lun._Mar._Mié._Jue._Vie._Sáb.'.split('_'),
		weekdaysMin : 'Do_Lu_Ma_Mi_Ju_Vi_Sá'.split('_'),
		longDateFormat : {
			LT : 'H:mm',
			LTS : 'H:mm:ss',
			L : 'DD/MM/YYYY',
			LL : 'D [de] MMMM [de] YYYY',
			LLL : 'D [de] MMMM [de] YYYY H:mm',
			LLLL : 'dddd, D [de] MMMM [de] YYYY H:mm'
		},
		calendar : {
			sameDay : function () {
				return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
			},
			nextDay : function () {
				return '[mañana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
			},
			nextWeek : function () {
				return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
			},
			lastDay : function () {
				return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
			},
			lastWeek : function () {
				return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
			},
			sameElse : 'L'
		},
		relativeTime : {
			future : 'en %s',
			past : 'hace %s',
			s : 'unos segundos',
			m : 'un minuto',
			mm : '%d minutos',
			h : 'una hora',
			hh : '%d horas',
			d : 'un día',
			dd : '%d días',
			M : 'un mes',
			MM : '%d meses',
			y : 'un año',
			yy : '%d años'
		},
		ordinalParse : /\d{1,2}º/,
		ordinal : '%dº',
		week : {
			dow : 1, // Monday is the first day of the week.
			doy : 4  // The week that contains Jan 4th is the first week of the year.
		}
	});

	return es;

}));