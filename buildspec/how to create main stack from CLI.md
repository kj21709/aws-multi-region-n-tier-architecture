# How to create Nested Stack using the AWS CLI

# ========================
# Primary region list
create S3 bucket add app.js, index.html and style.css to it (primary API)
vpc primary
secret manager
rds primary
lambda init
visitor-insert-lambda
API Gateway

create S3 bucket add app.js, index.html and style.css to it (Secondary API)
# DR region list
vpc dr
rds dr
lambda front end
API Gateway

cloudfront.yaml (last)
# =========================


4. Upload the vpc.yaml, rds.yaml, and etc...yaml files to an S3 bucket and retrieve the URLs

aws s3 cp vpc.yaml s3://my-cloudformation-s3-bucket-kjd9797

aws s3api list-objects --bucket my-cloudformation-s3-bucket-kjd9797--query "Contents[].{Key: Key}" --output text | awk '{ print "https://my-cloudformation-s3-bucket-kjd9797.s3.amazonaws.com/" $1 }'

5. Create a file named main.yaml with the following content (replace your-bucket-name with the name of the S3 bucket where you uploaded the templates)

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  VPCStack:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: https://my-cloudformation-s3-bucket-kjd9797.s3.amazonaws.com/vpc.yaml

  Subnet1Stack:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: https://my-cloudformation-s3-bucket-kjd9797.s3.amazonaws.com/subnet1.yaml
      Parameters:
        VpcId: !GetAtt VPCStack.Outputs.VpcId

  Subnet2Stack:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: https://my-cloudformation-s3-bucket-kjd9797.s3.amazonaws.com/subnet2.yaml
      Parameters:
        VpcId: !GetAtt VPCStack.Outputs.VpcId
```

7. Deploy the main stack using the AWS CloudFormation CLI

aws cloudformation create-stack --stack-name NestedStackExample --template-body file://main.yaml --capabilities CAPABILITY_NAMED_IAM

8. The stack can be deleted with the following command

aws cloudformation delete-stack --stack-name NestedStackExample