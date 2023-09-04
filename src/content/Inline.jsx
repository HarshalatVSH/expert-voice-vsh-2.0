/* eslint-disable  */
import React, { useEffect, useState } from "react";

import { AnalyticEvent, CtaType, MessageType } from "../constants";
import { formatInteger, formatPrice, getInlineVariant, getProductUrls, getRoundedStar, isComparablePrice, sendAC } from "../helper";
import { ImageUrlBase , StarIcon } from "../constants";
/**
 * Main Inline Script - rendering inline best price label
 */
function Inline() {
  const [context, setContext] = useState(null);
  const [evIsCheaper, setEvIsCheaper] = useState(null);
  const [formattedBestPrice, setFormattedBestPrice] = useState(null);
  const [productUrls, setProductUrls] = useState({});
  const [user, setUser] = useState(null);
  const [variant, setVariant] = useState(null);

  const btnStyle = {
    alignItems: "center",
    display: "flex",
    height: "40px",
    lineHeight: "14px",
    padding: "0 18px 0 12px",
    width: "unset",
    background: "rgb(255, 26, 26)",
    color: "rgb(255, 255, 255)",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor : "pointer",
    border : "medium"
  };

  const inlineStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px 18px",
    margin: "18px 0px",
  };


  const reviewSummary = {
    height: "40px",
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    border: "none",
    color: "inherit",
    outline: "none",
    textDecoration: "none",
  };

  const averageStars = {
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: "24px",
    alignItems: "center",
    display: "inline-flex",
    marginRight: "8px",
  };

  const linkStyle = {
    lineHeight: "19px",
    fontWeight: 600,
    textDecoration: "underline",
    fontSize: "13px",
    fontWeight: 400,
    lineHeight: "18px",
    color: "rgb(77, 77, 77)",
  };

  
  const DiscountsBtn = {
    alignItems: 'center',
    display: 'flex',
    height: '40px',
    lineHeight: '14px',
    padding: '0px 18px 0px 12px',
    width: 'unset',
    background: "rgb(255, 26, 26)",
    color: 'rgb(255, 255, 255)',
    borderRadius: '3px',
    fontFamily: 'inherit',
    fontSize: '15px',
    fontWeight: 600,
    textAlign: 'center',
    outline: 'none',
    textDecoration: 'none',
    border: 'none',
    cursor : "pointer"
  };

  const ImageUrlBaseStyle = {
    marginRight: "12px",
    height : "20px",
    width : "20px"
  }

  const StarIconStyle = {
    marginRight: "4px",
    height : "25px",
    width : "20px"
  }
  
  useEffect(() => {
    // Bind the message listener to respond to the background worker
    const listener = (msg) => {
      if (msg.type === MessageType.DATA) {
        setContext(msg.context);
        setUser(msg.user);
        setVariant(getInlineVariant(msg.context, msg.user));

        const isCheaper = isComparablePrice(msg.context.product, msg.context.page);
        setEvIsCheaper(isCheaper);
        if (isCheaper) {
          setFormattedBestPrice(formatPrice(msg.context.product));
        }

        setProductUrls(getProductUrls(msg.context.product, "INLINE"));
      }
    };

    browser.runtime.onMessage.addListener(listener);
    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  }, [context]);

  const sendCtaClickEvent =
    (type = CtaType.PDP, source = "button") =>
    () => {
      sendAC(AnalyticEvent.INLINE_CTA_CLICK, {
        brand: context.brand || null,
        product: context.product || null,
        source,
        type,
        variant,
      });
    };

  const renderReviewSummary = () => {
    if (context.product.reviewCount) {
      const roundedStars = getRoundedStar(context.product.reviewStars);
      return (
        <a className="review-summary" style={reviewSummary} href={productUrls.reviews} onClick={sendCtaClickEvent(CtaType.PDP_REVIEWS, "review-summary")} rel="noopener noreferrer" target="_blank">
          <div className="average-stars type-title" style={averageStars}> 
            {/* <i className="exp-ux-starFilled exp-ux-small" /> */}
            <img src= {StarIcon} alt="" style={StarIconStyle}/>
            {roundedStars}
          </div>

          <div className="secondary-text small-text link" style={linkStyle}>{context.product.reviewCount > 1 ? `${formatInteger(context.product.reviewCount)} expert reviews` : "1 expert review"}</div>
        </a>
      );
    }
    if (user) {
      return (
        <a className="review-summary review-prompt" href={productUrls.reviewPrompt} onClick={sendCtaClickEvent(CtaType.PDP_REVIEW_PROMPT, "review-prompt")} rel="noopener noreferrer" target="_blank">
          <i className="exp-ux-starFilled exp-ux-small" />
          <span className="tertiary-text small-text link">Leave an expert review</span>
        </a>
      );
    }

    return null;
  };

  if (!context || !context.product) {
    return null;
  }
 
  return (
    <section id="inline" style={inlineStyle}>
      {!user ? (
        // Logged out state
        <button
          className="btn btn-primary"
          style={btnStyle}
          onClick={() => {
            sendCtaClickEvent(CtaType.LOGIN);
            browser.runtime.sendMessage({ type: MessageType.LOGIN_START });
          }}
          type="button"
        >
          {/* <i className="exp-ux-bolt exp-ux-small" /> */}
          <img src={ImageUrlBase} alt="" style={ImageUrlBaseStyle}/>
          Sign in for discounts
        </button>
      ) : evIsCheaper === false ? (
        // No savings available
        <a className="btn btn-gray" style={{ background: "red" }} href={productUrls.pdp} onClick={sendCtaClickEvent(CtaType.PDP)} rel="noopener noreferrer" target="_blank">
          <i className="exp-ux-bolt exp-ux-small" />
          No savings
        </a>
      ) : !context.product.inStock && context.product.accessConfirmed ? (
        // Product is out of stock on EV
        <a className="btn btn-gray" href={productUrls.pdp} onClick={sendCtaClickEvent(CtaType.PDP)} rel="noopener noreferrer" target="_blank">
          <i className="exp-ux-bolt exp-ux-small" />
          {evIsCheaper ? <span className="best-price-unavailable">{formattedBestPrice}</span> : null}
          Out of Stock
        </a>
      ) : (
        // EV offers some discount for product
        <a className="btn btn-primary" style={DiscountsBtn} href={productUrls.pdp} onClick={sendCtaClickEvent(CtaType.PDP)} rel="noopener noreferrer" target="_blank">
          <i className="exp-ux-bolt exp-ux-small" />
          {evIsCheaper ? `Buy for ${formattedBestPrice}` : context.brand.discount > 0 ? `Up to ${context.brand.discount}% off` : "Discounts Available"}
        </a>
      )}

      {renderReviewSummary()}
    </section>
  );
}

export default Inline;
