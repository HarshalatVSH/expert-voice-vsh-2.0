/* eslint-disable  */
import React, { useEffect, useRef, useState } from "react";

import { AnalyticEvent, MessageType, NotificationType, PopupMode } from "../constants";
import { sendAC, getNotificationType } from "../helper";
import Popup from "./Popup";

/**
 * Main Overlay Script - controlling toggle button and popup
 */
function Overlay() {
  const [context, setContext] = useState(null);
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [visible, setVisible] = useState(false);
  const [popupMode, setPopupMode] = useState(null);

  const openRequested = useRef(false);

  const toggleButton = {
    '--bg-color': '#FFF',
    '--bg-hover-color': '#FFF',
    '--text-color': '#757575',
    '--text-hover-color': '#4D4D4D',
    alignItems: 'center',
    backgroundColor: 'var(--bg-color)',
    border: 'none',
    borderRadius: '3px 0px 0px 3px',
    boxShadow: 'rgba(0, 0, 0, 0.18) 0px 2px 11px',
    color: 'var(--text-color)',
    display: 'flex',
    height: '48px',
    justifyContent: 'center',
    position: 'fixed',
    outline: 'none',
    right: '0px',
    top: '250px',
    transition: 'background-color 50ms ease-in 0s, color 50ms ease-in 0s, right 150ms ease-out 0s',
    width: '48px',
    zIndex: '2147483646',
    padding: '0px',
    textDecoration: 'none',
    cursor: 'pointer',
    margin: '0px',
    background: 'none',
  };
  

  useEffect(() => {
    if (!context) {
      // No page data, nothing to do
      return;
    }

    const notif = getNotificationType(context, user);
    setNotification(notif);

    if (notif === NotificationType.ACTIVE) {
      // Auto-launch if the user has shopping available (or active but unauthenticated)
      setOpen(true);
      sendAC(AnalyticEvent.OPEN, {
        brand: context.brand || null,
        product: context.product || null,
        source: "auto",
      });
    } else if (openRequested.current) {
      // An open was requested prior to the context being loaded (extension icon click). Open it.
      setOpen(true);
      openRequested.current = false;
      sendAC(AnalyticEvent.OPEN, {
        brand: context.brand || null,
        product: context.product || null,
        source: "action",
      });
    }

    window.setTimeout(() => {
      // Set the visible flag so the toggle animates
      setVisible(true);
    });
  }, [context, user]);

  useEffect(() => {
    // Bind the message listener to respond to the background worker
    const listener = (msg) => {
      if (msg.type === MessageType.DATA) {
        setContext(msg.context);
        setUser(msg.user);
      } else if (msg.type === MessageType.OPEN) {
        if (context) {
          // Context is loaded. Go ahead and open.
          setOpen(true);
          sendAC(AnalyticEvent.OPEN, {
            brand: context.brand || null,
            product: context.product || null,
            source: "action",
          });
        } else {
          // Context hasn't loaded yet. Set a flag letting it know it should open when it comes.
          openRequested.current = true;
        }
      } else if (msg.type === MessageType.LOGIN_SHOW) {
        setOpen(true);
        setPopupMode(PopupMode.LOGIN);
      }
    };

    browser.runtime.onMessage.addListener(listener);
    // return () => {
    //   browser.runtime.onMessage.removeListener(listener);
    // };
  }, [context]);

  if (!context) {
    return null;
  }

  return (
    <>
      {notification ? (
        <button
          className={`toggle-button${notification === NotificationType.ACTIVE ? " rewarded" : ""}${open ? " hidden" : ""}${!open && visible ? " visible" : ""}`}
          style={toggleButton}
          onClick={() => {
            setOpen(true);
            sendAC(AnalyticEvent.OPEN, {
              brand: context.brand || null,
              product: context.product || null,
              source: "content",
            });
          }}
          type="button"
        >
          <i className="exp-ux-bolt exp-ux-small" />
        </button>
      ) : null}

      {open ? (
        <Popup
          brand={context.brand}
          mode={popupMode}
          notification={notification}
          onClose={() => {
            setOpen(false);
            sendAC(AnalyticEvent.CLOSE, {
              brand: context.brand || null,
              product: context.product || null,
              source: "content",
            });
          }}
          onLogin={async (u) => {
            setUser(u);
            await browser.runtime.sendMessage({ type: MessageType.RESET, user: u });
          }}
          onLogout={async () => {
            setUser(null);
            await browser.runtime.sendMessage({ type: MessageType.LOGOUT });
            await browser.runtime.sendMessage({ type: MessageType.RESET, user: null });
          }}
          product={context.product}
          page={context.page}
          user={user}
        />
      ) : null}
    </>
  );
}

export default Overlay;
