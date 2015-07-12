<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>chessboard.js &raquo; Home</title>
  <meta name="viewport" content="width=980px, initial-scale=1">
  <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon" />
  <link rel="stylesheet" href="css/normalize-2.1.2.min.css" />
  <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" />
  <link rel="stylesheet" href="css/site2.css" />
  <link rel="stylesheet" href="css/chessboard.css" />
</head>
<body>

<div id="heroWrapper">
<div id="hero" class="body-width">
  <img src="img/chesspieces/wikipedia/bK.png" alt="Black King" />
  <h1>chessboard.js</h1>
  <h3>The easiest way to embed a chess board on your site.</h3>
  <a href="releases/0.3.0/chessboardjs-0.3.0.zip">Download v0.3.0</a>
</div><!-- end #hero -->
</div><!-- end #heroWrapper -->

<div class="nav-bar body-width hover-effect" id="start">
  <a href="#start"><span class="piece">&#9823;</span> Getting Started</a>
  <a href="examples"><span class="piece">&#9819;</span> Examples</a>
  <a href="docs"><span class="piece">&#9820;</span> Documentation</a>
  <a href="download"><span class="piece">&#9822;</span> Download</a>
  <div class="clearfix"></div>
</div>

<div class="vertical-bar"></div>

<div class="body-width">

<div class="col">
  <h2>As easy as two lines.</h2>
  <h4>HTML</h4>
  <pre class="prettyprint">&lt;div id="board1" style="width: 400px"&gt;&lt;/div&gt;</pre>
  <h4>JavaScript</h4>
  <pre class="prettyprint">var board1 = ChessBoard('board1', 'start');</pre>
</div>
<div class="col">
  <div id="board1" style="width: 400px"></div>
</div>
<div class="clearfix"></div>

<div class="col">
  <h2>Customize with a powerful API.</h2>
  <h4>HTML</h4>
  <pre class="prettyprint">&lt;div id="board2" style="width: 400px"&gt;&lt;/div&gt;
&lt;input type="button" id="startBtn" value="Start" /&gt;
&lt;input type="button" id="clearBtn" value="Clear" /&gt;</pre>
  <h4>JavaScript</h4>
  <pre class="prettyprint">var board2 = ChessBoard('board2', {
  draggable: true,
  dropOffBoard: 'trash',
  sparePieces: true
});
$('#startBtn').on('click', board2.start);
$('#clearBtn').on('click', board2.clear);</pre>
</div>
<div class="col">
  <div id="board2" style="width: 400px"></div>
  <input type="button" id="startBtn" value="Start" />
  <input type="button" id="clearBtn" value="Clear" />
</div>
<div class="clearfix"></div>

</div><!-- end .body-width -->

<div id="footerWrapper">
  <div class="body-width">
    <div class="left-col">
      <p>chessboard.js is released under the <a href="https://github.com/oakmac/chessboardjs/blob/master/LICENSE.md">MIT License</a></p>
      <p>the code can be found on <a href="https://github.com/oakmac/chessboardjs/">GitHub</a></p>
    </div>
    <div class="right-col">
      <a href="">Home</a>
      <a href="examples">Examples</a>
      <a href="docs">Docs</a>
      <a href="download">Download</a>
    </div>
    <div class="clearfix"></div>
  </div>
</div><!-- end #footerWrapper -->

<script src="js/json3.min.js"></script>
<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/prettify.js"></script>
<script src="js/chessboard.js"></script>
<script>
function isTouchDevice() {
  return ('ontouchstart' in document.documentElement);
}

$(document).ready(function() {
  prettyPrint();

  // example 1
  var board1 = ChessBoard('board1', 'start');

  // example 2
  var board2 = ChessBoard('board2', {
    draggable: true,
    dropOffBoard: 'trash',
    sparePieces: true
  });
  $('#startBtn').on('click', board2.start);
  $('#clearBtn').on('click', board2.clear);

  // prevent "browser drag" of the black king
  $('#hero img').on('mousedown', function(e) { e.preventDefault(); });

  // prevent hover problems on touch devices
  if (isTouchDevice() === true) {
    $('#start').removeClass('hover-effect');
  }
});
</script>
</body>
</html>
