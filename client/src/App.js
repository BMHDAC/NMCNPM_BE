import './App.css';
import { ToastContainer } from "react-toastify";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Login } from './pages/login_register';
import {Register} from './pages/login_register';
import Blog from './homepage/Blog';
import AdminHome from './pages/Admin/AdminHome';

function App() {
  return (
    <>
      <ToastContainer />
      <Router>
      <Routes>
        <Route 
          path='/login'
          element={
            <Login />
            // <h1>Hello World</h1>
          }
        />
        <Route 
          path='/register'
          element={
            <Register />
          }
        />
        <Route 
          path='/homepage'
          element={
            <Blog />
          }
        />
        <Route 
          path="/admin"
          element={
            <AdminHome />
          }
        />
      </Routes>
      </Router>
    </>
  );
}

export default App;
