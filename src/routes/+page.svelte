<script lang="ts">
    import { Brain, Coffee, Play, Pause, ArrowRight, RotateCcw, Bolt, X } from "lucide-svelte";

    import "$lib/styles/colors.scss";
    import "$lib/styles/fonts.scss";

    import type { Config, Session } from "$lib/types";
    import { ConfigDefault, SessionDefault } from "$lib/types";
    import { Format } from "$lib/utils/format";
    import { PlayClick, PlayAlarm } from "$lib/audio/player";
    import Switch from "$lib/components/switch.svelte";
    import Input from "$lib/components/input.svelte";

    let config: Config = $state(ConfigDefault);
    let session: Session = $state(SessionDefault);
    let remainingTime: number = $state(0);
    let isRunning: boolean = $state(false);
    let currentSession: number = $state(1);

    $effect(() => {
        const storedConfig = localStorage.getItem("config");
        if (storedConfig) {
            try {
                const parsedConfig = JSON.parse(storedConfig) as Config;
                config = parsedConfig;
                remainingTime = parsedConfig.FocusLen;
            } catch (e) {
                console.error("Error parsing config from localStorage", e);
                localStorage.removeItem("config");
            }
        }
    });

    $effect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                remainingTime -= 1000;
                if (remainingTime <= 0) {
                    if (config.SoundEnabled) {
                        PlayAlarm();
                    }
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

    let settingsWrap: HTMLDivElement;
    let settingsOpenBtn: HTMLDivElement;
    let settingsCloseBtn: HTMLSpanElement;
    let settingsShow = $state([false, false]);

    $effect(() => {
        settingsOpenBtn.onclick = function () {
            if (config.SoundEnabled) {
                PlayClick();
            }
            settingsShow[0] = !settingsShow[0];
            setTimeout(() => {
                settingsShow[1] = !settingsShow[1];
            }, 10);
        };

        const closeSettings = function () {
            if (config.SoundEnabled) {
                PlayClick();
            }
            settingsShow[1] = !settingsShow[1];
            setTimeout(() => {
                settingsShow[0] = !settingsShow[0];
            }, 300);
        };

        settingsCloseBtn.onclick = closeSettings;
        settingsWrap.onclick = function (event) {
            if (event.target === settingsWrap) {
                closeSettings();
            }
        };
    });

    const saveConfig = function () {
        try {
            localStorage.setItem("config", JSON.stringify(config));
        } catch (e) {
            console.error("Error parsing config from localStorage", e);
            localStorage.removeItem("config");
        }
    };

    const resetConfig = function () {
        if (config.SoundEnabled) {
            PlayClick();
        }

        config = ConfigDefault;
        saveConfig();

        if (!isRunning) {
            restartTimer();
        }
    };
</script>

<svelte:head>
    {#if session === "focus"}
        <title
            >Focus -
            {Format.MsToMinutes(remainingTime)}:{Format.MsToSeconds(remainingTime)}</title
        >
        <link rel="icon" href="/pomolite_focus.ico" />
    {:else}
        <title
            >{session === "short_break" ? "Short Break" : "Long Break"}
            -
            {Format.MsToMinutes(remainingTime)}:{Format.MsToSeconds(remainingTime)}</title
        >
        <link rel="icon" href="/pomolite_break.ico" />
    {/if}
</svelte:head>

<div class={`main ${session === "focus" ? "bg-red-lighter" : "bg-blue-lighter"}`}>
    <div class="wrap">
        <div
            class={`settings-btn
                ${session === "focus" ? "bg-red color-red-lighter" : "bg-blue color-blue-lighter"}`}
            bind:this={settingsOpenBtn}
        >
            <Bolt />
        </div>
        <div
            bind:this={settingsWrap}
            class={`settings-wrap
                ${settingsShow[0] && "settings-active-0"}
                ${settingsShow[1] && "settings-active-1"}`}
        >
            <div
                class={`settings ${
                    session === "focus"
                        ? "bg-red-lighter color-red-darker"
                        : "bg-blue-lighter color-blue-darker"
                }`}
            >
                <div>
                    <p>Settings</p>
                    <span bind:this={settingsCloseBtn}><X /></span>
                </div>
                <div>
                    <p>Focus length</p>
                    <span
                        ><Input
                            value={config.FocusLen / 60000}
                            onchange={(value: number) => {
                                config.FocusLen = value * 60000;
                                if (!isRunning) {
                                    remainingTime = config.FocusLen;
                                }
                                if (config.SoundEnabled) {
                                    PlayClick();
                                }
                                saveConfig();
                            }}
                        /></span
                    >
                </div>
                <div>
                    <p>Short break length</p>
                    <span
                        ><Input
                            value={config.ShortBreakLen / 60000}
                            onchange={(value: number) => {
                                config.ShortBreakLen = value * 60000;
                                if (!isRunning) {
                                    remainingTime = config.ShortBreakLen;
                                }
                                if (config.SoundEnabled) {
                                    PlayClick();
                                }
                                saveConfig();
                            }}
                        /></span
                    >
                </div>
                <div>
                    <p>Long break length</p>
                    <span
                        ><Input
                            value={config.LongBreakLen / 60000}
                            onchange={(value: number) => {
                                config.LongBreakLen = value * 60000;
                                if (!isRunning) {
                                    remainingTime = config.LongBreakLen;
                                }
                                if (config.SoundEnabled) {
                                    PlayClick();
                                }
                                saveConfig();
                            }}
                        /></span
                    >
                </div>
                <div>
                    <p>Podomoros until long break</p>
                    <span
                        ><Input
                            min={1}
                            value={config.LongBreakInterval}
                            onchange={(value: number) => {
                                config.LongBreakInterval = value;
                                if (config.SoundEnabled) {
                                    PlayClick();
                                }
                                saveConfig();
                            }}
                        /></span
                    >
                </div>
                <div>
                    <p>Auto resume timer</p>
                    <span
                        ><Switch
                            onclick={() => {
                                config.AutoResumeTimer = !config.AutoResumeTimer;
                                if (config.SoundEnabled) {
                                    PlayClick();
                                }
                                saveConfig();
                            }}
                            active={config.AutoResumeTimer}
                            activeClass={session === "focus" ? "bg-red" : "bg-blue"}
                        /></span
                    >
                </div>
                <div>
                    <p>Sound</p>
                    <span
                        ><Switch
                            onclick={() => {
                                config.SoundEnabled = !config.SoundEnabled;
                                if (config.SoundEnabled) {
                                    PlayClick();
                                }
                                saveConfig();
                            }}
                            active={config.SoundEnabled}
                            activeClass={session === "focus" ? "bg-red" : "bg-blue"}
                        /></span
                    >
                </div>
                <div>
                    <button onclick={resetConfig}>Reset settings</button>
                </div>
            </div>
        </div>
        <div
            class={`title ${
                session === "focus"
                    ? "color-red bg-red-lighter border-red"
                    : "color-blue bg-blue-lighter border-blue"
            }`}
        >
            {#if session === "focus"}
                <Brain />
                <p>
                    Focus
                    {currentSession}/{config.LongBreakInterval}
                </p>
            {:else if session === "short_break"}
                <Coffee />
                <p>
                    Short Break
                    {currentSession}/{config.LongBreakInterval}
                </p>
            {:else if session === "long_break"}
                <Coffee />
                <p>
                    Long Break
                    {currentSession}/{config.LongBreakInterval}
                </p>
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
                    if (config.SoundEnabled) {
                        PlayClick();
                    }
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
                    if (config.SoundEnabled) {
                        PlayClick();
                    }
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
                    if (config.SoundEnabled) {
                        PlayClick();
                    }
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
            opacity: 0.8;
        }

        button:nth-child(2) {
            padding: 1em 2em;
            margin: 0.8em;
        }
    }

    .settings-btn {
        position: fixed;
        cursor: pointer;
        top: 2em;
        right: 2em;
        padding: 0.5em 0.5em 0.3em;
        border-radius: 0.3em;
        transition: 0.3s;

        &:hover {
            opacity: 0.8;
        }
    }

    .settings-wrap {
        position: fixed;
        top: 0px;
        left: 0px;
        height: 100vh;
        width: 100vw;
        display: none;
        opacity: 0;
        transition: 0.3s;
    }

    .settings-active-0 {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .settings-active-1 {
        opacity: 1;
        backdrop-filter: blur(2px);
    }

    .settings {
        padding: 2em;
        min-width: 30em;
        max-width: 90vw;
        max-height: 90vh;
        border-radius: 1em;
        box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.3);

        div {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        div:not(:first-child) p {
            font-size: 1.2em;
        }

        div:not(:last-child) {
            margin-bottom: 1.5em;
        }

        div:nth-child(1) {
            p {
                font-size: 1.3em;
                font-weight: 400;
            }

            span {
                cursor: pointer;
            }
        }

        div:last-child {
            display: flex;
            justify-content: center;

            button {
                font-size: 1em;
                cursor: pointer;
                text-decoration: underline;
                border: none;
                background: none;
            }
        }
    }
</style>
