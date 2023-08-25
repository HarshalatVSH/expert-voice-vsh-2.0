/* eslint-disable  */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { AnalyticEvent, MessageType } from '../constants';
import { sendAC } from '../helper';
import { ErrorAlert } from '../components/Alert';

const Errors = {
  'signIn.invalid': 'Oops. this account information was not recognized.',
  'signIn.locked': 'Looks like it\'s time to change your password. Give it a quick update and try logging in again.',
  'signIn.unauthorized': 'Uh oh, the account information you entered is incorrect.',
  'signIn.restricted': 'Uh oh, looks like your access to ExpertVoice has been disabled. Contact your store manager or HR department to find out why.',
  'signIn.serviceError': 'Sorry, we can\'t log you in right now. Please come back in a few minutes and try again.',
};

/**
 * Login Form
 */
function LoginForm(props) {
  const [error, setError] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [interactions, setInteractions] = useState({});
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <section className="panel" id="popup">
      <header className="panel-header">
        {submitting ? null : (
          <>
            <button
              className="btn-icon back-button"
              onClick={() => {
                props.onCancel();
              }}
              type="button"
            >
              {/* <i className="exp-ux-chevron exp-ux-medium" /> */}             
              {/* <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 384 512"  style={{marginRight:"7px" , position : "relative" , bottom:"-2px" , color:'#aeb0b2' }}><path d="M380.6 81.7c7.9 15.8 1.5 35-14.3 42.9L103.6 256 366.3 387.4c15.8 7.9 22.2 27.1 14.3 42.9s-27.1 22.2-42.9 14.3l-320-160C6.8 279.2 0 268.1 0 256s6.8-23.2 17.7-28.6l320-160c15.8-7.9 35-1.5 42.9 14.3z"/></svg> */}
              <img src="https://icons.veryicon.com/png/o/miscellaneous/commonly-used-icon-1/angle-bracket-left.png"  style={{height:"18px" }} alt="" />
            </button>
            <span className="title-text">Sign into ExpertVoice</span>
          </>
        )}

        <div className="actions">
          <button
            className="btn-icon close-button"
            onClick={props.onClose}
            type="button"
          >
            {/* <i className="exp-ux-close exp-ux-small" /> */}
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEgMTFMMTEgMU0xIDFMMTEgMTEiIHN0cm9rZT0iIzM1M0Y1QSIgc3Ryb2tlTGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg=="  style={{height:"18px" , transform: 'rotate(180deg)'}} alt="" />
            {/* <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 0 384 512" style={{ position : "relative" , bottom:"-2px" , color:'#aeb0b2' }}><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg> */}
          </button>
        </div>
      </header>
      <main className="panel-body">
        <form
          className="login-form exp-form"
          onSubmit={async (e) => {
            e.preventDefault();

            setError(null);
            setSubmitting(true);

            const res = await chrome.runtime
              .sendMessage({ identifier, password, type: MessageType.LOGIN });
            setSubmitting(false);

            if (res?.error) {
              setError(res.error);
              sendAC(AnalyticEvent.LOGIN_ERROR, { error: res.error });
            } else {
              props.onLogin(res.user);
              sendAC(AnalyticEvent.LOGIN);
            }
          }}
        >
          {error ? (
            <ErrorAlert className="form-error">
              {Errors[error] || 'Oops. Something went wrong. Please try again.'}
            </ErrorAlert>
          ) : null}

          <div className="form-control">
            <input
              autoCapitalize="off"
              autoCorrect="off"
              id="identifier"
              name="identifier"
              onBlur={() => {
                setInteractions({ ...interactions, identifier: true });
              }}
              onChange={(e) => {
                setIdentifier(e.currentTarget.value);
              }}
              placeholder="Email or Username"
              type="text"
              value={identifier}
            />
            <label htmlFor="identifier">Email or Username</label>

            {!identifier && interactions.identifier ? (
              <div className="form-helper guidance warning">
                You must provide an email or username to sign in.
              </div>
            ) : null}
          </div>
          <div className="form-control">
            <input
              id="password"
              name="password"
              onBlur={() => {
                setInteractions({ ...interactions, password: true });
              }}
              onChange={(e) => {
                setPassword(e.currentTarget.value);
              }}
              placeholder="Password"
              type="password"
              value={password}
            />
            <label htmlFor="password">Password</label>

            {!password && interactions.password ? (
              <div className="form-helper guidance warning">
                You must provide your password to sign in.
              </div>
            ) : null}
          </div>

          <button
            className="btn btn-primary btn-report-submit"
            disabled={!identifier || !password}
            type="submit"
          >
            Sign in
          </button>

          <p className="subtext tertiary-text small-text">
            Don&apos;t have an account?
            <a
              className="sign-up-link link"
              href="https://www.expertvoice.com/?onb_autoShow=true"
              onClick={() => {
                sendAC(AnalyticEvent.SIGN_UP);
              }}
            >
              Sign up
            </a>
          </p>
        </form>
      </main>
    </section>
  );
}

LoginForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};

export default LoginForm;
