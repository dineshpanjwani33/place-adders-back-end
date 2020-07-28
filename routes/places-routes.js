const express = require('express');

const { check } = require('express-validator');

const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const placeControllers = require('../controllers/places-controllers');

const fileUpload = require('../middleware/file-upload');

router.get('/:pid', placeControllers.getPlaceById);

router.get('/user/:uid', placeControllers.getPlacesByUserId);

router.use(checkAuth);

router.post(
    '/',
    fileUpload.single('image'), 
    [
    check('title').not().isEmpty().withMessage('title field must not be empty'),
    check('description').isLength({ min: 5 }).withMessage('description must be 5 characters long'),
    check('address').not().isEmpty()
], placeControllers.createPlace);

router.patch('/:pid', [
    check('title').not().isEmpty().withMessage('title field must not be empty'),
    check('description').isLength({ min: 5 }).withMessage('description must be 5 characters long')
], placeControllers.updatePlace);

router.delete('/:pid', placeControllers.deletePlace);

module.exports = router;