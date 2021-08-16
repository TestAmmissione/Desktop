const sha256 = require('./sha256.js');
const sha512 = require('./sha512.js');
const aes = require('./aes.js'); // Non usato realmente

const crypto = require('crypto');
const os = require('os');
const electron = require('electron');

const path = require('path');
const { Tray, ipcMain, dialog, session, shell, app, BrowserWindow, clipboard, globalShortcut } = electron;
const auth = require('oauth-electron-facebook')

//const Sentry = require('./sentry');
const { ipcRenderer } = require('electron');
const isOSX = process.platform === 'darwin';

const makeString = (length) => {
  let text = "";
  const possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const generateMac = () => {
  let networkInterfaces = os.networkInterfaces();
  for(networkInterface in networkInterfaces) {
    let interface = networkInterfaces[networkInterface];
    for(interfaceName in interface) {
      let mac = interface[interfaceName].mac;
      if (mac != '00:00:00:00:00:00') {
        for (let i=0; i<5; i++) mac = mac.replace(':', '');
        mac = mac.toLowerCase();
        return mac;
      }
    }
  }
  throw '';
};

const generateLxzppP = (appVersion) => {
  try {
    let string1 = makeString(64);
    let sha = sha512(appVersion); // 128
    let secret = 'a2wq4eas6cxcd8sf9s6x';
    let mac = generateMac();
    let string3 = makeString(24);
    let string2 = makeString(16);
    let message = "";
    //let win = "WINDOWS";
    //const winCipher = crypto.createCipher('aes256', secret);
    const winDecipher = crypto.createDecipher('aes256', secret);

    let encryptedWin = '7bfee2f92dc27ab13e2f441efb8d66dc';
  
    let decryptedWin = winDecipher.update(encryptedWin, 'hex', 'utf8');
    decryptedWin += winDecipher.final('utf8');
  
    //console.log("WIN: ", decryptedWin);
    let secret2 = '1au4137ffpp57sf45lgypg4h';
    //let OSX = "OSX";
    // const OSXCipher = crypto.createCipher('aes256', secret2);
    const OSXDecipher = crypto.createDecipher('aes256', secret2);

    let encryptedOSX = '9a55164734782db79be81d9760f5faf1';
  
    let decryptedOSX = OSXDecipher.update(encryptedOSX, 'hex', 'utf8');
    decryptedOSX += OSXDecipher.final('utf8');
  
    let os = (process.platform !== 'darwin') ? decryptedWin : decryptedOSX;
  
    let sha2 = sha256(os); // 64
  
    message = string1 + sha + string3 + mac + string2 + sha2;

    return Buffer.from(sha512(Buffer.from(message).toString('base64')) + Buffer.from(message).toString('base64')).toString('base64');
  } catch(error) {
    return ""; 
  }
};

let isMinimizedFromFullScreen = false;
let fistTimeClose = true;
let getTitle = () => {
  let title = 'Ammissione ';
  const appVersion = app.getVersion();
  let arrayVersion = appVersion.split('.');
  return title + arrayVersion[0] +  '.' + arrayVersion[1]; 
} 


const createWindow = () => {
  // Ritorna le dimensioni dello schermo
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;

  let secret = 'n30u57jhokdup5bi9z85rqua1h1l9sevlc3u1nu4177ffsg57sf45sgypg3h';
  let title = getTitle();
  
  // Finestra principale dell'applicazione

  // Opzioni della finestra principale
  // Altre opzioni usabili: modal: true, frame: false, resizable: false, parent: splash
/*
  // Center è importante per rendere invisibile la finestra senza bordi bianchi, mettere le dimensioni dello schermo ci assicura che la finestra sia effettivamente al centro
  // Altre opzioni: backgroundColor: '#322a37', vibrancy: 'ultra-dark'
  let splashOptions = null; 
  //if (isOSX) {
  splashOptions = { 'width': width, 'height': height, center: true, frame: false, resizable: false, alwaysOnTop: true, show: false, transparent: true,  focusable: false };
  //} else {
    //splashOptions = { 'width': width, 'height': height, center: true, frame: false, resizable: false, alwaysOnTop: true, show: false, transparent: true };
  //}
  let splash = null;
  splash = new BrowserWindow(splashOptions);
  splash.setMenu(null);
  splash.loadFile('index.html');
*/
  //splash.once('ready-to-show', () => {
    let mainOptions = null; 
    mainOptions = {  
      'width': width, 'height': height, icon: 'icon.ico', title: title, 
      frame: true, resizable: true, movable: true, show: false, focusable: true,
      webPreferences: {
        nodeIntegration: true,
        //preload: path.join(__dirname, 'sentry.js'),
        webSecurity: false,
        webviewTag: true,
        allowRunningInsecureContent: true,
        plugins: true
      }
    };
    mainWindow = new BrowserWindow(mainOptions);
    mainWindow.setMenu(null); 
    //mainWindow.openDevTools();

    if(isOSX) mainWindow.setSheetOffset(height/2 - 150);

    let closeApplication = () => {
      /*
      if(isOSX) mainWindow.setSheetOffset(height/2 - 150);
      const choice = dialog.showMessageBox(mainWindow, {
        type: 'question',
        title: title,
        buttons: [ 'No', 'Sì' ],
        message: 'Vuole uscire dalla simulazione?',
        defaultId: 0,
        cancelId: 0
      });
      const leave = (choice === 1);
      if (leave) {
        */
          mainWindow.close();
      // }
    };

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
  
    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow.destroy();
      mainWindow = null;
    });

    mainWindow.once('ready-to-show', () => {
      if (!isOSX) clipboard.clear('image');
      mainWindow.show();
      mainWindow.maximize();
      mainWindow.focus();
    });
  
    // let url = 'http://127.0.0.1:8888/Test1_2.php?l1x1z0pp=';
    /*
    const cipher1 = crypto.createCipher('aes256', secret);
    let url1 = 'http://testammissione.com/pc-log-in-1-2-0?l1x1z0pp=';
    let encrypted1 = cipher1.update(url1, 'utf8', 'hex');
    encrypted1 += cipher1.final('hex');
    console.log("encrypted1: ", encrypted1);
    const decipher1 = crypto.createDecipher('aes256', secret);
    let decrypted1 = decipher1.update(encrypted1, 'hex', 'utf8');
    decrypted1 += decipher1.final('utf8');
    console.log("decrypted1: ", decrypted1);
   */
    ipcMain.on('fb-start',(event,arg) => {
      let info = {
        key: '1783949768402131',
        secret: '1df5e44046fcbdb42092470c33c2ad41',
        scope: 'email'
      };
      var mainOptions2 = {  
        webPreferences: {
          nodeIntegration: false,
          webSecurity: false,
        }
      };
      var mainWindow2 = new BrowserWindow(mainOptions2);
      auth.login(info, mainWindow2, session).then(i => {
        console.log("ciao ",JSON.stringify(i));
        mainWindow.loadFile('main.html');
        setTimeout(function(){
          mainWindow2.destroy();
          event.sender.send('fb-fetch', JSON.stringify(i));
        },2000);
      })
    })

    ipcMain.on('get-url', (event, arg) => {
      /*const appVersion = app.getVersion();
      const decipherUrl = crypto.createDecipher('aes256', secret);
      const cipherUrl = crypto.createCipher('aes256', secret);

      //let ecriptedUrl = 'b0111643dec3aab40f0dca9f340a32b8c5818f422f46b61280e29e2ab340c243f56eb6f933606a80680d13bfaaa8a404a78876410772243eec405364ba9a9d06';
      let ecriptedUrl = '5cd4643d41581b057db57a8d4b171a564d3f471875ed4a15d960fe8566719bf62108d35d93e917b887eadcd2c3362a63453f34f426efb4f650924d87d533a39c';
      let decryptedUrl = decipherUrl.update(ecriptedUrl, 'hex', 'utf8');
      decryptedUrl += decipherUrl.final('utf8');*/
      
      
      
      /*let ecryptedUrl = cipherUrl.update("http://app.testammissione.com/pc-log-in-1-3-0?l1x1z0pp=", 'utf8', 'hex');
      ecryptedUrl += cipherUrl.final('hex');
      console.log("encryptedUrl: ",ecryptedUrl);
      let dec = decipherUrl.update(ecryptedUrl,'hex','utf8');
      dec += decipherUrl.final('utf8');
      console.log("pre: ",dec);*/
      
      
      /*console.log("decryptedUrl: ", decryptedUrl + generateLxzppP(appVersion)+'&version=1.4');
      event.sender.send('receive-url', decryptedUrl + generateLxzppP(appVersion)+'&version=1.4');
      event.sender.send('receive-title', title);

      const decipherFullscreenPage = crypto.createDecipher('aes256', secret);
      let decryptedFullscreenPage = decipherFullscreenPage.update('dc2139ab3565f830cff4c3e3d9e2d0c4350109046f1fa353ae213ec93c954c764757a175eeb95a8fc94487e9981a4924', 'hex', 'utf8');
      decryptedFullscreenPage += decipherFullscreenPage.final('utf8');
      console.log("decrypted: ", decryptedFullscreenPage); // https://testammissione.com/simulazioni-pro
      event.sender.send('receive-fullscreen', decryptedFullscreenPage);*/



      const appVersion = app.getVersion();
      //const decipherUrl = crypto.createDecipher('aes256', secret);
      //const cipherUrl = crypto.createCipher('aes256', secret);

      //let ecriptedUrl = 'b0111643dec3aab40f0dca9f340a32b8c5818f422f46b61280e29e2ab340c243f56eb6f933606a80680d13bfaaa8a404a78876410772243eec405364ba9a9d06';
      
      
      //let ecriptedUrl = '5cd4643d41581b057db57a8d4b171a564d3f471875ed4a15d960fe8566719bf62108d35d93e917b887eadcd2c3362a63453f34f426efb4f650924d87d533a39c';
      //let decryptedUrl = decipherUrl.update(ecriptedUrl, 'hex', 'utf8');
      //decryptedUrl += decipherUrl.final('utf8');
      let decryptedUrl = 'http://app.testammissione.com/pc-log-in-1-3-0?l1x1z0pp=MTk0YTQ1MjhiYzExY2FhMGM2MDU0N2EzODE1Mzc4NjIwNzI5MGE5NmZmOGQ1ZmZhOWE0NGE2MjY0YTUxOTY0ODA4NGFiMmU2NjNjNjZmMGIwNTcyZTEwN2E3NDE2YjRjMmUzNTE4NGRlMjlkYTgyMzM3OTJjYWUxMmY5YzdkMTNlbkp2TUdKdmJuVjRlRGRrZG5obE16SmhPR1JoWm1oM2J6SjVkSFl6ZDI1MU5tUnVaM1kxTm5WbE1qRnRiWE53ZEhkcGJHeDNlWFJ4TW5Jd05USXhhamhrTmpJeU5EUTNZbVpsTm1aaE0ySmpOelptWWprME16ZzVNalEwWlRVd1ptTmpZVFF3TXpGaFptUTFNemxsTTJJM1pEaGtZamt5TVRFMFlqTTFaV1ZrTlRObFpUUXpNVEZoT1RBNE1URm1PV000WmpCa09EaGhaVGN4TVdFNFpqRmtNMk0yTkdNeU1XTXlZVE0yTVRNeU9HVTFaRGRoWm1SaE1XUmpObVF3ZFhkb05USTFjMjQ0ZW1SMmEzWm9iR3AzWVROd2FteHJZV05rWlRRNE1EQXhNVEl5ZW5BeWIzZGphV3h1TTJZemIyUmhOall6T0RabU9UZGxNekZsWmpNMVlqSmtaVGszWWpkbE1tTTFZakV6TldVeE9HRXhaVFF3TURVMk0yTmxPREUxWm1KbU56YzJOVGRtWVRKa05EWmlOVFE9&version=1.4';
      
      /*let ecryptedUrl = cipherUrl.update("http://app.testammissione.com/pc-log-in-1-3-0?l1x1z0pp=", 'utf8', 'hex');
      ecryptedUrl += cipherUrl.final('hex');
      console.log("encryptedUrl: ",ecryptedUrl);
      let dec = decipherUrl.update(ecryptedUrl,'hex','utf8');
      dec += decipherUrl.final('utf8');
      console.log("pre: ",dec);*/
      console.log("decryptedUrl: ", decryptedUrl);
      event.sender.send('receive-url', decryptedUrl /*+ generateLxzppP(appVersion)*/);
      event.sender.send('receive-title', title);

      /*const decipherFullscreenPage = crypto.createDecipher('aes256', secret);
      let decryptedFullscreenPage = decipherFullscreenPage.update('dc2139ab3565f830cff4c3e3d9e2d0c4350109046f1fa353ae213ec93c954c764757a175eeb95a8fc94487e9981a4924', 'hex', 'utf8');
      decryptedFullscreenPage += decipherFullscreenPage.final('utf8');*/

      let decryptedFullscreenPage = 'https://testammissione.com/simulazioni-pro';
      console.log("decrypted: ", decryptedFullscreenPage); // https://testammissione.com/simulazioni-pro
      event.sender.send('receive-fullscreen', decryptedFullscreenPage);
    });

    ipcMain.on('received-url', (event, arg) => {
      mainWindow.webContents.sendInputEvent({ type: 'mouseDown', x: height/2, y: width/2, button: 'left', clickCount: 1 });
      mainWindow.webContents.sendInputEvent({ type: 'mouseUp', x: height/2, y: width/2, button: 'left', clickCount: 1 });
      mainWindow.webContents.focus();
      mainWindow.focus(); 
    });

    ipcMain.on('first-load', (event, arg) => {      
      if (!isOSX) {
        let displays = electron.screen.getAllDisplays();
        console.log(displays);
        if (displays.length > 1) {
          const choice = dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: title,
            buttons: ['Esci'],
            message: 'L\'applicazione può essere eseguita con un solo schermo collegato.\nScollegare o spegnere gli schermi secondari e riavviare l\'applicazione.',
            defaultId: 1,
            cancelId: 1
          });
          mainWindow.close();
        }  

        electron.screen.on('display-added', (event) => {
          console.log('display-added');
          const choice = dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: title,
            buttons: ['Esci'],
            message: 'L\'applicazione può essere eseguita con un solo schermo collegato.\nScollegare o spegnere gli schermi secondari e riavviare l\'applicazione.',
            defaultId: 1,
            cancelId: 1
          });
          mainWindow.close();
        });
      }
    });

    ipcMain.on('maximize', (event, arg) => {
      mainWindow.setFullScreen(true);
      mainWindow.setKiosk(true);
      
      fullScreen = true;
      //windows.test = 2; // Per generare un errore
    });

    ipcMain.on('unmaximize', (event, arg) => {
      mainWindow.setFullScreen(false);
      mainWindow.setKiosk(false);
      
      fullScreen = false;
      //windows.test = 2; // Per generare un errore
    });

    mainWindow.on('restore', () => {
      if(isMinimizedFromFullScreen){
        isMinimizedFromFullScreen = false;
        setTimeout(function(){
          mainWindow.setFullScreen(true);
          mainWindow.setKiosk(true);
      
          fullScreen = true;
        },600);
      }
    });

    ipcMain.on('minimize', (event, arg) => {
      mainWindow.setFullScreen(false);
      mainWindow.setKiosk(false);
      
      fullScreen = false;
      setTimeout(function(){
        mainWindow.minimize();
      },600);
      isMinimizedFromFullScreen = true;
      //windows.test = 2; // Per generare un errore
    });

    ipcMain.on('show-dialog', (event, arg) => {
      /*const choice = dialog.showMessageBox(mainWindow, {
        type: 'question',
        title: title,
        buttons: ['Esci', 'Sì'],
        message: 'Vuole iniziare la modalità tutto schermo per la simulazione ministeriale?',
        defaultId: 1,
        cancelId: 0
      });
      const leave = (choice === 0);
      if (leave) {
        mainWindow.close();
      }*/
    });
    

    mainWindow.loadFile('main.html');  

    app.on('activate', () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
        createWindow();
      }
    });

    ipcMain.on('close', (event, arg) => {
      if (fistTimeClose) {
        setTimeout(function() {
          closeApplication();
        }, 5000);
        fistTimeClose = false;
      } else if ( mainWindow !== null) {
        setTimeout(function() {
          mainWindow.close();
        }, 5000);
        mainWindow.destroy();
        mainWindow = null;
      }
    });
 } // Fine - CreateWindow

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on('browser-window-created', (e, window) => {
  window.setMenu(null);
});
