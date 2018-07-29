
/* A function to calculate the first and last breaches for an account */
const getBreachDates = (dates) => {  

  var firstBreach = new Date(Math.min.apply(null,dates));
  var lastDate =  new Date(Math.max.apply(null,dates));

   return {
      firstBreach: formatDate(firstBreach),
      lastBreach: formatDate(lastDate)
    }

}

/* A function to format dates in yyyy-mm-dd */
const formatDate = (date) =>{
  const year = date.getFullYear();
  var month = date.getMonth()+1;
  var day = "0" + date.getDate()

  month = ("0" + month.toString()).substr(-2);
  day = day.substr(-2);

  return year + "-" + month + "-" + day;
}

/* A function to add a delay between requests to adhear to HIBP API Rate Limits */
const  sleeper = (ms) => {
  return function(x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}

/* The main function to execute the request and handle the response */
const searchBreachedaccount = (z, bundle) => {
  const responsePromise = z.request({
    url: 'https://haveibeenpwned.com/api/breachedaccount/' + bundle.inputData.email,
  });
  return responsePromise
    .then(sleeper(1500))
    .then(response => {

      /* Set the response defaults */
      var pawnedStatement = bundle.inputData.email + " has not appeared in any breaches";
      var firstBreach = "";
      var lastBreach = "";
      
      /* Create an array to retun with the results */
      const arr = [];


      if(response.status ===404){
        /* 404 "Not found — the account could not be found and has therefore not been pwned" */
        arr.push({
          pawnedCount: 0,
          pawnedStatement:pawnedStatement,
          firstBreach: firstBreach,
          lastBreach: lastBreach,
          breaches:[]
        })
      }
      else {
        /* Parse the content to a JSON object */
        response = z.JSON.parse(response.content);
        
        /* Breaches found */
        /* Convert the BreachDate to an array and find the first and last breach */
        var dates = response.map(d => new Date(d.BreachDate));
        dates = getBreachDates(dates);
        firstBreach = dates.firstBreach;
        lastBreach = dates.lastBreach;
        
        pawnedStatement = bundle.inputData.email + " has appeared in " + response.length + " breach";

        /* Pluralise the statement for multiple breaches */
        if(response.length > 1 ){
          pawnedStatement += "es";
        }
      
        arr.push({
          pawnedCount: response.length,
          pawnedStatement:pawnedStatement,
          firstBreach: firstBreach,
          lastBreach: lastBreach,
          breaches:response
        })
      
    }
      return arr;
    });

};

module.exports = {
  key: 'breachedaccount',
  noun: 'Breaches',

  display: {
    label: 'Find Breaches by Email Address',
    description: 'Finds all data breaches for an email address on [https://haveibeenpwned.com](https://haveibeenpwned.com).  You can learn more about the data sources [here](https://haveibeenpwned.com/FAQs#DataSource)'
  },

  operation: {
    inputFields: [
      {key: 'email', required: true, helpText: 'Search have i been pwned with this email.'}
    ],
    perform: searchBreachedaccount,

    sample: {
      pawnedCount: 5,
      pawnedStatement:"example@example.com has appeared in 5 breaches",
      firstBreach: "2015-01-01",
      lastBreach: "2018-07-29",
      breaches:[]
    },

    outputFields: [
      {key: 'pawnedCount', label: 'Pawned Count'},
      {key: 'pawnedStatement', label: 'Pawned Statement'},
      {key: 'firstBreach', label: 'First Breach'},
      {key: 'lastBreach', label: 'Last Breach'},
      {key: 'breaches', label: 'Breaches'}
    ]
  }
};
