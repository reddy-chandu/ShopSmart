import { useNavigate } from "react-router-dom";

import { FaStar } from "react-icons/fa";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./AboutUs.css";

const AboutUs = () => {
  const Navigate = useNavigate();

  return (
    <>
      <Header />

      <main className="about-page">

        {/* Hero Section */}

        <section className="about-hero">
          <span className="about-badge">
            About ShopSmart
          </span>

          <h1>
            Making Grocery Shopping
            <span> Smarter & Simpler</span>
          </h1>

          <p>
            ShopSmart brings together fresh groceries,
            reliable delivery, secure payments, and the
            power of SmartieAI to create a modern shopping
            experience tailored to everyday families.
          </p>
        </section>

        {/* Our Mission Section*/}

        <section className="about-mission">
          <div className="mission-content">
            <h2>Our Mission</h2>

            <p>
              We believe grocery shopping should never feel
              stressful. Our mission is to provide customers
              with a convenient, transparent, and reliable
              platform where they can discover high-quality
              products and get them delivered with ease.
            </p>
          </div>
        </section>

        {/* Our Core Values Section */}

        <section className="about-values">

          <div className="about-section-header">
            <h2>Our Core Values</h2>
          </div>

          <div className="values-grid">

            <div className="value-card">
              <h3>Convenience</h3>
              <p>
                Saving customers time through seamless
                shopping experiences.
              </p>
            </div>

            <div className="value-card">
              <h3>Quality</h3>
              <p>
                Delivering products with highest
                standards of freshness and quality.
              </p>
            </div>

            <div className="value-card">
              <h3>Customer First</h3>
              <p>
                Every decision is driven by customer
                satisfaction and trust.
              </p>
            </div>

            <div className="value-card">
              <h3>Sustainability</h3>
              <p>
                Supporting responsible practices and
                reducing unnecessary waste.
              </p>
            </div>

          </div>
        </section>

        {/* Stats Section */}

        <section className="about-stats">

          <div className="stat-box">
            <h3>
              10K+
            </h3>
            <p>Orders Delivered</p>
          </div>

          <div className="stat-box">
            <h3>
              10K+
            </h3>
            <p>Happy Customers</p>
          </div>

          <div className="stat-box">
            <h3>
              30+
            </h3>
            <p>Quality Products</p>
          </div>

          <div className="stat-box">
            <h3>
              5.0<FaStar size={20}/>
            </h3>
            <p>Customer Rating</p>
          </div>

        </section>

        {/* CTA Section */}

        <section className="about-cta">

          <h2>Ready to Shop Smarter?</h2>

          <p>
            Explore fresh groceries, everyday essentials,
            and AI-powered recommendations with ShopSmart.
          </p>

          <a className="cta-btn" onClick={() => Navigate("/products")}>
            Start Shopping
          </a>

        </section>

      </main>

      <Footer />
    </>
  );
};

export default AboutUs;