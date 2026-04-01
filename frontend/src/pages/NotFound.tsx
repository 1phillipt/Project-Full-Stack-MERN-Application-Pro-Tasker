import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div>
      <h1>404-page not gound</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go Back home</Link>
    </div>
  );
};

export default NotFound;