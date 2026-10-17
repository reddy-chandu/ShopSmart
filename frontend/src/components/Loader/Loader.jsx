import { FiShoppingBag } from "react-icons/fi";

import "./Loader.css";

const Loader = ({ LoadingName }) => {
  const label = LoadingName || "Loading ShopSmart";

  return (
    <div className="shop-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="shop-loader__content">
        <div className="shop-loader__mark" aria-hidden="true">
          <span className="shop-loader__ring" />
          <FiShoppingBag />
        </div>
        <p className="shop-loader__brand">ShopSmart</p>
        <h1 className="shop-loader__label">{label}</h1>
        <div className="shop-loader__track" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
};

export default Loader;