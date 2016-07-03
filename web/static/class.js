Class = {
    init: Object,
    extend: function(args) {
        var init = args.init;
        if(init.name == "") throw new Error("Init functions must be named");
        init.prototype = Object.create(this.prototype || Object.prototype);
        init.prototype.constructor = init;
        init.extend = Class.extend;
        init.prototype.BaseClass = this;
        var base;
        for(var prop in args) {
            if(prop in this) {
                base = this[prop];
                init.prototype[prop] = Class.inherit(args[prop], base);
            }
            else {
                init.prototype[prop] = args[prop];
            }
            init[prop] = args[prop];
        }
        init.prototype["getType"] = function() {
            return init;
        }
        return init;
    },
    inherit: function(derived, base) {
        return function inherited() {
            this.base = base;
            var output = derived.apply(this, arguments);
            return output;
        }
    }
}

