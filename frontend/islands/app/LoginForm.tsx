export default function LoginForm() {
  return (
    <div className="login-form">
      <h1>Please Log In</h1>
      <form method="post" action="/api/login">
        <label>
          <p>Username</p>
          <input
            type="text"
            name="login"
          />
        </label>
        {/* TODO: password */}
        <div>
          <button type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
