define(['views/base', 'underscore', 'jquery', 'lib/topic'], function (View, _, $, Topic) {
    var $when =  Function.apply.bind($.when);
    return View.extend({
        children: [],
        name:'',
        help:'',
        template: _.template('<div id="children<%=cid%>"></div>'),
        itemTemplate: _.template('\
        <div class="form-group">\
             <label for="<%=cid%>" class="col-sm-2 control-label"><%=name%></label>\
             <div class="col-sm-10">\
                 <div id="<%=cid%>"></div>\
                 <div id="children<%=cid%>"></div>\
            </div>\
       </div>\
        '),
        initialize: function (o) {
            View.prototype.initialize.call(this, o);
            this.views = {};
            this.onRenderChildren = Topic(this);
            _.bindAll(this, 'itemTemplate', 'addChild', 'renderChild');
        },
        renderChild: function(child){
            var tmpl = this.itemTemplate;
            var $children =  this.$('#children' + this.cid);
            return this.addChild(child).then(function(view){
                var $node = $(tmpl(view));
                view.render();
                $node.find('#' + view.cid).replaceWith(view.el);
                $children.append($node)
            });
        },
        addChild: function (child, opts, defer) {
            defer = defer || $.Deferred();

            if (typeof child == 'string'){
                var addChild = this.addChild;
                require([child], function(c){
                    addChild(c, opts, defer);
                });
                return defer;
            }
            var c = new child(opts);
            c.parent = this;
            this.views[c.cid] = c;
            defer.resolve(c);
            return defer;
        },
        removeChild:function(child){
          var cid = child.cid || child;
          var v = this.views[cid];
          if (v && v.remove){
              v.remove();
          }
         return v;
        },
        render: function () {
            console.log('rendering ', this.name, this.cid);
            if (this.template) {
                this.$el.html(this.template(this));
            }
            $when(_.map(this.children, this.renderChild)).done(this.onRenderChildren);
            return this;
        },
        remove: function () {
            invoke(this.views, 'remove');
            if (this.parent){
                delete this.parent.views[this.cid];
                delete this.parent;
            }
            this.$el.remove();
            return View.prototype.remove.call(this);
        }
    })

});