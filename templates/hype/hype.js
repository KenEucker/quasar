var campaignClickUrl = 'PLACE CLICK URL HERE!';
var clickIDs = [ <%= hypeElements %> ];
var dtadsCampaign = '<%= client %>_<%= campaign %>';
var windowTarget = '<%= clickTarget %>';
var gaID = "<%= googleAnalyticsID %>";
var gaTracker = "gaTracker";

var addGAScript = function() {
	var e = gaID;
	! function(e, t, n, a, i, o, c) {
			e.GoogleAnalyticsObject = i, e[i] = e[i] || function() {
					(e[i].q = e[i].q || []).push(arguments)
			}, e[i].l = 1 * new Date, o = t.createElement(n), c = t.getElementsByTagName(n)[0], o.async = 1, o.src = a, c.parentNode.insertBefore(o, c)
	}(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga"), ga("create", e, "auto", gaTracker), ga(gaTracker + ".require", "linkid", "linkid.js");
}; // End addGAScript();

function videoTracking(video) {

	var eventCategory = 'video_bigtop';
	var videoLabel = video.id;
	var eventLabel = dtadsCampaign + '_' + videoLabel +  '_video_duration_seen_by_user';

	video.setAttribute('controlsList', 'nodownload');

	video.addEventListener("ended", function () {
			window.ga(gaTracker + '.send', "event", eventCategory, "reached_end_of_video", eventLabel, {
					nonInteraction: true
			});

	}, false);

	var passed_q1 = false;
	var passed_q2 = false;
	var passed_q3 = false;

	video.addEventListener("timeupdate", function () {
			var duration = Math.round(this.duration);
			var current  = Math.round(this.currentTime);
			var quarter =  Math.round(duration / 4);

			if ( current === quarter && ! passed_q1 ) {

					window.ga(gaTracker + '.send', "event", eventCategory, "first-quartile", eventLabel, {
							nonInteraction: true
					});

					passed_q1 = true;

			} else if ( current === ( quarter * 2 ) && ! passed_q2 ) {

					window.ga(gaTracker + '.send', "event", eventCategory, "second-quartile", eventLabel, {
							nonInteraction: true
					});

					passed_q2 = true;

			} else if ( current === ( quarter * 3 ) && ! passed_q3 ) {

					window.ga(gaTracker + '.send', "event", eventCategory, "third-quartile", eventLabel, {
							nonInteraction: true
					});

					passed_q3 = true;

			}

	}, false);

}

function addClickEvent(el = null, clickName = null, clickUrl = null, clickID = null) {
	if(!clickUrl) {
		clickUrl = campaignClickUrl;
	}

	if(!el) {
		if(!clickID) {
			return;
		}

		el = document.getElementById(clickID);
	}

	if(el) {
		el.onclick = function() {
			window.ga(gaTracker + '.send', 'event', dtadsCampaign, 'click', clickName, {nonInteraction: true});
			var win = window.open(campaignClickUrl, windowTarget);
			if(win) { win.focus(); }
		};
	}
}

function setClickEvents() {
	for(var i = 0; i < clickIDs.length; ++i) {
		var clickName = clickIDs[i];
		var el = document.getElementById(clickName);

		if(el) {
			addClickEvent(el);

			var videoEl = el.querySelector('video');
			if(videoEl) {
				videoTracking(videoEl);
			}
		}
	}
}

function initTracking() {
	addGAScript();
	setClickEvents();
}

window.HYPE_eventListeners = window.HYPE_eventListeners || [];
window.HYPE_eventListeners.push({"type" : "HypeSceneLoad", "callback" : initTracking});