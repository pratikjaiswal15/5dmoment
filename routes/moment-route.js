const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Moment = require('../models/moment-model')

const DIR = './uploads';

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR);
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now()  + path.extname(file.originalname));
    }
});


let upload = multer({storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    }});

 
router.post('/api/upload',upload.single('photo'), function (req, res) {
  
    console.log(req.file)
    if (!req.file) {
        console.log("No file received");
        return res.send({
          success: false
        });
    
      } else {
        res.send(req.file)
      }
});


router.post('/moments', (req, res, next) => {

    console.log(req.body)
    let data = {
        image_url : req.body.image_url,
        comment : req.body.comment,
        date : new Date,
        tags : req.body.tags,
        user : req.body.user,

    }
    console.log(data)
//    res.send(data)

    Moment.create(data).then(data => {
        console.log(data)
        res.send(data)
    }).catch(next)
})


router.get('/moments', (req, res, next) => {
    
    Moment.find().populate('user', ['first_name', 'last_name']).then(data => {
        res.send(data)
    }).catch(next)
})


router.get('/moments/:id', (req, res, next) =>{

    Moment.findById(req.params.id).then(data => {
        if(data){
            res.send(data)
        }
        else {
            res.send('no data found')
        }
    }).catch(next)
})




router.delete('/moments/:id', (req, res, next) => {

    Moment.findByIdAndRemove({ _id: req.params.id }).then(data => {
        if (data) {
            res.send("successfully deleted")
        }
        else {
            res.send("No Moment found")
        }
    }).catch(next)
})

router.patch('/moments/:id', (req, res, next) => {

    var opts = { runValidators: true };

    Moment.findByIdAndUpdate({ _id: req.params.id }, req.body, opts).then(() => {
        Moment.findOne({ _id: req.params.id }).then(data => {
            res.send(data)
        }).catch(next)
    }).catch(next)

})



module.exports = router