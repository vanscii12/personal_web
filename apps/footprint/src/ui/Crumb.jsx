import { Link } from 'react-router';

// The eyebrow above the title, on the panel and the splash. Its first half leads back to the
// site's My Apps page, since the site's own navigation is not shown around the map.
export function Crumb() {
  return (
    <p className="crumb">
      <Link to="/apps" className="crumb__back">
        ← my apps
      </Link>
      <span aria-hidden="true"> · </span>
      personal map
    </p>
  );
}
