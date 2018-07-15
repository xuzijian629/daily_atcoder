const puppeteer = require('puppeteer');

async function getSolvedProblems(page, user, date) {
  let ret = [];
  try {
    await page.goto(`https://kenkoooo.com/atcoder/?user=${user}&kind=user`, {waitUntil: "networkidle2"});
    await page.waitFor(30000);
    let problems = await page.$$('.react-bs-container-body > table > tbody > tr');
    let links = await page.$$('.react-bs-container-body > table > tbody > tr > td > a');
    for (let i = 0; i < problems.length; i++) {
      let problem = await (await problems[i].getProperty('textContent')).jsonValue();
      let link = await (await links[2 * i].getProperty('href')).jsonValue();
      if (problem.match(date) && problem.match('AC')) {
        ret.push({
          problem: problem.match(/^20\d{2}-\d{2}-\d{2}(.*)ACdetails/)[1],
          link: link
        });
      }
    }
  } catch(e) {
    console.error(e);
  }
  return ret;
}

!(async() => {
  try {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();

    const today = (new Date(Date.now() + 9 * 3600000)).toISOString().slice(0,10)
    console.log(await getSolvedProblems(page, 'xuzijian629', '2018-07-14'));
    browser.close();
  } catch(e) {
    console.error(e);
  }
})();
