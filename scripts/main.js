const puppeteer = require('puppeteer');
const cron = require('cron').CronJob;

const id = {
  'xuzijian629': 'U2F6UPCKB',
  'kenshin': 'U2F7L8BGE',
  'ScarletBat': 'U2F5TUURF',
  'szkieletor': 'U2F6AMVDG',
  'tomcatowl': 'U2F7K0FPX'
};
let latestPointsum = {};
let mute = {};

async function getSolvedProblems(user, date, update) {
  let ret = {solved: []};
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://kenkoooo.com/atcoder/?user=${user}&kind=user`, {waitUntil: "networkidle2", timeout: 3000000});
    await page.waitFor(120000);
    let streak = await page.$('#root > div > div > div > div > div:nth-child(3) > div:nth-child(7) > h3');
    ret['streak'] = await (await streak.getProperty('textContent')).jsonValue();
    let longestStreak = await page.$('#root > div > div > div > div > div:nth-child(3) > div:nth-child(6) > h3');
    ret['isLongest'] = ret['streak'] === await (await longestStreak.getProperty('textContent')).jsonValue();
    if (ret['streak'] === '1 days') {
      ret['streak'] = '1 day';
    }
    let pointsum = await page.$('#root > div > div > div > div > div:nth-child(3) > div:nth-child(5) > h3');
    let sumvalue = await (await pointsum.getProperty('textContent')).jsonValue();
    sumvalue = Number(sumvalue);
    if (latestPointsum[user]) {
      ret['pointsum'] = sumvalue - latestPointsum[user];
    } else {
      ret['pointsum'] = undefined;
    }
    if (update) {
      latestPointsum[user] = sumvalue;
    }

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
    if (mute[id[user]]) return;
    const today = (new Date(Date.now() + 9 * 3600000)).toISOString().slice(0,10);
    let solved = await getSolvedProblems(user, today, false);
    if (solved['solved'].length === 0) {
      robot.send({room: '#daily_atcoder'}, `<@${id[user]}> ${message}`);
      return;
    }
    if (solved['pointsum'] && solved['pointsum'] < 300) {
      robot.send({room: '#daily_atcoder'}, `<@${id[user]}> もうちょっとAtCoderやれ`);
      return;
    }
  } catch(e) {
    robot.logger.error(e);
  }
}

async function summarize(robot, user) {
  try {
    const today = (new Date(Date.now() + 9 * 3600000 - 600000)).toISOString().slice(0,10);
    let solved = await getSolvedProblems(user, today, true);
    if (solved['solved'].length) {
      message = '';
      message += `<@${id[user]}> solved *${solved['solved'].length} problem${solved['solved'].length > 1 ? 's' : ''}*!!`;
      if (solved['pointsum']) message += ` Total *${solved['pointsum']} points* (Rated only)`;
      message += '\n';
      if (user in id) {
        message += `That's *${solved['streak']}* in a row to solve problems at AtCoder!${solved['isLongest'] ? " That's a new record!!" : ''}\n`;
      }

      for (let s of solved['solved']) {
        message += `${s.problem} ${s.link}\n`;
      }
      robot.send({room: '#daily_atcoder'}, message.slice(0, message.length - 1));
      mute[id[user]] = false;
    }
  } catch(e) {
    robot.logger.error(e);
  }
}

async function init() {
  const today = (new Date(Date.now() + 9 * 3600000)).toISOString().slice(0,10);
  for (let user in id) {
    getSolvedProblems(user, today, true);
  }
}

module.exports = robot => {
  robot.hear(/test$/, res => {
    res.send('hoge');
  });

  robot.hear(/やらない$/, res => {
    mute[res.message.user.id] = true;
  });

  !(async() => {
    init();
  })();

  new cron('0 8 0 * * *', () => {
    for (let user in id) {
      !(async() => {
        await summarize(robot, user);
      })();
    }
  }, null, true, 'Asia/Tokyo');

  new cron('0 58 19 * * *', () => {
    for (let user in id) {
      !(async() => {
        await notifyIfUnsolved(robot, user, 'AtCoderやれ');
      })();
    }
  }, null, true, 'Asia/Tokyo');

  new cron('0 58 21 * * *', () => {
    for (let user in id) {
      !(async() => {
        await notifyIfUnsolved(robot, user, 'そろそろAtCoderやれ');
      })();
    }
  }, null, true, 'Asia/Tokyo');

  new cron('0 58 22 * * *', () => {
    for (let user in id) {
      !(async() => {
        await notifyIfUnsolved(robot, user, 'いい加減AtCoderやれ');
      })();
    }
  }, null, true, 'Asia/Tokyo');
}
