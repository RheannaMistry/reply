var reply = require('./../');

reply.confirm('Would you like to continue?', function(err, yes){

  if (err && !yes) {
    console.log("We will not continue.");
  } else {
    console.log("We will now continue.");
  }
});