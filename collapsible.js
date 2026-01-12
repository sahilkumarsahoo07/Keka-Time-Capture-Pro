// collapsible.js - Handle collapsible settings sections

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollapsible);
} else {
    // DOM is already loaded
    initCollapsible();
}

function initCollapsible() {
    console.log('Collapsible script loaded');
    const appearanceHeader = document.getElementById('appearance-header');
    const appearanceContent = document.getElementById('appearance-content');

    console.log('Elements found:', {
        header: appearanceHeader,
        content: appearanceContent,
        headerClasses: appearanceHeader?.className,
        contentClasses: appearanceContent?.className
    });

    if (appearanceHeader && appearanceContent) {
        appearanceHeader.addEventListener('click', function () {
            console.log('Header clicked!');
            console.log('Before toggle - Header classes:', this.className);
            console.log('Before toggle - Content classes:', appearanceContent.className);

            // Toggle collapsed class on both header and content
            this.classList.toggle('collapsed');
            appearanceContent.classList.toggle('collapsed');

            console.log('After toggle - Header classes:', this.className);
            console.log('After toggle - Content classes:', appearanceContent.className);
        });
        console.log('Click listener attached successfully');
    } else {
        console.error('Elements not found!');
    }
}
