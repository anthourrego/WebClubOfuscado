<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
|--------------------------------------------------------------------------
| Display Debug backtrace
|--------------------------------------------------------------------------
|
| If set to TRUE, a backtrace will be displayed along with php errors. If
| error_reporting is disabled, the backtrace will not display, regardless
| of this setting
|
*/
defined('SHOW_DEBUG_BACKTRACE') OR define('SHOW_DEBUG_BACKTRACE', TRUE);

/*
|--------------------------------------------------------------------------
| File and Directory Modes
|--------------------------------------------------------------------------
|
| These prefs are used when checking and setting modes when working
| with the file system.  The defaults are fine on servers with proper
| security, but you may wish (or even need) to change the values in
| certain environments (Apache running a separate process for each
| user, PHP under CGI with Apache suEXEC, etc.).  Octal values should
| always be used to set the mode correctly.
|
*/
defined('FILE_READ_MODE')  OR define('FILE_READ_MODE', 0644);
defined('FILE_WRITE_MODE') OR define('FILE_WRITE_MODE', 0666);
defined('DIR_READ_MODE')   OR define('DIR_READ_MODE', 0755);
defined('DIR_WRITE_MODE')  OR define('DIR_WRITE_MODE', 0755);

/*
|--------------------------------------------------------------------------
| File Stream Modes
|--------------------------------------------------------------------------
|
| These modes are used when working with fopen()/popen()
|
*/
defined('FOPEN_READ')                           OR define('FOPEN_READ', 'rb');
defined('FOPEN_READ_WRITE')                     OR define('FOPEN_READ_WRITE', 'r+b');
defined('FOPEN_WRITE_CREATE_DESTRUCTIVE')       OR define('FOPEN_WRITE_CREATE_DESTRUCTIVE', 'wb'); // truncates existing file data, use with care
defined('FOPEN_READ_WRITE_CREATE_DESTRUCTIVE')  OR define('FOPEN_READ_WRITE_CREATE_DESTRUCTIVE', 'w+b'); // truncates existing file data, use with care
defined('FOPEN_WRITE_CREATE')                   OR define('FOPEN_WRITE_CREATE', 'ab');
defined('FOPEN_READ_WRITE_CREATE')              OR define('FOPEN_READ_WRITE_CREATE', 'a+b');
defined('FOPEN_WRITE_CREATE_STRICT')            OR define('FOPEN_WRITE_CREATE_STRICT', 'xb');
defined('FOPEN_READ_WRITE_CREATE_STRICT')       OR define('FOPEN_READ_WRITE_CREATE_STRICT', 'x+b');

/*
|--------------------------------------------------------------------------
| Exit Status Codes
|--------------------------------------------------------------------------
|
| Used to indicate the conditions under which the script is exit()ing.
| While there is no universal standard for error codes, there are some
| broad conventions.  Three such conventions are mentioned below, for
| those who wish to make use of them.  The CodeIgniter defaults were
| chosen for the least overlap with these conventions, while still
| leaving room for others to be defined in future versions and user
| applications.
|
| The three main conventions used for determining exit status codes
| are as follows:
|
|    Standard C/C++ Library (stdlibc):
|       http://www.gnu.org/software/libc/manual/html_node/Exit-Status.html
|       (This link also contains other GNU-specific conventions)
|    BSD sysexits.h:
|       http://www.gsp.com/cgi-bin/man.cgi?section=3&topic=sysexits
|    Bash scripting:
|       http://tldp.org/LDP/abs/html/exitcodes.html
|
*/
defined('EXIT_SUCCESS')        OR define('EXIT_SUCCESS', 0); // no errors
defined('EXIT_ERROR')          OR define('EXIT_ERROR', 1); // generic error
defined('EXIT_CONFIG')         OR define('EXIT_CONFIG', 3); // configuration error
defined('EXIT_UNKNOWN_FILE')   OR define('EXIT_UNKNOWN_FILE', 4); // file not found
defined('EXIT_UNKNOWN_CLASS')  OR define('EXIT_UNKNOWN_CLASS', 5); // unknown class
defined('EXIT_UNKNOWN_METHOD') OR define('EXIT_UNKNOWN_METHOD', 6); // unknown class member
defined('EXIT_USER_INPUT')     OR define('EXIT_USER_INPUT', 7); // invalid user input
defined('EXIT_DATABASE')       OR define('EXIT_DATABASE', 8); // database error
defined('EXIT__AUTO_MIN')      OR define('EXIT__AUTO_MIN', 9); // lowest automatically-assigned error code
defined('EXIT__AUTO_MAX')      OR define('EXIT__AUTO_MAX', 125); // highest automatically-assigned error code
defined('VERSIONSOFT')         OR define('VERSIONSOFT', '1.13.0'); // Versión del sistema

