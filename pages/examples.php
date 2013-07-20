<?php
$page_title = 'Examples';
$active_nav_tab = 'Examples';
include(APP_PATH . 'pages/header.php');
$examples = ChessBoard::getExamples();
$examplesGroups = ChessBoard::getExampleGroups();
?>

<div class="row">

<div class="three columns">
<div id="examples_list_container">
<?php echo buildExamplesList($examplesGroups, $examples); ?>
</div><!-- end #examples_list -->
</div><!-- end .three.columns -->

<div class="nine columns">
  <h2 id="example_name"></h2>
  <p><a href="#" id="example_single_page_link" target="_blank">View example in new window.</a></p>
  <p id="example_desc_container"></p>
  <div id="example_html_container"></div>
  <h4>JavaScript</h4>
  <div id="example_js_container"></div>
  <h4>HTML</h4>
  <div id="example_show_html_container"></div>
</div>

</div><!-- end div.row -->

<script src="js/json3.min.js"></script>
<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/prettify.js"></script>
<script src="js/chessboard.js"></script>
<script>
window.console = window.console || {};
console.log = console.log || function() {};

// yo dawg, i heard you like code...
var examples = {};
<?php
foreach ($examples as $ex) {
  echo "\n";
  echo 'examples["'.$ex['number'].'"] = {'."\n";
  if (array_key_exists('Description', $ex) === true) {
    echo '  desc: '.json_encode($ex['Description']).",\n";
  }
  echo '  html: '.json_encode($ex['HTML']).",\n";
  echo '  name: '.json_encode($ex['Name']).",\n";
  echo '  jsStr: '.json_encode(htmlspecialchars($ex['JS'])).",\n";
  echo '  jsFn: function() {'."\n";
  echo $ex['JS']."\n";
  echo '  }'."\n";
  echo '};'."\n\n";
}
?>
// end examples{}

var htmlEscape = function(str) {
  return (str + '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;');
};

var highlightGroupHeader = function(groupIndex) {
  $('div#examples_list_container h4').removeClass('active');
  $('h4#group_header_' + groupIndex).addClass('active');
};

var highlightExample = function(id) {
  $('div#examples_list_container li').removeClass('active');
  $('li#example_' + id).addClass('active');
};

var showExample = function(number) {
  var groupIndex = parseInt($('li#example_' + number)
    .parent('ul').attr('id').replace('group_container_', ''), 10);

  $('ul#group_container_' + groupIndex).css('display', '');
  highlightGroupHeader(groupIndex);
  highlightExample(number);

  $('#example_name').html(examples[number].name);
  $('#example_single_page_link').attr('href', 'examples/' + number);
  $('#example_desc_container').html(examples[number].desc);
  $('#example_html_container').html(examples[number].html);
  $('#example_js_container').html('<pre class="prettyprint">' + examples[number].jsStr + '</pre>');
  $('#example_show_html_container').html('<pre class="prettyprint">' + htmlEscape(examples[number].html) + '</pre>');
  examples[number].jsFn();
  prettyPrint();
};

var clickExample = function() {
  var number = parseInt($(this).attr('id').replace('example_', ''), 10);
  if (examples.hasOwnProperty(number) !== true) return;

  window.location.hash = number;
  loadExampleFromHash();
};

var loadExampleFromHash = function() {
  var number = parseInt(window.location.hash.replace('#', ''), 10);
  if (examples.hasOwnProperty(number) !== true) {
    number = 1000;
    window.location.hash = number;
  }
  showExample(number);
};

var clickGroupHeader = function() {
  var groupIndex = parseInt($(this).attr('id').replace('group_header_', ''), 10);
  var examplesEl = $('ul#group_container_' + groupIndex);
  if (examplesEl.css('display') === 'none') {
    examplesEl.slideDown('fast');
  }
  else {
    examplesEl.slideUp('fast');
  }
};

var init = function() {
  $('#examples_list_container').on('click', 'li', clickExample);
  $('#examples_list_container').on('click', 'h4', clickGroupHeader);
  loadExampleFromHash();
};
$(document).ready(init);
</script>

<?php
include(APP_PATH.'pages/footer.php');

//------------------------------------------------------------------------------
// Functions
//------------------------------------------------------------------------------
function buildExamplesList($exampleGroups, $examples) {
  $html = '';

  $groupIndex = 1;
  foreach ($exampleGroups as $group) {
    $html .= '<h4 id="group_header_'.$groupIndex.'">'.$group['group'].'</h4>'."\n";
    $html .= '<ul id="group_container_'.$groupIndex.'" style="display:none">'."\n";
    foreach ($group['examples'] as $number) {
      $html .= '  <li id="example_'.$number.'">'.$examples[$number]['Name'].'</li>'."\n";
    }
    $html .= '</ul>'."\n";

    $groupIndex++;
  }

  return $html;
}
?>