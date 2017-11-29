var campaignClickUrl = '<%= clickUrl %>';
var windowTarget = '<%= windowTarget %>';
document.querySelector('.image').onclick = function() {
	var win = window.open(window.open(campaignClickUrl, windowTarget));
	if(win) { win.focus(); }
};