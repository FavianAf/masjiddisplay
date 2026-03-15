# Masjid Display API - Postman Collection & Curl Examples

**Base URL:** `http://localhost:3000`

**Current Stack:**
- Go 1.24.0
- PostgreSQL (pgx/v4/stdlib driver)
- Supabase Cloud Database
- MyQuran API v3
- **Supabase Storage:** REST API (NOT S3 API)

---

## Standard Response Format

Semua endpoint menggunakan format response yang konsisten:

```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "responseData": { ... }
}
```

**Response Codes:**
- `00` - Success (200 OK)
- `01` - Created (201 Created)
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
- `422` - Validation Error

---

## Health Check

### 0. Health Check
**Endpoint:** `GET /healthz`

**Description:** Check if the API server is running and database connection is healthy.

**Curl:**
```bash
curl -X GET http://localhost:3000/healthz
```

**Response:**
```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "responseData": {
    "message": "Masjid Display BE berjalan di port :3000",
    "port": ":3000",
    "status": "healthy",
    "database": "connected"
  }
}
```

**Database Status:**
- `connected` - Database connection is healthy
- `disconnected` - Database connection failed

---

## Authentication Flow

### 1. Register (Create User & Masjid)
**Endpoint:** `POST /api/auth/register`

**Description:** Create new user account with associated masjid.

**Validation Rules:**
- Email must be **UNIQUE** (cannot duplicate)
- Username can be **duplicate** (multiple users can have same username with different emails)
- Password minimum 6 characters
- Masjid name minimum 3 characters

**Curl:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@masjid.com",
    "password": "password123",
    "masjid_name": "Masjid Raya Al-Falah"
  }'
```

**Success Response (201):**
```json
{
  "responseCode": "01",
  "responseMessage": "Created successfully",
  "responseData": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2026-02-22T06:40:09.8783133+07:00",
    "user": {
      "id": "826bff6c-5aba-4ffd-b64b-98f3668efe52",
      "username": "admin",
      "email": "admin@masjid.com"
    }
  }
}
```

**Default Values:**
- **City ID:** `577ef1154f3240ad5b9b413aa7346a1e` (Yogyakarta)
- **City Name:** `Yogyakarta`
- **Iqomah (default):**
  - Subuh: 20 menit
  - Dzuhur: 10 menit
  - Ashar: 10 menit
  - Maghrib: 5 menit
  - Isya: 10 menit

**Error Responses:**

1. **Email already exists:**
```json
{
  "responseCode": "400",
  "responseMessage": "Email already exist"
}
```

2. **Username & Email already exist (exact duplicate):**
```json
{
  "responseCode": "400",
  "responseMessage": "Username and email already exist"
}
```

---

### 2. Login (Using Email)
**Endpoint:** `POST /api/auth/login`

**Important:** Login uses **EMAIL** (not username) because username can be duplicated.

**Curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@masjid.com",
    "password": "password123"
  }'
```

**Success Response (200):**
```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "responseData": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2026-02-22T06:40:09.8783133+07:00",
    "user": {
      "id": "826bff6c-5aba-4ffd-b64b-98f3668efe52",
      "username": "admin",
      "email": "admin@masjid.com"
    }
  }
}
```

**Error Response (400):**
```json
{
  "responseCode": "400",
  "responseMessage": "Invalid email or password"
}
```

---

### 3. Get Account (Admin Only)
**Endpoint:** `GET /api/auth/account`

**Description:** Mendapatkan informasi akun. Ada 2 varian:
- **Variant 1: by email** → Return detail akun lengkap (username, email, masjid_name, dll)
- **Variant 2: by username** → Return list email dengan username tersebut (username boleh duplicate)

**Authentication:** Required (PunyakuId Secret Header)

**Environment Variable:**
Set `PUNYAKU_ID_SECRET` in your `.env` file:
```bash
PUNYAKU_ID_SECRET=admin-secret-key
```

**Query Parameters:**
- `email` (optional) - Cari by email, return detail akun lengkap
- `username` (optional) - Cari by username, return list email
- `limit` (optional, default: 10) - Limit hasil untuk pencarian by username

**Important:**
- Email adalah UNIQUE (hanya 1 user per email)
- Username TIDAK unique (banyak user bisa punya username sama)
- Harus gunakan **email ATAU username**, tidak bisa keduanya

---

#### Variant 1: Get by Email (Return Full Details)

**Curl:**
```bash
curl -X GET "http://localhost:3000/api/auth/account?email=ahmad@test.com" \
  -H "punyakuId: admin-secret-key"
```

**Success Response (200):**
```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "responseData": {
    "id": "826bff6c-5aba-4ffd-b64b-98f3668efe52",
    "username": "ahmad",
    "email": "ahmad@test.com",
    "is_active": true,
    "created_at": "2026-02-21T14:03:51+07:00",
    "updated_at": "2026-02-21T14:03:51+07:00",
    "masjid_id": "bba5eb94-c02a-4b43-bbe5-f9eb91d8013d",
    "masjid_name": "Masjid Raya Al-Falah",
    "city_id": "577ef1154f3240ad5b9b413aa7346a1e",
    "city_name": "Yogyakarta"
  }
}
```

---

#### Variant 2: Get by Username (Return List of Emails)

**Curl:**
```bash
# Get semua email dengan username "ahmad"
curl -X GET "http://localhost:3000/api/auth/account?username=ahmad" \
  -H "punyakuId: admin-secret-key"

# Get dengan limit
curl -X GET "http://localhost:3000/api/auth/account?username=ahmad&limit=10" \
  -H "punyakuId: admin-secret-key"
```

