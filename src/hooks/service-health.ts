import { ActivationResponse } from "@/models/health";
import { isAxiosError } from "axios";
import { useEffect, useMemo, useRef, useState } from "react";

const POPUP_DELAY = 3_500;
const STATUS_RETRY = 3 * 60 * 1000;
const HEALTH_RETRY = 5_000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface StartupApi {
  status(): Promise<ActivationResponse>;
  start(): Promise<ActivationResponse>;
  health(): Promise<boolean>;
}

enum State {
  CHECK_STATUS,
  ACTIVATE,
  WAIT_FOR_SERVER,
  WAIT_FOR_HEALTH,
  READY,
}

export function useServiceHealth(api: StartupApi) {
  const cancelled = useRef(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<Error>();

  if (error) {
    throw error;
  }

  useEffect(() => {
    cancelled.current = false;

    const popupTimer = setTimeout(() => {
      if (!cancelled.current) {
        setPopupVisible(true);
      }
    }, POPUP_DELAY);

    let state = State.CHECK_STATUS;

    const run = async () => {
      while (!cancelled.current) {
        try {
          switch (state) {
            case State.CHECK_STATUS: {
              setTitle("Checking service reachability");
              setMessage("Taking longer than expected...");

              const response = await api.status();

              switch (response.state) {
                case "running":
                  state = State.WAIT_FOR_HEALTH;
                  break;

                case "starting":
                case "stopping":
                  state = State.WAIT_FOR_SERVER;
                  break;

                case "stopped":
                  state = State.ACTIVATE;
                  break;

                default:
                  throw new Error(`Unknown status: ${response.state}`);
              }

              break;
            }

            case State.ACTIVATE: {
              setTitle("Service stopped: Waking up...");
              setMessage("This might take few minutes, browser window can be safely closed.");

              const response = await api.start();

              switch (response.state) {
                case "running":
                  state = State.WAIT_FOR_HEALTH;
                  break;

                case "starting":
                  state = State.WAIT_FOR_SERVER;
                  break;

                default:
                  throw new Error(`Unexpected activation status: ${response.state}`);
              }

              break;
            }

            case State.WAIT_FOR_SERVER: {
              setTitle("Service stopped: Waking up...");
              setMessage("This might take few minutes, browser window can be safely closed.");

              await sleep(STATUS_RETRY);

              state = State.CHECK_STATUS;
              break;
            }

            case State.WAIT_FOR_HEALTH: {
              setTitle("Service started: Waiting to come online...");
              setMessage("Almost there, browser window can be safely closed.");

              const healthy = await api.health();

              if (healthy) {
                clearTimeout(popupTimer);
                setPopupVisible(false);
                state = State.READY;
              } else {
                await sleep(HEALTH_RETRY);
              }

              break;
            }

            case State.READY:
              return;
          }
        } catch (err) {
          if (cancelled.current) {
            return;
          }

          if (state === State.CHECK_STATUS && !isAxiosError(err)) {
            throw new Error("NETWORK_ERROR");
          }

          if (state === State.WAIT_FOR_HEALTH) {
            await sleep(HEALTH_RETRY);
            continue;
          }

          setError(new Error("SERVICE_DOWN"));
          return;
        }
      }
    };

    run();

    return () => {
      cancelled.current = true;
      clearTimeout(popupTimer);
    };
  }, [api]);

  return useMemo(
    () => ({
      popupVisible,
      title,
      message,
    }),
    [popupVisible, title, message],
  );
}
