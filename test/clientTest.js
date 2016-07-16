/*globals describe, it, beforeEach, afterEach */

var should = require('should')
var Jsreport = require('jsreport-core')
var jsreportJsrender = require('jsreport-jsrender')
var jsreportAuthentication = require('jsreport-authentication')
var jsreportExpress = require('jsreport-express')
var client = require('../lib/client.js')

describe('testing client', function () {
  var url = 'http://localhost:3000'
  var jsreport

  beforeEach(function (done) {
    jsreport = Jsreport({ httpPort: 3000 })
    jsreport.use(jsreportJsrender())
    jsreport.use(jsreportExpress())
    jsreport.init().then(function () {
      done()
    }).catch(done)
  })

  afterEach(function (done) {
    jsreport.express.server.close(done)
  })

  it('should be able to render html', function (done) {
    client(url).render({
      template: { content: 'hello', recipe: 'html', engine: 'none' }
    }, function (err, res) {
      should.not.exist(err)
      should.exist(res)

      res.body(function (body) {
        body.toString().should.be.equal('hello')
        done()
      })
    })
  })

  it('should properly handle errors', function (done) {
    client(url).render({
      template: { content: 'hello{{for}}', recipe: 'html', engine: 'jsrender' }
    }, function (err, res) {
      should.exist(err)
      err.message.should.containEql('{{for}}')
      done()
    })
  })

  it('should work also with / at the end of url', function (done) {
    client(url + '/').render({
      template: { content: 'hello', recipe: 'html', engine: 'jsrender' }
    }, function (err, res) {
      should.not.exist(err)
      should.exist(res)

      res.body(function (body) {
        body.toString().should.be.equal('hello')
        done()
      })
    })
  })

  it('should be able to do a complex render with data', function (done) {
    client(url + '/').render({
      template: { content: '{{:a}}', recipe: 'html', engine: 'jsrender' },
      data: { a: 'hello' }
    }, function (err, res) {
      should.not.exist(err)
      should.exist(res)

      res.body(function (body) {
        body.toString().should.be.equal('hello')
        done()
      })
    })
  })

  it('should be able to set timeout', function (done) {
    client(url).render({
      template: {
        content: 'hello {{:~foo}}',
        recipe: 'html',
        engine: 'jsrender',
        helpers: 'function foo() { while (true) { } }'
      }
    }, { timeout: 100 }, function (err, res) {
      err.message.should.containEql('ETIMEDOUT')
      done()
    })
  })
})

describe('testing client with authentication', function () {
  var url = 'http://localhost:3000'
  var jsreport

  beforeEach(function (done) {
    jsreport = Jsreport({ httpPort: 3000 })
    jsreport.use(jsreportExpress())
    jsreport.use(jsreportAuthentication({
      'cookieSession': {
        'secret': 'dasd321as56d1sd5s61vdv32'
      },
      admin: {
        username: 'test',
        password: 'password'
      }
    }))
    jsreport.init().then(function () {
      done()
    }).catch(done)
  })

  afterEach(function (done) {
    jsreport.express.server.close(done)
  })

  it('should be able to render html', function (done) {
    client(url, 'test', 'password').render({
      template: { content: 'hello', recipe: 'html', engine: 'none' }
    }, function (err, res) {
      should.not.exist(err)
      should.exist(res)

      res.body(function (body) {
        body.toString().should.be.equal('hello')
        done()
      })
    })
  })

  it('should response 401 without credentials', function (done) {
    client(url).render({
      template: { content: 'hello', recipe: 'html', engine: 'none' }
    }, function (err, res) {
      err.message.should.containEql('401')
      done()
    })
  })
})

describe('testing client without connection', function () {
  it('should be able to render html', function (done) {
    client('http://localhost:9849').render({
      template: { content: 'hello', recipe: 'html' }
    }, function (err, res) {
      should.exist(err)
      done()
    })
  })
})

