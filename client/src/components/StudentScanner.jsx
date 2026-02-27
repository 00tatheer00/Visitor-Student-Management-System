import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Loader } from './Loader.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { API_BASE } from '../config.js';
const SCANNER_ELEMENT_ID = 'qr-barcode-scanner';

const StudentScanner = () => {
  const { addToast } = useToast();
  const [lastScan, setLastScan] = useState(null);
  const [status, setStatus] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showCameraPanel, setShowCameraPanel] = useState(false);
  const [lastRawScan, setLastRawScan] = useState('');
  const inputRef = useRef(null);
  const html5QrRef = useRef(null);
  const lastScannedRef = useRef(null);
  const scanCooldownRef = useRef(false);
  const debounceTimerRef = useRef(null);

  const focusScanInput = () => {
    inputRef.current?.focus();
  };


  const [scanning, setScanning] = useState(false);

  const handleScan = async (code) => {
    if (!code || scanCooldownRef.current) return;
    setStatus(null);
    setScanning(true);
    try {
      const res = await fetch(`${API_BASE}/students/scan?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Scan failed');
      }
      setLastScan({
        student: data.student,
        time: new Date(data.log.entryTime)
      });
      setStatus({ type: 'success', message: 'Student entry recorded.' });
      addToast({
        message: `${data.student.name} – Entry recorded`,
        type: 'success',
        size: 'big',
        title: '✓ QR Code Scanned'
      });
      lastScannedRef.current = code;
      scanCooldownRef.current = true;
      setTimeout(() => { scanCooldownRef.current = false; }, 2500);
    } catch (err) {
      setLastScan(null);
      setStatus({ type: 'error', message: err.message || 'Student not registered' });
      addToast({ message: err.message || 'Student not registered', type: 'error', size: 'small' });
      scanCooldownRef.current = true;
      setTimeout(() => {
        scanCooldownRef.current = false;
      }, 1500);
    } finally {
      setScanning(false);
    }
  };

  const processScannedCode = (code) => {
    let trimmed = String(code || '').replace(/[\x00-\x1F\x7F]/g, '').trim();
    if (!trimmed) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setLastRawScan(trimmed);
    if (inputRef.current) inputRef.current.value = '';
    handleScan(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      const code = e.target.value.trim();
      e.preventDefault();
      e.stopPropagation();
      if (code) processScannedCode(code);
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (val && val.length >= 3 && !val.includes('\n')) {
        processScannedCode(val);
      }
      debounceTimerRef.current = null;
    }, 350);
  };

  const startCamera = async () => {
    setCameraError(null);
    setStatus(null);
    setShowCameraPanel(true);
  };

  useEffect(() => {
    if (!showCameraPanel) return;

    let mounted = true;
    let timeoutId;

    const initCamera = async () => {
      try {
        const camerasPromise = Html5Qrcode.getCameras();
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Camera took too long to start. Try again.')), 15000);
        });
        const cameras = await Promise.race([camerasPromise, timeoutPromise]);
        clearTimeout(timeoutId);

        if (!mounted) return;
        if (!cameras || cameras.length === 0) {
          throw new Error('No camera found. Please connect a camera and try again.');
        }

        const cameraId = cameras[0].id;
        const html5Qr = new Html5Qrcode(SCANNER_ELEMENT_ID);
        html5QrRef.current = html5Qr;

        await html5Qr.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            if (decodedText && decodedText !== lastScannedRef.current) {
              handleScan(decodedText);
            }
          },
          () => {}
        );

        if (mounted) setCameraActive(true);
      } catch (err) {
        if (mounted) {
          setCameraError(err.message || 'Failed to start camera. Check permissions.');
          setShowCameraPanel(false);
        }
      }
    };

    const timer = setTimeout(initCamera, 100);
    return () => {
      mounted = false;
      clearTimeout(timer);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showCameraPanel]);

  const stopCamera = async () => {
    if (html5QrRef.current && html5QrRef.current.isScanning) {
      try {
        await html5QrRef.current.stop();
      } catch (e) {}
      html5QrRef.current = null;
    }
    setCameraActive(false);
    setCameraError(null);
    setShowCameraPanel(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrRef.current && html5QrRef.current.isScanning) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="student-scanner">
      <div className="scan-button-section" title="USB scanner input area">
        <span className="scan-ready-badge">Ready</span>
        <button
          type="button"
          className="btn-scan-qr"
          onClick={focusScanInput}
          disabled={scanning}
        >
          {scanning ? (
            <>
              <Loader size="sm" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span className="scan-icon">📷</span>
              <span>Scan QR Code</span>
            </>
          )}
        </button>
        <p className="scan-instruction">
          Click the button above, then scan the student card with your USB scanner.
        </p>
        {lastRawScan && <span className="scan-raw">Last scanned: {lastRawScan}</span>}
      </div>
      <input
        ref={inputRef}
        type="text"
        className="scan-input-hidden"
        aria-label="QR scan input"
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        autoComplete="off"
      />

      <div className="camera-section">
        {!showCameraPanel ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={startCamera}
          >
            📷 Use Laptop Camera
          </button>
        ) : (
          <div className="camera-view">
            <div className="qr-scanner-wrapper">
              {!cameraActive && !cameraError && (
                <div className="camera-loading">
                  <Loader size="lg" />
                  <span>Starting camera...</span>
                </div>
              )}
              <div id={SCANNER_ELEMENT_ID} className="qr-scanner-container" />
            </div>
            <button
              type="button"
              className="btn-small danger"
              onClick={stopCamera}
              style={{ marginTop: '0.75rem' }}
            >
              Stop Camera
            </button>
          </div>
        )}
        {cameraError && (
          <div className="status error" style={{ marginTop: '0.75rem' }}>
            {cameraError}
          </div>
        )}
      </div>

      {status && (
        <div className={status.type === 'success' ? 'status success' : 'status error'}>
          {status.message}
        </div>
      )}

      {lastScan && (
        <div className="scan-result">
          <h4>✓ Last Scan</h4>
          <p><strong>ID:</strong> {lastScan.student.studentId}</p>
          <p><strong>Name:</strong> {lastScan.student.name}</p>
          <p><strong>Department:</strong> {lastScan.student.department}</p>
          <p><strong>Entry Time:</strong> {lastScan.time.toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
};

export default StudentScanner;
