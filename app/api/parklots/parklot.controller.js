const Parklot = require('../../models/parklot');
const Rate = require('../../models/rate');
const User = require('../../models/user');
const Comment = require('../../models/comment');

exports.index = (req, res) => {
    Parklot.findAll().then((lots) => {
        if(!lots.length) return res.status(404).send({err: 'SE09'});
        res.send(lots);

        console.log('lot list log');
        console.log(lots);
        console.log('---------------');
    }).catch(err => res.status(500).send(err));
};

exports.create = (req, res) => {
    Parklot.findOne({lotid: req.body.lotid}).then(lot => {
        if(!lot){
            Parklot.create(req.body).then(newlot => {
                console.log('lot create log');
                console.log(req.body);
                console.log('-------------------');
            
                return res.send(newlot);
            }).catch(err => console.log(err))
        }else{
            console.log('이미 생성된 lotid입니다.');
            return res.send('이미 생성된 lotid입니다.');
        }
    }).catch(err => console.log(err))

    // Parklot.create(req.body)
    //     .then(lot => {
    //         res.send(lot)
            
    //         console.log('lot create log');
    //         console.log(req.body);
    //         console.log(req.body.lotid);
    //         console.log(req.body.longitude);
    //         console.log('-------------------');
    //     })
    //     .catch(err => res.status(500).send(err));
}

exports.readno = (req, res) => {
    Parklot.findOneByParkno(req.params.no).then((lot) => {
            if(!lot) return res.status(404).send({err: 'SE09'});
            res.status(200).send(lot);

            console.log('lot readno log');
            console.log(lot);
            console.log('------------------------');
        }).catch(err => res.status(500).send(err));
}

exports.readid = (req, res) => {
    Parklot.findOneById(req.params.id).then((lot) => {
        if(!lot) return res.status(404).send({err: 'SE09'});
            res.status(200).send(lot);

            console.log('lot readid log');
            console.log(lot);
            console.log('------------------------');
        }).catch(err => res.status(500).send(err));
}

exports.deleteno = (req, res) => {
    // 먼저 해당 parklot에 속하는 rate와 모든 comment를 삭제하여야 한다.
    Parklot.findOneAndDelete({lotid: req.params.no}).then(parklot => {
        console.log('parklot => ' + parklot);
        console.log('parklot.comments => ' + parklot.comments);
        console.log('parklot.comments.length => ' + parklot.comments.length);
        let parklotid = parklot._id;
        let clength = parklot.comments.length;
        let rlength = parklot.ratelist.length;

        for(let i=0; i < clength; i++){
            let userid = parklot.comments[i].user;
            let comid = parklot.comments[i].comment;

            console.log('comment userid => ' + userid);
            console.log('comid => ' + comid);

            User.findOneById(userid).then(user => {
                user.mycomments.pull(comid);
                console.log('User.mycomments['+i+'] pull 완료');
                user.save();
            }).catch(err => console.log(err));
            
            Comment.deleteOne({_id: comid}).then()
                .catch(err => res.status(500).send(err));
            console.log('Comment 삭제 완료');
        }
        for(let i=0; i < rlength; i++){
            let userid = parklot.ratelist[i];

            console.log('rate userid => ' + userid);
            User.findOne({_id: userid, 'lot_rate_list.lot':parklotid}).then(user => {
                let mrate = user.lot_rate_list[0].myrate;
                user.lot_rate_list.pull({lotid: parklotid, myrate: mrate});
                user.save();
            })
        }

        Rate.deleteOne({_id: parklot.rate}).then()
            .catch(err => console.log(err));

        res.sendStatus(200);
    }).catch(err => res.status(500).send(err));

    // 각 user의 lot_rate_list에서도 해당되는 parklot 삭제해야함
    // 아 rate_userid 목록이 필요함. rate 수행시 해당 목록을 작성해주어야한다.

   
}

