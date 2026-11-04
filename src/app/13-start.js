// Start aplikacji (po wszystkich modułach): czekamy na kroje, żeby pierwsza klatka nie mrugnęła fontem zastępczym
const fontsReady = document.fonts
  ? Promise.race([Promise.all([font('display', 800, 64), font('mono', 600, 24), font('sans', 400, 24)].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 2500))]).catch(() => {})
  : Promise.resolve();
fontsReady.then(() => {
  document.body.classList.toggle('rec', location.hash === '#record');
  STATE.figure = figById(params.get('f')) ? params.get('f') : null;
  initNav(); renderPanel(); initDialogs(); initStage();
});
