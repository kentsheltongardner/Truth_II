function scrollUp(elementID) {
	window.scrollBy(0, document.getElementById(elementID).getBoundingClientRect().top - 50);
}
function getSelectedText() {
	alert(window.getSelection().toString());
}
function toggleStorySectionText(elementID) {
	var element = document.getElementById(elementID);
	if (element.style.display == "block" || element.style.display == "") {
		element.style.display = "none";
	}
	else {
		element.style.display = "block";
	}
}