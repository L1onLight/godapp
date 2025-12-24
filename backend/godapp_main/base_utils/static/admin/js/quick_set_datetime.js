(function () {
    'use strict';

    function formatDate(date) {
        const pad = (num) => String(num).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    function formatTime(date) {
        const pad = (num) => String(num).padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    function setQuickDateTime(dateInput, timeInput, value) {
        const now = new Date();
        let targetDate;

        switch (value) {
            case '15':
                targetDate = new Date(now.getTime() + 15 * 60 * 1000);
                break;
            case '60':
                targetDate = new Date(now.getTime() + 60 * 60 * 1000);
                break;
            case 'next_day':
                targetDate = new Date(now);
                targetDate.setDate(targetDate.getDate() + 1);
                targetDate.setHours(18, 0, 0, 0);
                break;
            default:
                return;
        }

        dateInput.value = formatDate(targetDate);
        timeInput.value = formatTime(targetDate);

        // Trigger change events for any listeners
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        timeInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function initQuickSetButtons() {
        document.querySelectorAll('.quick-set-buttons').forEach(container => {
            const targetId = container.dataset.target;

            // Django's AdminSplitDateTime creates two inputs: one for date, one for time
            const dateInput = document.getElementById(targetId + '_0');
            const timeInput = document.getElementById(targetId + '_1');

            if (!dateInput || !timeInput) return;

            container.querySelectorAll('.quick-set-btn').forEach(button => {
                button.addEventListener('click', function (e) {
                    e.preventDefault();
                    const value = this.dataset.value;
                    setQuickDateTime(dateInput, timeInput, value);
                });
            });
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuickSetButtons);
    } else {
        initQuickSetButtons();
    }

    // Re-initialize when Django admin adds inline forms
    if (typeof django !== 'undefined' && django.jQuery) {
        django.jQuery(document).on('formset:added', function () {
            initQuickSetButtons();
        });
    }
})();