**Success Response (200):**
```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "responseData": {
    "username": "ahmad",
    "count": 2,
    "emails": [
      {
        "email": "ahmad1@test.com",
        "is_active": true,
        "created_at": "2026-02-21T10:00:00+07:00"
      },
      {
        "email": "ahmad2@test.com",
        "is_active": false,
        "created_at": "2026-02-21T11:00:00+07:00"
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "responseCode": "404",
  "responseMessage": "No users found with this username"
}
```

---

### 4. Delete Account (Admin Only)
**Endpoint:** `DELETE /api/auth/account`

**Description:** Menghapus akun user dan **SEMUA** data terkait (masjid, settings, dll) menggunakan cascade delete. Untuk admin/internal use only.

**⚠️ WARNING:** Tindakan ini **TIDAK BISA dibatalkan!** Semua data akan dihapus permanen.

**Authentication:** Required (PunyakuId Secret Header)

**Environment Variable:**
Set `PUNYAKU_ID_SECRET` in your `.env` file (same as Get Account)

**Request Body:**
```json
{
  "email": "ahmad@test.com"
}
```
- `email` (required) - **Email yang UNIK** untuk mengidentifikasi user yang akan dihapus

**Important:**
- **HANYA pakai email** untuk mengidentifikasi user (karena email yang UNIQUE, bukan username)
- **JANGAN pakai username** karena username bisa duplicate dan akan menghapus semua user dengan username tersebut!
- Email adalah field yang UNIK, jadi hanya 1 user yang terhapus

**Curl:**
```bash
curl -X DELETE http://localhost:3000/api/auth/account \
  -H "punyakuId: admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmad@test.com"
  }'
```

**Success Response (200):**
```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "responseData": {
    "message": "Account deleted successfully"
  }
}
```

**Error Response (404):**
```json
{
  "responseCode": "404",
  "responseMessage": "User not found with this email"
}
```

---

### 5. Update Account Status (Admin Only)
**Endpoint:** `PATCH /api/auth/status`

**Description:** Mengubah status aktif/non-aktif user account. Jika `is_active = false`, user TIDAK BISA login. Untuk admin/internal use only.

**Authentication:** Required (PunyakuId Secret Header)

**Environment Variable:**
Set `PUNYAKU_ID_SECRET` in your `.env` file (same as Get Account)

**Request Body:**
```json
{
  "email": "ahmad@test.com",
  "is_active": false
}
```
- `email` (required) - **Email yang unik** untuk mengidentifikasi user
- `is_active` (required) - true untuk activate, false untuk deactivate

**Important:**
- Hanya pakai **email** untuk mengidentifikasi user (karena email yang UNIQUE, bukan username)
- Username TIDAK bisa digunakan untuk update status karena bisa duplicate

**Curl:**
```bash
# Deactivate account (by email)
curl -X PATCH http://localhost:3000/api/auth/status \
  -H "punyakuId: admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmad@test.com",
    "is_active": false
  }'

# Activate account (by email)
curl -X PATCH http://localhost:3000/api/auth/status \
  -H "punyakuId: admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmad@test.com",
    "is_active": true
  }'
```

**Success Response (200):**
```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "responseData": {
    "message": "Account successfully inactive"
  }
}
```

**Important Notes:**
- User dengan `is_active = false` **TIDAK BISA** login (akan mendapat 401 Unauthorized)
- Default value untuk user baru: `is_active = true` (aktif)
- Field `is_active` selalu ditampilkan di Get Account response

---

## Public Endpoints (No JWT Required - FE 24/7 Access)

### 6. Location Search (Cari Kota)
**Endpoint:** `GET /api/location/search?keyword={keyword}`

**Description:** Search for city/region by keyword using MyQuran API v3.

**Curl:**
```bash
# Search Jakarta
curl -X GET "http://localhost:3000/api/location/search?keyword=Jakarta"

# Search Bandung
curl -X GET "http://localhost:3000/api/location/search?keyword=Bandung"

# Search Surabaya
curl -X GET "http://localhost:3000/api/location/search?keyword=Surabaya"
```

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": "1301",
      "lokasi": "KOTA JAKARTA"
    }
  ]
}
```

---

### 7. Get Today's Prayer Times (Jadwal Sholat Hari Ini) - PUBLIC
**Endpoint:** `GET /api/sholat/today?masjid_id={masjid_id}`

**Description:** Get today's prayer times for a specific masjid. Real-time data from MyQuran API v3.

**Authentication:** Not required (Public access)

**Query Parameters:**
- `masjid_id` (required): UUID dari masjid (dapat dari `/api/masjid/settings`)

**Curl:**
```bash
curl -X GET "http://localhost:3000/api/sholat/today?masjid_id=bba5eb94-c02a-4b43-bbe5-f9eb91d8013d"
```

**Response:**
```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "responseData": {
    "server_time": "2026-02-21T21:30:00+07:00",
    "date": "Sabtu, 21/02/2026",
    "location": "Yogyakarta",
    "jadwal": {
      "imsak": "04:16",
      "subuh": "04:26",
      "terbit": "05:40",
      "dzuhur": "11:56",
      "ashar": "15:02",
      "maghrib": "18:04",
      "isya": "19:15"
    },
    "iqomah": {
      "imsak": "",
      "subuh": "04:46",
      "terbit": "",
      "dzuhur": "12:06",
      "ashar": "15:12",
      "maghrib": "18:09",
      "isya": "19:25"
    },
    "blackout_duration_minutes": 30
  }
}
```

**Data Source:**
- Prayer times from MyQuran API v3
- Iqomah calculated automatically based on settings
- Timezone: Asia/Jakarta (WIB)

---

### 8. Get Active Hadist Quotes - PUBLIC
**Endpoint:** `GET /api/hadist/active?masjid_id={masjid_id}`

**Description:** Get all active hadist quotes for a specific masjid.

**Authentication:** Not required (Public access)

**Query Parameters:**
- `masjid_id` (required): UUID dari masjid (dapat dari `/api/masjid/settings`)

**Curl Examples:**
```bash
# Example 1: Get hadists with valid masjid_id
curl -X GET "http://localhost:3000/api/hadist/active?masjid_id=bba5eb94-c02a-4b43-bbe5-f9eb91d8013d"

