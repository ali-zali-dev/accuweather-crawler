import async from 'async';
import axios from 'axios';
import camelCase from 'camelcase';
import cheerio from 'cheerio';
import { writeFile } from 'fs';
import { join } from 'path';

import test from './test';

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
  let daysUrl: any[] = [];
  days.each(function () {
    $(this)
      .find("a")
      .each(function () {
        if ($(this).attr("href")) {
          daysUrl.push($(this).attr("href"));
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
          const day = $(".half-day-card.content-module");
          let weatherDescription: string[] = [];
          let weatherTemperature: string[] = [];
          let weatherFeature: object[] = [];
          day.each(function () {
            $(this)
              .find(".temperature")
              .each(function () {
                if ($(this).text().indexOf("°") === 6) {
                  weatherTemperature.push($(this).text().substr(4, 2));
                } else {
                  weatherTemperature.push($(this).text().substr(4, 1));
                }
              });
            $(this)
              .find(".phrase")
              .each(function () {
                weatherDescription.push($(this).text());
              });
            $(this)
              .find(".panels")
              .each(function () {
                let feature: any = {};
                $(this)
                  .find(".panel-item")
                  .each(function () {
                    const featuresText = $(this).text();
                    const featureValue = $(this).children().text();
                    feature[
                      camelCase(
                        featuresText.substr(
                          0,
                          featuresText.indexOf(featureValue)
                        )
                      )
                    ] = featureValue;
                  });
                weatherFeature.push(feature);
              });
          });
          const today = new Date();
          const newDay = today.setDate(today.getDate() + i);
          dailyInformation.push({
            date: new Date(newDay).toDateString(),
            day: {
              description: weatherDescription[0],
              temperature: weatherTemperature[0],
              ...weatherFeature[0],
            },
            night: {
              description: weatherDescription[1],
              temperature: weatherTemperature[1],
              ...weatherFeature[1],
            },
          });
        }
        writeFile(
          join(__dirname, "../result/result.json"),
          JSON.stringify(dailyInformation, null, 2),
          () => {}
        );
      } else {
        console.log(err);
      }
    }
  );
}
test();
// main();
