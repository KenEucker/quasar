const electron = require('electron'),
  path = require('path'),
  quasar = require('./quasar'),
  app = electron.app,
  BrowserWindow = electron.BrowserWindow,
  isRunningInAsar = require('electron-is-running-in-asar'),
  appRoot = isRunningInAsar() ? process.resourcesPath : process.cwd();

let mainWindow, PORT = process.env.PORT || '3720';

const electrify = () => {
  console.log(quasar);
  quasar.cli.run({
        appRoot: appRoot,
        runAsProcess: true,
        watchJobs: true,
        runWebForm: true,
        autoBuildWebForm: true,
        runApi: true })
        .then(() => {
          console.log('Loading electron app...');
          return createWindow(); });
}

const createWindow = () => {
    // Create the browser window
    mainWindow = new BrowserWindow({width: 1200, height: 800});
    const title = process.env.PWD;//app.getAppPath('./');
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