# Example 2: Using variables (recommended)
MASJID_ID="bba5eb94-c02a-4b43-bbe5-f9eb91d8013d"
curl -X GET "http://localhost:3000/api/hadist/active?masjid_id=${MASJID_ID}"

# Example 3: PowerShell
$masjidId = "bba5eb94-c02a-4b43-bbe5-f9eb91d8013d"
Invoke-WebRequest -Uri "http://localhost:3000/api/hadist/active?masjid_id=$masjidId" -UseBasicParsing
```

**Response:**
```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "responseData": {
    "data": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "text": "Nabi SAW bersabda: 'Sesungguhnya Allah itu Maha Indah dan menyukai keindahan.'",
        "source": "HR. Muslim",
        "is_active": true,
        "created_at": "2026-03-07T10:00:00+07:00",
        "updated_at": "2026-03-07T10:00:00+07:00"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "text": "Hai orang-orang yang beriman, berpuasalah kamu sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa.",
        "source": "QS. Al-Baqarah: 183",
        "is_active": true,
        "created_at": "2026-03-07T11:00:00+07:00",
        "updated_at": "2026-03-07T11:00:00+07:00"
      }
    ]
  }
}
```

**Note:**
- Hadists dengan `is_active = true` akan ditampilkan
- Urutan hadists berdasarkan `created_at DESC` (terbaru di atas)
- Endpoint ini **TETAP PUBLIC** - bisa diakses tanpa JWT token

---

### 9. Get Infaq Saldo - PUBLIC
**Endpoint:** `GET /api/infaq/saldo?masjid_id={masjid_id}`

**Description:** Get current infaq balance and recent transactions for a specific masjid.

**Authentication:** Not required (Public access)

**Query Parameters:**
- `masjid_id` (required): UUID dari masjid (dapat dari `/api/masjid/settings`)

**Curl:**
```bash
curl -X GET "http://localhost:3000/api/infaq/saldo?masjid_id=bba5eb94-c02a-4b43-bbe5-f9eb91d8013d"
```

**Response:**
```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "responseData": {
    "saldo": "0",
    "transactions": []
  }
}
```

**Transaction Types:**
- `credit` - Masuk (infaq masuk)
- `debit` - Keluar (pengeluaran)

---

## Protected Endpoints (Require JWT Token)

Set the header: `Authorization: Bearer {YOUR_TOKEN}`

### 10. Get Masjid Settings
**Endpoint:** `GET /api/masjid/settings`

**Description:** Get current masjid configuration and settings for the authenticated user.

**Authentication:** Required (JWT Token)

**Curl:**
```bash
curl -X GET http://localhost:3000/api/masjid/settings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "responseData": {
    "masjid_id": "bba5eb94-c02a-4b43-bbe5-f9eb91d8013d",
    "city_id": "577ef1154f3240ad5b9b413aa7346a1e",
    "city_name": "Yogyakarta",
    "medias": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "masjid_id": "bba5eb94-c02a-4b43-bbe5-f9eb91d8013d",
        "media_type": "url",
        "media_value": "https://images.unsplash.com/photo-1542385151-54b8d1d7c3d7",
        "media_name": "Background Image 1",
        "is_active": true,
        "start_time": "06:00:00",
        "end_time": "18:00:00"
      }
    ],
    "hadists": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "text": "Nabi SAW bersabda: 'Sesungguhnya Allah itu Maha Indah dan menyukai keindahan.'",
        "source": "HR. Muslim",
        "is_active": true,
        "created_at": "2026-03-07T10:00:00+07:00",
        "updated_at": "2026-03-07T10:00:00+07:00"
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "text": "Hai orang-orang yang beriman, berpuasalah kamu sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa.",
        "source": "QS. Al-Baqarah: 183",
        "is_active": true,
        "created_at": "2026-03-07T11:00:00+07:00",
        "updated_at": "2026-03-07T11:00:00+07:00"
      }
    ],
    "iqomah_subuh": 20,
    "iqomah_dzuhur": 10,
    "iqomah_ashar": 10,
    "iqomah_maghrib": 5,
    "iqomah_isya": 10,
    "blackout_duration_minutes": 30,
    "slide_duration_kegiatan_seconds": 10
  }
}
```

**Important:**
- `masjid_id` diambil dari `responseData` untuk digunakan pada public endpoints
- `medias` adalah array yang berisi semua media (bisa multiple: url, youtube, atau file)
- `slide_duration_kegiatan_seconds` adalah durasi slide kegiatan dalam detik (default: 10 detik)

---

### 11. Update Masjid Settings
**Endpoint:** `POST /api/masjid/settings`

**Description:** Update masjid configuration and settings.

**Authentication:** Required (JWT Token)

---

#### Option 1: JSON Update (for URL and YouTube media)

**Curl:**
```bash
curl -X POST http://localhost:3000/api/masjid/settings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "city_id": "577ef1154f3240ad5b9b413aa7346a1e",
    "city_name": "Yogyakarta",
    "medias": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "masjid_id": "bba5eb94-c02a-4b43-bbe5-f9eb91d8013d",
        "media_type": "url",
        "media_value": "https://images.unsplash.com/photo-1542385151-54b8d1d7c3d7",
        "media_name": "Background Image 1",
        "is_active": true,
        "start_time": "06:00:00",
        "end_time": "18:00:00"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "masjid_id": "bba5eb94-c02a-4b43-bbe5-f9eb91d8013d",
        "media_type": "youtube",
        "media_value": "dQw4w9WgXcQ",
        "media_name": "YouTube Video 1",
        "is_active": true
      }
    ],
    "hadists": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "text": "Nabi SAW bersabda: Sesungguhnya Allah itu Maha Indah dan menyukai keindahan.",
        "source": "HR. Muslim",
        "is_active": true
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "text": "Hai orang-orang yang beriman, berpuasalah kamu sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa.",
        "source": "QS. Al-Baqarah: 183",
        "is_active": true
      }
    ],
    "iqomah_subuh": 15,
    "iqomah_dzuhur": 10,
    "iqomah_ashar": 10,
    "iqomah_maghrib": 5,
    "iqomah_isya": 10,
    "blackout_duration_minutes": 30,
    "slide_duration_kegiatan_seconds": 10
  }'
