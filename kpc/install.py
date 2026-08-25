# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt
"""after_install orchestration.

`bench install-app` does **not** run patches.txt - Frappe's installer marks
every one of an app's patches as already-applied the moment it's freshly
installed (frappe.installer.set_all_patches_as_completed), on the
assumption that a brand new site has no pre-existing data for a patch to
migrate. That assumption doesn't hold for most of this app's patches: RBAC
roles, custom fields on standard ERPNext doctypes, the Kilolitre UOM,
Workflows, and the KPC Workspace aren't migrations of old data - they're
first-run setup a fresh install needs exactly as much as an upgrading site
does. Because they're already logged as "complete", `bench migrate` will
never run them afterwards either. So after_install runs them here, once,
directly - the only chance a fresh install gets.

(Schema itself - the doctypes/fields defined in each doctype's own .json -
is unaffected by any of this: `sync_for()` installs it before after_install
even fires, regardless of patches.)
"""

import frappe

# Same modules as patches.txt, minus backfill_terminal_company - a no-op on
# a fresh install (no Terminal exists yet to backfill).
_SETUP_PATCHES = [
	"kpc.patches.v0_0.setup_petroleum_roles",
	"kpc.patches.v0_0.add_product_custom_fields",
	"kpc.patches.v0_0.add_accounts_custom_fields",
	"kpc.patches.v0_0.add_stock_custom_fields",
	"kpc.patches.v0_0.configure_accounts_settings",
	"kpc.patches.v0_0.setup_petroleum_workflows",
	"kpc.patches.v0_0.setup_maintenance_workflow",
	"kpc.patches.v0_0.setup_variance_workflow",
	"kpc.patches.v0_0.create_kpc_workspace",
	"kpc.patches.v0_0.add_stock_workspace_card",
]


def after_install():
	_run_setup_patches()

	# The doc_events a Document actually fires come from
	# frappe.get_doc_hooks() (frappe/__init__.py), which is its *own*,
	# separate cache: a plain process-local variable, frappe.local.doc_events_hooks,
	# computed once on first use and never recomputed again for the rest of
	# the process - neither frappe.clear_cache() nor busting the Redis
	# "app_hooks" key touches it (verified directly; both were red
	# herrings). `bench install-app` runs module sync, this hook, and demo
	# data all in one long-lived process, so if *anything* earlier in that
	# run saved a document and thereby triggered the first, lazy
	# computation of doc_events_hooks - before kpc's own hooks.py was fully
	# walkable - that stale dict silently sticks around for everything
	# after it, including every document this function is about to create.
	# Symptom was exactly that: the demo Sales Invoice/Delivery Note/Stock
	# Entry all submitted "successfully" but never got journey_ref
	# propagated onto their GL/Stock Ledger Entries. Clearing it forces a
	# fresh computation, which by now (kpc fully installed) is correct.
	frappe.clear_cache()
	frappe.cache().delete_value("app_hooks")
	frappe.local.doc_events_hooks = None

	from kpc.demo_data import seed_if_ready

	seed_if_ready()


def _run_setup_patches():
	"""Best-effort, not all-or-nothing: each patch module is independent
	(roles vs. custom fields vs. workflows vs. workspace), so one failing
	shouldn't stop the others from at least being attempted. Every module
	here is the same idempotent code `bench migrate` would otherwise run,
	so re-running any of them by hand later (via `bench execute
	<module>.execute`) is always safe if one does fail here.
	"""
	frappe.flags.in_patch = True
	try:
		for module_path in _SETUP_PATCHES:
			try:
				frappe.get_attr(f"{module_path}.execute")()
			except Exception:
				frappe.db.rollback()
				frappe.log_error(title=f"KPC setup step failed during after_install: {module_path}")
				print(
					f"kpc: setup step {module_path} failed during install (see Error Log) - "
					f"continuing with the rest. Re-run it directly once fixed: "
					f"bench execute {module_path}.execute"
				)
	finally:
		frappe.flags.in_patch = False
	frappe.db.commit()
