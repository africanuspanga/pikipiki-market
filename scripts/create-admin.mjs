// Usage: npm run admin:create -- you@example.com "StrongPassword123"
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: npm run admin:create -- <email> "<password>"');
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

let userId;
const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  // Already exists? Look the user up and reset the password instead.
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!existing) {
    console.error("Could not create admin:", error.message);
    process.exit(1);
  }
  userId = existing.id;
  await supabase.auth.admin.updateUserById(userId, { password });
} else {
  userId = data.user.id;
}

const { error: adminError } = await supabase.from("admins").upsert({ user_id: userId });
if (adminError) {
  console.error("Could not grant admin role:", adminError.message);
  process.exit(1);
}
console.log(`✔ Admin ready: ${email}  →  sign in at /admin/login`);
