-- 024_open_beta_no_trial_gate.sql
-- Open beta: teacher signup no longer needs a redemption code, and nothing expires.
--
-- The login route previously refused any teacher whose trial_ends_at had passed
-- and told them to find an access code. Going open beta without clearing the
-- existing timestamps would lock out exactly the people who tried the product
-- early — possibly mid-term, with live classes.
--
-- This clears the expiry from existing self-serve accounts and moves them onto
-- the beta plan. Paid/code-redeemed accounts are left alone.
--
-- Non-destructive: only nulls a timestamp and relabels a plan string. The
-- redemption_codes table and the admin minting UI are untouched, so a paid tier
-- can be reintroduced later.

update teachers
   set trial_ends_at = null,
       plan          = 'beta'
 where plan = 'trial';

-- Any account still carrying an expiry (however it got there) is un-gated too.
update teachers
   set trial_ends_at = null
 where trial_ends_at is not null;
