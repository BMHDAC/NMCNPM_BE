import { useContext } from "react"
import AuthContext from "../context/AuthProvider"

const useAuth = () => {
  const { user, setUser } = useContext(AuthContext)
  const login = (newUser) => {
    setUser(newUser)
    localStorage.setItem("user", newUser)
  }
  const removeUser = () => {
    setUser({})
    localStorage.removeItem("user")
  }
  return { login, removeUser, user, setUser }
}
export default useAuth

