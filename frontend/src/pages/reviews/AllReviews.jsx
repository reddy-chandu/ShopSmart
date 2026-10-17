import { useMemo, useState, useEffect } from "react";

import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import { getAllReviewsAction } from "../../redux/actions/reviewsAction";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import NotFoundCard from "../../components/NotFoundCard/NotFoundCard";

const AllReviews = () => {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector(
    (state) => state.getAllReviews
  );

  const [selectedRating, setSelectedRating] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  const ratingDistribution = useMemo(() => {
    const counts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    if (!Array.isArray(reviews)) {
      return counts;
    }

    reviews?.forEach((review) => {
      const rating = Math.round(review.ratings);

      if (counts[rating] !== undefined) {
        counts[rating]++;
      }
    });

    return counts;
  }, [reviews]);

  const averageRating = useMemo(() => {
    if (!Array.isArray(reviews) || reviews.length === 0)
      return 0;

    const total = reviews.reduce(
      (sum, review) => sum + review.ratings,
      0
    );

    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const satisfactionRate = useMemo(() => {
    if (!Array.isArray(reviews) || reviews.length === 0)
      return 0;

    const positiveReviews = ratingDistribution[5] + ratingDistribution[4];

    return ((positiveReviews / reviews.length) * 100).toFixed(0);
  }, [reviews, ratingDistribution]);


  const filteredReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return [];

    let data = [...reviews];

    if (selectedRating) {
      data = data.filter(
        (review) =>
          Math.round(review.ratings) === selectedRating
      );
    }

    switch (sortBy) {
      case "highest":
        data.sort((a, b) => b.ratings - a.ratings);
        break;

      case "lowest":
        data.sort((a, b) => a.ratings - b.ratings);
        break;

      default:
        break;
    }

    return data;
  }, [reviews, selectedRating, sortBy]);

  useEffect(() => {
    document.title = `Reviews`;
    dispatch(getAllReviewsAction());
  }, [dispatch]);

  return (
    <>
      <Header />
      {loading ? (
        <Loader LoadingName={"Getting Reviews"} />
      ) : error ? (
        <div className="reviews-page">
          <NotFoundCard variant="error" title="Reviews unavailable" description={error} />
        </div>
      ) : (
        <>
          <div className="reviews-page">

            <div className="reviews-hero">

              <span className="section-badge">
                Customer Testimonials
              </span>

              <h1>
                What Our <span className="highlight-text">Customers Say</span>
              </h1>

              <p>
                Discover real experiences from customers who
                trust ShopSmart for fresh groceries, reliable
                delivery, and a seamless shopping experience.
              </p>

            </div>

            {reviews.length === 0 ? (
              <NotFoundCard
                title="No reviews yet"
                description="Customer feedback will appear here once a review is shared."
              />
            ) : (
              <>

                <div className="ratings-overview">

                  <div className="overall-rating">

                    <h2>{averageRating}<FaStar size={24} /></h2>

                    <div className="overall-stars">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const roundedRating = Math.round(averageRating * 2) / 2;
                        if (roundedRating >= star) {
                          return <FaStar key={star} className="star filled" />;
                        }
                        if (roundedRating >= star - 0.5) {
                          return <FaStarHalfAlt key={star} className="star filled" />;
                        }
                        return <FaRegStar key={star} className="star empty" />;
                      })}
                    </div>

                    <p>{reviews.length} Reviews</p>
                    <p><strong>{satisfactionRate}% of customers are satisfied</strong></p>

                  </div>

                  <div className="rating-breakdown">

                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingDistribution[star];

                      const percentage =
                        reviews.length > 0
                          ? (count / reviews.length) * 100
                          : 0;

                      return (
                        <button
                          key={star}
                          className={`rating-row ${selectedRating === star
                            ? "active-rating"
                            : ""
                            }`}
                          onClick={() =>
                            setSelectedRating(
                              selectedRating === star
                                ? null
                                : star
                            )
                          }
                        >
                          <span>{star} <FaStar /></span>

                          <div className="rating-progress">
                            <div
                              className="rating-fill"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <span>{count}</span>
                        </button>
                      );
                    })}
                  </div>

                </div>

                <div className="reviews-toolbar">

                  <div className="rating-filters">

                    <button
                      className={!selectedRating ? "active" : ""}
                      onClick={() => setSelectedRating(null)}
                    >
                      All Reviews
                    </button>

                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        className={
                          selectedRating === rating
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setSelectedRating(rating)
                        }
                      >
                        {rating} <FaStar />
                      </button>
                    ))}

                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value)
                    }
                  >
                    <option value="newest">
                      Newest First
                    </option>

                    <option value="highest">
                      Highest Rating
                    </option>

                    <option value="lowest">
                      Lowest Rating
                    </option>
                  </select>

                </div>

                <div className="reviews-grid">

                  {filteredReviews.map((review) => (
                    <article
                      className="review-card"
                      key={review._id}
                    >

                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const roundedRating = Math.round(review.ratings * 2) / 2;
                          if (roundedRating >= star) {
                            return <FaStar key={star} className="star filled" />;
                          }
                          if (roundedRating >= star - 0.5) {
                            return <FaStarHalfAlt key={star} className="star filled" />;
                          }
                          return <FaRegStar key={star} className="star empty" />;
                        })}
                      </div>

                      <p className="review-text">
                        "{review.comment}"
                      </p>

                      <div className="review-user">

                        <div className="review-avatar">
                          {review.user.firstName?.charAt(0)}
                        </div>

                        <div>
                          <h4>
                            {review.user.firstName}{" "}
                            {review.user.lastName}
                          </h4>

                          <span>
                            Verified Customer
                          </span>
                        </div>

                      </div>

                    </article>
                  ))}

                </div>
              </>
            )}
          </div>

          <Footer />
        </>
      )}
    </>
  );
};

export default AllReviews;