const mongoose = require('mongoose');
const {getSiteFromHost} = require('./jobpost.utils');

/**
 * Detect site from request host
 */
const detectSite = (req, res, next) => {
    const host = req.get('host');
    let site = null;

    if (host?.includes('telth.org')) site = 'telth';
    else if (host?.includes('mytelth.com')) site = 'mytelth';
    else if (host?.includes('telth.care')) site = 'telthcare';
    else if (host?.includes('natlife')) site = 'natlife';
    else if (host.match(/^192\.168\./)) site = 'mytelth';
    else if (host?.includes('localhost')) site = 'mytelth';

     // 👈 allow IP


    if (!site) {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized site'
        });
    }

    req.site = site;
    next();
};


/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
    next();
};
const allowOnlyMyTelthToCreate = (req, res, next) => {
    if (req.site !== 'mytelth') {
        return res.status(403).json({
            error: 'You are not allowed to create job posts from this site'
        });
    }

    next();
};




module.exports = {
    detectSite,
    validateObjectId,
    allowOnlyMyTelthToCreate
};
