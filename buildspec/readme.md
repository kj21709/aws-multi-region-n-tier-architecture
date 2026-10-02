Improvement on group project 
use stack on this folder for new article
rds and lambda init stack are two different stack now

## For testing DR fail-over
aws apigatewayv2 update-stage \
  --api-id <PRIMARY_API_ID> \
  --stage-name '$default' \
  --auto-deploy false

## To test API primary region
curl https://7x0a6s2roa.execute-api.us-east-2.amazonaws.com/health

### Kent session
- add shallow Lambda function add return
CI/CD pipeline when updating a webpage it updates region A or B base on the need
- cloud watch alarm trigger event bridge logic flow to move to different region or use Lambda to trigger cloudfront failover
- create log stream in cloudwatch > monitor API gateway > 


Use FIS to fail region to see it is all working
then add cloudwatch alarm if needed
