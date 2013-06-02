<?php defined('APP_PATH') or die('No direct script access.');

final class ChessBoard {

public static function buildTopBar($active_tab) {
  $tabs = array(
    '' => 'Home',
    'examples' => 'Examples',
    'docs' => 'Docs',
    'download' => 'Download',
  );

  $html  = '<div class="contain-to-grid">'."\n";
  $html .= '<div class="top-bar">'."\n";
  $html .= '<ul>'."\n";
  $html .= '  <li class="name"><h1><a href="">'.PROJECT_NAME.'</a></h1></li>'."\n";
  $html .= '</ul>'."\n";
  $html .= '<ul class="right">'."\n";
  foreach ($tabs as $link => $name) {
    $html .= '  <li class="divider"></li>'."\n";
    if ($active_tab === $name) {
      $html .= '  <li class="active"><a href="'.$link.'">'.$name.'</a></li>'."\n";
    }
    else {
      $html .= '  <li><a href="'.$link.'">'.$name.'</a></li>'."\n";
    }
  }
  $html .= '  <li class="divider"></li>'."\n";
  $html .= '</ul>'."\n";
  $html .= '</div>'."\n";
  $html .= '</div>'."\n";

  return $html;
}

// returns an array of all the examples
public static function getExamples() {
  $examples = self::getJSON('examples.json');
  $examples2 = array();
  for ($i = 0; $i < count($examples); $i++) {
    if (is_array($examples[$i]) !== true) continue;

    $example = $examples[$i];
    $example['html'] = trim(file_get_contents(APP_PATH.'examples/'.$example['number'].'.html'));
    $example['js'] = trim(file_get_contents(APP_PATH.'examples/'.$example['number'].'.js'));
    array_push($examples2, $example);
  }
  return $examples2;
}

// get the html and js file for an example
// returns false if the example does not exist
public static function getExample($number) {
  // example should be an integer
  $number = (int) $number;

  if (file_exists(APP_PATH.'examples/'.$number.'.html') !== true) {
    return false;
  }

  return array(
    'html'   => trim(file_get_contents(APP_PATH.'examples/'.$number.'.html')),
    'js'     => trim(file_get_contents(APP_PATH.'examples/'.$number.'.js')),
    'number' => $number,
  );
}

public static function getDocs() {
  $docs = self::getJSON('docs.json');

  // strip the "----------------" comments
  foreach ($docs as $key => $value) {
    $arr = array();
    for ($i = 0; $i < count($value); $i++) {
      if (is_array($value[$i]) !== true) continue;
      array_push($arr, $value[$i]);
    }
    $docs[$key] = $arr;
  }

  return $docs;
}

public static function getReleases() {
  $releases = self::getJSON('releases.json');

  
  $releases2 = array();
  foreach ($releases as $release) {
    // strip the "----------------" comments
    if (is_array($release) !== true) continue;

    // ignore unreleased versions
    if (array_key_exists('released', $release) === true &&
        $release['released'] === false) {
      continue;
    }

    array_push($releases2, $release);
  }

  return $releases2;
}

//---------------------------------------------------
// Private Functions
//---------------------------------------------------

// this is mostly for my sanity when I'm editing the JSON and forget a comma
private static function getJSON($filename) {
  $data = json_decode(file_get_contents(APP_PATH.'/data/'.$filename), true);
  if (is_array($data) !== true) {
    echo $filename.' is not valid JSON';
    die;
  }
  return $data;
}

} // end class ChessBoard

?>