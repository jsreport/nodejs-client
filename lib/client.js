/*!
 * Copyright(c) 2014 Jan Blaha
 *
 * nodejs client for remote jsreport server
 * able to render reports or do crud using jaydata context.
 */

const request = require('request')
const url = require('url')
const concat = require('concat-stream')
const mimicResponse = require('mimic-response')
const { PassThrough } = require('stream')

class Client {
  constructor (url, username, password) {
    this.url = url
    this.username = username
    this.password = password
  }

  /**
   * Render report in remote server and return response
   * @returns object containing header property with response headers and body property with response body
   */
  async render (req, options = {}) {
    const rootUrl = this.url
    const username = this.username
    const password = this.password

    const optionsToUse = Object.assign({
      uri: url.resolve(rootUrl, 'api/report'),
      body: JSON.stringify(req),
      strictSSL: false,
      headers: {
        'Content-Type': 'application/json'
      }
    }, options)

    if (username) {
      optionsToUse.auth = {
        username,
        password
      }
    }

    return new Promise((resolve, reject) => {
      const responseStream = request.post(optionsToUse)

      responseStream.on('error', (err) => {
        reject(err)
      })

      responseStream.on('response', (response) => {
        if (response.statusCode !== 200) {
          return responseToBuffer(response, (err, data) => {
            if (err) {
              return reject(err)
            }

            try {
              const errorMessage = JSON.parse(data.toString())
              const error = new Error(errorMessage.message)
              error.remoteStack = errorMessage.stack
              reject(error)
            } catch (e) {
              const err = new Error('Unknown error, status code ' + response.statusCode)
              err.response = response
              reject(err)
            }
          })
        }

        // when working with streams and promises we should be extra-careful,
        // promises resolves in next ticks so there is a chance that a stream
        // can loose some data because consumer does not took the chance to process
        // the data when it was ready.
        // to solve this we create a transform stream that starts paused (any stream starts paused)
        // and flow the data from response to it, since the stream is paused it won't loose data
        // and will start emiting it when consumer calls `.body()` or any other stream method like `.pipe`
        const newResponseStream = new PassThrough()

        mimicResponse(response, newResponseStream)

        newResponseStream.body = () => responseToBuffer(newResponseStream)

        response.pipe(newResponseStream)

        resolve(newResponseStream)
      })
    })
  }
}

module.exports = function (url, username, password) {
  return new Client(url, username, password)
}

function responseToBuffer (response, cb) {
  if (cb) {
    return extractDataFromResponse(response, cb)
  }

  return new Promise((resolve, reject) => {
    extractDataFromResponse(response, (err, data) => {
      if (err) {
        return reject(err)
      }

      resolve(data)
    })
  })
}

function extractDataFromResponse (response, cb) {
  const writeStream = concat((data) => cb(null, data))

  response.on('error', (err) => cb(err))
  response.pipe(writeStream)
}
