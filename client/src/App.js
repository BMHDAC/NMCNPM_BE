
import './App.css';
import { ToastContainer } from "react-toastify";
import { Route, Routes } from 'react-router-dom';
import { Login } from './pages/login_register';
import { Register } from './pages/login_register';
import Blog from './homepage/Blog';
import { Layout } from './layout/Layout';

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route
            path='login'
            element={
              <Login />
              // <h1>Hello World</h1>
            }
          />
          <Route
            path='register'
            element={
              <Register />
            }
          />
          <Route
            path='homepage'
            element={
              <Blog />
            }
          />
        </Route>
      </Routes>

    </>
  );
}

export default App;

