define(['underscore', 'jquery'], function (_, $) {

    return {
        prevent: function (f) {
            return function (e) {
                e && e.preventDefault && e.preventDefault();
                return f.call(this, e);
            }
        },
        toObject: function (form) {
            var obj = {};
            _.each($(form).serializeArray(), function (v, k) {
                if (obj[v.name]) {
                    if (_.isArray(obj[v.name])) {
                        obj[v.name].push(v.value);
                    } else {
                        obj[v.name] = [obj[v.name], v.value]
                    }
                } else {
                    obj[v.name] = v.value;
                }
            });
            return obj;
        }
    }

});