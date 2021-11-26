const router = require('express').Router();

const controller = require('./zone.controller');

router.get('/', controller.index);

router.post('/', controller.create);

router.get('/id/:id', controller.readid);
router.put('/id/:id', controller.updateid);
router.delete('/id/:id', controller.deleteid);
// _id로 조회 수정 삭제

module.exports = router;