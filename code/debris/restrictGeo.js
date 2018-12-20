(function (win) {
	if (!win.restrictGeo) {
		win.restrictGeo = function (hypeDocument, targetClass) {
			var geos = ['ca', 'au', 'gb', 'my', 'ae'];
			var geoipdata = _win.DT.getGeoIpData();
			var countryCode = geoipdata.country.code.toLowerCase();
			if (
				geos.length &&
				geoipdata &&
				typeof geoipdata === 'object' &&
				geoipdata.country &&
				geos.indexOf(countryCode) === -1
			) {
				return;
			}
		};
	}
})(window);
