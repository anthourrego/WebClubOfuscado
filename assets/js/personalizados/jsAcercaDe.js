alertify.AcercaDeDialog || alertify.dialog('AcercaDeDialog',function(){
	return {
		main:function(){},
		setup:function(){
			return {
				options:{
					title 			: 	'Acerca de',
					resizable 		: 	!1,
					maximizable 	: 	!1
				}
			};
		},
		build:function(){
			$(this.elements.content).html("<img style='width:100%;margin-bottom:15px;' src='"+base_url()+"assets/img/logo_prosof.png'>");
		}
	}
});

$('.acercaDe').click(function(e){
	e.preventDefault();
	alertify.defaults.maintainFocus = false;
	alertify.AcercaDeDialog('');
});