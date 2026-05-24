import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const lang = localStorage.getItem('airona_lang') ?? 'es'
  config.headers['Accept-Language'] = lang
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('airona_auth')
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after']
      const seconds = retryAfter ? parseInt(retryAfter, 10) : 60
      error.message = `Too many requests. Please wait ${seconds} seconds before trying again.`
      error.isRateLimit = true
      error.retryAfterSeconds = seconds
    }
    return Promise.reject(error)
  }
)

export default client
