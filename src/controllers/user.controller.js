'use strict'
import checkAuth from '../auth/checkAuth.js';
import userService from '../services/user.service.js';
import { CREATED, SuccessResponse } from './../core/success.response.js';

const cookiesOptions = {
    httpOnly: true,
    secure: true, 
    sameSite: 'Lax'
}
export default new class UserController { 
    register = async (req, res, next) => {
        try {
            const results = await userService.registerUser(req.body)
            new CREATED({
                message: 'User registered, verification email sent',
                metadata: results.user
            }).send(res);
        } catch (error) {
            res.status(403).json({
                code: '403',
                status: 'Error Registration',
                message: error.message
            });
        }
    }
    
    loginUser = async (req, res, next) => {
        if (req.session.accessToken) {
            try {
                const accessToken = req.session.accessToken
                const userId = req.session.user
                new SuccessResponse({
                    message: 'Login Successfully',
                    metadata: await checkAuth.accessToken({ accessToken, userId})
                }).send(res)
            } catch (error) {
                res.status(403).send({
                    code: 403,
                    status: error.message,
                    status: 'error'
                })
            }
        } else {
            try {
                const results = await userService.loginUser(req.body)
                req.session.isAuthenticated = true
                req.session.user = results.user.email
                req.session.accessToken = results.accessToken
                res.cookie('x-api-key', results.apiKey.key, cookiesOptions)
                res.cookie('x-rtoken-id', results.tokens.refreshToken, cookiesOptions)
                res.cookie('authorization', results.tokens.accessToken, cookiesOptions)
                res.cookie('x-client-id', results.user._id, cookiesOptions)
                new SuccessResponse({
                    message: 'You have been logged successfully',
                    metadata: results.user
                }).send(res)
            } catch (error) {
                res.status(403).json({
                    code: 403,
                    status: 'Error Login',
                    message: error.message
                });
            }
        }
    }
    logoutUser = async (req, res, next) => {
        try {
            req.session.destroy(err => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to log out' });
                }
        
                res.clearCookie('connect.sid');
            });
            new SuccessResponse({
                message: 'User logout successful',
                metadata: await userService.logoutUser(req.query.userId)
            }).send(res)
        } catch (error) {
            return res.status(500).json({
                code: 500,
                status: 'Error Logout',
                message: error.message
            })
        }
    }
    addFriend = async (req, res, next) => {
        new SuccessResponse({
            message: 'Friend added successfully',
            metadata: await userService.addFriend(req.query)
        }).send(res)
    }
    updateProfile = async (req, res, next) => {
        new SuccessResponse({
            message: 'Profile updated successfully',
            metadata: await userService.updateUserProfile(req.body)
        }).send(res)
    }
    updateStatus = async (req, res, next) => {
        new SuccessResponse({
            message: 'Status updated successfully',
            metadata: await userService.updateUserStatus(req.body)
        }).send(res)
    }
    findUserByEmail = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'User found successfully',
            metadata: await userService.findUserByEmail(req.query)
        }).send(res)
    }
}

