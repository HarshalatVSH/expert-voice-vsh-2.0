import React, { useEffect, useRef, useState } from 'react';

import { AnalyticEvent, MessageType, NotificationType, PopupMode } from '../constants';
import { sendAC, getNotificationType } from '../helper';
import Popup from './Popup';

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
        source: 'auto',
      });
    } else if (openRequested.current) {
      // An open was requested prior to the context being loaded (extension icon click). Open it.
      setOpen(true);
      openRequested.current = false;
      sendAC(AnalyticEvent.OPEN, {
        brand: context.brand || null,
        product: context.product || null,
        source: 'action',
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
            source: 'action',
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

    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, [context]);

  if (!context) {
    return null;
  }

  return (
    <>
      {notification ? (
        <button
          className={`toggle-button${
            notification === NotificationType.ACTIVE ? ' rewarded' : ''}${
            open ? ' hidden' : ''}${
            !open && visible ? ' visible' : ''}`}
          onClick={() => {
            setOpen(true);
            sendAC(AnalyticEvent.OPEN, {
              brand: context.brand || null,
              product: context.product || null,
              source: 'content',
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
              source: 'content',
            });
          }}
          onLogin={async (u) => {
            setUser(u);
            await chrome.runtime.sendMessage({ type: MessageType.RESET, user: u });
          }}
          onLogout={async () => {
            setUser(null);
            await chrome.runtime.sendMessage({ type: MessageType.LOGOUT });
            await chrome.runtime.sendMessage({ type: MessageType.RESET, user: null });
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
