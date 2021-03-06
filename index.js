'use strict';
//Rheanna Mistry
//INFO 498E 
//Assignment 2: Module Documentation
//In this assignment I am commenting the code of the npm package: reply
//The reply package gets user input from node.js

var rl, readline = require('readline'); //To get input from user

//Input and output from the terminal
var get_interface = function(stdin, stdout) {
  if (!rl) rl = readline.createInterface(stdin, stdout);
  else stdin.resume(); // interface exists
  return rl;
}

/**
 *Getting confirmation from the user
 * @param {string} message
 * @param {function()} callback
 * @returns {function()} callback 
 */
var confirm = exports.confirm = function(message, callback) {
  var question = {
    'reply': {
      type: 'confirm',
      message: message,
      default: 'yes'
    }
  }  
  get(question, function(err, answer) {
    if (err) return callback(err);
    callback(null, answer.reply === true || answer.reply == 'yes');
  });
};

/**
 * Creating the prompt
 * @param {object} options
 * @param {function()} callback
 * @returns {function()} callback
 */
var get = exports.get = function(options, callback) {
  if (!callback) return; // no point in continuing
  
  if (typeof options != 'object') //must be an object or will display error message
    return callback(new Error("Please pass a valid options object."))

  var answers = {},
      stdin = process.stdin, //input comes from the terminal
      stdout = process.stdout, //output goes to the terminal
      fields = Object.keys(options);

  var done = function() {
    close_prompt();
    callback(null, answers);
  }

  //Closing the interface
  var close_prompt = function() {
    stdin.pause();
    if (!rl) return;
    rl.close();
    rl = null;
  }

  //Sets a default value
  var get_default = function(key, partial_answers) {
    if (typeof options[key] == 'object')
      return typeof options[key].default == 'function' ? options[key].default(partial_answers) : options[key].default;
    else
      return options[key];
  }

  //Checking the type of guess, returns boolean
  var guess_type = function(reply) {
    if (reply.trim() == '') //checking if blank
      return;
    else if (reply.match(/^(true|y(es)?)$/))
      return true;
    else if (reply.match(/^(false|n(o)?)$/))
      return false;
    else if ((reply*1).toString() === reply)
      return reply*1;
    return reply;
  }

  //Checking response against array of options
  var validate = function(key, answer) {
    if (typeof answer == 'undefined')
      return options[key].allow_empty || typeof get_default(key) != 'undefined';
    else if(regex = options[key].regex)
      return regex.test(answer);
    else if(options[key].options)
      return options[key].options.indexOf(answer) != -1;
    else if(options[key].type == 'confirm')
      return typeof(answer) == 'boolean'; 
    else if(options[key].type && options[key].type != 'password')
      return typeof(answer) == options[key].type;
    return true;
  }

  //Displays the error for each field
  var show_error = function(key) {
    var str = options[key].error ? options[key].error : 'Invalid value.'; 
    if (options[key].options)
        str += ' (options are ' + options[key].options.join(', ') + ')'; //displays options
    stdout.write("0o033[31m" + str + "0o033[0m" + "\n");
  }

  //Writing out the message
  var show_message = function(key) {
    var msg = '';
    if (text = options[key].message)
      msg += text.trim() + ' ';
    if (options[key].options)
      msg += '(options are ' + options[key].options.join(', ') + ')';
    if (msg != '') stdout.write("0o033[1m" + msg + "0o033[0m\n");
  }

  //Function for when user enters password. Masks characters with * and accounts for backspaces
  var wait_for_password = function(prompt, callback) {
    var buf = '',
        mask = '*';
    
    var keypress_callback = function(c, key) {

      //If user just presses enter key, gives default value
      if (key && (key.name == 'enter' || key.name == 'return')) {
        stdout.write("\n");
        stdin.removeAllListeners('keypress');
      
        // stdin.setRawMode(false);
        return callback(buf);
      }
      
      //If user types 'c' close the prompt
      if (key && key.ctrl && key.name == 'c')
        close_prompt();
      
      //support for backspace keystrokes
      if (key && key.name == 'backspace') {
        buf = buf.substr(0, buf.length-1);
        var masked = '';
        for (i = 0; i < buf.length; i++) { masked += mask; }
        stdout.write('\r0o033[2K' + prompt + masked);
      }      
      
      //Masks the password with * characters
      else {
        stdout.write(mask);
        buf += c;
      }
    };
    stdin.on('keypress', keypress_callback);
  }

  //Validating the user's input
  var check_reply = function(index, curr_key, fallback, reply) {
    var answer = guess_type(reply);
    var return_answer = (typeof answer != 'undefined') ? answer : fallback;
    if (validate(curr_key, answer))
      next_question(++index, curr_key, return_answer);
    else
      show_error(curr_key) || next_question(index); // repeats current
  }

  //Checking dependencies,returns a boolean
  var dependencies_met = function(conds) {
    for (var key in conds) {
      var cond = conds[key];
      if (cond.not) { // object, inverse
        if (answers[key] === cond.not)
          return false;
      } else if (cond.in) { // array 
        if (cond.in.indexOf(answers[key]) == -1) 
          return false;
      } else {
        if (answers[key] !== cond)
          return false; 
      }
    }
    return true;
  }

  //Allows moving on to the next question  
  var next_question = function(index, prev_key, answer) {
    if (prev_key) answers[prev_key] = answer;
    var curr_key = fields[index];
    if (!curr_key) return done();
    if (options[curr_key].depends_on) {
      if (!dependencies_met(options[curr_key].depends_on))
        return next_question(++index, curr_key, undefined);
    }
    var prompt = (options[curr_key].type == 'confirm') ?
      ' - yes/no: ' : " - " + curr_key + ": ";

    var fallback = get_default(curr_key, answers);
    if (typeof(fallback) != 'undefined' && fallback !== '')
      prompt += "[" + fallback + "] ";
    show_message(curr_key);
    if (options[curr_key].type == 'password') {
      var listener = stdin._events.keypress; // to reassign down later
      stdin.removeAllListeners('keypress');

      // stdin.setRawMode(true);
      stdout.write(prompt);
      wait_for_password(prompt, function(reply) {
        stdin._events.keypress = listener; // reassign
        check_reply(index, curr_key, fallback, reply)
      });
    } else {
      rl.question(prompt, function(reply) {
        check_reply(index, curr_key, fallback, reply);
      });
    }
  }

  rl = get_interface(stdin, stdout);
  next_question(0);

  //closing the prompt and displaying number of answers if canceled
  rl.on('close', function() {
    close_prompt(); // just in case
    var given_answers = Object.keys(answers).length;
    if (fields.length == given_answers) return;
    var err = new Error("Cancelled after giving " + given_answers + " answers.");
    callback(err, answers);
  });

}