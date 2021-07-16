import base64 from 'crypto-js/enc-base64'
import hex from 'crypto-js/enc-hex'
import forge from 'node-forge'

const randomString = function randomString(len) {
  const dictionary =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''

  for (let i = 0; i < len; i += 1) {
    const random = Math.floor(Math.random() * dictionary.length)
    const char = dictionary.charAt(random)

    result += char
  }

  return result
}

const publicEncrypt = function publicEncrypt(key, data) {
  const { publicKeyFromPem } = forge.pki

  const publicKey = publicKeyFromPem(key)
  const cipherText = publicKey.encrypt(data, 'RSA-OAEP')
  const result = forge.util.encode64(cipherText)

  return result
}

let key = ''

export function exchangeMiddleware(options) {
  return async function c(config) {
    const { method, params, data } = config
    const { secret } = options

    const hasParams = params && Object.keys(params).length > 0
    const hasBody = data && Object.keys(data).length > 0

    if (!key) {
      const serverPublicKey = await options.getServerPublicKey()
      const encryptedSecret = publicEncrypt(serverPublicKey, secret)

      key = await options.sendEncryptedSecret(encryptedSecret)
    }

    if (method === 'get' || method === 'delete' || hasParams) {
      config.params = Object.assign({}, params, {
        key,
      })
    }

    if (
      method === 'post' ||
      method === 'put' ||
      method === 'patch' ||
      hasBody
    ) {
      config.data = Object.assign({}, data, {
        key,
      })
    }

    return config
  }
}
