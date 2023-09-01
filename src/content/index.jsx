/* eslint-disable  */
import React from 'react';
import { createRoot } from 'react-dom/client';

import Content from './Content';
import Inline from './Inline';
import Overlay from './Overlay';

import './Content.less';

import inlineStyles from './Inline.shadow.less';
import overlayStyles from './Overlay.shadow.less';

import { sendAC } from '../helper';
import { AnalyticEvent } from '../constants';

const body = document.querySelector('body');

/**
 * Set up main page controller
 */
const main = document.createElement('div');
main.id = 'expertvoice-root';
body.append(main);

const mainRoot = createRoot(main);
mainRoot.render(<Content />);

/**
 * Set up overlay component
 */
const overlay = document.createElement('div');
overlay.id = 'expertvoice-overlay';
body.append(overlay);

// Work within a shadow DOM to encapsulate styles
// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM
const shadow = overlay.attachShadow({ mode: 'open' });
// shadow.adoptedStyleSheets = [overlayStyles];

const overlayRoot = createRoot(shadow);
overlayRoot.render(<Overlay />);

/**
 * Set up inline price component
 */
const amazonPriceEl = document.getElementById('apex_desktop');
if (amazonPriceEl) {
  const inline = document.createElement('div');
  inline.id = 'expertvoice-inline';
  amazonPriceEl.insertAdjacentElement('beforebegin', inline);

  const inlineShadow = inline.attachShadow({ mode: 'open' });
  // inlineShadow.adoptedStyleSheets = [inlineStyles];
  createRoot(inlineShadow).render(<Inline />);
} else if (document.location.href.includes('/dp/')) {
  // Inline element fail to attach, only send when on Amazon PDPs
  sendAC(AnalyticEvent.INLINE_ERROR);
}
