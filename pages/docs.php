<?php
$page_title = 'Documentation';
$active_nav_tab = 'Docs';
include(APP_PATH . 'pages/header.php');
$examples = ChessBoard::getExamples();
$docs = ChessBoard::getDocs();
?>

<div class="section">
<h2 id="config">Config</h2>
<table cellspacing="0">
<thead class="center">
<tr>
  <th>Property / Type</th>
  <th>Required</th>
  <th>Default</th>
  <th>Description</th>
  <th>Example</th>
</tr>
</thead>
<tbody>
<?php
foreach($docs['Config Object'] as $prop) {
  echo buildPropRow('config', $prop, $examples);
}
?>
</tbody>
</table>
</div><!-- end div.section -->

<hr class="divider" />

<div class="section">
<h2 id="methods">Methods</h2>
<table cellspacing="0">
<thead class="center">
<tr>
  <th>Method</th>
  <th>Args</th>
  <th>Description</th>
  <th>Example</th>
</tr>
</thead>
<tbody>
<?php
foreach($docs['Methods'] as $method) {
  echo buildMethodRow($method, $examples);
}
?>
</tbody>
</table>
</div><!-- end div.section -->

<hr class="divider" />

<div class="section">
<h2 id="position_object">Position Object</h2>
<p>You can use a JavaScript object to represent a board position.</p>
<p>The object property names must be algebraic squares (ie: e4, b2, c6, etc) and the values must be a valid piece codes (ie: wP, bK, wQ, etc).</p>
<p>See an example of using an object to represent a position <a href="examples#1003">here</a>.</p>
<p>ChessBoard exposes the <a href="examples#4000"><code class="js plain">ChessBoard.objToFen</code></a> method to help convert between Position Objects and <a href="docs#fen_string">FEN Strings</a>.</p>
</div><!-- end div.section -->

<hr class="divider" />

<div class="section">
<h2 id="fen_string">FEN String</h2>
<p>You can use <a href="http://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation">Forsyth-Edwards Notation (FEN)</a> to represent a board position.</p>
<p>Note that FEN notation captures more information than ChessBoard requires, like who's move it is and whether or not castling is allowed. This information will be ignored; only the position information is used.</p>
<p>See an example of using a FEN String to represent a position <a href="examples#1002">here</a> and <a href="examples#1004">here</a>.</p>
<p>ChessBoard exposes the <code class="js plain">ChessBoard.fenToObj</code> method to help convert a FEN String to a <a href="docs#position_object">Position Object</a>.</p>
</div><!-- end div.section -->

<hr class="divider" />

<div class="section">
<h2 id="errors">Errors</h2>
<p>ChessBoard has an error system designed to inform you when you use the API incorrectly.</p>
<p>Every alert has a unique code associated with it and you can control how the errors are presented with the <a href="docs#config:showErrors">showErrors</a> config option.</p>
<table cellspacing="0">
<thead class="center">
<tr>
  <th style="width: 75px">Error ID</th>
  <th style="width: 45%">Error Text</th>
  <th>More Information</th>
</tr>
</thead>
<tbody>
<?php
foreach($docs['Errors'] as $error) {
  echo buildErrorRow($error);
}
?>
</tbody>
</table>
</div><!-- end div.section -->

<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/jquery.color.min.js"></script>
<script>
var flashRow = function(id) {
  var el = $(document.getElementById(id));
  var bgColor = el.css('background-color');
  el.css('background-color', '#ffff99')
    .animate({backgroundColor: bgColor}, 2000);
};

var isRow = function(id) {
  return id.search(/\:/) !== -1;
};

