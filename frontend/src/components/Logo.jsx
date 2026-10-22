import { Link } from "react-router-dom";

export default function Logo({ to = "/" }) {
  return (
    <Link to={to} className="logo">
      <i />
      <span>NOCTIS</span>
    </Link>
  );
}
