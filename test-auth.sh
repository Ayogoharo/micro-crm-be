#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}=== Testing Authentication Endpoints ===${NC}\n"

# Test 1: Register a new user
echo -e "${YELLOW}1. Testing POST /auth/register${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}')

echo "Response: $REGISTER_RESPONSE"

if echo "$REGISTER_RESPONSE" | grep -q "user"; then
  echo -e "${GREEN}✓ Registration successful${NC}\n"
else
  echo -e "${RED}✗ Registration failed${NC}\n"
fi

# Test 2: Try to register the same user again (should fail)
echo -e "${YELLOW}2. Testing duplicate registration (should fail)${NC}"
DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}')

echo "Response: $DUPLICATE_RESPONSE"

if echo "$DUPLICATE_RESPONSE" | grep -q "already"; then
  echo -e "${GREEN}✓ Duplicate detection working${NC}\n"
else
  echo -e "${RED}✗ Duplicate detection not working${NC}\n"
fi

# Test 3: Login with correct credentials
echo -e "${YELLOW}3. Testing POST /auth/login (correct credentials)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}')

echo "Response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
  echo -e "${GREEN}✓ Login successful${NC}\n"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\(.*\)"/\1/')
else
  echo -e "${RED}✗ Login failed${NC}\n"
  exit 1
fi

# Test 4: Login with incorrect credentials
echo -e "${YELLOW}4. Testing POST /auth/login (incorrect password)${NC}"
WRONG_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}')

echo "Response: $WRONG_LOGIN"

if echo "$WRONG_LOGIN" | grep -q "Invalid credentials"; then
  echo -e "${GREEN}✓ Invalid credentials detected${NC}\n"
else
  echo -e "${RED}✗ Invalid credentials not detected${NC}\n"
fi

# Test 5: Access protected route without token
echo -e "${YELLOW}5. Testing GET /auth/profile (no token - should fail)${NC}"
NO_TOKEN_RESPONSE=$(curl -s "$BASE_URL/auth/profile")

echo "Response: $NO_TOKEN_RESPONSE"

if echo "$NO_TOKEN_RESPONSE" | grep -q "Unauthorized\|401"; then
  echo -e "${GREEN}✓ Protected route working${NC}\n"
else
  echo -e "${RED}✗ Protected route not working${NC}\n"
fi

# Test 6: Access protected route with valid token
echo -e "${YELLOW}6. Testing GET /auth/profile (with valid token)${NC}"
PROFILE_RESPONSE=$(curl -s "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $PROFILE_RESPONSE"

if echo "$PROFILE_RESPONSE" | grep -q "userId\|email"; then
  echo -e "${GREEN}✓ Token authentication working${NC}\n"
else
  echo -e "${RED}✗ Token authentication failed${NC}\n"
fi

# Test 7: Test validation (invalid email)
echo -e "${YELLOW}7. Testing validation (invalid email format)${NC}"
INVALID_EMAIL=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail","password":"testpass123"}')

echo "Response: $INVALID_EMAIL"

if echo "$INVALID_EMAIL" | grep -q "email"; then
  echo -e "${GREEN}✓ Email validation working${NC}\n"
else
  echo -e "${RED}✗ Email validation not working${NC}\n"
fi

# Test 8: Test validation (short password)
echo -e "${YELLOW}8. Testing validation (password too short)${NC}"
SHORT_PASSWORD=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"short"}')

echo "Response: $SHORT_PASSWORD"

if echo "$SHORT_PASSWORD" | grep -q "password"; then
  echo -e "${GREEN}✓ Password validation working${NC}\n"
else
  echo -e "${RED}✗ Password validation not working${NC}\n"
fi

echo -e "${YELLOW}=== All tests completed ===${NC}"
