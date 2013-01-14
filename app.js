
var express = require('express')
, partials = require('express-partials')
, pjax = require('express-pjax')
, nano = require('nano')
, blog = require('./routes/blog')
, app = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(pjax());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({secret: 'keyboard cat'}));				  
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);

});

// Routes

app.get('/test', blog.test);

app.get('/', blog.showAll);

app.get('/new', blog.newBlog);

app.post('/new', blog.post);

app.get('/admin', blog.admin);

app.get('/edit/:id?', blog.edit);

app.post('/edit/:id?', blog.postEdit);

app.get('/:id?', blog.showOne);

app.get('/delete/:id?', blog.delete);

app.get('*', function(req, res){
  res.send('404, page not found', 404);
});

app.listen(3000);

