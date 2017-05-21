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
        this.add_element(child.element);
    },
    get_json: function() {
        var obj = this.args;
        obj.children = this.children.map((child) => child.save());
    },
    save: function() {
        return $.extend(true, this.get_json(), {type: this.constructor.name});
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
Element.current_id = 0;
Element.elements = [];
Element.types = {}
Element.colors = {
    danger: "#ff534f",
}
Element.info = function(text, color) {
    var info = $("#info-box");
    info.clearQueue().finish();
    color = color || "inherit";
    if(color in Element.colors)
        color = Element.colors[color];
    info.text(text);
    info.fadeIn(200).delay(5000).fadeOut(200);
}

Element._extend = Element.extend;
Element.extend = function extend(args) {
    var output = Element._extend.apply(this, arguments);
    Element.types[args.init.name] = output;
    return output;
}

Element.from_json = function from_json(obj) {
    return new Element.types[obj.type](obj);
}

var api = mrpc("/api");

api.values = {}
Element.update = function() {
    //var p1 = api.rpc("/Control.current_values")
    //.done(function(values) {
    //    api.values = values;
    //});
    //Promise.all([p1]).then(function(values) {
    //    Element.elements.map(function(element) {
    //        if(element.update)
    //            element.update();
    //    });
    //}, function(error) {});
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
    init: function Button() {
        Element.init.apply(this, arguments);
        this.text = this.args.text || "Button";
        this.element.text(this.text);
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
        this.rpc()
            .done(function(result) {
                self.indicate("btn-success");
            })
            .fail(function(error) {
                self.indicate("btn-danger");
            });
    }
});
Button.html = "<button class='btn btn-primary'></button>";
var absolutePath = function(href) {
    var link = document.createElement("a");
    link.href = href;
    return (link.protocol+"//"+link.host+link.pathname+link.search+link.hash);
}
var OTP = Element.extend({
    init: function OTP() {
        Element.init.apply(this, arguments);
        this.element.text("OTP");
        this.element.click(() => this.handler());
        this.btn_classes = ["btn-primary", "btn-secondary", "btn-danger", "btn-success"];
    },
    handler: function() {
        var self = this;
        $.ajax({
            url: "/auth/gen_otp",
            contentType: "application/json",
            method: "GET",
            error: function(error) {
                console.log(error)
            },
            success: function(key) {
                url = absolutePath("/api/rpc?api_key=" + key +
                    "&args="+JSON.stringify({path: self.args.path}));
                Element.info(url);
            }
        });
    }
});
OTP.html = "<button class='btn btn-warning'></button>";

var WidgetRow = Element.extend({
    init: function WidgetRow() {
        this.args = {title: "", type: "button"}
        Element.init.apply(this, arguments);
        if(this.args.icon)
            this.element.find(".widget-row-title > i").addClass(this.args.icon);
        this.element.find(".widget-row-title > p").text(this.args.title);
        this.info = this.element.find(".widget-row-info");
        this.info.hide();
    },
    add: function(child) {
        child.element.addClass("pull-right");
        this.element.find(".widget-row").append(child.element)
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
        this.slider = this.element.find("input");
        var self = this;
        this.rpc().done((result) => self.slider.prop("checked", result));
        this.slider.click(function() {
            var previous_value = !this.slider.prop("checked");
            self.rpc(self.slider.prop("checked"))
            .fail(() => self.slider.prop("checked", previous_value));
        }.bind(this))
        if(this.args.command) {
            add_command(this.args.command, function() {
                self.slider.prop("checked", !self.slider.prop("checked"));
                self.rpc(self.slider.prop("checked"));
            });
        }
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
        this.path = $("<input class='col-xs-5' type=text' size='20'>");
        this.value = $("<input class='col-xs-5' type=text' size='20'>");
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
        return api.rpc(this.path.val(), value)
        .done(function(result) {
            Element.info(JSON.stringify(result));
        });
    }
})