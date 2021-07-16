import axios from 'axios'

import { cryptoMiddleware, generateSecret } from './crypto'
import { exchangeMiddleware } from './exchange'
import { signMiddleware } from './sign'

const baseURL = '/api'

const request = axios.create({
  baseURL,
})

const secret = generateSecret()

const getServerPublicKey = () => {
  return axios
    .get(`${baseURL}/crypto/public-key`)
    .then((response) => response.data)
}
const sendEncryptedSecret = (value) => {
  const timestamp = Date.now()

  return axios
    .post(`${baseURL}/crypto/secret`, {
      secret: value,
      timestamp,
    })
    .then((response) => response.data.key)
}

request.interceptors.request.use(
  signMiddleware({
    secret,
  })
)

request.interceptors.request.use(
  cryptoMiddleware({
    secret,
  })
)

request.interceptors.request.use(
  exchangeMiddleware({
    secret,
    getServerPublicKey,
    sendEncryptedSecret,
  })
)

export default request
