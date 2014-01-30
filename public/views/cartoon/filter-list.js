define(['views/base', 'backbone', 'underscore', 'lib/form', 'fabric', 'stackblur', './dodge', 'tpl!./filter-list'], function (View, B, _, form, fabric, StackBlur, Dodge, template) {
    var itemTemplate = _.template('<div class="form-group">\
       <label for="<%=cid%>" class="col-sm-2 control-label"><%=name%></label>\
       <div class="col-sm-10">\
         <div id="<%=cid%>"></div>\
         <div id="children<%=cid%>"></div>\
         <p class="help-block"><%=help%></p>\
       </div>\
       </div>\
    ');

    var formTemplate = _.template('<form role="form" data-id="<%=cid%>">\
        <div class="btn-group btn-group-xs close">\
        <button class="btn btn-default remove"><span class="glyphicon glyphicon-remove"/></button>\
        <button class="btn btn-default up"><span class="glyphicon glyphicon-chevron-up"/></button>\
        <button class="btn btn-default down"><span class="glyphicon glyphicon-chevron-down"/></button>\
        </div>\
        <div class="form-group">\
            <label for="<%=cid%>" class="col-sm-2 control-label"><%=name%></label>\
            <div class="col-sm-10">\
                <div id="<%=cid%>"></div>\
                <div id="children<%=cid%>"></div>\
                <p class="help-block"><%=help%></p>\
             </div>\
        </div>\
    </form>');
    var invoke = function (obj, property, args) {
        var args = Array.prototype.slice.call(arguments,2);
        return _.compact(_.map(obj, function (v) {
            if (typeof v[property] === 'function') {
                return v[property].apply(v, args);
            }
        }));
    }
    var FilterView = View.extend({
        tagName: 'input',
        className: 'form-control',
        attributes: {type: 'number'},
        help: '',
        children: [],
        itemTemplate: itemTemplate,

        initialize: function (o) {
            View.prototype.initialize.call(this, o);
            this.views = {};
        },

        createChild: function (child) {
            var c = new child();
            c.parent = this;
            this.views[c.cid] = c;
            return c;
        },
        render: function () {
            console.log('rendering ', this.name, this.cid);
            if (this.template) {
                this.$el.html(this.template(this));
            }
            var tmpl = this.itemTemplate.bind(this);
            _.map(this.children, this.createChild, this).forEach(function (view) {
                var $node = $(tmpl(view));
                var $nn = $node.find('#' + view.cid);
                view.render();
                $nn.replaceWith(view.el);
                this.append($node)
            }, this.$('#children' + this.cid));
            //console.log('generated', html);
            /*if (html) {
             var $children = this.$('#children' + this.cid);
             $children.replaceWith($(html));
             }
             _.each(this.views, function (child, k) {
             child.render();
             var $h = this.$('#' + k);
             $h.replaceWith(child.el);
             child.$el.attr('id', k);
             }, this)*/
            return this;
        },
        remove: function () {
            invoke(this.views, 'remove');
            delete this.parent;
            this.$el.remove();
            return View.prototype.remove.call(this);
        },
        createFilter: function (imageData, canvas) {
            var data = form.toObject(this.$el.parents('form'));
            data.imageData = imageData;
            var Filter = this.filter;
            return new Filter(data);
        },
        setImage: function (img) {
            invoke(this.views, 'setImage', img);
            this.imageData = img;
        }
    })

    return FilterView.extend({
        attributes: {},
        name: 'filters',
        itemTemplate: formTemplate,
        template: template,
        children: [
            FilterView.extend({
                name: 'greyscale',
                attributes: {type: 'hidden', name: 'gray'},
                filter: fabric.Image.filters.Grayscale
            }),
            FilterView.extend({
                name: 'invert',
                attributes: {type: 'hidden', name: 'invert'},
                filter: fabric.Image.filters.Invert
            }),
            FilterView.extend({
                name: 'gaus',
                attributes: {type: 'number', name: 'radius', min: 0, step: .1, value: "7"},
                filter: StackBlur
            }),
            FilterView.extend({
                name: 'dodge',
                tagName: 'div',
                filter: Dodge,
                className: 'form-group',
                template: _.template('<div id="children<%=cid%>"></div>'),
                children: [
                    View.extend({
                        tagName: 'input',
                        name: 'quality',
                        help: 'The quality of the process 0 is higher quality',
                        attributes: { type: 'number', name: 'quality', min: 0, value: 2}
                    }),
                    View.extend({
                        tagName: 'input',
                        name: 'paletteSize',
                        help: 'number of colors in palette',
                        attributes: { type: 'number', name: 'paletteSize', min: 1, step: 1, value: 10}
                    })
                ]
            })

        ],
        tagName: 'div',
        className: 'form-container',
        onChange: function () {
            this.trigger('change', this);
        },

        applyFilters: function (imageData, canvas) {
            var filters = invoke(this.views, 'createFilter', imageData, canvas);
            var fimg = new fabric.Image($('<img src="' + imageData.url + '">')[0], {
                left: 0,
                top: 0,
                height: imageData.height,
                width: imageData.width,
                filters: filters
            });
            canvas.add(fimg);
            fimg.applyFilters(canvas.renderAll.bind(canvas));
        },
        events: {
            'click .up': form.prevent(function up(e) {
                var $cur = $(e.currentTarget).parent().parent();
                $cur.insertBefore($cur.prev());
                this.onChange(e);

            }),
            'click .down': form.prevent(function down(e) {
                var $cur = $(e.currentTarget).parent().parent();
                $cur.insertAfter($cur.next());
                this.onChange(e);

            }),
            'click .remove': form.prevent(function remove(e) {
                var $node = $(e.currentTarget).parent().parent();
                var cid = $node.data('id');
                this.views[cid] && this.views[cid].remove();
                delete this.views[cid];
                $node.remove();
                this.onChange(e);
            }),
            'change input': 'onChange'
        }

    });

})
;