import AES from 'crypto-js/aes'
import base64 from 'crypto-js/enc-base64'
import hex from 'crypto-js/enc-hex'
import { assign, omit } from 'lodash-es'

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

const aesEncrypt = function aesEncrypt(secret, data) {
  const str = JSON.stringify(data || {})
  const key = hex.parse(secret)
  const iv = hex.parse(secret)
  const cipher = AES.encrypt(str, key, {
    iv,
  })
  const result = base64.stringify(cipher.ciphertext)

  return result
}

export function generateSecret() {
  const random = randomString(43)
  const str = `${random}=`

  return hex.stringify(base64.parse(str))
}

export function cryptoMiddleware(options) {
  return async function c(config) {
    const { method, params, data } = config

    const hasParams = params && Object.keys(params).length > 0
    const hasBody = data && Object.keys(data).length > 0
    const timestamp = Date.now()
    const nonce = randomString(32)

    const aesSecret = options.secret

    if (method === 'get' || method === 'delete' || hasParams) {
      const { key } = params
      const payload = assign(omit(params, ['key']), {
        timestamp,
        nonce,
      })
      const cipherText = aesEncrypt(aesSecret, payload)

      config.params = {
        key,
        cipherText,
      }
    }

    if (
      method === 'post' ||
      method === 'put' ||
      method === 'patch' ||
      hasBody
    ) {
      const { key } = data
      const payload = assign({}, omit(data, ['key']), {
        timestamp,
        nonce,
      })
      const cipherText = aesEncrypt(aesSecret, payload)

      config.data = {
        key,
        cipherText,
      }
    }

    return config
  }
}