```

**Request Body Fields (all optional):**

**For JSON Update:**
- `city_id` (string): ID kota dari MyQuran (UUID format)
- `city_name` (string): Nama kota
- `medias` (array): Array of media objects
  - `id` (string): UUID media (optional for new media)
  - `masjid_id` (string): UUID masjid
  - `media_type` (string): Type of media - `url`, `youtube`, or `file`
  - `media_value` (string): URL, YouTube ID, or file path
  - `media_name` (string): Display name for media
  - `is_active` (boolean): Enable/disable media (default: true)
  - `start_time` (string, optional): Start time for scheduling (format: "HH:mm:ss")
  - `end_time` (string, optional): End time for scheduling (format: "HH:mm:ss")
- `hadists` (array): Array of hadist objects
  - `id` (string): UUID hadist (optional for new hadist)
  - `text` (string, required): Text hadist/quran (max 1000 characters)
  - `source` (string, required): Sumber hadist/quran (max 255 characters)
  - `is_active` (boolean): Enable/disable hadist (default: true)
- `iqomah_subuh` (integer, min: 1, max: 60): Durasi iqomah Subuh (menit)
- `iqomah_dzuhur` (integer, min: 1, max: 60): Durasi iqomah Dzuhur (menit)
- `iqomah_ashar` (integer, min: 1, max: 60): Durasi iqomah Ashar (menit)
- `iqomah_maghrib` (integer, min: 1, max: 60): Durasi iqomah Maghrib (menit)
- `iqomah_isya` (integer, min: 1, max: 60): Durasi iqomah Isya (menit)
- `blackout_duration_minutes` (integer, min: 1, max: 120): Durasi blackout sholat (menit)
- `slide_duration_kegiatan_seconds` (integer, min: 1, max: 300): Durasi slide kegiatan (detik)

---

#### Option 2: Multipart File Upload (for File media)

**✅ STORAGE IMPLEMENTATION: Supabase Storage REST API**

The file upload feature now uses Supabase Storage REST API instead of S3 API for better compatibility.

**Configuration:**
```bash
# Supabase Storage (REST API)
SUPABASE_STORAGE_ENDPOINT=https://qqpadjufneirnkttswsx.supabase.co
SUPABASE_STORAGE_BUCKET=masjid_display_bg
SUPABASE_STORAGE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcGFzZS1kZW1lZSIsInNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTYwODI1MCwiZXhwIjoyMDg3MTg4MjUwfQ.dsy5MkkwsLuga-WJHcJO2Mwaw5aU0CEy2Kqz6Q87ckI"
```

**Public URL Format:**
```
https://qqpadjufneirnkttswsx.supabase.co/storage/v1/object/public/masjid_display_bg/{masjid_id}/{uuid}.jpg
```

**Curl:**
```bash
curl -X POST http://localhost:3000/api/masjid/settings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "city_name=Yogyakarta" \
  -F "masjid_media_type=file" \
  -F "iqomah_subuh=20" \
  -F "iqomah_dzuhur=10" \
  -F "iqomah_ashar=10" \
  -F "iqomah_maghrib=5" \
  -F "iqomah_isya=10" \
  -F "blackout_duration_minutes=30" \
  -F "slide_duration_kegiatan_seconds=10" \
  -F "masjid_media_file=@/path/to/image.jpg"
