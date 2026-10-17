import { useState, useEffect } from "react";

import api from '../../api/axios';

import { MdClose } from "react-icons/md";
import { FaStar } from "react-icons/fa";

import { useSelector } from "react-redux";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";

import "./Reviews.css";

const AddReviews = () => {
  const { loading: userLoading, user } = useSelector((state) => state.user);
  const [comment, setComment] = useState("");
  const [ratings, setRatings] = useState(0);
  const [hover, setHover] = useState(null);
  const [validationError, setValidationError] = useState();
  const [addError, setAddError] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [lastSaveWasUpdate, setLastSaveWasUpdate] = useState(false);

  //Add Reviews
  const addReviewsHandel = async () => {
    try {
      if (comment.trim().length !== 0 && ratings !== 0) {
        setAddLoading(true);
        setAddError(null);
        const wasExistingReview = Boolean(existingReview);
        const { data } = await api.post("/api/user/add/review", {
          comment,
          ratings,
        });

        setExistingReview(data.review || { comment, ratings });
        setAddLoading(false);
        setLastSaveWasUpdate(wasExistingReview);
        setMessage(wasExistingReview ? "Your review has been updated." : "Thank you. Your review has been added.");
      } else {
        setValidationError("All Field Are Required..!!");
      }
    } catch (error) {
      setAddLoading(false);
      setAddError(error.response?.data?.message || "Could not save your review. Please try again.");
    }
  };

  useEffect(() => {
    document.title = `Add Review`;
  }, []);

  useEffect(() => {
    if (userLoading) return undefined;
    if (!user?._id) {
      setReviewLoading(false);
      return undefined;
    }

    let isMounted = true;
    api.get("/api/user/my/review")
      .then(({ data }) => {
        if (!isMounted || !data.review) return;
        setExistingReview(data.review);
        setComment(data.review.comment || "");
        setRatings(data.review.ratings || 0);
      })
      .catch((error) => {
        if (isMounted) setAddError(error.response?.data?.message || "Could not load your saved review.");
      })
      .finally(() => {
        if (isMounted) setReviewLoading(false);
      });

    return () => { isMounted = false; };
  }, [user?._id, userLoading]);

  useEffect(() => {
    if (!validationError) return;

    const timer = setTimeout(() => {
      setValidationError(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [validationError]);

  const closeRegisterPop = () => setMessage(null);
  return (
    <>
      <Header />
      {addLoading || userLoading || reviewLoading ? (
        <Loader LoadingName={reviewLoading ? "Loading your review" : "Saving your review"} />
      ) : (
        <div className="reviews-container-section">
          {message && (
            <div className="review-success-overlay">

              <div className="review-success-card">

                <button
                  className="close-modal-btn"
                  onClick={closeRegisterPop}
                >
                  <MdClose />
                </button>

                <div className="success-icon">
                  ✓
                </div>

                <h2>{lastSaveWasUpdate ? "Review updated" : "Thank you"}</h2>

                <p>{message}</p>

              </div>

            </div>
          )}
          <div className="review-form-wrapper">

            <div className="review-form-header">

              <span className="review-badge">
                Customer Feedback
              </span>

              <h2>
                {existingReview ? "Update Your " : "Share Your "}<span className="highlight-text">Experience</span>
              </h2>

              <p>
                {existingReview
                  ? "Your review is saved below. Edit your rating or comment and save your changes."
                  : "Your review helps other customers discover quality products and improve their shopping experience with ShopSmart."}
              </p>

            </div>

            <div className="review-form-card">

              <div className="customer-preview">

                <div className="customer-avatar">
                  {user?.firstName?.charAt(0)}
                </div>

                <div>
                  <h3>
                    {user.firstName} {user.lastName}
                  </h3>

                  <span>Verified Customer</span>
                </div>

              </div>

              <div className="review-rating-section">

                <label>
                  How would you rate your experience?
                </label>
                <div className="review-rating-stars">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={`star ${index < (hover || ratings) ? "filled" : "empty"
                        }`}
                      onClick={() => {
                        setRatings(index + 1);
                        setAddError(null);
                        setValidationError(null);
                      }}
                      onMouseEnter={() => setHover(index + 1)}
                      onMouseLeave={() => setHover(null)}
                    />
                  ))}
                </div>

              </div>

              <div className="review-comment-section">

                <label>
                  Tell us more about your experience
                </label>

                <textarea
                  value={comment}
                  placeholder="Share your thoughts about product quality, delivery experience, pricing, or customer service..."
                  onChange={(e) => {
                    setComment(e.target.value);
                    setAddError(null);
                    setValidationError(null);
                  }}
                />

              </div>

              {validationError && (
                <div className="review-error">
                  {validationError}
                </div>
              )}
              {addError && (
                <div className="review-error" role="alert">
                  {Array.isArray(addError) ? addError.join(", ") : addError}
                </div>
              )}

              <button
                className="submit-review-btn"
                onClick={addReviewsHandel}
              >
                {existingReview ? "Update Review" : "Submit Review"}
              </button>

            </div>

          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default AddReviews;