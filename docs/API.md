# Trail Training Coach API Reference

## Overview

This document provides a complete reference for all API endpoints in the Trail Training Coach application.

**Base URL**: `https://byptb6339h.coze.site/api`

**Authentication**: Most endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Table of Contents

- [Authentication](#authentication)
  - [Login](#login)
  - [Register](#register)
  - [Forgot Password](#forgot-password)
  - [Reset Password](#reset-password)
- [Members](#members)
  - [Get Members List](#get-members-list)
  - [Create Member](#create-member)
  - [Get Member by ID](#get-member-by-id)
  - [Update Member](#update-member)
  - [Delete Member](#delete-member)
- [Trails](#trails)
  - [Get Trails List](#get-trails-list)
  - [Create Trail](#create-trail)
  - [Get Trail by ID](#get-trail-by-id)
  - [Update Trail](#update-trail)
  - [Delete Trail](#delete-trail)
- [Teams](#teams)
  - [Get Teams List](#get-teams-list)
  - [Create Team](#create-team)
  - [Get Team by ID](#get-team-by-id)
  - [Update Team](#update-team)
  - [Delete Team](#delete-team)
  - [Get My Teams](#get-my-teams)
  - [Apply to Team](#apply-to-team)
  - [Get Team Members](#get-team-members)
  - [Approve Application](#approve-application)
  - [Reject Application](#reject-application)
  - [Leave Team](#leave-team)
  - [Remove Member](#remove-member)
- [Reviews](#reviews)
  - [Get Reviews List](#get-reviews-list)
  - [Create Review](#create-review)
  - [Get Review by ID](#get-review-by-id)
  - [Update Review](#update-review)
  - [Delete Review](#delete-review)
- [Prediction](#prediction)
  - [Predict Performance](#predict-performance)
- [Terrain Types](#terrain-types)
  - [Get Terrain Types](#get-terrain-types)
  - [Create Terrain Type](#create-terrain-type)
  - [Update Terrain Type](#update-terrain-type)
  - [Delete Terrain Type](#delete-terrain-type)
- [Upload](#upload)
  - [Upload Route Map](#upload-route-map)
- [Recognize Route](#recognize-route)
  - [Recognize Route from Image](#recognize-route-from-image)

---

## Authentication

### Login

Authenticate a user and receive an access token.

**Endpoint**: `POST /api/auth/login`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "user@example.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400`: Invalid email or password
- `401`: Account is disabled

---

### Register

Register a new user account.

**Endpoint**: `POST /api/auth/register`

**Authentication**: Not required

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "user@example.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400`: Validation error (username length, email format, password mismatch, etc.)
- `400`: Email or username already exists

---

### Forgot Password

Request a password reset link.

**Endpoint**: `POST /api/auth/forgot-password`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "密码重置链接已生成（演示模式，实际应用中应通过邮件发送）",
  "data": {
    "email": "user@example.com",
    "resetLink": "https://example.com/auth/reset-password?token=..."
  }
}
```

**Note**: In production, the reset link would be sent via email. The response includes the link for demonstration purposes only.

---

### Reset Password

Reset password using a token.

**Endpoint**: `POST /api/auth/reset-password`

**Authentication**: Not required (requires reset token)

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "newpassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "密码重置成功，请使用新密码登录"
}
```

**Error Responses**:
- `400`: Invalid or expired token

---

## Members

### Get Members List

Retrieve a paginated list of members.

**Endpoint**: `GET /api/members`

**Authentication**: Recommended

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|-------|----------|----------|-------------|
| skip | number | No | 0 | Number of items to skip |
| limit | number | No | 100 | Maximum number of items to return (1-1000) |

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "height": 175,
      "weight": 70,
      "gender": "male",
      "restingHeartRate": 60,
      "maxHeartRate": 180,
      "lactateThresholdHeartRate": 165,
      "lactateThresholdPace": "5:00/km",
      "marathonPace": "5:30/km",
      "vo2Max": 50,
      "flatBaselinePace": "5:30/km",
      "terrainPaceFactors": {
        "沙地": 1.1,
        "机耕道": 1.0
      },
      "preferredSupplyTypes": ["能量胶", "盐丸"],
      "crampFrequency": "从来没有",
      "expectedSweatRate": "有一点",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    }
  ]
}
```

---

### Create Member

Create a new member profile.

**Endpoint**: `POST /api/members`

**Authentication**: Required

**Request Body**:
```json
{
  "name": "John Doe",
  "height": 175,
  "weight": 70,
  "gender": "male",
  "restingHeartRate": 60,
  "maxHeartRate": 180,
  "lactateThresholdHeartRate": 165,
  "lactateThresholdPace": "5:00/km",
  "marathonPace": "5:30/km",
  "vo2Max": 50,
  "flatBaselinePace": "5:30/km",
  "terrainPaceFactors": {
    "沙地": 1.1,
    "机耕道": 1.0,
    "山路": 1.0,
    "石铺路": 1.0,
    "台阶": 1.0
  },
  "preferredSupplyTypes": ["能量胶", "盐丸"],
  "crampFrequency": "从来没有",
  "expectedSweatRate": "有一点"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    ...
  }
}
```

---

### Get Member by ID

Retrieve a specific member by ID.

**Endpoint**: `GET /api/members/{id}`

**Authentication**: Recommended

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Member UUID |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    ...
  }
}
```

**Error Responses**:
- `400`: Invalid ID format
- `404`: Member not found

---

### Update Member

Update an existing member.

**Endpoint**: `PUT /api/members/{id}`

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Member UUID |

**Request Body**: Partial member object (all fields optional)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Updated",
    ...
  }
}
```

**Error Responses**:
- `400`: Invalid ID format or validation error
- `404`: Member not found

---

### Delete Member

Delete a member by ID.

**Endpoint**: `DELETE /api/members/{id}`

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Member UUID |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "删除成功"
  }
}
```

**Error Responses**:
- `400`: Invalid ID format
- `404`: Member not found

---

## Trails

### Get Trails List

Retrieve a paginated list of trails.

**Endpoint**: `GET /api/trails`

**Authentication**: Recommended

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|-------|----------|----------|-------------|
| skip | number | No | 0 | Number of items to skip |
| limit | number | No | 100 | Maximum number of items to return |

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Ultra Trail 50K",
      "cpCount": 10,
      "checkpoints": [
        {
          "id": 1,
          "distance": 5.5,
          "elevation": 300,
          "downhillDistance": 50,
          "terrainType": "山路",
          "per100mElevation": 5.45,
          "slopePercent": 5.45,
          "elevationFactor": 1.27
        }
      ],
      "routeMapKey": "route-maps/file.jpg",
      "routeMapUrl": "https://...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    }
  ]
}
```

---

### Create Trail

Create a new trail.

**Endpoint**: `POST /api/trails`

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Ultra Trail 50K",
  "cpCount": 10,
  "checkpoints": [
    {
      "id": 1,
      "distance": 5.5,
      "elevation": 300,
      "downhillDistance": 50,
      "terrainType": "山路"
    }
  ],
  "routeMapKey": "route-maps/file.jpg",
  "routeMapUrl": "https://..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ultra Trail 50K",
    ...
  }
}
```

---

### Get Trail by ID

Retrieve a specific trail by ID.

**Endpoint**: `GET /api/trails/{id}`

**Authentication**: Recommended

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Trail UUID |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ultra Trail 50K",
    ...
  }
}
```

**Error Responses**:
- `400`: Invalid ID format
- `404`: Trail not found

---

### Update Trail

Update an existing trail.

**Endpoint**: `PUT /api/trails/{id}`

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Trail UUID |

**Request Body**: Partial trail object (all fields optional)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Trail Name",
    ...
  }
}
```

**Error Responses**:
- `400`: Invalid ID format or validation error
- `404`: Trail not found

---

### Delete Trail

Delete a trail by ID.

**Endpoint**: `DELETE /api/trails/{id}`

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Trail UUID |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "删除成功"
  }
}
```

**Error Responses**:
- `400`: Invalid ID format
- `404`: Trail not found

---

## Teams

### Get Teams List

Retrieve a paginated list of teams.

**Endpoint**: `GET /api/teams`

**Authentication**: Recommended

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|-------|----------|----------|-------------|
| skip | number | No | 0 | Number of items to skip |
| limit | number | No | 100 | Maximum number of items to return |

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Trail Runners Club",
      "description": "A club for trail running enthusiasts",
      "ownerId": "550e8400-e29b-41d4-a716-446655440001",
      "memberCount": 25,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    }
  ]
}
```

---

### Create Team

Create a new team.

**Endpoint**: `POST /api/teams`

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Trail Runners Club",
  "description": "A club for trail running enthusiasts",
  "ownerId": "550e8400-e29b-41d4-a716-446655440001",
  "isPublic": false
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Trail Runners Club",
    ...
  }
}
```

---

### Get Team by ID

Retrieve a specific team by ID.

**Endpoint**: `GET /api/teams/{id}`

**Authentication**: Recommended

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Team UUID |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Trail Runners Club",
    ...
  }
}
```

**Error Responses**:
- `404`: Team not found
- `500`: Error fetching team details

---

### Update Team

Update an existing team.

**Endpoint**: `PUT /api/teams/{id}`

**Authentication**: Required (requires team owner/admin permissions)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Team UUID |

**Request Body**: Partial team object (all fields optional)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Team Name",
    ...
  }
}
```

**Error Responses**:
- `404`: Team not found
- `500`: Error updating team

---

### Delete Team

Delete a team by ID.

**Endpoint**: `DELETE /api/teams/{id}`

**Authentication**: Required (requires team owner permissions)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Team UUID |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "跑团删除成功"
}
```

**Error Responses**:
- `404`: Team not found
- `500`: Error deleting team

---

### Get My Teams

Retrieve teams associated with the current user.

**Endpoint**: `GET /api/teams/my`

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| userId | string | Yes | User UUID |
| status | string | No | Filter by status (pending, approved, rejected, left) |
| role | string | No | Filter by role (owner, admin, member) |

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "team": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Trail Runners Club"
      },
      "role": "admin",
      "status": "approved",
      "joinedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `400`: Missing userId
- `500`: Error fetching user teams

---

### Apply to Team

Apply to join a team.

**Endpoint**: `POST /api/teams/{id}/members`

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Team UUID |

**Request Body**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "teamId": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "role": "member",
    "status": "pending"
  },
  "message": "申请已提交，请等待审核"
}
```

**Error Responses**:
- `400`: Missing userId
- `500`: Error applying to team

---

### Get Team Members

Retrieve members of a specific team.

**Endpoint**: `GET /api/teams/{id}/members`

**Authentication**: Recommended

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Team UUID |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| status | string | No | Filter by member status |

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "teamId": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440002",
      "role": "admin",
      "status": "approved",
      "joinedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "username": "johndoe",
        "email": "user@example.com"
      }
    }
  ]
}
```

---

### Approve Application

Approve a pending team membership application.

**Endpoint**: `POST /api/teams/{id}/approve`

**Authentication**: Required (requires team owner/admin permissions)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Team UUID |

**Request Body**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "teamId": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "role": "member",
    "status": "approved"
  },
  "message": "申请已通过"
}
```

**Error Responses**:
- `400`: Missing userId
- `404`: Application not found or already processed
- `500`: Error approving application

---

### Reject Application

Reject a pending team membership application.

**Endpoint**: `POST /api/teams/{id}/reject`

**Authentication**: Required (requires team owner/admin permissions)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Team UUID |

**Request Body**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "rejected"
  },
  "message": "申请已拒绝"
}
```

**Error Responses**:
- `400`: Missing userId
- `404`: Application not found or already processed
- `500`: Error rejecting application

---

### Leave Team

Leave a team.

**Endpoint**: `POST /api/teams/{id}/leave`

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Team UUID |

**Request Body**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "已退出跑团"
}
```

**Error Responses**:
- `400`: Missing userId
- `404`: User not a member of the team
- `500`: Error leaving team

---

### Remove Member

Remove a member from a team (admin/owner only).

**Endpoint**: `DELETE /api/teams/{id}/members/{userId}`

**Authentication**: Required (requires team owner/admin permissions)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Team UUID |
| userId | string | Yes | User UUID to remove |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "成员已移除"
}
```

**Error Responses**:
- `404`: Failed to remove member
- `500`: Error removing member

---

## Reviews

### Get Reviews List

Retrieve a paginated list of reviews.

**Endpoint**: `GET /api/reviews`

**Authentication**: Recommended

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|-------|----------|----------|-------------|
| skip | number | No | 0 | Number of items to skip |
| limit | number | No | 100 | Maximum number of items to return |
| memberId | string | No | Filter by member ID |
| trailId | string | No | Filter by trail ID |

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "memberId": "550e8400-e29b-41d4-a716-446655440001",
      "trailId": "550e8400-e29b-41d4-a716-446655440002",
      "trainingDate": "2024-01-15T00:00:00.000Z",
      "predictedTime": "5:30:00",
      "predictedPace": "6:35/km",
      "predictedCheckpoints": [],
      "actualTime": "5:25:30",
      "actualPace": "6:29/km",
      "totalWaterIntake": 1500,
      "totalCaloriesIntake": 600,
      "totalElectrolytesIntake": 1200,
      "notes": "Good performance on downhill sections",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### Create Review

Create a new training review record.

**Endpoint**: `POST /api/reviews`

**Authentication**: Required

**Request Body**:
```json
{
  "memberId": "550e8400-e29b-41d4-a716-446655440001",
  "trailId": "550e8400-e29b-41d4-a716-446655440002",
  "trainingDate": "2024-01-15T00:00:00.000Z",
  "predictedTime": "5:30:00",
  "predictedPace": "6:35/km",
  "predictedCheckpoints": [],
  "predictedHourlyEnergyNeeds": {
    "carbs": 60,
    "water": 500,
    "electrolytes": 400
  },
  "predictedSupplyDosages": {
    "gelsPerHour": 2,
    "saltsPerHour": 1,
    "electrolytePowderPerHour": 1
  },
  "actualTime": "5:25:30",
  "actualPace": "6:29/km",
  "actualCheckpoints": [],
  "totalWaterIntake": 1500,
  "totalCaloriesIntake": 600,
  "totalElectrolytesIntake": 1200,
  "notes": "Good performance"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    ...
  }
}
```

---

### Get Review by ID

Retrieve a specific review by ID.

**Endpoint**: `GET /api/reviews/{id}`

**Authentication**: Recommended

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Review UUID |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    ...
  }
}
```

**Error Responses**:
- `404`: Review not found
- `500`: Error fetching review

---

### Update Review

Update an existing review.

**Endpoint**: `PUT /api/reviews/{id}`

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Review UUID |

**Request Body**: Partial review object (all fields optional)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    ...
  }
}
```

**Error Responses**:
- `404`: Review not found
- `500`: Error updating review

---

### Delete Review

Delete a review by ID.

**Endpoint**: `DELETE /api/reviews/{id}`

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Review UUID |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "删除成功"
}
```

**Error Responses**:
- `404`: Review not found
- `500`: Error deleting review

---

## Prediction

### Predict Performance

Predict race time and supply strategy for a member on a trail.

**Endpoint**: `POST /api/predict`

**Authentication**: Recommended

**Request Body**:
```json
{
  "memberId": "550e8400-e29b-41d4-a716-446655440000",
  "trailId": "550e8400-e29b-41d4-a716-446655440001",
  "expectedSweatRate": "有一点",
  "plannedPace": "6:00",
  "customFlatBaselinePace": "6:00/km",
  "customElevationLossCoefficient": 0.8,
  "gelCarbs": 25,
  "saltElectrolytes": 200,
  "electrolytePowder": 200,
  "electrolytePowderCalories": 100,
  "electrolytePowderWater": 200,
  "checkpointPaces": {
    "1": "6:00",
    "2": "6:30"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "estimatedTime": "5:30:00",
    "estimatedPace": "6:35/km",
    "flatBaselinePace": "6:00/km",
    "elevationLossCoefficient": 0.8,
    "checkpoints": [
      {
        "id": 1,
        "distance": 5.5,
        "elevation": 300,
        "downhillDistance": 50,
        "terrainType": "山路",
        "terrainPaceFactor": 1.0,
        "sectionTime": 35.25,
        "estimatedTime": "0:35:15",
        "supplyStrategy": "补给点",
        "accumulatedDistance": 5.5,
        "sectionSupply": {
          "gels": 1.5,
          "gelCalories": 38,
          "electrolytePowder": 0.5,
          "electrolytePowderCalories": 50,
          "electrolytePowderWater": 100,
          "electrolytePowderElectrolytes": 100
        }
      }
    ],
    "overallSupplyStrategy": ["能量胶", "盐丸"],
    "hourlyEnergyNeeds": {
      "carbs": 60,
      "water": 500,
      "electrolytes": 400
    },
    "supplyDosages": {
      "gelsPerHour": 2.4,
      "saltsPerHour": 2,
      "electrolytePowderPerHour": 2
    },
    "totalEnergyNeeds": {
      "carbs": 330,
      "water": 2750,
      "electrolytes": 2200
    },
    "totalSupplyDosages": {
      "totalGels": 13.2,
      "totalSalts": 11,
      "totalElectrolytePowder": 11,
      "totalWater": 1100
    }
  }
}
```

**Error Responses**:
- `400`: Validation error
- `404`: Member or trail not found

---

## Terrain Types

### Get Terrain Types

Retrieve terrain type configurations.

**Endpoint**: `GET /api/terrain-types`

**Authentication**: Recommended

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|-------|----------|----------|-------------|
| includeInactive | boolean | No | false | Include inactive terrain types |

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "沙地",
      "paceFactor": "1.1",
      "color": "#F59E0B",
      "icon": "sand",
      "isActive": true,
      "sortOrder": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    }
  ]
}
```

---

### Create Terrain Type

Create a new terrain type configuration.

**Endpoint**: `POST /api/terrain-types`

**Authentication**: Required (admin only)

**Request Body**:
```json
{
  "name": "山路",
  "paceFactor": "1.0",
  "color": "#10B981",
  "icon": "mountain",
  "isActive": true,
  "sortOrder": 2
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "山路",
    ...
  }
}
```

**Error Responses**:
- `400`: Validation error (name format, paceFactor format, color format)
- `500`: Error creating terrain type

---

### Update Terrain Type

Update an existing terrain type.

**Endpoint**: `PATCH /api/terrain-types/{id}`

**Authentication**: Required (admin only)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Terrain type UUID |

**Request Body**: Partial terrain type object (all fields optional)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "山路",
    ...
  }
}
```

**Error Responses**:
- `400`: Validation error
- `404`: Terrain type not found
- `500`: Error updating terrain type

---

### Delete Terrain Type

Delete a terrain type.

**Endpoint**: `DELETE /api/terrain-types/{id}`

**Authentication**: Required (admin only)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Terrain type UUID |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "山路",
    ...
  }
}
```

**Error Responses**:
- `404`: Terrain type not found
- `500`: Error deleting terrain type

---

## Upload

### Upload Route Map

Upload a route map image to object storage.

**Endpoint**: `POST /api/upload`

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Route map image (JPG, PNG, WebP, GIF, max 10MB) |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "fileKey": "route-maps/file.jpg",
    "fileName": "route-map-1234567890-abc123.jpg",
    "signedUrl": "https://...",
    "fileType": "image/jpeg",
    "fileSize": 1024000
  }
}
```

**Error Responses**:
- `400`: No file selected
- `400`: Invalid file type
- `400`: File size exceeds 10MB
- `500`: Upload failed

---

## Recognize Route

### Recognize Route from Image

Use AI to recognize trail information from a route map image.

**Endpoint**: `POST /api/recognize-route`

**Authentication**: Required

**Request Body**:
```json
{
  "imageUrl": "https://example.com/route-map.jpg"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "name": "Ultra Trail 50K",
    "cpCount": 10,
    "checkpoints": [
      {
        "id": 1,
        "distance": 5.5,
        "elevation": 300,
        "downhillDistance": 50,
        "terrainType": "山路",
        "per100mElevation": 5.45,
        "slopePercent": 5.45,
        "elevationFactor": 1.27
      }
    ]
  }
}
```

**Error Responses**:
- `400`: Missing imageUrl
- `400`: Cannot recognize route information
- `400`: Invalid recognized data format
- `500`: Recognition failed

---

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE" // Optional
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Request successful |
| 201 | Resource created successfully |
| 400 | Bad request / Validation error |
| 401 | Unauthorized / Invalid token |
| 403 | Forbidden / Insufficient permissions |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Rate Limiting

Currently, there are no explicit rate limits configured. Please be mindful of API usage.

---

## Notes

1. **Authentication**: Many endpoints currently lack proper authentication and authorization checks. This is a known issue that will be addressed.

2. **Validation**: All endpoints use Zod schemas for input validation. Invalid data will result in 400 errors with detailed error messages.

3. **Pagination**: List endpoints support `skip` and `limit` parameters for pagination.

4. **Date Format**: All timestamps use ISO 8601 format (e.g., `2024-01-01T00:00:00.000Z`).

5. **UUID Format**: All ID fields use UUID v4 format.

---

## Changelog

- 2026-02-17: Initial API documentation created
