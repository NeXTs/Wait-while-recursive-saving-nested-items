<?php 
	// emulate server response
	if(isset($_GET['id'])) {
		$response = array(
			"erros" => false,
			"data" => array(
				"id" => $_GET['id'],
				"title" => $_GET['title'],
				"mode" => $_GET['mode'],
				"type" => $_GET['type']
			)
		);
		usleep(150000);
		echo json_encode($response);
		return;
	}
?>

<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Recursive wait while saving nested items</title>
    <link rel="stylesheet" type="text/css" href="css/reset.css"/>
    <link rel="stylesheet" type="text/css" href="css/styles.css"/>
</head>

<body>
    <div class="container">
        <ul class="questions"></ul>
    </div>
</body>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script type="text/javascript" src="js/scrips.js"></script>
</html>
