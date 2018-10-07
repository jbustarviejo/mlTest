const puppeteer = require('puppeteer');

let scrape = async (pos, sex, age, rate) => {
  const browser = await puppeteer.launch(/*{headless: false}*/);
  const page = await browser.newPage();
  await page.goto('https://www.123test.es/test-de-personalidad/index.php');
  await page.waitFor(3500);

  // Scrape
  const makeTest = await page.evaluate((pos, rate) => {
    let result = {}

    const items = document.getElementsByClassName('its123-item')

    for(let i=0; i<items.length;i++){
      const checkboxes = items[i].getElementsByTagName("input")
      let selected = 0 //Math.floor(Math.random() * 5)
      if (i>=pos && i<pos+4){
        selected=rate;
      }
      result[i]=selected
      checkboxes[selected].click()
    }

    document.getElementsByClassName("trivia-test-next-knop")[0].click()
    return result;
  }, pos, rate);

  await page.waitFor(3500);

  const selectAgeAndSex = await page.evaluate((sex, age) => {

    // let sex = 1 //Math.floor(Math.random() * 2)+1
    // let age = 30 //Math.floor(Math.random() * 90)+7

    document.getElementById("profiling_1").options.selectedIndex=sex
    document.getElementById("profiling_2").options.selectedIndex=age

    // if(sex==2) sexResult = "Hombre"
    // else sexResult = "Mujer"

    document.getElementsByClassName("its123-btn-loading")[0].click()
    return {"sex": sex, "age": age};
  }, sex, age);

  await page.waitFor(3500);

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


scrapeIter = (pos, sex, age, rate) =>{
  scrape(pos, sex, age, rate).then((value) => {
  //  console.log(value); // Success
    var fs = require('fs');
    var csvWriter = require('csv-write-stream')

    var writer = csvWriter({separator: ';', sendHeaders: false})
    writer.pipe(fs.createWriteStream('out.csv', {flags: 'a'}))
    writer.write(value)
    writer.end()
  });
}

sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

mainLoop = async (ages, sexs, rates) => {
  for(let a=0; a<ages.length; a++){
    age=ages[a];
    for(let b=0; b<sexs.length; b++){
      sex=sexs[b];
      for(let c=0; c<rates.length; c++){
      rate=rates[c];
        for (let i = 0; i<24; i++){
          scrapeIter(i, sex, age, rate);
          await sleep(15000)
        }
      }
    }
  }
}

//Main
const sexs = ["Hombre", "Mujer"]
const ages = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100]
const rates = [0,1,2,3,4]

console.clear()

mainLoop(ages, sexs, rates)