var clickAnchor = function(e) {
  var id = $(this).attr('href').replace(/docs#/, '');
  if (isRow(id) === true) {
    flashRow(id);
  }
};

var init = function() {
  $('body').on('click', 'a', clickAnchor);

  window.location.hash = window.location.hash.replace('%3a', ':');

  // give it just a smidge more time to load
  setTimeout(function() {
    if (isRow(window.location.hash) === true) {
      flashRow(window.location.hash.replace('#', ''));
    }
  }, 150);
};

$(document).ready(init);
</script>

<?php
include(APP_PATH . 'pages/footer.php');

//------------------------------------------------------------------------------
// Functions
//------------------------------------------------------------------------------

// NOTE: I know the spaces and linebreaks here are annoying and unnecessary
//       I'm optimizing for "View Source"

function buildPropRow($propType, $prop, $examples) {
  $html = '';

  // table row
  $html .= '<tr id="'.$propType.':'.$prop['name'].'">'."\n";

  // property and type
  $html .= '  <td>'."\n";
  $html .= buildPropertyAndType($propType, $prop['name'], $prop['type']);
  $html .= '  </td>'."\n";

  // required
  $html .= '  <td class="center">'.buildReq($prop['req']).'</td>'."\n";

  // default
  if (array_key_exists('leftAlignDefault', $prop) === true) {
    $html .= '  <td>'.buildDefault($prop['default']).'</td>'."\n";
  }
  else {
    $html .= '  <td class="center">'.buildDefault($prop['default']).'</td>'."\n";
  }

  // description
  $html .= '  <td>'."\n";
  $html .= buildDesc($prop['desc']);
  $html .= '  </td>'."\n";

  // examples
  $html .= '  <td>'."\n";
  $html .= buildExamplesCell($prop['examples'], $examples);
  $html .= '  </td>'."\n";

  $html .= '</tr>'."\n";

  return $html;
}

function buildMethodRow($method, $examples) {
  $nameNoParens = preg_replace('/\(.+$/', '', $method['name']);

  $html = '';

  // table row
  if (array_key_exists('noId', $method) === true) {
    $html .= "<tr>\n";
  }
  else {
    $html .= '<tr id="methods:'.$nameNoParens.'">'."\n";
  }

  // name
  $html .= '  <td><a href="docs#methods:'.$nameNoParens.'"><code class="js plain">'.$method['name'].'</code></a></td>'."\n";

  // args
  if (array_key_exists('args', $method) === true) {
    $html .= '  <td>'."\n";
    foreach ($method['args'] as $arg) {
      $html .= '    <p><code class="js plain">'.$arg[0].'</code> - '.$arg[1].'</p>'."\n";
    }
    $html .= '  </td>'."\n";
  }
  else {
    $html .= '  <td><small>none</small></td>'."\n";
  }

  // description
  $html .= '  <td>'."\n";
  $html .= buildDesc($method['desc']);
  $html .= '  </td>'."\n";

  // examples
  $html .= '  <td>'."\n";
  $html .= buildExamplesCell($method['examples'], $examples);
  $html .= '  </td>'."\n";

  $html .= "</tr>\n";

  return $html;
}

function getExampleByNumber($number, $examples) {
  $number = (int) $number;
  foreach ($examples as $ex) {
    if (intval($ex['number'], 10) === $number &&
        $ex['js'] !== '') {
      return $ex;
    }
  }
  return false;
}

function buildPropertyAndType($section, $name, $type) {
  $html  = '    <p><a href="docs#'.$section.':'.$name.'"><code class="js plain">'.$name.'</code></a></p>'."\n";
  $html .= '    <p>'.buildType($type).'</p>'."\n";
  return $html;
}

function buildType($type) {
  if (is_array($type) !== true) {
    $type = array($type);
  }

  $html = '';
  for ($i = 0; $i < count($type); $i++) {
    if ($i !== 0) {
      $html .= ' <small>or</small><br />';
    }
    $html .= $type[$i];
  }

  return $html;
}

function buildReq($req) {
  if ($req === false) {
    return 'no';
  }
  if ($req === true) {
    return 'yes';
  }
  return $req;
}

function buildDesc($desc) {
  if (is_array($desc) !== true) {
    $desc = array($desc);
  }
  $html = '';
  foreach ($desc as $d) {
    $html .= '    <p>'.$d.'</p>'."\n";
  }
  return $html;
}

function buildDefault($default) {
  if ($default === false) {
    return '<small>n/a</small>';
  }
  return $default;
}

function buildExamplesCell($ex, $allExamples) {
  if (is_array($ex) !== true) {
    $ex = array($ex);
  }

  $html = '';
  foreach ($ex as $exNum) {
    if (array_key_exists($exNum, $allExamples) !== true) continue;

    $example = $allExamples[$exNum];

    $html .= '    <p><a href="examples#'.$exNum.'">'.$example['Name'].'</a></p>'."\n";
  }
  return $html;
}

function buildErrorRow($error) {
  $html = '';

  // table row
  $html .= '<tr id="errors:'.$error['id'].'">'."\n";

  // id
  $html .= '  <td class="center"><a href="docs#errors:'.$error['id'].'">'.$error['id'].'</a></td>'."\n";

  // desc
  $html .= '  <td>'.htmlspecialchars($error['desc']).'</td>'."\n";

  // more information
  if (array_key_exists('fix', $error) === true) {
    if (is_array($error['fix']) !== true) {
      $error['fix'] = array($error['fix']);
    }

    $html .= '  <td>'."\n";
    foreach ($error['fix'] as $p) {
      $html .= '    <p>'.$p.'</p>'."\n";
    }
    $html .= '  </td>'."\n";
  }
  else {
    $html .= '  <td><small>n/a</small></td>'."\n";
  }

  $html .= "</tr>\n";

  return $html;
}

?>