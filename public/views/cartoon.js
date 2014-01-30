define(['views/base', 'underscore', 'jquery', 'fabric', 'stackblur', 'pusher', 'color-thief', 'lib/form', 'tpl!tpl/cartoon'], function (View, _, $, fabric, StackBlur, pusher, ColorThief, form, template) {
    function image($img, data, width, height) {
        $img.attr('width', width);
        $img.attr('height', height);
        $img.attr('src', data);
    }


    function getRoundedValue(value, intervalSize) {
        var result = Math.round(value);
        var mod = result % intervalSize;
        result += mod < (intervalSize / 2) ? -mod : intervalSize - mod;
        return result;

    }


    function hsvToRgb(h, s, v) {
        var r, g, b;

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }

        return [ r * 255, g * 255, b * 255 ];
    }

    function rgbToHsv(r, g, b) {

        r /= 255, g /= 255, b /= 255;

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max == 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return [ h, s, v ];
    }

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
                base = this.orig
                ;
            var cmap = this.cmap || new ColorThief().getPaletteCmap({data: base, height: imageData.height, width: imageData.width}, this.paletteSize, this.quality);
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
    function colordodge(mask, image) {
        return (((image == 255) ? image : Math.min(255, (( mask << 8 ) / (255 - image)
            ))));
    }

    var palTemplate = _.template('<')


    return View.extend({
        events: {
            'change input[type="file"]': 'onFileChange',
            'submit': 'onApply',
            'change input[type="text"]': 'apply',
            'change input[type="range"]': 'apply',
            'change input[type="number"]': 'apply'
        },
        onApply: function (e) {
            e && e.preventDefault && e.preventDefault();
            this.apply();
        },
        apply: function () {
            var obj = form.toObject(this.$('form'));
            console.log('onApply', obj)
            this.transform(obj, this.$('.img1'));
        },
        extractImg: function ($img) {
            var img = $img[0];
            var canvasEl = document.createElement('canvas');
            canvasEl.width = img.width;
            canvasEl.height = img.height;
            var context = canvasEl.getContext('2d');
            context.drawImage(img, 0, 0, img.width, img.height);
            return context.getImageData(0, 0, img.width, img.height);
        },
        canvas: function (create) {
            if (this.staticCanvas) {
                return this.staticCanvas;
            }
            return (this.staticCanvas = new fabric.StaticCanvas('out'));
        },
        drawPalette: function (imageData, opts) {

        },
        transform: _.debounce(function (opts, $img, iData) {
            if (!iData) {
                iData = this.extractImg($img);
            }
            var staticCanvas = this.canvas();
            staticCanvas.clear();
            var img = $img[0];
            var imgInstance = new fabric.Image(img, {
                left: 0,
                top: 0
            });
            var tmpCanvas = new fabric.StaticCanvas(document.createElement('canvas'));
            var tmpImg = new fabric.Image(img, {
                left: 0,
                top: 0});
            tmpImg.filters.push(new StackBlur(opts));
            tmpCanvas.add(tmpImg);
            tmpImg.applyFilters(tmpCanvas.renderAll.bind(tmpCanvas));
            // var cmap = new ColorThief().getPaletteCmap(tmpCanvas.getContext().getImageData(), opts.paletteSize, opts.quality);

            //tmpCanvas.applyFilters(tmpCanvas.renderAll.bind(tmpCanvas));
            var odata = tmpCanvas.getContext().getImageData(0, 0, img.width, img.height).data;
            staticCanvas.add(imgInstance);
            imgInstance.filters.push(new fabric.Image.filters.Grayscale(), new fabric.Image.filters.Invert(),
                new StackBlur({
                    radius: opts.radius
                })
                , new Dodgify(_.extend({orig: odata}, opts))
            );
            imgInstance.applyFilters(staticCanvas.renderAll.bind(staticCanvas));
        }, 200),
        onFileChange: function (e) {
            var $img = this.$('.img1');
            var transform = this.transform.bind(this);
            var $pal = this.$('.palette');
            var opts = form.toObject(this.$('form'));
            this.thumbnail(this.$(e.currentTarget), function (err, data, width, height, iData) {

                image($img, data, width, height);
                transform(opts, $img, iData);
            });
        },

        thumbnail: function thumbnail($el, callback) {
            var file = $el[0].files[0]
            var img = new Image();
            var reader = new FileReader();
            reader.onload = function (e) {
                img.src = e.target.result
            }
            reader.readAsDataURL(file);
            var maxHeight = this.maxHeight;
            var scale = _.partial(this.scaleY, maxHeight);
            $(img).on('load', function () {
                $el.replaceWith($el.clone(true));
                var canvas = $('<canvas></canvas>')[0];
                var width = scale(img);
                canvas.width = img.width;
                canvas.height = maxHeight;
                var ctx =
                    canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, img.width, maxHeight);
                var url = canvas.toDataURL('image/png');
                callback(null, url, img.width, maxHeight, ctx.getImageData(0, 0, canvas.width, canvas.height));
            });
        },

        maxHeight: 100,
        scaleY: function (maxHeight, img) {
            var oheight = img.height;
            var owidth = img.width;
            var ratio = maxHeight / oheight;
            img.height = ratio * img.height;
            img.width = ratio * img.width;
            return img;
        },
        template: template
    })


})
;