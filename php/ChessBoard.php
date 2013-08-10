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

public static function getExampleGroups() {
  $exampleGroups = self::getJSON('examples.json');

  $exampleGroups2 = array();
  foreach ($exampleGroups as $group) {
    // strip the "----------------" comments
    if (is_array($group) !== true) continue;

    array_push($exampleGroups2, $group);
  }

  return $exampleGroups2;  
}

// returns an array of all the examples
public static function getExamples() {
  $examples = array();
  $exampleFiles = glob(APP_PATH.'examples/*.example');
  foreach ($exampleFiles as $filename) {
    $contents = file_get_contents($filename);
    $example = self::parseExampleFile($contents);

    $number = str_replace('.example', '', $filename);
    $number = preg_replace('/.+\//', '', $number);

    $example['number'] = $number;

    $examples[$number] = $example;
  }

  return $examples;
}

// get a single example
// returns false if the example does not exist
public static function getExample($number) {
  $number = (int) $number;
  $filename = APP_PATH.'examples/'.$number.'.example';

  $contents = file_get_contents($filename);
  if ($contents === false) {
    return false;
  }

  $example = self::parseExampleFile($contents);
  $example['number'] = $number;

  return $example;
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

private static function parseExampleFile($contents, $delimiter = '===') {
  $contents = explode("\n", $contents);
  $example = array();
  $currentSection = false;

  foreach ($contents as $line) {
    // new section
    if (preg_match('/^'.$delimiter.'/', $line) === 1) {
      $currentSection = trim(str_replace($delimiter, '', $line));
      $example[$currentSection] = '';
      continue;
    }

    if ($currentSection === false) continue;

    $example[$currentSection] .= $line."\n";
  }

  foreach ($example as $section => $content) {
    $example[$section] = trim($content);
  }

  return $example;
}

} // end class ChessBoard

?>