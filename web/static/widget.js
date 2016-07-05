var Element = Class.extend({
    init: function Element() {
        this.id = Element.current_id ++;
        this.element = null;
        Element.elements.push(this);
    }
});
Element.current_id = 0;
Element.elements = [];
var api = mrpc("/api");

api.values = {}
Element.update = function() {
    var p1 = api.rpc("/Control", "current_values")
    .done(function(values) {
        api.values = values;
    });
    Promise.all([p1]).then(function(values) {
        Element.elements.map(function(element) {
            if(element.update)
                element.update();
        });
    })
};
Element.update();
window.setInterval(Element.update, 2000);

var Widget = Element.extend({
    init: function Widget(title) {
        this.BaseClass.init.apply(this);
        this.children = [];
        this.element = $(
"<div class='widget'>\
    <div class='widget-title'>\
        <div class='widget-title-text'></div>\
        <button class='btn btn-sm btn-secondary pull-right' data-toggle='collapse' data-target='.widget-body'>Hide</button>\
    </div><div class='widget-body collapse in'></div></div>");
        this.body = this.element.find(".widget-body");
        this.title = this.element.find(".widget-title-text");
        this.title.text(title);
        this.element.append(this.body);
    },
    add: function(child) {
        this.children.push(child);
        this.body.append(child.element);
    }
});

var Button = Element.extend({
    init: function Button(path, procedure, value, name) {
        this.BaseClass.init.apply(this);
        this.path = path;
        this.procedure = procedure;
        this.value = value;
        this.name = name || "Button";
        this.element = $("<div></div>");
        this.button = $("<button class='btn btn-primary'></button>");
        this.button.text(this.name);
        this.button.click(() => this.handler());
        this.element.append(this.button);
        this.btn_classes = ["btn-primary", "btn-secondary", "btn-danger", "btn-success"];
    },
    remove_classes: function(class_) {
        return this.btn_classes.reduce(function(out, remove_class) {
            if(class_ != remove_class)
                out += remove_class + " ";
            return out;
        }, "");
    },
    indicate: function(class_, delay) {
        this.button.clearQueue();
        this.button.stop();
        if(delay == undefined)
            delay = 200;
        this.button.switchClass(this.remove_classes(class_), class_, 0);
        this.button.delay(1000).switchClass(this.remove_classes("btn-primary"), "btn-primary", delay)
    },
    handler: function() {
        var self = this;
        this.button.clearQueue();
        this.button.stop();
        this.button.switchClass(this.remove_classes("btn-secondary"), "btn-secondary", 0);
        api.rpc(this.path, this.procedure, this.value)
        .done(function(result) {
            console.log(result);
            self.indicate("btn-success");
        })
        .fail(function(error) {
            self.indicate("btn-danger");
        })
    }
});

var Text = Element.extend({
    init: function Text(path, procedure) {
        this.BaseClass.init.apply(this);
        this.path = path;
        this.procedure = procedure
        this.element = $("<div></div>");
    },
    update: function() {
        if(this.path in api.values) {
            var service = api.values[this.path];
            if(this.procedure in service) {
                this.element.text(service[this.procedure].value);
            }
        }
    }
});

var Debug = Element.extend({
    init: function Debug() {
        this.BaseClass.init.apply(this);
        this.path = $("<input type=text' size='20'>");
        this.procedure = $("<input type=text' size='20'>");
        this.value = $("<input type=text' size='20'>");
        this.button = $("<button class='btn btn-primary'>RPC</button>")
        this.button.click(() => this.handler());
        this.element = $("<div></div>");
        this.element.append(this.path);
        this.element.append(this.procedure);
        this.element.append(this.value);
        this.element.append(this.button);
    },
    handler: function() {
        var value = this.value.val();
        value = value || "null"
        value = JSON.parse(value);
        api.rpc(this.path.val(), this.procedure.val(), value)
        .done(function(result) {
            console.log(result);
        });
    }
})