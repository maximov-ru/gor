var express = require('express');
const moment = require('moment');
const request = require('request');
var path = require('path');

const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'postgres',
    host: '185.22.62.114',
    database: 'gorzdrav',
    password: 'elkin25pass',
    port: 5432,
});


const create_refresh_lpu_query = body_json => {
    return 'truncate table lpu;' +
        'WITH str AS (SELECT json_array_elements(\'' + body_json + '\'::json->\'result\') as s)' +
        'insert into lpu (description, district_id, full_name, short_name, address, phone, email, longitude, latitude, is_covid_vaccination, id)' +
        'select s::json->\'description\', cast(s::json->>\'districtId\' as int), s::json->\'lpuFullName\', s::json->\'lpuShortName\', s::json->\'address\', s::json->\'phone\', s::json->\'email\', cast(s::json->>\'longitude\' as decimal), cast(s::json->>\'latitide\' as decimal), cast(s::json->>\'covidVaccination\' as bool), cast(s::json->>\'id\' as int) from str;'
};

const create_refresh_speciality_query = (body_json, lpu_id) => {
    return 'WITH str AS (SELECT json_array_elements(\'' + body_json + '\'::json->\'result\') as s)' +
        'insert into speciality (id, lpu_id, fer_id, count_free_participant, count_free_ticket, last_date, nearest_date, name)' +
        'select cast(s::json->>\'id\' as int), ' + lpu_id + ', s::json->\'ferId\', cast(s::json->>\'countFreeParticipant\' as int), cast(s::json->>\'countFreeTicket\' as int), cast(s::json->>\'lastDate\' as date), cast(s::json->>\'nearestDate\' as date), s::json->\'name\' from str;'
};

const do_query = (query, response) => {
    pool.query(query, (error, results) => {
        if (error) {
            throw error
        }
        if (response)
            response(results.rows);
    })
};

var app = express();

app.use(express.urlencoded());
app.use(express.static('dist'));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.all('/getAllData', async function (req, res) {
    do_query('Select d.name, l.short_name, l.address, l.phone, s.count_free_participant, s.count_free_ticket, s.last_date, s.nearest_date\n' +
        'from speciality s\n' +
        'join lpu l on l.id = s.lpu_id\n' +
        'join district d on l.district_id = d.id\n' +
        'where lower(s.name) like \'%cov%\'\n' +
        'order by d.name', async result => {
        res.json(result);

    });
});

function makeRequest(Url) {
    return new Promise((resolve, reject) => {
        let state_complete = false;
        let isValid = false;
        let req = request(

            {
                url: Url,
                //proxy: 'http://' + proxy,
                timeout: 40000,
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

async function update_specialization() {
    do_query('Select id from lpu where is_covid_vaccination = TRUE', async ids => {
        do_query('truncate table speciality');

        for (let id of ids ) {
            let sp = await makeRequest('https://gorzdrav.spb.ru/_api/api/lpu/' + id.id + '/speciality');
            console.log(create_refresh_speciality_query(sp, id.id));
            do_query(create_refresh_speciality_query(sp, id.id));
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        //console.log(response)
    })
}

async function update_lpu() {
    makeRequest('https://gorzdrav.spb.ru/_api/api/lpu').then(response => {
     do_query(create_refresh_lpu_query(response));
 });
}

async function main() {
    app.listen(3000, function () {
        console.log('Example app listening on port 3000!');
    });
    setInterval(update_specialization, 60000);
    setInterval(update_lpu, 60000 * 60 * 24);
    console.log('really?');
}

main();
