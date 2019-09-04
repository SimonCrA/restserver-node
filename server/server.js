require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path= require('path');
const app = express();
 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//habilitar la carpeta public

app.use(express.static(path.resolve(__dirname, '../public')));


//importación del archivo index en routes, para simplificar el codigo todas las rutas estan en index
app.use(require('./routes/index'));
 
mongoose.set('useCreateIndex', true)

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (err, resp) => {

    if (err) throw err;

    console.log('base de datos ONLINE');

});

app.listen(process.env.PORT, () => {
    console.log('escuchando el puerto, 3000');
})