import { Link } from "react-router-dom";

import { FiExternalLink, FiLogOut, FiMenu } from "react-icons/fi";

import { useDispatch, useSelector } from "react-redux";
import { logOutUserAction } from "../../../../redux/actions/userAction";

import "./Header.css";

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => dispatch(logOutUserAction());

  return (
    <header className="admin-header">
      <div className="admin-header__start">
        <button
          type="button"
          className="admin-header__menu"
          aria-label="Open admin navigation"
          onClick={onMenuClick}
        >
          <FiMenu />
        </button>
        <Link className="admin-header__brand" to="/admin/home">
          <span className="admin-header__brand-mark">S</span>
          <span>ShopSmart <small>Operations</small></span>
        </Link>
      </div>
      <div className="admin-header__actions">
        <Link className="admin-header__store-link" to="/" title="Open storefront">
          <FiExternalLink /> <span>Storefront</span>
        </Link>
        <div className="admin-header__user">
          <span className="admin-header__avatar" aria-hidden="true">
            {(user?.firstName || "A").charAt(0).toUpperCase()}
          </span>
          <span className="admin-header__user-name">{user?.firstName || "Administrator"}</span>
        </div>
        <button type="button" className="admin-header__logout" onClick={handleLogout}>
          <FiLogOut /> <span>Sign out</span>
        </button>
      </div>
    </header>
  );
};

export default Header;