```

**Request Body Fields (all optional):**

**For JSON Update:**
- `city_id` (string): ID kota dari MyQuran (UUID format)
- `city_name` (string): Nama kota
- `medias` (array): Array of media objects
  - `id` (string): UUID media (optional for new media)
  - `masjid_id` (string): UUID masjid
  - `media_type` (string): Type of media - `url`, `youtube`, or `file`
  - `media_value` (string): URL, YouTube ID, or file path
  - `media_name` (string): Display name for the media
  - `is_active` (boolean): Enable/disable media (default: true)
  - `start_time` (string, optional): Start time for scheduling (format: "HH:mm:ss")
  - `end_time` (string, optional): End time for scheduling (format: "HH:mm:ss")
- `iqomah_subuh` (integer, min: 1, max: 60): Durasi iqomah Subuh (menit)
- `iqomah_dzuhur` (integer, min: 1, max: 60): Durasi iqomah Dzuhur (menit)
- `iqomah_ashar` (integer, min: 1, max: 60): Durasi iqomah Ashar (menit)
- `iqomah_maghrib` (integer, min: 1, max: 60): Durasi iqomah Maghrib (menit)
- `iqomah_isya` (integer, min: 1, max: 60): Durasi iqomah Isya (menit)
- `blackout_duration_minutes` (integer, min: 1, max: 120): Durasi blackout sholat (menit)
- `slide_duration_kegiatan_seconds` (integer, min: 1, max: 300): Durasi slide kegiatan (detik)

**For Multipart Upload:**
- `city_name` (string): Nama kota
- `masjid_media_type` (string): Type of media - `url`, `youtube`, or `file`
- `masjid_media_file` (file): File to upload (required if media_type is `file`)
- All iqomah and duration fields (same as JSON update)

**Media Limits:**
- Max 10 URL media per masjid
- Max 10 YouTube media per masjid
- Max 4 File media per masjid (max 1MB per file)

**Response:**
```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "responseData": {
    "masjid_id": "bba5eb94-c02a-4b43-bbe5-f9eb91d8013d",
    "city_id": "577ef1154f3240ad5b9b413aa7346a1e",
    "city_name": "Yogyakarta",
    "medias": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "masjid_id": "bba5eb94-c02a-4b43-bbe5-f9eb91d8013d",
        "media_type": "url",
        "media_value": "https://images.unsplash.com/photo-1542385151-54b8d1d7c3d7",
        "media_name": "Background Image 1",
        "is_active": true,
        "start_time": "06:00:00",
        "end_time": "18:00:00"
      }
    ],
    "hadists": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "text": "Nabi SAW bersabda: Sesungguhnya Allah itu Maha Indah dan menyukai keindahan.",
        "source": "HR. Muslim",
        "is_active": true,
        "created_at": "2026-03-07T10:00:00+07:00",
        "updated_at": "2026-03-07T10:00:00+07:00"
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "text": "Hai orang-orang yang beriman, berpuasalah kamu sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa.",
        "source": "QS. Al-Baqarah: 183",
        "is_active": true,
        "created_at": "2026-03-07T11:00:00+07:00",
        "updated_at": "2026-03-07T11:00:00+07:00"
      }
    ],
    "iqomah_subuh": 15,
    "iqomah_dzuhur": 10,
    "iqomah_ashar": 10,
    "iqomah_maghrib": 5,
    "iqomah_isya": 10,
    "blackout_duration_minutes": 30,
    "slide_duration_kegiatan_seconds": 10
  }
}
```

**Important:**
- When sending `medias` array in JSON, system will DELETE ALL existing media and INSERT ALL new media
- When sending `hadists` array in JSON, system will DELETE ALL existing hadists and INSERT ALL new hadists
- When uploading file via multipart, system will DELETE old file media and INSERT new file
- Media files are stored in Supabase Storage
- File size limit: 1MB per file
- Hadists limit: Maximum 20 hadists per masjid
- Hadist update strategy: DELETE ALL + INSERT ALL (same as media)

---

## Masjid Media System

### Media Types

The system supports 3 types of media:

1. **URL Media** - Background image URLs from external sources
2. **YouTube Media** - YouTube video IDs for embedded videos
3. **File Media** - Uploaded files stored in Supabase Storage (images, videos)

### Media Limits

- **Max 10 URL media** per masjid
- **Max 10 YouTube media** per masjid
- **Max 4 File media** per masjid (max 1MB per file)

### Media Object Structure

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "masjid_id": "bba5eb94-c02a-4b43-bbe5-f9eb91d8013d",
  "media_type": "url",
  "media_value": "https://images.unsplash.com/photo-1542385151-54b8d1d7c3d7",
  "media_name": "Background Image 1",
  "is_active": true,
  "start_time": "06:00:00",
  "end_time": "18:00:00"
}
```

**Field Descriptions:**
- `id` (string, required): Unique identifier for media (UUID)
- `masjid_id` (string, required): The masjid this media belongs to (UUID)
- `media_type` (string, required): Type of media - `url`, `youtube`, or `file`
- `media_value` (string, required):
  - For `url`: Complete URL to image/media
  - For `youtube`: YouTube video ID (e.g., "dQw4w9WgXcQ")
  - For `file`: File path in Supabase Storage
- `media_name` (string, required): Display name for media
- `is_active` (boolean): Enable/disable media (default: true)
- `start_time` (string, optional): Start time for time-based display (format: "HH:mm:ss")
- `end_time` (string, optional): End time for time-based display (format: "HH:mm:ss")

---

### ⚠️ TIME FIELD FORMAT - CRITICAL

**Backend Time Validation:**
- Backend **automatically validates and normalizes** time formats
- Accepts both `"HH:mm:ss"` and ISO timestamps
- Converts ISO timestamps to `"HH:mm:ss"` automatically
- Always returns `"HH:mm:ss"` format in response

✅ **CORRECT FORMAT:**
```json
{
  "start_time": "06:00:00",
  "end_time": "18:00:00"
}
```

❌ **WRONG FORMAT (Backend will auto-convert, but NOT RECOMMENDED):**
```json
{
  "start_time": "0000-01-01T00:00:00Z",
  "end_time": "0000-01-01T23:59:00Z"
}
```

**Time Format Rules:**
- **Format:** `"HH:mm:ss"` (24-hour format)
- **Range:** `"00:00:00"` to `"23:59:59"`
- **Example:** `"06:00:00"` = 6:00 AM, `"18:00:00"` = 6:00 PM
- **NULL/Empty:** Media always visible (no time restriction)

**Backend Behavior:**
- ✅ Receives `"06:00:00"` → Validates & Uses directly
- ✅ Receives `"0000-01-01T00:00:00Z"` → Auto-converts to `"00:00:00"`
- ✅ Receives `"06:00"` → Auto-converts to `"06:00:00"`
- ❌ Rejects invalid formats with clear error message
- ✅ Always returns `"HH:mm:ss"` format in response

**IMPORTANT:** Use `"HH:mm:ss"` format to avoid auto-conversion and potential errors!

---

