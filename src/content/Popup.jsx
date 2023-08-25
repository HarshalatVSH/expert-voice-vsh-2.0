/* eslint-disable  */
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
        {/* <i className="exp-ux-bolt exp-ux-small ev-logo" /> */}
        {/* <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg> */}
        <img src="https://play-lh.googleusercontent.com/dauWPe0lEtHUHijd9tNm6IRsAyG3s6OsmC2COaE0LvlyFBrtpYsU3QuSFPgHEt6dqobX=w240-h480-rw" style={{height : "20px"}} alt="" />
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
            {/* <i className="exp-ux-close exp-ux-small" /> */}
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEgMTFMMTEgMU0xIDFMMTEgMTEiIHN0cm9rZT0iIzM1M0Y1QSIgc3Ryb2tlTGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg=="  style={{height:"18px"}} alt="" />
            {/* <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 0 384 512" color='#aeb0b2' style={{position : "relative" , bottom : "-2px"}}><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg> */}
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
