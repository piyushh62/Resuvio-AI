# API Reference

Complete API documentation for Resuvio-AI backend.

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Resumes](#resumes)
  - [Resume Builder](#resume-builder)
  - [Job Matching](#job-matching)
  - [Cover Letters](#cover-letters)
  - [Tips](#tips)
  - [Activity](#activity)
  - [Credits](#credits)
  - [Payments](#payments)
- [Webhooks](#webhooks)
- [SDK Examples](#sdk-examples)

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3001/api` |
| Staging | `https://api-staging.resuvio.ai/api` |
| Production | `https://resuvio-ai.onrender.com/api` |

## Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```http
Authorization: Bearer <firebase-id-token>
```

### Getting a Token (Frontend)

```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
const token = await user.getIdToken();
// Use token in API calls
```

### Token Verification (Backend)

Tokens are verified using Firebase Admin SDK. The decoded token is attached to `req.user`:

```typescript
req.user = {
  uid: 'user-uid',
  email: 'user@example.com',
  email_verified: true,
  auth_time: 1234567890,
  // ... other claims
};
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 422 | Unprocessable Entity (business logic error) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication token |
| `FORBIDDEN` | Insufficient permissions for resource |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Request body validation failed |
| `QUOTA_EXCEEDED` | Credit limit reached |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| `INVALID_FILE_TYPE` | Unsupported file format |
| `AI_SERVICE_ERROR` | Gemini API error |
| `PAYMENT_FAILED` | Payment processing error |

## Rate Limiting

| Endpoint Category | Limit |
|-------------------|-------|
| Authentication | 10 req/min |
| Resume Upload | 5 req/min |
| AI Analysis | 10 req/min |
| Job Matching | 10 req/min |
| Cover Letter | 10 req/min |
| Resume Builder | 30 req/min |
| Public (tips) | 30 req/min |
| General API | 100 req/min |

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699999999
```

---

## Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "uid": "firebase-uid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false
  },
  "message": "User created. Please verify your email."
}
```

#### POST /api/auth/login
Login is handled client-side via Firebase SDK. This endpoint returns 501.

**Response (501):**
```json
{
  "success": false,
  "error": "Login is handled client-side via Firebase SDK",
  "code": "NOT_IMPLEMENTED"
}
```

---

### Resumes

#### POST /api/resumes/upload
Upload and parse a resume file (PDF or DOCX).

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Body:** Form data with `resume` file field

**Response (201):**
```json
{
  "success": true,
  "data": {
    "resumeId": "resume-abc123",
    "fileName": "john-doe-resume.pdf",
    "fileType": "pdf",
    "fileSize": 245760,
    "extractedText": "JOHN DOE\nSoftware Engineer\n...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400` - No file provided
- `413` - File too large (>5MB)
- `415` - Invalid file type (not PDF/DOCX)
- `422` - Failed to parse file

#### GET /api/resumes
List user's uploaded resumes.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 50) |
| sortBy | string | createdAt | Sort field |
| sortOrder | string | desc | asc/desc |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "resumeId": "resume-abc123",
      "fileName": "john-doe-resume.pdf",
      "fileType": "pdf",
      "fileSize": 245760,
      "createdAt": "2024-01-15T10:30:00Z",
      "hasAnalysis": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### GET /api/resumes/:id
Get resume details including extracted text.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "resumeId": "resume-abc123",
    "fileName": "john-doe-resume.pdf",
    "fileType": "pdf",
    "fileSize": 245760,
    "extractedText": "JOHN DOE\nSoftware Engineer\n...",
    "createdAt": "2024-01-15T10:30:00Z",
    "analysis": {
      "analysisId": "analysis-xyz789",
      "score": 85,
      "feedback": "Strong technical background...",
      "suggestions": ["Add more metrics", "Include keywords"],
      "keywords": ["React", "Node.js", "TypeScript"],
      "createdAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

#### POST /api/resumes/:id/analyze
Analyze resume with AI.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis-xyz789",
    "score": 85,
    "feedback": "Strong technical background with good project diversity...",
    "suggestions": [
      "Quantify achievements with metrics",
      "Add more industry-specific keywords",
      "Include leadership experience"
    ],
    "keywords": ["React", "Node.js", "TypeScript", "AWS", "Docker"],
    "sections": {
      "experience": "Good depth, consider adding impact metrics",
      "education": "Complete",
      "skills": "Well-organized, consider grouping by category",
      "projects": "Impressive variety"
    },
    "creditsUsed": 5,
    "creditsRemaining": 95,
    "createdAt": "2024-01-15T11:00:00Z"
  }
}
```

**Errors:**
- `402` - Insufficient credits
- `404` - Resume not found
- `503` - AI service unavailable

#### DELETE /api/resumes/:id
Delete a resume and its analyses.

**Response (200):**
```json
{
  "success": true,
  "message": "Resume deleted successfully"
}
```

---

### Resume Builder

#### POST /api/builder/workspace
Create or update a resume workspace (draft).

**Request:**
```json
{
  "title": "Senior Software Engineer Resume",
  "template": "modern",
  "data": {
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0123",
      "location": "San Francisco, CA",
      "linkedin": "linkedin.com/in/johndoe",
      "github": "github.com/johndoe",
      "website": "johndoe.dev"
    },
    "summary": "Experienced software engineer...",
    "experience": [
      {
        "id": "exp-1",
        "company": "Tech Corp",
        "position": "Senior Software Engineer",
        "location": "San Francisco, CA",
        "startDate": "2022-01",
        "endDate": "present",
        "current": true,
        "description": "Led team of 5 engineers...",
        "achievements": [
          "Improved API performance by 40%",
          "Mentored 3 junior developers"
        ]
      }
    ],
    "education": [
      {
        "id": "edu-1",
        "institution": "Stanford University",
        "degree": "Master of Science",
        "field": "Computer Science",
        "location": "Stanford, CA",
        "startDate": "2018-09",
        "endDate": "2020-06"
      }
    ],
    "skills": [
      { "category": "Frontend", "items": ["React", "TypeScript", "Next.js"] },
      { "category": "Backend", "items": ["Node.js", "Python", "PostgreSQL"] }
    ],
    "projects": [],
    "certifications": [],
    "languages": []
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace-abc123",
    "title": "Senior Software Engineer Resume",
    "template": "modern",
    "isDraft": true,
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

#### GET /api/builder/workspaces
List user's resume workspaces.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "workspaceId": "workspace-abc123",
      "title": "Senior Software Engineer Resume",
      "template": "modern",
      "isDraft": true,
      "updatedAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

#### GET /api/builder/workspace/:id
Get a specific workspace.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace-abc123",
    "title": "Senior Software Engineer Resume",
    "template": "modern",
    "data": { ... },
    "isDraft": true,
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  }
}
```

#### DELETE /api/builder/workspace/:id
Delete a workspace.

**Response (200):**
```json
{
  "success": true,
  "message": "Workspace deleted"
}
```

#### POST /api/builder/workspace/:id/duplicate
Duplicate a workspace.

**Response (201):**
```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace-def456",
    "title": "Senior Software Engineer Resume (Copy)",
    "template": "modern",
    "isDraft": true,
    "createdAt": "2024-01-15T15:00:00Z"
  }
}
```

#### POST /api/builder/generate
Generate a complete resume from scratch using AI.

**Request:**
```json
{
  "targetRole": "Senior Frontend Engineer",
  "experienceLevel": "senior",
  "skills": ["React", "TypeScript", "Next.js", "GraphQL"],
  "preferences": {
    "template": "modern",
    "tone": "professional"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace-new789",
    "title": "Senior Frontend Engineer Resume",
    "template": "modern",
    "data": { ... },
    "creditsUsed": 5,
    "creditsRemaining": 90
  }
}
```

#### POST /api/builder/assist
Get AI assistance for a specific section.

**Request:**
```json
{
  "section": "experience",
  "context": {
    "currentContent": "Worked on React projects",
    "targetRole": "Senior Frontend Engineer"
  },
  "instruction": "Make this more impactful with metrics"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "suggestion": "Led development of 3 React applications serving 100K+ users, improving load times by 40% through code splitting and lazy loading",
    "creditsUsed": 1,
    "creditsRemaining": 89
  }
}
```

#### POST /api/builder/parse-upload
Parse an uploaded resume and populate builder fields.

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Body:** Form data with `resume` file field

**Response (200):**
```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace-parsed123",
    "title": "Parsed Resume - John Doe",
    "template": "modern",
    "data": { ... },
    "creditsUsed": 2,
    "creditsRemaining": 87
  }
}
```

#### GET /api/builder/download/:id
Download resume as PDF.

**Response:** Binary PDF file with `Content-Type: application/pdf`

**Headers:**
```
Content-Disposition: attachment; filename="resume-john-doe.pdf"
```

#### GET /api/builder/generated
List generated (non-draft) resumes.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "workspaceId": "workspace-final123",
      "title": "Senior Software Engineer Resume",
      "template": "modern",
      "pdfUrl": "https://storage.googleapis.com/.../resume.pdf",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

---

### Job Matching

#### POST /api/match/resume-job
Match a resume against a job description.

**Request:**
```json
{
  "resumeId": "resume-abc123",
  "jobDescription": "We are looking for a Senior Frontend Engineer with 5+ years of React experience...",
  "jobTitle": "Senior Frontend Engineer",
  "company": "Tech Corp"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "matchId": "match-xyz789",
    "matchScore": 78,
    "summary": "Strong match for Senior Frontend Engineer role...",
    "strengths": [
      "5+ years React experience",
      "TypeScript expertise",
      "Performance optimization experience"
    ],
    "gaps": [
      "No GraphQL experience mentioned",
      "Limited team leadership examples"
    ],
    "recommendations": [
      "Add GraphQL projects to resume",
      "Highlight mentoring experience",
      "Include specific performance metrics"
    ],
    "keywordMatch": {
      "matched": ["React", "TypeScript", "JavaScript", "CSS", "REST API"],
      "missing": ["GraphQL", "Next.js", "Team Lead", "Mentoring"]
    },
    "atsScore": 82,
    "creditsUsed": 3,
    "creditsRemaining": 84,
    "createdAt": "2024-01-15T16:00:00Z"
  }
}
```

---

### Cover Letters

#### POST /api/cover-letter/generate
Generate a cover letter for a job application.

**Request:**
```json
{
  "resumeId": "resume-abc123",
  "jobDescription": "We are looking for a Senior Frontend Engineer...",
  "jobTitle": "Senior Frontend Engineer",
  "company": "Tech Corp",
  "hiringManager": "Jane Smith",
  "tone": "professional",
  "length": "medium"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "letterId": "letter-abc123",
    "content": "Dear Jane Smith,\n\nI am writing to express my interest in the Senior Frontend Engineer position at Tech Corp...",
    "jobTitle": "Senior Frontend Engineer",
    "company": "Tech Corp",
    "creditsUsed": 2,
    "creditsRemaining": 82,
    "createdAt": "2024-01-15T16:30:00Z"
  }
}
```

#### GET /api/cover-letter/history
List user's generated cover letters.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "letterId": "letter-abc123",
      "jobTitle": "Senior Frontend Engineer",
      "company": "Tech Corp",
      "createdAt": "2024-01-15T16:30:00Z"
    }
  ]
}
```

---

### Tips

#### GET /api/tips
Get resume writing tips (public endpoint, no auth required).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| category | string | Filter by category (general, formatting, content, ats) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tip-1",
      "title": "Quantify Your Achievements",
      "category": "content",
      "content": "Use numbers and metrics to demonstrate impact...",
      "tags": ["achievements", "metrics", "impact"]
    },
    {
      "id": "tip-2",
      "title": "Optimize for ATS",
      "category": "ats",
      "content": "Include relevant keywords from the job description...",
      "tags": ["ats", "keywords", "optimization"]
    }
  ]
}
```

---

### Activity

#### GET /api/activity/recent
Get user's recent activity.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | number | 20 | Number of activities |
| type | string | - | Filter by type |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "activityId": "act-1",
      "type": "resume_analysis",
      "description": "Analyzed resume 'john-doe-resume.pdf'",
      "metadata": {
        "resumeId": "resume-abc123",
        "score": 85
      },
      "createdAt": "2024-01-15T11:00:00Z"
    },
    {
      "activityId": "act-2",
      "type": "builder_save",
      "description": "Saved resume 'Senior Software Engineer Resume'",
      "metadata": {
        "workspaceId": "workspace-abc123"
      },
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

---

### Credits

#### GET /api/credits/usage
Get current user's credit usage.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "creditsUsed": 18,
    "creditsLimit": 500,
    "creditsRemaining": 482,
    "resetDate": "2024-02-01T00:00:00Z",
    "usageByFeature": {
      "resume_analysis": 10,
      "job_matching": 6,
      "cover_letter": 4,
      "builder_generate": 15,
      "builder_assist": 3,
      "builder_parse": 4
    },
    "history": [
      {
        "amount": -5,
        "type": "usage",
        "description": "Resume analysis",
        "createdAt": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

#### GET /api/credits/limits
Get credit limits for all plans (public).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "free": {
      "monthlyCredits": 10,
      "features": ["resume_analysis", "job_matching", "cover_letter"],
      "limits": {
        "resume_uploads": 5,
        "builder_workspaces": 2
      }
    },
    "pro": {
      "monthlyCredits": 500,
      "features": ["all"],
      "limits": {
        "resume_uploads": -1,
        "builder_workspaces": -1
      }
    },
    "enterprise": {
      "monthlyCredits": -1,
      "features": ["all", "api_access", "priority_support"],
      "limits": {}
    }
  }
}
```

