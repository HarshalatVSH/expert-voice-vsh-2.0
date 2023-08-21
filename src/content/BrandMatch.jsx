/* eslint-disable no-nested-ternary,react/jsx-no-useless-fragment */
import React from 'react';
import PropTypes from 'prop-types';

import { CtaType } from '../constants';
import { getBrandUrls, getEVBrandsUrl } from '../helper';

function BrandMatch(props) {
  const brandUrls = getBrandUrls(props.brand);
  let cta = brandUrls.brand;
  let ctaType = CtaType.BRAND;
  if (props.brand.active && props.brand.rewarded && props.user) {
    cta = brandUrls.plp;
    ctaType = CtaType.BRAND_PLP;
  }

  return (
    <>
      <div className="match-details">
        {props.brand.avatar ? (
          <a
            href={cta}
            onClick={props.sendCtaClickEvent(ctaType, 'image')}
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              alt={props.brand.name}
              className="match-image"
              src={`${props.brand.avatar}${props.brand.avatar.includes('?') ? '&' : '?'}s=96x96`}
              style={{ height: '48px', width: '48px' }}
            />
          </a>
        ) : null}
        <h1 className="type-title match-name">
          <a
            href={cta}
            onClick={props.sendCtaClickEvent(ctaType, 'name')}
            rel="noopener noreferrer"
            target="_blank"
          >
            {props.brand.name}
          </a>
        </h1>
      </div>

      {props.brand.active && props.brand.targeted && props.user ? (
        // The brand is active and the user is authenticated
        <>
          {props.brand?.rewarded ? (
            // The brand is active and targeting the user with stores
            <>
              <div className="status-indicator">
                <a
                  className="pill pill-success"
                  href={cta}
                  onClick={props.sendCtaClickEvent(ctaType, 'pill')}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {props.brand.discount > 0
                    ? `Up to ${props.brand.discount}% off`
                    : 'Discounts Available'}
                </a>
              </div>
              <p className="subtext secondary-text small-text">
                Don&apos;t miss out on exclusive discounts from <span className="brand-name">{props.brand.name}</span> on ExpertVoice.
              </p>
              <a
                className="btn btn-primary brand-link"
                href={cta}
                onClick={props.sendCtaClickEvent(ctaType)}
                rel="noopener noreferrer"
                target="_blank"
              >
                View discounts
              </a>
            </>
          ) : (
            // The brand is active and the user is targeted, but not for stores
            <>
              <div className="status-indicator">
                <a
                  className="pill pill-secondary"
                  href={cta}
                  onClick={props.sendCtaClickEvent(ctaType, 'pill')}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Insider Access
                </a>
              </div>
              <p className="subtext secondary-text small-text">
                You have exclusive access to content from <span className="brand-name">{props.brand.name}</span> that may include opportunities to preview or sample new products, provide feedback to their team, and much more.
              </p>
              <a
                className="btn btn-primary brand-link"
                href={cta}
                onClick={props.sendCtaClickEvent(ctaType)}
                rel="noopener noreferrer"
                target="_blank"
              >
                View all offers
              </a>
            </>
          )}
        </>
      ) : props.brand.active && !props.user ? (
        // The active brand was found but the user is not logged in
        <>
          <div className="status-indicator">
            <a
              className="pill pill-success"
              href={cta}
              onClick={props.sendCtaClickEvent(ctaType, 'pill')}
              rel="noopener noreferrer"
              target="_blank"
            >
              Found on ExpertVoice
            </a>
          </div>
          <p className="subtext secondary-text small-text">
            Sign in to find out if you qualify for
            discounts, education, or other exclusive offers.
          </p>
        </>
      ) : (
        // The brand was found, but it's either inactive or not targeting the user
        <>
          <div className="status-indicator">
            <span className="pill pill-outline">Not Available</span>
          </div>

          {props.user ? (
            <>
              <p className="subtext secondary-text small-text">
                <span className="brand-name">{props.brand.name}</span> is not available to you on ExpertVoice.
              </p>
              <a
                className="btn btn-outline brand-link"
                href={getEVBrandsUrl()}
                onClick={props.sendCtaClickEvent(CtaType.EV_BRANDS)}
                rel="noopener noreferrer"
                target="_blank"
              >
                View brands I have access to
              </a>
            </>
          ) : (
            <p className="subtext secondary-text small-text">
              <span className="brand-name">{props.brand.name}</span> is not available on ExpertVoice.
              Sign in to see the brands you have access to.
            </p>
          )}
        </>
      )}
    </>
  );
}

BrandMatch.defaultProps = {
  user: null,
};

BrandMatch.propTypes = {
  brand: PropTypes.shape({
    active: PropTypes.bool,
    avatar: PropTypes.string,
    discount: PropTypes.number,
    name: PropTypes.string.isRequired,
    orgId: PropTypes.number.isRequired,
    rewarded: PropTypes.bool,
    targeted: PropTypes.bool,
    url: PropTypes.string.isRequired,
  }).isRequired,
  sendCtaClickEvent: PropTypes.func.isRequired,
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }),
};

export default BrandMatch;
