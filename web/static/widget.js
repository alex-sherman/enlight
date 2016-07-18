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
Element.colors = {
    danger: "#ff534f",
}
Element.info = function(text, color) {
    var info = $("#info-box");
    color = color || "inherit";
    if(color in Element.colors)
        color = Element.colors[color];
    info.text(text);
    info.fadeIn(200).delay(2000).fadeOut(200);
}

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
    var p1 = api.rpc("/Control.current_values")
    .done(function(values) {
        api.values = values;
    });
    Promise.all([p1]).then(function(values) {
        Element.elements.map(function(element) {
            if(element.update)
                element.update();
        });
    }, function(error) {});
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
        this.element.text(this.name);
        this.element.click(() => this.handler());
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
        this.element.clearQueue();
        if(delay == undefined)
            delay = 200;
        this.element.switchClass(this.remove_classes(class_), class_, 0);
        this.element.delay(1000).switchClass(this.remove_classes("btn-primary"), "btn-primary", delay)
    },
    handler: function() {
        var self = this;
        this.element.clearQueue();
        this.element.switchClass(this.remove_classes("btn-secondary"), "btn-secondary", 0);
        this.callback()
            .done(function(result) {
                self.indicate("btn-success");
            })
            .fail(function(error) {
                self.indicate("btn-danger");
            });
    }
});
Button.html = "<button class='btn btn-primary'></button>";

var WidgetRow = Element.extend({
    init: function WidgetRow() {
        this.args = {title: "", type: "button"}
        Element.init.apply(this, arguments);
        if(this.args.command)
            add_command(this.args.command, (text) => this.input.handler());
        if(this.args.icon)
            this.element.find(".widget-row-title > i").addClass(this.args.icon);
        this.element.find(".widget-row-title > p").text(this.args.title);
        if(this.args.type == "button")
            this.input = new Button(this.args.button_text, () => this.rpc(this.args.value));
        else if(this.args.type == "slider")
            this.input = new Slider((value) => this.rpc(value));
        else if(this.args.type == "text")
            this.input = new Text(this.args.path, this.args.procedure);
        this.input.element.addClass("pull-right");
        this.element.find(".widget-row").append(this.input.element);
        this.info = this.element.find(".widget-row-info");
        this.info.hide();
    },
    rpc: function (value) {
        var self = this;
        var out = api.rpc(this.args.path, value);
        if(this.args.showresult)
            out.done(function(result) {
                Element.info(JSON.stringify(result));
            });
        return out;
    }
});
WidgetRow.html =
"<div class='row'>\
    <div class='widget-row col-xs-12'>\
        <div class='widget-row-title'><i class='fa'></i><p></p></div>\
    </div>\
</div>\
<div class='row'>\
    <div class='widget-row-info col-xs-12'>\
    </div>\
</div>";

var Slider = Element.extend({
    init: function Slider(on_click) {
        Element.init.apply(this, arguments);
        var slider = this.element.find("input");
        var self = this;
        slider.click(function() { on_click(slider.prop("checked")); })
    }
});
Slider.html =
"<label class='switch'>\
  <input type='checkbox'>\
  <div class='slider round'></div>\
</label>";

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
            Element.info(JSON.stringify(result));
        });
    }
})