<?php
$page_title = 'Home';
$active_nav_tab = 'Home';
include(APP_PATH . 'pages/header.php');
$releases = ChessBoard::getReleases();
$mostRecentVersion = $releases[0]['version'];
?>

<h1>ChessBoardJS is a JavaScript Chess Board Widget</h1>

<hr />

<div class="section">
<h2>Usage</h2>

<div style="float: left; width: 400px">
  <h4>HTML</h4>
  <pre class="prettyprint">&lt;div id="board" style="width: 400px"&gt;&lt;/div&gt;</pre>
  <h4>JavaScript</h4>
  <pre class="prettyprint">var board = new ChessBoard('board', 'start');</pre>  
</div>
<div style="float: right; margin-right: 60px">
  <h4>Result:</h4>
  <div id="board" style="width: 400px;"></div>
</div>
<div style="clear:both"></div>

</div><!-- end .section -->

<hr />

<div class="section">
<h2>Get It</h2>
<a class="button large radius" href="releases/<?php echo $mostRecentVersion; ?>/chessboard-<?php echo $mostRecentVersion; ?>.zip" style="line-height: 22px">
  Download Most Recent Version<br />
  <small style="font-weight: normal; font-size: 12px">v<?php echo $mostRecentVersion; ?></small>
</a>
</div>

<script src="js/json3.min.js"></script>
<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/prettify.js"></script>
<script src="js/chessboard.js"></script>
<script>
$(document).ready(function() {
  var board = new ChessBoard('board', 'start');
  prettyPrint();
});
</script>

<?php
include(APP_PATH . 'pages/footer.php');
?>