defined('LLAVE_SECRETA') OR define('LLAVE_SECRETA', 'csoftprosofdesarrollo');
defined('ITERACIONES') OR define('ITERACIONES', 30);
defined('CARACTERES_UPLOAD') OR define('CARACTERES_UPLOAD', '/[\'^£$%&*()}{@#~?><>,|=_+¬-]á|é|í|ó|ú|Á|É|Í|Ó|Ú|à|è|ì|ò|ù|À|È|Ì|Ò|Ù|ä|ë|ï|ö|ü|Ä|Ë|Ï|Ö|Ü|â|ê|î|ô|û|Â|Ê|Î|Ô|Û|ý|Ý|ÿ|ñ|Ñ/');

defined('AYBPermisos') OR define('AYBPermisos', implode(",", [
	10 // Ajustes
    ,1002 //Modifica Reporte
	,1003 // SMTP Correo
	,1004 //Cerrar sesiones activas
	,16 //Reserva Mesas
	,1601 //Reserva Mesa
	,1602 //Informe reservas
    ,18 //Servicios
    ,1801 //Panel Principal
    ,1802 //Vista General
    ,180101 //Ventas Generales
    ,180102 //Pedido mesa
    ,180103 //Cuentas pendientes
	,180104 //Cargue Cuenta Hotel
	,180105 //Cambiar vendedor en factura
	,180106 //Facturas Pendientes de Pago
    ,180107 //Reimprimir Factura
    ,180108 //Informe Vendedor
    ,180109 //Reactivar Consumo
    ,180111 //Activar Mesa Edición
	,180112 //Venta Pendiente
	,180114 //Aceptar consumos desde APP
    ,180116 //Informe General
    ,180117 //Informe Vendedor Por Consumo
    ,180119 //Cuadre Cajero
	,180120 //Gastos base ventas
		,18012001
		,18012002
		,18012003
	,180121 //Recogidas
	,180123 //Congela Caja
	,180128 //Base a Caja
    ,57 //Buscar Producto
    ,55 //Modificar
    ,67 //Borrar Cuenta
    ,60 //Cargar Cuenta
    ,50 //Eliminar Producto
    ,51 //Restar producto
    ,52 //Catidad Producto
    ,53 //Variable Producto
    ,54 //Detalle Producto
    ,180113 //Dar de baja producto
    ,180115 //Cargar cuenta hotel
	,20 //Dashboard
	,2001 //Vendedor Top
	,2002 //Producto Top
	,2003 //Mesa / Personas
	,2004 //Mesa / Factura
	,2005 // Mesa/Hora
	,2006 //Mesa/Promedio
	,2617 //Gastos base ventas autoriza editar
	,2618 //Gastos base ventas autoriza anular
	,2616 //Recogidas permiso autorizador
	,2619 //Cuadre cajero - autoriza nuevo cuadre cajero
    ,180122 //InformeVentasCajero
	,18012201 //Filtrar por mas cajeros en InformeVentasCajero
    ,61 //Boton de pre cuenta
	,180125 //Reimpresión de comandas
	,180124 //Productos Eliminados

	//Eventos
	,21 //Eventos
	,2101 //Lista Eventos
	,2102 //Reservas/Ingresos
	,2103 //Ingresos
	,2105 //Crear Cotizacion
	,2106 //Gestionar Eventos
	,210601 // Tareas de eventos
	,210602 // Administrar eventos
	,2107 //Calendario
	,2108 //Anticipos de Cartera
	,2104 //Parametrización Eventos
	,210401 //Sedes
	,210402 //Tipo Montaje
	,210403 //Tipo Eventos
	,210404 //Medio de reserva
	,210406 //Lugares
	,210407 //Tipo Lugar
	,210409 //Configuración 
	,210410 //Cuerpos
	,180110 //Cambio Almacen Vendedor
	,180126 //Eventos - Panel Principal
]));

defined('PERMISOSREEMPLAZAALMACENRASTREO') OR define('PERMISOSREEMPLAZAALMACENRASTREO', implode(",", [
	19
	, 11
	, 14
	, 1401
	, 1402
	, 21
	, 2101
	, 2102
	, 2103
	, 2105
	, 2106
	, 2107
	, 2104
	, 210401
	, 210402
	, 210403
	, 210404
	, 210405
	, 210407
	, 210406
	, 210408
	, 0 
	, 13 
	, 1301 
	, 1302 
	, 10 
	, 1001 
	, 1002 
	, 1003 
	, 18 
	, 1801 
	, 1802 
	, 12 
	, 17 
	, 15 
	, 1501 
	, 1502 
	, 1503 
	, 16 
	, 1601 
	, 1602 
	, 20
]));