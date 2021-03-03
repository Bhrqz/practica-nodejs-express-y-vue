const router = require('express').Router();

const User = require('../models/User')

//hapy es para las validaciones de la cuenta antes de registrarla
const Joi = require('@hapi/joi');

const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

//Para codificar la contraseña enj registro
const bcrypt = require('bcrypt');

const jwt = require("jsonwebtoken")






//Login process
router.post('/login', async (req, res) => {
    // validaciones
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message })
    
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'contraseña no válida' })
    
    //el JSON webToken
    const token = jwt.sign({
       name: user.name,
       id: user._id 
    }, process.env.TOKEN_SECRET)

    // res.json({
    //     error: null,
    //     data: 'exito bienvenido',
    //     //token es solo para ver el JSON Web Token y curiosearlo
    //     token
    // })

    res.header('auth-token', token).json({
        error: null,
        data: {token}
    })

})





//registro process
router.post('/register', async (req, res) => {
    
    //validaciones de registro usuario que no funciona
    // const { validacionesErrada } = schemaRegister.validate(req.body)
    
    // if (validacionesErrada) {
    //     return res.status(400).json(
    //         {validacionesErrada: validacionesErrada.details[0].message}
    //     )
    // }

    // Validacion de registro usuario que SI funciona
    const { error } = schemaRegister.validate(req.body)
    
    if (error) {
        return res.status(400).json(
            {error: error.details[0].message}
        )
    }

    //Validar que el email no esté ya registrado
    const emailUnico = await User.findOne({ email: req.body.email})

    if (emailUnico){
        return res.status(400).json({error: true, mensaje:"Email ya registrado, menol"})
    }


    //HASHear, o codificar la contraseña
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    //el "body" va por el bodyparser
    // el password es realmente password:password, pero como es redundante se puede abreviar así como está
    const user = new User ({
        name: req.body.name,
        email: req.body.email,
        password
   });

    try {
        const userDB = await user.save();
        res.json({
            error:null,
            data:userDB
        })


    } catch (error) {
        res.status(400),json(error)
    }

    
    
})

module.exports = router;