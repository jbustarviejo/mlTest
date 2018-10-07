const puppeteer = require('puppeteer');

let scrape = async () => {
  const browser = await puppeteer.launch(/*{headless: false}*/);
  const page = await browser.newPage();
  await page.goto('https://www.123test.es/test-de-personalidad/index.php');
  await page.waitFor(3000);

  // Scrape
  const makeTest = await page.evaluate(() => {
    let result = {}

    const items = document.getElementsByClassName('its123-item')

    for(let i=0; i<items.length;i++){
      const checkboxes = items[i].getElementsByTagName("input")
      const selected = Math.floor(Math.random() * 5)
      result[i]=selected
      checkboxes[selected].click()
    }

    document.getElementsByClassName("trivia-test-next-knop")[0].click()
    return result;
  });

  await page.waitFor(3000);

  const selectAgeAndSex = await page.evaluate(() => {

    let sex = Math.floor(Math.random() * 2)+1
    let age = Math.floor(Math.random() * 90)+1

    document.getElementById("profiling_1").options.selectedIndex=sex
    document.getElementById("profiling_2").options.selectedIndex=age

    if(sex==2) sexResult = "Hombre"
    else sexResult = "Mujer"

    document.getElementsByClassName("its123-btn-loading")[0].click()
    return {"sex": sexResult, "age": age+6};
  });

  await page.waitFor(3000);

  const getResults = await page.evaluate(() => {
  	const items = document.getElementsByClassName("visualsummary")[0].getElementsByTagName("a")
    let result = {}

  	for(let i=0; i<items.length;i++){
  		const h3 = items[i].getElementsByClassName("span4")[0].textContent
  		const value = items[i].getElementsByClassName("badge-info")[0].textContent;
  		result[h3] = value
  	}

    return result;
  });

  browser.close();
  return Object.assign(makeTest, selectAgeAndSex, getResults);
}


doIt = () =>{
  scrape().then((value) => {
  //  console.log(value); // Success
    var fs = require('fs');
    var csvWriter = require('csv-write-stream')

    var writer = csvWriter({separator: ';', sendHeaders: false})
    writer.pipe(fs.createWriteStream('out.csv', {flags: 'a'}))
    writer.write(value)
    writer.end()
  });
}


//Main
let i = 0;
  console.clear()

function loop(){
  setTimeout(function(){
    doIt();
    console.log("Ended! "+i);
    i++;
    if(i<1000) loop()
  }, 9000);
}

loop();
