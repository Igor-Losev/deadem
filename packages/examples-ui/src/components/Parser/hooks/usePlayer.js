import { InterceptorStage, ParserConfiguration, Player } from 'deadem';
import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_HISTORY = 100;

function getInitialGameState() {
  return { clockGame: null, clockTotal: null, state: null, paused: null, tick: null };
}

export default function usePlayer() {
  const fileInputRef = useRef(null);
  const historyRef = useRef([]);

  const [ fileName, setFileName ] = useState(null);
  const [ game, setGame ] = useState(getInitialGameState);
  const [ seeking, setSeeking ] = useState(false);

  const [ player, setPlayer ] = useState(null);
  const [ playing, setPlaying ] = useState(false);
  const [ rate, setRate ] = useState(1);
  const [ ticks, setTicks ] = useState({ current: -1, first: -1, last: -1 });

  const [ contentVersion, setContentVersion ] = useState(0);
  const lastContentTickRef = useRef(-1);

  const playerRef = useRef(null);
  const playingRef = useRef(false);
  const seekingRef = useRef(false);
  const rateRef = useRef(1);

  playerRef.current = player;
  playingRef.current = playing;
  seekingRef.current = seeking;
  rateRef.current = rate;

  const handleFileChanged = (event) => {
    const file = event.target.files[0];

    if (player) {
      player.dispose();
    }

    const parserConfiguration = new ParserConfiguration({
      breakInterval: 100,
      parserThreads: 0
    });
    const newPlayer = new Player(parserConfiguration);
    newPlayer.registerPostInterceptor(InterceptorStage.DEMO_PACKET, (demoPacket) => {
      const h = historyRef.current;

      h.push(demoPacket);

      if (h.length > MAX_HISTORY) {
        h.splice(0, h.length - MAX_HISTORY);
      }
    });

    setFileName(file.name);
    setPlayer(newPlayer);

    newPlayer.load(file.stream())
      .then(() => {
        setTicks({ current: newPlayer.getCurrentTick(), first: newPlayer.getFirstTick(), last: newPlayer.getLastTick() });
      });
  };

  useEffect(() => {
    if (!playing || !player) {
      return;
    }

    let rafId;

    const tick = () => {
      const current = player.getCurrentTick();

      setTicks((prev) => prev.current === current ? prev : { current, first: prev.first, last: prev.last });

      if (Math.abs(current - lastContentTickRef.current) >= 256) {
        lastContentTickRef.current = current;
        setContentVersion((v) => v + 1);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [ playing, player ]);

  const syncTicks = useCallback(() => {
    const p = playerRef.current;

    if (p === null) {
      return;
    }

    setTicks({ current: p.getCurrentTick(), first: p.getFirstTick(), last: p.getLastTick() });
    setContentVersion((v) => v + 1);
  }, []);

  const startPlayback = useCallback((playRate) => {
    const p = playerRef.current;

    if (p === null) {
      return;
    }

    setPlaying(true);

    p.play(playRate).then(() => {
      setPlaying(false);
      syncTicks();
    }).catch(() => {});
  }, [ syncTicks ]);

  const handlePauseClicked = useCallback(() => {
    const p = playerRef.current;

    if (!p || !playingRef.current) {
      return;
    }

    p.pause();

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
    const rates = [ 1, 2, 4, 8, 16, 32, 64, 128 ];
    const next = rates[(rates.indexOf(rateRef.current) + 1) % rates.length];

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

    playerRef.current.nextTick().then(() => {
      syncTicks();
    }).finally(() => setSeeking(false));
  }, [ syncTicks ]);

  const handlePrevTick = useCallback(() => {
    if (playerRef.current === null || seekingRef.current) {
      return;
    }

    historyRef.current = [];
    setSeeking(true);

    playerRef.current.prevTick().then(() => {
      syncTicks();
    }).finally(() => setSeeking(false));
  }, [ syncTicks ]);

  const seekTo = useCallback((tick) => {
    const p = playerRef.current;

    if (p === null || seekingRef.current) {
      return;
    }

    const wasPlaying = playingRef.current;

    historyRef.current = [];
    setPlaying(false);
    setSeeking(true);
    setTicks((prev) => ({ ...prev, current: tick }));

    p.seekToTick(tick).then(() => {
      syncTicks();

      if (wasPlaying) {
        startPlayback(rateRef.current);
      }
    }).finally(() => setSeeking(false));
  }, [ syncTicks, startPlayback ]);

  const handleSeekToStart = useCallback(() => seekTo(playerRef.current?.getFirstTick()), [ seekTo ]);
  const handleSeekToEnd = useCallback(() => seekTo(playerRef.current?.getLastTick()), [ seekTo ]);
  const handleSeek = useCallback((tick) => seekTo(tick), [ seekTo ]);

  const handleResetClicked = () => {
    if (player) {
      player.dispose();
    }

    historyRef.current = [];

    setPlayer(null);
    setFileName(null);
    setGame(getInitialGameState);
    setPlaying(false);
    setRate(1);
    setSeeking(false);
    setTicks({ current: -1, first: -1, last: -1 });

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const demo = player?.getDemo() ?? null;

  return {
    player, demo, fileName, game, playing, rate, seeking, ticks, contentVersion,
    fileInputRef, historyRef,
    handleFileChanged, handleResetClicked,
    handlePlayClicked, handlePauseClicked, handleRateChange,
    handleNextTick, handlePrevTick, handleSeek,
    handleSeekToStart, handleSeekToEnd
  };
}
