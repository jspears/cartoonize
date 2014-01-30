define(['fabric', 'pusher', 'color-thief'], function (fabric, pusher, ColorThief) {

    var Dodgify = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
        type: 'dodgify',
        initialize: function (options) {
            _.extend(this, {
                paletteSize: 10,
                quality: 2,
                valueIntervalSize: 10,
                saturationPercent: 10,
                valuePercent: 55,
                top: 0.87
            }, options);
        },
        applyTo: function (canvasEl) {
            var context = canvasEl.getContext('2d'),
                imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
                dodge = imageData.data,
                base = this.imageData.data
                ;
            var cmap = this.cmap || (this.cmap = new ColorThief().getPaletteCmap(imageData, this.paletteSize, this.quality));
            _.each(cmap.palette(), function (rgb) {
                $('<div style="height:20px;width:20px;float:left"></div>').css({'background-color': 'rgb(' + rgb.join(',') + ')'}).appendTo(this);
            }, $('.palette').empty());

            var height = imageData.height, width = imageData.width;

            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; ++x) {
                    // Read the color data at the given pixel
                    var r = (y * width + x) * 4, g = r + 1, b = g + 1, a = b + 1;
                    var rgba = [
                        base[r],
                        base[g],
                        base[b]
                    ];
                    var color = cmap.nearest(rgba);
                    // Write the new color data back to the buffer
                    dodge[r] = color[0];
                    dodge[g] = color[1];
                    dodge[b] = color[2];
                    dodge[a] = 255;
                }
            }
            context.putImageData(imageData, 0, 0);
        },
        toObject: function () {
            return fabric.util.object.extend(this.callSuper('toObject'), {
                orig: this.orig
            });
        }
    });
    Dodgify.fromObject = function (object) {
        return new Dodgify(object);
    };

    return Dodgify;
});