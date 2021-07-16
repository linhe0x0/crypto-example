import md5 from 'crypto-js/md5'

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

const isEmpty = function isEmpty(value) {
  return value === undefined || value === null || value === ''
}

const serialize = function serialize(data) {
  const keys = Object.keys(data)
  const sortedKeys = keys.sort()

  let result = ''

  for (let i = 0, len = sortedKeys.length; i < len; i += 1) {
    const key = sortedKeys[i]
    const value = data[key]
    const empty = isEmpty(value)

    if (empty) {
      continue
    }

    if (result) {
      result += '&'
    }

    result += `${key}=${value}`
  }

  return result
}

const sign = function sign(data) {
  const str = serialize(data)
  const result = md5(str).toString()

  return result
}

const signData = function signData(secret, data) {
  const timestamp = Date.now()
  const nonce = randomString(32)
  const payload = Object.assign({}, data, {
    timestamp,
    nonce,
  })
  const payloadWithSecret = Object.assign({}, payload, {
    secret,
  })
  const signature = sign(payloadWithSecret)

  payload.signature = signature

  return payload
}

export function signMiddleware(options) {
  return function s(config) {
    const { method, params, data } = config

    const { secret } = options

    if (!secret) {
      console.warn('No secret found, the sign will be skipped.')
      return config
    }

    const hasParams = params && Object.keys(params).length > 0
    const hasBody = data && Object.keys(data).length > 0

    if (method === 'get' || method === 'delete' || hasParams) {
      config.params = signData(secret, params)
    }

    if (
      method === 'post' ||
      method === 'put' ||
      method === 'patch' ||
      hasBody
    ) {
      config.data = signData(secret, data)
    }

    return config
  }
}