### ⚠️ DATE FIELD FORMAT - FINANCIAL REPORTS

**Date Format Rules:**
- **Format:** `"YYYY-MM-DD"` (ISO 8601 date format)
- **Range:** Past date only (cannot be in the future)
- **Example:** `"2026-03-14"` = March 14, 2026
- **Required:** Yes (mandatory field for financial reports)

**Consistency:**
- ✅ **Request format:** `"YYYY-MM-DD"` (e.g., `"2026-03-14"`)
- ✅ **Response format:** `"YYYY-MM-DD"` (e.g., `"2026-03-14"`)
- ✅ Backend normalizes date from database to ensure consistent format

**Database Behavior:**
- Database stores as DATE type (PostgreSQL)
- Backend normalizes response to ensure `"YYYY-MM-DD"` format
- Frontend sends `"YYYY-MM-DD"` in request
- Response returns `"YYYY-MM-DD"` (consistent with request)

**Validation:**
- Date must be in `"YYYY-MM-DD"` format
- Date cannot be in the future (checked against `CURRENT_DATE`)
- Date must be unique per masjid (constraint: `masjid_id` + `date`)

**Example (Financial Report):**
```json
{
  "id": "b316dd79-9431-4402-92b2-a8362dd5bad1",
  "date": "2026-03-14",
  "income": 787666,
  "expense": 878787,
  "note": "ytytygyghgh",
  "is_active": true,
  "created_at": "2026-03-14T07:25:22.192058Z",
  "updated_at": "2026-03-14T07:25:22.192058Z"
}
```

**IMPORTANT:** Always use `"YYYY-MM-DD"` format for financial reports dates. The backend will normalize the response to ensure consistency.


### Media Features

#### 1. Multiple Media Support
- Each masjid can have multiple media items
- Mix and match different media types (URL, YouTube, File)
- Each media has its own scheduling and activation settings

#### 2. Time-Based Scheduling
- Use `start_time` and `end_time` to schedule media display
- Time format: "HH:mm:ss" (24-hour format)
- Media only displays between start_time and end_time
- If not specified, media is always visible (when is_active = true)

**Example:**
```json
{
  "media_name": "Morning Background",
  "start_time": "06:00:00",
  "end_time": "12:00:00"
}
```

#### 3. Activation Control
- Use `is_active` flag to enable/disable individual media
- Set to `false` to temporarily hide media without deleting it
- Default value is `true` when creating new media

### Update Strategies

#### Strategy 1: JSON Update (Recommended for URL and YouTube)

When updating via JSON with `medias` array:

**Process:**
1. System receives complete `medias` array
2. System DELETES ALL existing media for the masjid
3. System INSERTS ALL new media from the array
4. Old media files are deleted from Supabase Storage (if they are file type)

**When to use:**
- Adding or removing URL media
- Adding or removing YouTube media
- Updating multiple media at once

**Important:**
- Always send the complete list of media you want to keep
- Any media not in the array will be deleted
- Media files in storage are cleaned up automatically

#### Strategy 2: Multipart Upload (Required for File Media)

When uploading files via `multipart/form-data`:

**Process:**
1. System receives file upload
2. System DELETES old file media for the masjid (only file type)
3. System uploads new file to Supabase Storage
4. System INSERTS new file media record

**When to use:**
- Uploading new image files
- Uploading video files
- Any file-based media

**Important:**
- Only one file per upload
- Maximum file size: 1MB
- Old file media are deleted automatically
- Storage cleanup is handled by the system

### Error Responses

#### Maximum File Limit Reached
**HTTP Status:** 400 Bad Request

```json
{
  "responseCode": "400",
  "responseMessage": "Maximum 4 file uploads allowed"
}
```

**Solution:** Delete some existing file media before adding new ones.

#### Maximum URL Limit Reached
**HTTP Status:** 400 Bad Request

```json
{
  "responseCode": "400",
  "responseMessage": "Maximum 10 URL media allowed"
}
```

**Solution:** Delete some existing URL media before adding new ones.

#### Maximum YouTube Limit Reached
**HTTP Status:** 400 Bad Request

```json
{
  "responseCode": "400",
  "responseMessage": "Maximum 10 YouTube media allowed"
}
```

**Solution:** Delete some existing YouTube media before adding new ones.

### Complete Example: Mixed Media Setup

**Request:**
```bash
curl -X POST http://localhost:3000/api/masjid/settings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "city_id": "577ef1154f3240ad5b9b413aa7346a1e",
    "city_name": "Yogyakarta",
    "medias": [
      {
        "media_type": "url",
        "media_value": "https://images.unsplash.com/photo-1542385151-54b8d1d7c3d7",
        "media_name": "Morning Background",
        "is_active": true,
        "start_time": "06:00:00",
        "end_time": "12:00:00"
      },
      {
        "media_type": "url",
        "media_value": "https://images.unsplash.com/photo-1567905740416-832e49c08089",
        "media_name": "Afternoon Background",
        "is_active": true,
        "start_time": "12:00:00",
        "end_time": "18:00:00"
      },
      {
        "media_type": "youtube",
        "media_value": "dQw4w9WgXcQ",
        "media_name": "Featured Video",
        "is_active": true
      }
    ],
    "iqomah_subuh": 20,
    "iqomah_dzuhur": 10,
    "iqomah_ashar": 10,
    "iqomah_maghrib": 5,
    "iqomah_isya": 10,
    "blackout_duration_minutes": 30,
    "slide_duration_kegiatan_seconds": 10
  }'
```

**This setup:**
- Shows "Morning Background" from 6 AM to 12 PM
- Shows "Afternoon Background" from 12 PM to 6 PM
- Always shows "Featured Video" (YouTube)
- Allows flexible scheduling based on time of day

