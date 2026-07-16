// Right-click disable
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

// Keyboard shortcuts disable (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
document.addEventListener('keydown', function (e) {
    if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
    ) {
        e.preventDefault();
    }
});

// Text selection disable (optional - image/text copy rokne ke liye)
document.addEventListener('selectstart', function (e) {
    e.preventDefault();
});