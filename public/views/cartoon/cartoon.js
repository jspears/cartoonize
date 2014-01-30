define(['views/base', './filter-list', 'fabric', 'tpl!./cartoon'], function (View, FilterList, ColorThief, template) {

    return View.extend({
        template: template,
        render: function () {
            View.prototype.render.call(this);
            this.filters = new FilterList().render();
            this.$('.filters').replaceWith(this.filters.el);
            this.filters.on('change', this.transform, this);
            this.canvas = new fabric.StaticCanvas(this.$('canvas')[0]);
            this.palette = [];
            this.$src = this.$('.src');
            this.setImageData(this.extractData(this.$src));
            this.transform();
            return this;
        },
        transform: _.debounce(function (obj) {
            console.log('transform');
            this.filters.applyFilters(this.imageData, this.canvas);
        }, 100),
        thumbnail: function thumbnail($el, callback) {
            var file = $el[0].files[0]
            var img = new Image();
            var reader = new FileReader();
            reader.onload = function (e) {
                img.src = e.target.result
            }
            reader.readAsDataURL(file);
            var extract = this.extractData.bind(this);
            $(img).on('load', function () {
                $el.replaceWith($el.clone(true));
                callback(null, extract(img));
            });
        },
        extractData: function (img) {
            img = $(img)[0];
            var canvas = document.createElement('canvas');
            this.scaleY(img);
            canvas.width = img.width;
            canvas.height = this.maxHeight;
            var ctx =
                canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, this.maxHeight);
            var url = canvas.toDataURL('image/png');
            var obj = {
                url: url,
                data: ctx.getImageData(0, 0, canvas.width, canvas.height),
                height: canvas.height,
                width: canvas.width
            }

            return obj;
        },
        setImageData: function (imageData) {
            this.imageData = imageData;
            this.filters.setImage(imageData);
        },
        onFileChange: function (e) {
            var $img = this.$src;
            var transform = this.transform.bind(this);
            var setImageData = this.setImageData.bind(this);
            this.thumbnail(this.$(e.currentTarget), function (err, obj) {
                $img.attr('src', obj.url);
                setImageData(obj);
                transform(obj);
            });
        },
        maxHeight: 150,
        scaleY: function (img) {
            var ratio = this.maxHeight / img.height;
            img.height = ratio * img.height;
            img.width = ratio * img.width;
            return img;
        },
        events: {

            'change input[type="file"]': 'onFileChange',
            'submit form': function onSubmit(e) {
                e.preventDefault();
                this.onFileChange(e);
            }
        }


    })
});