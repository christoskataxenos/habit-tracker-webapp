export const vibrate = (pattern = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

export const HapticPatterns = {
    light: 10,
    medium: 40,
    heavy: 80,
    success: [10, 30, 10],
    error: [50, 30, 50, 30, 50]
};
