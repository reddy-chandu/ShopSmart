import { FiArrowLeft, FiShoppingBag } from "react-icons/fi";

import { Link } from "react-router-dom";

import Footer from "../Footer/Footer";
import Header from "../Header/Header";

import "./PageNotFound.css";

const PageNotFound = () => {
  return (
    <>
      <Header />
      <main className="page-not-found">
        <section className="page-not-found__content">
          <div className="page-not-found__mark" aria-hidden="true"><FiShoppingBag /></div>
          <span className="page-not-found__code">404</span>
          <p className="page-not-found__eyebrow">Wrong aisle</p>
          <h1>This page isn’t on our shelves.</h1>
          <p className="page-not-found__description">The link may be out of date, or the page may have moved.</p>
          <div className="page-not-found__actions">
            <Link className="page-not-found__primary" to="/">Go to homepage</Link>
            <Link className="page-not-found__secondary" to="/products"><FiArrowLeft /> Browse products</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PageNotFound;