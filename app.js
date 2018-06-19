//gif upload
//var url = "https:\//csh-mongo-csh7183.c9users.io/";
var url = "http:\//35.229.248.143/";

var path = require('path');
var express = require("express");
var app = express();
var multer = require('multer');
var crypto = require("crypto");
var mime = require('mime-types');
var sharp = require('sharp');
var fs = require("fs");
//var gm = require('gm');
var jsonfile = require('jsonfile')
var dataPath = 'data.json'

// app.use(express.static(dir));

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/images')
    },
    filename: function(req, file, cb) {
        crypto.randomBytes(1, function(err, raw) {
            if (err) {
                console.log(err);
            }
            else {
                cb(null, getDateTime() + '-' + raw.toString('hex') + '.' + mime.extension(file.mimetype));
            }
        });


    }
})

var upload = multer({ storage: storage })

app.set("view engine", "ejs");

var dir = path.join(__dirname, 'public');



app.get("/", function(req, res) {
    res.render("index");
});

function createThumbnail(req, res, next) {


    req.files.forEach(function(_file) {
        var filePath = _file.path;
        sharp(filePath)
            .resize(300, 200)
            .toFile(filePath.split(".")[0] + "-s.jpg", function(err) {

                if (err) { throw err; }
            })

        next();
    });





}

function writeToData(req, res, next) {


    var dataString = "{";

    for (var i = 0; i < req.files.length; i++) {
        var fileName = req.files[i].filename;
        //  dataString +='{ "name":"John", "age":30, "city":"New York"}'
        dataString += "\"fn" + i + "\": \"" + fileName + "\", \"tb" + i + "\": \"" + fileName.split(".")[0] + "-s.jpg\"";
        if (i < req.files.length - 1) {
            dataString += ",";
        }
    }
    dataString += "}"
    //console.log(dataString);

    jsonfile.readFile(dataPath, function(err, obj) {
        if (err) throw err;
        else {

            var new_obj = JSON.parse(dataString);
            obj.push(new_obj);
            jsonfile.writeFile(dataPath, obj, function(err) {
                if (err) { console.error(err) }
                else {
                  /*  console.log("file uploaded!");*/
                    next();
                }
            })

        }

    })

}

app.post('/upload', upload.array('image', 2), createThumbnail, writeToData, function(req, res) {


//upload.any()
    // upload.array('image', 2)
     var file = req.files[0];
   

    // console.log('MIMEType：%s', file.mimetype);
    // //console.log('Originalname：%s', file.originalname);
    // console.log('File.size：%s', file.size);
    // //console.log('File.path：%s', file.path);
     console.log('File.name：%s', file.filename);
    res.redirect("/qr/"+file.filename.split(".")[0]);
   // res.send("Upload Successful");
   // //res.end();

});


app.get("/qr/:link", function(req, res) {

            res.render("qr", { linkVar: req.params.link,urlVar:url });

});

app.get("/gallery", function(req, res) {

    jsonfile.readFile(dataPath, function(err, obj) {
        if (err) throw err;
        else {
            obj.reverse();
            //console.log(obj.reverse());
            res.render("gallery", { obj: obj.slice(0, 50),urlVar:url });
        }
    });


});

app.get("/page/:fn", function(req, res) {



    jsonfile.readFile(dataPath, function(err, obj) {
        if (err) throw err;
        else {
            var searchName = req.params.fn ;
            var selected = obj.filter(
                function(data) { return data.fn0.split(".")[0] == searchName }
            );
            //console.log(selected);
            if (typeof selected[0] === 'undefined' || !selected) {
                res.send("<h1>File Not Found</h1>");
            }
            else {
                
                res.render("page.ejs", { fn0Var: selected[0].fn0, fn1Var: selected[0].fn1,urlVar:url });
                
            }

        }
    });


});


const PORT = process.env.PORT || 3000;


app.listen(PORT, function() {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});


function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    // var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    //  return year  + month  + day  + hour  + min  + sec;

    return month + day + hour + min + sec;

}
