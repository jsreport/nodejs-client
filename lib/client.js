/*!
 * Copyright(c) 2014 Jan Blaha
 *
 * nodejs client for remote jsreport server
 * able to render reports or do crud using jaydata context.
 */

var request = require("request"),
    url = require("url"),
    concat = require('concat-stream');

module.exports = function (url, username, password) {
    return new Client(url, username, password);
};

var Client = function (url, username, password) {
    this.url = url;
    this.username = username;
    this.password = password;
}

/**
 * Render report in temore server and return response
 * @returns object containing header property with response headers and body property with response body
 */
Client.prototype.render = function (req, cb) {

    var requestOptions = {
        uri: url.resolve(this.url, 'api/report'),
        body: JSON.stringify(req),
        strictSSL: false,
        encoding: null,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (this.username) {
        requestOptions.auth = {
            username: this.username,
            password: this.password
        }
    }

    var responseStream = request.post(requestOptions);

    responseStream.on("error", function(err) {
        cb(err);
    });

    responseStream.on("response", function (response) {
        if (response.statusCode !== 200) {
            return responseToBuffer(response, function(data) {
                try {
                    var errorMessage = JSON.parse(data.toString());
                    var error = new Error(errorMessage.message);
                    error.remoteStack = errorMessage.stack;
                    cb(error)
                }
                catch(e) {
                    cb(new Error(data));
                }
            });
        }

        response.body = function(cb) { responseToBuffer(response, cb); }
        cb(null, response);
    });
};


function responseToBuffer(response, cb) {
    var writeStream = concat(cb);
    response.pipe(writeStream);
}