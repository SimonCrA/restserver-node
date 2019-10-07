const express = require('express');
const _ = require('underscore');
let { verificartoken, verificarAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

//==============================
//Consulta todas las categorias
//==============================

app.get('/categoria', verificartoken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec( (err, categoriasDB) =>{

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        };

        Categoria.countDocuments({}, (err, conteo) =>{

            res.json({
                ok: true,
                categoriasDB,
                contidad: conteo
            });

        });

    });

});

//==============================
//Consulta una categoria
//==============================

app.get('/categoria/:id', verificartoken, (req, res)=>{

    let id= req.params.id;

    Categoria.findById(id, (err, categoriaDB)=>{

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.json({
            ok:true,
            categoriaDB: categoriaDB
        });

    });

});

//========================
//Crear nueva categoria
//========================

app.post('/categoria', verificartoken, (req, res)=>{

    let body= req.body;
    
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    
    categoria.save( (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.json({
            ok:true,
            categoria: categoriaDB
        })

    })

});

//========================
//Actualizar categoria
//========================

app.put('/categoria/:id', [verificartoken, verificarAdmin_Role], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion']);
    Categoria.findByIdAndUpdate(id,body, {new:true, runValidators: true}, (err, categoriaModificada)=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.json({
            ok:true,
            categoriaModificada
        })

    })

});

//========================
//Borrar categoria
//========================

app.delete('/categoria/:id', [verificartoken, verificarAdmin_Role], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada)=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };


        if(!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'Categoria no encontrada, es probable que haya sido eliminada'
                }
            });
        }

        res.json({
            ok: true,
            categoriaBorrada
        });

    })

});

module.exports = app;