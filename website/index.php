<?php
// neutralize magic quotes
// http://blogs.sitepoint.com/2005/03/02/magic-quotes-headaches/
if (get_magic_quotes_gpc()) { $_REQUEST = array_map('stripslashes', $_REQUEST); $_GET = array_map('stripslashes', $_GET); $_POST = array_map('stripslashes', $_POST); $_COOKIE = array_map('stripslashes', $_COOKIE); }

// config
require('.config.php');

// load ChessBoard class
require(APP_PATH.'php/ChessBoard.php');

// poor man's routing :)
$URI = explode('/', $_SERVER['REQUEST_URI']);
if ($URI[0] === '') {
  array_shift($URI);
}
if ($URI[0] === 'chessboardjs.com') {
  array_shift($URI);
}

// chop off any GET parameters from the last entry in the array
$URI[count($URI)-1] = preg_replace('/\?.+$/', '', $URI[count($URI)-1]);

// fill in the URI array with blanks so we don't get any array index errors
for ($i = 0; $i < 10; $i++) {
  if (isset($URI[$i]) === false) {
    $URI[$i] = '';
  }
  $URI[$i] = strtolower($URI[$i]);
}

// homepage
if ($URI[0] === '') {
  require(APP_PATH.'pages/home.php');
  die;
}

// docs
if ($URI[0] === 'docs') {
  require(APP_PATH.'pages/docs.php');
  die;
}

// examples
if ($URI[0] === 'examples' && $URI[1] === '') {
  require(APP_PATH.'pages/examples.php');
  die;
}

// single example
if ($URI[0] === 'examples' && $URI[1] !== '') {
  $example = ChessBoard::getExample($URI[1]);
  if ($example !== false) {
    require(APP_PATH.'pages/single_example.php');
    die;
  }
}

// download
if ($URI[0] === 'download') {
  require(APP_PATH.'pages/download.php');
  die;
}

// license
if ($URI[0] === 'license') {
  // just redirect them to the GitHub page for now
  header('HTTP/1.1 307 Temporary Redirect');
  header('Location: https://github.com/oakmac/chessboardjs/blob/master/LICENSE.md');
  die;
}

// anything else 404's
header('HTTP/1.1 404 Not Found');
require(APP_PATH.'pages/404.php');
die;

?>
