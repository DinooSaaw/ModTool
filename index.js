const { app, BrowserWindow, Menu, ipcMain, Notification } = require("electron");
const path = require("path");
const Store = require("./store.js");

const data = new Store({
  configName: "user-data",
  defaults: {
    Token: "",
    RefreshToken: "",
    ClientId: "",
    clientSecret: "",
    BroadcasterId: 0,
  },
});

const settings = new Store({
  configName: "settings",
  defaults: {
    refreshToken: false,
    darkMode: true,
    notifications: false,
  },
});

let editWindow;

async function refreshToken() {
  try {
    let usingRefreshToken = await settings.get("refreshToken");
    if (!usingRefreshToken) {
      return new Notification({
        title: "Error Refreshing Token",
        body: "Using refresh tokens is off by default. Check your settings!",
      }).show();
    }

    let tokenData = await data.getAll();

    const params = new URLSearchParams();
    params.append("client_id", tokenData.ClientId);
    params.append("client_secret", tokenData.clientSecret); // Assuming this key should be clientSecret
    params.append("refresh_token", encodeURIComponent(tokenData.RefreshToken)); // URL encode the refresh token
    params.append("grant_type", "refresh_token");

    let response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    let newTokenData = await response.json();

    if (newTokenData.access_token && newTokenData.refresh_token) {
      await data.set("Token", newTokenData.access_token);
      await data.set("RefreshToken", newTokenData.refresh_token);
      new Notification({
        title: "Successfully Refreshed The Token",
        body: `The refresh token has been successfully updated! You may continue using the application`,
      }).show();
    } else {
      throw new Error("Failed to refresh token");
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    new Notification({
      title: "Error Refreshing Token",
      body: `Failed to refresh token: ${error.message}`,
    }).show();
  }
}



function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "The Brightest Candle Mod Tool",
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.on("closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  // mainWindow.webContents.openDevTools();

  mainWindow.loadFile("index.html");

  const customMenu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            mainWindow.reload();
          },
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "CmdOrCtrl+Shift+I",
          click: () => {
            mainWindow.webContents.toggleDevTools();
          },
        },
        {
          label: "Open Settings",
          click: () => {
            createSettingsWindow();
          },
        },
        {
          label: "Quit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Data",
      submenu: [
        {
          label: "Reset User Data",
          click: () => {
            data.set("Token", "");
            data.set("ClientId", "");
            data.set("BroadcasterId", 0);
            mainWindow.webContents.send("reset-data");
          },
        },
        {
          label: "Edit User Data",
          click: () => {
            createEditUserDataWindow();
          },
        },
        {
          label: "Refresh token",
          click: () => {
            refreshToken()
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(customMenu);

  ipcMain.on("search-name", (event, name) => {
    if (typeof name !== "string") {
      console.error("Invalid input for name");
      return;
    }

    const searchWindow = new BrowserWindow({
      width: 600,
      height: 400,
      title: "The Brightest Candle Mod Tool",
      icon: path.join(__dirname, "assets", "icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        enableRemoteModule: false,
      },
    });
    searchWindow.loadFile("search.html");
    searchWindow.webContents.on("did-finish-load", () => {
      searchWindow.webContents.send("display-name", name);
    });
  });

  ipcMain.handle("get-user-data", () => {
    return data.getAll();
  });

  ipcMain.handle("get-settings-data", () => {
    return settings.getAll();
  });

  ipcMain.on("save-user-data", (event, userData) => {
    data.set("ClientId", userData.ClientId);
    data.set("clientSecret", userData.clientSecret);
    data.set("Token", userData.Token);
    data.set("RefreshToken", userData.RefreshToken);
    data.set("BroadcasterId", userData.BroadcasterId);
    if (editWindow) {
      editWindow.close();
      mainWindow.reload();
    }
  });
  
  ipcMain.on("save-settings-data", (event, settingsData) => {
    settings.set("refreshToken", settingsData.refreshToken);
    settings.set("darkMode", settingsData.darkMode);
    settings.set("notifications", settingsData.notifications);
    if (settingsWindow) {
      settingsWindow.close();
      mainWindow.reload();
    }
  });
  
}

function createEditUserDataWindow() {
  editWindow = new BrowserWindow({
    width: 400,
    height: 400,
    title: "Edit User Data",
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  editWindow.setMenu(null);

  editWindow.loadFile("editUserData.html");
  editWindow.webContents.openDevTools();
  editWindow.on("closed", () => {
    editWindow = null;
  });
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 400,
    title: "Settings",
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  settingsWindow.setMenu(null);

  settingsWindow.loadFile("settings.html");
  // settingsWindow.webContents.openDevTools();
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

app.on("ready", createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
