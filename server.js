const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
var fs =  require('fs');

const app = express();

app.use(express.static('public'));


const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey'
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'bucket-name',
    acl: 'public-read',
    key: function (request, file, cb) {
      console.log(file);
      cb(null, file.originalname);
    }
  })
}).array('upload', 1);


app.post('/upload', function (request, response, next) {
  upload(request, response, function (error) {
    if (error) {
      console.log(error);
      return response.redirect("/error");
    }
    console.log('File uploaded successfully.');
    response.redirect("/success");
  });
});

app.get('/signedurl',function(request,response) {
  var params = {Bucket:'bucket-name', Key:'object-name', Expires: 10000};
                    s3.getSignedUrl('getObject',params, function (e, presignedurl) {
                      console.log(presignedurl);
                    });



});




app.get('/api/uploadUsingPutObject',function(request,response) {
 console.log("here");

  fs.readFile('demo.jpg', function (err, data) {
  if (err) { throw err; }


     var params1 = {Bucket: 'bucket-name', Key:'demo.jpg', Body: data };

     s3.putObject(params1, function(err, data) {

         if (err) {

             console.log(err)

         } else {

             console.log("Successfully uploaded data to myBucket/myKey");
             response.send("sent");

         }

      });

});



});



// Main, error and success views
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

app.get("/success", function (request, response) {
  response.sendFile(__dirname + '/public/success.html');
});

app.get("/error", function (request, response) {
  response.sendFile(__dirname + '/public/error.html');
});

app.listen(3001, function () {
  console.log('Server listening on port 3001.');
});

