const puppeteer = require('puppeteer');

async function getLatestDate(page) {
  await page.goto('https://kenkoooo.com/atcoder/?user=xuzijian629&kind=user', {waitUntil: "networkidle2"});
  await page.waitFor(30000);
  return await page.$eval('.react-bs-container-body', submissions => {
    return submissions.textContent.match(/^20\d{2}-\d{2}-\d{2}/)[0];
  });
}

!(async() => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const date = await getLatestDate(page);
    const today = (new Date(Date.now() + 9 * 3600000)).toISOString().slice(0,10)
    if (date === today) {
      console.log("Yay!");
    } else {
      console.log("Umm..");
    }
    browser.close();
  } catch(e) {
    console.error(e);
  }
})();
