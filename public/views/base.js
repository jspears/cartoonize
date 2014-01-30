define(['backbone'], function (Backbone) {
    return Backbone.View.extend({
        render: function (eventName) {
            if (this.template)
                this.$el.html(this.template({model: this.model && this.model.toJSON() || {}}));
            return this;
        }
    });
});