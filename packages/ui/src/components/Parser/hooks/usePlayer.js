import { useCallback, useEffect, useRef, useState } from 'react';

import { loadLibraryModule } from '../../../libraries';

import {
  PACKET_HISTORY_SIZE,
  PLAYBACK_RATES,
  REFRESH_INTERVAL_PLAYER_TICK_MS
} from '../config';
import { createTickStore } from '../tickStore';

const INITIAL_TICKS = { first: -1, last: -1 };
const INITIAL_PLAYER_ERROR = null;

function formatPlayerError(operationLabel, error) {
  const details = error instanceof Error ? error.message : null;

  return details ? `${operationLabel}: ${details}` : operationLabel;
}

function getIsPlaybackInterruptedError(error) {
  return error instanceof Error && error.name === 'PlaybackInterruptedError';
}

export default function usePlayer(library, updatesEnabled = true) {
  const fileInputRef = useRef(null);
  const historyRef = useRef([]);
  const entityDiffRef = useRef({ events: [], fullSnapshot: false, prevTick: -1, tick: -1 });
  const loadRequestIdRef = useRef(0);
  const tickStoreRef = useRef(null);

  tickStoreRef.current ??= createTickStore();

  const [ fileName, setFileName ] = useState(null);
  const [ mapName, setMapName ] = useState(null);
  const [ seeking, setSeeking ] = useState(false);
  const [ player, setPlayer ] = useState(null);
  const [ playing, setPlaying ] = useState(false);
  const [ rate, setRate ] = useState(1);
  const [ ticks, setTicks ] = useState(INITIAL_TICKS);
  const [ contentVersion, setContentVersion ] = useState(0);
  const [ playerError, setPlayerError ] = useState(INITIAL_PLAYER_ERROR);
  const [ frozen, setFrozen ] = useState(false);

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
    entityDiffRef.current = { events: [], fullSnapshot: false, prevTick: -1, tick: -1 };
    runtimeErrorsRef.current = { PlaybackInterruptedError: null };

    tickStoreRef.current.setCurrent(-1);

    setPlayer(null);
    setFileName(null);
    setMapName(null);
    setPlaying(false);
    setRate(1);
    setSeeking(false);
    setTicks(INITIAL_TICKS);
    setContentVersion(0);
    setPlayerError(INITIAL_PLAYER_ERROR);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }, []);

  const syncTicks = useCallback(() => {
    const currentPlayer = playerRef.current;

    if (currentPlayer === null) {
      return;
    }

    const current = currentPlayer.getCurrentTick();

    tickStoreRef.current.setCurrent(current);

    setTicks({ first: currentPlayer.getFirstTick(), last: currentPlayer.getLastTick() });
    setContentVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (updatesEnabled) {
      syncTicks();
    }
  }, [ updatesEnabled, syncTicks ]);

  const clearPlayerError = useCallback(() => setPlayerError(INITIAL_PLAYER_ERROR), []);

  const reportPlayerError = useCallback((operationLabel, error) => {
    setPlayerError({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message: formatPlayerError(operationLabel, error)
    });
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
      if (!getIsPlaybackInterruptedError(err)) {
        setPlaying(false);
        reportPlayerError('Playback failed', err);
      }
    });
  }, [ reportPlayerError, syncTicks ]);

  const handleFileChanged = async (event) => {
    const file = event.target.files[0];
    const requestId = loadRequestIdRef.current + 1;

    loadRequestIdRef.current = requestId;

    if (!file) {
      return;
    }

    if (!library) {
      reportPlayerError('Select a game before loading a demo');
      return;
    }

    resetPlayer();
    setFileName(file.name);

    try {
      const runtimeLibrary = await loadLibraryModule(library);

      if (loadRequestIdRef.current !== requestId) {
        return;
      }

      const { DemoPacketType, EntityOperation, InterceptorStage, ParserConfiguration, Player, PlaybackInterruptedError } = runtimeLibrary;
      const parserConfiguration = new ParserConfiguration({
        breakInterval: 100
      });
      const newPlayer = new Player(parserConfiguration);

      runtimeErrorsRef.current = { PlaybackInterruptedError };

      newPlayer.registerPostInterceptor(InterceptorStage.DEMO_PACKET, (demoPacket) => {
        if (demoPacket.type === DemoPacketType.DEM_FILE_HEADER) {
          setMapName(demoPacket.data.mapName || null);
        }

        const history = historyRef.current;

        history.push(demoPacket);

        if (history.length > PACKET_HISTORY_SIZE) {
          history.splice(0, history.length - PACKET_HISTORY_SIZE);
        }
      });

      newPlayer.registerPreInterceptor(InterceptorStage.ENTITY_PACKET, (demoPacket, messagePacket, events) => {
        const buffer = entityDiffRef.current;

        if (demoPacket.tick !== buffer.tick) {
          buffer.prevTick = buffer.tick;
          buffer.tick = demoPacket.tick;
          buffer.events = [];
          buffer.fullSnapshot = false;
        }

        if (demoPacket.type === DemoPacketType.DEM_FULL_PACKET) {
          buffer.fullSnapshot = true;
          buffer.events = [];

          return;
        }

        for (let i = 0; i < events.length; i++) {
          const event = events[i];
          const entity = event.entity;
          const operation = event.operation;

          const fields = [];

          if (operation === EntityOperation.UPDATE || operation === EntityOperation.CREATE) {
            const isCreate = operation === EntityOperation.CREATE;
            const batch = event.batch;
            const serializer = entity.class.serializer;

            for (let j = 0; j < batch.length; j++) {
              const id = batch.ids[j];

              fields.push({
                name: serializer.getNameForFieldPathId(id),
                next: batch.values[j],
                previous: isCreate ? undefined : entity.getFieldById(id),
                type: serializer.getDefinitionForFieldPathId(id).toString()
              });
            }
          }

          buffer.events.push({
            className: entity.class.name,
            fields,
            index: entity.index,
            operation: operation.code,
            serial: entity.serial
          });
        }
      });

      setPlayer(newPlayer);

      await newPlayer.load(file.stream());

      if (loadRequestIdRef.current !== requestId) {
        newPlayer.dispose();
        return;
      }

      const current = newPlayer.getCurrentTick();

      tickStoreRef.current.setCurrent(current);

      setTicks({ first: newPlayer.getFirstTick(), last: newPlayer.getLastTick() });
    } catch (err) {
      if (loadRequestIdRef.current === requestId) {
        setFileName(null);
      }

      reportPlayerError('Load failed', err);
    }
  };

  useEffect(() => {
    loadRequestIdRef.current += 1;
    resetPlayer();
  }, [ library?.key, resetPlayer ]);

  useEffect(() => {
    if (!playing || !player || !updatesEnabled || frozen) {
      return;
    }

    const pump = () => tickStoreRef.current.setCurrent(player.getCurrentTick());

    pump();

    const intervalId = setInterval(pump, REFRESH_INTERVAL_PLAYER_TICK_MS);

    return () => clearInterval(intervalId);
  }, [ playing, player, updatesEnabled, frozen ]);

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
      .catch((err) => reportPlayerError('Next tick failed', err))
      .finally(() => setSeeking(false));
  }, [ reportPlayerError, syncTicks ]);

  const handlePrevTick = useCallback(() => {
    if (playerRef.current === null || seekingRef.current) {
      return;
    }

    historyRef.current = [];
    setSeeking(true);

    playerRef.current.prevTick()
      .then(() => syncTicks())
      .catch((err) => reportPlayerError('Previous tick failed', err))
      .finally(() => setSeeking(false));
  }, [ reportPlayerError, syncTicks ]);

  const seekTo = useCallback((tick) => {
    const currentPlayer = playerRef.current;

    if (currentPlayer === null || seekingRef.current || tick === undefined) {
      return;
    }

    const wasPlaying = playingRef.current;

    historyRef.current = [];
    setPlaying(false);
    setSeeking(true);
    tickStoreRef.current.setCurrent(tick);

    currentPlayer.seekToTick(tick).then(() => {
      syncTicks();

      if (wasPlaying) {
        startPlayback(rateRef.current);
      }
    }).catch((err) => reportPlayerError('Seek failed', err))
      .finally(() => setSeeking(false));
  }, [ reportPlayerError, syncTicks, startPlayback ]);

  const handleSeekToStart = useCallback(() => seekTo(playerRef.current?.getFirstTick()), [ seekTo ]);
  const handleSeekToEnd = useCallback(() => seekTo(playerRef.current?.getLastTick()), [ seekTo ]);
  const handleSeek = useCallback((tick) => seekTo(tick), [ seekTo ]);

  const handleResetClicked = useCallback(() => {
    loadRequestIdRef.current += 1;
    resetPlayer();
  }, [ resetPlayer ]);

  const toggleFrozen = useCallback(() => setFrozen((value) => !value), []);

  const demo = player?.getDemo() ?? null;

  return {
    demo, fileName, mapName, playing, rate, seeking, ticks, tickStore: tickStoreRef.current, contentVersion, playerError, frozen,
    fileInputRef, historyRef, entityDiffRef,
    clearPlayerError, toggleFrozen,
    handleFileChanged, handleResetClicked,
    handlePlayClicked, handlePauseClicked, handleRateChange,
    handleNextTick, handlePrevTick, handleSeek,
    handleSeekToStart, handleSeekToEnd
  };
}
