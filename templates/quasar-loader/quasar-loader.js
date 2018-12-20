(function () {
	var quasarInfo = '<%= id %>';
	var cdnBaseUrl = 'https://cdn.dtcn.com/';
	var cdnBasePath = 'ads/test/2018/7/hype-in-content/';
	var cdnHtmlFile = '.html';
	var sourceHypeResourcesName = 'bricks';
	var oType = 'hype';
	var startScript = '<script type="text/javascript" charset="utf-8" src="';
	var endScript = '</script>';

	var extractString = function (string, start, end, omitStartAndEnd = false) {
		var startIndex = string.indexOf(start);
		var startSearch = startIndex + start.length + 1;
		var endIndex = string.substring(startSearch).indexOf(end) + startSearch;
		var meat = string.substring(startIndex, endIndex + end.length);

		if (!omitStartAndEnd) {
			return meat;
		}

		return meat.replace(start, '').replace(end, '');
	};

	var insertHypeUnit = function () {
		fetch(cdnBaseUrl + cdnBasePath + sourceHypeResourcesName + '.html')
			.then((res) => {
				return res.text()
			})
			.then((hypeHtml) => {
				hypeHtml = hypeHtml.replace('src="', 'src="' + cdnBaseUrl + cdnBasePath);
				var hypeScript = extractString(hypeHtml, startScript, endScript);
				var hypeScriptUrl = extractString(hypeScript, 'src="', '"', true);
				var hypeScriptUrlPrepended = hypeScriptUrl;

				fetch(hypeScriptUrl)
					.then((res) => {
						return res.text()
					})
					.then((scriptInnards) => {
						var hypeScriptName = extractString(scriptInnards, "HYPE-", ".full.min.js").replace(".full.min.js", '');
						scriptInnards = scriptInnards.replace(new RegExp(hypeScriptName, 'g'), cdnBaseUrl + cdnBasePath + sourceHypeResourcesName + '.hyperesources/' + hypeScriptName);
						var scripts = hypeScript + '<script>' + scriptInnards + '</script>';
						hypeHtml = hypeHtml.replace(hypeScript, scripts);
						var iframe = document.getElementById('google_ads_iframe_/5611/dt.dgt.www_2');
						iframe.contentDocument.write(hypeHtml);
					});
			});
	}

	var insertAnyUnit = function () {
		var preScript = "<script> \
            var _style = window.parent.document.createElement('style'); \
            var styleStr = ' \
                    .m-pg-slot:first-child { \
                        position: relative; \
                        width: 314px; \
                        height: 596px; \
                    } \
                    .m-pg-slot:first-child .cta{ \
                        position: relative; \
                        z-index: 5; \
                    } \
                    .m-pg-slot .sponsored-image { \
                        position: absolute; \
                        top: 0px; \
                        left: 0px; \
                        width: 100%; \
                        height: auto; \
                    } \
                    @media (max-width: 800px) { \
                        .m-pg-slot:first-child { \
                            float: none; \
                            margin: 0 auto 50px; \
                        } \
                        .m-pg-slot:first-child { \
                            width: 371px; \
                        } \
                    } \
                    @media (max-width: 1077px) { \
                        .m-pg-slot .sponsored-image { \
                            width: 371px; \
                        } \
                    } \
                '; \
                _style.innerText = styleStr; \
                window.parent.document.head.appendChild(_style);";

		fetch(cdnBaseUrl + cdnBasePath + cdnHtmlFile)
			.then((res) => {
				return res.text();
			})
			.then((data) => {
				var iframe = document.getElementById('google_ads_iframe_/5611/dt.dgt.www_2');
				iframe.contentDocument.write(data);
			});
	}

	switch (oType) {
		case 'hype':
			insertHypeUnit();
			break;

		default:
			insertAnyUnit();
			break;
	}

})();
