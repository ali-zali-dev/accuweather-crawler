import async from 'async';
import axios from 'axios';
import camelCase from 'camelcase';
import cheerio from 'cheerio';

async function main() {
  const baseUrl = "https://www.accuweather.com";
  const url =
    baseUrl + "/en/gb/london/ec4a-2/november-weather/328328?year=2021";
  let siteResponse = await axios(url);
  if (siteResponse.status !== 200) {
    console.log("Error occurred while fetching data");
    return;
  }
  const $ = cheerio.load(siteResponse.data);
  const days = $(".monthly-calendar");
  let daysUrl: any = [];

  days.each(function () {
    $(this)
      .find("a")
      .each(function (index, element) {
        if ($(element).attr("href")) {
          daysUrl.push($(element).attr("href"));
        }
      });
  });
  async.map(
    daysUrl,
    function (url, callback) {
      axios(baseUrl + url)
        .then((response) => callback(null, response.data))
        .catch((err) => console.log(err));
    },
    function (err, results: any) {
      if (!err) {
        let dailyInformation = [];
        for (var i = 0; i < results.length; i++) {
          const $ = cheerio.load(results[i]);
          const statsTable = $(".half-day-card.content-module");
          let description: any = [];
          let feature: any = {};

          statsTable.each(function () {
            $(this)
              .find(".phrase")
              .each(function (index, element) {
                description.push($(element).text());
              });
            $(this)
              .find(".panel-item")
              .each(function (index, element) {
                const featuresText = $(element).text();
                const featureValue = $(element).children().text();
                feature[
                  camelCase(
                    featuresText.substr(0, featuresText.indexOf(featureValue))
                  )
                ] = featureValue;
              });
          });
          dailyInformation.push({
            date: i,
            description: description[0],
            ...feature,
          });
          // do something with results[i]
          // half-day-card content-module
        }
        console.log(dailyInformation);
        //save file
      } else {
        // handle error here
      }
    }
  );
}

main();
