/*
 * Derived work
 * Copyright 2010 SOFTEC sa. All rights reserved.
 *
 * Original work
 *   JavaScript Debug - v0.4 - 6/22/2010
 * http://benalman.com/projects/javascript-debug-console-log/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 *
 * With lots of help from Paul Irish!
 * http://paulirish.com/
 */

// Script: JavaScript Debug: A simple wrapper for console.log
//
// *Version: 0.4, Last Updated: 6/22/2010*
//
// Tested with Internet Explorer 6-8, Firefox 3-3.6, Safari 3-4, Chrome 3-8, Opera 9.6-11
//
// Home       - http://benalman.com/projects/javascript-debug-console-log/
// GitHub     - http://github.com/cowboy/javascript-debug/
// Source     - http://github.com/cowboy/javascript-debug/raw/master/ba-debug.js
// (Minified) - http://github.com/cowboy/javascript-debug/raw/master/ba-debug.min.js (1.1kb)
//
// About: License
//
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
//
// Examples - http://benalman.com/code/projects/javascript-debug/examples/debug/
//
// About: Revision History
//
// 0.4 - (6/22/2010) Added missing passthrough methods: exception, groupCollapsed, table
//
// 0.3 - (6/8/2009) Initial release
//
// Topic: Pass-through console methods
//
// assert, clear, count, dir, dirxml, exception, group, groupCollapsed,
// groupEnd, profile, profileEnd, table, time, timeEnd, trace
//
// These console methods are passed through (but only if both the console and
// the method exists), so use them without fear of reprisal. Note that these
// methods will not be passed through if the logging level is set to 0 via
// <debug.setLevel>.

//
// Here is a bookmarket for activating firebuglite and dump the history log:
// javascript:(function(F,i,r,e,b,u,g,L,I,T,E){if(F.getElementById(b))return;E=F[i+'NS']&&F.documentElement.namespaceURI;E=E?F[i+'NS'](E,'script'):F[i]('script');E[r]('id',b);E[r]('src',I+g);E[r](b,u);E.text=T;(F[e]('head')[0]||F[e]('body')[0]).appendChild(E);E=new%20Image;E[r]('src',I+L);})(document,'createElement','setAttribute','getElementsByTagName','FirebugLite','4','firebug-lite.js','releases/lite/latest/skin/xp/sprite.png','https://getfirebug.com/','{startOpened:true,onLoad:function(){if(window.debug&&debug.setCallback){debug.setCallback(function(b){var a=Array.prototype.slice.call(arguments,!!console[b]),b=console[b]||((a[0]=b.toUpperCase())&&console.log);b.apply(console,a);},true)}}}');
//

