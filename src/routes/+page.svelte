<script lang="ts">
    import { Brain, Coffee, Play, Pause, ArrowRight, RotateCcw } from "lucide-svelte";

    import "$lib/styles/colors.scss";
    import "$lib/styles/fonts.scss";

    import type { Config, Session } from "$lib/types";
    import { ConfigDefault, SessionDefault } from "$lib/types";
    import { Format } from "$lib/utils/format";
    import { PlayClick, PlayAlarm } from "$lib/audio/player";

    let config: Config = $state(ConfigDefault);
    let session: Session = $state(SessionDefault);
    let remainingTime: number = $state(0);
    let isRunning: boolean = $state(false);
    let currentSession: number = $state(1);

    $effect(() => {
        const storedConfig = localStorage.getItem("config");
        if (storedConfig) {
            try {
                config = JSON.parse(storedConfig) as Config;
            } catch (e) {
                console.error("Error parsing config from localStorage", e);
                localStorage.removeItem("config");
            }
        }
    });

    $effect(() => {
        remainingTime = config.FocusLen;
    });

    $effect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                remainingTime -= 1000;
                if (remainingTime <= 0) {
                    PlayAlarm();
                    if (config.AutoResumeTimer) {
                        nextSession();
                    } else {
                        isRunning = false;
                    }
                }
            }, 1000);
            return () => {
                clearInterval(interval);
            };
        }
    });

    const toggleTimer = function () {
        if (remainingTime > 0) {
            isRunning = !isRunning;
        }
    };

    const restartTimer = function () {
        switch (session) {
            case "focus":
                remainingTime = config.FocusLen;
                break;
            case "short_break":
                remainingTime = config.ShortBreakLen;
                break;
            case "long_break":
                remainingTime = config.LongBreakLen;
                break;
        }
    };

    const nextSession = function () {
        switch (session) {
            case "focus":
                if (currentSession > config.LongBreakInterval - 1) {
                    session = "long_break";
                    remainingTime = config.LongBreakLen;
                } else {
                    session = "short_break";
                    remainingTime = config.ShortBreakLen;
                }
                break;
            case "short_break":
                session = "focus";
                remainingTime = config.FocusLen;
                currentSession++;
                break;
            case "long_break":
                session = "focus";
                remainingTime = config.FocusLen;
                currentSession = 1;
                break;
        }
    };
</script>

<svelte:head>
    {#if session === "focus"}
        <title
            >Focus - {Format.MsToMinutes(remainingTime)}:{Format.MsToSeconds(remainingTime)}</title
        >
        <link rel="icon" href="/favicon_focus.ico" />
    {:else}
        <title
            >{session === "short_break" ? "Short Break" : "Long Break"} - {Format.MsToMinutes(
                remainingTime,
            )}:{Format.MsToSeconds(remainingTime)}</title
        >
        <link rel="icon" href="/favicon_break.ico" />
    {/if}
</svelte:head>

<div class={`main ${session === "focus" ? "bg-red-lighter" : "bg-blue-lighter"}`}>
    <div class="wrap">
        <div
            class={`title ${
                session === "focus"
                    ? "color-red bg-red-lighter border-red"
                    : "color-blue bg-blue-lighter border-blue"
            }`}
        >
            {#if session === "focus"}
                <Brain />
                <p>Focus {currentSession}/{config.LongBreakInterval}</p>
            {:else if session === "short_break"}
                <Coffee />
                <p>Short Break {currentSession}/{config.LongBreakInterval}</p>
            {:else if session === "long_break"}
                <Coffee />
                <p>Long Break {currentSession}/{config.LongBreakInterval}</p>
            {/if}
        </div>
        <div class={`timer ${session === "focus" ? "color-red" : "color-blue"}`}>
            <span class={`minutes font-weight-${isRunning ? 400 : 300}`}
                >{Format.MsToMinutes(remainingTime)}</span
            >
            <span class={`seconds font-weight-${isRunning ? 400 : 300}`}
                >{Format.MsToSeconds(remainingTime)}</span
            >
        </div>
        <div class="btns">
            <button
                onclick={() => {
                    PlayClick();
                    restartTimer();
                }}
                class={`${
                    session === "focus"
                        ? "bg-red-light color-red-dark"
                        : "bg-blue-light color-blue-dark"
                }`}><RotateCcw /></button
            >
            <button
                onclick={() => {
                    PlayClick();
                    toggleTimer();
                }}
                class={`${
                    session === "focus" ? "bg-red color-red-lighter" : "bg-blue color-blue-lighter"
                }`}
            >
                {#if isRunning}
                    <Pause />
                {:else}
                    <Play />
                {/if}
            </button>
            <button
                onclick={() => {
                    PlayClick();
                    nextSession();
                }}
                class={`${
                    session === "focus"
                        ? "bg-red-light color-red-dark"
                        : "bg-blue-light color-blue-dark"
                }`}><ArrowRight /></button
            >
        </div>
    </div>
</div>

<style lang="scss">
    .main {
        height: 100vh;
        width: 100vw;
    }

    .main,
    .wrap,
    .timer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .title {
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid;
        padding: 0.5em 1em;
        border-radius: 2em;

        p {
            margin-left: 0.3em;
            font-size: 1.2em;
            font-weight: 400;
        }
    }

    .timer {
        padding: 2em;

        span {
            font-size: 12em;
            line-height: 0.9em;
        }
    }

    .btns {
        button {
            padding: 1em;
            cursor: pointer;
            border: none;
            border-radius: 1em;
            transition: 0.3s;
        }

        button:hover {
            opacity: 0.9;
        }

        button:nth-child(2) {
            padding: 1em 2em;
            margin: 0.8em;
        }
    }
</style>
