import axios from "axios";
import useAuth from "../customHooks/useAuth";

const BASE_URL = "http://localhost:3500"
export const publicRequest = axios.create({
  baseURL: BASE_URL,
})
const userRequest = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

userRequest.interceptors.request.use(
  config => {
    const { user } = useAuth()
    if (!config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${user?.token}`
    }
    return config;
  }, (error) => Promise.reject(error)

)

export { userRequest }