window.debug = (function ()
{
    var window = this,
    document = window.document,

    // Some convenient shortcuts.
    aps = Array.prototype.slice,
    con = window.console,

    // Public object to be returned.
    that = {},

    callback_func,
    callback_force,

    // Default logging level, show everything.
    default_log_level = 5,
    log_level = 5,

    // Logging methods, in "priority order". Not all console implementations
    // will utilize these, but they will be used in the callback passed to
    // setCallback.
    log_methods = [ 'error', 'warn', 'info', 'debug', 'log', 'callTrace' ],

    // Pass these methods through to the console if they exist, otherwise just
    // fail gracefully. These methods are provided for convenience.
    pass_methods = 'assert clear count dir dirxml exception group groupCollapsed groupEnd profile profileEnd table time timeEnd trace'.split(' '),
    idx = pass_methods.length,

    domInsertion = false,
    domArgJoin = [": ", ", "],                  // either an array of strings or a user-defined function; used to join array elements (see join_arr())
    domWriter = document.createElement('div'),

    // Logs are stored here so that they can be recalled as necessary.
    logs = [];

    while (--idx >= 0)
    {
        (function (method)
        {
            // Generate pass-through methods. These methods will be called, if they
            // exist, as long as the logging level is non-zero.
            that[method] = function ()
            {
                con = window.console; // A console might appears anytime

                if(log_level !== 0 && con)
                {
                    if(con[method] && typeof(con[method].apply) != 'undefined')
                    {
                        con[method].apply(con, arguments); // FireFox || Firebug Lite || Opera || Chrome
                    }
                    else
                    {
                        var args = aps.call(arguments);
                        if(method.indexOf('group') != -1)
                        {
                            args.unshift('['+method+']');
                            that['log'](args.join(' ')); // IE 8 (at least)
                        }
                    }
                }
            }

        })(pass_methods[idx]);
    }

    idx = log_methods.length;
    while (--idx >= 0)
    {
        (function( idx, level, logger, Ulevel, withLevel )
        {

            // Method: debug.log
            //
            // Call the console.log method if available. Adds an entry into the logs
            // array for a callback specified via <debug.setCallback>.
            //
            // Usage:
            //
            //  debug.log( object [, object, ...] );
            //
            // Arguments:
            //
            //  object - (Object) Any valid JavaScript object.

            // Method: debug.debug
            //
            // Call the console.debug method if available, otherwise call console.log.
            // Adds an entry into the logs array for a callback specified via
            // <debug.setCallback>.
            //
            // Usage:
            //
            //  debug.debug( object [, object, ...] );
            //
            // Arguments:
            //
            //  object - (Object) Any valid JavaScript object.

            // Method: debug.info
            //
            // Call the console.info method if available, otherwise call console.log.
            // Adds an entry into the logs array for a callback specified via
            // <debug.setCallback>.
            //
            // Usage:
            //
            //  debug.info( object [, object, ...] );
            //
            // Arguments:
            //
            //  object - (Object) Any valid JavaScript object.

            // Method: debug.warn
            //
            // Call the console.warn method if available, otherwise call console.log.
            // Adds an entry into the logs array for a callback specified via
            // <debug.setCallback>.
            //
            // Usage:
            //
            //  debug.warn( object [, object, ...] );
            //
            // Arguments:
            //
            //  object - (Object) Any valid JavaScript object.

            // Method: debug.error
            //
            // Call the console.error method if available, otherwise call console.log.
            // Adds an entry into the logs array for a callback specified via
            // <debug.setCallback>.
            //
            // Usage:
            //
            //  debug.error( object [, object, ...] );
            //
            // Arguments:
            //
            //  object - (Object) Any valid JavaScript object.

            that[level] = function ()
            {
                var args = aps.call(arguments),
                log_arr = [level].concat(args);

                logs.push(log_arr);
                if (domInsertion)
                {
                    var txtNode = document.createTextNode(join_arr(log_arr, domArgJoin));
                    domWriter.appendChild(txtNode);
                    domWriter.appendChild(document.createElement('br'));
                }
                exec_callback(log_arr);

                con = window.console; // A console might appears anytime

                if (!is_level(idx))
                    return;

                if ( withLevel ) {
                    args = [ Ulevel ].concat( args );
                }

                if (!con && !domInsertion)
                {
                    //alert('Meh! You have no console :-( You should use debug.setDomInsertion(true); or debug.exportLogs();');
                    return;
                }

                con[logger] ? trace(logger, args) : trace('log', args); // Degradation path
            };

            // Check if provided level is currently actively logged
            that['is' + level.substring(0, 1).toUpperCase() + level.substring(1) + 'Enabled'] = function() {
                return is_level(idx);
            };

        })(idx, log_methods[idx], log_methods[Math.min(idx, 4)], log_methods[idx].toUpperCase(), idx > 4 );
    }

    // Call the browser console logger
    function trace(level, args)
    {
        if (typeof (con[level].apply) != 'undefined')
        {
            con[level].apply(con, args); // FireFox || Firebug Lite || Opera || Chrome
        }
        else
        {
            con[level](args.join(' ')); // IE 8 (at least)
        }
    }

    // Join arguments using the specified separator(s):
    function join_arr(arr, seps) {
        var rv = "";
        var i, si;

        if (typeof seps === "function") {
            return seps.call(arr, seps);
        } 
        for (i = 0; i < arr.length - 1; i++) {
            si = Math.min(i, seps.length - 1);
            rv += String(arr[i]) + String(seps[si]);
        }
        if (i < arr.length) {
            rv += arr[i];
        }
        return rv;
    }

    // Execute the callback function if set.
    function exec_callback(args)
    {
        if (callback_func && (callback_force || !con || !con.log))
        {
            callback_func.apply(window, args);
        }
    };

    // Method: debug.setLevel
    //
    // Set a minimum or maximum logging level for the console. Doesn't affect
    // the <debug.setCallback> callback function, but if set to 0 to disable
    // logging, <Pass-through console methods> will be disabled as well.
    //
    // Usage:
    //
    //  debug.setLevel( [ level ] )
    //
    // Arguments:
    //
    //  level - (Number) If 0, disables logging. If negative, shows N lowest
    //    priority levels of log messages. If positive, shows N highest priority
    //    levels of log messages.
    //
    // Priority levels:
    //
    //   callTrace(-1) < log (-2) < debug (-3) < info (-4) < warn (-5) < error (-6)
    //   callTrace(6) > log (5) > debug (4) > info (3) > warn (2) > error (1)

    that.setLevel = function (level)
    {
        log_level = typeof level === 'number' ? level : default_log_level;
    };

    that.getLevel = function() {
        return log_level;
    };

    // Determine if the level is visible given the current log_level.
    //
    // Note that level is minus one compared to log_level
    function is_level(level)
    {
        return log_level > 0 ? log_level > level : log_methods.length + log_level <= level;
    };

    // Method: debug.setCallback
    //
    // Set a callback to be used if logging isn't possible due to console.log
    // not existing. If unlogged logs exist when callback is set, they will all
    // be logged immediately unless a limit is specified.
    //
    // Usage:
    //
    //  debug.setCallback( callback [, force ] [, limit ] )
    //
    // Arguments:
    //
    //  callback - (Function) The aforementioned callback function. The first
    //    argument is the logging level, and all subsequent arguments are those
    //    passed to the initial debug logging method.
    //  force - (Boolean) If false, log to console.log if available, otherwise
    //    callback. If true, log to both console.log and callback.
    //  limit - (Number) If specified, number of lines to limit initial scrollback
    //    to.

    that.setCallback = function ()
    {
        var args = aps.call(arguments),
        max = logs.length,
        i = max;

        callback_func = args.shift() || null;
        callback_force = typeof args[0] === 'boolean' ? args.shift() : false;

        i -= typeof args[0] === 'number' ? args.shift() : max;

        while (i < max)
        {
            exec_callback(logs[i++]);
        }
    };

    that.setDomInsertion = function (active, className, arg_join)
    {
        domInsertion = active;
        if (typeof arg_join === "function") {
            domArgJoin = arg_join;
        } else if (domArgJoin) {
            // http://stackoverflow.com/questions/4775722/javascript-check-if-object-is-array
            domArgJoin = [].concat(arg_join);
        }
        if (active && document.body)
        {
            document.body.appendChild(domWriter);
            var c = 'debug';
            if (typeof (className) == 'string')
                c = className;
            domWriter.className = c;
        }
        else
        {
            domWriter.parentNode.removeChild(domWriter);
        }
    };

    function isElement(obj)
    {
        try
        {
            // Using W3 DOM2 (works for FF, Opera and Chrom)
            return obj instanceof HTMLElement;
        }
        catch (e)
        {
            // Browsers not supporting W3 DOM2 don't have HTMLElement.
            // Testing some properties that all elements have.
            return (typeof obj === 'object') && (obj.nodeType === 1) && (typeof obj.style === 'object') && (typeof obj.ownerDocument === 'object');
        }
    }

    that.exportLogs = function (elem)
    {
        if (isElement(elem))
        {
            elem.innerHTML = logs.join('<br />');
        }
    };

    return that;
})();

