<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title><?php echo PROJECT_NAME; ?><?php if (isset($page_title)) echo ' &raquo; '.$page_title; ?></title>
  <base href="<?php echo BASE_URL; ?>" />
  <meta name="viewport" content="width=device-width">
  <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon" />
  <link rel="stylesheet" href="css/normalize-2.1.2.min.css" />
  <link rel="stylesheet" href="css/foundation-3.2.5.min.css" />
  <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:regular,semibold|Droid+Sans+Mono" />
  <link rel="stylesheet" href="css/site.css" />
  <link rel="stylesheet" href="css/chessboard.css" />
</head>
<body>

<?php echo ChessBoard::buildTopBar($active_nav_tab); ?>

<div class="row" id="body_container">
<div class="twelve columns">
