const electron = require('electron'),
		path = require('path'),
		fs = require('fs'),
		app = electron.app,
		BrowserWindow = electron.BrowserWindow;
let quasar = null, mainWindow, PORT = process.env.PORT || '3720', appRoot = app.getAppPath();

const getIconFilePath = (rootPath = appRoot, iconName = 'icon', iconExt = '.ico') => {
	if (fs.existsSync(`${rootPath}/${iconName}${iconExt}`)) {
		return `${rootPath}/${iconName}${iconExt}`;
	}

	const iconExtensionsInOrder = ['ico', 'icns', 'png', 'jpg'], nextIconExtension = iconExtensionsInOrder.indexOf(iconExt);
	if (nextIconExtension >= 0) {
		return getIconFilePath(rootPath, nextIconExtension);
	} else {
		return false;
	}
}

const showErrorWindow = (error) => {
	const title = `${appRoot} failure: ${error}`;
	let errorContent = `
	<div>
		<h1>Error</h1>
		<h4>Application RootPath:</h4><span>${appRoot}</span>
		<h4>Error Message:</h4><span>${error}</span>
		<h4>Error Stacktrace:</h4><pre>${JSON.stringify(error, null, 2)}</pre>
	</div>`;

	return createWindow(title, errorContent);
}

const electrify = () => {
		try {
				// console.log(`running quasar CLI with API and webform`);
				quasar = quasar ? quasar : require(`${appRoot}/quasar.js`);
				quasar.runCLI({
								appRoot: appRoot,
								runAsProcess: true,
								watchJobs: true,
								runWebForm: true,
								autoBuildWebForm: true,
								runWebApi: true
						})
						.then(() => {
								console.log('Creating app window');
								return createWindow('quasar');
						})
						.catch((e) => {
							return showErrorWindow(e);
						});
		} catch (e) {
				return showErrorWindow(e);
		}
}

const createWindow = (title = 'quasar', htmlContent = null) => {
		// Create the browser window
		const iconPath = getIconFilePath(appRoot);

		mainWindow = new BrowserWindow({ width: 1200, height: 800, icon: iconPath, show: false });
		mainWindow.setTitle(title);
		if (!htmlContent) {
			mainWindow.loadURL(`http://localhost:${PORT}`);
		} else {
			mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURI(htmlContent));
		}
		// mainWindow.webContents.openDevTools();

		mainWindow.on('closed', () => {
				mainWindow = null
		})

		mainWindow.show();
}

app.on('ready', electrify);

app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
				app.quit();
		}
});

app.on('activate', () => {
		if (mainWindow === null) {
				createWindow();
		}
});
