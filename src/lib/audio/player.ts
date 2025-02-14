export const PlayClick = function () {
    const audio = new Audio("/audio/click.mp3");
    audio.volume = 1;
    audio.play();
};

export const PlayAlarm = function () {
    const audio = new Audio("/audio/alarm.mp3");
    audio.volume = 0.5;
    audio.play();
};
