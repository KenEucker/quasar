(function (win) {
	if (!win.initGoogleAnalytics) {
		win.initGoogleAnalytics = function (gaID, gaTracker, _win, _doc) {
			_win = _win || win.parent;
			_doc = _doc || _win.document;
			_win.gaTrackers = _win.gaTrackers || [];

			if (!_win.ga) {
				! function (e, t, n, a, i, o, c) {
					e.GoogleAnalyticsObject = i, e[i] = e[i] || function () {
							(e[i].q = e[i].q || []).push(arguments)
						}, e[i].l = 1 * new Date, o = t.createElement(n), c = t.getElementsByTagName(n)[0], o.async = 1, o.src = a, c
						.parentNode
						.insertBefore(o, c)
				}(_win, _doc, "script", "https://www.google-analytics.com/analytics.js", "ga");

				_win.ga("create", gaID, "auto", gaTracker);
				_win.ga(gaTracker + ".require", "linkid", "linkid.js");
				_win.gaTrackers.push(gaTracker);
			} else {
				_win.ga("create", gaID, "auto", gaTracker);
				_win.ga(gaTracker + ".require", "linkid", "linkid.js");
				_win.gaTrackers.push(gaTracker);
			}
		};
	}
})(window);
