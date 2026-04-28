# Smart Travel Consultation Platform - API Examples

Complete real-world examples of using the Smart Travel API.

---

## 1. USER REGISTRATION

### Request
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Johnson",
    "email": "sarah.johnson@example.com",
    "password": "SecurePass123!"
  }'
```

### Response (201 Created)
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNzA1MzI0NjAwMDAwIiwiaWF0IjoxNzA1MzI0NjAwLCJleHAiOjE3MDU5Mjk0MDB9.abc123def456...",
  "user": {
    "id": "1705324600000",
    "name": "Sarah Johnson",
    "email": "sarah.johnson@example.com"
  }
}
```

**Save the token for authenticated requests:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 2. USER LOGIN

### Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.johnson@example.com",
    "password": "SecurePass123!"
  }'
```

### Response (200 OK)
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1705324600000",
    "name": "Sarah Johnson",
    "email": "sarah.johnson@example.com"
  }
}
```

---

## 3. GET CURRENT USER

### Request
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response (200 OK)
```json
{
  "user": {
    "id": "1705324600000",
    "name": "Sarah Johnson",
    "email": "sarah.johnson@example.com"
  }
}
```

---

## 4. BROWSE ALL PACKAGES

### Request
```bash
curl "http://localhost:5000/api/packages"
```

### Response (200 OK)
```json
{
  "packages": [
    {
      "id": 1,
      "name": "Paris Romantic Escape",
      "country": "France",
      "city": "Paris",
      "price": 1800,
      "duration": 5,
      "type": "relaxation",
      "highlights": ["Eiffel Tower", "Louvre Museum", "Seine River Cruise", "Café culture"]
    },
    {
      "id": 2,
      "name": "Budget Barcelona Beach",
      "country": "Spain",
      "city": "Barcelona",
      "price": 850,
      "duration": 4,
      "type": "relaxation",
      "highlights": ["La Sagrada Familia", "Beach time", "Tapas bars", "Gothic Quarter"]
    },
    ...100 packages total...
  ],
  "count": 100
}
```

---

## 5. FILTER PACKAGES BY COUNTRY

### Request
```bash
curl "http://localhost:5000/api/packages?country=Japan"
```

### Response (200 OK)
```json
{
  "packages": [
    {
      "id": 4,
      "name": "Tokyo Shopping Paradise",
      "country": "Japan",
      "city": "Tokyo",
      "price": 1600,
      "duration": 5,
      "type": "shopping",
      "highlights": ["Shibuya shopping", "Ginza district", "Akihabara", "Street food"]
    },
    {
      "id": 45,
      "name": "Family Tokyo Fun",
      "country": "Japan",
      "city": "Tokyo",
      "price": 1800,
      "duration": 5,
      "type": "family",
      "highlights": ["Disneyland", "Robot restaurant", "Gaming arcades", "Anime stores"]
    },
    {
      "id": 52,
      "name": "Japan Hiking Adventure",
      "country": "Japan",
      "city": "Takayama",
      "price": 1300,
      "duration": 5,
      "type": "adventure",
      "highlights": ["Mountain hiking", "Onsen hot springs", "Traditional villages", "Scenic trains"]
    },
    {
      "id": 83,
      "name": "Luxury Tokyo Metropolitan",
      "country": "Japan",
      "city": "Tokyo",
      "price": 2800,
      "duration": 5,
      "type": "luxury",
      "highlights": ["Luxury hotels", "Michelin dining", "Private tours", "VIP experiences"]
    }
  ],
  "count": 4
}
```

---

## 6. FILTER BY MULTIPLE CRITERIA

### Request
```bash
curl "http://localhost:5000/api/packages?type=adventure&minPrice=1000&maxPrice=2000"
```

### Response (200 OK)
```json
{
  "packages": [
    {
      "id": 3,
      "name": "Swiss Alps Adventure",
      "country": "Switzerland",
      "city": "Interlaken",
      "price": 2200,
      "duration": 6,
      "type": "adventure",
      "highlights": ["Hiking", "Mountain biking", "Paragliding", "Alpine scenery"]
    },
    {
      "id": 10,
      "name": "Costa Rica Jungle Adventure",
      "country": "Costa Rica",
      "city": "San José",
      "price": 1100,
      "duration": 6,
      "type": "adventure",
      "highlights": ["Rainforest hiking", "Zip-lining", "Waterfall rappelling", "Wildlife spotting"]
    },
    {
      "id": 17,
      "name": "Machu Picchu Expedition",
      "country": "Peru",
      "city": "Cusco",
      "price": 1300,
      "duration": 5,
      "type": "adventure",
      "highlights": ["Machu Picchu hike", "Incan ruins", "Sacred Valley", "Local culture"]
    },
    {
      "id": 21,
      "name": "Safari Adventure Kenya",
      "country": "Kenya",
      "city": "Nairobi",
      "price": 1800,
      "duration": 6,
      "type": "adventure",
      "highlights": ["Safari wildlife viewing", "Masai Mara", "Game drives", "Nature photography"]
    }
  ],
  "count": 4
}
```

