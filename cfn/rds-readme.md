# RDS MySQL Infrastructure with Private Subnet Orchestration

This project provides a two-tier CloudFormation architecture designed to deploy a secure, private MySQL RDS instance with automated schema initialization.

## Architecture Overview

The infrastructure is split into two distinct layers:

1.  **VPC Baseline Stack:** Establishes the network perimeter, including public/private subnets and a **NAT Gateway** for outbound internet access from private zones. This is needed so lambda function can communicate to Cloudformation.
2.  **RDS Resource Stack:** Deploys the MySQL instance, IAM roles, and the Lambda function that handles database table creation.

## Layer 1: VPC Configuration Details

The VPC stack provides the base layer to ensure the RDS stack functions correctly:

* **Public Subnet:** Hosts the **NAT Gateway** and has a route to the **Internet Gateway (IGW)**.
* **Private Subnets (x2):** Multi-AZ subnets where the RDS and Lambda reside. They have a route to the NAT Gateway.
* **Elastic IP:** A static IP assigned to the NAT Gateway to allow consistent outbound traffic.
* **Cross-Stack Exports:**
    * `VpcId`: Core VPC identifier.
    * `PrivateSubnet1Id` & `PrivateSubnet2Id`: Targets for RDS and Lambda.

## Layer 2: RDS & Schema Initialization

* **Database:** MySQL 8.0 instance on a `db.t3.micro`.
* **Lambda Init:** A Python 3.12 function using `mysql-connector-python`.
* **WaitCondition:** The stack remains in `CREATE_IN_PROGRESS` until the Lambda successfully creates the `VISITOR_LOG` table.

### Why the NAT Gateway is Mandatory
The Lambda function runs inside **Private Subnets**. To finish the deployment, the Lambda must send a "Success" signal to a public AWS CloudFormation URL. The **NAT Gateway** allows this signal to leave the private network.

## Deployment Sequence

1. **Deploy VPC Stack:**
   ```bash
   aws cloudformation deploy --template-file vpc-group-lab-v2.yaml --stack-name lab-vpc
2. **Deploy RDS Stack:**
   aws cloudformation deploy --template-file rds-mysql-multiaz-with-schema-v5-noSecret.yaml --stack-name lab-rds --capabilities CAPABILITY_IAM


## To verify data on RDS Mysql run the following:

mysql -h <your-rds-endpoint> -P 3306 -u <your-username> -p
mysql -h visitor-app-dev-mysql-primary.cgl6g4c6ovrg.us-east-1.rds.amazonaws.com -P 3306 -u dbadmin -p

sA9~^r^I8d5C{o9Jm${51'Ir

USE rdslabdb;

SELECT * FROM VISITOR_LOG;


## Important: Firewall/Security Group Note
AWS CloudShell does not run inside your VPC by default; it runs in a public environment. For this command to work, you must:

Ensure your RDS instance has Public Access set to Yes.

Update your RDS Security Group to allow inbound traffic on port 3306 from the IP address of your CloudShell instance.

To find your CloudShell IP, run this first:
curl ifconfig.io
