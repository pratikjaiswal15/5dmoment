const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MomentSchema = new Schema({

    

    image_url: {
        type: String,
        required: [true, 'Image is required'],
    },

    comment: {
        type: String,
        required: [true, 'comment is required'],
        min : 2,
        max : 100

    },

    tags: [{
        type: String,
        required: [true, 'Tag is required']
    }],

    
    date : {
        type : String,
        required : true
    },

    user : {
        type : Schema.Types.ObjectId,
        ref : 'user'
    },


});

const Moment = mongoose.model('moment', MomentSchema);
module.exports = Moment

