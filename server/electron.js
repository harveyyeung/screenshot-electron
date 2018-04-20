const { app, BrowserWindow, Tray, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const logger = require('./logger');
const { isDev, indexUrl } = require('./config');

const fs = require('fs');

let mainWindow,
  shortcutCapture,
  typeHotkeyMap = {};
let willQuitApp = false;

function appStart() {
  const shouldQuit = app.makeSingleInstance(() => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  if (shouldQuit) {
    app.quit();
  }

}

function createWindow() {
  const ShortcutCapture = require('./shortcut-window');
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 716,
    height: 400,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      preload: path.join(__dirname, './common/prescreenshot.js')
    }
  });
  global.__mainWindow__ = mainWindow;
  mainWindow.loadURL(indexUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', (e) => {
    if (willQuitApp) {
      mainWindow = null;
    } else if (process.platform === 'darwin' || process.platform === 'win32') {
      e.preventDefault();
      mainWindow.hide();
    }
  });
 
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    logger.info('Main window is closed.');
  });

 
  mainWindow.setFullScreen(false);
  mainWindow.webContents.on('did-finish-load', () => {
    shortcutCapture = new ShortcutCapture();

  });










}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  mainWindow.show();
});

app.on('certificate-error', (event, webContents, requestUrl, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
});

app.on('before-quit', () => {
  willQuitApp = true;
});

app.on('quit', () => {
  logger.info('App is quiting...');
});

process.on('uncaughtException', (err) => {
  logger.error(err);
  process.exit(500);
});


const hotkeyTypeActionMap = {
  hideMainWindow: () => {
    logger.info('Trigger ctrl+w');
    mainWindow.hide();
  },
  screenCapture:()=>{
    logger.info('Trigger screen capture');
    mainWindow.webContents.send('shortcut-capture')
  }
};

const configHotkey = (type, hotkeyString) => {
  typeHotkeyMap[type] && globalShortcut.unregister(typeHotkeyMap[type]);
  if (hotkeyTypeActionMap[type]) {
    typeHotkeyMap[type] = hotkeyString;
    globalShortcut.register(hotkeyString, () => {
      hotkeyTypeActionMap[type]();
    });
  }
};
const unregisterAllHotkey = () => {
  for (const type in typeHotkeyMap) {
    globalShortcut.unregister(typeHotkeyMap[type]);
  }
};

const unregisterHotkeyByType = (type) => {
  if( typeHotkeyMap[type]) {
    globalShortcut.unregister(typeHotkeyMap[type]);
  }
};

//  注册全局快捷键截图
ipcMain.on('anp::UPDATE_SREENSHOT_HOT_KEY', (e, hotkey) => {
  console.log('UPDATE_SREENSHOT_HOT_KEY', e, hotkey);
  configHotkey("screenCapture",hotkey)
});
ipcMain.on('anp::REMOVE_SREENSHOT_HOT_KEY', (e) => {
  console.log('REMOVE_SREENSHOT_HOT_KEY');
  unregisterHotkeyByType("screenCapture");
});


appStart();
