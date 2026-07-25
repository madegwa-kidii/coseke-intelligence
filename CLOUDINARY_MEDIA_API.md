# Cloudinary Media Manager API

A complete Next.js CRUD API for managing images and videos with Cloudinary, complete with a web UI.

## Features

- **Upload Media**: Drag-and-drop or click to upload images and videos
- **List Media**: View all uploaded media with filtering (images, videos, or all)
- **Delete Media**: Remove unwanted media files
- **Tag Management**: Add and update tags on media files
- **Responsive UI**: Built with Next.js, React, and shadcn/ui components
- **Real-time Updates**: Gallery refreshes automatically after uploads

## Setup

### 1. Environment Variables

The following environment variables are required and should be added to your `.env.local` or Vercel project settings:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

If using `CLOUDINARY_URL`:
```env
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### 2. Installation

Dependencies are already installed:
- `cloudinary` - Cloudinary SDK for server-side operations
- `next-cloudinary` - Next.js integration (for future client-side features)
- `sonner` - Toast notifications
- `lucide-react` - Icons

## API Routes

### `/api/media/upload` (POST)

Upload a single or multiple files to Cloudinary.

**Request:**
```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('folder', 'coseke'); // optional, defaults to 'coseke'

const response = await fetch('/api/media/upload', {
  method: 'POST',
  body: formData,
});
```

**Response:**
```json
{
  "public_id": "coseke/filename",
  "url": "http://...",
  "secure_url": "https://...",
  "resource_type": "image",
  "format": "png",
  "width": 1920,
  "height": 1080,
  "bytes": 123456,
  "created_at": "2026-07-25T16:06:00Z"
}
```

### `/api/media/list` (GET)

List all media resources in a folder.

**Query Parameters:**
- `folder` (string, default: 'coseke') - Folder prefix
- `type` (string, default: 'image') - Resource type: 'image', 'video'
- `maxResults` (number, default: 100) - Maximum number of results

**Request:**
```javascript
const response = await fetch(
  '/api/media/list?folder=coseke&type=image&maxResults=100'
);
const data = await response.json();
```

**Response:**
```json
{
  "resources": [
    {
      "public_id": "coseke/filename1",
      "url": "http://...",
      "secure_url": "https://...",
      "resource_type": "image",
      "format": "jpg",
      "width": 1920,
      "height": 1080,
      "bytes": 234567,
      "created_at": "2026-07-25T16:06:00Z"
    }
  ],
  "resource_count": 1,
  "total_count": 50
}
```

### `/api/media/delete` (DELETE)

Delete a media resource.

**Request:**
```javascript
const response = await fetch('/api/media/delete', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    publicId: 'coseke/filename',
    resourceType: 'image' // or 'video'
  }),
});
```

**Response:**
```json
{
  "result": "ok",
  "public_id": "coseke/filename"
}
```

### `/api/media/tags` (PUT)

Add or update tags on a media resource.

**Request:**
```javascript
const response = await fetch('/api/media/tags', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    publicId: 'coseke/filename',
    tags: ['portfolio', 'featured', '2024']
  }),
});
```

**Response:**
```json
{
  "public_ids": ["coseke/filename"],
  "tags": ["portfolio", "featured", "2024"]
}
```

## UI Components

### MediaUploader

A drag-and-drop file upload component.

**Props:**
- `onUploadSuccess: () => void` - Callback when upload completes
- `folder?: string` - Cloudinary folder (default: 'coseke')

**Usage:**
```tsx
import { MediaUploader } from '@/components/MediaUploader';

<MediaUploader 
  onUploadSuccess={() => console.log('Uploaded!')} 
  folder="my-folder"
/>
```

### MediaGallery

Display and manage uploaded media.

**Props:**
- `folder?: string` - Cloudinary folder (default: 'coseke')
- `resourceType?: 'image' | 'video' | 'all'` - Filter by type
- `refreshTrigger?: number` - Trigger refresh when this value changes

**Usage:**
```tsx
import { MediaGallery } from '@/components/MediaGallery';

<MediaGallery 
  resourceType="image" 
  refreshTrigger={uploadCount}
/>
```

## Pages

### `/media` - Media Management Dashboard

Full-featured media management page with:
- Upload section with drag-and-drop
- Tab-based filtering (All Media, Images, Videos)
- Gallery view with thumbnails
- Copy URL button for each file
- Delete button with confirmation
- File size and dimension information
- Upload timestamp

## File Structure

```
src/
├── app/
│   ├── api/media/
│   │   ├── upload/route.ts     # Upload endpoint
│   │   ├── list/route.ts       # List resources endpoint
│   │   ├── delete/route.ts     # Delete resource endpoint
│   │   └── tags/route.ts       # Update tags endpoint
│   └── media/
│       └── page.tsx             # Media management page
├── components/
│   ├── MediaUploader.tsx        # Upload component
│   └── MediaGallery.tsx         # Gallery display component
└── lib/
    └── cloudinary.ts            # Cloudinary configuration
```

## Error Handling

All API routes include error handling with appropriate HTTP status codes:

- `400` - Bad request (missing required parameters)
- `500` - Server error (Cloudinary API failure)

Client-side errors display toast notifications using `sonner`.

## Features

### Automatic Transformations

Uploaded images receive automatic eager transformations:
- 200x200 thumbnail (fill crop)
- 400x300 preview (fit crop)

These are accessible via the Cloudinary delivery URL with transformation parameters.

### Metadata

Each media item includes:
- Public ID (unique identifier)
- Secure URL (HTTPS)
- Resource type (image/video)
- Format (jpg, png, mp4, etc.)
- Dimensions (width x height for images)
- Duration (in seconds for videos)
- File size (in bytes)
- Created timestamp
- Tags (if assigned)

## Examples

### Upload via Form

```javascript
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  console.log('Uploaded:', data.secure_url);
};
```

### List and Filter

```javascript
const loadImages = async () => {
  const response = await fetch(
    '/api/media/list?type=image&maxResults=50'
  );
  const { resources } = await response.json();
  return resources;
};
```

### Batch Delete

```javascript
const deleteImages = async (publicIds) => {
  for (const publicId of publicIds) {
    await fetch('/api/media/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });
  }
};
```

## Troubleshooting

### "Must supply cloud_name" Error

Ensure all three environment variables are set:
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (or use `CLOUDINARY_URL`)

### Upload Fails

1. Check file size limits (Cloudinary free tier: 100MB)
2. Verify file format is supported
3. Check API key permissions in Cloudinary dashboard
4. Ensure folder path is valid

### Missing Media After Upload

- Media may take a few seconds to appear in listing
- Check Cloudinary dashboard to verify files were uploaded
- Verify folder prefix matches (default: 'coseke')

## Security Notes

- API keys are stored server-side only (never exposed to client)
- Use signed URLs for sensitive content
- Implement authentication on API routes if needed
- Consider rate limiting for production

## Next Steps

1. Visit `/media` to access the Media Manager
2. Upload test images or videos
3. Browse, filter, and manage your media
4. Copy URLs for use in your application
5. Extend the API with additional Cloudinary features as needed
