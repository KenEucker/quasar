const electron = require('electron'),
		path = require('path'),
		app = electron.app,
		BrowserWindow = electron.BrowserWindow;
let quasar = null, mainWindow, PORT = process.env.PORT || '3720', appRoot = app.getAppPath();

const electrify = () => {
		let title = appRoot;
		try {
				// console.log(`running quasar CLI with API and webform`);
				quasar = quasar ? quasar : require(`${appRoot}/quasar.js`);
				quasar.runCLI({
								appRoot: appRoot,
								runAsProcess: true,
								watchJobs: true,
								runWebForm: true,
								autoBuildWebForm: true,
								runApi: true
						})
						.then(() => {
								console.log('Creating app window');
								return createWindow(title);
				});
		} catch (e) {
				title = `failed: ${e}`;
				return createWindow(title);
		}
}

const createWindow = (title = 'quasar') => {
		// Create the browser window
		mainWindow = new BrowserWindow({ width: 1200, height: 800 });
		mainWindow.setTitle(title);
		mainWindow.loadURL(`http://localhost:${PORT}`);
		mainWindow.webContents.openDevTools();

		mainWindow.on('closed', () => {
				mainWindow = null
		})
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