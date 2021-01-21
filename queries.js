const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: '185.22.62.114',
    database: 'gorzdrav',
    password: 'elkin25pass',
    port: 5432,
})

const request = require('request');

const create_refresh_lpu_query = body_json => {
    return 'truncate table lpu;' +
        'WITH str AS (SELECT json_array_elements(\'' + body_json + '\'::json->\'result\') as s)' +
        'insert into lpu (description, district_id, full_name, short_name, address, phone, email, longitude, latitude, is_covid_vaccination, id)' +
        'select s::json->\'description\', cast(s::json->>\'districtId\' as int), s::json->\'lpuFullName\', s::json->\'lpuShortName\', s::json->\'address\', s::json->\'phone\', s::json->\'email\', cast(s::json->>\'longitude\' as decimal), cast(s::json->>\'latitide\' as decimal), cast(s::json->>\'covidVaccination\' as bool), cast(s::json->>\'id\' as int) from str;'
}

const create_refresh_speciality_query = body_json => {
    return 'WITH str AS (SELECT json_array_elements(\'' + body_json + '\'::json->\'result\') as s)' +
        'insert into speciality (id, fer_id, count_free_participant, count_free_ticket, last_date, nearest_date, name)' +
        'select cast(s::json->>\'id\' as int), cast(s::json->>\'ferId\' as int), cast(s::json->>\'countFreeParticipant\' as int), cast(s::json->>\'countFreeTicket\' as int), cast(s::json->>\'lastDate\' as date), cast(s::json->>\'nearestDate\' as date), s::json->\'name\' from str;'
}

const do_query = (query, response) => {
    pool.query(query, (error, results) => {
        if (error) {
            throw error
        }
        if (response)
            response(results.rows);
    })
}

async function makeRequest(Url) {
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

// update lpu
// makeRequest('https://gorzdrav.spb.ru/_api/api/lpu').then(response => {
//     // console.log(create_refresh_lpu_query(response));
//     do_query(create_refresh_lpu_query(response));
// })
// update lpus' specialists
do_query('Select id from lpu', ids => {
    do_query('truncate table speciality');
    ids.forEach(async id => {
        let sp = await makeRequest('https://gorzdrav.spb.ru/_api/api/lpu/' + id + '/speciality');
        console.log(create_refresh_speciality_query(sp));
        do_query(create_refresh_speciality_query(sp));
    })
    //console.log(response)
})
// makeRequest('https://gorzdrav.spb.ru/_api/api/lpu').then(response => {
//
// })

