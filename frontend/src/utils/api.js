import axios from 'axios'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4001'

const api = axios.create({ timeout: 60000 })

export { BACKEND, api }
export default api
