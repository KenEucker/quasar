(function (win) {
	if (!win.initSatellite) {
		win.initSatellite = function (campaign, adType, container, body, _win, sendToGA) {
			_win = _win || win.parent;
			body = body || win.body;
			sendToGA = sendToGA != null ? sendToGA : true;
			_win.satellite = _win.satellite || [];

			_win.satellite.push(function () {
				var satelliteData = {
					campaign: campaign,
					adType: adType
				};

				_win.satellite.register(campaign, satelliteData, container, sendToGA);
				_win.satellite.attachTo(campaign, body);
			});
		};
	}
})(window);
