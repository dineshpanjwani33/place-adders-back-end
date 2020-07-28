const axios = require('axios');

const HttpError = require('../models/http-error');

async function getCoordsFromAddress(address) {
    
    return {
        lat: 40.7484405,
        lng: -73.9878531
    };
    
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=YOUR_API_KEY`);
    
    const data = response.data;

    if(!data || data.status === 'ZERO_RESULTS') {
        throw new HttpError('Could not find location from given address', 422);
    }

    const coordinates = data.results[0].geometry.location;

    return coordinates; //return this when we have API key for geocoding api
}

module.exports = getCoordsFromAddress;