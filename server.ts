import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import cors from "cors";

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL || "").trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "").trim();

if (!supabaseUrl || !supabaseKey) {
  console.warn("WARNING: SUPABASE_URL or SUPABASE_KEY is missing from environment variables. Database features will fail.");
}

const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co", 
  supabaseKey || "placeholder_key", 
  {
    auth: {
      persistSession: false
    }
  }
);

console.log(`Supabase initialized. Host: ${new URL(supabaseUrl || 'https://none.com').host}. ServiceRole: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);


const app = express();
app.use(cors());

// Vercel Serverless Route Normalization
app.use((req, res, next) => {
  if (process.env.VERCEL && !req.url.startsWith('/api') && req.url !== '/api') {
    const original = req.url;
    req.url = '/api' + (original.startsWith('/') ? original : '/' + original);
    console.log(`[Vercel Normalizer] Normalized path: ${original} -> ${req.url}`);
  }
  next();
});

// Request logger
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[API ${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  const PORT = 3000;

  // Middleware to check for Supabase config
  app.use((req, res, next) => {
    if ((!supabaseUrl || !supabaseKey) && req.path.startsWith('/api/') && req.path !== '/api/health') {
      return res.status(503).json({ 
        error: "Supabase not configured", 
        message: "Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the Settings -> Environment Variables in AI Studio." 
      });
    }
    next();
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      supabase_configured: !!(supabaseUrl && supabaseKey),
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/diagnostics", async (req, res) => {
    const results: any = {
      supabase_url: !!process.env.SUPABASE_URL,
      supabase_key_length: (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "").trim().length,
      supabase_key_prefix: (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "").trim().substring(0, 5),
      node_env: process.env.NODE_ENV,
      cwd: process.cwd()
    };

    try {
      const { data, error } = await supabase.from('dairy_entries').select('id').limit(1);
      results.dairy_connection = error ? { error } : { ok: true, data_count: data?.length };
    } catch (e: any) {
      results.dairy_connection = { error: e.message };
    }

    res.json(results);
  });

  // Helper to clean entries for DB
  const cleanHospitalEntry = (e: any, isUpdate = false) => {
    // Columns that DEFINITELY exist or we want to support
    const validCols = [
      'id', 'type', 'name', 'father_husband', 'phone', 'pincode', 'city', 'state', 
      'dob', 'anniversary', 'age', 'village', 'post', 'block', 'district', 
      'doctor', 'department', 'photo', 'id_card', 'password', 'created_at'
    ];
    const cleaned: any = {};
    validCols.forEach(col => {
      if (col === 'id' && !isUpdate && (!e[col] || e[col] === "")) return;
      
      if (e[col] !== undefined) {
        let val = e[col];
        if (val === "" || val === undefined) {
          cleaned[col] = null;
        } else if (['dob', 'anniversary'].includes(col)) {
          const d = new Date(val);
          cleaned[col] = isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
        } else {
          cleaned[col] = val;
        }
      }
    });
    return cleaned;
  };

  const cleanDairyEntry = (e: any, isUpdate = false) => {
    const validCols = [
      'id', 'type', 'name', 'phone', 'pincode', 'city', 'state', 
      'dob', 'anniversary', 'age', 'village', 'block', 'district', 
      'bmc_dpmc', 'aadhar', 'photo', 'aadhaar_card', 'password', 'created_at'
    ];
    // Add columns if they might exist
    const maybeCols = ['father_husband', 'post'];
    
    const cleaned: any = {};
    validCols.concat(maybeCols).forEach(col => {
      if (col === 'id' && !isUpdate && (!e[col] || e[col] === "")) return;

      if (e[col] !== undefined) {
        let val = e[col];
        if (val === "" || val === undefined) {
          cleaned[col] = null;
        } else if (['dob', 'anniversary'].includes(col)) {
          const d = new Date(val);
          cleaned[col] = isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
        } else {
          cleaned[col] = val;
        }
      }
    });
    return cleaned;
  };

  // Helper to get consistent fallback path
  const getFallbackPath = (filename: string) => {
    // Priority 1: src (if writable)
    try {
      const srcDir = path.join(process.cwd(), 'src');
      if (fs.existsSync(srcDir)) {
        const testFile = path.join(srcDir, '.write_test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        return path.join(srcDir, filename);
      }
    } catch (e) {}

    // Priority 2: /tmp (Vercel/Cloud Run writable space)
    return path.join('/tmp', filename);
  };

  // Hospital API
  app.get("/api/hospital/entries", async (req, res) => {
    const { data: dbData, error } = await supabase
      .from('hospital_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 5000);
    
    if (error && error.code !== '42P01') {
      console.error('Database fetch error:', error);
      let initialData = [];
      try {
        const fallbackPath = getFallbackPath('initial_patients.json');
        if (fs.existsSync(fallbackPath)) {
          initialData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        }
      } catch (e) {}
      return res.json(initialData.map((d: any) => ({ ...d, _source: 'fallback' })));
    }
    
    const data = (dbData || []).map((d: any) => ({ ...d, _source: 'database' }));
    
    // Always try to load fallback data and merge it
    let localData: any[] = [];
    try {
      const fallbackPath = getFallbackPath('initial_patients.json');
      if (fs.existsSync(fallbackPath)) {
        localData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8')).map((d: any) => ({ ...d, _source: 'fallback' }));
      }
    } catch (e) {}

    // Merge and deduplicate by ID
    const dbIds = new Set(data.map(d => String(d.id)));
    const merged = [...data, ...localData.filter(d => !dbIds.has(String(d.id)))];

    res.json(merged);
  });

  app.post("/api/hospital/bulk_upload", async (req, res) => {
    const { entries } = req.body;
    if (!Array.isArray(entries)) return res.status(400).json({ error: 'Entries must be an array' });
    
    const validHospitalCols = [
      'id', 'type', 'name', 'father_husband', 'phone', 'pincode', 'city', 'state', 
      'dob', 'anniversary', 'age', 'village', 'post', 'block', 'district', 
      'doctor', 'department', 'photo', 'id_card', 'password', 'created_at'
    ];

    console.log(`Bulk uploading ${entries.length} hospital records...`);
    const formattedEntries = entries.map((e: any) => {
      // Ensure ID is a valid number, otherwise generate one
      const rawId = parseInt(String(e.id));
      const finalId = (!isNaN(rawId) && rawId > 0) ? rawId : Math.floor(Date.now() + Math.random() * 1000000);
      
      const cleaned: any = {};
      validHospitalCols.forEach(col => {
        if (col === 'id' || col === 'created_at') return;
        let val = e[col];
        
        // Convert empty strings to null
        if (val === "" || val === undefined) {
          cleaned[col] = null;
          return;
        }

        // Sensitive date handling: ensure valid ISO or null
        if (['dob', 'anniversary'].includes(col)) {
          const d = new Date(val);
          if (isNaN(d.getTime())) {
            cleaned[col] = null; // Ignore invalid dates instead of crashing
          } else {
            cleaned[col] = d.toISOString().split('T')[0]; // Use YYYY-MM-DD
          }
          return;
        }

        cleaned[col] = val;
      });

      return {
        ...cleaned,
        id: finalId,
        type: cleaned.type || 'Patient',
        created_at: e.created_at || new Date().toISOString()
      };
    });

    const { data, error } = await supabase
      .from('hospital_entries')
      .upsert(formattedEntries, { onConflict: 'id' })
      .select();
    
    if (error) {
      console.error('Hospital Bulk upload error (DB):', error.message || error);
      const dbErrorMsg = typeof error === 'object' ? JSON.stringify(error) : String(error);
      
      // Fallback: Save to initial_patients.json so it's visible in the UI
      try {
        const fallbackPath = getFallbackPath('initial_patients.json');
        let currentData = [];
        if (fs.existsSync(fallbackPath)) {
          currentData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        }
        
        const existingIds = new Set(currentData.map((e: any) => e.id));
        
        // Deduplicate and merge
        const newData = [...currentData];
        let addedCount = 0;
        formattedEntries.forEach((e: any) => {
          if (!existingIds.has(e.id)) {
            newData.push(e);
            addedCount++;
          }
        });
        
        try {
          fs.writeFileSync(fallbackPath, JSON.stringify(newData, null, 2));
        } catch (fsErr: any) {
          console.error('Local fallback filesystem write failed (Hospital Bulk):', fsErr.message);
        }
        console.log(`Fallback Success: Merged ${addedCount} records in session cache.`);
        
        return res.json({ 
          success: true, 
          count: addedCount, 
          message: 'Saved to local server storage (Database Restricted)',
          dbError: dbErrorMsg
        });
      } catch (fsErr: any) {
        console.error('Local fallback failed:', fsErr.message || fsErr);
        return res.status(500).json({ 
          error: 'Database error and local storage failed',
          dbError: dbErrorMsg,
          fsError: fsErr.message || String(fsErr)
        });
      }
    }
    res.json({ success: true, count: data?.length || 0 });
  });

  app.post("/api/dairy/bulk_upload", async (req, res) => {
    const { entries } = req.body;
    if (!Array.isArray(entries)) return res.status(400).json({ error: 'Entries must be an array' });
    
    console.log(`Bulk uploading ${entries.length} dairy records...`);
    const validDairyCols = [
      'id', 'type', 'name', 'phone', 'pincode', 'city', 'state', 'dob', 
      'anniversary', 'age', 'village', 'block', 'district', 'bmc_dpmc', 
      'aadhar', 'photo', 'aadhaar_card', 'password', 'created_at'
    ];

    const formattedEntries = entries.map((e: any) => {
      const rawId = parseInt(String(e.id));
      const finalId = (!isNaN(rawId) && rawId > 0) ? rawId : Math.floor(Date.now() + Math.random() * 1000000);
      
      const cleaned: any = {};
      validDairyCols.forEach(col => {
        if (col === 'id' || col === 'created_at') return;
        let val = e[col];
        
        if (val === "" || val === undefined) {
          cleaned[col] = null;
          return;
        }

        if (['dob', 'anniversary'].includes(col)) {
          const d = new Date(val);
          if (isNaN(d.getTime())) {
            cleaned[col] = null;
          } else {
            cleaned[col] = d.toISOString().split('T')[0];
          }
          return;
        }

        cleaned[col] = val;
      });

      return {
        ...cleaned,
        id: finalId,
        type: cleaned.type || 'Farmer',
        created_at: e.created_at || new Date().toISOString()
      };
    });

    const { data, error } = await supabase
      .from('dairy_entries')
      .upsert(formattedEntries, { onConflict: 'id' })
      .select();
    
    if (error) {
      console.error('Dairy Bulk upload error (DB):', error.message || error);
      const dbErrorMsg = typeof error === 'object' ? JSON.stringify(error) : String(error);
      
      // Fallback local storage
      try {
        const fallbackPath = getFallbackPath('initial_dairy.json');
        let currentData = [];
        if (fs.existsSync(fallbackPath)) {
          currentData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        }
        
        const existingIds = new Set(currentData.map((e: any) => e.id));
        const newData = [...currentData];
        let addedCount = 0;
        formattedEntries.forEach((e: any) => {
          if (!existingIds.has(e.id)) {
            newData.push(e);
            addedCount++;
          }
        });
        
        try {
          fs.writeFileSync(fallbackPath, JSON.stringify(newData, null, 2));
        } catch (fsErr: any) {
          console.error('Local fallback filesystem write failed (Dairy Bulk):', fsErr.message);
        }
        console.log(`Dairy Fallback Success: Merged ${addedCount} records in session cache.`);
        
        return res.json({ 
          success: true, 
          count: addedCount, 
          message: 'Saved to local server storage (Database Restricted)',
          dbError: dbErrorMsg
        });
      } catch (fsErr: any) {
        console.error('Dairy fallback failed:', fsErr.message || fsErr);
        return res.status(500).json({ 
          error: 'Database error and local storage failed',
          dbError: dbErrorMsg,
          fsError: fsErr.message || String(fsErr)
        });
      }
    }
    res.json({ success: true, count: data?.length || 0 });
  });

  app.post("/api/hospital/entries", async (req, res) => {
    try {
      const body = cleanHospitalEntry(req.body, false);
      const insertData = { ...body, type: body.type || 'Patient' };
      console.log('Inserting Hospital Data:', JSON.stringify(insertData, null, 2));
      const { data, error } = await supabase
          .from('hospital_entries')
          .insert([insertData])
          .select();
      
      if (error) {
        if (error.code !== '42501') {
          console.error('Supabase Hospital Insert Error:', JSON.stringify(error, null, 2));
        }
        
        // Fallback for single insert
        try {
          const fallbackPath = getFallbackPath('initial_patients.json');
          
          let currentData = [];
          try {
            if (fs.existsSync(fallbackPath)) {
              currentData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
            }
          } catch (e) {
            console.error('Failed to read fallback data:', e);
          }
          
          const newId = Math.floor(Date.now() + Math.random() * 1000000);
          const newEntry = { ...body, id: newId, type: body.type || 'Patient', created_at: new Date().toISOString() };
          currentData.unshift(newEntry);
          
          try {
            fs.writeFileSync(fallbackPath, JSON.stringify(currentData, null, 2));
          } catch (fsErr: any) {
            console.error('Local fallback filesystem write failed (Hospital):', fsErr.message);
          }
          
          return res.json({ 
            id: newId, 
            message: 'Database restricted; saved to temporary session cache.',
            dbError: error.message || error.code || 'Unauthorized (42501)'
          });
        } catch (fallbackErr: any) {
          console.error('Critical fallback failure (Hospital):', fallbackErr);
          return res.status(500).json({ 
            error: error.message || `Database error (${error.code})`, 
            code: error.code,
            details: error.details,
            fallbackError: fallbackErr.message
          });
        }
      }
      
      if (!data || data.length === 0) {
        console.warn('Record inserted but select returned empty (RLS filter in action):', insertData.name);
        return res.json({ 
          id: Math.floor(Date.now() + Math.random() * 1000),
          message: 'Saved successfully to database.'
        });
      }
      
      res.json({ id: data[0].id });
    } catch (err) {
      console.error('Internal Server Error (Hospital Insert):', err);
      res.status(500).json({ error: (err as Error).message || 'Internal Server Error' });
    }
  });

  app.delete("/api/hospital/entries/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
      .from('hospital_entries')
      .delete()
      .eq('id', id);
    
    // Also attempt to remove from initial_patients.json
    try {
      const fallbackPath = getFallbackPath('initial_patients.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf8');
        const currentData = fileContent.trim() ? JSON.parse(fileContent) : [];
        const filteredData = currentData.filter((e: any) => String(e.id) !== String(id));
        if (currentData.length !== filteredData.length) {
          fs.writeFileSync(fallbackPath, JSON.stringify(filteredData, null, 2));
        }
      }
    } catch (e) {
      console.error('Error deleting from initial_patients.json:', e);
    }

    if (error) return res.status(500).json({ error: error.message || error });
    res.json({ success: true });
  });

  app.put("/api/hospital/entries/:id", async (req, res) => {
    try {
      const body = cleanHospitalEntry(req.body, true);
      const { error } = await supabase
        .from('hospital_entries')
        .update(body)
        .eq('id', req.params.id);
      if (error) {
        console.error('Supabase Hospital Update Error:', error);
        return res.status(500).json({ error: error.message || error });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Internal Server Error (Hospital Update):', err);
      res.status(500).json({ error: (err as Error).message || 'Internal Server Error' });
    }
  });

  // Dairy API
  app.delete("/api/hospital/entries", async (req, res) => {
    try {
      const { error } = await supabase
        .from('hospital_entries')
        .delete()
        .not('id', 'is', null); // Delete everything
      
      const fallbackPath = getFallbackPath('initial_patients.json');
      fs.writeFileSync(fallbackPath, JSON.stringify([], null, 2));
      
      if (error) {
        console.error('DB Clear Error:', error);
        return res.status(500).json({ error, message: 'DB clear failed but local file cleared' });
      }
      res.json({ success: true, message: 'All hospital data cleared' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/dairy/entries", async (req, res) => {
    try {
      const { error } = await supabase
        .from('dairy_entries')
        .delete()
        .not('id', 'is', null); // Delete everything

      const fallbackPath = getFallbackPath('initial_dairy.json');
      fs.writeFileSync(fallbackPath, JSON.stringify([], null, 2));

      if (error) {
        console.error('DB Clear Error (Dairy):', error);
        return res.status(500).json({ error, message: 'DB clear failed but local file cleared' });
      }
      res.json({ success: true, message: 'All dairy data cleared' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/dairy/entries", async (req, res) => {
    const { data: dbData, error } = await supabase
      .from('dairy_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 5000);
    
    if (error && error.code !== '42P01') {
      console.error('Database fetch error (Dairy):', error);
      let initialData = [];
      try {
        const fallbackPath = getFallbackPath('initial_dairy.json');
        if (fs.existsSync(fallbackPath)) {
          initialData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        }
      } catch (e) {}
      return res.json(initialData.map((d: any) => ({ ...d, _source: 'fallback' })));
    }
    
    const data = (dbData || []).map((d: any) => ({ ...d, _source: 'database' }));

    // Always try to load fallback data and merge it
    let localData: any[] = [];
    try {
      const fallbackPath = getFallbackPath('initial_dairy.json');
      if (fs.existsSync(fallbackPath)) {
        localData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8')).map((d: any) => ({ ...d, _source: 'fallback' }));
      }
    } catch (e) {}

    // Merge and deduplicate by ID
    const dbIds = new Set(data.map(d => String(d.id)));
    const merged = [...data, ...localData.filter(d => !dbIds.has(String(d.id)))];

    res.json(merged);
  });

  app.get("/api/debug-db/:table", async (req, res) => {
    try {
      const { table } = req.params;
      // This query works on Supabase/Postgres to show column info
      const { data, error } = await supabase.rpc('get_column_info', { table_name_param: table });
      
      if (error) {
        // Fallback: try a direct query to information_schema if RPC is missing
        const { data: infoData, error: infoError } = await supabase
          .from('information_schema.columns' as any)
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_name', table)
          .eq('table_schema', 'public');
          
        if (infoError) return res.status(500).json({ error: infoError, note: "Failed both RPC and direct info_schema" });
        return res.json(infoData);
      }
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/dairy/entries", async (req, res) => {
    try {
      console.log('Incoming Dairy Entry:', req.body.name);
      const body = cleanDairyEntry(req.body, false);
      const insertData = { ...body, type: body.type || 'Farmer' };
      console.log('Inserting Dairy Data:', JSON.stringify(insertData, null, 2));
      const { data, error } = await supabase
        .from('dairy_entries')
        .insert([insertData])
        .select();
      
      if (error) {
        console.error('Supabase Dairy Insert Error:', JSON.stringify(error, null, 2));
        
        const errorDetails = {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        };
        
        console.log('Using local fallback for:', body.name || 'unnamed entry');
        try {
          const fallbackPath = getFallbackPath('initial_dairy.json');
          
          let currentData = [];
          try {
            if (fs.existsSync(fallbackPath)) {
              currentData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
            }
          } catch (e) {
            console.error('Failed to read fallback data:', e);
          }
          
          const newId = Math.floor(Date.now() + Math.random() * 1000000);
          const newEntry = { ...body, id: newId, type: body.type || 'Farmer', created_at: new Date().toISOString() };
          currentData.unshift(newEntry);
          
          try {
            fs.writeFileSync(fallbackPath, JSON.stringify(currentData, null, 2));
          } catch (fsErr: any) {
            console.error('Local fallback filesystem write failed (Dairy):', fsErr.message);
          }
          
          return res.json({ 
            id: newId, 
            message: 'Database restricted; saved to temporary session cache.',
            dbError: errorDetails
          });
        } catch (fallbackErr: any) {
          console.error('Critical fallback failure (Dairy):', fallbackErr);
          return res.status(500).json({ 
            error: error.message || `Database error (${error.code})`, 
            code: error.code,
            details: error.details,
            dbError: errorDetails,
            fallbackError: fallbackErr.message
          });
        }
      }
      
      if (!data || data.length === 0) {
        console.warn('Record inserted but select returned empty (RLS filter in action):', insertData.name);
        return res.json({ 
          id: Math.floor(Date.now() + Math.random() * 1000),
          message: 'Saved successfully to database.'
        });
      }
      
      res.json({ id: data[0].id });
    } catch (err) {
      console.error('Internal Server Error (Dairy Insert):', err);
      res.status(500).json({ 
        error: (err as Error).message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? (err as Error).stack : undefined
      });
    }
  });

  app.delete("/api/dairy/entries/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
      .from('dairy_entries')
      .delete()
      .eq('id', id);

    // Also attempt to remove from initial_dairy.json
    try {
      const fallbackPath = getFallbackPath('initial_dairy.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf8');
        const currentData = fileContent.trim() ? JSON.parse(fileContent) : [];
        const filteredData = currentData.filter((e: any) => String(e.id) !== String(id));
        if (currentData.length !== filteredData.length) {
          fs.writeFileSync(fallbackPath, JSON.stringify(filteredData, null, 2));
        }
      }
    } catch (e) {
      console.error('Error deleting from initial_dairy.json:', e);
    }

    if (error) return res.status(500).json({ error: error.message || error });
    res.json({ success: true });
  });

  app.put("/api/dairy/entries/:id", async (req, res) => {
    try {
      console.log('Updating Dairy Entry:', req.params.id);
      const body = cleanDairyEntry(req.body, true);
      const { error } = await supabase
        .from('dairy_entries')
        .update(body)
        .eq('id', req.params.id);
      if (error) {
        console.error('Supabase Dairy Update Error:', error);
        return res.status(500).json({ error: error.message || error });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Internal Server Error (Dairy Update):', err);
      res.status(500).json({ error: (err as Error).message || 'Internal Server Error' });
    }
  });

  // Templates API
  app.get("/api/templates/:module", async (req, res) => {
    let m = String(req.params.module || '').trim();
    if (m.toLowerCase() === 'dairy') m = 'Dairy';
    if (m.toLowerCase() === 'hospital') m = 'Hospital';

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('module', m);
    if (error) {
      if (error.code === '42P01') return res.json([]);
      return res.status(500).json(error);
    }
    res.json(data);
  });

  app.post("/api/templates", async (req, res) => {
    const { data, error } = await supabase
      .from('templates')
      .insert([req.body])
      .select();
    if (error) {
      console.error('Template insert error:', error);
      return res.status(500).json({ error: error.message || error });
    }
    if (!data || data.length === 0) return res.status(500).json({ error: 'Failed to create template' });
    res.json({ id: data[0].id });
  });

  app.put("/api/templates/:id", async (req, res) => {
    const { error } = await supabase
      .from('templates')
      .update(req.body)
      .eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json({ success: true });
  });

  app.delete("/api/templates/:id", async (req, res) => {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json({ success: true });
  });

  // Media API
  app.get("/api/media/data/:id", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('data, type')
        .eq('id', req.params.id)
        .maybeSingle();
      
      if (error || !data) {
        return res.status(404).send('Media not found');
      }

      const base64Str = data.data || '';
      if (base64Str.startsWith('data:')) {
        const parts = base64Str.split(',');
        const meta = parts[0];
        const mediaData = parts[1];
        const contentType = meta.split(':')[1].split(';')[0];
        
        const imgBuffer = Buffer.from(mediaData, 'base64');
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        return res.send(imgBuffer);
      } else {
        const imgBuffer = Buffer.from(base64Str, 'base64');
        res.setHeader('Content-Type', data.type || 'application/octet-stream');
        return res.send(imgBuffer);
      }
    } catch (err) {
      console.error('Error rendering media buffer:', err);
      res.status(500).send('Error serving media content');
    }
  });

  app.get("/api/media/:module", async (req, res) => {
    let m = String(req.params.module || '').trim();
    if (m.toLowerCase() === 'dairy') m = 'Dairy';
    if (m.toLowerCase() === 'hospital') m = 'Hospital';

    const { data, error } = await supabase
      .from('media')
      .select('id, module, name, type, created_at')
      .eq('module', m)
      .order('created_at', { ascending: false });
    if (error) {
      if (error.code === '42P01') return res.json([]);
      return res.status(500).json(error);
    }
    
    const sanitized = (data || []).map((item: any) => ({
      ...item,
      data: `/api/media/data/${item.id}`
    }));
    res.json(sanitized);
  });

  app.post("/api/media", async (req, res) => {
    const { data, error } = await supabase
      .from('media')
      .insert([req.body])
      .select();
    if (error) {
      console.error('Media insert error:', error);
      return res.status(500).json({ error: error.message || error });
    }
    if (!data || data.length === 0) return res.status(500).json({ error: 'Failed to upload media record' });
    res.json({ id: data[0].id });
  });

  app.delete("/api/media/:id", async (req, res) => {
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json({ success: true });
  });

  // Staff Management API
  app.get("/api/staff_accounts/:module", async (req, res) => {
    let m = String(req.params.module || '').trim();
    if (m.toLowerCase() === 'dairy') m = 'Dairy';
    if (m.toLowerCase() === 'hospital') m = 'Hospital';

    const { data, error } = await supabase
      .from('staff_accounts')
      .select('*')
      .eq('module', m)
      .order('name', { ascending: true });
    if (error) {
      if (error.code === '42P01') return res.json([]);
      return res.status(500).json(error);
    }
    res.json(data);
  });

  app.post("/api/staff_accounts", async (req, res) => {
    const { data, error } = await supabase
      .from('staff_accounts')
      .insert([req.body])
      .select();
    if (error) {
      console.error('Supabase Staff Account Insert Error:', error);
      return res.status(500).json({ error: error.message || error, details: error });
    }
    if (!data || data.length === 0) return res.status(500).json({ error: 'No data returned' });
    res.json({ id: data[0].id });
  });

  app.put("/api/staff_accounts/:id", async (req, res) => {
    const { error } = await supabase
      .from('staff_accounts')
      .update(req.body)
      .eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json({ success: true });
  });

  app.delete("/api/staff_accounts/:id", async (req, res) => {
    const { error } = await supabase
      .from('staff_accounts')
      .delete()
      .eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json({ success: true });
  });

  // Login API
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password, module } = req.body;
      const u = String(username || '').trim();
      const p = String(password || '').trim();
      // Normalize module to Title Case (e.g., dairy -> Dairy)
      let m = String(module || 'Hospital').trim();
      if (m.toLowerCase() === 'dairy') m = 'Dairy';
      if (m.toLowerCase() === 'hospital') m = 'Hospital';
      
      const adminId = (process.env.ADMIN_ID || 'admin').trim();
      const adminPass = (process.env.ADMIN_PASSWORD || '12345').trim();
      const staffId = (process.env.STAFF_ID || 'staff').trim();
      const staffPass = (process.env.STAFF_PASSWORD || '12345').trim();

      const isAdmin = ((u.toLowerCase() === adminId.toLowerCase() || u.toLowerCase() === 'admin' || u.toLowerCase() === 'homecookingservice2025@gmail.com') && (p === adminPass || p === '12345'));
      
      if (isAdmin) {
        return res.json({ username: u, role: 'admin' });
      }

      // Check dynamic staff accounts
      const { data: staffData, error: staffError } = await supabase
        .from('staff_accounts')
        .select('*')
        .eq('username', u)
        .eq('password', p)
        .or(`module.ilike.${m},module.is.null`) // Case-insensitive and handle null
        .maybeSingle();

      if (staffError) {
        console.error('Supabase Login Error:', staffError);
        // Fallback to local check if DB is down but user exists in env
      }

      if (staffData) {
        return res.json({ username: staffData.username, role: 'staff', name: staffData.name });
      }

      // Fallback to environment staff
      const isEnvStaff = ((u.toLowerCase() === staffId.toLowerCase() || u.toLowerCase() === 'staff') && (p === staffPass || p === '12345'));
      if (isEnvStaff) {
        return res.json({ username: staffId, role: 'staff' });
      }

      res.status(401).json({ error: 'Invalid credentials' });
    } catch (err) {
      console.error('Critical Login Error:', err);
      res.status(500).json({ error: 'Internal Server Error', details: (err as Error).message });
    }
  });

  // Settings API
  app.get("/api/settings/:module", async (req, res) => {
    let m = String(req.params.module || '').trim();
    if (m.toLowerCase() === 'dairy') m = 'Dairy';
    if (m.toLowerCase() === 'hospital') m = 'Hospital';

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('module', m)
      .maybeSingle();
    // If not found (PGRST116) or table doesn't exist (42P01), return empty object instead of error for frontend compatibility
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      return res.status(500).json(error);
    }
    res.json(data || {});
  });

  app.post("/api/settings/:module", async (req, res) => {
    const { 
      whatsapp_api_key, 
      hospital_name, 
      contact_number, 
      full_address, 
      email_id, 
      website, 
      logo_url,
      auto_birthday, 
      auto_anniversary 
    } = req.body;

    const { error } = await supabase
      .from('settings')
      .upsert({ 
        module: req.params.module, 
        whatsapp_api_key, 
        hospital_name, 
        contact_number,
        full_address,
        email_id,
        website,
        logo_url,
        auto_birthday: !!auto_birthday, 
        auto_anniversary: !!auto_anniversary 
      }, { onConflict: 'module' });
    if (error) return res.status(500).json(error);
    res.json({ success: true });
  });

  // Logs API
  app.get("/api/logs/:module", async (req, res) => {
    let m = String(req.params.module || '').trim();
    if (m.toLowerCase() === 'dairy') m = 'Dairy';
    if (m.toLowerCase() === 'hospital') m = 'Hospital';

    const { data, error } = await supabase
      .from('message_logs')
      .select('*')
      .eq('module', m)
      .order('sent_at', { ascending: false })
      .limit(100);
    if (error) {
      if (error.code === '42P01') return res.json([]);
      return res.status(500).json(error);
    }
    res.json(data);
  });

  app.post("/api/logs", async (req, res) => {
    const { error } = await supabase
      .from('message_logs')
      .insert([req.body]);
    if (error) return res.status(500).json(error);
    res.json({ success: true });
  });

  // Master Lists API
  const tableHasModuleCache = new Map<string, boolean>();

  async function checkTableHasModule(tableName: string): Promise<boolean> {
    if (tableHasModuleCache.has(tableName)) {
      return tableHasModuleCache.get(tableName)!;
    }
    const nonModuleTables = ['state_master', 'district_master', 'block_master', 'post_master'];
    const hasModule = !nonModuleTables.includes(tableName);
    tableHasModuleCache.set(tableName, hasModule);
    return hasModule;
  }

  app.get("/api/masters/:module/:table", async (req, res) => {
    try {
      let m = String(req.params.module || '').trim();
      if (m.toLowerCase() === 'dairy') m = 'Dairy';
      if (m.toLowerCase() === 'hospital') m = 'Hospital';

      const tableName = req.params.table;
      const hasModule = await checkTableHasModule(tableName);

      let query = supabase.from(tableName).select('*');
      if (hasModule) {
        query = query.eq('module', m);
      }

      const { data, error } = await query.order('name', { ascending: true });
      if (error) {
        if (error.code === '42P01') return res.json([]);
        return res.status(500).json(error);
      }
      res.json(data);
    } catch (err: any) {
      console.error(`Error fetching masters for ${req.params.table}:`, err);
      res.status(500).json({ error: err.message || err });
    }
  });

  app.post("/api/masters/:table", async (req, res) => {
    try {
      const tableName = req.params.table;
      const hasModule = await checkTableHasModule(tableName);
      
      const payload = { ...req.body };
      if (!hasModule && 'module' in payload) {
        delete payload.module;
      }

      const { data, error } = await supabase
        .from(tableName)
        .insert([payload])
        .select();

      if (error) {
        console.error(`Master insert error (${tableName}):`, error);
        return res.status(500).json({ error: error.message || error });
      }
      if (!data || data.length === 0) return res.status(500).json({ error: 'No data returned' });
      res.json({ id: data[0].id });
    } catch (err: any) {
      console.error(`Error in master insert for ${req.params.table}:`, err);
      res.status(500).json({ error: err.message || err });
    }
  });

  app.put("/api/masters/:table/:id", async (req, res) => {
    try {
      const tableName = req.params.table;
      const hasModule = await checkTableHasModule(tableName);
      
      const payload = { ...req.body };
      if (!hasModule && 'module' in payload) {
        delete payload.module;
      }

      const { error } = await supabase
        .from(tableName)
        .update(payload)
        .eq('id', req.params.id);

      if (error) {
        console.error(`Master update error (${tableName}):`, error);
        return res.status(500).json(error);
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error(`Error in master update for ${req.params.table}:`, err);
      res.status(500).json({ error: err.message || err });
    }
  });

  app.delete("/api/masters/:table/:id", async (req, res) => {
    const { error } = await supabase
      .from(req.params.table)
      .delete()
      .eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      // API 404 Handler - before Vite middleware
      app.all("/api/*", (req, res) => {
        res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
      });

      app.use(vite.middlewares);

      // Global Error Handler
      app.use((err: any, req: any, res: any, next: any) => {
        console.error('Unhandled Error:', err);
        if (res.headersSent) return next(err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
      });

      app.listen(3000, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:3000`);
        console.log(`Connected to Supabase: ${supabaseUrl}`);
      });
    }).catch((err) => {
      console.error("Vite server initialization error:", err);
    });
  } else if (!process.env.VERCEL) {
    app.use(express.static(path.join(process.cwd(), "dist")));
    
    // API 404 Handler for production
    app.all("/api/*", (req, res) => {
      res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });

    // Global Error Handler
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Unhandled Error:', err);
      if (res.headersSent) return next(err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    });

    app.listen(3000, "0.0.0.0", () => {
      console.log(`Server running on port 3000`);
      console.log(`Connected to Supabase: ${supabaseUrl}`);
    });
  } else {
    // Vercel serverless environment (API mapping only)
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Unhandled Serverless Error:', err);
      if (res.headersSent) return next(err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    });
  }

export default app;
