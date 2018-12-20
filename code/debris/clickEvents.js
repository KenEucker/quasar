(function (win) {
	if (!win.initClickEvents) {
		win.initClickEvents = function (container, clickUrls, clickTarget, campaign, clickEventPrefix, excludeSelector) {
			clickTarget = clickTarget || '_blank';
			clickEventPrefix = clickEventPrefix || 'h-url-';
			excludeSelector = excludeSelector ? ':not(' + excludeSelector + ')' : '';

			var getClassNameTail = function (el, prefix, single) {
				prefix = prefix || 'h-track-';
				var tails = [];

				for (var i = 0; i < el.classList.length; ++i) {
					if (el.classList[i].indexOf(prefix) != -1) {
						var tail = el.classList[i].substr(prefix.length);
						if (!tail.length) {
							tail = null;
						}
						tails.push(tail);
					}
				}

				return !!single && tails.length ? [tails[0]] : tails;
			}

			var addClickEvent = function (el, clickUrl) {
				el.setAttribute('href', clickUrl);
				el.addEventListener('click', function (e) {
					var _win = window.parent;
					var clickUrl = e.currentTarget.attributes.href.value;
					var win = _win.open(clickUrl, clickTarget);

					_win.satellite.push(function () {
						_win.satellite.track(campaign, {
							event: 'externalClick',
							externalClick: clickUrl,
							eventAction: "click",
							eventLabel: 'externalClick'
						});
					});
					if (win) {
						win.focus();
					}
				});
			}

			var elsWithIdSet = container.querySelectorAll('*[id]:not([id=""])' + excludeSelector);
			elsWithIdSet.forEach(function (el) {
				var hasClickUrlClass = el.classList.value.indexOf(clickEventPrefix) != -1;

				if (hasClickUrlClass) {
					var oneBasedIndex = getClassNameTail(el, clickEventPrefix)[0] || 1;
					var clickUrl = clickUrls[oneBasedIndex - 1];

					addClickEvent(el, clickUrl);
				}
			});
		};
	}
})(window);