exports.deleteid = (req, res) => {
    Parklot.findOneAndDelete({lotid: req.params.id}).then(parklot => {
        console.log('parklot => ' + parklot);
        console.log('parklot.comments => ' + parklot.comments);
        console.log('parklot.comments.length => ' + parklot.comments.length);
        let parklotid = parklot._id;
        let clength = parklot.comments.length;
        let rlength = parklot.ratelist.length;

        for(let i=0; i < clength; i++){
            let userid = parklot.comments[i].user;
            let comid = parklot.comments[i].comment;

            console.log('comment userid => ' + userid);
            console.log('comid => ' + comid);

            User.findOneById(userid).then(user => {
                user.mycomments.pull(comid);
                console.log('User.mycomments['+i+'] pull 완료');
                user.save();
            }).catch(err => console.log(err));
            
            Comment.deleteOne({_id: comid}).then()
                .catch(err => res.status(500).send(err));
            console.log('Comment 삭제 완료');
        }
        for(let i=0; i < rlength; i++){
            let userid = parklot.ratelist[i];

            console.log('rate userid => ' + userid);
            User.findOne({_id: userid, 'lot_rate_list.lot':parklotid}).then(user => {
                let mrate = user.lot_rate_list[0].myrate;
                user.lot_rate_list.pull({lotid: parklotid, myrate: mrate});
                user.save();
            })
        }

        Rate.deleteOne({_id: parklot.rate}).then()
            .catch(err => console.log(err));

        res.sendStatus(200);
    }).catch(err => res.status(500).send(err));
}

exports.updateRate = (req, res) => {
    Parklot.findOne({_id: req.body.lotid}).then(parklot => {
        Promise.all([
            User.findOne({
                _id: req.body.userid, 
                'lot_rate_list.lot': req.body.lotid}),
            User.findOne({_id: req.body.userid}),
            User.findOne({
                _id: req.body.userid, 
                'lot_rate_list.lot': req.body.lotid
                }, 'lot_rate_list.$'),
            Rate.findOneById(parklot.rate)
        ]).then(([exist, user, lot, rateid]) => {
            console.log('parklot => ' + parklot);
            console.log('---------------------');
            console.log('exist => ' + exist);
            console.log('---------------------');
            console.log('user => ' + user);
            console.log('---------------------');
            console.log('lot => ' + lot);
            console.log('---------------------');
            console.log('rateid => ' + rateid);
            console.log('---------------------');
            console.log('rateid.like => ' + rateid.like);
            console.log('---------------------');
            console.log('rateid.dislike => ' + rateid.dislike);
            console.log('---------------------');

    
            if(!exist){ // user가 null이라면
                if(req.body.pmt==1){ // like인 경우
                    user.lot_rate_list.push({lot:req.body.lotid, myrate:1});
                    console.log('push 완료');

                    rateid.like++;
                }else if(req.body.pmt==2){ //dislike인 경우
                    user.lot_rate_list.push({lot:req.body.lotid, myrate:-1});
                    console.log('push 완료');

                    rateid.dislike++;
                }
                parklot.ratelist.push(req.body.userid);
            }else{
                console.log('user는 null이 아닙니다.');
                let myrate = lot.lot_rate_list[0].myrate;
                console.log('myrate : ' + myrate);
                if(myrate == 1){
                    if(req.body.pmt == 1){
                        console.log('like를 취소합니다.');
                        user.lot_rate_list.pull({lot:req.body.lotid, myrate: 1});
                        user.lot_rate_list.push({lot:req.body.lotid, myrate: 0});
                        
                        rateid.like--;
                    }else if(req.body.pmt == 2){
                        console.log('like를 dislike로 변경합니다.');
                        user.lot_rate_list.pull({lot:req.body.lotid, myrate: 1});
                        user.lot_rate_list.push({lot:req.body.lotid, myrate: -1});
                        
                        rateid.like--;
                        rateid.dislike++;
                    }
                }else if(myrate == -1){
                    if(req.body.pmt == 1){
                        console.log('dislike를 like로 변경합니다.');
                        user.lot_rate_list.pull({lot:req.body.lotid, myrate: -1});
                        user.lot_rate_list.push({lot:req.body.lotid, myrate: 1});
                        
                        rateid.like++;
                        rateid.dislike--;
                    }else if(req.body.pmt == 2){
                        console.log('dislike를 취소합니다.');
                        user.lot_rate_list.pull({lot:req.body.lotid, myrate: -1});
                        user.lot_rate_list.push({lot:req.body.lotid, myrate: 0});
                        
                        rateid.dislike--;
                    }
                }else if(myrate == 0){
                    if(req.body.pmt == 1){
                        console.log('like로 평가합니다.');
                        user.lot_rate_list.pull({lot:req.body.lotid, myrate: 0});
                        user.lot_rate_list.push({lot:req.body.lotid, myrate: 1});
                        
                        rateid.like++;
                    }else if(req.body.pmt == 2){
                        console.log('dislike로 평가합니다.');
                        user.lot_rate_list.pull({lot:req.body.lotid, myrate: 0});
                        user.lot_rate_list.push({lot:req.body.lotid, myrate: -1});
                        
                        rateid.dislike++;
                    }
                }
            }
            user.save();
            rateid.save();
            parklot.save();
            console.log('save Complete!!')
        }).catch(err => res.status(500).send(err));
        res.send(parklot);
    }).catch(err => res.status(500).send(err));
}

