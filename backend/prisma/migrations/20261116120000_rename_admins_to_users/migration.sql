-- Accounts are users now; "admin" becomes a workspace role later. Metadata-only rename, no data copied.
ALTER TABLE admins RENAME TO users;
ALTER TABLE users RENAME CONSTRAINT admins_pkey TO users_pkey;
ALTER INDEX admins_email_key RENAME TO users_email_key;
