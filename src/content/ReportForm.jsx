/* eslint-disable */
import React, { useState } from "react";
import PropTypes from "prop-types";

import { AnalyticEvent, BackbtnIcon, ClosebtnIcon, SuccessbtnIcon } from "../constants";
import { sendAC } from "../helper";

/**
 * Report an Issue Form
 */
function ReportForm(props) {
  const [details, setDetails] = useState("");
  const [issue, setIssue] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const reportPopupStyles = {
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: "3px",
    boxShadow: "rgba(107, 101, 95, 0.2) 0px 1px 2px 1px",
    position: "fixed",
    right: "12px",
    top: "12px",
    width: "300px",
    zIndex: "2147483647",
  };

  const panelHeader = {
    borderBottom: submitted ? null : '1px solid rgb(227, 227, 227)' ,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
  };

  const btn = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    margin: '0px',
    outline: 'none',
    padding: '0px',
    textDecoration: 'none',
  };

  const backBtn = {
    marginRight: '6px',
    color: 'rgb(117, 117, 117)',
  };

  const backBtnStyle = {...btn,...backBtn}

  const panelTitle = {
    color: 'rgb(37, 37, 37)',
    fontWeight: 600,
    margin: '0px 6px',
  };

  const panelCloseDiv = {
    alignItems: 'center',
    display: 'flex',
    flex: '1 1 auto',
    justifyContent: 'flex-end',
  };

  const panelBody = {
    padding: "18px",
    textAlign: "center"
  }

  const formLabel = {
    display: 'block',
    fontWeight: 600,
    marginBottom: '6px',
  };

  const radioInput = {
    marginTop: '12px',
    alignItems: 'center',
    display: 'flex',
  };

  const inputField = {
    alignSelf: 'flex-start',
    flex: '0 0 auto',
    height: '18px',
    marginRight: '8px',
    width: '18px',
  };

  const radioInputLabel = {
    flex: '1 1 auto',
    fontWeight: 400,
    marginBottom: '0px',
  };

  const textAreaTitle = {
    display: 'block',
    fontWeight: 600,
    marginBottom: '6px',
  };

  const textAreaStyle = {
    background: 'rgb(255, 255, 255)',
    border: '1px solid rgb(227, 227, 227)',
    borderRadius: '3px',
    height: '90px',
    outline: 'none',
    padding: '4px 6px',
    resize: 'none',
    width: '100%',
  };

  const submitBtn = {
    borderRadius: '3px',
    display: 'block',
    fontFamily: 'inherit',
    fontSize: '15px',
    fontWeight: 600,
    padding: '12px',
    textAlign: 'center',
    width: '100%',
  };

  const submit = {
    background: !issue ? 'rgb(252, 191, 189)' : 'rgb(252, 69, 64)',
    cursor: !issue ? 'default' : 'pointer',
    color: "rgb(255, 255, 255)",
    border : "medium"
  };

  const submitBtnStyle = {...submitBtn,...submit}

  const reportSuccess = {
    paddingTop: '0px',
    padding: '18px',
    textAlign: 'center',
  };

  const confirmationTitle = {
    margin: '6px 0px 0px',
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '24px',
  };

  const secondaryText = {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: '18px',
    marginTop: '18px',
    color: 'rgb(77, 77, 77)',
  };

  const reportDone = {
    marginTop: '24px',
    background: 'rgb(255, 255, 255)',
    border: '1px solid rgb(117, 117, 117)',
    color: 'rgb(117, 117, 117)',
    cursor: 'pointer',
  };

  const reportDoneBtn = {...submitBtn , ...reportDone}

  const ClosebtnIconStyle = {
    height : "14px"
  }

  const BackbtnIconStyle = {
    height: "23px",
    position: "relative",
    top: "2px"
  }

  const SuccessbtnIconStyle = {
    height : "45px"
  }

  return (
    <section className="panel" id="popup" style={reportPopupStyles}>
      <header style={panelHeader} className={`panel-header${submitted ? " empty" : ""}`}>
        {submitted ? null : (
          <>
            <button
              className="btn-icon back-button"
              onClick={() => {
                props.onFinish();
              }}
              type="button"
              style={backBtnStyle}
            >
              {/* <i className="exp-ux-chevron exp-ux-medium" /> */}
              <img src={BackbtnIcon} alt="" style={BackbtnIconStyle}/>
            </button>
            <span className="title-text" style={panelTitle} >Report an issue</span>
          </>
        )}

        <div className="actions" style={panelCloseDiv}>
          <button className="btn-icon close-button" style={backBtnStyle} onClick={props.onClose} type="button">
            {/* <i className="exp-ux-close exp-ux-small" /> */}
            <img src={ClosebtnIcon} alt="" style={ClosebtnIconStyle}/>
          </button>
        </div>
      </header>

      {submitted ? (
        <main className="panel-body report-success" style={reportSuccess}>
          <div className="confirmation">
            {/* <i className="confirmation-icon exp-ux-check-circle exp-ux-xlarge" style={{fontsize: "48px"}}/> */}
            <img src={SuccessbtnIcon} alt="" style={SuccessbtnIconStyle}/>
            <h2 className="confirmation-title type-title" style={confirmationTitle}>Thank you</h2>
          </div>
          <p className="subtext secondary-text small-text" style={secondaryText}>Your issue has been submitted. Thank you for helping to make this extension better!</p>
          <button
            className="btn btn-outline btn-report-done"
            onClick={() => {
              props.onFinish();
            }}
            type="button"
            style={reportDoneBtn}
          >
            Done
          </button>
        </main>
      ) : (
        <main className="panel-body" style={panelBody}>
          <form
            className="report-form"
            style={{textAlign : "left"}}
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitted(true);

              sendAC(AnalyticEvent.REPORT, {
                details,
                issue,
              });
            }}
          >
            <div className="form-control radio-group" style={{ marginBottom: "24px" }}>
              <label style={formLabel} htmlFor="issue">What is the issue you&apos;re seeing?</label>

              <div className="radio-input" style={radioInput}>
                <input
                  checked={issue === "product_mismatch"}
                  id="issue-product-mismatch"
                  name="issue"
                  onChange={(e) => {
                    setIssue(e.currentTarget.value);
                  }}
                  type="radio"
                  value="product_mismatch"
                  style={inputField}
                />
                <label style={radioInputLabel} htmlFor="issue-product-mismatch">Wrong product detected</label>
              </div>
              <div className="radio-input" style={radioInput}>
                <input
                  checked={issue === "brand_mismatch"}
                  id="issue-brand-mismatch"
                  name="issue"
                  onChange={(e) => {
                    setIssue(e.currentTarget.value);
                  }}
                  type="radio"
                  value="brand_mismatch"
                  style={inputField}
                />
                <label style={radioInputLabel} htmlFor="issue-brand-mismatch">Wrong brand detected</label>
              </div>
              <div className="radio-input" style={radioInput}>
                <input
                  checked={issue === "undetected"}
                  id="issue-undetected"
                  name="issue"
                  onChange={(e) => {
                    setIssue(e.currentTarget.value);
                  }}
                  type="radio"
                  value="undetected"
                  style={inputField}
                />
                <label style={radioInputLabel} htmlFor="issue-undetected">No match detected</label>
              </div>
              <div className="radio-input" style={radioInput}>
                <input
                  checked={issue === "status"}
                  id="issue-status"
                  name="issue"
                  onChange={(e) => {
                    setIssue(e.currentTarget.value);
                  }}
                  type="radio"
                  value="status"
                  style={inputField}
                />
                <label style={radioInputLabel} htmlFor="issue-status">Wrong status or access level listed</label>
              </div>
              <div className="radio-input" style={radioInput}>
                <input
                  checked={issue === "other"}
                  id="issue-other"
                  name="issue"
                  onChange={(e) => {
                    setIssue(e.currentTarget.value);
                  }}
                  type="radio"
                  value="other"
                  style={inputField}
                />
                <label style={radioInputLabel} htmlFor="issue-other">Other</label>
              </div>
            </div>

            <div className="form-control" style={{ marginBottom: "24px" }}>
              <label style={textAreaTitle} htmlFor="details">Include any additional details</label>
              <textarea
                id="details"
                name="details"
                onChange={(e) => {
                  setDetails(e.currentTarget.value);
                }}
                value={details}
                style={textAreaStyle}
              />
            </div>

            <button className="btn btn-primary btn-report-submit" style={submitBtnStyle} disabled={!issue} type="submit">
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
