// On dom content load
document.addEventListener('DOMContentLoaded', function() {
  addNavListener();
});

// Menu navigation
function addNavListener() {
  var navLinks = document.getElementsByClassName('nav');

  for(var i = 0; i < navLinks.length; i++) {
  	navLinks[i].onclick = function(e) {
  		navigateTo(e.target.getAttribute('data-nav'));
  	}
  }
}

// Adding the event handler to the buttons progressing the page
function addButtonListener() {
  // ToDo: Add event progression from the buttons
}

// ToDo: Replace with animation
function navigateTo(target) {
	var main = document.getElementsByTagName('main')[0],
			sections = main.getElementsByTagName('div');

	for(var i = 0; i < sections.length; i++) {
		sections[i].style.display = 'none';
	}

	document.getElementById(target).style.display = 'block';
}