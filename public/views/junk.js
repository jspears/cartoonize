define(['views/base', 'underscore'], function(View, _){
    return View.extend({
        template: _.template('<h2>Hello from junk</h2>')
    })
})