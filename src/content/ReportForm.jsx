/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { AnalyticEvent } from '../constants';
import { sendAC } from '../helper';

/**
 * Report an Issue Form
 */
function ReportForm(props) {
  const [details, setDetails] = useState('');
  const [issue, setIssue] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="panel" id="popup">
      <header className={`panel-header${submitted ? ' empty' : ''}`}>
        {submitted ? null : (
          <>
            <button
              className="btn-icon back-button"
              onClick={() => {
                props.onFinish();
              }}
              type="button"
            >
              <i className="exp-ux-chevron exp-ux-medium" />
            </button>
            <span className="title-text">Report an issue</span>
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

      {submitted ? (
        <main className="panel-body report-success">
          <div className="confirmation">
            <i className="confirmation-icon exp-ux-check-circle exp-ux-xlarge" />
            <h2 className="confirmation-title type-title">Thank you</h2>
          </div>
          <p className="subtext secondary-text small-text">
            Your issue has been submitted. Thank you for helping to make this extension better!
          </p>
          <button
            className="btn btn-outline btn-report-done"
            onClick={() => {
              props.onFinish();
            }}
            type="button"
          >
            Done
          </button>
        </main>
      ) : (
        <main className="panel-body">
          <form
            className="report-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitted(true);

              sendAC(AnalyticEvent.REPORT, {
                details,
                issue,
              });
            }}
          >
            <div className="form-control radio-group">
              <label htmlFor="issue">What is the issue you&apos;re seeing?</label>

              <div className="radio-input">
                <input
                  checked={issue === 'product_mismatch'}
                  id="issue-product-mismatch"
                  name="issue"
                  onChange={(e) => {
                    setIssue(e.currentTarget.value);
                  }}
                  type="radio"
                  value="product_mismatch"
                />
                <label htmlFor="issue-product-mismatch">Wrong product detected</label>
              </div>
              <div className="radio-input">
                <input
                  checked={issue === 'brand_mismatch'}
                  id="issue-brand-mismatch"
                  name="issue"
                  onChange={(e) => {
                    setIssue(e.currentTarget.value);
                  }}
                  type="radio"
                  value="brand_mismatch"
                />
                <label htmlFor="issue-brand-mismatch">Wrong brand detected</label>
              </div>
              <div className="radio-input">
                <input
                  checked={issue === 'undetected'}
                  id="issue-undetected"
                  name="issue"
                  onChange={(e) => {
                    setIssue(e.currentTarget.value);
                  }}
                  type="radio"
                  value="undetected"
                />
                <label htmlFor="issue-undetected">No match detected</label>
              </div>
              <div className="radio-input">
                <input
                  checked={issue === 'status'}
                  id="issue-status"
                  name="issue"
                  onChange={(e) => {
                    setIssue(e.currentTarget.value);
                  }}
                  type="radio"
                  value="status"
                />
                <label htmlFor="issue-status">Wrong status or access level listed</label>
              </div>
              <div className="radio-input">
                <input
                  checked={issue === 'other'}
                  id="issue-other"
                  name="issue"
                  onChange={(e) => {
                    setIssue(e.currentTarget.value);
                  }}
                  type="radio"
                  value="other"
                />
                <label htmlFor="issue-other">Other</label>
              </div>
            </div>

            <div className="form-control">
              <label htmlFor="details">Include any additional details</label>
              <textarea
                id="details"
                name="details"
                onChange={(e) => {
                  setDetails(e.currentTarget.value);
                }}
                value={details}
              />
            </div>

            <button
              className="btn btn-primary btn-report-submit"
              disabled={!issue}
              type="submit"
            >
              Submit
            </button>
          </form>
        </main>
      )}
    </section>
  );
}

ReportForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
};

export default ReportForm;
