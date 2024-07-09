const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const Store = require('./store.js');

const data = new Store({
  configName: 'user-data',
  defaults: {
    Token: "",
    ClientId: "",
    BroadcasterId: 0,
  }
});

let editWindow;

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'The Brightest Candle Mod Tool',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  mainWindow.webContents.openDevTools();

  mainWindow.loadFile('index.html');

  const customMenu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Reset User Data',
          click: () => {
            data.set('Token', '');
            data.set('ClientId', 'xoqw101tcirrskbzn3rpbqt2kdjhu0');
            data.set('BroadcasterId', 0);
            mainWindow.webContents.send('reset-data');
          }
        },
        {
          label: 'Edit User Data',
          click: () => {
            createEditUserDataWindow();
          }
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(customMenu);

  ipcMain.on('search-name', (event, name) => {
    if (typeof name !== 'string') {
      console.error('Invalid input for name');
      return;
    }

    const searchWindow = new BrowserWindow({
      width: 600,
      height: 400,
      title: 'The Brightest Candle Mod Tool',
      icon: path.join(__dirname, 'assets', 'icon.ico'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false
      }
    });
    searchWindow.loadFile('search.html');
    searchWindow.webContents.on('did-finish-load', () => {
      searchWindow.webContents.send('display-name', name);
    });
  });

  ipcMain.handle('get-user-data', () => {
    return data.getAll();
  });

  ipcMain.on('save-user-data', (event, userData) => {
    data.set('ClientId', userData.ClientId);
    data.set('Token', userData.Token);
    data.set('BroadcasterId', userData.BroadcasterId);
    if (editWindow) {
      editWindow.close();
    }
  });
}

function createEditUserDataWindow() {
  editWindow = new BrowserWindow({
    width: 400,
    height: 300,
    title: 'Edit User Data',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  editWindow.loadFile('editUserData.html');
  editWindow.webContents.openDevTools();
  editWindow.on('closed', () => {
    editWindow = null;
  });
}

app.on('ready', createMainWindow);

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
