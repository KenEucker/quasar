(function (win) {
	if (!win.initHypeAutoplay) {
		win.initHypeAutoplay = function (hypeDocument, campaign, targetClass, playTimelineImmediately, timelineName, _win) {
			var symbol = hypeDocument.getSymbolInstancesByName('content')[0];

			_win = _win || win.parent;
			var _doc = _win.document;

			var isInViewport = function (element, win) {
				win = win || window;
				var rect = element.getBoundingClientRect();
				var html = win.document.documentElement;
				return (
					rect.top >= 0 &&
					rect.bottom <= (win.innerHeight || html.clientHeight)
				);
			};

			if (playTimelineImmediately) {
				symbol.startTimelineNamed(timelineName);
				_win.satellite.push(function () {
					_win.satellite.track(campaign, {
						event: 'animationStarted',
						eventLabel: 'animationAutoPlayed'
					});
				});
			} else {
				symbol.pauseTimelineNamed(timelineName);
				symbol.goToTimeInTimelineNamed(0, timelineName);

				var locked = false;
				var playTimelineIfNotStarted = function () {
					var hasPlayed = symbol.currentTimeInTimelineNamed(timelineName) !== 0;

					if (!hasPlayed) {
						var scrollTargetElement;

						// attempt to go outside of the frame into the parent and find it's container there
						if (window.frameElement) {
							var outerContainer = window.frameElement.parentElement;
							while (outerContainer.className.indexOf(targetClass) === -1 &&
								outerContainer.tagName.toLowerCase() !== 'body') {
								outerContainer = outerContainer.parentElement;
							}
							// If the parent element found was not found by the targetClass, use the frame element parent
							scrollTargetElement = outerContainer.tagName.toLowerCase() !== 'body' ?
								outerContainer : window.frameElement.parentElement;
						}
						// Failover
						scrollTargetElement = scrollTargetElement || _doc.querySelector(targetClass) || win.document.body;

						if (!scrollTargetElement) {
							console.log('cannot find scrolling element', targetClass);
							locked = true;
							return;
						}

						if (isInViewport(scrollTargetElement, _win)) {
							symbol.startTimelineNamed(timelineName);
							_win.satellite.push(function () {
								_win.satellite.track(campaign, {
									event: 'animationStarted',
									eventLabel: 'animationStartedAfterScrolledIntoView'
								});
							});
						} else {
							locked = false;
						}
					}
				};
				var onScroll = function () {
					if (!locked) {
						_win.requestAnimationFrame(playTimelineIfNotStarted);
						locked = true;
					}
				};

				playTimelineIfNotStarted();
				// set up play on scroll into position
				_win.addEventListener('scroll', onScroll);
			}
		};
	}
})(window);
