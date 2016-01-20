var reply = require('./../');

var opts = {
  animal: {
      message: 'What is your favorite animal?',
      options: ['panda','giraffe','koala','elephant','tiger','zebra','other']
  },
  insect: {
      message: 'What is your favorite insect?',
      options: ['fly','bee','spider','mosquito','ladybug','catapillar','moth','dragonfly','other']
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
