import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="container"
      style={{
        padding: "100px 20px",
        textAlign: "center",
        minHeight: "50vh",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 999,
          background: "#fffbeb",
          color: "#d97706",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <Zap size={28} />
      </div>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>Page Not Found</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link href="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
