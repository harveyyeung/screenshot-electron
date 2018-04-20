const {
    globalShortcut,
    ipcMain,
    BrowserWindow,
    desktopCapturer,
    screen
  } = require('electron');
  const path = require('path');
  const {shotcutUrl,server,isDev} = require('./config')


  const logger = require('./logger');
  // 保证函数只执行一次
  let isRuned = false
  const $windows = []
  let isClose = false
  module.exports = class shortcutCapture{
    constructor(){
      if(isRuned){return}
      isRuned=true;
      //------- 注册全局快捷键,用于目前测试，如后续需要此功能，请开发人员写到合适的位置，测试之后请删除此处快捷代码
      // globalShortcut.register('ctrl+alt+x', function () {
      //     logger.info('shortcut-capture.globalShortcut');
      //     //此处目前写死了一个binderid，如后期加非单独会话截图，请不要传递binderid
      //     //__mainWindow__.webContents.send('shortcut-capture')
      //     __mainWindow__.webContents.send('shortcut-capture','BlPhmZ5dDdN95gyGsERFjU8')
      //
      // });
      //  binder内截图发送
      ipcMain.on('anp::SHORTCUT_CAPTURE_BY_BINDERID', (e, binderId) => {
        console.log('shortcut-capture-by-binderid', e, binderId);
        __mainWindow__.webContents.send('shortcut-capture', binderId);
      });
      //------- 
      // 抓取截图之后显示窗口
      ipcMain.on('shortcut-captureed', (e,source,obj) => {
       this.$sendObj=obj;
       logger.info( "this.$sendObj"+this.$sendObj);
       this.closeWindow();
       this.createWindow(source,__mainWindow__);
      })
      
      ipcMain.on('cancel-shortcut-capture', (e) => {
           this.closeWindow();
           setTimeout(() => {
               __mainWindow__.show();
           }, 0);

      });

      ipcMain.on('send-shortcut-capture', (e, dataURL) => {
         this.closeWindow();
         __mainWindow__.show();
         __mainWindow__.webContents.send('upload-shortcut-file',this.$sendObj,dataURL);
       })
    }
    
    createWindow (source,__mainWindow__) {
      if($windows.length)return;
      const $win = new BrowserWindow({
        fullscreen: true,
        width: 900,
        height: 800,
        alwaysOnTop: true,
        skipTaskbar: false, 
        autoHideMenuBar: true, 
        show:false,
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
          plugins:true,
          preload: path.join(__dirname, './common/imageRect.js')
        }
      })

      // this.setFullScreen($win, display)
      // 只能通过cancel-shortcut-capture的方式关闭窗口
      $win.on('close', e => {
        this.closeWindow();
        setTimeout(()=>{
          __mainWindow__.show();
        },0);
      })

     if (isDev) {
        $win.webContents.openDevTools();
      }

      // 页面初始化完成之后再显示窗口
      // 并检测是否有版本更新
      $win.once('ready-to-show', () => {
        __mainWindow__.hide();
        $win.show()
        $win.focus()
        // 重新调整窗口位置和大小
        // this.setFullScreen($win, display)
      })
      $win.webContents.on('dom-ready', () => {
        //$win.webContents.executeJavaScript(`window.source = ${JSON.stringify(source)}`)
        $win.webContents.send('dom-ready')
        $win.focus()
      })
      logger.info(`${shotcutUrl}`);
      $win.loadURL(`${shotcutUrl}`)
      $windows.push($win)
    }
    
    
    closeWindow () {
      isClose = true
      while ($windows.length) {
        const $winItem = $windows.pop()
        $winItem.close()
      }
      isClose = false
    }


  }
  



  