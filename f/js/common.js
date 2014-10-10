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

+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.2.0'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    $el[val](data[state] == null ? this.options[state] : data[state])

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }

    if (changed) this.$element.toggleClass('active')
  }

  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    Plugin.call($btn, 'toggle')
    e.preventDefault()
  })

}(jQuery);

(function($) {
    // Cached vars
    var _iCheck = 'iCheck',
        _iCheckHelper = _iCheck + '-helper',
        _checkbox = 'checkbox',
        _radio = 'radio',
        _checked = 'checked',
        _unchecked = 'un' + _checked,
        _disabled = 'disabled',
        _determinate = 'determinate',
        _indeterminate = 'in' + _determinate,
        _update = 'update',
        _type = 'type',
        _click = 'click',
        _touch = 'touchbegin.i touchend.i',
        _add = 'addClass',
        _remove = 'removeClass',
        _callback = 'trigger',
        _label = 'label',
        _cursor = 'cursor',
        _mobile = /ipad|iphone|ipod|android|blackberry|windows phone|opera mini|silk/i.test(navigator.userAgent);
    // Plugin init
    $.fn[_iCheck] = function(options, fire) {
        // Walker
        var handle = 'input[type="' + _checkbox + '"], input[type="' + _radio + '"]',
            stack = $(),
            walker = function(object) {
                object.each(function() {
                    var self = $(this);
                    if (self.is(handle)) {
                        stack = stack.add(self);
                    } else {
                        stack = stack.add(self.find(handle));
                    }
                });
            };
        // Check if we should operate with some method
        if (/^(check|uncheck|toggle|indeterminate|determinate|disable|enable|update|destroy)$/i.test(options)) {
            // Normalize method's name
            options = options.toLowerCase();
            // Find checkboxes and radio buttons
            walker(this);
            return stack.each(function() {
                var self = $(this);
                if (options == 'destroy') {
                    tidy(self, 'ifDestroyed');
                } else {
                    operate(self, true, options);
                }
                // Fire method's callback
                if ($.isFunction(fire)) {
                    fire();
                }
            });
            // Customization
        } else if (typeof options == 'object' || !options) {
            // Check if any options were passed
            var settings = $.extend({
                    checkedClass: _checked,
                    disabledClass: _disabled,
                    indeterminateClass: _indeterminate,
                    labelHover: true
                }, options),
                selector = settings.handle,
                hoverClass = settings.hoverClass || 'hover',
                focusClass = settings.focusClass || 'focus',
                activeClass = settings.activeClass || 'active',
                labelHover = !!settings.labelHover,
                labelHoverClass = settings.labelHoverClass || 'hover',
                // Setup clickable area
                area = ('' + settings.increaseArea).replace('%', '') | 0;
            // Selector limit
            if (selector == _checkbox || selector == _radio) {
                handle = 'input[type="' + selector + '"]';
            }
            // Clickable area limit
            if (area < -50) {
                area = -50;
            }
            // Walk around the selector
            walker(this);
            return stack.each(function() {
                var self = $(this);
                // If already customized
                tidy(self);
                var node = this,
                    id = node.id,
                    // Layer styles
                    offset = -area + '%',
                    size = 100 + (area * 2) + '%',
                    layer = {
                        position: 'absolute',
                        top: offset,
                        left: offset,
                        display: 'block',
                        width: size,
                        height: size,
                        margin: 0,
                        padding: 0,
                        background: '#fff',
                        border: 0,
                        opacity: 0
                    },
                    // Choose how to hide input
                    hide = _mobile ? {
                        position: 'absolute',
                        visibility: 'hidden'
                    } : area ? layer : {
                        position: 'absolute',
                        opacity: 0
                    },
                    // Get proper class
                    className = node[_type] == _checkbox ? settings.checkboxClass || 'i' + _checkbox : settings.radioClass || 'i' + _radio,
                    // Find assigned labels
                    label = $(_label + '[for="' + id + '"]').add(self.closest(_label)),
                    // Check ARIA option
                    aria = !!settings.aria,
                    // Set ARIA placeholder
                    ariaID = _iCheck + '-' + Math.random().toString(36).substr(2, 6),
                    // Parent & helper
                    parent = '<div class="' + className + '" ' + (aria ? 'role="' + node[_type] + '" ' : ''),
                    helper;
                // Set ARIA "labelledby"
                if (aria) {
                    label.each(function() {
                        parent += 'aria-labelledby="';
                        if (this.id) {
                            parent += this.id;
                        } else {
                            this.id = ariaID;
                            parent += ariaID;
                        }
                        parent += '"';
                    });
                }
                // Wrap input
                parent = self.wrap(parent + '/>')[_callback]('ifCreated').parent().append(settings.insert);
                // Layer addition
                helper = $('<ins class="' + _iCheckHelper + '"/>').css(layer).appendTo(parent);
                // Finalize customization
                self.data(_iCheck, {
                    o: settings,
                    s: self.attr('style')
                }).css(hide);
                !!settings.inheritClass && parent[_add](node.className || '');
                !!settings.inheritID && id && parent.attr('id', _iCheck + '-' + id);
                parent.css('position') == 'static' && parent.css('position', 'relative');
                operate(self, true, _update);
                // Label events
                if (label.length) {
                    label.on(_click + '.i mouseover.i mouseout.i ' + _touch, function(event) {
                        var type = event[_type],
                            item = $(this);
                        // Do nothing if input is disabled
                        if (!node[_disabled]) {
                            // Click
                            if (type == _click) {
                                if ($(event.target).is('a')) {
                                    return;
                                }
                                operate(self, false, true);
                                // Hover state
                            } else if (labelHover) {
                                // mouseout|touchend
                                if (/ut|nd/.test(type)) {
                                    parent[_remove](hoverClass);
                                    item[_remove](labelHoverClass);
                                } else {
                                    parent[_add](hoverClass);
                                    item[_add](labelHoverClass);
                                }
                            }
                            if (_mobile) {
                                event.stopPropagation();
                            } else {
                                return false;
                            }
                        }
                    });
                }
                // Input events
                self.on(_click + '.i focus.i blur.i keyup.i keydown.i keypress.i', function(event) {
                    var type = event[_type],
                        key = event.keyCode;
                    // Click
                    if (type == _click) {
                        return false;
                        // Keydown
                    } else if (type == 'keydown' && key == 32) {
                        if (!(node[_type] == _radio && node[_checked])) {
                            if (node[_checked]) {
                                off(self, _checked);
                            } else {
                                on(self, _checked);
                            }
                        }
                        return false;
                        // Keyup
                    } else if (type == 'keyup' && node[_type] == _radio) {
                        !node[_checked] && on(self, _checked);
                        // Focus/blur
                    } else if (/us|ur/.test(type)) {
                        parent[type == 'blur' ? _remove : _add](focusClass);
                    }
                });
                // Helper events
                helper.on(_click + ' mousedown mouseup mouseover mouseout ' + _touch, function(event) {
                    var type = event[_type],
                        // mousedown|mouseup
                        toggle = /wn|up/.test(type) ? activeClass : hoverClass;
                    // Do nothing if input is disabled
                    if (!node[_disabled]) {
                        // Click
                        if (type == _click) {
                            operate(self, false, true);
                            // Active and hover states
                        } else {
                            // State is on
                            if (/wn|er|in/.test(type)) {
                                // mousedown|mouseover|touchbegin
                                parent[_add](toggle);
                                // State is off
                            } else {
                                parent[_remove](toggle + ' ' + activeClass);
                            }
                            // Label hover
                            if (label.length && labelHover && toggle == hoverClass) {
                                // mouseout|touchend
                                label[/ut|nd/.test(type) ? _remove : _add](labelHoverClass);
                            }
                        }
                        if (_mobile) {
                            event.stopPropagation();
                        } else {
                            return false;
                        }
                    }
                });
            });
        } else {
            return this;
        }
    };
    // Do something with inputs
    function operate(input, direct, method) {
        var node = input[0],
            state = /er/.test(method) ? _indeterminate : /bl/.test(method) ? _disabled : _checked,
            active = method == _update ? {
                checked: node[_checked],
                disabled: node[_disabled],
                indeterminate: input.attr(_indeterminate) == 'true' || input.attr(_determinate) == 'false'
            } : node[state];
        // Check, disable or indeterminate
        if (/^(ch|di|in)/.test(method) && !active) {
            on(input, state);
            // Uncheck, enable or determinate
        } else if (/^(un|en|de)/.test(method) && active) {
            off(input, state);
            // Update
        } else if (method == _update) {
            // Handle states
            for (var each in active) {
                if (active[each]) {
                    on(input, each, true);
                } else {
                    off(input, each, true);
                }
            }
        } else if (!direct || method == 'toggle') {
            // Helper or label was clicked
            if (!direct) {
                input[_callback]('ifClicked');
            }
            // Toggle checked state
            if (active) {
                if (node[_type] !== _radio) {
                    off(input, state);
                }
            } else {
                on(input, state);
            }
        }
    }
    // Add checked, disabled or indeterminate state
    function on(input, state, keep) {
        var node = input[0],
            parent = input.parent(),
            checked = state == _checked,
            indeterminate = state == _indeterminate,
            disabled = state == _disabled,
            callback = indeterminate ? _determinate : checked ? _unchecked : 'enabled',
            regular = option(input, callback + capitalize(node[_type])),
            specific = option(input, state + capitalize(node[_type]));
        // Prevent unnecessary actions
        if (node[state] !== true) {
            // Toggle assigned radio buttons
            if (!keep && state == _checked && node[_type] == _radio && node.name) {
                var form = input.closest('form'),
                    inputs = 'input[name="' + node.name + '"]';
                inputs = form.length ? form.find(inputs) : $(inputs);
                inputs.each(function() {
                    if (this !== node && $(this).data(_iCheck)) {
                        off($(this), state);
                    }
                });
            }
            // Indeterminate state
            if (indeterminate) {
                // Add indeterminate state
                node[state] = true;
                // Remove checked state
                if (node[_checked]) {
                    off(input, _checked, 'force');
                }
                // Checked or disabled state
            } else {
                // Add checked or disabled state
                if (!keep) {
                    node[state] = true;
                }
                // Remove indeterminate state
                if (checked && node[_indeterminate]) {
                    off(input, _indeterminate, false);
                }
            }
            // Trigger callbacks
            callbacks(input, checked, state, keep);
        }
        // Add proper cursor
        if (node[_disabled] && !!option(input, _cursor, true)) {
            parent.find('.' + _iCheckHelper).css(_cursor, 'default');
        }
        // Add state class
        parent[_add](specific || option(input, state) || '');
        // Set ARIA attribute
        if (!!parent.attr('role') && !indeterminate) {
            parent.attr('aria-' + (disabled ? _disabled : _checked), 'true');
        }
        // Remove regular state class
        parent[_remove](regular || option(input, callback) || '');
    }
    // Remove checked, disabled or indeterminate state
    function off(input, state, keep) {
        var node = input[0],
            parent = input.parent(),
            checked = state == _checked,
            indeterminate = state == _indeterminate,
            disabled = state == _disabled,
            callback = indeterminate ? _determinate : checked ? _unchecked : 'enabled',
            regular = option(input, callback + capitalize(node[_type])),
            specific = option(input, state + capitalize(node[_type]));
        // Prevent unnecessary actions
        if (node[state] !== false) {
            // Toggle state
            if (indeterminate || !keep || keep == 'force') {
                node[state] = false;
            }
            // Trigger callbacks
            callbacks(input, checked, callback, keep);
        }
        // Add proper cursor
        if (!node[_disabled] && !!option(input, _cursor, true)) {
            parent.find('.' + _iCheckHelper).css(_cursor, 'pointer');
        }
        // Remove state class
        parent[_remove](specific || option(input, state) || '');
        // Set ARIA attribute
        if (!!parent.attr('role') && !indeterminate) {
            parent.attr('aria-' + (disabled ? _disabled : _checked), 'false');
        }
        // Add regular state class
        parent[_add](regular || option(input, callback) || '');
    }
    // Remove all traces
    function tidy(input, callback) {
        if (input.data(_iCheck)) {
            // Remove everything except input
            input.parent().html(input.attr('style', input.data(_iCheck).s || ''));
            // Callback
            if (callback) {
                input[_callback](callback);
            }
            // Unbind events
            input.off('.i').unwrap();
            $(_label + '[for="' + input[0].id + '"]').add(input.closest(_label)).off('.i');
        }
    }
    // Get some option
    function option(input, state, regular) {
        if (input.data(_iCheck)) {
            return input.data(_iCheck).o[state + (regular ? '' : 'Class')];
        }
    }
    // Capitalize some string
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    // Executable handlers
    function callbacks(input, checked, callback, keep) {
        if (!keep) {
            if (checked) {
                input[_callback]('ifToggled');
            }
            input[_callback]('ifChanged')[_callback]('if' + capitalize(callback));
        }
    }
})(window.jQuery || window.Zepto);

