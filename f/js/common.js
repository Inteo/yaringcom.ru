function is_touch_device() {
  return !!('ontouchstart' in window) || !!('onmsgesturechange' in window);
}

function metrikaReach(goal_name, goal_params) {
  var goal_params = goal_params || {};
  for (var i in window) {
    if (/^yaCounter\d+/.test(i)) {
      window[i].reachGoal(goal_name, goal_params);
    }
  }
}

;
(function(window, document, $) {

  var isInputSupported = 'placeholder' in document.createElement('input'),
    isTextareaSupported = 'placeholder' in document.createElement('textarea'),
    prototype = $.fn,
    valHooks = $.valHooks,
    hooks,
    placeholder;

  if (isInputSupported && isTextareaSupported) {

    placeholder = prototype.placeholder = function() {
      return this;
    };

    placeholder.input = placeholder.textarea = true;

  } else {

    placeholder = prototype.placeholder = function() {
      var $this = this;
      $this
        .filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
        .not('.placeholder')
        .bind({
          'focus.placeholder': clearPlaceholder,
          'blur.placeholder': setPlaceholder
        })
        .data('placeholder-enabled', true)
        .trigger('blur.placeholder');
      return $this;
    };

    placeholder.input = isInputSupported;
    placeholder.textarea = isTextareaSupported;

    hooks = {
      'get': function(element) {
        var $element = $(element);
        return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
      },
      'set': function(element, value) {
        var $element = $(element);
        if (!$element.data('placeholder-enabled')) {
          return element.value = value;
        }
        if (value == '') {
          element.value = value;
          // Issue #56: Setting the placeholder causes problems if the element continues to have focus.
          if (element != document.activeElement) {
            // We can’t use `triggerHandler` here because of dummy text/password inputs :(
            setPlaceholder.call(element);
          }
        } else if ($element.hasClass('placeholder')) {
          clearPlaceholder.call(element, true, value) || (element.value = value);
        } else {
          element.value = value;
        }
        // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
        return $element;
      }
    };

    isInputSupported || (valHooks.input = hooks);
    isTextareaSupported || (valHooks.textarea = hooks);

    $(function() {
      // Look for forms
      $(document).delegate('form', 'submit.placeholder', function() {
        // Clear the placeholder values so they don’t get submitted
        var $inputs = $('.placeholder', this).each(clearPlaceholder);
        setTimeout(function() {
          $inputs.each(setPlaceholder);
        }, 10);
      });
    });

    // Clear placeholder values upon page reload
    $(window).bind('beforeunload.placeholder', function() {
      $('.placeholder').each(function() {
        this.value = '';
      });
    });

  }

  function args(elem) {
    // Return an object of element attributes
    var newAttrs = {},
      rinlinejQuery = /^jQuery\d+$/;
    $.each(elem.attributes, function(i, attr) {
      if (attr.specified && !rinlinejQuery.test(attr.name)) {
        newAttrs[attr.name] = attr.value;
      }
    });
    return newAttrs;
  }

  function clearPlaceholder(event, value) {
    var input = this,
      $input = $(input);
    if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
      if ($input.data('placeholder-password')) {
        $input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
        // If `clearPlaceholder` was called from `$.valHooks.input.set`
        if (event === true) {
          return $input[0].value = value;
        }
        $input.focus();
      } else {
        input.value = '';
        $input.removeClass('placeholder');
        input == document.activeElement && input.select();
      }
    }
  }

  function setPlaceholder() {
    var $replacement,
      input = this,
      $input = $(input),
      $origInput = $input,
      id = this.id;
    if (input.value == '') {
      if (input.type == 'password') {
        if (!$input.data('placeholder-textinput')) {
          try {
            $replacement = $input.clone().attr({
              'type': 'text'
            });
          } catch (e) {
            $replacement = $('<input>').attr($.extend(args(this), {
              'type': 'text'
            }));
          }
          $replacement
            .removeAttr('name')
            .data({
              'placeholder-password': true,
              'placeholder-id': id
            })
            .bind('focus.placeholder', clearPlaceholder);
          $input
            .data({
              'placeholder-textinput': $replacement,
              'placeholder-id': id
            })
            .before($replacement);
        }
        $input = $input.removeAttr('id').hide().prev().attr('id', id).show();
        // Note: `$input[0] != input` now!
      }
      $input.addClass('placeholder');
      $input[0].value = $input.attr('placeholder');
    } else {
      $input.removeClass('placeholder');
    }
  }

}(this, document, jQuery));

