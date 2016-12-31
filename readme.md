Alexa Twitter Vibe
===================
Simple Alexa skill powered by [AWS Lambda](http://aws.amazon.com/lambda) 

### Trigger

"Alexa, what's my twitter vibe."

### Prerequisites

To run this skill you'll need several things: 
A [Twitter](https://www.twitter.com/) account.
Your Twitter Key.
Your Twitter Secret.
Your Twitter Access Token
Your Twitter Token Secret

You'll need to set the following env variables

TWITTER_KEY=
TWITTER_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_TOKEN_SECRET=

These can either be set via node-lambda or directly in the AWS lambda dashboard.

Deploy the code to AWS Lambda. 
Configure the Alexa skill to use Lambda. 


## Setup
To run this skill you need to deploy the code in lambda, and configure the Alexa skill to use Lambda. 

### AWS Lambda Setup
1. Go to the AWS Console and click on the Lambda.
2. Click on the Create a Lambda Function button.
3. Name the Lambda Function whatever you want.
4. Package the code using [node-lambda](https://www.npmjs.com/package/node-lambda), which you'll need to install (via npm: `npm install -g node-lambda`). 
5. Return to the main Lambda page, and click on "Events Sources" tab and click "Add Event Source".
7. Choose Alexa Skills Kit and click submit.
8. Copy the ARN from the upper right to be used later in the Alexa Skill Setup

### Alexa Skill Setup
1. Go to the [Alexa Console](https://developer.amazon.com/edw/home.html) and click Add a New Skill.
2. Set the skill name and "sport radar" (or whatever) as the invocation name, this is what is used to activate the skill.
3. Select the Lambda ARN for the skill Endpoint and paste the ARN copied from above. Click Next.
4. Copy the Intent Schema from language-assets/intent-schema.json.
5. Add the custom slot types and paste the definitions from language-assets directory.
6. Copy the utterances from the included utterances.txt. Click Next.
7. You are now able to start testing the skill. You should be able to either go to the [Echo webpage](http://echo.amazon.com/#skills) and see your skill enabled or test in [Echoism](https://echosim.io/).



