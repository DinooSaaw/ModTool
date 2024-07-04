const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'The Brightest Candle Mod Tool',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // Remove the default menu
  const customMenu = Menu.buildFromTemplate([]);
  Menu.setApplicationMenu(customMenu);

  ipcMain.on('search-name', (event, name) => {
    const searchWindow = new BrowserWindow({
      width: 600,
      height: 400,
      title: 'The Brightest Candle Mod Tool',
      icon: path.join(__dirname, 'assets', 'icon.ico'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    });
    searchWindow.loadFile('search.html');
    searchWindow.webContents.on('did-finish-load', () => {
      searchWindow.webContents.send('display-name', name);
    });
  });
}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
