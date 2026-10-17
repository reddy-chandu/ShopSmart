import { FiAlertTriangle, FiPackage } from "react-icons/fi";

import { Link } from "react-router-dom";

import "./NotFoundCard.css";

const NotFoundCard = ({
  msg,
  title,
  description,
  actionLabel,
  actionTo,
  variant = "empty",
}) => {
  const Icon = variant === "error" ? FiAlertTriangle : FiPackage;

  return (
    <section className={`not-found-state not-found-state--${variant}`} role={variant === "error" ? "alert" : undefined}>
      <div className="not-found-state__icon" aria-hidden="true">
        <Icon />
      </div>
      <div className="not-found-state__copy">
        <span className="not-found-state__eyebrow">{variant === "error" ? "Something went wrong" : "ShopSmart"}</span>
        <h2>{title || msg || "Nothing to show yet"}</h2>
        {description && <p>{description}</p>}
        {actionLabel && actionTo && (
          <Link className="not-found-state__action" to={actionTo}>
            {actionLabel}
          </Link>
        )}
      </div>
    </section>
  );
};

export default NotFoundCard;