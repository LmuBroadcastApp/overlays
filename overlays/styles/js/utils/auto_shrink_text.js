class AutoShrinkText
{
    constructor(containerSelector, options = {})
    {
        this.options = {minFontSize: 12, maxFontSize: 100, debounceTime: 250, ...options};
        setInterval(()=>{this.adjustFontSize()}, this.options.debounceTime);
        this.selector = containerSelector;
    }

    adjustFontSize()
    {
        const container = document.querySelector(this.selector);
        const {minFontSize, maxFontSize} = this.options;

        // Check if overflow occurs
        if (window.innerHeight >= container.scrollHeight)
        {
            return;
        }

        // Binary search for optimal font size
        let low = minFontSize;
        let high = maxFontSize;
        let optimal = minFontSize;

        while (low <= high)
        {
            const mid = Math.floor((low + high) / 2);
            container.style.fontSize = `${mid}px`;

            if (window.innerHeight >= container.scrollHeight)
            {
                optimal = mid;
                low = mid + 1;
            }
            else
            {
                high = mid - 1;
            }
        }

        container.style.fontSize = `${optimal}px`;
    }
}
