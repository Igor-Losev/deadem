import { useCallback, useEffect, useRef, useState } from 'react';

import { loadLibraryModule } from '../../../libraries';

const MAX_HISTORY = 100;
const PLAYBACK_RATES = [ 1, 2, 4, 8, 16, 32, 64, 128 ];
const CONTENT_TICK_INTERVAL = 256;

const INITIAL_TICKS = { current: -1, first: -1, last: -1 };

export default function usePlayer(library) {
  const fileInputRef = useRef(null);
  const historyRef = useRef([]);
  const loadRequestIdRef = useRef(0);

  const [ fileName, setFileName ] = useState(null);
  const [ seeking, setSeeking ] = useState(false);
  const [ player, setPlayer ] = useState(null);
  const [ playing, setPlaying ] = useState(false);
  const [ rate, setRate ] = useState(1);
  const [ ticks, setTicks ] = useState(INITIAL_TICKS);
  const [ contentVersion, setContentVersion ] = useState(0);

  const lastContentTickRef = useRef(-1);
  const playerRef = useRef(null);
  const playingRef = useRef(false);
  const seekingRef = useRef(false);
  const rateRef = useRef(1);
  const runtimeErrorsRef = useRef({ PlaybackInterruptedError: null });

  playerRef.current = player;
  playingRef.current = playing;
  seekingRef.current = seeking;
  rateRef.current = rate;

  const resetPlayer = useCallback(() => {
    const currentPlayer = playerRef.current;

    if (currentPlayer) {
      currentPlayer.dispose();
    }

    historyRef.current = [];
    lastContentTickRef.current = -1;
    runtimeErrorsRef.current = { PlaybackInterruptedError: null };

    setPlayer(null);
    setFileName(null);
    setPlaying(false);
    setRate(1);
    setSeeking(false);
    setTicks(INITIAL_TICKS);
    setContentVersion(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }, []);

  const syncTicks = useCallback(() => {
    const currentPlayer = playerRef.current;

    if (currentPlayer === null) {
      return;
    }

    setTicks({ current: currentPlayer.getCurrentTick(), first: currentPlayer.getFirstTick(), last: currentPlayer.getLastTick() });
    setContentVersion((version) => version + 1);
  }, []);

  const startPlayback = useCallback((playRate) => {
    const currentPlayer = playerRef.current;

    if (currentPlayer === null) {
      return;
    }

    setPlaying(true);

    currentPlayer.play(playRate).then(() => {
      setPlaying(false);
      syncTicks();
    }).catch((err) => {
      const { PlaybackInterruptedError } = runtimeErrorsRef.current;

      if (!PlaybackInterruptedError || !(err instanceof PlaybackInterruptedError)) {
        setPlaying(false);
        console.error('Player: playback error', err);
      }
    });
  }, [ syncTicks ]);

  const handleFileChanged = async (event) => {
    const file = event.target.files[0];
    const requestId = loadRequestIdRef.current + 1;

    loadRequestIdRef.current = requestId;

    if (!file) {
      return;
    }

    resetPlayer();
    setFileName(file.name);

    try {
      const runtimeLibrary = await loadLibraryModule(library);

      if (loadRequestIdRef.current !== requestId) {
        return;
      }

      const { InterceptorStage, ParserConfiguration, Player, PlaybackInterruptedError } = runtimeLibrary;
      const parserConfiguration = new ParserConfiguration({
        breakInterval: 100,
        parserThreads: 0
      });
      const newPlayer = new Player(parserConfiguration);

      runtimeErrorsRef.current = { PlaybackInterruptedError };

      newPlayer.registerPostInterceptor(InterceptorStage.DEMO_PACKET, (demoPacket) => {
        const history = historyRef.current;

        history.push(demoPacket);

        if (history.length > MAX_HISTORY) {
          history.splice(0, history.length - MAX_HISTORY);
        }
      });

      setPlayer(newPlayer);

      await newPlayer.load(file.stream());

      if (loadRequestIdRef.current !== requestId) {
        newPlayer.dispose();
        return;
      }

      setTicks({ current: newPlayer.getCurrentTick(), first: newPlayer.getFirstTick(), last: newPlayer.getLastTick() });
    } catch (err) {
      if (loadRequestIdRef.current === requestId) {
        setFileName(null);
      }

      console.error('Player: load failed', err);
    }
  };

  useEffect(() => {
    loadRequestIdRef.current += 1;
    resetPlayer();
  }, [ library.key, resetPlayer ]);

  useEffect(() => {
    if (!playing || !player) {
      return;
    }

    let rafId;

    const pump = () => {
      const current = player.getCurrentTick();

      setTicks((prev) => prev.current === current ? prev : { ...prev, current });

      if (Math.abs(current - lastContentTickRef.current) >= CONTENT_TICK_INTERVAL) {
        lastContentTickRef.current = current;
        setContentVersion((version) => version + 1);
      }

      rafId = requestAnimationFrame(pump);
    };

    rafId = requestAnimationFrame(pump);

    return () => cancelAnimationFrame(rafId);
  }, [ playing, player ]);

  const handlePauseClicked = useCallback(() => {
    const currentPlayer = playerRef.current;

    if (!currentPlayer || !playingRef.current) {
      return;
    }

    currentPlayer.pause();
    setPlaying(false);
    syncTicks();
  }, [ syncTicks ]);

  const handlePlayClicked = useCallback(() => {
    if (!playerRef.current || seekingRef.current || playingRef.current) {
      return;
    }

    startPlayback(rateRef.current);
  }, [ startPlayback ]);

  const handleRateChange = useCallback(() => {
    const next = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(rateRef.current) + 1) % PLAYBACK_RATES.length];

    setRate(next);

    if (playingRef.current && playerRef.current) {
      playerRef.current.pause();
      startPlayback(next);
    }
  }, [ startPlayback ]);

  const handleNextTick = useCallback(() => {
    if (playerRef.current === null || seekingRef.current) {
      return;
    }

    setSeeking(true);

    playerRef.current.nextTick()
      .then(() => syncTicks())
      .catch((err) => console.error('Player: nextTick failed', err))
      .finally(() => setSeeking(false));
  }, [ syncTicks ]);

  const handlePrevTick = useCallback(() => {
    if (playerRef.current === null || seekingRef.current) {
      return;
    }

    historyRef.current = [];
    setSeeking(true);

    playerRef.current.prevTick()
      .then(() => syncTicks())
      .catch((err) => console.error('Player: prevTick failed', err))
      .finally(() => setSeeking(false));
  }, [ syncTicks ]);

  const seekTo = useCallback((tick) => {
    const currentPlayer = playerRef.current;

    if (currentPlayer === null || seekingRef.current || tick === undefined) {
      return;
    }

    const wasPlaying = playingRef.current;

    historyRef.current = [];
    setPlaying(false);
    setSeeking(true);
    setTicks((prev) => ({ ...prev, current: tick }));

    currentPlayer.seekToTick(tick).then(() => {
      syncTicks();

      if (wasPlaying) {
        startPlayback(rateRef.current);
      }
    }).catch((err) => console.error('Player: seekToTick failed', err))
      .finally(() => setSeeking(false));
  }, [ syncTicks, startPlayback ]);

  const handleSeekToStart = useCallback(() => seekTo(playerRef.current?.getFirstTick()), [ seekTo ]);
  const handleSeekToEnd = useCallback(() => seekTo(playerRef.current?.getLastTick()), [ seekTo ]);
  const handleSeek = useCallback((tick) => seekTo(tick), [ seekTo ]);

  const handleResetClicked = useCallback(() => {
    loadRequestIdRef.current += 1;
    resetPlayer();
  }, [ resetPlayer ]);

  const demo = player?.getDemo() ?? null;

  return {
    demo, fileName, playing, rate, seeking, ticks, contentVersion,
    fileInputRef, historyRef,
    handleFileChanged, handleResetClicked,
    handlePlayClicked, handlePauseClicked, handleRateChange,
    handleNextTick, handlePrevTick, handleSeek,
    handleSeekToStart, handleSeekToEnd
  };
}
