type Lugar = {
	GrupoMaximo: number; // 10,
	GrupoMinimo: number; // 1,
	Icono: string; // "Lugar_1.jpeg",
	Nombre: string; // "Sala de juntas",
	TLNombre: string; // "Sala de juntas",
	TMNombre: string | null; // "Mesas Redondas",
	allDay: boolean; // true,
	fechafin: Date; // "2023-06-25T05:00:00.000Z",
	fechaini: Date; // "2023-06-21T05:00:00.000Z",
	lugarid: string; // "001"
	tipomontaje?: string; // "5"
	Valor?: string | number;
};

type Invitado = {
	A0: string; // N° Documento
	A1: string; // Nombre
	A2: string; // Fecha Nacimiento
	A3: string; // Telefono
	A4: string; // Email
	A5: string; // Observación
};

type Producto = {
	ElementoId?: number; // 9;
	Imagen: string | null; // null;
	ProductoId: string; // "006383";
	Valor: string | number; // ".00";
	ValorOriginal: string | number;
	cantidad: number; // 0;
	cantidadMax?: number; // 1;
	menu?: string; // "001";
	nombre: string; // "MUEBLE MADERA";
	nombreMenu?: string; // "Sala de juntas";
	total: number; // 0;
	minimo: string | number;
	maximo: string | number;
	ivaid: string | number | null;
	AlmacenMenuId?: string;
};

type Version = {
	EventoId: number;
	Version: number;
	Estado: string;
	// WHEN 'BO' THEN 'Borrador'

	// WHEN 'CT' THEN 'Cotizado'
	// WHEN 'VR' THEN 'Versionado'

	// WHEN 'CC' THEN 'Confirmado Cliente'
	// WHEN 'RE' THEN 'Rechazado Cliente'

	// WHEN 'NU' THEN 'Anulado'
	// WHEN 'CO' THEN 'Confirmado'

	// WHEN 'CN' THEN 'Cotizar Nuevamente'

	// WHEN 'EX' THEN 'Expirado'
	// WHEN 'VE' THEN 'Vencido'
	// WHEN 'FI' THEN 'Finalizado'
	// WHEN 'AC' THEN 'Activo'
	FechaSolici: Date;
};

type Cuerpo = {
	CuerpoId: number;
	Nombre: string;
	Texto: string;
	Orden: number;
	Estado: string;
};

export type Reserva = {
	disponibilidad: {
		agrupar: boolean; // true,
		description: string; // "Privado",
		fechafin: string; // "2023-06-25",
		fechaini: string; // "2023-06-21",
		lugares: Lugar[];
		nombre: string; // "Evento de Prueba",
		personas: number; // 10;
		tipoevento: string; // "1",
		tipoeventonombre: string; // "Privado"
	};
	datosBasicos: {
		boleteria: boolean; // false,
		hombres: number; // 3,
		interno: boolean; // false,
		manejalista: boolean; // true,
		medioReservaNombre: string; // "Teléfono",
		medioreserva: string; // "001",
		menu: boolean; // true,
		mujeres: number; // 3,
		ninas: number; // 1,
		ninos: number; // 3,
		observacion: string; // "Evento con mesas redondas en el glamour palace",
		tercero: {
			accion: string; // "5346",
			email: string; // "jorge@gmail.com",
			nombre: string; // "JORGE ARTURO ARTEAGA CARREÑO",
			telefono: string; // "5776844",
			terceroid: string; // "19189208"
		};
		tiposmontaje: boolean; // true,
		vendedor: string; // "1743",
		vendedorNombre: string; // "ANTHONY WILL SMITH"
	};
	complementos: {
		elementosFijos: Producto[];
		// ElementoId: 9,
		// Imagen: null,
		// ProductoId: "006383",
		// Valor: ".00",
		// cantidad: 0,
		// cantidadMax: 1,
		// menu: "001",
		// nombre: "MUEBLE MADERA",
		// nombreMenu: "Sala de juntas",
		// total: 0

		menus: Producto[];
		// ProductoId: "016395",
		// Valor: 28800,
		// cantidad: 10,
		// menu: "0",
		// nombre: "R BANDEJA DE NACHOS ",
		// nombreMenu: "DESAYUNO",
		// total: 288000

		otros: Producto[];
		// Imagen: null,
		// ProductoId: "000013",
		// Valor: ".00",
		// cantidad: 3,
		// nombre: "MP ACEITUNA NEGRA DESHUESADA GFA 3000 GR",
		// total: 0

		servicios: Producto[];
		// Imagen: null,
		// ProductoId: "000013",
		// Valor: ".00",
		// cantidad: 3,
		// nombre: "MP ACEITUNA NEGRA DESHUESADA GFA 3000 GR",
		// total: 0
	};
	invitados: Invitado[];
	cotizacion: {
		eventoId: number;
		evento: number;
		version: number;
		versiones: Version[];
		ultimaVersion: boolean;
		edicion?: boolean;
		cambiosEvento?: boolean;
		cuerpos: {
			CT: Cuerpo[];
			OT: Cuerpo[];
			CO: Cuerpo[];
		};
	};
};
