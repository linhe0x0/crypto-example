import axios from 'axios'

import { useCrypto, generateSecret } from '@sqrtthree/axios-use-crypto'
import useCryptoExchange from '@sqrtthree/axios-use-crypto-exchange'
import useSign from '@sqrtthree/axios-use-sign'

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
  useSign({
    secret,
  })
)

request.interceptors.request.use(
  useCrypto({
    secret,
  })
)

request.interceptors.request.use(
  useCryptoExchange({
    secret,
    getServerPublicKey,
    sendEncryptedSecret,
  })
)

export default request
