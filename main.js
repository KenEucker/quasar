const electron = require('electron');
const cli = require('./cli');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow, PORT = process.env.PORT || '3720';

const electrify = () => {
    cli.run({ 
        runAsProcess: true,
        watchJobs: true,
        runWebForm: true,
        autoBuildWebForm: true,
        runApi:true })
        .then(() => {
          console.log('Loading electron app...');
          return createWindow(); });
}

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 1200, height: 800});
    mainWindow.loadURL(`http://localhost:${PORT}`);
    // mainWindow.webContents.openDevTools()

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