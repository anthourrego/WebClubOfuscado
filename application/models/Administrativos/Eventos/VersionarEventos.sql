WITH EventoConNumeroDeFila AS (
	SELECT
		EventoId,
		Evento,
		[Version],
		Estado,
		ROW_NUMBER() OVER (PARTITION BY Evento ORDER BY [Version] DESC) AS NumeroDeFila
	FROM
		Evento
)
UPDATE e
SET
	estado = 'VR'
FROM
	Evento e
	INNER JOIN EventoConNumeroDeFila en ON e.EventoId = en.EventoId
WHERE
	en.NumeroDeFila <> 1; -- Actualizar todos los registros excepto el ultimo para cada evento