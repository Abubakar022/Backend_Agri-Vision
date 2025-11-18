const userRouter = require('express').Router();
const userController = require('../controllers/userController');

userRouter.post('/create', userController.createUser);
userRouter.get('/stats', userController.getUserStats);

module.exports = userRouter;