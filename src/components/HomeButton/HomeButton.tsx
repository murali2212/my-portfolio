import { Link } from "react-router-dom";
import "./HomeButton.css";

/** Place at the very bottom of the project detail page content, above the footer. */
export default function HomeButton() {
  return (
    <div className="home-btn-wrap">
      <Link to="/" className="home-btn" onClick={() => window.scrollTo(0, 0)}>
        <span className="home-btn__arrow" aria-hidden="true">←</span> HOME
      </Link>
    </div>
  );
}
