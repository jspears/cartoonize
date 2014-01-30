define(['views/base', 'underscore', 'fabric', 'tpl!tpl/cartoon'], function (View, _, fabric, template) {
    function image($img, data, width, height) {
        $img.attr('width', width);
        $img.attr('height', height);
        $img.attr('src', data);
    }

    function imageTransform($img, transforms, data, width, height) {
        $img.attr('width', width);
        $img.attr('height', height);
        $img.attr('src', this.transform(data, transforms, width, height));
    }

    function buildKernel(sigma) {
        var ss = sigma * sigma;
        var factor = 2 * Math.PI * ss;
        var kernelSize, kernel = [
            []
        ];
        var i = 0, j, kernelSum = 0;
        do {
            var g = Math.exp(-(i * i) / (2 * ss)) / factor;
            if (g < 1e-3) break;
            kernel[0].push(g);
            ++i;
        } while (i < 7);
        kernelSize = i;
        for (j = 1; j < kernelSize; ++j) {
            var arr = [];
            kernel.push(arr);
            for (i = 0; i < kernelSize; ++i) {
                var g = Math.exp(-(i * i + j * j) / (2 * ss)) / factor;
                arr.push(g);
            }
        }
        for (j = 1 - kernelSize; j < kernelSize; ++j) {
            for (i = 1 - kernelSize; i < kernelSize; ++i) {
                kernelSum += kernel[Math.abs(j)][Math.abs(i)];
            }
        }
        return {size: kernelSize, kernel: kernel, sum: kernelSum};
    }

    function colordodge(mask, image) {
        return (((image == 255) ? image : Math.min(255, (( mask << 8 ) / (255 - image)
            ))));
    }

    function sketch(data, height, width) {
        for (var i = 0; i < data.length; i += 4) {
            // red
            data[i] = 255 - data[i];
            // green
            data[i + 1] = 255 - data[i + 1];
            // blue
            data[i + 2] = 255 - data[i + 2];


        }
    }

    return View.extend({
        events: {
            'change input[type="file"]': 'onFileChange'
        },
        onFileChange: function (e) {
            var $img = this.$('.img1');
            var $img2 = this.$('.img2');
            var $img3 = this.$('.img3');
            var $img4 = this.$('.img4');
            var $img5 = this.$('.img5');
            var grey = this.grey;
            var invert = this.invert;
            var gaus = this.gaus;
            var transform = this.transform.bind(this);
            var it = imageTransform.bind(this);
            this.thumbnail(this.$(e.currentTarget), function (err, data, width, height) {
                image($img, data, width, height);
                it($img2, [grey], data, width, height);
                it($img3, [grey, invert], data, width, height);
                it($img4, [grey, invert, gaus], data, width, height);
                it($img5, [grey, invert, gaus, sketch], data, width, height);
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
                canvas.getContext("2d").drawImage(img, 0, 0, img.width, maxHeight);
                var url = canvas.toDataURL('image/png');
                callback(null, url, img.width, maxHeight);
            });
        },
        sigma: 3,
        gaus: function (data, height, width) {
            var obj = buildKernel(this.sigma), kernelSize = obj.size, kernel = obj.kernel, kernelSum = obj.sum;
            for (var y = 0; y < height; ++y) {
                for (var x = 0; x < width; ++x) {
                    var r = 0, g = 0, b = 0, a = 0;
                    for (j = 1 - kernelSize; j < kernelSize; ++j) {
                        if (y + j < 0 || y + j >= height) continue;
                        for (i = 1 - kernelSize; i < kernelSize; ++i) {
                            if (x + i < 0 || x + i >= width) continue;
                            r += data[4 * ((y + j) * width + (x + i)) + 0] * kernel[Math.abs(j)][Math.abs(i)];
                            g += data[4 * ((y + j) * width + (x + i)) + 1] * kernel[Math.abs(j)][Math.abs(i)];
                            b += data[4 * ((y + j) * width + (x + i)) + 2] * kernel[Math.abs(j)][Math.abs(i)];
                            a += data[4 * ((y + j) * width + (x + i)) + 3] * kernel[Math.abs(j)][Math.abs(i)];
                        }
                    }
                    data[4 * (y * width + x) + 0] = r / kernelSum;
                    data[4 * (y * width + x) + 1] = g / kernelSum;
                    data[4 * (y * width + x) + 2] = b / kernelSum;
                    data[4 * (y * width + x) + 3] = a / kernelSum;
                }
            }
        },
        transform: function (src, transforms) {
            transforms = Array.isArray(transforms) ? transforms : [transforms];
            var canvas = document.createElement('canvas');
            //get its context
            var ctx = canvas.getContext('2d');
            //create empty image
            var imgObj = new Image();
            //start to load image from src url
            imgObj.src = src;
            //resize canvas up to size image size
            canvas.width = imgObj.width;
            canvas.height = imgObj.height;
            //draw image on canvas, full canvas API is described here http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html
            ctx.drawImage(imgObj, 0, 0);
            //get array of image pixels
            var imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
            //run through all the pixels
            _.each(transforms, function (f) {
                f.call(this, imgPixels.data, canvas.width, canvas.height);
            }, this);
            //draw pixels according to computed colors
            ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
            return canvas.toDataURL();
        },
        invert: function (data) {

            for (var i = 0; i < data.length; i += 4) {
                // red
                data[i] = 255 - data[i];
                // green
                data[i + 1] = 255 - data[i + 1];
                // blue
                data[i + 2] = 255 - data[i + 2];
            }
        },
        grey: function (data, width, height) { //Creates a canvas element with a grayscale version of the color image
            //run through all the pixels
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    //here is x and y are multiplied by 4 because every pixel is four bytes: red, green, blue, alpha
                    var i = (y * 4) * width + x * 4; //Why is this multiplied by 4?
                    //compute average value for colors, this will convert it to bw
                    var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    //set values to array
                    data[i] = avg;
                    data[i + 1] = avg;
                    data[i + 2] = avg;
                }
            }
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