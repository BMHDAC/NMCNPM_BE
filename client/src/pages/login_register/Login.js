import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import Tilt from "react-parallax-tilt";

// import { AuthContext } from "../../context/authContext";

import './dependencies/fonts/font-awesome-4.7.0/css/font-awesome.min.css';
import './dependencies/vendor/animate/animate.css';
import './dependencies/vendor/css-hamburgers/hamburgers.min.css';
import './dependencies/vendor/select2/select2.min.css';
import './dependencies/css/util.css';
import './dependencies/css/main.css';
import useAuth from "../../customHooks/useAuth";
import { publicRequest } from "../../api/requestMethod";
import { toast } from "react-toastify";

const Login = () => {
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    const res = await publicRequest.post('auth/login', { username: username, password: password })
    if (res.data?.accessToken) {
      login({ username: username, token: res.data.accessToken })
      navigate('/homepage')
    } else {
      toast.error("Co loi xay ra")
    }
  }
  return (
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100">
          <div className="login100-pic js-tilt" data-tilt>
            <Tilt scale={1.1}>
              <img src={require("./dependencies/images/img-01.png")} alt="IMG" />
            </Tilt>
          </div>

          <form className="login100-form validate-form">
            <span className="login100-form-title">
              Member Login
            </span>

            <div className="wrap-input100 validate-input" data-validate="Valid email is required: ex@abc.xyz">
              <input className="input100" type="text" name="email" placeholder="Email" value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <span className="focus-input100"></span>
              <span className="symbol-input100">
                <i className="fa fa-envelope" aria-hidden="true"></i>
              </span>
            </div>

            <div className="wrap-input100 validate-input" data-validate="Password is required">
              <input className="input100" type="password" name="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="focus-input100"></span>
              <span className="symbol-input100">
                <i className="fa fa-lock" aria-hidden="true"></i>
              </span>
            </div>

            <div className="container-login100-form-btn">
              <button className="login100-form-btn"
                onClick={handleLogin}
              >
                Login
              </button>
            </div>

            <div className="text-center p-t-136">
              <Link to="/register" className="txt2">
                Create your Account
                <i className="fa fa-arrow-circle-right m-l-5" aria-hidden="true"></i>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
