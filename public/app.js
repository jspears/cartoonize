define(['backbone'], function (Backbone) {
    var App = Backbone.Router.extend({

        routes: {
            "*action": "defaultAction"
        },

        defaultAction: function (action) {
            console.log('routing', action);
            var sp = (action || 'cartoon/cartoon');
            require(['views/' + sp], function (View) {
                if (this.currentView) {
                    this.currentView.remove();
                }
                $('#content').html((this.currentView = new View({ router: this}).render()).el);
            }.bind(this));

        }

    });
    return {
        initialize: function () {
            var ret = new App();
            Backbone.history.start();
            return ret;
        }
    };
});