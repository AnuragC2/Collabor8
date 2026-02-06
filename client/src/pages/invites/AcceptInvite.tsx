import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Card, CardContent, CircularProgress, Typography, Button } from "@mui/material";
import { acceptWorkspaceInvite } from "../../api/workspaces";
import { useSnackbar } from "../../providers/SnackbarProvider";

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!token) {
        setError("Missing invite token");
        setLoading(false);
        return;
      }
      try {
        const workspace = await acceptWorkspaceInvite(token);
        if (cancelled) return;
        showSnackbar("Invite accepted", "success");
        navigate(`/workspace/${workspace._id}`, { replace: true });
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.response?.data?.message || "Failed to accept invite");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [token, navigate, showSnackbar]);

  return (
    <Box className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md" variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-2">
            Accept Workspace Invite
          </Typography>

          {loading ? (
            <Box className="flex items-center gap-2">
              <CircularProgress size={20} />
              <Typography color="text.secondary">Accepting invite…</Typography>
            </Box>
          ) : error ? (
            <>
              <Typography color="error" className="mb-3">
                {error}
              </Typography>
              <Button variant="contained" onClick={() => navigate("/")}>
                Go Home
              </Button>
            </>
          ) : (
            <Typography color="text.secondary">Done</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