exports.readComment = (req, res) => {
    Parklot.findOneByParkno(req.params.no).then(parklot => {
        if(!parklot) return res.status(404).send({err : 'SE09'});
        res.send(parklot.comments);
    }).catch(err => res.status(500).send(err))
}

exports.writeComment = (req, res) => {
    /*
        body로 전달되어야 할 값
        no : lot의 고유 넘버
        user : user의 _id값
        comment : 기록하고자 하는 comment의 내용
    */
    Promise.all([
        Parklot.findOneByParkno(req.body.no),
        Parklot.findOne({
            lotid: req.body.no, 
            'comments.user':req.body.user},
            'comments.$'),
        User.findOneById(req.body.user)
    ]).then(([lot, exist, user]) => {
        console.log('lot => ' + lot);
        console.log('---------------------');
        console.log('exist => ' + exist);
        console.log('---------------------');
        if(exist){
            console.log('exist.comments[0].user => ' + exist.comments[0].user);
            console.log('---------------------');
        }

        console.log('user => ' + user);
        console.log('---------------------');

        let result = "결과 : ";

        if(!lot) {
            console.log('lot is null');
            result += "lot가 null 입니다.";
        }
        else if(!user) {
            console.log('user is null');
            result += "user가 null 입니다.";
        }
        else{
            if(!exist) { // exist가 null이라면 자유롭게 추가해도 됨
                Comment.create({comment: req.body.comment})
                    .then(comment => {                        
                        console.log('comment => ' + comment);
                        console.log('---------------------');

                        user.mycomments.push(comment._id);
                        user.save();
                        lot.comments.push({user: user._id, comment: comment._id});
                        lot.save();

                        
                    }).catch(err => res.status(500).send(err));

                return res.sendStatus(200);
            }
            else{ // exist가 null이 아니라면 추가하면 안됨.
                console.log('이미 댓글을 달았습니다.');
                result += "이미 댓글을 달았습니다.";
            }
        }
        res.send('뭔가 오류가 발생했군요!\n'+result);
    }).catch(err => res.status(500).send(err));
}

