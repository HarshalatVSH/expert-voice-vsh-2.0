/* eslint-disable */
import { useCallback, useEffect, useState } from "react";
import { AnalyticEvent, MessageType } from "../constants";
import extractor from "../extractor";
import { sendAC } from "../helper";

/**
 * Main Content Script - responsible for scrapping page and setting context
 */

function Content() {
  const [context, setContext] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [user, setUser] = useState(null);
  console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
  const resetContext = useCallback(async () => {
    if (!pageData) {
      // No page data, nothing to do
      return;
    }

    const { user: u, ...c } = await chrome.runtime.sendMessage({
      type: MessageType.CONTEXT,
      data: pageData,
    });
    setContext(c);
    setUser(u);

    sendAC(AnalyticEvent.SEARCH, {
      brand: c.brand || null,
      product: c.product || null,
      request: pageData,
    });

    // eslint-disable-next-line consistent-return
    return c;
  }, [pageData]);

  useEffect(() => {
    // Scrape the page
    const data = extractor();
    setPageData(data);
  }, []);

  useEffect(() => {
    // Load the context for the page
    resetContext();
  }, [resetContext]);

  useEffect(() => {
    // Bind the message listener to respond to the background worker
    const listener = (msg, sender, sendResponse) => {
      if (msg.type === MessageType.SYNC) {
        if (msg.user?.userId !== user?.userId) {
          // The user does not match. Force a reload the context.
          resetContext().then((c) => sendResponse(c));
        } else {
          // The user matches. Reuse the already loaded context.
          sendResponse(context);
        }
      } else if (msg.type === MessageType.RESET) {
        resetContext().then((c) => sendResponse(c));
      }

      return true;
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, [context, resetContext, user]);

  return null;
}

export default Content;
