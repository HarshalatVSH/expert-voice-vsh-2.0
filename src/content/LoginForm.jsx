/* eslint-disable jsx-a11y/label-has-associated-control */
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
              <i className="exp-ux-chevron exp-ux-medium" />
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
            <i className="exp-ux-close exp-ux-small" />
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
