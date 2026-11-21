const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1280, height: 900, show: false, webPreferences: { offscreen: true } });
  await win.loadURL('https://tetto03twianac1910-cmd.github.io/mokobura/');
  await new Promise(r => setTimeout(r, 3500));
  const top = await win.webContents.capturePage();
  require('fs').writeFileSync(path.join(__dirname, '../../shots/site-top.png'), top.toPNG());
  const h = await win.webContents.executeJavaScript('document.body.scrollHeight');
  win.setSize(1280, Math.min(h, 7000));
  await new Promise(r => setTimeout(r, 1200));
  const full = await win.webContents.capturePage();
  require('fs').writeFileSync(path.join(__dirname, '../../shots/site-full.png'), full.toPNG());
  console.log('done height=', h);
  app.quit();
});
