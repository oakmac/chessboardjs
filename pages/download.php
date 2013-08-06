<?php
$page_title = 'Download';
$active_nav_tab = 'Download';
include(APP_PATH . 'pages/header.php');
$releases = ChessBoard::getReleases();
$mostRecentVersion = $releases[0]['version'];
?>

<div class="section">
<h1>Downloads</h1>
<a class="button large radius" href="releases/<?php echo $mostRecentVersion; ?>/chessboardjs-<?php echo $mostRecentVersion; ?>.zip" style="line-height: 22px">
  Download Most Recent Version<br />
  <small style="font-weight: normal; font-size: 12px">v<?php echo $mostRecentVersion; ?></small>
</a>
</div>

<?php
foreach ($releases as $release) {
  if (array_key_exists('released', $release) === true && $release['released'] === false) continue;
  echo buildRelease($release);
}
?>

<div class="section">
<h4>Development</h4>
<p><a href="https://github.com/oakmac/chessboardjs/">GitHub</a></p>
</div>

<?php
include(APP_PATH . 'pages/footer.php');

//------------------------------------------------------------------------------
// Functions
//------------------------------------------------------------------------------

function buildRelease($release) {
  $v = $release['version'];

  $html  = '<div class="section release">'."\n";
  $html .= '<h4>v'.$v.' <small>released on '.$release['date'].'</small></h4>'."\n";
  $html .= '<ul>'."\n";
  foreach ($release['files'] as $file) {
    $html .= '  <li><a href="releases/'.$v.'/'.$file['name'].'">'.$file['name'].'</a> <small>'.$file['size'].'</small></li>'."\n";
  }
  $html .= '</ul>'."\n";
  $html .= '<h6>Changes:</h6>'."\n";
  $html .= '<ul class="disc">'."\n";
  foreach ($release['changes'] as $change) {
    $html .= '  <li>'.htmlspecialchars($change).'</li>'."\n";
  }
  $html .= '</ul>'."\n";
  $html .= '</div>'."\n\n";

  return $html;
}

?>