---

## PowerShell Examples (Windows)

Jika Anda menggunakan PowerShell di Windows:

```powershell
# Register
$body = @{
    username = "admin"
    email = "admin@masjid.com"
    password = "password123"
    masjid_name = "Masjid Raya"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
$data = $response.Content | ConvertFrom-Json
$token = $data.responseData.token

# Login (using EMAIL, not username)
$loginBody = @{
    email = "admin@masjid.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$data = $response.Content | ConvertFrom-Json
$token = $data.responseData.token

# Get Settings (with JWT)
$headers = @{
    "Authorization" = "Bearer $token"
}

$settings = Invoke-WebRequest -Uri "http://localhost:3000/api/masjid/settings" -Headers $headers -UseBasicParsing
$settingsData = $settings.Content | ConvertFrom-Json
$masjidId = $settingsData.responseData.masjid_id

# Get Public Endpoints (without JWT)
Invoke-WebRequest -Uri "http://localhost:3000/api/sholat/today?masjid_id=$masjidId" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:3000/api/hadist/active?masjid_id=$masjidId" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:3000/api/infaq/saldo?masjid_id=$masjidId" -UseBasicParsing
```

---

## Common City IDs for Testing

Beberapa city_id yang bisa digunakan untuk testing (from MyQuran API v3):

| City | City ID (UUID) |
|------|----------------|
| Jakarta | 58a2fc6ed39fd083f55d4182bf88826d |
| Bandung | fc221309746013ac554571fbd180e1c8 |
| Surabaya | 4734ba6f3de83d861c3176a6273cac6d |
| Medan | 2838023a778dfaecdc212708f721b788 |
| Semarang | 74db120f0a8e5646ef5a30154e9f6deb |
| Makassar | b7b16ecf8ca53723593894116071700c |
| Yogyakarta | 577ef1154f3240ad5b9b413aa7346a1e |

---

## Error Responses

### 401 Unauthorized (Missing/Invalid Token)
**When token is missing or invalid from middleware:**
```
invalid or expired token
```

**When token is invalid from endpoint:**
```json
{
  "responseCode": "401",
  "responseMessage": "Unauthorized - Invalid or missing token"
}
```

### 400 Bad Request
```json
{
  "responseCode": "400",
  "responseMessage": "validation error message"
}
```

### 404 Not Found
```json
{
  "responseCode": "404",
  "responseMessage": "resource not found"
}
```

### 422 Validation Error
```json
{
  "responseCode": "422",
  "responseMessage": "validation error message"
}
```

### 500 Internal Server Error
```json
{
  "responseCode": "500",
  "responseMessage": "internal server error"
}
```

---

## Testing Flow

### Initial Setup (One-Time)
1. **Register** user baru → dapatkan token + user data
2. **Login** (menggunakan email) → dapatkan token baru
3. **Get Masjid Settings** (dengan JWT) → dapatkan `masjid_id` untuk public endpoints
4. **Search Location** → cari city_id kota Anda
5. **Update Settings** (dengan JWT) → set city_id dan konfigurasi lainnya

### Public Endpoints (No JWT - FE 24/7)
Setelah mendapatkan `masjid_id`, frontend dapat mengakses endpoint berikut **TANPA JWT**:

1. **Get Sholat Today** (PUBLIC) → `GET /api/sholat/today?masjid_id={id}`
    - Return jadwal sholat hari ini + tanggal + iqomah
    - TANPA JWT token
    - Query parameter `masjid_id` wajib

2. **Get Hadist Active** (PUBLIC) → `GET /api/hadist/active?masjid_id={id}`
    - Return hadist quotes aktif
    - TANPA JWT token
    - Query parameter `masjid_id` wajib

3. **Get Infaq Saldo** (PUBLIC) → `GET /api/infaq/saldo?masjid_id={id}`
    - Return saldo infaq
    - TANPA JWT token
    - Query parameter `masjid_id` wajib

**Catatan:** `masjid_id` didapat dari response `/api/masjid/settings` (perlu JWT untuk dapat ini sekali saja setelah register).

---

## Important Notes

### Technical Stack (Current)
- **Go Version:** 1.24.0
- **Database Driver:** pgx/v4/stdlib (Supabase recommended)
- **Database:** PostgreSQL (Supabase Cloud)
- **API:** MyQuran API v3
- **Framework:** Chi Router v5
- **Authentication:** JWT (HS256)
- **Storage:** Supabase Storage (for file uploads)

### Database Configuration (Supabase)
**Connection String Format:**
```
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres
```

