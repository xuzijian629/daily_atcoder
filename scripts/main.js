const puppeteer = require('puppeteer');
const cron = require('cron').CronJob;

const id = {
  'xuzijian629': 'U2F6UPCKB',
  'kenshin': 'U2F7L8BGE'
};

async function getSolvedProblems(user, date) {
  let ret = {streak: 0, solved: []};
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://kenkoooo.com/atcoder/?user=${user}&kind=user`, {waitUntil: "networkidle2", timeout: 3000000});
    await page.waitFor(60000);
    let streak = await page.$('#root > div > div > div > div > div:nth-child(3) > div:nth-child(7) > h3');
    ret['streak'] = await (await streak.getProperty('textContent')).jsonValue();
    let problems = await page.$$('.react-bs-container-body > table > tbody > tr');
    let links = await page.$$('.react-bs-container-body > table > tbody > tr > td > a');
    let saved = {};
    for (let i = 0; i < problems.length; i++) {
      let problem = await (await problems[i].getProperty('textContent')).jsonValue();
      let link = await (await links[2 * i].getProperty('href')).jsonValue();
      if (problem.match(date) && problem.match('ACdetails') && !(link in saved)) {
        ret['solved'].push({
          problem: problem.match(/^20\d{2}-\d{2}-\d{2}(.*)ACdetails/)[1],
          link: link
        });
        saved[link] = 1;
      }
    }
    browser.close();
  } catch(e) {
  }
  return ret;
}

async function notifyIfUnsolved(robot, user, message) {
  try {
    const today = (new Date(Date.now() + 9 * 3600000)).toISOString().slice(0,10);
    let solved = await getSolvedProblems(user, today);
    if (solved['solved'].length === 0) {
      robot.send({room: '#daily_atcoder'}, `<@${id[user]}> ${message}`);
    }
  } catch(e) {
    robot.logger.error(e);
  }
}

async function summarize(robot, user) {
  try {
    const today = (new Date(Date.now() + 9 * 3600000)).toISOString().slice(0,10);
    let solved = await getSolvedProblems(user, today);
    if (solved['solved'].length) {
      message = '';
      if (user in id) {
        message += `That's *${solved['streak']}* in a row to solve problems at AtCoder!\n`;
      }
      message += `${user} solved ${solved['solved'].length} problems!!\n`;
      for (let s of solved['solved']) {
        message += `${s.problem} ${s.link}\n`;
      }
      robot.send({room: '#daily_atcoder'}, message.slice(0, message.length - 1));
    }
  } catch(e) {
    robot.logger.error(e);
  }
}

module.exports = robot => {
  robot.hear('test', res => {
    res.send('hoge');
  });

  new cron('0 59 23 * * *', () => {
    !(async() => {
      await summarize(robot, 'xuzijian629');
    })();;
    !(async() => {
      await summarize(robot, 'kenshin');
    })();;
    !(async() => {
      await summarize(robot, 'shiatsumat');
    })();;
    !(async() => {
      await summarize(robot, 'satos');
    })();;
    !(async() => {
      await summarize(robot, 'tomcatowl');
    })();;
  }, null, true, 'Asia/Tokyo');

  new cron('0 59 19 * * *', () => {
    !(async() => {
      await notifyIfUnsolved(robot, 'xuzijian629', 'AtCoderやれ');
    })();;
    !(async() => {
      await notifyIfUnsolved(robot, 'kenshin', 'AtCoderやれ');
    })();;
  }, null, true, 'Asia/Tokyo');

  new cron('0 59 21 * * *', () => {
    !(async() => {
      await notifyIfUnsolved(robot, 'xuzijian629', 'そろそろAtCoderやれ');
    })();;
    !(async() => {
      await notifyIfUnsolved(robot, 'kenshin', 'そろそろAtCoderやれ');
    })();;
  }, null, true, 'Asia/Tokyo');

  new cron('0 59 22 * * *', () => {
    !(async() => {
      await notifyIfUnsolved(robot, 'xuzijian629', 'いい加減AtCoderやれ');
    })();;
    !(async() => {
      await notifyIfUnsolved(robot, 'kenshin', 'いい加減AtCoderやれ');
    })();;
  }, null, true, 'Asia/Tokyo');
}
