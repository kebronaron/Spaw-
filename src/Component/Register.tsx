import { useEffect } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  useEffect(() => {
    document.body.classList.add("page-register");
    return () => document.body.classList.remove("page-register");
  }, []);

  return (
    <section className="container">
      <div className="login-container">
        <div className="circle circle-one" />

        <div className="form-container">
          <h1 className="opacity">REGISTER</h1>

          <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="NAME" />
            <input type="text" placeholder="USERNAME" />
            <input type="password" placeholder="PASSWORD" />
            <button className="opacity">CREATE ACCOUNT</button>
          </form>

          <div className="register-forget opacity">
            <Link to="/login">BACK TO LOGIN</Link>
            <a href="#">NEED HELP?</a>
          </div>
        </div>

        <div className="circle circle-two" />
      </div>
    </section>
  );
};

export default Register;
