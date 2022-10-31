<?php

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$url='https://newsapi.org/v2/top-headlines?country=' . $_REQUEST['country'] . '&apiKey=f7104effcb7b402ab87a8a7d596f174d';
	// $config['useragent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.26';
	$userAgent = $_SERVER['HTTP_USER_AGENT'];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);
	// curl_setopt($curl, CURLOPT_USERAGENT, $config['useragent']);
	// curl_setopt($curl, CURLOPT_REFERER, 'https://www.domain.com/');
	curl_setopt( $ch, CURLOPT_USERAGENT, $userAgent );

	$result=curl_exec($ch);

	

	

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>