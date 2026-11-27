const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 fs.mkdirSync('qa-results',{recursive:true});
 const results=[];
 for(const width of [1440,1024,768,390,320]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/archive.html',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#featured .lead-card');
  await page.locator('#featurePhoto .media-frame').waitFor();
  assert.equal(await page.locator('.constellation-star').count(),64);
  await page.locator('#enterMuseum').click();
  assert.match(await page.locator('#exhibitTitle').innerText(),/Ein Baum/);
  assert.equal(await page.locator('#featurePhoto .photo-fallback:visible, #featurePhoto img:visible').count(),1,'One visible media layer');
  await page.locator('[data-feature="1"]').click();
  assert.match(await page.locator('#featureCaption').innerText(),/Rosa Parks/);
  assert.match(await page.locator('#exhibitTitle').innerText(),/Ein Nein/);
  await page.locator('[data-feature="0"]').click();
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:'qa-results/home-'+width+'.png',fullPage:true});
  if(width===1440||width===390){await page.screenshot({path:'qa-results/entrance-'+width+'.png'});await page.locator('#leadCases').scrollIntoViewIfNeeded();await page.screenshot({path:'qa-results/exhibition-'+width+'.png'});}
  assert.equal(await page.locator('#featured .lead-card').count(),3);
  assert.equal(await page.locator('#atlasDots button').count(),64);
  await page.locator('#atlasDots button').nth(3).click();
  assert.match(await page.locator('#atlasPreview').innerText(),/Leymah Gbowee/);
  await page.locator('#atlasDots button').nth(8).click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Home overflows at '+width);
  await page.locator('[data-tab="archive"]').click();
  await page.waitForSelector('#storyGrid .story');
  assert.equal(await page.locator('#storyGrid .story').count(),64);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Archive overflows at '+width);
  if(width===1440||width===390){
   await page.screenshot({path:'qa-results/archive-'+width+'.png',fullPage:true});
  }
  const media=await page.evaluate(()=>Array.from(document.querySelectorAll('#storyGrid .media-frame')).map(e=>({photo:!!e.querySelector('img'),fallback:e.querySelector('.photo-fallback')?.hidden??null})));
  assert.equal(media.length,64);
  assert.equal(media.filter(e=>e.photo).length,24);
  await page.locator('[data-go="home"]').first().click();
  await page.locator('#coverStory').click();
  assert.equal(await page.locator('#detail').evaluate(e=>e.open),true);
  assert.match(await page.locator('#detailBody').innerText(),/51 Mio/);
  await page.locator('#useDeep').click();
  assert.equal(await page.locator('#projects').evaluate(e=>e.hidden),false);
  assert.match(await page.locator('#f-title').inputValue(),/grüner Ort/);
  await page.locator('[data-go="home"]').first().click();
  await page.locator('#jumpAction').click();
  await page.locator('[data-topic="1"]').click();
  await page.locator('#wizardNext').click();
  await page.locator('#quickStart').click();
  assert.equal(await page.locator('#projects').evaluate(e=>e.hidden),false);
  await page.locator('.workspace-nav [data-go="impact"]').first().click();
  assert.equal(await page.locator('#impact').evaluate(e=>e.hidden),false);
  assert.equal(errors.length,0,errors.join('; '));
  results.push({width,passed:true,images:24,stories:64,errors});
  await page.close();
 }

 for(const width of [1440,1024,768,390,320]){
 const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8765/cinema.html');
 assert.match(await p.locator('#headline').innerText(),/Ein Platz/);
 assert.equal(await p.locator('.scene.active').count(),1);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Museum overflow '+width);
 await p.screenshot({path:'qa-results/museum-'+width+'.png',fullPage:true});
 await p.locator('#openCollection').click();
 assert.equal(await p.locator('#collection').evaluate(e=>e.open),true);
 assert.equal(await p.locator('.room-card').count(),8);
 await p.screenshot({path:'qa-results/collections-'+width+'.png'});
 await p.locator('.room-card').nth(2).click();await p.waitForURL('**/atlas.html?room=**');
 assert.equal(await p.locator('#theme').inputValue(),'Tiere & Mitgefühl');assert.equal(await p.locator('#grid .story').count(),8);
 await p.goto('http://127.0.0.1:8765/cinema.html?scene=2');assert.match(await p.locator('#headline').innerText(),/Ein Samen/);
 await p.locator('#openCollection').click();await p.locator('#startExhibit').click();assert.match(await p.locator('#headline').innerText(),/Ein Platz/);
 await p.locator('#advance').click();assert.match(await p.locator('#beatText').innerText(),/381 Tage/);
 await p.locator('#advance').click();assert.match(await p.locator('#beatText').innerText(),/Welche Regel/);
 await p.locator('#advance').click();assert.match(await p.locator('#headline').innerText(),/Ein Samen/);
 await p.locator('#filmstrip .chapter').nth(2).click();assert.match(await p.locator('#headline').innerText(),/Ein Tisch/);
 await p.locator('#filmstrip .chapter').nth(3).click();assert.equal(await p.locator('#action').isVisible(),true);
 await p.locator('#problem').fill('Ein Testprojekt');await p.locator('#step').fill('Drei Gespräche führen');await p.locator('#measure').fill('Anzahl Gespräche');
 await p.locator('#form .save').click();await p.waitForURL('**/archive.html#projects');assert.equal(await p.locator('#f-title').inputValue(),'Ein Testprojekt');
 assert.equal(errors.length,0,errors.join('; '));results.push({museumWidth:width,passed:true,rooms:8,actionTransfer:true});await p.close();
 }
 for(const width of [1440,390,320]){
 const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8765/cinema.html');
 await p.locator('#openCollection').click();await p.locator('.beyond-card a.collection-cta').click();
 await p.waitForURL('**/beyond.html?scene=1');
 assert.match(await p.locator('#headline').innerText(),/Ein Blick/);assert.match(await p.locator('#imageCredit').innerText(),/AmyAbroad/);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Beyond overflow '+width);
 await p.locator('#advance').click();assert.match(await p.locator('#beatText').innerText(),/Zweige/);
 await p.locator('#filmstrip .chapter').nth(1).click();assert.match(await p.locator('#headline').innerText(),/Ein Tisch/);
 await p.locator('#filmstrip .chapter').nth(2).click();assert.match(await p.locator('#headline').innerText(),/Ein Leben/);
 await p.locator('#filmstrip .chapter').nth(3).click();assert.equal(await p.locator('#action').isVisible(),true);
 await p.locator('#problem').fill('Pflanzliche Auswahl');await p.locator('#step').fill('Ein freiwilliges Tasting');await p.locator('#measure').fill('Gewählte pflanzliche Portionen');
 await p.locator('#form .save').click();await p.waitForURL('**/archive.html#projects');assert.equal(await p.locator('#f-title').inputValue(),'Pflanzliche Auswahl');
 assert.equal(errors.length,0,errors.join('; '));results.push({beyondWidth:width,passed:true,actionTransfer:true});await p.close();
 }
 for(const width of [1440,1024,768,390,320]){
 const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8765/');
 assert.match(await p.locator('h1').innerText(),/ein Mensch/);
 assert.equal(await p.locator('.exhibit').count(),2);assert.equal(await p.locator('.room').count(),8);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Entrance overflow '+width);
 await p.screenshot({path:'qa-results/grand-'+width+'.png',fullPage:true});
 await p.locator('.room').nth(2).click();await p.waitForURL('**/atlas.html?room=**');assert.equal(await p.locator('#grid .story').count(),8);
 await p.locator('#reset').click();assert.equal(await p.locator('#grid .story').count(),64);
 await p.locator('#search').fill('Rosa Parks');assert.equal(await p.locator('#grid .story').count(),1);
 await p.locator('#grid [data-read]').first().click();assert.equal(await p.locator('#reader').evaluate(e=>e.open),true);
 assert.match(await p.locator('#readerBody').innerText(),/Rosa Parks/);await p.locator('#readerBody [data-save]').click();
 await p.locator('#closeReader').click();await p.locator('#reset').click();await p.locator('#onlySaved').check();assert.equal(await p.locator('#grid .story').count(),1);
 await p.reload();await p.locator('#onlySaved').check();assert.equal(await p.locator('#grid .story').count(),1);
 await p.locator('#reset').click();await p.locator('[data-view="timeline"]').click();assert.equal(await p.locator('#grid.timeline .story').count(),64);
 await p.locator('#epoch').selectOption('1980–1999');assert.ok(await p.locator('#grid .story').count()>0);await p.locator('#reset').click();await p.locator('#mechanism').selectOption('Wissen teilen');assert.ok(await p.locator('#grid .story').count()>0);await p.locator('#reset').click();await p.locator('[data-view="grid"]').click();
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Atlas overflow '+width);
 await p.screenshot({path:'qa-results/living-atlas-'+width+'.png'});
 await p.goto('http://127.0.0.1:8765/atlas.html?story=1');assert.equal(await p.locator('#reader').evaluate(e=>e.open),true);
 await p.locator('#readerBody a.btn').first().click();await p.waitForURL('**/archive.html#home');assert.match(await p.locator('#detailBody').innerText(),/Ein Nein/);
 assert.equal(errors.length,0,errors.join('; '));results.push({grandWidth:width,atlas:true,filters:true,bookmark:true,deepLink:true});await p.close();
 }
 const visit=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
 await visit.goto('http://127.0.0.1:8765/visit-test.html');await visit.locator('#clarity').selectOption('4');await visit.locator('#visual').selectOption('5');await visit.locator('#action').selectOption('maybe');await visit.locator('#consent').check();const downloaded=visit.waitForEvent('download');await visit.locator('#export').click();const file=await downloaded;assert.equal(file.suggestedFilename(),'one-many-feedback.json');assert.equal(await visit.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);results.push({visitorFeedbackExport:true});await visit.close();
 const failure=await browser.newPage({viewport:{width:390,height:844}});
 await failure.route('**/*',route=>route.request().resourceType()==='image'?route.abort():route.continue());
 await failure.goto('http://127.0.0.1:8765/archive.html');
 await failure.waitForSelector('#featurePhoto .media-frame.art-only');
 assert.equal(await failure.locator('#featurePhoto .photo-fallback').isVisible(),true);
 assert.equal(await failure.locator('#featurePhoto img').isVisible(),false);
 await failure.screenshot({path:'qa-results/fallback-mobile.png'});
 results.push({brokenImageFallback:true});
 fs.writeFileSync('qa-results/results.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
