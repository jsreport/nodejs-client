/*!
 * Copyright(c) 2014 Jan Blaha
 *
 * nodejs client for remote jsreport server
 * able to render reports or do crud using jaydata context.
 */

var request = require("request"),
    url = require("url"),
    defaultDataContext = require("./dataContext.js");

module.exports = function (url, username, password) {
    return new Client(url, username, password);
};

var Client = function (url, username, password) {
    this.url = url;
    this.username = username;
    this.password = password;
    this.entitySets = defaultDataContext;
}

/**
 * Create jaydata entity context able to do quries and CRUD over a remote jsreport server entities
 * @param cb nodejs style callback
 */
Client.prototype.createDataContext = function (cb) {

    if (!this.DataContext) {
        this.DataContext = $data.EntityContext.extend("entity.Context", this.entitySets);
    }
    var dataContext = new (this.DataContext)({
        name: 'oData',
        oDataServiceHost: url.resolve(this.url, "odata"),
        user: this.username,
        password: this.password
    });

    dataContext.onReady(function (context) {
        cb(null, context);
    });
};

Client.prototype.registerAdditionalEntitySet = function (name, type) {
    var entitySet = { type: $data.EntitySet, elementType: type };
    this.entitySets[name] = entitySet;
}

Client.prototype.createEntityType = function (name, attributes) {
    return $data.Class.define(name, $data.Entity, null, attributes, null);
}

/**
 * Render report in temore server and return response
 * @returns object containing header property with response headers and body property with response body
 */
Client.prototype.render = function (req, cb) {

    var requestOptions = {
        uri: url.resolve(this.url, 'api/report'),
        body: req,
        json: true,
        strictSSL: false,
        encoding: null
    };

    if (this.username) {
        requestOptions.auth = {
            username: this.username,
            password: this.password
        }
    }

    request.post(requestOptions, function (error, response, body) {
        if (error) {
            return cb(new Error(error));
        }

        if (response.statusCode !== 200) {
            var error = new Error(body.message);
            error.remoteStack = body.stack;
            return cb(error)
        }

        cb(null, {
            headers: response.header,
            body: body
        });
    });
};