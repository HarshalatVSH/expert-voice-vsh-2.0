/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";

import { CtaType } from "../constants";
import { formatInteger, formatPrice, formatProductName, getBrandUrls, getProductUrls, getRoundedStar, isComparablePrice } from "../helper";

function ProductMatch(props) {
  const brandUrls = getBrandUrls(props.brand);
  const productUrls = getProductUrls(props.product);

  const evIsCheaper = isComparablePrice(props.product, props.page);
  const formattedBestPrice = evIsCheaper ? formatPrice(props.product) : null;

  const productName = formatProductName(props.product.name);


  const titleStyle = {
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: "24px",
    margin: "0px",
  };

  const headerAnchorStyle = {
    border: "none",
    color: "inherit",
    outline: "none",
    textDecoration: "none",
  };

  const pillAnchorStyles = {
    borderRadius: "30px",
    fontWeight: 600,
    padding: "3px 16px",
    backgroundColor: "rgb(82, 179, 130)",
  };

  const combinedStyles = { ...headerAnchorStyle, ...pillAnchorStyles };

  const matchDetailsStyles = {
    alignItems: "center",
    display: "flex",
    flexFlow: "column",
    marginBottom: "18px",
  };

  const reviewSummaryStyles = {
    marginTop: "18px",
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
  };
  
  const averageStarsStyles = {
    alignItems: "center",
    display: "inline-flex",
    marginRight: "8px",
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: "24px",
    textDecoration: "none",
    color : "black"
  };

  const smallTextStyles = {
    lineHeight: "19px",
    textDecoration: "underline",
    fontSize: "13px",
    fontWeight: 400,
    color: "rgb(117, 117, 117)",
  };

  const subtextStyles = {
    marginTop: "18px",
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: "18px",
    color: "rgb(77, 77, 77)",
  };

  const pillsSuccessStyle = {
    borderRadius: '30px',
    fontWeight: 600,
    padding: '3px 16px',
    backgroundColor: 'rgb(82, 179, 130)',
    color : "black",
    textDecoration : "none"
  };

  const productLink = {
    background: "rgb(255, 26, 26)",
    color: "rgb(255, 255, 255)",
    textDecoration : "none",
    margin: '18px 0px',
    borderRadius: '3px',
    display: 'block',
    fontFamily: 'inherit',
    fontSize: '15px',
    fontWeight: 600,
    padding: '12px',
    textAlign: 'center',
    width: '90%',
  };

  const unlockTextStyle = {
    color: "rgb(117, 117, 117)",
    fontSize: "12px"
  }

  const renderReviewSummary = () => {
    if (!props.product.reviewCount) return null;

    const roundedStars = getRoundedStar(props.product.reviewStars);
    return (
      <div className="review-summary" style={reviewSummaryStyles}>
        <a className="average-stars type-title" style={averageStarsStyles} href={productUrls.reviews} onClick={props.sendCtaClickEvent(CtaType.PDP_REVIEWS, "review-stars")} rel="noopener noreferrer" target="_blank">
          <i className="exp-ux-starFilled exp-ux-small" />
          {roundedStars}
        </a>
        <a className="tertiary-text small-text link" style={smallTextStyles} href={productUrls.reviews} onClick={props.sendCtaClickEvent(CtaType.PDP_REVIEWS, "review-count")} rel="noopener noreferrer" target="_blank">
          {props.product.reviewCount > 1 ? `${formatInteger(props.product.reviewCount)} reviews` : "1 review"}
        </a>
      </div>
    );
  };


  return (
    <>
      <div className="match-details" style={matchDetailsStyles}>
        {props.product.imageUrl ? (
          <a href={productUrls.pdp} onClick={props.sendCtaClickEvent(CtaType.PDP, "image")} rel="noopener noreferrer" target="_blank">
            <img alt={props.product.name} className="match-image" src={props.product.imageUrl} style={{ height: "48px", width: "48px" }} />
          </a>
        ) : null}
        <h1 className="type-title match-name" style={titleStyle}>
          <a href={productUrls.pdp} style={headerAnchorStyle} onClick={props.sendCtaClickEvent(CtaType.PDP, "name")} rel="noopener noreferrer" target="_blank">
            {props.brand.name} - {productName}
          </a>
        </h1>
      </div>

      <>
        {!props.user ? (
          // Logged out state
          <>
            <div className="status-indicator">
              <a className="pill pill-success" style={combinedStyles} href={productUrls.pdp} onClick={props.sendCtaClickEvent(CtaType.PDP, "pill")} rel="noopener noreferrer" target="_blank">
                Found on ExpertVoice
              </a>
            </div>

            {renderReviewSummary()}

            <p className="subtext secondary-text small-text" style={subtextStyles}>Sign in to find out if you qualify for discounts.</p>
          </>
        ) : evIsCheaper === false ? (
          // No savings available
          <>
            <div className="status-indicator">
              <a className="pill pill-secondary" style={pillAnchorStyles} href={productUrls.pdp} onClick={props.sendCtaClickEvent(CtaType.PDP, "pill")} rel="noopener noreferrer" target="_blank">
                No savings
              </a>
            </div>

            {renderReviewSummary()}

            <p className="subtext secondary-text small-text">No savings for this item, but you may qualify for great discounts on similar products.</p>
            <a className="btn btn-primary product-link" href={productUrls.pdp} onClick={props.sendCtaClickEvent(CtaType.PDP)} rel="noopener noreferrer" target="_blank">
              View on ExpertVoice
            </a>
          </>
        ) : !props.product.inStock && props.product.accessConfirmed ? (
          // Product is out of stock on EV
          <>
            <div className="status-indicator">
              <a className="pill pill-secondary" href={productUrls.pdp} onClick={props.sendCtaClickEvent(CtaType.PDP, "pill")} rel="noopener noreferrer" target="_blank">
                {evIsCheaper ? <span className="best-price-unavailable">{formattedBestPrice}</span> : null}
                Out of Stock
              </a>
            </div>

            {renderReviewSummary()}

            <p className="subtext secondary-text small-text">Visit ExpertVoice to view details and sign up to get notified when it’s back in stock.</p>
            <a className="btn btn-outline product-link" href={productUrls.pdp} onClick={props.sendCtaClickEvent(CtaType.PDP)} rel="noopener noreferrer" target="_blank">
              View on ExpertVoice
            </a>

            <p className="subtext secondary-text small-text">
              {props.brand.discount > 0 ? (
                <>
                  Save up to <strong>{props.brand.discount}% off</strong>
                </>
              ) : (
                "Discounts available"
              )}{" "}
              on other products
            </p>
            <a className="btn btn-primary brand-products-link" href={brandUrls.plp} onClick={props.sendCtaClickEvent(CtaType.BRAND_PLP)} rel="noopener noreferrer" target="_blank">
              Shop more {props.brand.name}
            </a>
          </>
        ) : evIsCheaper ? (
          // EV offers lower or equal price
          <>
            <div className="status-indicator">
              <a className="pill pill-success" href={productUrls.pdp} onClick={props.sendCtaClickEvent(CtaType.PDP, "pill")} rel="noopener noreferrer" target="_blank">
                {`Lowest price ${formattedBestPrice}`}
              </a>
            </div>

            {renderReviewSummary()}

            <p className="subtext secondary-text small-text">Don’t miss out on your expert discount.</p>
            <a className="btn btn-primary product-link" href={productUrls.pdp} onClick={props.sendCtaClickEvent(CtaType.PDP)} rel="noopener noreferrer" target="_blank">
              Buy on ExpertVoice
            </a>
          </>
        ) : (
          // EV offers discount but price unknown
          <>
            <div className="status-indicator">
              <a className="pill pill-success" style={pillsSuccessStyle} href={productUrls.pdp} onClick={props.sendCtaClickEvent(CtaType.PDP, "pill")} rel="noopener noreferrer" target="_blank">
                {props.brand.discount > 0 ? `Up to ${props.brand.discount}% off` : "Discounts Available"}
              </a>
            </div>

            {renderReviewSummary()}

            <p className="subtext secondary-text small-text" style={unlockTextStyle}>Unlock your discounted price on ExpertVoice.</p>
            <a className="btn btn-primary product-link" style={productLink} href={productUrls.pdp} onClick={props.sendCtaClickEvent(CtaType.PDP)} rel="noopener noreferrer" target="_blank">
              View on ExpertVoice
            </a>
          </>
        )}
      </>
    </>
  );
}

ProductMatch.defaultProps = {
  user: null,
};

ProductMatch.propTypes = {
  brand: PropTypes.shape({
    discount: PropTypes.number,
    name: PropTypes.string.isRequired,
    orgId: PropTypes.number.isRequired,
  }).isRequired,
  page: PropTypes.shape({
    price: PropTypes.string,
  }).isRequired,
  product: PropTypes.shape({
    accessConfirmed: PropTypes.bool,
    bestPrice: PropTypes.number,
    imageUrl: PropTypes.string,
    inStock: PropTypes.bool,
    name: PropTypes.string.isRequired,
    pdpUrl: PropTypes.string,
    reviewCount: PropTypes.number,
    reviewStars: PropTypes.number,
  }).isRequired,
  sendCtaClickEvent: PropTypes.func.isRequired,
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }),
};

export default ProductMatch;