globalOffset = 0;

function gallerify() {
  $(".gallery").each(function(index) {
    var off = globalOffset;
    if (off == 0) {
      if ($(this).closest('.swapper').length) {
        off = $(this).closest('.swapper').offset().left;
        if ($(window).width() > 1190) {
          off-=41;
        }
        else {
          off-=33;
        }
      }
      else {
        off = $(this).offset().left;
      }
    }

    var gwidth = $(window).width() - off,
      ghwidth = $(this).find('.gallery__holder').data('width');
      if ($(window).width() > 1190) {
        $(this).find('.gallery__holder').width(ghwidth + 41);
      }
      else {
        $(this).find('.gallery__holder').width(ghwidth + 33);
      }
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


  var nCurPosX;

  $('html').mousemove(function(e){
    if(!e) e = window.event;
    nCurPosX = e.clientX;
  });

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

  $(document).on( "click", ".js-anchor", function(a) {
    a.preventDefault();
    var b = $(this),
        c = b.data("scrollto"),
        d = $('.js-scroll-target[data-scrollto="' + c + '"]').not(b).first(),
        field = $("#" + c);
                    if (field.length) {

                        if (field.is("input") || field.is("select") || field.is("textarea")) {
                            if (field.is("[type=checkbox]") || field.is("[type=radio]")) {
                              $("HTML, BODY").animate({scrollTop: $("label[for='" + c + "']").offset().top - 10});
                            } else {
                                $("HTML, BODY").animate({scrollTop: $("label[for='" + c + "']").offset().top - 10});
                                field.focus();
                            }

                        }
                    }

    /*$("HTML, BODY").animate({
      scrollTop: d.offset().top - f
    })*/
  });

  $(".modal-inline").fancybox({
    type: 'inline',
    fixed: false,
    autoResize: false,
    autoCenter: false,
    fitToView: false,
    padding: 0,
    helpers: {
      overlay: {
        fixed: false
      }
    }
  });

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

  $(".projects__result-object-close").click(function() {
    $(this).closest('.projects__result-object_on-map').fadeOut();
    return false;
  });

  $(".menu__item").click(function() {
    if (is_touch_device()) {
      if ($(this).closest('.menu__extra').length) {
        $(this).closest('.menu__extra').hide();
        return false;
      } else {
        if ($(this).closest('.menu__block').find('.menu__extra').length) {
          $(this).closest('.menu__block').find('.menu__extra').fadeIn();
          return false;
        }
      }
    }
  });

  $('[data-popup]').hover(function() {
    if (is_touch_device() === false) {
      var $curItem = $(this),
        $submenu = $(this).find('.menu__extra').eq(0);

      $curItem.addClass('hover');
      setTimeout(function() {
        if ($curItem.hasClass('hover')) {
          $submenu.fadeIn();
        }
      }, 50);
    }

  }, function() {
    if (is_touch_device() === false) {
      var nPosXStart = nCurPosX,
        $submenu = $(this).find('.menu__extra').eq(0),
        $curItem = $(this);

      $curItem.removeClass('hover');
      setTimeout(function() {
        var nPosXEnd = nCurPosX;

        if (nPosXEnd - nPosXStart > 0)
          setTimeout(function() {
            if (!$submenu.hasClass('hover') && !$curItem.hasClass('hover')) {
              $submenu.hide().removeClass('hover');
            }
          }, 200);
        else if (!$submenu.hasClass('hover') && !$curItem.hasClass('hover')) {
          $submenu.hide().removeClass('hover');
        }
      }, 10);
    }
  });

  $('input').iCheck({
    checkboxClass: 'icheckbox_minimal',
    radioClass: 'iradio_minimal'
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
    setTimeout(function() { 
      $(".swapper").each(function(index) {
        $(".swapper").height($(".swapper > .active").height());
      });
    }, 100);
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
          -1 != g.prevIndex && f.panels[g.prevIndex].addClass(a ? "_prev" : "_next").removeClass("active"), f.panels[g.currentIndex].addClass("_part active").removeClass("_prev _next"), f.panels[g.currentIndex].parent().height(f.panels[g.currentIndex].height()), setTimeout(b, 700)
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
        }), f.panels[g.currentIndex].removeClass("_next").addClass("_part active"), f.panels[g.currentIndex].parent().height(f.panels[g.currentIndex].height()), f.items.on("click", d)
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
            //window.location.hash = c
          })
        })
      })
    }();
});