exports.updateComment = (req, res) => {
    /*
        body로 전달되어야 할 값
        no : lot의 고유 넘버
        user : user의 _id값
        comment : 수정하고자 하는 comment의 내용
    */
    Promise.all([
        Parklot.findOneByParkno(req.body.no),
        Parklot.findOne({
            lotid: req.body.no, 
            'comments.user':req.body.user},
            'comments.$'),
        User.findOneById(req.body.user)
    ]).then(([lot, exist, user]) => {
        console.log('lot => ' + lot);
        console.log('---------------------');
        console.log('exist => ' + exist);
        console.log('---------------------');
        if(exist){
            console.log('exist.comments[0].user => ' + exist.comments[0].user);
            console.log('---------------------');
        }
        console.log('user => ' + user);
        console.log('---------------------');

        let result = "결과 : ";

        if(!lot) {
            console.log('lot is null');
            result += "lot가 null 입니다.";
        }
        else if(!user) {
            console.log('user is null');
            result += "user가 null 입니다.";
        }
        else{
            if(!exist) { // exist가 null이라면 자유롭게 추가해도 됨
                console.log('아직 댓글을 달지 않았습니다.');
                result += "아직 댓글을 달지 않았습니다.";
                // Comment.create({comment: req.body.comment})
                //     .then(comment => {                        
                //         console.log('comment => ' + comment);
                //         console.log('---------------------');

                //         user.mycomments.push(comment._id);
                //         user.save();
                //         lot.comments.push({user: user._id, comment: comment._id});
                //         lot.save();

                        
                //     }).catch(err => res.status(500).send(err));

                // return res.sendStatus(200);
            }
            else{ // exist가 null이 아니라면 추가하면 안됨.
                Comment.findOneById(exist.comments[0].comment)
                    .then(comment => {
                        comment.comment = req.body.comment;
                        comment.save();
                    }).catch(err => res.status(500).send(err));
                
                return res.sendStatus(200); 
            }
        }
        res.send('뭔가 오류가 발생했군요!\n'+result);
    }).catch(err => res.ststus(500).send(err));
}

exports.deleteComment = (req, res) => {
    /*
        params로 전달되어야 할 값
        no : lot의 고유 넘버
        user : user의 _id값
    */
    Promise.all([
        Parklot.findOneByParkno(req.params.no),
        Parklot.findOne({
            lotid: req.params.no, 
            'comments.user':req.params.user},
            'comments.$'),
        User.findOneById(req.params.user)
    ]).then(([lot, exist, user]) => {
        console.log('lot => ' + lot);
        console.log('---------------------');
        console.log('exist => ' + exist);
        console.log('---------------------');
        if(exist){
            console.log('exist.comments[0].user => ' + exist.comments[0].user);
            console.log('---------------------');
        }
        console.log('user => ' + user);
        console.log('---------------------');

        let result = "결과 : ";

        if(!lot) {
            console.log('lot is null');
            result += "lot가 null 입니다.";
        }
        else if(!user) {
            console.log('user is null');
            result += "user가 null 입니다.";
        }
        else{
            if(!exist) { // exist가 null이면 삭제불가능
                console.log('아직 댓글을 달지 않았습니다.');
                result += "해당 user는 아직 댓글을 달지 않았습니다.";
            }
            else{ // 댓글이 존재하므로 삭제
                lot.comments.pull({user: user._id, comment: exist.comments[0].comment})
                lot.save();
                user.mycomments.pull(exist.comments[0].comment);
                user.save();

                Comment.deleteById(exist.comments[0].comment)
                    .then().catch(err => res.status(500).send(err));
                return res.sendStatus(200); 
            }
        }
        res.send('뭔가 오류가 발생했군요!\n'+result);
    }).catch(err => res.status(500).send(err));
}

exports.rptLot = (req, res) => {
    // req.body.lotid
    // req.body.userid

    Promise.all([
        Parklot.findOne({_id: req.body.lotid, 'reportlist': req.body.userid}),
        Parklot.findOne({_id: req.body.lotid}),
        User.findOne({_id: req.body.userid})
    ]).then(([exist, parklot, user]) => {
        if(!exist){
            parklot.report++;
            parklot.reportlist.push(user._id);
            parklot.save();
        }
        res.sendStatus(200);
    }).catch(err => console.log(err));
}