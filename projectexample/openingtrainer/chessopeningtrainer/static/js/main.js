// referenced from https://www.w3schools.com/howto/howto_js_filter_lists.asp

function searchbar() {
    // Declare variables
    var input, filter, ol, li, a, i, txtValue;
    input = document.getElementById('searchbar');
    filter = input.value.toUpperCase();
    ol = document.getElementById("openingslist");
    li = ol.getElementsByTagName('li');
  
    // Loop through all list items, and hide those that don't match the search query
    for (i = 0; i < li.length; i++) {
      txtValue = li[i].textContent || li[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }
