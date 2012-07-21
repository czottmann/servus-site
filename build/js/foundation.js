/*
 * jQuery Custom Forms Plugin 1.0
 * www.ZURB.com
 * Copyright 2010, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/
jQuery.foundation = jQuery.foundation || {}, jQuery.foundation.customForms = jQuery.foundation.customForms || {}, jQuery(document).ready(function(e) {
    e.foundation.customForms.appendCustomMarkup = function(t) {
        var t, n;
        function r(t, n) {
            var r = e(n).hide(), i = r.attr("type"), s = r.next("span.custom." + i);
            s.length === 0 && (s = e('<span class="custom ' + i + '"></span>').insertAfter(r)), s.toggleClass("checked", r.is(":checked")), s.toggleClass("disabled", r.is(":disabled"));
        }
        function i(t, n) {
            var a, r = e(n), i = r.next("div.custom.dropdown"), s = r.find("option"), o = r.find("option:selected"), u = 0;
            if (r.hasClass("no-custom")) return;
            i.length === 0 ? ($customSelectSize = "", e(n).hasClass("small") ? $customSelectSize = "small" : e(n).hasClass("medium") ? $customSelectSize = "medium" : e(n).hasClass("large") ? $customSelectSize = "large" : e(n).hasClass("expand") && ($customSelectSize = "expand"), i = e('<div class="custom dropdown ' + $customSelectSize + '"><a href="#" class="selector"></a><ul></ul></div>"'), s.each(function() {
                a = e("<li>" + e(this).html() + "</li>"), i.find("ul").append(a);
            }), i.prepend('<a href="#" class="current">' + o.html() + "</a>"), r.after(i), r.hide()) : (i.find("ul").html(""), s.each(function() {
                a = e("<li>" + e(this).html() + "</li>"), i.find("ul").append(a);
            })), i.toggleClass("disabled", r.is(":disabled")), s.each(function(t) {
                this.selected && (i.find("li").eq(t).addClass("selected"), i.find(".current").html(e(this).html()));
            }), i.css("width", "inherit"), i.find("ul").css("width", "inherit"), i.find("li").each(function() {
                i.addClass("open"), e(this).outerWidth() > u && (u = e(this).outerWidth()), i.removeClass("open");
            }), i.is(".small, .medium, .large, .expand") || (i.css("width", u + 18 + "px"), i.find("ul").css("width", u + 16 + "px"));
        }
        n = {
            disable_class: "js-disable-custom"
        }, t = e.extend(n, t);
        e("form.custom input:radio[data-customforms!=disabled]").each(r), e("form.custom input:checkbox[data-customforms!=disabled]").each(r), e("form.custom select[data-customforms!=disabled]").each(i);
    };
}), function(e) {
    function t(t) {
        var n = 0, r = t.next();
        $options = t.find("option"), r.find("ul").html(""), $options.each(function() {
            $li = e("<li>" + e(this).html() + "</li>"), r.find("ul").append($li);
        }), $options.each(function(t) {
            this.selected && (r.find("li").eq(t).addClass("selected"), r.find(".current").html(e(this).html()));
        }), r.removeAttr("style").find("ul").removeAttr("style"), r.find("li").each(function() {
            r.addClass("open"), e(this).outerWidth() > n && (n = e(this).outerWidth()), r.removeClass("open");
        }), r.css("width", n + 18 + "px"), r.find("ul").css("width", n + 16 + "px");
    }
    function n(e) {
        var t = e.prev(), n = t[0];
        0 == t.is(":disabled") && (n.checked = n.checked ? !1 : !0, e.toggleClass("checked"), t.trigger("change"));
    }
    function r(t) {
        var n = t.prev(), r = n[0];
        0 == n.is(":disabled") && (e('input:radio[name="' + n.attr("name") + '"]').each(function() {
            e(this).next().removeClass("checked");
        }), r.checked = r.checked ? !1 : !0, t.toggleClass("checked"), n.trigger("change"));
    }
    e("form.custom span.custom.checkbox").live("click", function(t) {
        t.preventDefault(), t.stopPropagation(), n(e(this));
    }), e("form.custom span.custom.radio").live("click", function(t) {
        t.preventDefault(), t.stopPropagation(), r(e(this));
    }), e("form.custom select").live("change", function() {
        t(e(this));
    }), e("form.custom label").live("click", function(t) {
        var s, o, i = e("#" + e(this).attr("for"));
        i.length !== 0 && (i.attr("type") === "checkbox" ? (t.preventDefault(), s = e(this).find("span.custom.checkbox"), n(s)) : i.attr("type") === "radio" && (t.preventDefault(), o = e(this).find("span.custom.radio"), r(o)));
    }), e("form.custom div.custom.dropdown a.current, form.custom div.custom.dropdown a.selector").live("click", function(t) {
        var n = e(this), r = n.closest("div.custom.dropdown"), i = r.prev();
        t.preventDefault(), e("div.dropdown").removeClass("open");
        if (0 == i.is(":disabled")) return r.toggleClass("open"), r.hasClass("open") ? e(document).bind("click.customdropdown", function() {
            r.removeClass("open"), e(document).unbind(".customdropdown");
        }) : e(document).unbind(".customdropdown"), !1;
    }), e("form.custom div.custom.dropdown li").live("click", function(t) {
        var n = e(this), r = n.closest("div.custom.dropdown"), i = r.prev(), s = 0;
        t.preventDefault(), t.stopPropagation(), e("div.dropdown").removeClass("open"), n.closest("ul").find("li").removeClass("selected"), n.addClass("selected"), r.removeClass("open").find("a.current").html(n.html()), n.closest("ul").find("li").each(function(e) {
            n[0] == this && (s = e);
        }), i[0].selectedIndex = s, i.trigger("change");
    });
}(jQuery);

(function(e, t, n) {
    var r, i, s, o, u, a;
    function f(e) {
        var t = {}, r = /^jQuery\d+$/;
        return n.each(e.attributes, function(e, n) {
            n.specified && !r.test(n.name) && (t[n.name] = n.value);
        }), t;
    }
    function l(e, r) {
        var i = this, s = n(i);
        if (i.value == s.attr("placeholder") && s.hasClass("placeholder")) if (s.data("placeholder-password")) {
            s = s.hide().next().show().attr("id", s.removeAttr("id").data("placeholder-id"));
            if (e === !0) return s[0].value = r;
            s.focus();
        } else i.value = "", s.removeClass("placeholder"), i == t.activeElement && i.select();
    }
    function c() {
        var e, t = this, r = n(t), i = r, s = this.id;
        if (t.value == "") {
            if (t.type == "password") {
                if (!r.data("placeholder-textinput")) {
                    try {
                        e = r.clone().attr({
                            type: "text"
                        });
                    } catch (o) {
                        e = n("<input>").attr(n.extend(f(this), {
                            type: "text"
                        }));
                    }
                    e.removeAttr("name").data({
                        "placeholder-password": !0,
                        "placeholder-id": s
                    }).bind("focus.placeholder", l), r.data({
                        "placeholder-textinput": e,
                        "placeholder-id": s
                    }).before(e);
                }
                r = r.removeAttr("id").hide().prev().attr("id", s).show();
            }
            r.addClass("placeholder"), r[0].value = r.attr("placeholder");
        } else r.removeClass("placeholder");
    }
    r = "placeholder" in t.createElement("input"), i = "placeholder" in t.createElement("textarea"), s = n.fn, o = n.valHooks;
    r && i ? (a = s.placeholder = function() {
        return this;
    }, a.input = a.textarea = !0) : (a = s.placeholder = function() {
        var e = this;
        return e.filter((r ? "textarea" : ":input") + "[placeholder]").not(".placeholder").bind({
            "focus.placeholder": l,
            "blur.placeholder": c
        }).data("placeholder-enabled", !0).trigger("blur.placeholder"), e;
    }, a.input = r, a.textarea = i, u = {
        get: function(e) {
            var t = n(e);
            return t.data("placeholder-enabled") && t.hasClass("placeholder") ? "" : e.value;
        },
        set: function(e, r) {
            var i = n(e);
            return i.data("placeholder-enabled") ? (r == "" ? (e.value = r, e != t.activeElement && c.call(e)) : i.hasClass("placeholder") ? l.call(e, !0, r) || (e.value = r) : e.value = r, i) : e.value = r;
        }
    }, r || (o.input = u), i || (o.textarea = u), n(function() {
        n(t).delegate("form", "submit.placeholder", function() {
            var e = n(".placeholder", this).each(l);
            setTimeout(function() {
                e.each(c);
            }, 10);
        });
    }), n(e).bind("beforeunload.placeholder", function() {
        n(".placeholder").each(function() {
            this.value = "";
        });
    }));
})(this, document, jQuery);

jQuery(document).ready(function(e) {
    var n, r, i, s, o;
    function t(t) {
        var n = t.closest("dl").find("dd.active"), r = t.children("a").attr("href") + "Tab";
        r = r.replace(/^.+#/, "#"), n.removeClass("active"), t.addClass("active"), e(r).closest(".tabs-content").children("li").removeClass("active").hide(), e(r).css("display", "block").addClass("active");
    }
    e("dl.tabs dd a").on("click.fndtn", function() {
        t(e(this).parent("dd"));
    }), window.location.hash && (t(e('a[href="' + window.location.hash + '"]').parent("dd")), e.foundation.customForms.appendCustomMarkup()), e(".alert-box").delegate("a.close", "click", function(t) {
        t.preventDefault(), e(this).closest(".alert-box").fadeOut(function() {
            e(this).remove();
        });
    }), e("input, textarea").placeholder();
    n = !1;
    Modernizr.touch || navigator.userAgent.match(/Windows Phone/i) ? (e(".nav-bar a.flyout-toggle").on("click.fndtn touchstart.fndtn", function(t) {
        var r;
        t.preventDefault();
        r = e(this).siblings(".flyout").first();
        n === !1 && (e(".nav-bar .flyout").not(r).slideUp(500), r.slideToggle(500, function() {
            n = !1;
        })), n = !0;
    }), e(".nav-bar>li.has-flyout").addClass("is-touch")) : e(".nav-bar>li.has-flyout").hover(function() {
        e(this).children(".flyout").show();
    }, function() {
        e(this).children(".flyout").hide();
    }), e(".button.disabled").on("click.fndtn", function(e) {
        e.preventDefault();
    }), e(".button.dropdown > ul").addClass("no-hover"), e(".button.dropdown").on("click.fndtn touchstart.fndtn", function(e) {
        e.stopPropagation();
    }), e(".button.dropdown.split span").on("click.fndtn touchstart.fndtn", function(t) {
        t.preventDefault(), e(".button.dropdown").not(e(this).parent()).children("ul").removeClass("show-dropdown"), e(this).siblings("ul").toggleClass("show-dropdown");
    }), e(".button.dropdown").not(".split").on("click.fndtn touchstart.fndtn", function() {
        e(".button.dropdown").not(this).children("ul").removeClass("show-dropdown"), e(this).children("ul").toggleClass("show-dropdown");
    }), e("body, html").on("click.fndtn touchstart.fndtn", function() {
        e(".button.dropdown ul").removeClass("show-dropdown");
    });
    r = e(".button.dropdown:not(.large):not(.small):not(.tiny)").outerHeight() - 1, i = e(".button.large.dropdown").outerHeight() - 1, s = e(".button.small.dropdown").outerHeight() - 1, o = e(".button.tiny.dropdown").outerHeight() - 1;
    e(".button.dropdown:not(.large):not(.small):not(.tiny) > ul").css("top", r), e(".button.dropdown.large > ul").css("top", i), e(".button.dropdown.small > ul").css("top", s), e(".button.dropdown.tiny > ul").css("top", o), e(".button.dropdown.up:not(.large):not(.small):not(.tiny) > ul").css("top", "auto").css("bottom", r - 2), e(".button.dropdown.up.large > ul").css("top", "auto").css("bottom", i - 2), e(".button.dropdown.up.small > ul").css("top", "auto").css("bottom", s - 2), e(".button.dropdown.up.tiny > ul").css("top", "auto").css("bottom", o - 2), e.foundation.customForms.appendCustomMarkup();
});
