/**
 * NotificationBell Component
 * Shows notification bell icon with unread count and dropdown
 */

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const audioCtxRef = useRef(null);
  const prevUnreadRef = useRef(null);
  const { unreadCount } = useSelector((state) => state.notification);

  // Load notifications on mount and poll for new ones (no websocket server, so
  // we poll to keep the unread badge up to date).
  useEffect(() => {
    dispatch(fetchNotifications({ limit: 10 }));
    const timer = setInterval(() => {
      dispatch(fetchNotifications({ limit: 10 }));
    }, 20000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audioCtxRef.current = new AudioCtx();
    }
    return audioCtxRef.current;
  };

  // Play a longer, pleasant multi-note chime melody for a new notification.
  const playChime = () => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      // A short rising melody that resolves, then a soft repeat (~2 seconds).
      const notes = [
        { freq: 987.77, at: 0.0, dur: 0.35 },   // B5
        { freq: 1318.51, at: 0.28, dur: 0.35 },  // E6
        { freq: 1567.98, at: 0.56, dur: 0.35 },  // G6
        { freq: 1760.0, at: 0.84, dur: 0.5 },    // A6
        { freq: 1318.51, at: 1.3, dur: 0.4 },    // E6
        { freq: 1760.0, at: 1.6, dur: 0.6 },     // A6 (final ring)
      ];
      notes.forEach(({ freq, at, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + at);
        gain.gain.setValueAtTime(0.0001, now + at);
        gain.gain.exponentialRampToValueAtTime(0.25, now + at + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + at + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + at);
        osc.stop(now + at + dur + 0.05);
      });
    } catch (e) {
      /* audio not available; ignore */
    }
  };

  // Browsers block audio until the user has interacted with the page. Unlock
  // (resume) the AudioContext on the first click/tap/keypress so notification
  // sounds then play automatically — no page refresh needed.
  useEffect(() => {
    const unlock = () => {
      const ctx = getAudioCtx();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    if (prevUnreadRef.current === null) {
      // First load: don't chime for pre-existing unread notifications.
      prevUnreadRef.current = unreadCount;
      return;
    }
    if (unreadCount > prevUnreadRef.current) {
      playChime();
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      dispatch(fetchNotifications({ limit: 10 }));
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown: full-width panel on phones, anchored dropdown on desktop */}
      {isOpen && (
        <div className="fixed inset-x-2 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <NotificationList onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
