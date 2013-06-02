<?php
$page_title = 'Home';
$active_nav_tab = 'Home';
include(APP_PATH . 'pages/header.php');
$releases = ChessBoard::getReleases();
$mostRecentVersion = $releases[0]['version'];
?>

<div class="panel radius">
  <h3>AutoCompleteJS is a JavaScript widget that helps your users find things quickly.</h3>
</div>

<div class="section">
  <div id="awesome"></div>
  <input type="button" class="button radius demo-btn" id="runAgainBtn" value="Run Again" style="visibility:hidden" />
</div>

<hr />

<div class="section">
<h2>Usage</h2>
<h4>Code:</h4>
<pre class="prettyprint">
&lt;div id="search_bar"&gt;&lt;/div&gt;
&lt;script src="jquery.js"&gt;&lt;/script&gt;
&lt;script src="autocomplete.js"&gt;&lt;/script&gt;
&lt;script&gt;
var widget = new AutoComplete('search_bar', ['Apple', 'Banana', 'Orange']);
&lt;/script&gt;
</pre>
<h4>Result:</h4>
<div id="search_bar"></div>
</div>

<hr />

<div class="section">
<h2>Get It</h2>
<a class="button large radius" href="releases/<?php echo $mostRecentVersion; ?>/autocomplete-<?php echo $mostRecentVersion; ?>.zip" style="line-height: 22px">
  Download Most Recent Version<br />
  <small style="font-weight: normal; font-size: 12px">v<?php echo $mostRecentVersion; ?></small>
</a>
</div>

<script src="js/json3.min.js"></script>
<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/prettify.js"></script>
<script src="js/chessboard.js"></script>
<script src="js/home.js"></script>

<?php
include(APP_PATH . 'pages/footer.php');
?>