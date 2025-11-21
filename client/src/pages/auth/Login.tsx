import { useState } from "react";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import { loginAPI } from "../../api/auth";
import { useAuth } from "../../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const tokens = await loginAPI(email, password);
      login(tokens.accessToken, tokens.refreshToken);
      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-96 shadow-lg">
      <CardContent>
        <Typography variant="h5" className="mb-4 text-center">
          Login
        </Typography>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