---

### Payments

#### POST /api/payments/create-order
Create a Razorpay order for subscription.

**Request:**
```json
{
  "planId": "pro_monthly",
  "currency": "INR"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "order_abc123",
    "amount": 99900,
    "currency": "INR",
    "keyId": "rzp_test_...",
    "plan": "pro_monthly"
  }
}
```

#### POST /api/payments/verify
Verify payment signature after Razorpay checkout.

**Request:**
```json
{
  "razorpayOrderId": "order_abc123",
  "razorpayPaymentId": "pay_xyz789",
  "razorpaySignature": "signature..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_abc123",
    "plan": "pro_monthly",
    "status": "active",
    "currentPeriodEnd": "2024-02-15T10:30:00Z",
    "creditsAdded": 500
  }
}
```

#### GET /api/payments/status
Get current subscription status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "status": "active",
    "currentPeriodEnd": "2024-02-15T10:30:00Z",
    "cancelAtPeriodEnd": false,
    "paymentMethod": "razorpay"
  }
}
```

---

## Webhooks

### Razorpay Webhook

**Endpoint:** `POST /api/payments/webhook`

**Headers:**
```
X-Razorpay-Signature: <signature>
Content-Type: application/json
```

**Events Handled:**
- `payment.captured` - Activate subscription
- `payment.failed` - Notify user
- `subscription.charged` - Renew credits
- `subscription.cancelled` - Downgrade plan

---

## SDK Examples

### JavaScript/TypeScript (Frontend)

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('firebaseIdToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Resume upload
export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Resume analysis
export const analyzeResume = (resumeId: string) =>
  api.post(`/resumes/${resumeId}/analyze`);

// Job matching
export const matchResumeJob = (data: {
  resumeId: string;
  jobDescription: string;
  jobTitle: string;
  company: string;
}) => api.post('/match/resume-job', data);

// Cover letter
export const generateCoverLetter = (data: {
  resumeId: string;
  jobDescription: string;
  jobTitle: string;
  company: string;
}) => api.post('/cover-letter/generate', data);
```

