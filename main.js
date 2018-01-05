const axios = require('axios');
const cheerio = require('cheerio')
const csv = require('fast-csv')
const fs = require('fs')
const csvStream = csv.createWriteStream()
const writableStream = fs.createWriteStream("data.csv");

start()

async function start(){
  
  try{
    csvStream.pipe(writableStream);
    await parseSite()
  }catch(e){
    console.error(e)
  } finally {
    console.log('Fin')
  }
}

async function parseSite(){
  
  for (let page  = 0; page <= 82; page++) {
    await parseList(page)
  }
}

async function parseList(page){
  console.log(`Parsing page ${page}`)
  const request = await axios.get(`http://www.europe1.fr/emissions/au-coeur-de-l-histoire?page=${page}`)
  const $ = cheerio.load(request.data)
  const emissions = cheerio($('.listing_emissions li'))
  
  for (const index in emissions.toArray()){
    if(index !=='0') {
      const date = cheerio(emissions.toArray()[index]).find('.date')
      await parsePage(date.text(),date.next().attr('href'))
    }
  }
}

async function parsePage(date,url){
  const request = await axios.get(url)
  const $ = cheerio.load(request.data)
  const title = $('h1').text()

  const start = request.data.search('file: ')
  const end = request.data.search('mp3')
  
  let mp3 =''
  if(start !== -1 && end !==-1)
    mp3 = request.data.substring(start+7,end+3)
  
  csvStream.write({
    date: date,
    title: title,
    url: url,
    mp3: mp3
  })
  console.log(`Adding episode ${date} : ${title}`)
  
  
}
