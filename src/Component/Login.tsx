import { useEffect } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  useEffect(() => {
    document.body.classList.add("page-login");
    return () => document.body.classList.remove("page-login");
  }, []);

  return (
    <section className="container">
      <div className="login-container">
        <div className="circle circle-one" />

        <div className="form-container">
          {/* Optional illustration */}
          {/* <img
            src="https://raw.githubusercontent.com/hicodersofficial/glassmorphism-login-form/master/assets/illustration.png"
            alt="illustration"
            className="illustration"
          /> */}

          <h1 className="opacity">LOGIN</h1>

          <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="USERNAME" />
            <input type="password" placeholder="PASSWORD" />
            <button className="opacity">SUBMIT</button>
          </form>

          <div className="register-forget opacity">
            <Link to="/register">REGISTER</Link>
            <a href="#">FORGOT PASSWORD</a>
          </div>
        </div>

        <div className="circle circle-two" />
      </div>
    </section>
  );
};

export default Login;