---

## 7. GET SINGLE PACKAGE

### Request
```bash
curl "http://localhost:5000/api/packages/7"
```

### Response (200 OK)
```json
{
  "package": {
    "id": 7,
    "name": "Luxury Dubai Escape",
    "country": "United Arab Emirates",
    "city": "Dubai",
    "price": 3500,
    "duration": 5,
    "type": "luxury",
    "highlights": ["Burj Khalifa", "Desert safari", "Luxury spa", "Shopping malls"]
  }
}
```

---

## 8. GET AI RECOMMENDATIONS (Basic)

### Request
```bash
curl -X POST http://localhost:5000/api/consultation/match \
  -H "Content-Type: application/json" \
  -d '{
    "budget": "1500",
    "travelType": "relaxation",
    "duration": "5",
    "travelers": "2"
  }'
```

### Response (200 OK)
```json
{
  "user_questions": [],
  "recommended_package": {
    "id": 1,
    "name": "Paris Romantic Escape",
    "country": "France",
    "city": "Paris",
    "price": 1800,
    "duration": 5,
    "type": "relaxation",
    "highlights": ["Eiffel Tower", "Louvre Museum", "Seine River Cruise", "Café culture"]
  },
  "reason": "Perfect match: Paris Romantic Escape fits your budget of $1500 and relaxation travel style for 5 days.",
  "alternatives": [
    {
      "id": 8,
      "name": "Greek Islands Relaxation",
      "country": "Greece",
      "city": "Santorini",
      "price": 1500,
      "duration": 5,
      "type": "relaxation",
      "highlights": ["Sunset viewing", "Blue domed churches", "Wine tasting", "Beach swimming"]
    },
    {
      "id": 2,
      "name": "Budget Barcelona Beach",
      "country": "Spain",
      "city": "Barcelona",
      "price": 850,
      "duration": 4,
      "type": "relaxation",
      "highlights": ["La Sagrada Familia", "Beach time", "Tapas bars", "Gothic Quarter"]
    }
  ],
  "saved_request_id": "1705324600123",
  "confidence_score": 95
}
```

---

## 9. GET ADVENTURE RECOMMENDATIONS

### Request
```bash
curl -X POST http://localhost:5000/api/consultation/match \
  -H "Content-Type: application/json" \
  -d '{
    "budget": "2000",
    "travelType": "adventure",
    "duration": "6",
    "travelers": "3"
  }'
```

### Response (200 OK)
```json
{
  "user_questions": [],
  "recommended_package": {
    "id": 3,
    "name": "Swiss Alps Adventure",
    "country": "Switzerland",
    "city": "Interlaken",
    "price": 2200,
    "duration": 6,
    "type": "adventure",
    "highlights": ["Hiking", "Mountain biking", "Paragliding", "Alpine scenery"]
  },
  "reason": "Perfect match: Swiss Alps Adventure fits your budget of $2000 and adventure travel style for 6 days.",
  "alternatives": [
    {
      "id": 27,
      "name": "Norway Fjord Adventure",
      "country": "Norway",
      "city": "Bergen",
      "price": 1700,
      "duration": 5,
      "type": "adventure",
      "highlights": ["Fjord cruises", "Mountain hiking", "Waterfall viewing", "Northern lights"]
    },
    {
      "id": 60,
      "name": "Iceland Ring Road",
      "country": "Iceland",
      "city": "Reykjavik",
      "price": 1500,
      "duration": 7,
      "type": "adventure",
      "highlights": ["Coastal drive", "Waterfall hikes", "Black sand beaches", "Glacier tours"]
    }
  ],
  "saved_request_id": "1705324600456",
  "confidence_score": 95
}
```

---

## 10. GET LUXURY RECOMMENDATIONS

### Request
```bash
curl -X POST http://localhost:5000/api/consultation/match \
  -H "Content-Type: application/json" \
  -d '{
    "budget": "4000",
    "travelType": "luxury",
    "duration": "7",
    "travelers": "2"
  }'
```

