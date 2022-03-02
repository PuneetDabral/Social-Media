import React, { useState } from 'react'
import './Login.css'
import {Typography,Button} from '@mui/material'
import {Link} from 'react-router-dom'

const Login = (e) => {
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginHandler = (e) => {
    e.preventDefault();
    console.log(email, password);
  };
  return (
    <div className='login'>
    <form className="loginForm" onSubmit={loginHandler}>
    <Typography variant='h3' style={{padding:'2vamx'}}>Social Aap</Typography>
    <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Link to ='/forgot/password'>
            <Typography >Forgot Password?</Typography>
        </Link>
        <Button type='submit'>Login</Button>
        <Link to ='/register'>
            <Typography >New User?</Typography>
        </Link>

    </form>


    </div>
  )
}

export default Login