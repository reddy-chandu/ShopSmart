import { RiShoppingBasketLine, RiMapPin2Line } from "react-icons/ri";
import { MdPhone, MdOutlineMail } from "react-icons/md";
import { AiOutlineArrowRight } from "react-icons/ai";

import { Link } from "react-router-dom";

import "./Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__glow" aria-hidden="true" />
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <section className="site-footer__brand" aria-labelledby="footer-brand">
            <div className="site-footer__logo" id="footer-brand">
              <span className="site-footer__logo-mark" aria-hidden="true">
                <RiShoppingBasketLine />
              </span>
              <span>ShopSmart</span>
            </div>
            <p>
              Discover a smarter way to shop for everyday essentials. From
              farm-fresh produce to carefully selected groceries, we bring
              quality, convenience, and freshness straight to your doorstep.
            </p>
            <div className="site-footer__promise">
              <span aria-hidden="true" />
              Fresh choices, delivered simply.
            </div>
          </section>

          <section className="site-footer__column" aria-labelledby="footer-contact">
            <h2 id="footer-contact">Contact us</h2>
            <div className="site-footer__links">
              <a href="tel:+919876543210" className="site-footer__link">
                <span className="site-footer__link-icon" aria-hidden="true">
                  <MdPhone />
                </span>
                <span>+91 9876543210</span>
              </a>
              <a
                href="mailto:shopsmartservices@gmail.com"
                className="site-footer__link"
              >
                <span className="site-footer__link-icon" aria-hidden="true">
                  <MdOutlineMail />
                </span>
                <span>shopsmartservices@gmail.com</span>
              </a>
              <span className="site-footer__link">
                <span className="site-footer__link-icon" aria-hidden="true">
                  <RiMapPin2Line />
                </span>
                <span>Chennai, India</span>
              </span>
            </div>
          </section>

          <section className="site-footer__column" aria-labelledby="footer-links">
            <h2 id="footer-links">Explore</h2>
            <div className="site-footer__links">
              <Link to="/" className="site-footer__link">
                <AiOutlineArrowRight aria-hidden="true" />
                Home
              </Link>
              <Link to="/products" className="site-footer__link">
                <AiOutlineArrowRight aria-hidden="true" />
                Products
              </Link>
              <Link to="/reviews/all" className="site-footer__link">
                <AiOutlineArrowRight aria-hidden="true" />
                Reviews
              </Link>
            </div>
          </section>
        </div>

        <div className="site-footer__bottom">
          <span>Copyright © 2026 ShopSmart. All rights reserved</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;