import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL || "").trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "").trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("--- Fetching dairy_entries counts ---");
  const { data: allEntries, error } = await supabase
    .from('dairy_entries')
    .select('id, type, name, phone, village');
  
  if (error) {
    console.error("Error: ", error);
  } else {
    console.log(`Successfully fetched ${allEntries?.length} entries`);
    const types: Record<string, number> = {};
    for (const e of allEntries || []) {
      types[e.type || 'undefined'] = (types[e.type || 'undefined'] || 0) + 1;
    }
    console.log("Entry types distribution:", types);
    console.log("Entries of type 'Staff' (if any):");
    console.log(JSON.stringify(allEntries?.filter(e => e.type === 'Staff'), null, 2));
  }
}

run();
