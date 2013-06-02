<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <title><?php echo $example['name']; ?> Example</title>
  <base href="<?php echo BASE_URL; ?>" />

<?php if ($example['number'] === 9000): ?>
  <!-- TODO: fix this hack -->
  <link rel="stylesheet" href="css/bootstrap-2.3.0.min.css" />
  <link rel="stylesheet" href="css/datepicker.css" />
<?php endif; ?>

<?php if (IN_PRODUCTION === true): ?>
  <link rel="stylesheet" href="css/autocomplete.css" />
<?php else: ?>
  <link type="text/css" rel="stylesheet/less" href="css/autocomplete.less" />
  <script src="css/less-1.3.0.min.js"></script>
<?php endif; ?>
</head>
<body>
<p><a href="examples#<?php echo $example['number']; ?>">&larr; Back to all examples.</a></p>
<p><a href="examples/<?php echo $example['number']; ?>.js">See the code for this example.</a></p>

<!-- start example code --->
<?php echo $example['html'] . "\n"; ?>
<!-- end example code --->

<script src="js/json3.min.js"></script>
<script src="js/jquery-1.8.2.min.js"></script>
<?php if ($example['number'] === 9000): ?>
<!-- TODO: fix this hack -->
<script src="js/bootstrap-datepicker.js"></script>
<?php endif; ?>
<script src="js/autocomplete.js"></script>
<script>
var init = function() {

//--- start example code ---
<?php echo $example['js'] . "\n"; ?>
//--- end example code ---

}; // end init()
$(document).ready(init);
</script>
</body>
</html>