var campaignClickUrl = '<%= clickUrl %>';
var clickTarget = '<%= clickTarget %>';
document.querySelector('.image').onclick = function() {
	var win = window.parent.open(campaignClickUrl, clickTarget);
	if(win) { win.focus(); }
};