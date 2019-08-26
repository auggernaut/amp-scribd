var stringReplaceStream = require('string-replace-stream');


function convertDoc(req, res) {
  let docId = req.query.docId;
  let docMeta = search(docId, docsList);
  let conversionType = req.query.conversionType;
  if(!(docId && docMeta && conversionType)) {
      res.send('Missing values.');
      return;
  }
  try {
      // var err = new Error(); err.code = 'ENOENT'; throw(err);
      let docData = fs.readFileSync(`./public/docs/${docId}/${conversionType}/${docId}.html`, 'utf8');
      returnAMPTemplate(res, docId, docData, docMeta)
  } catch (err) {
      if (err.code === 'ENOENT') {
          console.log('File not found... generating...' + docId + ' ' + conversionType);
          fetchFile(docId, docMeta.uuid, 'pdf') // TODO: dont download if it already exists?
          .then(() => {
              exec(`if test -d public/docs/${docId}; then echo "docId folder exists"; else mkdir public/docs/${docId}; fi`);
              if(conversionType == 'mammoth') return makeMammoth(docId);
              if(conversionType == 'pandoc') return makePandoc(docId);
              if(conversionType == 'pdfixReflow') return makePDFix(docId, true);
              if(conversionType == 'pdfixNormal') return makePDFix(docId, false);
          })
          .then(() => {
              docData = fs.readFileSync(`./public/docs/${docId}/${conversionType}/${docId}.html`, 'utf8');
              returnAMPTemplate(res, docId, docData, docMeta) 
          })
          .catch((err) => {
              console.log(err);
              res.send(err);
          });
      } else {
          returnAMPTemplate(res, docId, docData, docMeta);
      }
  }
}

function loadDocsList(req, res){
  // Load from csv, generate docsList
  filepath = '/exampleQueryResults.csv'; // TODO: pass this in from somewhere
  let path = __dirname + filepath; //req.query.csvFilePath;
  console.log(path);
  csv().fromFile(path)
  .then((json)=>{
      docsList = json
      res.send('File list loaded successfully.');
  });
  csv()
  .on('error',(err)=>{
      console.log(err);
  })
}


function returnAMPTemplate(res, docId, docData, docMeta){
  res.render("amp", {
      canonical: `https://www.scribd.com/${docId}/${docMeta.slug}`,
      doc_title: docMeta.title,
      meta_description: docMeta.description == 'NULL' ? '' : docMeta.description,
      doc_description: docMeta.description == 'NULL' ? '' : docMeta.description,
      uploadedBy_profileUrl: `https://www.scribd.com/user/${docMeta.userid}`,
      uploadedBy_userName: docMeta.username == 'NULL' ? '' : docMeta.username,
      uploadedDate: convertDate(docMeta.uploadedat),
      htmlContent: docData
  });
}

function ampifyHtml(inputPath, outputPath){
    console.log(inputPath);
    console.log(outputPath);
    const ampFile = fs.createWriteStream(__dirname + "/" + outputPath);
    fs.createReadStream(inputPath)
    .pipe(stringReplaceStream("img", "amp-img width='400' height='300' "))
    // .pipe(stringReplaceStream("../pandoc/media", "amp-img width='400' height='300' "))
    .pipe(ampFile);
    // ampFile.end()
}
