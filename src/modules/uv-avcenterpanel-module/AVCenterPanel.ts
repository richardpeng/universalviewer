import {BaseEvents} from "../uv-shared-module/BaseEvents";
import {CenterPanel} from "../uv-shared-module/CenterPanel";

export class AVCenterPanel extends CenterPanel {

    $avcomponent: JQuery;
    avcomponent: IIIFComponents.AVComponent;
    title: string | null;
    private _canvasReady: boolean = false;
    private _resourceOpened: boolean = false;

    constructor($element: JQuery) {
        super($element);
    }

    create(): void {

        this.setConfig('avCenterPanel');

        super.create();

        const that = this;

        $.subscribe(BaseEvents.OPEN_EXTERNAL_RESOURCE, (e: any, resources: Manifesto.IExternalResource[]) => {
            if (!this._resourceOpened) {
                that.openMedia(resources);
                this._resourceOpened = true;
            }
        });

        $.subscribe(BaseEvents.CANVAS_INDEX_CHANGED, (e: any, canvasIndex: number) => {
            const canvas: Manifesto.ICanvas | null = this.extension.helper.getCanvasByIndex(canvasIndex);

            if (canvas) {
                this.avcomponent.showCanvas(canvas.id);
            }
        });

        $.subscribe(BaseEvents.RANGE_CHANGED, (e: any, range: Manifesto.IRange) => {
            that._viewRange(range);
            that._setTitle();
        });

        $.subscribe(BaseEvents.METRIC_CHANGED, () => {
            this.avcomponent.set({
                limitToRange: this._limitToRange(),
                constrainNavigationToRange: true
            });
        });

        $.subscribe(BaseEvents.CREATED, () => {
            this._setTitle();
        });

        this.$avcomponent = $('<div class="iiif-av-component"></div>');
        this.$content.append(this.$avcomponent);

        this.avcomponent = new IIIFComponents.AVComponent({
            target: this.$avcomponent[0],
            data: {
                autoSelectRanges: false
            }
        });

        this.avcomponent.on('canvasready', () => {
            this._canvasReady = true;
        }, false);

        this.avcomponent.on('rangechanged', (rangeId: string | null) => {        
            
            if (rangeId) {

                this._setTitle();

                const range: Manifesto.IRange | null = this.extension.helper.getRangeById(rangeId);

                if (range) {
                    const currentRange: Manifesto.IRange | null = this.extension.helper.getCurrentRange();

                    if (range !== currentRange) {
                        $.publish(BaseEvents.RANGE_CHANGED, [range]);
                    }
                    
                } else {
                    $.publish(BaseEvents.NO_RANGE);
                }

            } else {
                $.publish(BaseEvents.NO_RANGE);
            } 
            
        }, false);

    }

    private _setTitle(): void {

        let title: string = '';
        let value: string | null;
        let label: Manifesto.TranslationCollection;

        // get the current range or canvas title
        const currentRange: Manifesto.IRange | null = this.extension.helper.getCurrentRange();

        if (currentRange) {
            label = currentRange.getLabel();
        } else {
            label = this.extension.helper.getCurrentCanvas().getLabel();
        }

        value = Manifesto.TranslationCollection.getValue(label);

        if (value) {
            title = value;
        }

        // get the parent range or manifest's title
        if (currentRange) {
            if (currentRange.parentRange) {
                label = currentRange.parentRange.getLabel();
                value = Manifesto.TranslationCollection.getValue(label);
            }
        } else {
            value = this.extension.helper.getLabel();
        }

        if (value) {
            title += this.content.delimiter + value;
        }

        this.title = title;

        this.resize();
    }

    openMedia(resources: Manifesto.IExternalResource[]) {

        this.extension.getExternalResources(resources).then(() => {

            this.avcomponent.set({
                helper: this.extension.helper,
                autoPlay: this.config.options.autoPlay,
                defaultAspectRatio: 0.56,
                limitToRange: this._limitToRange(),
                doubleClickMS: 350,
                content: this.content
            });

            this.resize();
        });
    }

    private _limitToRange(): boolean {
        return !this.extension.isDesktopMetric();
    }

    private _viewRange(range: Manifesto.IRange): void {

        Utils.Async.waitFor(() => {
            return this._canvasReady;
        }, () => {
            this.avcomponent.playRange(range.id);
            this.resize();
        });
    }

    viewCanvas(canvasIndex: number): void {
        const canvas: Manifesto.ICanvas | null = this.extension.helper.getCanvasByIndex(canvasIndex);
        
        if (canvas) {
            this.avcomponent.showCanvas(canvas.id);
        }
    }

    resize() {

        super.resize();

        if (this.title) {
            this.$title.ellipsisFill(this.title);
        }

        this.$avcomponent.height(this.$content.height());

        this.avcomponent.resize(); 
              
    }
}