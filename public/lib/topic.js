define(function () {
    var pA = Array.prototype;
    var slice = Function.call.bind(pA.slice);
    var push = Function.apply.bind(pA.push);

    return function Topic(ctx) {
        var handlers = [];

        function f() {
            ctx = ctx || this;

            var args = slice(arguments);
            for (var i = handlers.length; i--;) {
                if (handlers[i].apply(ctx, args) === false) {
                    return ctx;
                }
            }
            return ctx;
        }

        f.then = function (v) {
            if (!v) return f;
            push(handlers, arguments);
            return f;
        };

        return  f;
    }

});