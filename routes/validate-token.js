//Middleware de verificacion del token entregado al hacer LOGIN


const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
    const token = req.header("auth-token"); 
    if(!token) return res.status(401).json({ error: "Acceso Denegado, perra" })

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next() //Validado, Lets go
        
    } catch (error) {
        res.status(400).json({error: "Token no válido"})
    }

}

module.exports = verifyToken