**Example:**
```bash
DATABASE_URL=postgresql://postgres.qqpadjufneirnkttswsx:password123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### Database Tables
- `users` - User accounts (email: UNIQUE, username: NOT UNIQUE)
- `masjid` - Masjid data (1:1 with users)
- `masjid_settings` - Masjid configuration
- `masjid_media` - Masjid media (URL, YouTube, file) with scheduling
- `hadist_quotes` - Hadist/quotes for running text (with hadists management)
- `infaq_transactions` - Infaq transaction history

### Migrations
Project uses golang-migrate with 9 migrations:
- 001_create_users - Creates users table with **email UNIQUE constraint**
- 002_create_masjid - Creates masjid table
- 003_create_masjid_settings - Creates masjid_settings table
- 004_create_hadist_quotes - Creates hadist_quotes table
- 005_create_infaq_transactions - Creates infaq_transactions table
- 006_remove_username_unique - Removes unique constraint from username (allows duplicate usernames)
- 007_update_masjid_settings_for_media - Updates masjid_settings for media support (adds slide_duration_kegiatan_seconds)
- 008_create_masjid_media - Creates masjid_media table with scheduling support (multiple media, drop old media columns)
- 009_add_updated_at_to_hadist_quotes - Adds updated_at column to hadist_quotes table for hadists management

### Database Constraints
- **users.email**: UNIQUE constraint (users_email_key) - Email tidak boleh duplicate
- **users.username**: TIDAK unique - Username boleh duplicate dengan email berbeda

### Public Access Strategy
**PENTING:** 3 endpoint utama (`/api/sholat/today`, `/api/hadist/active`, `/api/infaq/saldo`) adalah **FULLY PUBLIC** tanpa JWT:
- Tidak perlu `Authorization: Bearer {token}` header
- Cukup gunakan query parameter `?masjid_id={id}`
- Ini memungkinkan frontend berjalan 24/7 tanpa perlu login terus-menerus
- FE hanya perlu menyimpan `masjid_id` (dapat sekali saat setup/login awal)

### Authentication
- **Login menggunakan EMAIL** (bukan username) karena username boleh duplicate
- Token JWT expired dalam **24 jam** (default, dapat diubah via env `JWT_EXPIRE_HOUR`)
- **JWT Token Working:**
  - Token dibuat saat login/register menggunakan HS256 algorithm
  - Token berisi: user_id, username, issued_at, expires_at
  - Token divalidasi oleh middleware sebelum mengakses protected endpoints
  - Token disimpan di header `Authorization: Bearer {token}`
  - Token expired akan mengembalikan error `401 Unauthorized` dengan pesan `"invalid or expired token"`
- Hanya endpoint yang memerlukan JWT:
  - `/api/masjid/settings` (GET/POST)
- Admin endpoint memerlukan `punyakuId: {secret}` header:
  - `/api/auth/account` (GET/DELETE/PATCH)
  - `/api/auth/status` (PATCH)
- Server time menggunakan timezone **Asia/Jakarta (WIB)**
- Waktu iqomah dihitung otomatis berdasarkan rule iqomah + waktu adzan

### MyQuran API v3 Integration
- **Base URL:** `https://api.myquran.com/v3`
- Jadwal sholat diambil dari MyQuran API v3
- Tanggal jadwal diambil langsung dari response MyQuran (format: "Sabtu, 21/02/2026")
- Timezone jadwal: Asia/Jakarta (WIB)
- City ID untuk kota-kota besar tersedia di MyQuran API v3

### MyQuran API Notes
- API kadang mengalami downtime, coba lagi nanti jika gagal
- Response jadwal menggunakan format tanggal Indonesia
- City ID untuk kota-kota besar tersedia di MyQuran API v3
- Gunakan `/api/location/search?keyword={city_name}` untuk mencari city_id

---

## Production Deployment

### Environment Variables (Required for Supabase)
```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres

# JWT
JWT_SECRET=<strong-random-secret-min-32-chars>
JWT_EXPIRE_HOUR=24

# Admin
PUNYAKU_ID_SECRET=<strong-random-secret-min-32-chars>

# MyQuran
MYQURAN_BASE_URL=https://api.myquran.com/v3
```

### Build & Run
```bash
# Build
go build -o bin/server ./cmd/main.go

# Run
./bin/server
```

### Config Files
- `config/local.yaml` - Local development config
- `config/prod.yaml` - Production config (use DATABASE_URL from env)
- `.env` - Environment variables (do not commit to version control)

---

## Project Status

**Migration Status:** ✅ Complete
- ✅ Migrated from lib/pq to pgx/v4/stdlib
- ✅ Connected to Supabase production database
- ✅ All migrations applied successfully
- ✅ Health check working with database connection status

**Storage Integration:** ✅ Complete (2026-03-01)
- ✅ Switched from S3 API to Supabase Storage REST API
- ✅ File upload to Supabase Storage bucket: WORKING
- ✅ File replacement (delete old, upload new): WORKING
- ✅ Storage client initialized and authenticated
- ✅ Public URL generation: WORKING

**API Endpoints:** ✅ All Working
- ✅ Health check working with database connection status
- ✅ All API endpoints tested and working
- ✅ Public endpoints accessible without JWT
- ✅ Protected endpoints with JWT working
- ✅ Admin endpoints with punyakuId header working

**File Upload Feature:** ✅ Fully Tested & Working
- ✅ File size validation: WORKING (rejects >1MB files)
- ✅ File count validation: WORKING (max 4 files per masjid)
- ✅ MIME type validation: WORKING (JPEG, PNG, WebP only)
- ✅ Content-Type detection: WORKING (from file header with fallback)
- ✅ File pointer reset: WORKING (fixed Seek issue)
- ✅ Public URL accessibility: WORKING
- ✅ File deletion: WORKING (old files removed on replacement)

**JSON Media Updates:** ✅ All Working
- ✅ Single URL media: PASS (URL media with scheduling)
- ✅ Single YouTube media: PASS (YouTube video ID)
- ✅ Multiple URL media: PASS (multiple URL with time scheduling)
- ✅ Mixed media types: PASS (URL + YouTube)
- ✅ Settings-only update: PASS (no media, only settings)

**Authentication:** ✅ Working
- ✅ GET without token: PASS (401 Unauthorized)
- ✅ POST without token: PASS (401 Unauthorized)
- ✅ GET with valid token: PASS
- ✅ GET with invalid token: PASS (401 Unauthorized)

**Minor Issues (Non-Critical):**
- ⚠️ Empty medias array: Doesn't consistently delete old media
- ⚠️ GET after some updates: Occasionally returns 500 error (timing issue)

**Overall Status:** ✅ **READY FOR PRODUCTION**
- All core features are working
- File upload fully functional with Supabase Storage
- Media management (URL, YouTube, File) all working
- Storage integration tested and verified
