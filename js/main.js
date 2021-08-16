const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const app = remote.app;
const process = remote.process;
const dialog = remote.dialog;
const session = remote.session;
const auth = require('oauth-electron-facebook')

let fullScreenMode =  false;
let firstTime = true;
let pageFullscreen = null;

window.hiddenSplash = true; 
window.closeAction = false; 
window.openSplash = function openSplash(message) {
    window.hiddenSplash = false; 
    document.getElementById('close_warning').innerHTML = message;
    $('electron_close_splash').show();
    document.getElementById('electron_close_splash').style.width = "100%";
}

window.closeSplash = function closeSplash() {
    document.getElementById('electron_close_splash').style.width = "0%";
    $('electron_close_splash').hide();
    window.hiddenSplash = true; 
}

window.closeAll = function closeAll(message) {
    window.hiddenSplash = false; 
    document.getElementById('loading').innerHTML = message;
    $('loading_circle').show();
    $('#loading_circle').html($('#first_loading_circle').html());
    $('electron_close_splash').show();
    $('.electron-close-overlay-close').hide();
    $('#button').hide();
    document.getElementById('electron_close_splash').style.width = "100%";
}

document.addEventListener("DOMContentLoaded", (event) => {
    onload = () => {
        $(() => {
            $('#header').hide();            
            $('.over-layer').css('min-height', '100vh');
            $('electron_close_splash').hide();

            console.log("ciao ",window.facebook || 'not')

            const webView = document.querySelector('webview'); 


            webView.addEventListener('did-start-loading',  (event) => {
                //console.log('did-start-loading');
                //console.log(event);
                //console.log(event.srcElement.src);
                $('.over-layer').show(); // Toglie l'overlay
            });

            webView.addEventListener('did-stop-loading',  (event) => {
                //console.log('did-stop-loading');
                //console.log(event);
                //console.log(event.srcElement.src);

                $('.over-layer').hide(); // Toglie l'overlay
                if (firstTime) {
                    firstTime = false;
                    ipcRenderer.send('first-load');
                }


                webView.executeJavaScript(`
                    document.querySelector('.btn-fb').addEventListener('click', function(event) {
                        //FB.login(function(response) {
                            console.log("ciua");
                            /*if (response.authResponse) {
                             console.log('Welcome!  Fetching your information.... ');
                             FB.api('/me', function(response) {
                               console.log('Good to see you, ' + response.name + '.');
                             });
                            } else {
                             console.log('User cancelled login or did not fully authorize.');
                            }*/
                        //});
                        startLoginFB();
                    });
                `, false, () => {
                });
            });

            let launchFB = (event) => {
                ipcRenderer.send('fb-start'); 
            }

            let fullScreen = (event) => {
                $('.over-layer').css('min-height', 'calc(100vh - 2em)');
                $('#header').show();
                ipcRenderer.send('maximize'); 
                $('#mainWebview').attr('preload', './preload.js');

                //webView.openDevTools();

               
                webView.executeJavaScript(`
                    window.addEventListener('keydown', function(event) {
                        const up = 38, down = 40, pageUp=33, pageDown=34;
                        if (event.keyCode !== down && event.keyCode !== up && event.keyCode !== pageDown && event.keyCode !== pageUp) { 
                            if (window.location.pathname !== '/segnalazione-domanda-computer') {
                                closeHost();
                            }
                        }
                    });
                `, false, () => {
                });  

                $(window).keydown((event) => {
                    event.preventDefault();
                    const up = 38, down = 40, pageUp=33, pageDown=34;
                    if (event.keyCode !== down && event.keyCode !== up && event.keyCode !== pageDown && event.keyCode !== pageUp) { 
                        if (window.closeAction === false && window.hiddenSplash === true && webView.src !== 'https://testammissione.com/segnalazione-domanda-computer') {
                            window.closeAction = true;
                            if (closeWarnings === 6) {
                                ipcRenderer.send('close');
                                window.closeAll("L'applicazione si sta chiudendo in quanto</br> è stata utilizzata la tastiera.</br></br>Chiusura in corso...</div>");
                            } else {
                                //window.openSplash(`Avviso ${event.args[0] + 1}/3.`)
                                window.openSplash(`Avviso ${closeWarnings}/6.`);
                                closeWarnings++;
                            }
                            window.closeAction = false;
                        }
                    }
                });
             
                webView.send('get-cookies');
            };

            webView.addEventListener('dom-ready', (event) => {
                //console.log('dom-ready');
                //console.log(event);
                //console.log(event.srcElement.src);
                // webView.openDevTools();
                webView.executeJavaScript(`
                    console.log("PATHNAME:", window.location.pathname);
                `);
                webView.send('get-cookies');
                

                //intercept the full screen URL event
                $.get("https://testammissione.com/app/yes.php?fullscreen="+event.srcElement.src,function(js){
                    //alert(js);//risponde sempre yes, BAH!
                    if(js.indexOf("yes")!=-1){
                        ipcRenderer.send('maximize');
                        $('#header').show();
                        fullScreen(event);
                    }else{
                        $('#header').hide();
                        ipcRenderer.send('unmaximize');
                    }
                });

                /*if (event.srcElement.src  === pageFullscreen || fullScreenMode) {
                    fullScreen(event);
                    fullScreenMode = true;
                } */
                $('.over-layer').hide(); // Toglie l'overlay
            });

            //webView.addEventListener('will-navigate', (event) => {
                //console.log('will-navigate');
                //console.log(event);
                //console.log(event.url);
            //});

            webView.addEventListener('did-navigate', (event) => {
                //console.log('did-navigate');
                //console.log(event);
                //console.log(event.url);

                if (event.url  === pageFullscreen) {
                    ipcRenderer.send('show-dialog');
                }
            });

            let closeWarnings = 1;

            webView.addEventListener('ipc-message', (event) => {
                if (event.channel === 'close') {
                    if (window.closeAction === false && window.hiddenSplash === true && webView.src !== 'https://testammissione.com/segnalazione-domanda-computer') {
                        window.closeAction = true;
                        //if (event.args[0] === 2) {
                        if (closeWarnings === 3) {
                            ipcRenderer.send('close'); // Comunica la chiusura al processo principale app.js
                            window.closeAll("L'applicazione si sta chiudendo in quanto</br> è stata utilizzata la tastiera.</br></br>Chiusura in corso...</div>");
                        } else {
                            //window.openSplash(`Avviso ${event.args[0] + 1}/3.`)
                            window.openSplash(`Avviso ${closeWarnings}/6.`);
                            closeWarnings++;
                            
                        }
                        window.closeAction = false;
                    }
                } else if (event.channel === 'send-cookies') {
                    let username = $.cookie(event.args[0], 'username');
                    if (username !== null) {
                        console.log("USERNAME:", username);
                        Sentry.configureScope((scope) => {
                            scope.setUser({
                                'id': username,
                                'username': username,
                                'email': username
                            });
                        });
                    }
                }else if (event.channel === 'start-fb'){
                    //console.log(event.args[0]);
                    //auth.login(event.args[0], window.mainWindow, session)
                    launchFB();
                }
            });

            //webView.addEventListener('did-navigate-in-page', (event) => {
                //console.log('did-navigate-in-page');
                //console.log(event);
                //console.log(event.isMainFrame);
                //console.log(event.url);
            //});

            ipcRenderer.send('get-url');
            ipcRenderer.on('fb-fetch', (event, arg) => {
                let info = JSON.parse(arg);
                console.log(info);
                $.get("https://graph.facebook.com/me?fields=email&access_token="+info.access_token,function(json){
                    console.log("fetch",JSON.stringify(json))
                    $.get("https://app.testammissione.com/pc-log-in-1-3-0",{
                        codice: 1,
                        email: json.email
                    },function(jsonWS){
                        webView.executeJavaScript(`
                            document.querySelector('#login-email').value='`+json.email+`';
                            document.querySelector('#login-password').value='`+jsonWS.password+`';
                            setTimeout(function(){
                                document.querySelector('#login-btn').click();
                            },1000);
                        `, false, () => {
                        });
                    });
                    
                })
            });
            ipcRenderer.on('receive-url', (event, arg) => {
                $('#mainWebview').attr('src', arg);
                ipcRenderer.send('received-url');
            });

            ipcRenderer.on('receive-title', (event, arg) => {
                $('#title').html(arg);
                $('.title').html(arg);
            });

            ipcRenderer.on('receive-fullscreen', (event, arg) => {
                pageFullscreen = arg;
            });

            addEventListener('contextmenu', event => event.preventDefault());
            
            $(window).click();
            $(document).click();
                
            $('.close').not(".minimize").click((event) => {
                event.preventDefault();
                ipcRenderer.send('close'); // Comunica la chiusura al processo principale app.js
            });
            $('.minimize').click((event) => {
                event.preventDefault();
                webView.executeJavaScript(`
                    if("undefined"!==typeof window["riduci_icona"]){
                        riduci_icona();
                    }
                `);
                ipcRenderer.send('minimize'); // Minimize window
            });
            $(".btn-fb").click((event) => {
                ipcRenderer.send('close');
            });
        });
    };
});