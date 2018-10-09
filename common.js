

const privacyFilter = (event, data) => {

  const authorized = typeof(event.requestContext.identity.cognitoAuthenticationType) !== 'undefined' && event.requestContext.identity.cognitoAuthenticationType === 'authenticated';

  let filtered = {};
  filtered.Items = data.Items.filter((item) => {
    console.log(!item.privacy || authorized);
    return !item.privacy || authorized;
  });
  
  return filtered;

};


module.exports = { privacyFilter };
