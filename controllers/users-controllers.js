const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

const User = require('../models/user');

const getUsers = async (req, res, next) => {
    let users;

    try {
        users = await User.find({}, '-password')
    }
    catch (err) {
        return next(
            new HttpError('Could load users, please try again later.', 500)
        )
    }

    res.json({ users: users.map(user => user.toObject({ getters: true })) })
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid Inputs passed, please check your data', 403));
    }

    const { name, email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({
            email: email
        });
    }
    catch (err) {
        return next(
            new HttpError('Signing up failed, please try again later.', 500)
        )
    }

    if (existingUser) {
        return next(
            new HttpError('User already exists, please login instead', 403)
        )
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    }
    catch (err) {
        const error = new HttpError('Could not create users, please try again later', 500);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
        image: req.file.path,
        places: []
    });

    try {
        await createdUser.save();
    }
    catch (err) {
        return next(
            new HttpError('Signin up failed, please try again later', 500)
        )
    }

    let token;
    try {
        token = jwt.sign({
            userId: createdUser.id,
            email: createdUser.email
        },
            process.env.JWT_SECRET,
            { expiresIn: '1h' });
    }
    catch (err) {
        return next(
            new HttpError('Signup failed, please try again later.', 500)
        )
    }

    res.status(200).json({ userId: createdUser.id, email: createdUser.email, token: token });
}

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({
            email: email
        });
    }
    catch (err) {
        return next(
            new HttpError('Logged in failed, please try again later', 500)
        )
    }

    if (!existingUser) {
        return next(
            new HttpError('Invalid Credentials, please check your credentials', 422)
        )
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    }
    catch (err) {
        const error = new HttpError('Could not log you, please try again later!');
        return next(error);
    }

    if (!isValidPassword) {
        return next(
            new HttpError('Invalid Credentials, please check your credentials', 422)
        )
    }

    let token;
    try {
        token = jwt.sign({
            userId: existingUser.id,
            email: existingUser.email
        },
            process.env.JWT_SECRET,
            { expiresIn: '1h' });
    }
    catch (err) {
        return next(
            new HttpError('Logging failed, please try again later.', 500)
        )
    }

    res.status(200).json({ userId: existingUser.id, email: existingUser.email, token: token });
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

