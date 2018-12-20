(function (win) {
	if (!win.initHypeScroller) {
		win.initHypeScroller = function (
			hypeDocument,
			targetClass
		) {
			var timelineName = "Main Timeline";
			var locked = false;
			var duration, symbol, scrollTargetElement;
			var barkeep = null;

			var _win = window.parent;
			var _doc = _win.document;

			// check for barkeep
			try {
				barkeep =
					_win.DT && _win.DT.Barkeep ?
					_win.DT.Barkeep :
					barkeep;
				barkeep =
					_win.Barkeep && !barkeep ? _win.Barkeep : barkeep;
			} catch (e) {
				console.error(e);
			}

			// set vals
			symbol = hypeDocument.getSymbolInstancesByName(
				"content"
			)[0];
			duration = symbol.durationForTimelineNamed(
				timelineName
			);

			var scrubTimeline = function () {
				if (!scrollTargetElement) {
					// attempt to go outside of the frame into the parent and find it's container there
					if (window.frameElement) {
						var outerContainer =
							window.frameElement.parentElement;
						while (
							outerContainer.className.indexOf(
								targetClass
							) === -1 &&
							outerContainer.tagName.toLowerCase() !==
							"body"
						) {
							outerContainer = outerContainer.parentElement;
						}
						// If the parent element found was not found by the targetClass, use the frame element parent
						scrollTargetElement =
							outerContainer.tagName.toLowerCase() !==
							"body" ?
							outerContainer :
							window.frameElement.parentElement;
					}
				}
				// Failover
				scrollTargetElement =
					scrollTargetElement ||
					_doc.querySelector(targetClass) ||
					win.document.body;

				if (!scrollTargetElement) {
					console.log(
						"cannot find scrolling element",
						targetClass
					);
					locked = true;
					return;
				}

				if (scrollTargetElement) {
					var mod =
						barkeep && barkeep.fixed_height ?
						barkeep.fixed_height :
						0;
					var winHeight = _win.innerHeight - mod;

					var elRect = scrollTargetElement.getBoundingClientRect();
					var elPos = _win.innerHeight - elRect.top;
					var endLimit = winHeight + elRect.height;
					var startLimit = 0;
					var elPosPercentage =
						elPos / (endLimit - startLimit);

					if (elPos >= startLimit && elPos <= endLimit) {
						symbol.goToTimeInTimelineNamed(
							duration * elPosPercentage,
							timelineName
						);
						// console.log(elPosPercentage + '\n' + symbol.currentTimeInTimelineNamed(timelineName), duration);
					}

					locked = false;
				}
			};

			var onScroll = function () {
				if (!locked) {
					_win.requestAnimationFrame(scrubTimeline);
					locked = true;
				}
			};
			// calc timeline pos
			scrubTimeline();

			// calc timeline pos on scroll
			_win.addEventListener("scroll", onScroll);
		};
	}
})(window);
