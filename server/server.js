require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');

 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
//importación del archivo usuario en routes
app.use ( require('./routes/usuario') );
 
mongoose.set('useCreateIndex', true)

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (err, resp) => {

    if (err) throw err;

    console.log('base de datos ONLINE');

});

app.listen(process.env.PORT, () => {
    console.log('escuchando el puerto, 3000');
})