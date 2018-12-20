(function (win) {
	if (!win.initHggProductCard) {
		win.initHggProductCard = function (targetClass, hookClassName) {
			var _win = win.parent;
			var _doc = _win.document;

			hookClassName = 'hgg-sponsor-box';
			targetClass = targetClass || '.dtads-slot-mp > div';

			var boxStyles =
				targetClass + " { \
				width: 100%; \
				position: relative; \
					} \
				@media (max-width: 600px) { \
					" + targetClass + " { \
						padding-top: 140%;\
					} \
				} \
				@media (min-width: 601px) { \
					" + targetClass + " { \
						padding-top: 60%; \
					} \
				} \
				" + targetClass + " iframe { \
					position: absolute; \
					height: 100%; \
					width: 100%; \
					top: 0; \
					bottom: 0; \
					left: 0; \
					right: 0; \
				}";

			var styleEl = _doc.createElement("style");
			styleEl.id = "hgg-mp-styles";
			styleEl.type = "text/css";
			if (styleEl.styleSheet) {
				styleEl.styleSheet.cssText = boxStyles;
			} else {
				styleEl.appendChild(_doc.createTextNode(boxStyles));
			}

			_doc.head.appendChild(styleEl);

			var container = win.frameElement ? _doc.querySelector(targetClass) : win.document.body;
			container = (container.parentElement && container.parentElement.tagName !== 'BODY') ? container.parentElement : container;

			container.classList.add(hookClassName);
		};
	}
})(window);
