import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { RiShoppingBasketLine } from "react-icons/ri";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { BiSearch, BiCartAlt, BiChevronDown } from "react-icons/bi";
import { FaUser, FaRegUser, FaRegHeart, FaUserCog } from "react-icons/fa";
import { RiLogoutCircleRLine, RiDashboardLine } from "react-icons/ri";
import { AiOutlineArrowRight } from "react-icons/ai";

import { useDispatch, useSelector } from "react-redux";
import { logOutUserAction } from "../../redux/actions/userAction";

import "./Header.css";

const Header = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.userCart);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const closeMenus = () => {
      setMenuOpen(false);
      setProfileOpen(false);
    };

    window.addEventListener("scroll", closeMenus);
    return () => window.removeEventListener("scroll", closeMenus);
  }, []);

  // To handle search action and navigate the user to the search result page
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedKeyword = new FormData(e.currentTarget).get("keyword")?.trim();
    if (trimmedKeyword) {
      navigate(`/products?keyword=${encodeURIComponent(trimmedKeyword)}`);
    } else {
      navigate("/");
    }
    setMenuOpen(false);
  };

  // To handle user logout action
  const handleLogout = () => {
    dispatch(logOutUserAction());
    setProfileOpen(false);
    navigate("/")
  };

  // To navigate the user to cart
  const goToShoppingCart = () => {
    navigate("/checkout");
    setMenuOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="store-header">
      <div className="header-inner">
        <button
          className="mobile-menu-btn"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => {
            setMenuOpen((isOpen) => !isOpen);
            setProfileOpen(false);
          }}
        >
          {menuOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>

        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-mark"><RiShoppingBasketLine /></span>
          <span className="logo-copy">ShopSmart</span>
        </Link>

        <form
          className="search-form"
          onSubmit={handleSearch}
        >
          <input
            type="search"
            name="keyword"
            aria-label="Search products"
            placeholder="Search products, categories..."
          />
          <button type="submit" aria-label="Submit search"><BiSearch /></button>
        </form>

        <nav className={`navbar-section ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link to="/reviews/all" onClick={() => setMenuOpen(false)}>Reviews</Link>
          <Link to="/about-us" onClick={() => setMenuOpen(false)}>About Us</Link>
        </nav>

        <div className="header-actions">
          <button
            className="account-trigger"
            aria-label={user ? "Open account menu" : "Open login menu"}
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((isOpen) => !isOpen);
              setMenuOpen(false);
            }}
          >
            <span className="action-icon">{user ? <FaUser /> : <FaRegUser />}</span>
            <span className="action-label">{user ? "Account" : "Sign In"}</span>
            <BiChevronDown className="account-chevron" />
          </button>
          <button className="cart-action" aria-label="Open shopping cart" onClick={goToShoppingCart}>
            <BiCartAlt />
            {cartItems?.length > 0 && <span className="cart-count">{cartItems.length > 99 ? "99+" : cartItems.length}</span>}
          </button>
        </div>

        <div className={`user-profile ${profileOpen ? "active" : ""}`}>
          <div className="profile-heading">
            <span className="profile-avatar">{user ? <FaUser /> : <FaRegUser />}</span>
            <div><strong>{user ? `${user.firstName} ${user.lastName}` : "Welcome to ShopSmart"}</strong><span>{user ? "" : "Sign in for a better experience"}</span></div>
          </div>
          {!user ? (
            <div className="profile-links">
              <Link to="/sign-in"><AiOutlineArrowRight /> Sign In</Link>
              <Link to="/create-account"><AiOutlineArrowRight /> Create Account</Link>
            </div>
          ) : (
            <div className="profile-links">
              <Link to="/account" onClick={() => setProfileOpen(false)}><FaUserCog /> Manage your account</Link>
              {user.role === "Admin" && <Link to="/admin/home"><RiDashboardLine /> Dashboard</Link>}
              <Link to="/orders"><AiOutlineArrowRight /> My Orders</Link>
              <Link to="/reviews/add"><FaRegHeart /> Add Reviews</Link>
              <button onClick={handleLogout}><RiLogoutCircleRLine /> Log Out</button>
            </div>
          )}
        </div>
      </div>
      <form className="mobile-search-form search-form" onSubmit={handleSearch}>
        <input type="search" name="keyword" aria-label="Search products" placeholder="Search products, categories..." />
        <button type="submit" aria-label="Submit search"><BiSearch /></button>
      </form>
    </header>
  );
};

export default Header;