const express = require('express');
const fs = require("fs");
const mustacheExpress = require('mustache-express');
const app = express()
const port = 3000
var fileNames = [];
var index = -1;
const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')
const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

app.engine('mustache', mustacheExpress());
app.use(express.static('public'))
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
app.use(express.static('public'))
app.get('/', load);
// app.get('/next', (req, res) => getNextDocId(res));
// app.get('/previous', (req, res) => getPreviousDocId(res));

function load(req, res){
    console.log(req);
    if(fileNames.length == 0){
        fileNames = getDirectories('./docs/');
    }
    index++;
    if(index == fileNames.length) index = 0;
    var docId = fileNames[index];
    var fileData = fs.readFileSync(`./docs/${docId}/pdfixNormal/${docId}.html`, 'utf8');
    res.render("amp", {
        canonical: 'https://scribd.com',
        doc_title: 'An amazing document omg',
        meta_description: 'Some description',
        doc_description: 'This document is the coolest thing ever.',
        uploadedBy_profileUrl: 'https://scribd.com/person',
        uploadedBy_userName: 'Augustin Bralley',
        uploadedDate: '1/12/2018',
        htmlContent: fileData
    });
}

// function ampifyHtml(inputPath, outputPath){
//   console.log(inputPath);
//   console.log(outputPath);
//   const ampFile = fs.createWriteStream(__dirname + "/" + outputPath);
//   fs.createReadStream(inputPath)
//   .pipe(stringReplaceStream("img", "amp-img width='400' height='300' "))
//   // .pipe(stringReplaceStream("../pandoc/media", "amp-img width='400' height='300' "))
//   .pipe(ampFile);
//   // ampFile.end()
// }

// function getPreviousDocId(res) {
//     index--;
//     if(index == -1) index = fileNames.length - 1;
//     res.send(fileNames[index]);
// }

app.listen(port, () => console.log(`Example app listening on port ${port}!`))