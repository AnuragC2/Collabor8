import { useState } from "react";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import { registerAPI } from "../../api/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerAPI(name, email, password);
      navigate("/login");
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-96 shadow-lg">
      <CardContent>
        <Typography variant="h5" className="mb-4 text-center">
          Register
        </Typography>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <Button type="submit" variant="contained" fullWidth>
            {loading ? "Creating..." : "Register"}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