function isValidDate(year, month, day) {
  var date = new Date(year, (month - 1), day);
  var DateYear = date.getFullYear();
  var DateMonth = date.getMonth();
  var DateDay = date.getDate();
  if (DateYear == year && DateMonth == (month - 1) && DateDay == day)
    return true;
  else
    return false;
}

function isChecked(id) {
  var ReturnVal = false;
  $("#" + id).find('input[type="radio"]').each(function() {
    if ($(this).is(":checked"))
      ReturnVal = true;
  });
  $("#" + id).find('input[type="checkbox"]').each(function() {
    if ($(this).is(":checked"))
      ReturnVal = true;
  });
  return ReturnVal;
}

(function($) {
  var ValidationErrors = new Array();
  $.fn.validate = function(options) {
    options = $.extend({
      expression: "return true;",
      message: "",
      error_class: "ValidationErrors",
      error_field_class: "error",
      live: true
    }, options);
    var SelfID = $(this).attr("id");
    var unix_time = new Date();
    unix_time = parseInt(unix_time.getTime() / 1000);
    if (!$(this).parents('form:first').attr("id")) {
      $(this).parents('form:first').attr("id", "Form_" + unix_time);
    }
    var FormID = $(this).parents('form:first').attr("id");
    if (!((typeof(ValidationErrors[FormID]) == 'object') && (ValidationErrors[FormID] instanceof Array))) {
      ValidationErrors[FormID] = new Array();
    }
    if (options['live']) {
      if ($(this).find('input').length > 0) {
        $(this).find('input').bind('blur', function() {
          if (validate_field("#" + SelfID, options)) {
            if (options.callback_success)
              options.callback_success(this);
          } else {
            if (options.callback_failure)
              options.callback_failure(this);
          }
        });
        $(this).find('input').bind('focus keypress click', function() {
          $("#" + SelfID).next('.' + options['error_class']).remove();
          $("#" + SelfID).removeClass(options['error_field_class']);
        });
      } else {
        $(this).bind('blur', function() {
          validate_field(this);
        });
        $(this).bind('focus keypress', function() {
          $(this).next('.' + options['error_class']).fadeOut("fast", function() {
            $(this).remove();
          });
          $(this).removeClass(options['error_field_class']);
        });
      }
    }
    $(this).parents("form").submit(function() {
      if (validate_field('#' + SelfID))
        return true;
      else
        return false;
    });

    function validate_field(id) {
      var self = $(id).attr("id");
      var expression = 'function Validate(){' + options['expression'].replace(/VAL/g, '$(\'#' + self + '\').val()') + '} Validate()';
      var validation_state = eval(expression);
      if (!validation_state) {
        if ($(id).next('.' + options['error_class']).length == 0) {
          if (options['message'] != '') {
            $(id).after('<span class="' + options['error_class'] + '">' + options['message'] + '</span>');
          }
          $(id).addClass(options['error_field_class']);
        }
        if (ValidationErrors[FormID].join("|").search(id) == -1)
          ValidationErrors[FormID].push(id);
        return false;
      } else {
        for (var i = 0; i < ValidationErrors[FormID].length; i++) {
          if (ValidationErrors[FormID][i] == id)
            ValidationErrors[FormID].splice(i, 1);
        }
        return true;
      }
    }
  };
  $.fn.validated = function(callback) {
    $(this).each(function() {
      if (this.tagName == "FORM") {
        $(this).submit(function() {
          if (ValidationErrors[$(this).attr("id")].length == 0)
            callback();
          return false;
        });
      }
    });
  };
  $.fn.notvalidated = function(callback) {
    $(this).each(function() {
      if (this.tagName == "FORM") {
        $(this).submit(function() {
          if (ValidationErrors[$(this).attr("id")].length > 0)
            callback();
        });
      }
    });
  };
})(jQuery);

globalOffset = 0;

