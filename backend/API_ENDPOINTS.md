# 📡 API Endpoints - KPN FAST

Quick reference untuk semua REST API endpoints.

**Base URL:** `http://localhost:5000/api`

---

## 🏢 **Company Profiles**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/company` | Get all companies |
| `GET` | `/company/:id` | Get company by ID |
| `POST` | `/company` | Add new company |
| `PUT` | `/company/:id` | Update company |
| `DELETE` | `/company/:id` | Delete company |

**Example:**
```bash
# Get all
GET http://localhost:5000/api/company

# Get by ID
GET http://localhost:5000/api/company/C001

# Add new
POST http://localhost:5000/api/company
Body: {"nama_perusahaan": "PT ABC", "npwp": "12.345.678.9-012.000", ...}

# Update
PUT http://localhost:5000/api/company/C001
Body: {"email": "newemail@abc.com"}

# Delete
DELETE http://localhost:5000/api/company/C001
```

---

## 👥 **Personnel**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/personnel` | Get all personnel |
| `GET` | `/personnel/:id` | Get personnel by ID |
| `POST` | `/personnel` | Add new personnel |
| `PUT` | `/personnel/:id` | Update personnel |
| `DELETE` | `/personnel/:id` | Delete personnel |

**Example:**
```bash
# Get all
GET http://localhost:5000/api/personnel

# Get by ID
GET http://localhost:5000/api/personnel/P001

# Add new
POST http://localhost:5000/api/personnel
Body: {"nama": "Ahmad Hassan", "posisi": "Ahli Transportasi", ...}

# Update
PUT http://localhost:5000/api/personnel/P001
Body: {"telepon": "081234567890"}

# Delete
DELETE http://localhost:5000/api/personnel/P001
```

---

## 📋 **Request/Response Format**

### **Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 2  // for list endpoints
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

---

## 🧪 **Quick Test (PowerShell)**

```powershell
# Get all companies
Invoke-RestMethod http://localhost:5000/api/company

# Add company
$body = @{nama_perusahaan="PT Test"} | ConvertTo-Json
Invoke-RestMethod http://localhost:5000/api/company -Method Post -Body $body -ContentType "application/json"
```

---

**Status:** Phase 1 Complete ✅  
**Next:** Document upload endpoints (Phase 2)
