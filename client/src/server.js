'use strict'

const fs = require('fs')
const path = require('path')
const restify = require('restify')
const corsMiddleware = require('restify-cors-middleware')
const basicAuth = require('./basic-auth')
const mime = require('mime-types')

const app = restify.createServer({
    name:    'DWM',
    version: '1.0.0'
})

const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: ['*'],
    allowHeaders: [
        'X-Access-Token',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers'
    ],
    exposeHeaders: ['API-Token-Expiry']
})

app.use(restify.plugins.acceptParser(app.acceptable))
app.use(restify.plugins.fullResponse())
app.use(restify.plugins.queryParser())
app.use(restify.plugins.bodyParser({ extended: true }))
app.use(restify.plugins.gzipResponse())
app.use(restify.plugins.authorizationParser())
app.pre(cors.preflight)
app.use(cors.actual)
app.use(basicAuth(app.name, 'dick', 'butt'))

app.on('InternalError', (req, res, err) => {
    console.error(err)
    res.send(err.statusCode || 500, { error: err })
})

app.use((req, res, next) => {
    console.info(req.method, req.url)
    next()
})

app.on('after', (req, res, route, err) => {
    if (err) console.error(err)
})

// app.get(/\/.*/, restify.plugins.serveStatic({
//     default: 'index.html',
//     directory: path.resolve(__dirname, '../public'),
//     appendRequestPath: false,
//     charSet: 'utf-8'
// }))

const getCleanUrl = url => {
    // Remove trailing slash
    return (url.split('').pop() !== '/') ? url
        : url.substring(0, url.length - 1)
}

const getCleanPath = url => {
    
    let filePath = url
    
    // Remove trailing slash(es)
    while (filePath.substring(0, 1) === '/')
        filePath = filePath.substring(1)
    
    return filePath
    
}

const isBinary = (filePath, data) => new Promise((resolve, reject) => {
    
    fs.lstat(filePath, (err, stat) => {
        
        if (err) return reject(err)
        
        isBinaryFile(data, stat.size, (err, result) =>
            err ? reject(err) : resolve(!result))
        
    })
    
})

const sendFile = (res, filePath) => {
    res.header('Content-Type', mime.lookup(filePath))
    fs.createReadStream(filePath).pipe(res)
    res.once('result', err => {
        if (err) return res.send(500, { error: err })
    })
}

app.get(/\/.*/, (req, res) => {
    
    const source = path.resolve(__dirname, '../dist')
    const index = path.resolve(source, 'index.html')
    
    let url         = getCleanUrl(req.url)
    let filePath    = getCleanPath(url, req.url)
    let filePathAbs = path.resolve(source, filePath)
    let fileExists  = fs.existsSync(filePathAbs) && fs.lstatSync(filePathAbs).isFile()
    let sentFile    = ''
    
    if (fileExists) {
        // Allow the filesystem to find the actual file
        console.info('file', filePathAbs, 'exists')
        sentFile = filePathAbs
    }
    else {
        // Reroute misses back to the main page
        sentFile = index
    }
    
    sendFile(res, sentFile)
    
    console.info('Sent file', path.basename(sentFile), mime.lookup(sentFile))
    
})


const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 8080

app.listen(port, host, console.info(
    `Client server listening at http://${host}:${port}`))
