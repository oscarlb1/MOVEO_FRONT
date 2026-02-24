import axios from 'axios'

const clienteApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5079/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

// Interceptor de REQUEST — añade el Bearer token si existe en localStorage
clienteApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Interceptor de RESPONSE — si recibe 401, intenta refrescar el token y reintenta
let refrescando = false
let colaEspera: ((token: string) => void)[] = []

clienteApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const peticionOriginal = error.config

        // Solo reintentamos si es 401 y no es la propia llamada de refresh
        if (
            error.response?.status !== 401 ||
            peticionOriginal._reintentado ||
            peticionOriginal.url?.includes('/Auth/')
        ) {
            return Promise.reject(error)
        }

        peticionOriginal._reintentado = true

        if (refrescando) {
            // Hay un refresh en curso, ponemos esta petición en cola
            return new Promise((resolve) => {
                colaEspera.push((nuevoToken: string) => {
                    peticionOriginal.headers.Authorization = `Bearer ${nuevoToken}`
                    resolve(clienteApi(peticionOriginal))
                })
            })
        }

        refrescando = true

        try {
            // El backend lee el X-Refresh-Token directamente de la cookie
            const { data } = await clienteApi.post<{ tokenDeAcceso: string }>(
                '/Auth/refrescar-token',
                { tokenDeRefresco: '' }
            )

            const nuevoToken = data.tokenDeAcceso
            localStorage.setItem('token', nuevoToken)

            // Notificar a las peticiones en cola
            colaEspera.forEach((cb) => cb(nuevoToken))
            colaEspera = []

            // Reintentar la petición original con el nuevo token
            peticionOriginal.headers.Authorization = `Bearer ${nuevoToken}`
            return clienteApi(peticionOriginal)
        } catch (errorRefresh) {
            // Si el refresh falla (refresh token expirado), limpiar sesión y redirigir al login
            colaEspera = []
            localStorage.removeItem('token')
            window.location.href = '/'
            return Promise.reject(errorRefresh)
        } finally {
            refrescando = false
        }
    }
)

export default clienteApi
