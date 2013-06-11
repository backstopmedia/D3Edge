// A module is a boundary: a self-invoking function a.k.a. closure.
///////////////////////////////////////////////////////////////////


// Our new module in the D3 namespace: et Dieu créa la closure! (The Sequel)
d3.edge = function() {
    var private_variable_a;

    // private function
    function X() {
        // ...
        debug.log("E#10: exec private function : ", getCurrentFunctionName().func_n_loc);
    }

    // 'edge' is a local variable, which we return at the end.
    // It is a function, which is a First Class Citizen in JavaScript,
    // thus it also serves as an object.
    var edge = function() {
        // ...
        debug.log("E#10: exec returned function : ", getCurrentFunctionName().func_n_loc);

        // use the privates:
        X();
        // ...
        ++private_variable_a;
        // ...
    };

    // API function d3.edge.A():
    edge.A = function() {
        // ...
        debug.log("E#10: exec A() API function : ", getCurrentFunctionName().func_n_loc);

        // call the private function:
        X();
        // ...
        // allow chaining if we've nothing better to return:
        return edge;
    };

    // API function d3.edge.B():
    edge.B = function() {
        // ...
        debug.log("E#10: exec B() API function : ", getCurrentFunctionName().func_n_loc);

        // call the private function:
        X();
        // ...
        // allow chaining if we've nothing better to return:
        return edge;
    };

    return edge;
};

/* usage of the above 'reusable function' */
debug.log("E#10.a: going to instance the d3.edge component with .A() and .B() API functions : ", getCurrentFunctionName().func_n_loc);

var instance = d3.edge();
// and lo, you can already use it:
instance();
// that will run this code shown before:
//
//  // ...
//  // use the privates:
//  private_function_b();
//  // ...
//  ++private_variable_a;
//  // ...

// now call the API functions A() and B():
instance.A();
instance.B();
