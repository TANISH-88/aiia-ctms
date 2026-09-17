

const InvalidAccessPage = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--bg)",
        color: "var(--text)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "540px",
          textAlign: "center",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 8px 24px var(--shadow)",
        }}
      >
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>403</h1>
        <h2 style={{ marginBottom: "0.75rem" }}>Access denied</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          You do not have permission to view this page.
        </p>
      </div>
    </div>
  );
};

export default InvalidAccessPage;
