var Element = Class.extend({
    init: function Element(args) {
        this.element = $(this.constructor.html || "<div></div>");
        this.args = this.args || {};
        $.extend(true, this.args, args);
        this.children = (this.args.children || []).map(Element.from_json);
        this.children.map((child) => this.add(child));
        this.id = Element.current_id ++;
        Element.elements.push(this);
    },
    body: function() {
        return this.element;
    },
    add_element: function(element) {
        this.element.append(element);
    },
    add: function(child) {
        this.children.push(child);
        this.add_element(child.element);
    },
    get_json: function() {
        var obj = this.args;
        obj.children = this.children.map((child) => child.save());
    },
    save: function() {
        return {type: this.constructor.name, args: this.get_json()};
    }
});
Element.current_id = 0;
Element.elements = [];
Element.types = {}

Element._extend = Element.extend;
Element.extend = function extend(args) {
    var output = Element._extend.apply(this, arguments);
    Element.types[args.init.name] = output;
    return output;
}

Element.from_json = function from_json(obj) {
    return new Element.types[obj.type](obj.args);
}

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

var Widget = Element.extend({
    init: function Widget() {
        this.args = {title: "Widget", children: []};
        Element.init.apply(this, arguments);
        this.collapse_div = this.element.find(".widget-collapse");
        this.element.find(".btn-collapse").click(() => this.collapse());
        this.title = this.element.find(".widget-title-text");
        this.title.text(this.args.title);
    },
    add: function(child) {
        this.element.find(".widget-body").append(child.element);
    },
    collapse: function() {
        if(this.collapse_div.hasClass("collapsing"))
            return;
        if(document.readyState == 'complete')
            this.collapse_div.collapse("toggle");
        else
            this.collapse_div.toggleClass("in");
        this.element.find(".fa").toggleClass("fa-compress fa-expand")
    }
});
Widget.html = 
"<div class='widget'>\
    <div class='widget-title'>\
        <div class='widget-title-text'></div>\
        <div class='btn btn-collapse pull-right'><i class='fa fa-compress pull-right'></i></div>\
    </div>\
    <div class=\"widget-collapse collapse in\">\
        <div class='widget-body'></div>\
    </div>\
</div>";

var Button = Element.extend({
    init: function Button(name, callback) {
        Element.init.apply(this);
        this.callback = callback;
        this.name = name || "Button";
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
        this.callback()
            .done(function(result) {
                console.log(result);
                self.indicate("btn-success");
            })
            .fail(function(error) {
                self.indicate("btn-danger");
            });
    }
});

var RPCButton = Element.extend({
    init: function RPCButton() {
        this.args = {title: "Button"}
        Element.init.apply(this, arguments);
        if(this.args.command)
            add_command(this.args.command, () => this.handler());
        if(this.args.icon)
            this.element.find(".button-title > i").addClass(this.args.icon);
        this.element.find(".button-title > p").text(this.args.title);

        this.button = new Button(this.args.button_text, () => this.rpc());
        this.button.element.addClass("pull-right");
        this.element.find(".button-row").append(this.button.element);
    },
    rpc: function () {
        return api.rpc(this.args.path, this.args.procedure, this.args.value);
    }
});
RPCButton.html =
"<div class='row'>\
    <div class='button-row col-xs-12'>\
        \
        <div class='button-title'><i class='fa'></i><p></p></div>\
    </div>\
</div>";

var Text = Element.extend({
    init: function Text(path, procedure) {
        Element.init.apply(this);
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
        Element.init.apply(this);
        this.path = $("<input type=text' size='20'>");
        this.procedure = $("<input type=text' size='20'>");
        this.value = $("<input type=text' size='20'>");
        this.button = new Button("RPC", () => this.handler());
        this.element.append(this.path);
        this.element.append(this.procedure);
        this.element.append(this.value);
        this.element.append(this.button.element);
    },
    handler: function() {
        var value = this.value.val();
        value = value || "null"
        value = JSON.parse(value);
        return api.rpc(this.path.val(), this.procedure.val(), value)
        .done(function(result) {
            console.log(result);
        });
    }
})