const puppeteer = require('puppeteer');
const cron = require('cron').CronJob;

async function getLatestDate(page) {
  await page.goto('https://kenkoooo.com/atcoder/?user=xuzijian629&kind=user', {waitUntil: "networkidle2"});
  await page.waitFor(30000);
  return await page.$eval('.react-bs-container-body', submissions => {
    return submissions.textContent.match(/^20\d{2}-\d{2}-\d{2}/)[0];
  });
}

module.exports = robot => {
  new cron('0 0 20 * * *', () => {
    !(async() => {
      try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const date = await getLatestDate(page);
        const today = (new Date(Date.now() + 9 * 3600000)).toISOString().slice(0,10)
        if (date === today) {
          // Yay!
        } else {
          robot.send({room: '#daily_atcoder'}, "<@U2F6UPCKB> AtCoderやれ");
        }
        browser.close();
      } catch(e) {
        robot.logger.error(e);
      }
      // process.exit();
    })();
  }, null, true, 'Asia/Tokyo');

  new cron('0 0 22 * * *', () => {
    !(async() => {
      try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const date = await getLatestDate(page);
        const today = (new Date(Date.now() + 9 * 3600000)).toISOString().slice(0,10)
        if (date === today) {
          // Yay!
        } else {
          robot.send({room: '#daily_atcoder'}, "<@U2F6UPCKB> さすがにAtCoderやれ");
        }
        browser.close();
      } catch(e) {
        robot.logger.error(e);
      }
      // process.exit();
    })();
  }, null, true, 'Asia/Tokyo');

  new cron('0 0 23 * * *', () => {
    !(async() => {
      try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const date = await getLatestDate(page);
        const today = (new Date(Date.now() + 9 * 3600000)).toISOString().slice(0,10)
        if (date === today) {
          // Yay!
        } else {
          robot.send({room: '#daily_atcoder'}, "<@U2F6UPCKB> いい加減AtCoderやれ");
        }
        browser.close();
      } catch(e) {
        robot.logger.error(e);
      }
      // process.exit();
    })();
  }, null, true, 'Asia/Tokyo');
}
