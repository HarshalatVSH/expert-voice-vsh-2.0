/* eslint-disable  */
import React from 'react';
import PropTypes from 'prop-types';

import './Alert.less';
import { ClosebtnIcon } from '../constants';

/**
 * Alert Component
 *
 * @author jon.morris
 */

const alertStyle = {
  alignItems: "center",
  borderRadius: "3px",
  display: "flex",
  padding: "10px 12px"
}

const alertbeforeStyle = {
  alignItems: "center",
  color: "white",
  display: "flex",
  flex: "0 0 auto",
  justifyContent: "center"
}

const alertContentStyle = {
  flex: "1 1 auto",
  fontWeight: "bold"
}

const alertAfterStyle = {
  marginLeft: "12px"
}

const buttonStyle = {
  color: "rgb(117, 117, 117)",
  background: "none",
  border: "medium"
}

function Alert(props) {
  const ClosebtnIconStyle = {
    height: "14px"
  }

  return (
    <div className={`alert alert-${props.type}${props.className ? ` ${props.className}` : ''}`} style={alertStyle}>
      {props.icon ? (
        <div className="alert-before" style={alertbeforeStyle}>
          <i className={`exp-ux-${props.icon} exp-ux-${props.iconSize}`} />
        </div>
      ) : null}

      <div className="alert-content" style={alertContentStyle}>
        {props.children}
      </div>

      {props.onClose ? (
        <div className="alert-after" style={alertAfterStyle}>
          <button
            className="btn-icon close-button"
            onClick={(e) => props.onClose?.(e)}
            type="button"
            style={buttonStyle}
          >
            {/* <i className="exp-ux-close exp-ux-small" /> */}
            <img src={ClosebtnIcon} alt="" style={ClosebtnIconStyle} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

Alert.defaultProps = {
  className: '',
  icon: '',
  iconSize: 'small',
  onClose: null,
};

Alert.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]).isRequired,
  className: PropTypes.string,
  icon: PropTypes.string,
  iconSize: PropTypes.oneOf(['mini', 'small', 'medium', 'large', 'xlarge']),
  onClose: PropTypes.func,
  type: PropTypes.oneOf(['error', 'info', 'success', 'warning']).isRequired,
};

// Syntactic Sugar Variants

export function InfoAlert(props) {
  return React.createElement(Alert, {
    ...props,
    type: 'info',
  });
}

export function ErrorAlert(props) {
  return React.createElement(Alert, {
    ...props,
    icon: 'skull',
    type: 'error',
  });
}

export function SuccessAlert(props) {
  return React.createElement(Alert, {
    ...props,
    type: 'success',
  });
}

export function WarningAlert(props) {
  return React.createElement(Alert, {
    ...props,
    type: 'warning',
  });
}

export default Alert;
