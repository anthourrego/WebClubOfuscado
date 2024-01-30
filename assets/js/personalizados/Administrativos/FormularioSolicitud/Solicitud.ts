type TipoAspirante = {
	TipoAspiranteId: number;
	Nombre: string; // Titular,
	Texto: string; // html,
	Estado: string; // "A",
};

type TipoAspiranteRequisito = {
	TipoAspiranteRequisitoId: number;
	Nombre: string; // Titular,
	Requerido: string; // ,
	Adjunto: string; // ,
	Tipo: string; // ,
	Estado: string; // "A",
};

type ReferenciaComercial = {
	ReferenciaId: number;
	HeadAspiranteSolicitudId: number | null;
	Cedula: string;
	Nombre: string;
	Telefono: string;
	Parentesco: string; // 0;
	Actulizado?: Date;
	FechaModif?: Date;
	Observacion: string;
	Tipo: string;
	Accion: string;
	Empresa: string;
	TiempoConoce: string;
	RelacionSocial: string;
	Negocio: string;
	CalseNegocio?: string;
	TiempoEnCiudad: string;
	ConceptoConyuge: string;
	ConceptoHijos: string;
	SociosConoce: Text;
};

type HeadAspiranteSolicitud = {
	TipoAspiranteId: number;
	Nombre: string;
	Texto: string;
	Orden: number;
	Estado: string;
};
