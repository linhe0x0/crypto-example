const fs = require('fs')
const Koa = require('Koa')
const bodyParser = require('koa-bodyparser')
const { exchangeMiddleware } = require('@sqrtthree/koa-crypto-exchange')
const { signMiddleware } = require('@sqrtthree/koa-sign')
const { cryptoMiddleware } = require('@sqrtthree/koa-crypto')

const publicKey = fs.readFileSync('./keys/app_public_key.pem', 'utf8')
const privateKey = fs.readFileSync('./keys/app_private_key.pem', 'utf8')

const store = {}
const getSecret = (key) => store[key]

const exchange = exchangeMiddleware({
  publicKey,
  privateKey,
  exposePublicKeyPath: '/api/crypto/public-key',
  exposeSecretPath: '/api/crypto/secret',
  setSecret: (key, secret) => {
    store[key] = secret
  },
})
const signRequired = signMiddleware({
  secret: (ctx) => getSecret(ctx.query.key || ctx.request.body.key),
})
const cryptoRequired = cryptoMiddleware({
  secret: (ctx) => getSecret(ctx.query.key || ctx.request.body.key),
})

const app = new Koa()

app.use(bodyParser())
app.use(exchange)
app.use(signRequired)
app.use(cryptoRequired)

app.use((ctx) => {
  ctx.body = `Success. ${new Date().toLocaleString()}`
})

app.listen(8788)

console.log('Server is running at http://127.0.0.0:8788')