### Response (200 OK)
```json
{
  "user_questions": [],
  "recommended_package": {
    "id": 57,
    "name": "Luxury Bora Bora Escape",
    "country": "French Polynesia",
    "city": "Bora Bora",
    "price": 4500,
    "duration": 7,
    "type": "luxury",
    "highlights": ["Overwater bungalows", "Lagoon snorkeling", "Spa treatments", "Private islands"]
  },
  "reason": "Perfect match: Luxury Bora Bora Escape fits your budget of $4000 and luxury travel style for 7 days.",
  "alternatives": [
    {
      "id": 13,
      "name": "Luxury Maldives Resort",
      "country": "Maldives",
      "city": "Male",
      "price": 4200,
      "duration": 7,
      "type": "luxury",
      "highlights": ["Overwater bungalows", "Snorkeling", "Spa treatments", "Private beach"]
    },
    {
      "id": 71,
      "name": "Luxury Fiji Island Resort",
      "country": "Fiji",
      "city": "Denarau",
      "price": 3900,
      "duration": 6,
      "type": "luxury",
      "highlights": ["Private resorts", "Diving", "Spa treatments", "Beachfront dining"]
    }
  ],
  "saved_request_id": "1705324600789",
  "confidence_score": 95
}
```

---

## 11. SAVE CONSULTATION (AUTHENTICATED)

### Request
```bash
curl -X POST http://localhost:5000/api/consultation/save \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "budget": "1500",
    "travelType": "relaxation",
    "duration": "5",
    "travelers": "2",
    "packageId": 1
  }'
```

### Response (201 Created)
```json
{
  "message": "Consultation saved successfully",
  "request": {
    "id": "1705324600999",
    "userId": "1705324600000",
    "budget": "1500",
    "travelType": "relaxation",
    "duration": "5",
    "travelers": "2",
    "packageId": 1,
    "timestamp": "2024-01-15T10:30:00.999Z"
  }
}
```

---

## 12. VIEW SAVED REQUESTS (AUTHENTICATED)

### Request
```bash
curl -X GET http://localhost:5000/api/user/requests \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response (200 OK)
```json
{
  "requests": [
    {
      "id": "1705324600999",
      "userId": "1705324600000",
      "budget": "1500",
      "travelType": "relaxation",
      "duration": "5",
      "travelers": "2",
      "packageId": 1,
      "timestamp": "2024-01-15T10:30:00.999Z"
    },
    {
      "id": "1705324700000",
      "userId": "1705324600000",
      "budget": "2000",
      "travelType": "adventure",
      "duration": "6",
      "travelers": "3",
      "packageId": 3,
      "timestamp": "2024-01-15T10:35:00.000Z"
    },
    {
      "id": "1705324800000",
      "userId": "1705324600000",
      "budget": "4000",
      "travelType": "luxury",
      "duration": "7",
      "travelers": "2",
      "packageId": 57,
      "timestamp": "2024-01-15T10:40:00.000Z"
    }
  ]
}
```

---

## 13. HEALTH CHECK

### Request
```bash
curl http://localhost:5000/api/health
```

### Response (200 OK)
```json
{
  "status": "API running",
  "packages": 100,
  "users": 1,
  "timestamp": "2024-01-15T10:45:00.000Z"
}
```

---

## 14. ERROR HANDLING

### Registration with Duplicate Email

#### Request
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "email": "sarah.johnson@example.com",
    "password": "password123"
  }'
```

#### Response (400 Bad Request)
```json
{
  "error": "Email already registered"
}
```

---

### Login with Invalid Credentials

#### Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.johnson@example.com",
    "password": "wrongpassword"
  }'
```

#### Response (401 Unauthorized)
```json
{
  "error": "Invalid credentials"
}
```

---

### Missing Required Field

#### Request
```bash
curl -X POST http://localhost:5000/api/consultation/match \
  -H "Content-Type: application/json" \
  -d '{
    "budget": "1500",
    "travelType": "relaxation"
  }'
```

#### Response (400 Bad Request)
```json
{
  "error": "Missing required fields"
}
```

---

### Missing Authentication Token

#### Request
```bash
curl -X GET http://localhost:5000/api/user/requests
```

#### Response (401 Unauthorized)
```json
{
  "error": "No token provided"
}
```

---

## Complete User Journey Example

### Step 1: Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","email":"alex@example.com","password":"Pass123"}'
# Returns: token + user object
TOKEN="eyJhbGc..."
```

### Step 2: Browse Packages
```bash
curl "http://localhost:5000/api/packages?type=family&maxPrice=2000"
# Returns: List of family packages
```

### Step 3: Get Recommendations
```bash
curl -X POST http://localhost:5000/api/consultation/match \
  -H "Content-Type: application/json" \
  -d '{
    "budget":"1500",
    "travelType":"family",
    "duration":"5",
    "travelers":"4"
  }'
# Returns: Best match + alternatives
```

### Step 4: Save Recommendation
```bash
curl -X POST http://localhost:5000/api/consultation/save \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budget":"1500",
    "travelType":"family",
    "duration":"5",
    "travelers":"4",
    "packageId":15
  }'
# Returns: Confirmation
```

### Step 5: View Saved Requests
```bash
curl http://localhost:5000/api/user/requests \
  -H "Authorization: Bearer $TOKEN"
# Returns: All saved requests
```

---

**That's the complete API workflow!** 🎉

For more details, see DOCUMENTATION.md
