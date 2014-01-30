define(['./nested', './base'], function (NestedView, Base) {

    function view(template) {
        return Base.extend({
            template: _.template(template)
        });
    }

    return NestedView.extend({
        children: ['views/junk', NestedView.extend({
            children: [
                Base.extend({
                    template: _.template('<h3>hello from nested</h3>')
                }),
                view('<h4>hello from nested 2</h4>'),
                view('<h4>hello from nested 3</h4>')


            ]
        })]
    })

});