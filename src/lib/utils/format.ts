export const Format = {
    MsToSeconds: (ms: number): string => {
        const seconds = Math.floor((ms % 60000) / 1000);
        return String(seconds).padStart(2, "0");
    },
    MsToMinutes: (ms: number): string => {
        const minutes = Math.floor(ms / 60000);
        return String(minutes).padStart(2, "0");
    },
};
