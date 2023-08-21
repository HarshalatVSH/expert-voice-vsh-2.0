/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';

import { AnalyticEvent, CtaType, MessageType } from '../constants';
import {
  formatInteger,
  formatPrice,
  getInlineVariant,
  getProductUrls,
  getRoundedStar,
  isComparablePrice,
  sendAC,
} from '../helper';

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

        setProductUrls(getProductUrls(msg.context.product, 'INLINE'));
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, [context]);

  const sendCtaClickEvent = (type = CtaType.PDP, source = 'button') => () => {
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
        <a
          className="review-summary"
          href={productUrls.reviews}
          onClick={sendCtaClickEvent(CtaType.PDP_REVIEWS, 'review-summary')}
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="average-stars type-title">
            <i className="exp-ux-starFilled exp-ux-small" />
            {roundedStars}
          </div>

          <div className="secondary-text small-text link">
            {context.product.reviewCount > 1
              ? `${formatInteger(context.product.reviewCount)} expert reviews`
              : '1 expert review'}
          </div>
        </a>
      );
    }
    if (user) {
      return (
        <a
          className="review-summary review-prompt"
          href={productUrls.reviewPrompt}
          onClick={sendCtaClickEvent(CtaType.PDP_REVIEW_PROMPT, 'review-prompt')}
          rel="noopener noreferrer"
          target="_blank"
        >
          <i className="exp-ux-starFilled exp-ux-small" />
          <span className="tertiary-text small-text link">
            Leave an expert review
          </span>
        </a>
      );
    }

    return null;
  };

  if (!context || !context.product) {
    return null;
  }

  return (
    <section id="inline">
      {!user ? (
        // Logged out state
        <button
          className="btn btn-primary"
          onClick={() => {
            sendCtaClickEvent(CtaType.LOGIN);
            chrome.runtime.sendMessage({ type: MessageType.LOGIN_START });
          }}
          type="button"
        >
          <i className="exp-ux-bolt exp-ux-small" />
          Sign in for discounts
        </button>
      ) : (
        evIsCheaper === false ? (
          // No savings available
          <a
            className="btn btn-gray"
            href={productUrls.pdp}
            onClick={sendCtaClickEvent(CtaType.PDP)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <i className="exp-ux-bolt exp-ux-small" />
            No savings
          </a>
        ) : (
          !context.product.inStock && context.product.accessConfirmed ? (
            // Product is out of stock on EV
            <a
              className="btn btn-gray"
              href={productUrls.pdp}
              onClick={sendCtaClickEvent(CtaType.PDP)}
              rel="noopener noreferrer"
              target="_blank"
            >
              <i className="exp-ux-bolt exp-ux-small" />
              {evIsCheaper ? (
                <span className="best-price-unavailable">{`${formattedBestPrice}`}</span>
              ) : null}
              Out of Stock
            </a>
          ) : (
            // EV offers some discount for product
            <a
              className="btn btn-primary"
              href={productUrls.pdp}
              onClick={sendCtaClickEvent(CtaType.PDP)}
              rel="noopener noreferrer"
              target="_blank"
            >
              <i className="exp-ux-bolt exp-ux-small" />
              {evIsCheaper
                ? `Buy for ${formattedBestPrice}`
                : context.brand.discount > 0
                  ? `Up to ${context.brand.discount}% off`
                  : 'Discounts Available'}
            </a>
          )
        )
      )}

      {renderReviewSummary()}
    </section>
  );
}

export default Inline;
