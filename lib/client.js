/*!
 * Copyright(c) 2014 Jan Blaha
 *
 * nodejs client for remote jsreport server
 * able to render reports or do crud using jaydata context.
 */

var request = require('request')
var url = require('url')
var concat = require('concat-stream')
var assign = require('lodash.assign')

module.exports = function (url, username, password) {
  return new Client(url, username, password)
}

var Client = function (url, username, password) {
  this.url = url
  this.username = username
  this.password = password
}

/**
 * Render report in temore server and return response
 * @returns object containing header property with response headers and body property with response body
 */
Client.prototype.render = function (req, options, cb) {
  if (typeof cb === 'undefined') {
    cb = options
    options = {}
  }

  options = assign({
    uri: url.resolve(this.url, 'api/report'),
    body: JSON.stringify(req),
    strictSSL: false,
    headers: {
      'Content-Type': 'application/json'
    }
  }, options)

  if (this.username) {
    options.auth = {
      username: this.username,
      password: this.password
    }
  }

  var responseStream = request.post(options)

  responseStream.on('error', function (err) {
    cb(err)
  })

  responseStream.on('response', function (response) {
    response.on('error', function (err) {
      cb(err)
    })

    if (response.statusCode !== 200) {
      return responseToBuffer(response, function (data) {
        try {
          var errorMessage = JSON.parse(data.toString())
          var error = new Error(errorMessage.message)
          error.remoteStack = errorMessage.stack
          cb(error)
        } catch (e) {
          var err = new Error('Unknown error, status code ' + response.statusCode)
          err.response = response
          cb(err)
        }
      })
    }

    response.body = function (cb) { responseToBuffer(response, cb) }
    cb(null, response)
  })
}

function responseToBuffer (response, cb) {
  var writeStream = concat(cb)
  response.pipe(writeStream)
}
