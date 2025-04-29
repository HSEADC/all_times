import '../index.css'

import Airtable from "airtable"

const token = 'pat5hnGRx3HBTRL2p.ba1766c854c088ded98d29939fae6335ca2b2ba5c123f5b75649c0c9f3b98e07'

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: token
});
var base = Airtable.base('appodaRNMUmYeBIY5');
// pat5hnGRx3HBTRL2p

function getManifests() {
    // пишем ассинхронную функцию
    // что-то пишем -- нажимаем ентер -- переход в сёрч.штмл -- генерится штмл и заполняется данными из таблицы
    return new Promise((resolve, reject) => {
        // content -- empty arr
        const content = []

        base('manifests')
        .select({ maxRecords: 100 })
        .firstPage()
        .then((result) => {
            result.forEach((record) => {
                content.push({
                    id: record.id,
                    //найди мне ячейку кот написана точно так же как в таблице
                    titles: record.fields['Titles'],
                    years: record.fields['Years'],
                    describtions: record.fields['Describtions'],
                    tags: record.fields['Tags'],
                    imgs: record.fields['Images'],
                    quotes: record.fields['Quotes'],
                    url: record.fields['URL'],
                })
            })
            //подгрузка контента
            resolve(content) 
        })
    })
}

export { getManifests }

