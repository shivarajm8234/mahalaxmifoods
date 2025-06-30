/**
 * Loads a script dynamically and returns a promise that resolves when loaded
 * @param src The URL of the script to load
 * @param timeoutMs Optional timeout in milliseconds (default: 10000ms)
 * @returns Promise that resolves to true when script is loaded
 */
export const loadScript = (src: string, timeoutMs = 10000): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      console.log(`Script already loaded: ${src}`);
      resolve(true);
      return;
    }

    console.log(`Loading script: ${src}`);
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      const error = new Error(`Script load timeout: ${src}`);
      console.error(error);
      cleanup();
      reject(error);
    }, timeoutMs);

    // Cleanup function to remove event listeners and timeout
    const cleanup = () => {
      clearTimeout(timeoutId);
      script.onload = null;
      script.onerror = null;
    };

    script.onload = () => {
      console.log(`Script loaded successfully: ${src}`);
      cleanup();
      resolve(true);
    };

    script.onerror = (error) => {
      const errorMsg = `Failed to load script: ${src}`;
      console.error(errorMsg, {
        error,
        src: script.src,
        parent: script.parentElement?.tagName,
      });
      cleanup();
      reject(new Error(errorMsg));
    };

    // Append to document
    (document.head || document.documentElement).appendChild(script);
  });
};
