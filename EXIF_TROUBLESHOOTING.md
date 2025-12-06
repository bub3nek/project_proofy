# EXIF Extraction - Troubleshooting Guide

## Issue: Database Column Error

### Error Message:
```
column "gps_latitude" of relation "proofy_images" does not exist
```

### Cause:
Your existing Postgres database doesn't have the new GPS and camera columns.

### Solution:
The columns will be added automatically on the next upload! The system now includes automatic migration.

**What happens:**
1. You try to upload an image
2. System detects missing columns
3. Automatically adds them
4. Upload succeeds

**Manual migration (if needed):**
```bash
cd /Users/bub3nek/Downloads/code/project_proofy
npx tsx scripts/migrate-add-gps-camera.ts
```

---

## Issue: Date Not Extracting

### Possible Causes:

#### 1. **Photo has no EXIF data**
- Screenshots don't have EXIF
- Downloaded images often have EXIF stripped
- Some apps remove EXIF for privacy

**Check:** Open photo properties and look for "Date Taken" or "Date Created"

#### 2. **EXIF format not recognized**
- Some cameras use different EXIF formats
- The library might not support all formats

**Check console for:**
```javascript
[EXIF] Raw tags found: {
  DateTimeOriginal: undefined,  // ← Should have a number here
  DateTime: undefined,          // ← Or here
  ...
}
```

#### 3. **Buffer reading issue**
- File might be corrupted
- Format not supported (e.g., HEIC on some systems)

**Check console for:**
```
[EXIF] Failed to extract metadata: ...
```

### Testing EXIF Extraction:

1. **Upload a photo**
2. **Open browser console** (F12)
3. **Look for these logs:**

```javascript
// Good - EXIF found:
[EXIF] Raw tags found: {
  DateTimeOriginal: 1733515200,  // ← Unix timestamp
  DateTime: 1733515200,
  GPSLatitude: 40.7128,
  GPSLongitude: -74.0060,
  Make: "Apple",
  Model: "iPhone 15 Pro"
}

[EXIF] Extracted metadata: {
  hasDate: true,
  dateTaken: "2024-12-06T18:00:00.000Z",  // ← ISO date
  hasGPS: true,
  gps: { latitude: 40.7128, longitude: -74.0060 },
  hasCamera: true,
  camera: { make: "Apple", model: "iPhone 15 Pro" }
}

[Upload] EXIF data extracted: {
  file: "IMG_1234.jpg",
  hasDate: true,  // ← Should be true
  hasGPS: true,
  hasCamera: true
}
```

```javascript
// Bad - No EXIF:
[EXIF] Raw tags found: {
  DateTimeOriginal: undefined,  // ← No data
  DateTime: undefined,
  GPSLatitude: undefined,
  GPSLongitude: undefined,
  Make: undefined,
  Model: undefined
}

[EXIF] Extracted metadata: {
  hasDate: false,  // ← No date found
  dateTaken: undefined,
  hasGPS: false,
  hasCamera: false
}
```

### Solutions:

#### If photo has no EXIF:
- ✅ **Use original photos** from camera/phone
- ✅ **Enable location services** on phone before taking photos
- ✅ **Don't use screenshots** or edited images
- ✅ **Manually enter date** if EXIF is missing

#### If EXIF exists but not extracting:
1. **Check file format** - JPG/JPEG work best
2. **Try different photo** - Test with known good photo
3. **Check console errors** - Look for specific error messages
4. **File size** - Very large files might timeout

---

## Testing with Known Good Photo

### Get a test photo with EXIF:
1. Take a photo with your smartphone (location services ON)
2. Don't edit or share it (keeps EXIF intact)
3. Upload directly from phone or transfer via cable (not cloud)

### Verify EXIF before uploading:

**On Mac:**
```bash
mdls /path/to/photo.jpg | grep -i date
mdls /path/to/photo.jpg | grep -i gps
```

**On Windows:**
Right-click photo → Properties → Details tab

**Expected:**
- Date Taken: Should show date/time
- GPS: Should show coordinates (if location was on)
- Camera Make: Should show manufacturer
- Camera Model: Should show model

---

## Common Scenarios

### ✅ Works:
- Original photos from iPhone/Android
- Photos from digital cameras
- Unedited images
- Photos with location services enabled

### ❌ Doesn't Work:
- Screenshots
- Photos from social media (EXIF stripped)
- Edited images (EXIF often removed)
- Photos from some messaging apps
- Images created in Photoshop/GIMP

---

## Quick Fixes

### 1. Database Migration
```bash
# Restart your app - migration runs automatically
# Or run manual migration:
npx tsx scripts/migrate-add-gps-camera.ts
```

### 2. Test EXIF Extraction
```bash
# Upload a photo from your phone
# Check console for EXIF logs
# Look for "hasDate: true"
```

### 3. Verify Database Columns
```sql
-- In Postgres console:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'proofy_images';

-- Should see:
-- gps_latitude | double precision
-- gps_longitude | double precision
-- camera_make | text
-- camera_model | text
```

---

## Still Not Working?

### Check These:

1. **Console Errors**
   - Open browser console (F12)
   - Look for red errors
   - Share error messages

2. **Network Tab**
   - Check if upload request fails
   - Look at response body
   - Check status code

3. **Server Logs**
   - Check terminal where `npm run dev` is running
   - Look for error messages
   - Check for database errors

4. **File Format**
   - Try different image formats
   - JPG/JPEG work best
   - PNG might not have EXIF
   - HEIC might need conversion

---

## Expected Behavior

### With EXIF Data:
1. Drop image → EXIF extracted
2. Date field AUTO-FILLED ✅
3. Camera info in notes ✅
4. GPS coordinates stored ✅
5. Upload succeeds ✅

### Without EXIF Data:
1. Drop image → No EXIF found
2. Date field EMPTY (manual entry needed)
3. Notes field EMPTY
4. No GPS data
5. Upload succeeds (but no auto-fill)

---

## Debug Checklist

- [ ] Browser console open
- [ ] Using original photo from phone/camera
- [ ] Photo has EXIF data (verified in properties)
- [ ] Database columns added (migration ran)
- [ ] No errors in console
- [ ] Upload endpoint responding
- [ ] EXIF logs showing in console

---

## Contact Info

If still having issues, provide:
1. Console logs (especially EXIF logs)
2. Photo source (phone model, camera, etc.)
3. Error messages
4. Screenshot of issue

---

**Most common fix:** Use an original, unedited photo from your smartphone! 📱
