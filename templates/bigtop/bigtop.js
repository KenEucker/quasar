var campaignClickUrl = '<%= clickUrl %>';
var windowTarget = '<%= windowTarget %>';
document.querySelector('.image').onclick = function() {
	var win = window.parent.open(campaignClickUrl, windowTarget);
	if(win) { win.focus(); }
};