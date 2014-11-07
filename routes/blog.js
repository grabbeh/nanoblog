
//var nano = require("nano")('inserts details of couchdb provider (maybe http://[   ].iriscouch.com) 
//or run CouchDB instance locally (normally at 'http://127.0.0.1:5984')
var nano = require("nano")('https://username:password@grabeh.cloudant.com')
, moment = require("moment");

// test to walkthrough various nano operations as part http://www.github/dbase/nano. You will also have to use the create command 
// below to create the 'blogs' database. Following creation, the command is no longer required on each occasion (I should figure 
// how to only create the instance if it doesn't already exist)

exports.test = function(req, res){
  nano.db.destroy('testdb', function() {
    // create a new database
    nano.db.create('testdb', function() {
      // specify the database we are going to use
      var testdb = nano.use('testdb');
      // and insert a document in it
      testdb.insert({ blog: "Insightful diatribe" }, 'testblog', function(err, body, header) {
        if (err) {
          console.log('[testblog.insert] ', err.message);
          return;
        }
        console.log('you have inserted the testblog.')
        console.log(body);
      });
    });
  });
}

// front page function - specifying the design and then the view as created in your CouchDB manager ('futon'), which maps
// rows in your 'blogs' database and outputs all values in blogs.rows.value
/* SAMPLE MAP FUNCTION
function(doc) {
  emit(doc._id, doc);
}

You may like to create some test blogs at /new and see if they show at the below */

exports.showAll = function(req, res){
      var blogdb = nano.use('blogs');

      blogdb.view('basicmap', 'basicmap', function(err, blogs){ 
        console.log(blogs);
        if (err) { console.log(err)}
          res.renderPjax("bloglist", {title: "Blogs", blogs: blogs.rows})
  })     
}

// takes id from url and returns template blog with values from database

exports.showOne = function(req, res) {

  var blogdb = nano.use('blogs');
  blogdb.get(req.params.id, { revs_info: true }, function(err, blog) {
  if (!err)

    res.renderPjax("blog", {title: blog.title, date: blog.date, body: blog.body})
});
}

// renders form for posting new blog

exports.newBlog = function(req, res){
  res.renderPjax('newblog', {title: "New blog"}) 
}


// processes posting of new blog from form including creating url-friendly title and inserting that as the unique ID

exports.post = function(req, res){

var blogdb = nano.use('blogs')
var day = moment(new Date());
var formattedDate = day.format("MMMM Do YYYY");
var urltitle = req.body.title.replace(/\s+/g, '-').toLowerCase();

blogdb.insert({title: req.body.title, body: req.body.body, date: formattedDate}, urltitle, function(err, body, header){
  if (err) {
    console.log(err.message);
    return;
    }
      console.log('Blog upload successful');
      console.log(body);
      res.redirect('/');
    })
}

// deletes last revision of document based on ID and _rev of particular blog

exports.delete = function(req, res) {

  var blogdb = nano.use('blogs');

  blogdb.get(req.params.id, { revs_info: true }, function(err, blog) {    
        console.log(blog)
      blogdb.destroy(blog._id, blog._revs_info[0].rev, function(err, body) {
        if (err){ console.log(err)}
      else {
        res.redirect('/admin');
      }
    });
});
}

// renders edit blog page

exports.edit = function(req, res) {

  var blogdb = nano.use('blogs');
  blogdb.get(req.params.id, { revs_info: true }, function(err, blog) {
  if (!err){

    res.renderPjax("blogedit", {title: blog.title, date: blog.date, body: blog.body, id: blog._id})
    }
  });
}

// handles posting of edited blog - NB at present unable to update only set values so other values (date & id are rendered as 
// hidden fields for posting below to first get particular blog then insert details). Insert function takes last revision for insertion purposes)

exports.postEdit = function(req, res) {

id = req.body.id;
var blogdb = nano.use('blogs');
blogdb.get(id, function(err, blog){

    blogdb.insert({title: req.body.title, body: req.body.body, date: req.body.date, _rev: blog._rev}, id, function(err, body, header){
      if (err) {
        console.log(err.message);
        return;
      }
  console.log('Blog update successful');
  res.redirect('/admin');
  })
})
}

// render admin page allowing user to edit or delete blogs

exports.admin = function(req, res){
    var blogdb = nano.use('blogs');

      blogdb.view('basicmap', 'basicmap', function(err, blogs){ 
        res.renderPjax("blogadmin", {title: "Blogs", blogs: blogs.rows})
  })     
}
