//require modules
const fs = require('fs-extra');
const scrapeIt = require("scrape-it")
const Json2csvParser = require('json2csv').Parser;

//declare tabs for csv file
const fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];

let products = [];

//crowling for the eight t-shirts links
scrapeIt("http://shirts4mike.com/shirts.php", {
    links: {
      listItem: ".products li",
      data: {
        url: {
          selector: "a",
          attr: "href"
        }
      }
    }
//if the promise is resolved loop through all the t-shirts and scrape data
}).then(({ data, response }) => {
    for(let i = 0; i < data.links.length; i++){
      let tshirtNumber = data.links[i].url
      let url = `http://shirts4mike.com/${tshirtNumber}`
      //scrape data from single t-shirt page
      scrapeIt(url, {
        Title: "title",
        Price: ".price",
        ImageURL: {
          selector: ".shirt-picture span img",
          attr: "src"
        }
      //add URL and time then push the object to the products array
      }).then(({ data, response }) => {
        data.URL = url;
        data.Time = new Date();
        products.push(data);
      })
    }
//if the promises is rejected log an error to the console and to a .log file
}).catch(e => {
  console.log("There’s been a 404 error. Cannot connect to http://shirts4mike.com.");
  let log = `${e}\n${Date(Date.now())}\n`
  fs.appendFileSync("scraper-error.log", log);
})

//after the promises are resolved create csv file if the products is not empty
global.setTimeout(function () {
  if(products.length > 0){
    const json2csvParser = new Json2csvParser({ fields });
    const csv = json2csvParser.parse(products);
    let date = new Date().toJSON().slice(0,10);
    fs.outputFileSync(`./data/${date}.csv`, csv);
  }
}, 2000);
