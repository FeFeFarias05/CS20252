#!/bin/bash
set -e

echo "Waiting for DynamoDB to be ready..."
sleep 5

DYNAMODB_ENDPOINT="http://dynamodb:8000"

echo "Creating DynamoDB tables..."

# Create Client table
aws dynamodb create-table \
    --table-name Client \
    --attribute-definitions AttributeName=clientId,AttributeType=S \
    --key-schema AttributeName=clientId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url $DYNAMODB_ENDPOINT \
    --region us-east-1 \
    --no-cli-pager \
    2>/dev/null || echo "Table Client already exists"

# Create Owner table
aws dynamodb create-table \
    --table-name Owner \
    --attribute-definitions AttributeName=ownerId,AttributeType=S \
    --key-schema AttributeName=ownerId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url $DYNAMODB_ENDPOINT \
    --region us-east-1 \
    --no-cli-pager \
    2>/dev/null || echo "Table Owner already exists"

# Create Pet table
aws dynamodb create-table \
    --table-name Pet \
    --attribute-definitions AttributeName=petId,AttributeType=S \
    --key-schema AttributeName=petId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url $DYNAMODB_ENDPOINT \
    --region us-east-1 \
    --no-cli-pager \
    2>/dev/null || echo "Table Pet already exists"

# Create Appointment table
aws dynamodb create-table \
    --table-name Appointment \
    --attribute-definitions AttributeName=appointmentId,AttributeType=S \
    --key-schema AttributeName=appointmentId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url $DYNAMODB_ENDPOINT \
    --region us-east-1 \
    --no-cli-pager \
    2>/dev/null || echo "Table Appointment already exists"

echo "Listing tables..."
aws dynamodb list-tables \
    --endpoint-url $DYNAMODB_ENDPOINT \
    --region us-east-1 \
    --no-cli-pager

echo "DynamoDB tables created successfully!"
