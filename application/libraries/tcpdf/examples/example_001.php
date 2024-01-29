<?php
//============================================================+
// File name   : example_001.php
// Begin       : 2008-03-04
// Last Update : 2013-05-14
//
// Description : Example 001 for TCPDF class
//               Default Header and Footer
//
// Author: Nicola Asuni
//
// (c) Copyright:
//               Nicola Asuni
//               Tecnick.com LTD
//               www.tecnick.com
//               info@tecnick.com
//============================================================+

/**
 * Creates an example PDF TEST document using TCPDF
 * @package com.tecnick.tcpdf
 * @abstract TCPDF - Example: Default Header and Footer
 * @author Nicola Asuni
 * @since 2008-03-04
 * @group header
 * @group footer
 * @group page
 * @group pdf
 */

// Include the main TCPDF library (search for installation path).
require_once('tcpdf_include.php');

// create new PDF document
$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

$pdf->startPageGroup();

// Add a page
// This method has several options, check the source code documentation for more information.
$pdf->AddPage();

// Set some content to print
$html = <<<EOD
<table align="left" cellpadding="0" cellspacing="0" style="border-color:#e5e5e5; height:2187px; width:100%">
	<tbody>
		<tr>
			<td rowspan="3" style="text-align:center; width:20%"><img alt="" src=""></td>
			<td style="text-align:center; width:60%"><span style="font-size:14px"><span style="color:#27ae60"><strong>CORPORACION CLUB CAMPESTRE MEDELLIN</strong></span></span></td>
			<td style="text-align:center; width:20px">&nbsp;</td>
		</tr>
		<tr>
			<td colspan="2" style="text-align:center"><span style="color:#27ae60"><span style="font-size:11px"><strong>Cotización. No.</strong></span></span></td>
		</tr>
		<tr>
			<td colspan="2" style="text-align:center"><strong><span style="color:#27ae60"><span style="font-size:11px">Reserva. No.</span></span></strong></td>
		</tr>
		<tr>
			<td colspan="12" style="text-align:center"><hr></td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center">&nbsp;</td>
		</tr>
		<tr>
			<td colspan="8">Señor(es)</td>
		</tr>
		<tr>
			<td colspan="8"><span style="font-size:16px"><strong>SEBASTIAN ARTEAGA RONGA</strong></span></td>
		</tr>
		<tr>
			<td colspan="8"><span style="font-size:14px">1010024429 </span></td>
		</tr>
		<tr>
			<td colspan="8"><span style="font-size:14px">dev.camilo.sepulveda@gmail.com</span></td>
		</tr>
		<tr>
			<td colspan="8"><span style="font-size:14px">4192919</span></td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center">&nbsp;</td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center">&nbsp;</td>
		</tr>
		<tr>
			<td colspan="8"><span style="font-size:14px">Cordial Saludo:</span></td>
		</tr>
		<tr>
			<td colspan="8">De acuerdo con su solicitud nos complace enviarle la cotización con diferentes alternativas de menú y precios para la realización de su evento en nuestras instalaciones.</td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center">&nbsp;</td>
		</tr>
		<tr>
			<td colspan="8">A continuación le relaciono los datos de su reserva y algunas de nuestras sugerencias de menú, las cuales esperamos sean de su agrado.</td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center">&nbsp;
			<table border="1" cellpadding="1" cellspacing="1" style="width:816px">
				<tbody>
					<tr>
						<td style="text-align:left; width:60%"><strong>Evento</strong></td>
						<td style="text-align:right; width:20%"><strong>Fecha Inicio</strong></td>
						<td style="text-align:right; width:60%"><strong>Fecha Fin</strong></td>
						<td style="text-align:right; width:20%"><strong>Pers.</strong></td>
					</tr>
					<tr>
						<td style="text-align:left; width:60%">Evento de Prueba</td>
						<td style="text-align:right; width:20%">2023-08-08</td>
						<td style="text-align:right; width:20%">2023-08-11</td>
						<td style="text-align:right; width:20%">10</td>
					</tr>
				</tbody>
			</table>

			<hr>
			<p style="text-align:left">&nbsp;</p>

			<p style="text-align:left"><span style="font-size:16px"><strong>Lugares</strong></span></p>

			<hr>
			<p>&nbsp;</p>

			<table border="0" cellpadding="1" cellspacing="1" style="width:816px">
				<tbody>
					<tr>
						<td style="text-align:left; width:60%"><strong>Nombre</strong></td>
						<td style="text-align:right; width:20%"><strong>Fecha Inicio</strong></td>
						<td style="text-align:right; width:20%"><strong>FechaFin</strong></td>
					</tr>
				</tbody>
			</table>

			<p style="text-align:left">&nbsp;</p>

			<p style="text-align:left"></p>

			<table border="0" cellpadding="1" cellspacing="1" style="width:816px">
				<tbody>
					<tr>
						<td style="text-align:left; width:60%">Piscina Comunal&nbsp; / Piscina&nbsp;</td>
						<td style="text-align:right; width:20%">08/08/2023</td>
						<td style="text-align:right; width:20%">11/08/2023</td>
					</tr>
				</tbody></table><p></p>

			<p style="text-align:left">&nbsp;</p>

			<hr>
			<p style="text-align:left"><span style="font-size:16px"><strong>MENUS:</strong></span></p>

			<hr>
			<p>&nbsp;</p>

			<table border="0" cellpadding="1" cellspacing="1" style="width:816px">
				<tbody>
					<tr>
						<td style="text-align:left; width:50%"><strong>Nombre</strong></td>
						<td style="text-align:right; width:20%"><strong>Cantidad</strong></td>
						<td style="text-align:right; width:30%"><strong>Valor</strong></td>
					</tr>
				</tbody>
			</table>

			<p style="text-align:left"><label style="display: block;text-align: left;"> &nbsp;</label></p><ul style="padding: 0px;margin-bottom: 0;"><li style="text-align:left">DESAYUNO</li><p></p>

			<table border="0" cellpadding="1" cellspacing="1" style="height:29px; width:816px">
				<tbody>
					<tr>
						<td style="text-align:left; width:50%">R CHESSECAKE DE FRUTOS AMARILLOS</td>
						<td style="text-align:right; width:20px">10</td>
						<td style="text-align:right; width:30%">$ <strong>16,200</strong></td>
					</tr>
				
					<tr>
						<td style="text-align:left; width:50%">R MERENGON DE DURAZNO</td>
						<td style="text-align:right; width:20px">10</td>
						<td style="text-align:right; width:30%">$ <strong>15,200</strong></td>
					</tr>
				</tbody></table><p></p></ul><label style="display: block;text-align: left;"> &nbsp;<ul style="padding: 0px;margin-bottom: 0;"><li style="text-align:left">ALMUERZO</li><p></p>

			<table border="0" cellpadding="1" cellspacing="1" style="height:29px; width:816px">
				<tbody>
					<tr>
						<td style="text-align:left; width:50%">DAY SPA-KIWI SPA</td>
						<td style="text-align:right; width:20px">10</td>
						<td style="text-align:right; width:30%">$ <strong>311,000</strong></td>
					</tr>
				
					<tr>
						<td style="text-align:left; width:50%">DLM SOCIO</td>
						<td style="text-align:right; width:20px">10</td>
						<td style="text-align:right; width:30%">$ <strong>1</strong></td>
					</tr>
				</tbody></table><p></p></ul><label style="display: block;text-align: left;"> &nbsp;<ul style="padding: 0px;margin-bottom: 0;"><li style="text-align:left">Nuevo Menú</li><p></p>

			<table border="0" cellpadding="1" cellspacing="1" style="height:29px; width:816px">
				<tbody>
					<tr>
						<td style="text-align:left; width:50%">R CLUB COLOMBIA</td>
						<td style="text-align:right; width:20px">10</td>
						<td style="text-align:right; width:30%">$ <strong>40,000</strong></td>
					</tr>
				
					<tr>
						<td style="text-align:left; width:50%">R CLUB COLOMBIA NEGRA 330</td>
						<td style="text-align:right; width:20px">10</td>
						<td style="text-align:right; width:30%">$ <strong>5,400</strong></td>
					</tr>
				</tbody></table><p></p></ul><p></p>

			<p style="text-align:left">&nbsp;</p>

			<hr>
			<p style="text-align:left"><span style="font-size:16px"><strong>OTROS:</strong></span></p>

			<hr>
			<p>&nbsp;</p>

			<table border="0" cellpadding="1" cellspacing="1" style="width:816px">
				<tbody>
					<tr>
						<td style="text-align:left; width:50%"><strong>Nombre</strong></td>
						<td style="text-align:right; width:20%"><strong>Cantidad</strong></td>
						<td style="text-align:right; width:30%"><strong>Valor</strong></td>
					</tr>
				</tbody>
			</table>

			<p style="text-align:left"></p>

			<table border="0" cellpadding="1" cellspacing="1" style="width:816px">
				<tbody>
					<tr>
						<td style="text-align:left; width:50%">R MENU DEL DIA TENIS PASTA</td>
						<td style="text-align:right; width:20%">2</td>
						<td style="text-align:right; width:30%">$ <strong>35,000</strong></td>
					</tr>
				</tbody></table><p></p>

			<p style="text-align:left">&nbsp;</p>

			<hr>
			<p style="text-align:left"><span style="font-size:16px"><strong>SERVICIOS</strong></span></p>

			<hr>
			<p>&nbsp;</p>

			<table border="0" cellpadding="1" cellspacing="1" style="height:40px; width:816px">
				<tbody>
					<tr>
						<td style="text-align:left; width:50%"><strong>Nombre&nbsp;&nbsp;&nbsp; </strong></td>
						<td style="text-align:right; width:20%"><strong>Cantidad&nbsp; </strong></td>
						<td style="text-align:right; width:30%"><strong>&nbsp; Valor </strong></td>
					</tr>
				</tbody>
			</table>

			<p style="text-align:left"></p>

			<table border="0" cellpadding="1" cellspacing="1" style="width:816px">
				<tbody>
					<tr>
						<td style="text-align:left; width:50%">ALQUILER DE UNIFORMES Y VESTIMENTAS EMPLEADOS</td>
						<td style="text-align:right; width:20%">3</td>
						<td style="text-align:right; width:30%">&nbsp; $ <strong>0</strong></td>
					</tr>
				</tbody></table><p></p>

			<p style="text-align:left">&nbsp;</p>

			<hr>
			<p style="text-align:left"><span style="font-size:16px"><strong>FIJOS</strong></span></p>

			<hr>
			<p>&nbsp;</p>

			<table border="0" cellpadding="1" cellspacing="1" style="width:816px">
				<tbody>
					<tr>
						<td style="text-align:left; width:80%"><strong>Nombre</strong></td>
						<td style="text-align:right; width:20%"><strong>Cantidad</strong></td>
					</tr>
				</tbody>
			</table>

			<p style="text-align:left"></p>
			</label></label></td>
		</tr>
		<tr>
			<td colspan="8">
			<p><strong>Observación: </strong></p>
			</td>
		</tr>
		<tr>
			<td colspan="8"></td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center">&nbsp;</td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center">&nbsp;</td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center"><strong><span style="color:#27ae60"><span style="font-size:18px">LOS PRECIOS INCLUYEN IMPUESTOS</span></span></strong></td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center">
			<hr></td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:justify">El club ofrece los servicios de navegación WEB y correo electrónico a través de enlaces de banda ancha, otros tipos de servicios como VPN, accesos remotos, video conferencias etc. se deben solicitar con minimo 8 dias de anticipación con el fin de evaluar su viabilidad de acuerdo a las políticas de seguridad informática.</td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center">&nbsp;</td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center">
			<hr></td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center"><span style="color:#27ae60"><span style="font-size:11px"><strong>CORPORACION CLUB CAMPESTRE MEDELLIN</strong></span></span></td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center"><span style="font-size:11px"><strong>NIT: 890981947       Régimen Común</strong></span></td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center"><span style="font-size:11px">CALLE 16A SUR No 34 -  950 Teléfonos: 3259000 Ciudad: </span></td>
		</tr>
		<tr>
			<td colspan="8" style="text-align:center">
			<p>&nbsp;</p>

			<p>&nbsp;</p>
			</td>
		</tr>
	</tbody>
</table>
EOD;

// Print text using writeHTMLCell()
$pdf->writeHTML($html, true, 0, true, 0, '');

$pdf->setTitle('Pruebas');

// ---------------------------------------------------------

// Close and output PDF document
// This method has several options, check the source code documentation for more information.
$pdf->Output($_SERVER['DOCUMENT_ROOT'] . 'dev/TCPDF/examples/pdfs/example_001.pdf', 'I');
//$doc = $pdf->Output('example_001.pdf', 'S');

//============================================================+
// END OF FILE
//============================================================+
