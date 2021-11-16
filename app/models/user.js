const mongoose = require('mongoose');
var Comment = require('./comment');

const userSchema = new mongoose.Schema({
    id: { type: String, trim:true, required: true},
    pwd: { type: String, trim:true, required: true},
    name: { type: String, required: true},
    nickname: { type: String},
    email: {
        type:String, required:true,
        // validate(value){
        //     if(!validator.isEmail(value)) throw new Error("Email is invalid");
        // }
    },
    lot_rate_list: [{
        lot: {type: mongoose.Schema.Types.ObjectId, ref: 'Parklot'},
        myrate: {type: Number, default: 0 }
    }],
    mycomments: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
},{
    timestamps:true
});


userSchema.statics.create = function(payload){
    const user = new this(payload);
    return user.save();
}
userSchema.statics.findAll = function(payload){
    return this.find({});
}

userSchema.statics.findOneById = function(id){
    return this.findOne({_id: id});
}
userSchema.statics.updateById = function(id, payload){
    return this.findOneAndUpdate({_id: id},{$set: payload}, {new: true});
}
userSchema.statics.deleteById = function(id){
    return this.remove({_id: id});
}

userSchema.statics.incLike = function(userid, lotid, pmt){
    this.findOne({_id: userid, 'lot_rate_list.lot':lotid}).then(user => {
        console.log('lot_rate_list에 lotid값이 있는 객체는'+user);
        if(!user){
            this.findOne({_id: userid}).then(nopark => {
                console.log('userid가 '+userid+' 인 객체는');
                console.log(nopark);

                // lot_rate_list에 myrate가 1인 lotid를 추가하고
                if(pmt=1){ // like인 경우
                    nopark.lot_rate_list.push({lot:lotid, myrate:1});
                    nopark.save();
                }else if(pmt=2){ //dislike인 경우
                    nopark.lot_rate_list.push({lot:lotid, myrate:-1});
                    nopark.save();
                }

                console.log('lot_rate_list 추가!');
                console.log(nopark);
            });
        }else{
            // 해당 lot의 myrate가 뭔지 확인하자
            console.log(user.find({'lot_rate_list.lot':lotid}).myrate);
        }
    })


    // return this.findOneAndUpdate(
    //     {_id: userid, 'lot_rate_list.lot': lotid}, {$inc: {'lot_rate_list.$.myrate': 1}}, {new: true});
}


module.exports = mongoose.model('User',userSchema);