var co = require('co')
var ok = require('assert').ok
var oreo = require('..')
var fs = require('fs')

var platforms = [
  {
    driver: 'pg',
    user: 'postgres',
    pass: 'postgres',
    hosts: ['localhost:5432', 'localhost:5433', 'localhost:5430'],
    name: 'oreo_test',
    debug: false,
    silent: true
  },
  // {
  //   driver: 'mysql',
  //   user: 'root',
  //   pass: '',
  //   hosts: ['localhost'],
  //   name: 'oreo_test',
  //   debug: false,
  //   silent: true
  // }
]

platforms.forEach(function(config) {

  describe('co-oreo', function() {

    var db


    it('should connect and discover', function(done) {
      co(function*() {
        db = yield oreo(config)
      })(done)
    })


    it('should create tables', function(done) {
      co(function*() {
        var sql = fs.readFileSync(__dirname + '/../node_modules/oreo/test/schema/' + config.driver + '.sql', 'utf8')
        yield db.execute(sql, null, {write: true})
      })(done)
    })


    it('should rediscover', function(done) {
      co(function*() {
        yield db.discover()
        ok(!!db.authors, 'authors not discovered')
      })(done)
    })


    it('should insert', function(done) {
      co(function*() {
        var author = yield db.authors.insert({
          name: 'Jack Kerouac'
        })
        ok(author.id === 1, 'did not insert author')
        var book = yield db.books.insert({
          title: 'On the Road',
          author_id: 1
        })
        ok(book.id === 1, 'did not insert book')
        var rating = yield db.ratings.insert({
          author_id: 1,
          book_id: 1,
          rating: 10
        })
        ok(rating.rating === 10, 'did not insert rating')
      })(done)
    })


    it('should save', function(done) {
      co(function*() {
        var data = {
          id: 15,
          name: 'Jim Bob'
        }
        var author = yield db.authors.save(data)
        ok(author.id === 15, 'did not insert author')
        author = yield db.authors.save(data)
        ok(author.id === 15, 'did not update author')
      })(done)
    })


    it('should update', function(done) {
      co(function*() {
        var author = yield db.authors.get(1)
        var new_name = 'Jim Kerouac'
        console.log('author.update:', author.update)
        author = yield author.update({
          name: new_name
        })
        ok(author.id === 1, 'did not get correct author')
        ok(author.name === new_name, 'did not update author')
      })(done)
    })




  })

})
