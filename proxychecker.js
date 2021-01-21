var express = require('express');
const moment = require('moment');
const request = require('request');
//const request = require('request-promise-native');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
console.log('step1');
var app = express();
app.use(express.urlencoded());

console.log(moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss'));
//exit(1);
//return;
console.log('step2');
var sequelize = new Sequelize('pyckio_info', 'postgres', 'elkin25pass', {
    host: '185.22.62.114',
    dialect: 'postgres',
    port: 5432,
    logging: false
});

var Proxies = sequelize.define('proxies', {
    proxy_uri: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    last_check_time: Sequelize.DATE,
    last_valid_check_time: Sequelize.DATE,
    count_checks: Sequelize.INTEGER,
    errors_count: Sequelize.INTEGER,
    ping: Sequelize.STRING,
}, {
    tableName: 'proxies',
    indexes: [ { unique: false, fields: [ 'errors_count' ] } ],
    timestamps: false,
    paranoid: true,
});
Proxies.removeAttribute('id');
Proxies.removeAttribute('createdAt');
Proxies.removeAttribute('updatedAt');
console.log('step3');
app.all('/', async function (req, res) {
    let validCount = 0;
    let totalCount = 0;
    try {
        validCount = await Proxies.count({
            where: {
                errors_count: {
                    [Op.lt]: 6
                }
            }
        });
        totalCount = await Proxies.count();
    } catch (e) {
        console.log('cant get counts', e);
    }
    console.log('body: ', req.body);
    let result = {validCount: 0, totalCount: 0};
    if (req.body && req.body.proxylist) {
        result = await initialCheck(req.body.proxylist);
    }
    var pageBody = `<!DOCTYPE html>
<html>
 <head>
  <meta charset="utf-8">
  <title>Proxy checker</title>
  <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js" integrity="sha384-xrRywqdh3PHs8keKZN+8zzc5TX0GRTLCcmivcbNJWm2rs5C8PRhcEn3czEjhAO9o" crossorigin="anonymous"></script>
 </head>
 <body>
 <div class="container">
  <div class="row">
    <div class="col">
      Valid count: ${validCount}
    </div>
    <div class="col">
      Total count: ${totalCount}
    </div>
  </div>
  <div class="row">
    <div class="col">
      ${result.validCount}
    </div>
    <div class="col">
      ${result.totalCount}
    </div>
    <div class="col">
      <form method="post">

  <div class="form-group form-check">
    <label for="proxylist">Proxies list</label>
    <textarea class="form-control" id="proxylist" rows="3" name="proxylist"></textarea>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
    </div>
  </div>
</div>
`;

    pageBody += `</body>`;
    res.send(pageBody);
});
console.log('step4');

function checkProxy(proxy) {
    console.log('try check', proxy);
    return new Promise((resolve, reject) => {
        let state_complete = false;
        let isValid = false;
        let req = request(
            {
                url: 'https://ya.ru/',
                proxy: 'http://' + proxy,
                timeout: 4000,
                time: true
            },
            (error, response, body) => {
                if (!error) {
                    isValid = true;
                    console.log('valid', proxy);
                }
                if(!state_complete){
                    state_complete = true;
                    resolve(isValid);
                }
            }
        );
        setTimeout(() => {
            if(!state_complete) {
                state_complete = true;
                req.abort();
                resolve(isValid);
            }
        }, 4000)
    });
}

async function checkingThread() {
    console.log('chk');
    await new Promise(resolve => setTimeout(resolve, 60000));
    const proxiesForTest = await Proxies.findAll({
        where: {
            errors_count: {
                [Op.lt]: 6
            }
        },
        order: [
            ['errors_count', 'ASC'],
        ]
    });

    try {
        for (let proxyInfo of proxiesForTest) {
            console.log('proxy info', proxyInfo.proxy_uri);
            const isValid = await checkProxy(proxyInfo.proxy_uri);
            console.log(isValid ? 'ok' : 'fail');

            if (isValid) {
                proxyInfo.update({
                    count_checks: proxyInfo.count_checks + 1,
                    last_valid_check_time: new Date(),
                    last_check_time: new Date()
                });
            } else {
                proxyInfo.update({
                    count_checks: proxyInfo.count_checks + 1,
                    errors_count: proxyInfo.errors_count + 1,
                    last_check_time: new Date()
                });
            }
        }
    }catch (e) {
        console.log('WTF?', e);
    }
    console.log('END!');
    checkingThread();
}

async function initialCheck(proxylist) {
    const pr = proxylist.split("\r\n").map(i => i.trim());
    console.log(JSON.stringify(pr));
    let validCount = 0;
    let totalCount = 0;
    for (let p of pr) {
        totalCount++;
        const isValid = await checkProxy(p);
        if (isValid) {
            try {
                await Proxies.create({
                    proxy_uri: p,
                    last_check_time: new Date(),
                    last_valid_check_time: new Date()
                });
                console.log('ok', p);
                validCount++;
            } catch (e) {
                console.log('fail ', p);
            }
        } else {
            console.log('fail ', p);
        }
    }
    return {validCount, totalCount};
}
async function main() {
    await Proxies.sync();
    //checkingThread();
    app.listen(3000, function () {
        console.log('Example app listening on port 3000!');
    });
    console.log('really?');
}

main();
/*const pr = `108.61.170.207:31486
178.62.246.248:8080
199.247.22.236:33244
178.33.36.137:80
178.128.243.130:8080
178.62.244.192:8080
178.62.246.248:8080
185.101.94.150:6969
144.91.83.160:3128
5.189.133.231:80
173.212.202.65:80
207.154.200.199:3128
207.180.226.111:3128
207.180.226.111:8080
142.93.130.169:8118
116.203.127.92:3128
52.157.215.67:3128
52.157.215.147:3128
157.230.112.218:8080
173.249.35.163:10020
144.91.80.231:3128
138.201.72.117:80
104.40.177.48:80
173.249.35.163:10010
173.249.35.163:1448
116.202.110.204:3128
52.142.235.16:8080
13.95.132.65:8888
130.193.112.146:36923
173.249.35.163:10010
51.38.127.75:3128
103.119.112.82:8888
167.71.2.77:8080
94.130.92.51:80
144.91.80.233:3128
144.91.80.232:3128
45.77.54.39:8080
144.91.80.230:3128
207.180.226.111:80
195.201.32.120:3128
37.139.11.197:3128
148.251.11.217:3128
157.230.112.218:80
80.155.163.164:8080
194.26.180.142:3128
5.9.73.93:8080
173.212.205.33:8000
144.91.80.229:3128
138.201.106.88:8080
94.130.20.85:31288
138.201.223.250:31288
185.72.203.244:8080
45.76.43.163:8080
206.54.170.135:4433`.split("\n");
console.log(JSON.stringify(pr));
    pr.forEach(p =>checkProxy(p));*/

/*
"express": "^4.17.1",
    "line-reader": "^0.4.0",
    "moment": "^2.24.0",
    "pg": "^7.12.1",
    "pg-hstore": "^2.3.3",
    "puppeteer": "^1.20.0",
    "puppeteer-core": "^1.20.0",
    "request": "^2.88.0",
    "request-promise-native": "^1.0.7",
    "sequelize": "^5.18.4"
 */
