/**
 * Print cards by opening a new window with only the card content.
 * This ensures reliable printing regardless of main page structure.
 */
export function printCardContent(containerElement) {
  if (!containerElement) return;

  const content = containerElement.innerHTML;

  // Collect all stylesheets from the document
  const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((link) => {
      const href = link.getAttribute('href') || '';
      if (href && !href.startsWith('blob:')) {
        const fullHref = href.startsWith('http') || href.startsWith('//') ? href : new URL(href, window.location.origin).href;
        return `<link rel="stylesheet" href="${fullHref}">`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n  ');

  // Collect inline styles
  const inlineStyles = Array.from(document.querySelectorAll('style'))
    .map((s) => s.textContent)
    .join('\n');

  const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ID Card</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5in;
      background: #fff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .premium-card-inner::before { display: none !important; }
  </style>
  ${styleLinks}
  ${inlineStyles ? `<style>${inlineStyles}</style>` : ''}
</head>
<body>
  ${content}
</body>
</html>`;

  const printWin = window.open('', '_blank', 'width=800,height=600');
  if (!printWin) {
    alert('Please allow popups to print the card.');
    return;
  }

  printWin.document.write(printHtml);
  printWin.document.close();

  const doPrint = () => {
    printWin.focus();
    printWin.print();
  };

  const cleanup = () => {
    printWin.close();
  };

  printWin.onload = () => {
    // Small delay to ensure styles and fonts are loaded
    setTimeout(doPrint, 300);
  };

  printWin.onafterprint = cleanup;
  printWin.addEventListener('beforeunload', cleanup);

  // Fallback: if onload already fired
  if (printWin.document.readyState === 'complete') {
    setTimeout(doPrint, 300);
  }
}
