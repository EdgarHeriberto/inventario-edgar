var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var pass = "123456";
var index = require('./routes/index');
var users = require('./routes/users');
var method_override = require("method-override");
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
app.use(method_override("_method"));

//para la estructura de los productos que se almacenaran
var productSchema = {
  nombre:String,
  cantidad:Number,
  precio:Number,
  descripcion:String
};

var Product = mongoose.model("Product", productSchema);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



//metodo de POST de vista agregar
app.post("/agregar",function(req,res){

var datos = {
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

//metodo post para los admin
app.post("/admin",function(req,res){
if(req.body.password == pass){
Product.find(function(err,document){
 if(err){console.log(err);}
res.render("admincontrol",{products:document});

});

}
else{
  res.redirect("admin");
}

});


// put de editar producto
app.put("/editar/:id",function(req,res){

var dato = {
  nombre:req.body.nombre,
  cantidad:req.body.cantidad,
  precio:req.body.precio
};

Product.update({"_id": req.params.id}, dato ,function(product){

Product.find(function(err,document){
 if(err){console.log(err);}
res.render("admin",{products:document});

});
})

});

//vista agregar
app.get("/agregar",function(req,res){

res.render("agregar");

});

//vista consulta 
app.get("/consulta",function(req,res){

Product.find({ cantidad: { $gt: 0 } } ,function(err,document){
 if(err){console.log(err);}
res.render("consulta",{products:document});

});

});

//vista formulario admin
app.get("/admin",function(req,res){

res.render("admin");

});


//vista editar
app.get("/editar/:id", function(req,res){
var id_producto = req.params.id;
Product.findOne({"_id": id_producto},function(err,document){
console.log(document);
res.render("editar",{ product: document});
});

});

//Vista eliminar
app.get("/eliminar/:id",function(req,res){
var id = req.params.id;
Product.findOne({"_id": id},function(err,document){
  if( document.cantidad==0  ){
res.render("eliminar",{ product: document});
  }else{

    console.log("No se puede eliminar");
  }

});

});

//delete de eliminar producto
app.delete("/eliminar/:id",function(req,res){
  var id = req.params.id;
if(req.body.password == pass){
 Product.remove({"_id": id},function(err){
 if(err){
 console.log("No se pudo eliminar el producto");
 }
 res.redirect("/admin");

 });

}else{
  res.redirect("/admin");
}

});

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
