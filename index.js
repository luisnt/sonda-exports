const axios = require("axios")
const fs = require('fs')
var argv = require('minimist')(process.argv.slice(2))
const token = require("./itoken")

let { dataInicial, dataFinal } = argv

console.log({ dataInicial, dataFinal })

const filename = `./distancia_pecorrida_${dataInicial}_${dataFinal}.csv`

const params = JSON.parse('{"dataInicial":"2022-07-11 00:00:00","dataFinal":"2022-07-11 00:00:00","agrupamento":78,"veiculos":[],"enviarParaWorker":false}')
dataInicial = `${dataInicial} 00:00:00`
dataFinal = `${dataFinal} 00:00:00`
const query = JSON.stringify({ ...params, dataInicial, dataFinal })

const reqOptions = {
    url: encodeURI(`https://zn5.sinopticoplus.com/api/kmPercorrido/relatorio/1228/${query}`),
    method: "GET",
    headers: {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Authorization": `Bearer ${token}`
    }
}

axios.request(reqOptions)
    .then(function (response) {
        const { data } = response
        const { analitico: dates } = data

        const values = []
        let dataBr = ""

        dates.forEach(date => {
            const { data: dataBr } = date
            const { dados } = date

            dados.forEach(dado => {
                const { veiculo, empresa: { nome: empresa }, distanciaPercorrida } = dado
                values.push(`${dataBr};${veiculo.replace(/[^\d]+/g, '')};${empresa};${distanciaPercorrida}`)
            })
            console.log(`Data: ${dataBr} -> ok`)
        })
        const value = values.join("\n")

        fs.writeFile(`${filename}`, value, function (err, data){
            if (err) {
                return console.log(`Error ${JSON.stringify(err)}`)
            }
        })
    }).catch(e => console.error(e))
