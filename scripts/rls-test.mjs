// Proves that a visitor (anon key) cannot write to your database.
//
// BEFORE running, in Supabase SQL Editor:
//   insert into public.projects (slug, title, published) values ('rls-canary', 'canary', true);
// Run:
//   node --env-file=.env.local scripts/rls-test.mjs
// AFTER, clean up in the SQL Editor:
//   delete from public.projects where slug = 'rls-canary';
//
// Only the 'rls-canary' row is ever touched, so real projects are safe.

import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const sb = createClient(url, key)

// "Blocked" = an error, or nothing was changed/returned.
const blocked = (r) => Boolean(r.error) || !r.data || r.data.length === 0

const insert = await sb
  .from('projects')
  .insert({ slug: 'rls-test-insert', title: 'should not exist' })
  .select()
const update = await sb
  .from('projects')
  .update({ title: 'hacked' })
  .eq('slug', 'rls-canary')
  .select()
const remove = await sb
  .from('projects')
  .delete()
  .eq('slug', 'rls-canary')
  .select()
const history = await sb.from('content_versions').select('*')
const drafts = await sb.from('projects').select('slug').eq('published', false)

const results = [
  ['anon cannot INSERT a project', blocked(insert)],
  ['anon cannot UPDATE a project', blocked(update)],
  ['anon cannot DELETE a project', blocked(remove)],
  ['anon cannot read version history', blocked(history)],
  ['anon cannot see drafts', blocked(drafts)],
]

let ok = true
for (const [name, pass] of results) {
  console.log(pass ? 'PASS' : 'FAIL', '-', name)
  if (!pass) ok = false
}

console.log(
  ok
    ? '\nAll good: visitors can only read published projects.'
    : '\nSOMETHING IS WRONG. Do not deploy. Re-run 01_supabase.sql and check the policies.',
)
if (insert.data?.length) console.log('Cleanup needed: delete slug rls-test-insert')
process.exit(ok ? 0 : 1)
