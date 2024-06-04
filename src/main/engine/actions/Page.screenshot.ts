import { Action, params } from '../model/index.js';

export class ScreenshotAction extends Action {
    static readonly $type = 'Page.screenshot';
    static readonly $icon = 'fas fa-camera';
    static override readonly $help = `
Captures the screenshot and sends it to the Job.

### Parameters

- full page: emulate viewport to match content width and content height of current webpage,
  which generally results in full page screenshot
  (unless the page uses scrollable containers with fixed width or height)
- public: mark screenshots as public
- min width: minimum width for full page emulation
- max width: maximum width for full page emulation
- min height: minimum height for full page emulation
- max height: maximum height for full page emulation
- scroll to top: scroll the page to the top before taking a screenshot
- quality: compression quality from range [0..100] (jpeg only)

### Use For

- taking debug screenshots
- sending public screenshots
`;

    @params.Boolean()
    fullPage: boolean = false;

    @params.Boolean()
    isPublic: boolean = true;

    @params.Number({ min: 0 })
    minWidth: number = 0;

    @params.Number({ min: 0 })
    maxWidth: number = 5000;

    @params.Number({ min: 0 })
    minHeight: number = 0;

    @params.Number({ min: 0 })
    maxHeight: number = 10000;

    @params.Boolean()
    scrollToTop: boolean = true;

    @params.Number({ min: 0, max: 100 })
    quality: number = 50;

    async exec() {
        if (this.scrollToTop) {
            await this.$page.evaluate(() => {
                window.scrollTo(0, 0);
            });
        }
        // TODO make level configurable per-action (?)
        await this.$reporter.sendScreenshot('info', {
            label: this.label,
            isPublic: this.isPublic,
            fullPage: this.fullPage,
            minHeight: this.minHeight,
            maxHeight: this.maxHeight,
            minWidth: this.minWidth,
            maxWidth: this.maxWidth,
            quality: this.quality,
        });
    }
}
