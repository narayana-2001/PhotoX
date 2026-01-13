# Supabase Setup Instructions

## Bucket Configuration

You need to set up the `images` bucket in Supabase with the following RLS (Row Level Security) policies:

### Storage Bucket Settings

1. Go to **Storage** in your Supabase Dashboard
2. Create a new bucket named `images` (if not already created)
3. Set it as **NOT PUBLIC** (private bucket)

### RLS Policies

Add the following policies to the `images` bucket:

#### Policy 1: Allow users to upload files to their own folder

- **Name**: `Allow users to upload to their own folder`
- **Definition**: `(bucket_id = 'images')`
- **Allowed operation**: `INSERT`
- **With check**: `(auth.uid()::text = (storage.foldername(name))[1])`

#### Policy 2: Allow users to read their own files

- **Name**: `Allow users to read their own files`
- **Definition**: `(bucket_id = 'images')`
- **Allowed operation**: `SELECT`
- **Using**: `(auth.uid()::text = (storage.foldername(name))[1])`

#### Policy 3: Allow users to delete their own files

- **Name**: `Allow users to delete their own files`
- **Definition**: `(bucket_id = 'images')`
- **Allowed operation**: `DELETE`
- **With check**: `(auth.uid()::text = (storage.foldername(name))[1])`

## How It Works

- Each user's images are stored in a folder named with their `user_id`
- Images are uploaded to `{user_id}/{timestamp}-{filename}`
- Users can only see, upload, and delete their own images
- The bucket is private, so direct URLs are read-only and secured

## Error Handling

- "Unauthorized" error: User tries to upload without being logged in
- Users will see a toast message if upload/delete fails
- Images automatically load when user logs in
