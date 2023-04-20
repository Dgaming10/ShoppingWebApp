const { Router } = require("express");
const twitterRouter = Router();
const twitterController = require("../controllers/twitter-controller");

twitterRouter.post('/',function(req, res, next){
    if(req.session && req.session.isAdmin)
    {
        next();
    }
},twitterController.postOnlineUsers);

twitterRouter.post('/addProduct',function(req, res, next){
    if(req.session && req.session.isAdmin)
    {
        next();
    }
},twitterController.postWhenAddingProduct);

twitterRouter.get('/showUser',twitterController.showSome);
module.exports = twitterRouter;
