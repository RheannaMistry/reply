var reply = require('./../');

var opts = {
  animal: {
      message: 'What is your favorite animal?'
  },
  insect: {
      message: 'What is your favorite insect?'
  }
}

reply.get(opts, function(err, answers){
	if (err) {
        console.log('Goodbye.')
    } else {
        console.log("You Chose:")
        console.log(answers);
    }
});
