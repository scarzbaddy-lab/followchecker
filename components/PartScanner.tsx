'use client';

import { useEffect, useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';
import { CarPart } from '@/lib/types';

export default function PartScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [query, setQuery] = useState('');
  const [part, setPart] = useState<CarPart | null>(null);
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  async function startCamera() {
    const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    if (videoRef.current) {
      videoRef.current.srcObject = media;
      await videoRef.current.play();
      setStreaming(true);
    }
  }

  async function captureAndExtract() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    setStatus('Running OCR...');
    const worker = await createWorker('eng');
    const {
      data: { text }
    } = await worker.recognize(canvas);
    await worker.terminate();

    const normalized = text.replace(/[^A-Za-z0-9-]/g, ' ').trim().split(/\s+/)[0] ?? '';
    setOcrText(text);
    setQuery(normalized);
    setStatus(normalized ? 'OCR complete' : 'No part number detected');
  }

  async function searchPart() {
    if (!query) return;
    setStatus('Searching database...');
    setPart(null);

    const res = await fetch(`/api/parts/search?partNumber=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error ?? 'Search failed');
      return;
    }

    setPart(data.part as CarPart);
    setStatus('Part found');
  }

  return (
    <main>
      <h1>Car Part Number Scanner</h1>
      <p>Use your camera to capture a part number, run OCR, and fetch matching part details.</p>

      <div className="card">
        <button onClick={startCamera} disabled={streaming}>Start Camera</button>
        <button onClick={captureAndExtract} disabled={!streaming}>Capture + OCR</button>
        <video ref={videoRef} playsInline muted />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className="card">
        <label htmlFor="part">Detected / Entered Part Number</label>
        <input id="part" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. 1234-AB" />
        <button onClick={searchPart} style={{ marginTop: '0.75rem' }}>Search PostgreSQL</button>
        <p><small>Status: {status}</small></p>
      </div>

      <div className="card">
        <h3>Raw OCR Output</h3>
        <pre>{ocrText || 'No OCR text yet.'}</pre>
      </div>

      {part && (
        <div className="card">
          <h2>{part.name}</h2>
          <p><strong>Part Number:</strong> {part.part_number}</p>
          <p><strong>Manufacturer:</strong> {part.manufacturer ?? 'Unknown'}</p>
          <p><strong>Description:</strong> {part.description ?? 'None provided.'}</p>
          <p><strong>Compatible Models:</strong> {part.compatible_models?.join(', ') || 'N/A'}</p>
        </div>
      )}
    </main>
  );
}
