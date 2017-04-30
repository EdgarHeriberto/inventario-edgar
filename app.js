var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();


var url = process.env.MONGODB_URI;
mongoose.Promise = global.Promise;
mongoose.connect(url, function(err) {
    if (err){
    	console.log('Hay un error al conectar:' + err);
		throw err;
    } 
    else{
    	console.log('Se conectó a la BD: ' + app.get('env'));
    }
});
       

//parsear los objetos en post
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//para la estructura de los productos que se almacenaran
var productSchema = {
  id:String,
  nombre:String,
  cantidad:Number,
  precio:Number,
  descripcion:String
};

var Product = mongoose.model("Product", productSchema);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'Jade');



//metodo de POST de vista agregar
app.post("/agregar",function(req,res){

var datos = {
  id: req.body.id,
  nombre: req.body.nombre,
  cantidad: req.body.cantidad,
  precio: req.body.precio,
  descripcion: req.body.descripcion
}

var product = new Product(datos);

product.save(function(err){
 console.log(product);
res.render("index");
});

//console.log(req.body);
//res.render("agregar");
});


//vista agregar
app.get("/agregar",function(req,res){

res.render("agregar");

})



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
