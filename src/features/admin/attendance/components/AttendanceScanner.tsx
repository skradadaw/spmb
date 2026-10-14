'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, CheckCircle2, RotateCcw, Undo2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateParticipantStatusAction } from '@/features/admin/participants/actions/updateParticipantStatusAction';
import { scanAttendanceAction, type ScanAttendanceResult } from '../actions/scanAttendanceAction';

const SCAN_INTERVAL_MS = 250;
/** QR yang sama diabaikan selama jeda ini agar satu kartu tidak tercatat berulang. */
const SAME_CODE_COOLDOWN_MS = 4000;

/** `undone` marks a scan whose attendance was cancelled afterwards (Batalkan Kehadiran). */
type HistoryItem = ScanAttendanceResult & { code: string; at: string; undone?: boolean };

export function AttendanceScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busyRef = useRef(false);
  const lastCodeRef = useRef<{ code: string; at: number } | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [latest, setLatest] = useState<HistoryItem | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [manual, setManual] = useState('');
  const [undoing, setUndoing] = useState(false);
  /** The undo error belongs to the scan it was for, so a newer scan never shows it. */
  const [undoError, setUndoError] = useState<{ item: HistoryItem; message: string } | null>(null);

  const submit = useCallback(async (code: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const result = await scanAttendanceAction(code);
      const item = { ...result, code, at: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
      setUndoError(null);
      setLatest(item);
      setHistory((current) => [item, ...current].slice(0, 10));
      if (result.outcome === 'present') navigator.vibrate?.(150);
    } finally {
      busyRef.current = false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setCameraError('Kamera tidak dapat dibuka. Izinkan akses kamera di browser, atau ketik nomor secara manual.');
    }
  }

  useEffect(() => {
    if (!cameraOn) return;
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' })?.data.trim();
      if (!code) return;
      const now = Date.now();
      if (lastCodeRef.current?.code === code && now - lastCodeRef.current.at < SAME_CODE_COOLDOWN_MS) return;
      lastCodeRef.current = { code, at: now };
      void submit(code);
    }, SCAN_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [cameraOn, submit]);

  useEffect(() => stopCamera, [stopCamera]);

  /** Batalkan Kehadiran for the latest successful scan, e.g. when the wrong card was scanned. */
  async function undoLatest() {
    const target = latest;
    if (!target?.applicant || target.outcome !== 'present' || target.undone) return;
    const formData = new FormData();
    formData.set('participantId', target.applicant.id);
    formData.set('intent', 'unattend');
    setUndoing(true);
    setUndoError(null);
    try {
      const result = await updateParticipantStatusAction({ status: 'idle', message: '' }, formData);
      if (result.status !== 'success') {
        setUndoError({ item: target, message: result.message });
        return;
      }
      const undone = { ...target, undone: true, message: result.message, applicant: { ...target.applicant, status: 'Terjadwal OKB' } };
      // A newer scan may have arrived meanwhile; it stays the latest result.
      setLatest((current) => (current === target ? undone : current));
      setHistory((current) => current.map((item) => (item === target ? undone : item)));
      // The same card may be scanned again straight away.
      lastCodeRef.current = null;
    } catch {
      setUndoError({ item: target, message: 'Kehadiran tidak dapat dibatalkan. Periksa koneksi lalu coba lagi.' });
    } finally {
      setUndoing(false);
    }
  }

  function handleManual(event: FormEvent) {
    event.preventDefault();
    if (!manual.trim()) return;
    void submit(manual.trim());
    setManual('');
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-900">
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
          {!cameraOn && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/80">Kamera belum aktif</div>}
          {cameraOn && <div aria-hidden="true" className="pointer-events-none absolute inset-[18%] rounded-2xl border-2 border-white/80" />}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        {cameraOn ? (
          <Button type="button" variant="outline" onClick={stopCamera} className="w-full gap-2"><CameraOff aria-hidden="true" className="size-4" />Matikan kamera</Button>
        ) : (
          <Button type="button" onClick={startCamera} className="w-full gap-2"><Camera aria-hidden="true" className="size-4" />Mulai scan</Button>
        )}
        {cameraError && <p role="alert" className="text-sm text-rose-700">{cameraError}</p>}
        <form onSubmit={handleManual} className="flex gap-2">
          <label htmlFor="manual-nomor" className="sr-only">Nomor Pendaftaran</label>
          <Input id="manual-nomor" value={manual} onChange={(event) => setManual(event.target.value)} placeholder="Ketik OB-2027-001" className="h-10" />
          <Button type="submit" variant="outline" className="h-10 shrink-0">Catat</Button>
        </form>
      </div>

      <div className="space-y-3">
        <div aria-live="polite">
          {latest ? <ResultCard item={latest} undoing={undoing} undoError={undoError?.item === latest ? undoError.message : null} onUndo={undoLatest} /> : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-[var(--admin-muted)]">Arahkan kamera ke QR pada Bukti Pendaftaran. Kehadiran langsung tercatat bila hari ini sesuai Jadwal OKB.</div>
          )}
        </div>
        {history.length > 1 && (
          <div className="rounded-2xl border border-[var(--admin-border)] bg-white p-4">
            <p className="text-sm font-semibold">Riwayat scan</p>
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {history.slice(1).map((item, index) => (
                <li key={`${item.code}-${item.at}-${index}`} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 truncate">{item.applicant?.namaLengkap || item.code}</span>
                  <span className={item.undone ? 'shrink-0 text-slate-500' : item.outcome === 'present' ? 'shrink-0 text-emerald-700' : 'shrink-0 text-rose-700'}>{item.undone ? 'Kehadiran dibatalkan' : item.outcome === 'present' ? 'Hadir' : 'Ditolak'} · {item.at}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ item, undoing, undoError, onUndo }: { item: HistoryItem; undoing: boolean; undoError: string | null; onUndo: () => void }) {
  const present = item.outcome === 'present' && !item.undone;
  const tone = item.undone
    ? { card: 'border-slate-300 bg-slate-50', title: 'text-slate-900' }
    : present ? { card: 'border-emerald-300 bg-emerald-50', title: 'text-emerald-900' } : { card: 'border-rose-300 bg-rose-50', title: 'text-rose-900' };
  return (
    <div className={`rounded-2xl border p-5 ${tone.card}`}>
      <div className="flex items-start gap-3">
        {item.undone
          ? <RotateCcw aria-hidden="true" className="size-8 shrink-0 text-slate-500" />
          : present ? <CheckCircle2 aria-hidden="true" className="size-8 shrink-0 text-emerald-700" /> : <XCircle aria-hidden="true" className="size-8 shrink-0 text-rose-700" />}
        <div className="min-w-0">
          <p className={`text-lg font-bold ${tone.title}`}>{item.message}</p>
          {item.applicant && (
            <>
              <p className="mt-1 break-words text-base font-semibold text-slate-900">{item.applicant.namaLengkap}</p>
              <p className="mt-0.5 text-sm text-slate-600">{item.applicant.nomorPendaftaran}{item.applicant.jadwalGelombang ? ` · ${item.applicant.jadwalGelombang}` : ''}</p>
            </>
          )}
          <p className="mt-2 text-xs text-slate-500">{item.at}</p>
          {present && item.applicant && (
            <div className="mt-3 space-y-1.5">
              <Button type="button" variant="outline" size="sm" onClick={onUndo} disabled={undoing} className="gap-1.5 bg-white">
                <Undo2 aria-hidden="true" className="size-3.5" />Batalkan
              </Button>
              {undoError && <p role="alert" className="text-xs font-semibold text-rose-700">{undoError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