function gallerify() {
  $(".gallery").each(function(index) {
    var off = globalOffset;
    if (off == 0) {off = $(this).offset().left;}
    var gwidth = $(window).width() - off,
      ghwidth = $(this).find('.gallery__holder').width();
    $(this).find('.gallery__holder').width(ghwidth + 41);
    $(this).width(gwidth);
    $(this).mCustomScrollbar({
      axis: "x",
      scrollbarPosition: "inside",
      scrollInertia: 200,
      scrollButtons: {
        enable: true
      }
    });
  });
}

$(document).ready(function() {

  $("input[type=number]").keydown(function(e) {
    // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
      // Allow: Ctrl+A
      (e.keyCode == 65 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  });

  $("a[rel*='external']").click(function() {
    this.target = "_blank";
  });

  $('input, textarea').placeholder();

  $(".header__button").click(function() {
    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
      $('.contacts').stop().slideUp(300);
    } else {
      $(this).addClass('active');
      $('.contacts').stop().slideDown(300);
    }
    return false;
  });

  $(".fancybox").fancybox({
    helpers: {
      overlay: {
        fixed: false
      }
    }
  });

  gallerify();

  $(window).resize(function() {
    globalOffset = 0;
    gallerify();
  });

  if ($('#zoomscheme').length) {
    $('#zoomscheme').smoothZoom({
      responsive: true,
      pan_BUTTONS_SHOW: "NO",
      button_SIZE: 40,
      button_SIZE_TOUCH_DEVICE: 40,
      button_ALIGN: "top center",
      button_BG_COLOR: "#0e8abd",
      button_BG_TRANSPARENCY: "0",
      button_MARGIN: 0,
      button_ROUND_CORNERS: false,
      height: 577
    });
  }
});


! function(a) {
  a.fn.newPlugin = function(b) {
    var c = {};
    return this.each(function() {
      a.extend({}, c, b)
    })
  }
}(jQuery), $(function() {
  function b(a) {

    }! function() {
      var a = $(".js-tab");
      a.each(function() {
        function a(a) {
          f.panels[g.currentIndex].addClass(a ? "_next" : "_prev")
        }

        function b() {
          f.panels[g.prevIndex].removeClass("_part"), g.locked = !1
        }

        function c(a) {
          -1 != g.prevIndex && f.panels[g.prevIndex].addClass(a ? "_prev" : "_next").removeClass("active"), f.panels[g.currentIndex].addClass("_part active").removeClass("_prev _next"), setTimeout(b, 700)
        }

        function d() {
          var b = $(this);
          if (!b.hasClass("active") && !g.locked) {
            g.locked = !0;
            var d = b.data("item") || 0,
              e = g.currentIndex,
              h = d > e;
            f.items.removeClass("active"), b.addClass("active"), g.prevIndex = e, g.currentIndex = d, a(h), setTimeout(function() {
              c(h)
            }, 20);
            b.closest(".js-tab").attr("data-current",d);
            console.log(b.closest(".js-tab"));
          }
        }
        var e = $(this),
          f = {
            items: $(".js-tab-item", e),
            panels: {}
          },
          g = {
            currentIndex: 0,
            prevIndex: -1,
            panelCount: 0,
            locked: !1
          };
        $(".js-tab-panel", e).each(function() {
          var a = $(this);
          a.addClass("_next"), f.panels[a.data("panel")] = a, g.panelCount++
        }), f.panels[g.currentIndex].removeClass("_next").addClass("_part active"), f.items.on("click", d)
      })
    }(),
    function() {
      var a = $(".js-scroll-to");
      a.each(function() {
        var a = $(this);
        a.on("click", function(a) {
          a.preventDefault();
          var b = $(this),
            c = b.data("scrollto"),
            d = $('.js-scroll-target[data-scrollto="' + c + '"]').not(b).first(),
            e = b.data("scrollOffset") || 0,
            f = -5;
          Modernizr.touch && (f = 0, $(document).on("touchstart", function(a) {
            var b = $(a.target),
              c = b.closest(".scroll-wr.js-scroll"),
              d = b.closest(".scroll-wr.js-scroll.active");
            d.length || $(".scroll-wr.js-scroll").removeClass("active"), c.length && c.addClass("active")
          })), d.length && $("HTML, BODY").animate({
            scrollTop: d.offset().top - e - f
          }, function() {
            window.location.hash = c
          })
        })
      })
    }();
});