### Python (Backend Integration)

```python
import requests
import firebase_admin
from firebase_admin import auth

class ResuvioClient:
    def __init__(self, base_url: str, firebase_token: str):
        self.base_url = base_url.rstrip('/') + '/api'
        self.headers = {
            'Authorization': f'Bearer {firebase_token}',
            'Content-Type': 'application/json'
        }
    
    def upload_resume(self, file_path: str):
        with open(file_path, 'rb') as f:
            files = {'resume': f}
            headers = {'Authorization': self.headers['Authorization']}
            return requests.post(
                f'{self.base_url}/resumes/upload',
                files=files,
                headers=headers
            ).json()
    
    def analyze_resume(self, resume_id: str):
        return requests.post(
            f'{self.base_url}/resumes/{resume_id}/analyze',
            headers=self.headers
        ).json()
    
    def match_job(self, resume_id: str, job_description: str, job_title: str, company: str):
        return requests.post(
            f'{self.base_url}/match/resume-job',
            headers=self.headers,
            json={
                'resumeId': resume_id,
                'jobDescription': job_description,
                'jobTitle': job_title,
                'company': company
            }
        ).json()

# Usage
# Get Firebase ID token from your auth flow
firebase_token = "your-firebase-id-token"
client = ResuvioClient("https://resuvio-ai.onrender.com", firebase_token)

result = client.upload_resume("resume.pdf")
analysis = client.analyze_resume(result['data']['resumeId'])
```

### cURL Examples

```bash
# Upload resume
curl -X POST https://resuvio-ai.onrender.com/api/resumes/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@resume.pdf"

# Analyze resume
curl -X POST https://resuvio-ai.onrender.com/api/resumes/RESUME_ID/analyze \
  -H "Authorization: Bearer YOUR_TOKEN"

# Match job
curl -X POST https://resuvio-ai.onrender.com/api/match/resume-job \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resumeId": "RESUME_ID",
    "jobDescription": "Job description here...",
    "jobTitle": "Senior Engineer",
    "company": "Tech Corp"
  }'

# Get credits
curl -X GET https://resuvio-ai.onrender.com/api/credits/usage \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial API release |
| 1.1 | 2024-02-01 | Added builder assist endpoint |
| 1.2 | 2024-03-01 | Added resume parsing endpoint |

---

*For questions about the API, see [SUPPORT.md](../SUPPORT.md) or open a [GitHub Discussion](https://github.com/piyushh62/Resuvio-AI/discussions).*