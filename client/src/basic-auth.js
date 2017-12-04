'use strict'

const basicAuth = (realm, username, password) => {
    
    return (req, res, next) => {
        
        res.header('WWW-Authenticate', `Basic realm="${realm}"`)
        
        if (
            !req.authorization ||
            !req.authorization.basic ||
            !req.authorization.basic.password
        ) {
            console.error('Missing basic authorization')
            res.send(401)
            return next(false)
        }
        
        if (
            req.authorization.basic.username !== username ||
            req.authorization.basic.password !== password
        ) {
            
            console.error(
                'Basic authorization failed (' +
                req.authorization.basic.username + ', ' +
                req.authorization.basic.password + ')')
            
            res.send(401)
            return next(false)
            
        }
        
        next()
        
    }
    
}


module.exports = basicAuth
