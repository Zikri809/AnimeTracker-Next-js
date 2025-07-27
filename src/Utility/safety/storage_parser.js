export default function storage_Parser(storage_type, storage_key, fallback) {
    try {
      const raw = storage_type.getItem(storage_key);
  
      // Handle null, undefined, or empty string as invalid
      if (!raw || raw === 'undefined' || raw === 'null') return fallback;
  
      const parsed = JSON.parse(raw);
  
      // Allow `null`, but fallback if unexpected types (optional)
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }
  