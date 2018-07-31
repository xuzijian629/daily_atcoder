const puppeteer = require('puppeteer');
const cron = require('cron').CronJob;

const id = {
  'xuzijian629': 'U2F6UPCKB',
  'kenshin': 'U2F7L8BGE',
  'ScarletBat': 'U2F5TUURF',
  'szkieletor': 'U2F6AMVDG'
};

let latestPointsum = {
  'xuzijian629': 91700,
  'kenshin': 18700,
  'ScarletBat': 3700,
  'szkieletor': 10000
};

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
    if (ret['streak'] === '1days') {
      ret['streak'] = '1day';
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
    const today = (new Date(Date.now() + 9 * 3600000)).toISOString().slice(0,10);
    let solved = await getSolvedProblems(user, today, false);
    if (solved['solved'].length === 0) {
      robot.send({room: '#daily_atcoder'}, `<@${id[user]}> ${message}`);
      return;
    }
    if (solved['pointsum'] && solved['pointsum'] < 400) {
      robot.send({room: '#daily_atcoder'}, `<@${id[user]}> もうちょっとAtCoderやれ`);
      return;
    }
  } catch(e) {
    robot.logger.error(e);
  }
}

async function summarize(robot, user) {
  try {
    const today = (new Date(Date.now() + 9 * 3600000)).toISOString().slice(0,10);
    let solved = await getSolvedProblems(user, today, true);
    if (solved['solved'].length) {
      message = '';
      message += `<@${id[user]}> solved *${solved['solved'].length} problem${solved['solved'].length > 1 ? 's' : ''}*!!`;
      if (solved['pointsum']) message += ` Total *${solved['pointsum']} points*`;
      message += '\n';
      if (user in id) {
        message += `That's *${solved['streak']}* in a row to solve problems at AtCoder!${solved['isLongest'] ? " That's a new record!!" : ''}\n`;
      }

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

  new cron('0 58 23 * * *', () => {
    !(async() => {
      await summarize(robot, 'xuzijian629');
    })();
  }, null, true, 'Asia/Tokyo');
  new cron('30 58 23 * * *', () => {
    !(async() => {
      await summarize(robot, 'kenshin');
    })();
  }, null, true, 'Asia/Tokyo');
  new cron('0 59 23 * * *', () => {
    !(async() => {
      await summarize(robot, 'ScarletBat');
    })();
  }, null, true, 'Asia/Tokyo');
  new cron('30 59 23 * * *', () => {
    !(async() => {
      await summarize(robot, 'szkieletor');
    })();
  }, null, true, 'Asia/Tokyo');

  new cron('0 58 19 * * *', () => {
    !(async() => {
      await notifyIfUnsolved(robot, 'xuzijian629', 'AtCoderやれ');
    })();
    !(async() => {
      await notifyIfUnsolved(robot, 'kenshin', 'AtCoderやれ');
    })();
    !(async() => {
      await notifyIfUnsolved(robot, 'ScarletBat', 'AtCoderやれ');
    })();
    !(async() => {
      await notifyIfUnsolved(robot, 'szkieletor', 'AtCoderやれ');
    })();
  }, null, true, 'Asia/Tokyo');

  new cron('0 58 21 * * *', () => {
    !(async() => {
      await notifyIfUnsolved(robot, 'xuzijian629', 'そろそろAtCoderやれ');
    })();
    !(async() => {
      await notifyIfUnsolved(robot, 'kenshin', 'そろそろAtCoderやれ');
    })();
    !(async() => {
      await notifyIfUnsolved(robot, 'ScarletBat', 'そろそろAtCoderやれ');
    })();
    !(async() => {
      await notifyIfUnsolved(robot, 'szkieletor', 'そろそろAtCoderやれ');
    })();
  }, null, true, 'Asia/Tokyo');

  new cron('0 58 22 * * *', () => {
    !(async() => {
      await notifyIfUnsolved(robot, 'xuzijian629', 'いい加減AtCoderやれ');
    })();
    !(async() => {
      await notifyIfUnsolved(robot, 'kenshin', 'いい加減AtCoderやれ');
    })();
    !(async() => {
      await notifyIfUnsolved(robot, 'ScarletBat', 'いい加減AtCoderやれ');
    })();
    !(async() => {
      await notifyIfUnsolved(robot, 'szkieletor', 'いい加減AtCoderやれ');
    })();
  }, null, true, 'Asia/Tokyo');
}
