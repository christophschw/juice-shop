'use strict'

require('./lib/startup/validateDependencies')().then(() => {

    var util = require('util');

    // Get a reference to njstrace default Formatter class
    var Formatter = require('njstrace/lib/formatter.js');


    // Create my custom Formatter class
    function TSVFormatter() {
        var Output = require('njstrace/lib/output.js');
        // Set output file
        this.output = new Output('./logs/trace.tsv');
    }

    // But must "inherit" from Formatter
    require('util').inherits(TSVFormatter, Formatter);

    TSVFormatter.prototype.inspect = function (arg) {
        // util.inspect break the result to multiple lines if it is too long (see node function reduceToSingleString() in util.js)
        // so here we remove the \n to keep the result as a single line
        return (arg !== null && typeof arg !== 'undefined') ? util.inspect(arg, 'null').replace(/(\r\n|\n|\r)/gm, "") : '';
    };

    // Implement the onEntry method
    TSVFormatter.prototype.onEntry = function (args) {

        // Loop thru the arguments and inspect them
        var argsInspect = '';
        for (var i = 0; args.args && i < args.args.length; ++i) {
            var currArg = this.inspect(args.args[i]);
            currArg = currArg.substr(0, 50);
            argsInspect += currArg + '\t';
        }
        this.output.write('%s\t%s\tentry\t%s\t%s::%s\t%s,', //\t%s',
            args.ts, args.session, args.name, args.file, args.line, args.args.length); //, argsInspect);
    };

    // Implement the onExit method
    TSVFormatter.prototype.onExit = function (args) {
        //this.output.write('%s\texit\t%s\t%s::%s\t%s\t%s\t%s\t%s',
        //Date.now(), args.name, args.file, args.line, args.exception, args.retLine, args.span, args.returnValue !== null);
    };


    // Call inject and pass the formatter config objects
    var njstrace = require('njstrace').inject({
        files: ["**/*.js"],
        formatter: new TSVFormatter()
    });

    const server = require('./server')
    server.start()
})
