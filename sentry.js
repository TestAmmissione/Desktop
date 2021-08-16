

//const electron = require('electron');

//const path = require('path');
//const { /*crashReporter,*/ Tray, ipcMain, dialog, session, shell, app, BrowserWindow, clipboard, globalShortcut } = electron;
const Sentry = require('@sentry/electron');
// release: app.getVersion(),
/*
init({ 
  dsn: 'https://6b7413cab26e4ebcba9f6744b305752a@sentry.io/1387222',
  enableNative: false, 
  environment: 'test',
  attachStacktrace: true,
  sendDefaultPii: true,
  withLocals: true
});
*/

Sentry.init({ 
  debug: true,
  //dsn: 'https://55e830448f594a329bf846de88b12b1b@sentry.io/1432784',
  dsn: 'https://4fba2b0cf5fb468790b0072f02c6863c@o956001.ingest.sentry.io/5905372',
  enableNative: false, 
  environment: 'production',
  attachStacktrace: true,
  sendDefaultPii: true,
  withLocals: true
});


//Sentry.configureScope((scope) => {
  //scope.setTag("were", "main");
//});

module.export = Sentry;