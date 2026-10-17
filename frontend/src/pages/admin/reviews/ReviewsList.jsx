import { useEffect } from "react";

import { FaTrash } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import {
  deleteReviewsAction,
  getAllAdminReviewsAction,
} from "../../../redux/actions/reviewsAction";

import Loader from "../../../components/Loader/Loader";

const ReviewsList = () => {
  const dispatch = useDispatch();
  const {
    loading,
    reviews,
    error: reviewsError,
  } = useSelector((state) => state.adminGetReviews);

  const {
    loading: deleteReviewLoading,
    error: deleteReviewError,
    success: deleteReviewSuccess,
  } = useSelector((state) => state.deleteReview);

  //Delete Review
  const deleteReview = (id) => {
    dispatch(deleteReviewsAction(id));
  };

  useEffect(() => {
    dispatch(getAllAdminReviewsAction());
  }, [deleteReviewSuccess, dispatch]);

  return (
    <>
      <div className="dashboard-container">
        {loading || deleteReviewLoading ? (
          <Loader
            LoadingName={
              deleteReviewLoading ? "Deleting Reviews" : "Fetching Reviews"
            }
          />
        ) : (
          <>
            <div className="dashboard-sub-heading">
              <h1>All Reviews</h1>
            </div>
            {(reviewsError || deleteReviewError) && (
              <p role="alert">{reviewsError || deleteReviewError}</p>
            )}
            <div className="products-table">
              <table>
                <thead>
                  <tr><th>Customer</th><th>Rating</th><th>Review</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {reviews?.map((review) => (
                    <tr key={review._id}>
                      <td><strong>{review.user ? `${review.user.firstName} ${review.user.lastName}` : "Deleted customer"}</strong></td>
                      <td><span className="admin-status admin-status--rating">{review.ratings} / 5</span></td>
                      <td className="admin-review-comment">{review.comment}</td>
                      <td className="admin-row-actions">
                        <button className="admin-icon-action admin-icon-action--danger" type="button" aria-label="Delete review" onClick={() => deleteReview(review._id)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ReviewsList;