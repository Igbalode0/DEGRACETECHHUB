// Re-mounts on every navigation, giving each page a soft fade-up entrance
// (see .dg-page-in in globals.css; disabled under prefers-reduced-motion).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="dg-page-in">{children}</div>;
}
