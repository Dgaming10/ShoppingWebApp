const Twitter = require('twitter');
const client = new Twitter({
  consumer_key: 'consumer_key',
  consumer_secret: 'consumer_secret',
  access_token_key: 'access_token_key',
  access_token_secret: 'access_token_secret'
});

const postOnlineUsers = async (req,res) => {
    
    

  //POST A TWEET
  // Set the status of your tweet
  let currentDate = new Date();

  let date = currentDate.toLocaleDateString('en-IL');
  //let time = currentDate.toLocaleTimeString('en-IL');
  console.log(Object.keys(req.body));
  let upload = date + '\n' + 'There are currently ' + req.body.numOnline + ' users online';
  const tweet = { status: upload};

  // // Post the tweet
  client.post('statuses/update', tweet, function(error, tweet, response) {
    if (!error) {
      res.send('Tweet posted successfully:\n' + JSON.stringify(tweet));
    } else {
      res.status(404).send('Error posting tweet:\n' + error);
    }
  });

    
  //GET A DESCRIPTION
  
  
} 

const postWhenAddingProduct = async (req, res) => {

  let upload = `new products has been added:\n title : ${req.body.title},
   price: ${req.body.price}$`;
  const tweet = { status: upload};

  // // Post the tweet
  client.post('statuses/update', tweet, function(error, tweet, response) {
    if (!error) {
      res.send('Tweet posted successfully:\n' + JSON.stringify(tweet));
    } else {
      res.status(404).send('Error posting tweet:\n' + error);
    }
  });
};

const showSome = async (req, res) => {
  const screenName = 'trvisXX';

  //Retrieve the user object for the specified screen name
  client.get('users/show', { screen_name: screenName }, function(error, user, response) {
  if (!error) {
      res.send(user.description);
  } else {
      res.status(404).send('Error retrieving user object:\n' +  error);
  }
  });
}
module.exports = {
  postOnlineUsers,
  postWhenAddingProduct,
  showSome,
}