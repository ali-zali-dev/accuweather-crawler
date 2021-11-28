import cheerio from 'cheerio';

declare module "cheerio" {
  interface Cheerio<T> {
    logHtml(this: Cheerio<T>): void;
  }
}
async function test() {
  const html = `<ul id="fruits">
                    <li class="apple">Apple</li>
                    <li class="orange">Orange</li>
                    <li class="pear">Pear</li>
                </ul>`;
  const $ = cheerio.load(html);
  //   console.log(cheerio.html($(".pear"))); //outer html
  //   console.log($(".pear").html());// inner html
  //   console.log(cheerio.text($("body"))); // same
  //   console.log($("body").text()); //same

  $.prototype.logHtml = function () {
    console.log(this.html());
  };
  //   $("body").logHtml();
  //   console.log($("#fruits").children().length); // 3

  //   console.log($(".apple").next().text());
  //   console.log($(".apple").nextAll().text());
  //   console.log($(".apple").nextUntil(".pear").text());

  //   console.log($(".pear").parent().attr("id"));

  //   console.log($(".orange").prev().hasClass("apple"));
  //   console.log($(".pear").prevAll().text());

  //   console.log($("li").eq(1).text()); // Orange

  //   $('li')
  //   .map(function (i, el) {
  //     // this === el
  //     return $(this).text();
  //   })
  //   .toArray()
  //   .join(' ');
  //     //=> "apple orange pear"
}

export default test;
