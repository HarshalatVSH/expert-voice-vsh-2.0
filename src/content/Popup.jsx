/* eslint-disable no-nested-ternary,react/jsx-no-useless-fragment */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import BrandMatch from './BrandMatch';
import LoginForm from './LoginForm';
import ReportForm from './ReportForm';
import ProductMatch from './ProductMatch';

import {
  AnalyticEvent,
  CtaType,
  MessageType,
  NotificationType,
  PopupMode,
} from '../constants';
import { getEVHomeUrl, sendAC } from '../helper';

/**
 * EV Shop Extension Popup
 */
function Popup(props) {
  const [mode, setMode] = useState(props.mode);

  useEffect(() => {
    // Bind the message listener to respond to the background worker
    const listener = (msg) => {
      if (msg.type === MessageType.LOGIN_SHOW) {
        setMode(PopupMode.LOGIN);
        return false;
      }
      return true;
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  });

  if (mode === PopupMode.LOGIN) {
    return (
      <LoginForm
        onCancel={() => setMode(null)}
        onClose={props.onClose}
        onLogin={async (u) => {
          await props.onLogin(u);
          setMode(null);
        }}
      />
    );
  }

  if (mode === PopupMode.REPORT) {
    return (
      <ReportForm
        onClose={props.onClose}
        onFinish={() => setMode(null)}
      />
    );
  }

  const sendCtaClickEvent = (type = CtaType.BRAND, source = 'button') => () => {
    sendAC(AnalyticEvent.CTA_CLICK, {
      brand: props.brand || null,
      product: props.product || null,
      source,
      type,
    });
  };

  return (
    <section className="panel" id="popup">
      <header className="panel-header">
        <i className="exp-ux-bolt exp-ux-small ev-logo" />
        <span className="title-text">Tips</span>
        {props.notification ? (
          <div className={`badge badge-${props.notification === NotificationType.ACTIVE ? 'success' : 'secondary'}`}>1</div>
        ) : null}

        <div className="actions">
          <button
            className="btn-icon close-button"
            onClick={props.onClose}
            type="button"
          >
            <i className="exp-ux-close exp-ux-small" />
          </button>
        </div>
      </header>

      <main className="panel-body">
        {props.product && props.brand?.active ? (
          <ProductMatch
            brand={props.brand}
            notification={props.notification}
            product={props.product}
            page={props.page}
            sendCtaClickEvent={sendCtaClickEvent}
            user={props.user}
          />
        ) : (
          props.brand ? (
            <BrandMatch
              brand={props.brand}
              sendCtaClickEvent={sendCtaClickEvent}
              user={props.user}
            />
          ) : (
            <>
              <h1 className="type-title">No tips for this page</h1>
              <p className="subtext tertiary-text small-text">
                As you browse Amazon.com, we&apos;ll automatically look for
                brands that may offer you exclusive discounts on ExpertVoice.
              </p>
              <div className="sample-panel">
                <img
                  alt="Example"
                  className="sample-image"
                  src={chrome.runtime.getURL('assets/images/preview.png')}
                />
                <p className="small-text">An alert will let you know when there may be a relevant offer on ExpertVoice.</p>
              </div>
            </>
          )
        )}

        <div className="learn-more">
          {props.user ? (
            <p className="tertiary-text small-text">
              Signed in as {props.user.firstName} {props.user.lastName}.
              <button
                className="btn-logout link tertiary-text small-text"
                onClick={props.onLogout}
                type="button"
              >
                Sign out
              </button>
            </p>
          ) : (
            <>
              {!props.brand ? (
                <p className="tertiary-text small-text">
                  Sign in to ExpertVoice to get more accurate tips.
                </p>
              ) : null}
              <button
                className="btn btn-primary btn-login"
                onClick={() => {
                  setMode(PopupMode.LOGIN);
                }}
                type="button"
              >
                Sign in
              </button>
              <p className="tertiary-text small-text">
                Learn more about
                <> </>
                <a
                  className="link"
                  href={getEVHomeUrl()}
                  onClick={sendCtaClickEvent(CtaType.EV_HOME, 'learn')}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  ExpertVoice
                </a>
              </p>
            </>
          )}
        </div>

        <p className="report-issue tertiary-text small-text">
          Does something look wrong?
          <button
            className="btn-report link tertiary-text small-text"
            onClick={() => {
              setMode(PopupMode.REPORT);
            }}
            type="button"
          >
            Report an issue
          </button>
        </p>
      </main>
    </section>
  );
}

Popup.defaultProps = {
  brand: null,
  mode: null,
  notification: null,
  page: {},
  product: null,
  user: null,
};

Popup.propTypes = {
  brand: PropTypes.shape({
    active: PropTypes.bool,
    avatar: PropTypes.string,
    discount: PropTypes.number,
    name: PropTypes.string.isRequired,
    orgId: PropTypes.number.isRequired,
    rewarded: PropTypes.bool,
    targeted: PropTypes.bool,
    url: PropTypes.string.isRequired,
  }),
  mode: PropTypes.string,
  notification: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  page: PropTypes.shape({
    price: PropTypes.string,
  }),
  product: PropTypes.shape({
    accessConfirmed: PropTypes.bool,
    name: PropTypes.string.isRequired,
  }),
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }),
};

export default Popup;
