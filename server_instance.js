var express = require('express');
const moment = require('moment');
const request = require('request');
var path = require('path');

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

var app = express();

app.use(express.urlencoded());
app.use(express.static('../dist'));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.all('/getAllData', async function (req, res) {
    res.send(pageBody);
});

function makeRequest(Url) {
    return new Promise((resolve, reject) => {
        let state_complete = false;
        let isValid = false;
        let req = request(

            {
                url: Url,
                //proxy: 'http://' + proxy,
                timeout: 4000,
                time: true
            },
            (error, response, body) => {
                if (!error) {
                    if(!state_complete){
                        state_complete = true;
                        resolve(body);
                    }
                } else {
                    if (!state_complete) {
                        state_complete = true;
                        reject(error);
                    }
                }
            }
        );
        setTimeout(() => {
            if(!state_complete) {
                state_complete = true;
                req.abort();
                reject('timeout');
            }
        }, 4000)
    });
}

async function main() {
    app.listen(3000, function () {
        console.log('Example app listening on port 3000!');
    });
    console.log('really?');
}

main();
