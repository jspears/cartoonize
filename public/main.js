require.config({
    baseUrl: '',
    paths: {
        // the left side is the module ID,
        // the right side is the path to
        // the jQuery file, relative to baseUrl.
        // Also, the path should NOT include
        // the '.js' file extension. This example
        // is using jQuery 1.9.0 located at
        // js/lib/jquery-1.9.0.js, relative to
        // the HTML page.
        jquery: 'lib/vendor/jquery-1.11.0/jquery',
        bootstrap: 'lib/vendor/bootstrap-3.0.3/bootstrap',
        backbone: 'lib/vendor/backbone-1.1.0/backbone',
        underscore: 'lib/vendor/underscore-1.5.2/underscore',
        supermodel: 'lib/vendor/supermodel-0.4.4/supermodel',
        fabric: 'lib/vendor/fabric.js-1.4.0/dist/all',
        stackblur: 'lib/vendor/stackblur-0.5/StackBlur',
        color: 'lib/vendor/color/color',
        pusher: 'lib/vendor/color/pusher.color',
        'color-thief': 'lib/vendor/color-thief-2.0/color-thief'


    },
    shim: {
        jquery: {
            exports: 'jQuery'

        },
        bootstrap: {
            deps: ['jquery']
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },

        underscore: {
            exports: '_'
        },
        supermodel: {
            exports: 'Supermodel',
            deps: ['backbone']
        },
        fabric: {
            exports: 'fabric'
        },
        color: {
            exports: 'Color'
        },
        pusher: {
            exports: 'pusher'
        }
    }
});
require([ 'jquery', 'app'], function ($, App) {
    // The "app" dependency is passed in as "App"
    $(App.initialize)
});