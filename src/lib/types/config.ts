export type Config = {
    FocusLen: number;
    ShortBreakLen: number;
    LongBreakLen: number;
    LongBreakInterval: number;
    AutoResumeTimer: boolean;
    SoundEnabled: boolean;
};

export const ConfigDefault = {
    FocusLen: 25 * 60 * 1000,
    ShortBreakLen: 5 * 60 * 1000,
    LongBreakLen: 10 * 60 * 1000,
    LongBreakInterval: 4,
    AutoResumeTimer: true,
    SoundEnabled: true,
};
