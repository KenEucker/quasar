/**
 * @description gets the outermost container for the current document, 
 * 	if the document is inside an iframe then it will be the container of the iframe,
 * 	if the document is not inside an iframe then it will be the body
 * @param {string} targetSelector
 * @param {boolean} [allFolders=false]
 * @async
 * @returns {promise}
 * @memberof QuasarRuntime
 */
var getScrollTargetElement = function (targetSelector, _doc, body) {
	targetSelector = targetSelector.replace(, '');

	// attempt to go outside of the frame into the parent and find it's container there
	if (window.frameElement) {
		var outerContainer = window.frameElement.parentElement;
		while (outerContainer.className.indexOf(targetClass) === -1 &&
			outerContainer.tagName.toLowerCase() !== 'body') {
			outerContainer = outerContainer.parentElement;
		}
		// If the parent element found was not found by the targetSelector, use the frame element parent
		scrollTargetElement = outerContainer.tagName.toLowerCase() !== 'body' ?
			outerContainer : window.frameElement.parentElement;
	} else {
		_doc.querySelector(targetSelector) || body;
	}
}
