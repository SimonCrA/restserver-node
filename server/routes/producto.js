const express =  require('express');
const _ = require('underscore');
const { verificartoken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

//==============================
//Consultar Todos los productos
//==============================

app.get('/productos', verificartoken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({disponible: true})
        .sort('descripcion')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria')
        .exec((err, productosDB) =>{
            
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            };

            Producto.countDocuments({disponible: true}, (err, conteo) =>{

                res.json({
                    ok: true,
                    productos: productosDB,
                    cantidad: conteo
                });

            });

        });

});

//==============================
//Consultar un producto
//==============================

app.get('/productos/:id', verificartoken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec( (err, productoDB)=>{

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            };
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        mensaje: 'el id del producto no existe'
                    }
                })
            };

            res.json({
                ok: true,
                productoDB
            })


    });

});

//==============================
//busca productos
//==============================

app.get('/productos/buscar/:termino', verificartoken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i')

    Producto.find({nombre: regex})
        .populate('categoria', 'descripcion')
        .exec( (err, categoriaBuscada) =>{

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            };

            if (!categoriaBuscada) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        mensaje: 'No se encuentra en base de datos ese producto'
                    }
                });
            };
            res.json({
                ok:true,
                categoriaBuscada
            })

        });

});

//==============================
//Crea un producto
//==============================

app.post('/productos', verificartoken, (req, res)=>{

    let body = req.body;
    let id = req.usuario._id;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: id
    });

    producto.save((err, productoGuardado) =>{

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (!productoGuardado) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.status(201).json({
            ok: true,
            productoGuardado

        })

    })

});

//==============================
//Actualiza un producto
//==============================

app.put('/productos/:id', verificartoken, (req, res)=>{

    let  id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']);

    Producto.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, productoModificado) =>{
        
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (!productoModificado) {
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'el id del producto no existe'
                }
            })
        };
        res.json({
            ok:true,
            productoModificado
        })

    });

});

//==============================
//Borrar un producto(cambia estado)
//==============================

app.delete('/productos/:id', verificartoken, (req, res)=>{

    /*ES requerido que el producto quede inhabilitado
     *Pero que no sea eliminado
    */

    let id = req.params.id;
    let cambiarEstado = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiarEstado,{ new: true, runValidators: true }, (err, productoInhabilitado) =>{

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (!productoInhabilitado) {
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'El id del producto no existe'
                }
            })
        };

        res.json({
            ok:true,
            productoInhabilitado,
            mensaje: 'Producto borrado'
        });

    });



    //========================================================
    //borra permanentemente de la base de datos.
    //========================================================
    // Producto.findByIdAndRemove(id, (err, productoBorrado) => {
        
    //     if (err) {
    //         return res.status(500).json({
    //             ok: false,
    //             err
    //         });
    //     };
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         })
    //     };

    //     res.json({
    //         ok:true,
    //         productoBorrado
    //     })
    // });

});



module.exports = app;