
import { useEffect, useRef } from 'react';

const MODAL_MARKER = 'vidyasetu_layer_id';

/**
 * यह हुक एंड्रॉइड बैक बटन को हैंडल करता है। 
 * जब भी कोई Modal या Sub-view खुलता है, यह History में एक 'State' पुश करता है।
 * बैक बटन दबाने पर यह उस State को हटाकर onClose फंक्शन चला देता है।
 */
export const useModalBackHandler = (isOpen: boolean, onClose: () => void) => {
  const onCloseRef = useRef(onClose);
  const layerIdRef = useRef<number | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      // एक यूनिक आईडी बनाएँ ताकि नेस्टेड लेयर्स (Modals के ऊपर Modals) में भ्रम न हो
      const layerId = Date.now();
      layerIdRef.current = layerId;

      // ब्राउज़र हिस्ट्री में एक नया पॉइंट जोड़ें
      // Using current location href to avoid origin SecurityError
      try {
        window.history.pushState({ [MODAL_MARKER]: layerId }, '', window.location.href);
      } catch (e) {}

      const handlePopState = (event: PopStateEvent) => {
        // अगर यूजर बैक दबाता है, तो event.state बदल जाएगा
        // अगर मौजूदा लेयर का आईडी हिस्ट्री में नहीं है, तो मतलब बैक दबाया गया है
        if (!event.state || event.state[MODAL_MARKER] !== layerId) {
          onCloseRef.current();
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        // अगर कंपोनेंट बंद होता है (जैसे 'X' बटन से), तो हिस्ट्री को क्लीनअप करें
        if (window.history.state && window.history.state[MODAL_MARKER] === layerId) {
          window.history.back();
        }
        layerIdRef.current = null;
      };
    }
  }, [isOpen]);
};
