<!DOCTYPE HTML>
<html class="vh-100" style="background: #ecf0f5;" lang="es">

  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <title>Cocora A&B - Prosof</title>
    <link rel="shortcut icon" type="image/x-icon" href="<?=base_url()?>assets/img/ico/favicon.ico">

    <!-- Bootstrap Core CSS -->
    <link href="<?= base_url() ?>assets/css/bootstrap.min.css" rel="stylesheet"> 

    <!-- Font Awesome -->
    <link href="<?= base_url() ?>assets/css/font-awesome/css/all.min.css" rel="stylesheet">

  </head>
  <body class="bg-transparent">
    <div class="container">
      <div class="card mt-5">
        <div class="card-body">
          <h5><i class="fas fa-exclamation-triangle"></i>  <?=  count($nombreReporte) > 1 ? 'Los siguientes reportes no estan disponibles' :  'El siguiente reporte no esta disponible' ?>  </h5>

          <h6 class="card-subtitle text-muted <?= isset($contenidoReporte) ? "" : "d-none"?>">
            <ul class="mt-3">
							<?php 	
								for($i=0; $i < count($nombreReporte) ; $i++) { 
									echo '<li> Ajustes -> Modifica Reporte -> Reporte  '.$nombreReporte[$i].'</li>';
								}; 
							?>
            </ul>
            <?= $contenidoReporte ?>.
          </h6>
					
          <h6 class="card-subtitle text-muted <?= isset($contenidoReporte) ? "d-none" : ""?>">
            <!-- No se ha encontrado registro del reporte</strong>. -->
						 <br>
            Puede configurarlo en la siguiente ruta si tiene los permisos correspondientes: <br><br>
            <ul>
							<?php 	
								for($i=0; $i < count($nombreReporte) ; $i++) { 
									echo '<li> Ajustes -> Modifica Reporte -> Reporte  '.$nombreReporte[$i].'</li>';
								}; 
							?>
            </ul>
            <?php
              //Validamos si tiene permiso al modulo para darle acceso directo a el. 
              if (loginPermisos([1002], false)) {
            ?>
              <br>
              O presionando el siguiente botón el sistema lo redireccionará al módulo correspondiente. <br><br>
							
							<a class="btn btn-primary"  <?=  (isset($otraPestana) && $otraPestana) ? 'target="_blank"' :  '' ?>  href="<?= base_url("Administrativos/Ajustes/ModificaReporte")?>"><i class="fas fa-file-alt"></i> Modifica Reporte</a>
									
            <?php
              }
            ?>
          </h6>
        </div>
      </div>
    </div>
  </body>
</html> 
