(function (_win) {
	var _doc = _win.document;
	var logoLinkEl = _doc.querySelector('nav .logo a');
	var githubUrl = logoLinkEl ? logoLinkEl.getAttribute('href') : '';

	// Footer sugar
	{
		var footerEl = _doc.querySelector('footer');
		var footerLogoEl = _doc.querySelector('footer .logo');
		var footerLinkEl = _doc.createElement('a');
		footerLinkEl.setAttribute('href', githubUrl);
		footerLinkEl.setAttribute('target', '_blank');

		footerEl.insertBefore(footerLinkEl, footerLogoEl);
		footerLinkEl.appendChild(footerLogoEl);
	}

	// If this is a file page, then add github file links
	{
		var article = _doc.querySelector('article');
		if (article) {
			var lineText = article.querySelector('#line2 .com');
			var lineContainsFileDocumentation = lineText ? lineText.innerHTML.indexOf('@file') !== -1 : false;
			if (lineContainsFileDocumentation) {
				var filename = lineText.innerHTML.replace(' * @file ', '');

				var githubButtonsTemplateEl = function (filename) {
					var btnGroup = document.createElement('div');
					btnGroup.className = "github-buttons";
					btnGroup.innerHTML = '<ul class="button-group"><li><a class="button" target="_blank" href="' + githubUrl + '/raw/master/scripts/' + filename + '">Raw</a></li> \
						<li><a class="button" target="_blank" href="' + githubUrl + '/blame/master/scripts/' + filename + '">Blame</a></li> \
						<li><a class="button" target="_blank" href="' + githubUrl + '/commits/master/scripts/' + filename + '">History</a></li></ul>';
					return btnGroup;
				}

				var githubButtons = githubButtonsTemplateEl(filename);
				article.insertBefore(githubButtons, article.childNodes[0]);
			}
		}
	}

	{
		var readme = _doc.querySelector('article.readme');

		if (readme) {
			readme.querySelectorAll('a[href^="about/"]').forEach(function (aboutLink) {
				var linkName = aboutLink.getAttribute('href').replace('about/', '').replace('.md', '');
				aboutLink.href = 'tutorial-' + linkName + '.html';
			});
		}
	}
})(window);
