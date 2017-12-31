const electron = require('electron'),
  path = require('path'),
  app = electron.app,
  BrowserWindow = electron.BrowserWindow;
  // isRunningInAsar = require('electron-is-running-in-asar'),
  // runningInElectronPackagedApp = isRunningInAsar();
let appRoot = app.getAppPath(),// runningInElectronPackagedApp ? process.resourcesPath : process.cwd(),
  quasar = null, mainWindow, PORT = process.env.PORT || '3720';

const electrify = () => {
  // console.log(`running quasar CLI with API and webform`);
  quasar = quasar ? quasar : require(`${appRoot}/quasar.js`);
  quasar.runCLI({
        appRoot: appRoot,
        runAsProcess: true,
        watchJobs: true,
        runWebForm: true,
        autoBuildWebForm: true,
        runApi: true })
        .then(() => {
          console.log('Creating app window');
          return createWindow(); });
}

const createWindow = () => {
    // Create the browser window
    mainWindow = new BrowserWindow({width: 1200, height: 800});
    let title = appRoot; // 'quasar'
    try {
      quasar = require(`${appRoot}/quasar.js`);
    } catch (e) {
      title = `failed: ${e}`;
    }
    // console.log(title);
    mainWindow.setTitle(title);
    mainWindow.loadURL(`http://localhost:${PORT}`);
    // mainWindow.webContents.openDevTools();

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
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});