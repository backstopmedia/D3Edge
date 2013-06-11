

// helpers for when you wish to run the basic examples in your browser:
///////////////////////////////////////////////////////////////////
//
// Tested OK on IE10, FF19, FF20, Chromium 25.0.1365.0 (173798), Safari 5.1.7 (Win7/64)
//

var jQuery = {};

debug.setDomInsertion(true, null, [": ", "  "]);

// @return object containing the function name of the invoker of this function in the .name property. Also return the call stack in the .stack property.
//
// This implementation does not use `arguments.caller` nor `Function.caller()` as the former is deprecated and the latter is not portable.
// Instead we chose to rely on an external library which should take care of all the portability issues re ECMEscript 5, 3, browsers, etc.
//
// Info: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Functions_and_function_scope/arguments/caller
//       https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/caller
//       http://stackoverflow.com/questions/15557487/argument-callee-name-alternative-in-the-new-ecma5-javascript-standard (this article is of little use to our purposes, but alas, if you want an SO link, here's one...)
//       http://www.eriwen.com/javascript/js-stack-trace/
//
function getCurrentFunctionName() {
    var fn;
    var st = printStackTrace({guess: true}) || [];
    for (var i = 0; i < st.length; i++) {
        if (st[i].indexOf("getCurrentFunctionName") >= 0) {
            break;
        }
    }
    st.splice(0, i + 1);
    fn = stacktrace_extract_fn_and_srcinfo(st[0]);
    fn.stack = st;
    return fn;
}

// extract function name and filename:linenumber from the stracktrace line, as produced by printStackTrace()
function stacktrace_extract_fn_and_srcinfo(stackline) {
    var fn;
    if (stackline) {
        try {
            fn = {
                name: (stackline.indexOf("@") > 0 /* FF detect */
                      ? /* FF */ stackline.replace(/^([^@a-zA-Z_]*)([^@<]*)[<]*@.*$/, "$2")
                      : /* Chrome / Safari */ stackline.replace(/^(.*at +(([^:]+) .*\/\/.*))|(.*at +[^ ]+)$/, "$3")
                      ) || "anonymous",
                loc: (stackline.indexOf(" -- ") > 0 /* Opera detect */
                     ? /* Opera */ stackline.replace(/^(.*\/code\/chapter[^\/]+\/)?([^ )]+)\)? -- .*$/, "$2")
                     : (stackline.indexOf("@") > 0 /* FF detect */
                       ? /* FF */ stackline.replace(/^(.*\/code\/chapter[^\/]+\/)?([^ )]+)\)?$/, "$2")
                       : (stackline.indexOf("at ") >= 0 /* Chrome detect */
                         ? /* Chrome / Chromium */ stackline.replace(/^.*at +(.*\/code\/chapter[^\/]+\/)?([^ )]+)\)?( .*)?\)?$/, "$2")
                         : /* Safari don't do no lineno/srcfile info */ "..."
                         )
                       )
                     )
            };
            // FF hotfix:
            if (fn.name == "getCurrentFunctionName()") {
                fn.name = "anonymous";
            }
            // Opera hotfix:
            if (fn.name.indexOf("getSource failed with url:") >= 0) {
                fn.name = fn.name.replace(/^.*(object\(.*\)).*$/, "$1");
                fn.name = fn.name.replace(/object\(/, "anonymous(");
                if (fn.name.indexOf("getSource failed with url:") >= 0) {
                    fn.name = "anonymous";
                }
            }
            fn.func_n_loc = fn.name + " @ line " + fn.loc;
        } catch(e) {
            fn = null;
        }
    }
    return fn || {
        name: "...",
        loc: "???",
        func_n_loc: "..."
    };
}

///////////////////////////////////////////////////////////////////

