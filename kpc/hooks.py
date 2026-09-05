app_name = "kpc"
app_title = "KPC Operations"
app_publisher = "ArcApps"
app_description = (
	"Petroleum Operations Platform for Kenya Pipeline Company - tracks cargo from vessel "
	"arrival to financial posting under a single Golden Thread (journey_ref)."
)
app_email = "azmin@excelbd.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/kpc/css/kpc.css"

# Defines kpc.workflow_progress.render(frm) - a "Golden Thread progress"
# section shown on every step doctype's own form - and kpc.dip_gauge.open(frm)
# - the interactive Tank Measurement dip gauge dialog (see each doctype's
# own <name>.js calling these from refresh()). Pure function definitions
# only, no side effects on load, so including them app-wide (rather than
# per-doctype via doctype_js) is safe.
app_include_js = ["/assets/kpc/js/workflow_progress.js", "/assets/kpc/js/dip_gauge.js"]

# include js, css files in header of web template
# web_include_css = "/assets/kpc/css/kpc.css"
# web_include_js = "/assets/kpc/js/kpc.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "kpc/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "kpc.utils.jinja_methods",
# 	"filters": "kpc.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "kpc.install.before_install"
# Runs this app's structural setup (roles, custom fields, Kilolitre UOM,
# Workflows, Workspace) and then seeds the demo Golden Thread - on a fresh
# `bench install-app kpc` only, never on `bench migrate`, and never
# retroactively on a site the app was already installed on before this hook
# existed. `bench install-app` marks every patch as already-applied without
# running it (see kpc.install's docstring), so this is the only chance a
# fresh install gets at any of it. Defensive throughout: never aborts the
# install itself if a step fails - see kpc.install.after_install.
after_install = "kpc.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "kpc.uninstall.before_uninstall"
# after_uninstall = "kpc.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "kpc.utils.before_app_install"
# after_app_install = "kpc.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "kpc.utils.before_app_uninstall"
# after_app_uninstall = "kpc.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "kpc.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes
# ---------------------------------
# Rewrite ArcApps stock-shortage TypeErrors (get_desk_link kwargs) into
# a readable message on every Stock Entry / Delivery Note submit or
# cancel: Reconciliation, Terminal Receipt, Tank Measurement, Dispatch,
# and any voucher opened from the desk.
override_doctype_class = {
	"Stock Entry": "kpc.petroleum_operations.integrations.stock_vouchers.KPCStockEntry",
	"Delivery Note": "kpc.petroleum_operations.integrations.stock_vouchers.KPCDeliveryNote",
}

# Standard Queries
# ----------------
# Terminal's own default search query - so an inactive terminal never shows
# up in ANY Terminal Link-field dropdown app-wide (Nomination, Movement, Oil
# Shipment, Oil Tank, Pipeline Batch, Capacity Assessment, Tariff, Plant
# Asset, ...), with no per-field client script needed anywhere. Existing
# documents that already reference an inactive terminal are unaffected -
# this only narrows what's *offered* for a new selection.
standard_queries = {
	"Terminal": "kpc.petroleum_operations.queries.active_terminal_query",
}

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"*": {
		# Segregation of Duties (Phase 6): a document's owner cannot also
		# submit/approve it. Scoped internally, inside sod.block_self_submit
		# itself, to only this app's own doctypes - see kpc.petroleum_operations.sod
		# for why a wildcard hook is safe here and why it's paired with
		# explicit per-doctype calls for the few doctypes whose "approval"
		# is a workflow_state change rather than a submit.
		"before_submit": "kpc.petroleum_operations.sod.block_self_submit",
	},
	"Sales Invoice": {
		# Stamps journey_ref (a custom field, see patches/v0_0/add_accounts_custom_fields)
		# onto this Sales Invoice's GL Entries once ArcApps has created them,
		# and again on cancellation for the reversal entries.
		"on_submit": "kpc.petroleum_operations.integrations.accounts.propagate_journey_ref_to_gl_entries",
		"on_cancel": "kpc.petroleum_operations.integrations.accounts.reverse_financial_posting",
	},
	"Delivery Note": {
		# Same pattern, stock side: stamps journey_ref onto the Stock Ledger
		# Entries this Delivery Note creates (see patches/v0_0/add_stock_custom_fields).
		"on_submit": "kpc.petroleum_operations.integrations.stock.propagate_journey_ref_to_stock_ledger",
		"on_cancel": "kpc.petroleum_operations.integrations.stock.propagate_journey_ref_to_stock_ledger",
	},
	"Stock Entry": {
		"on_submit": "kpc.petroleum_operations.integrations.stock.propagate_journey_ref_to_stock_ledger",
		"on_cancel": "kpc.petroleum_operations.integrations.stock.propagate_journey_ref_to_stock_ledger",
	},
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"kpc.tasks.all"
# 	],
# 	"daily": [
# 		"kpc.tasks.daily"
# 	],
# 	"hourly": [
# 		"kpc.tasks.hourly"
# 	],
# 	"weekly": [
# 		"kpc.tasks.weekly"
# 	],
# 	"monthly": [
# 		"kpc.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "kpc.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "kpc.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "kpc.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# ERPNext stock messages pass show_title_with_name into get_desk_link;
# older Frappe rejects that kwarg. Re-apply the shim every request/job
# in case another app replaced the function.
before_request = ["kpc.compat.patch_get_desk_link"]
# after_request = ["kpc.utils.after_request"]

# Job Events
# ----------
before_job = ["kpc.compat.patch_get_desk_link"]
# after_job = ["kpc.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"kpc.auth.validate"
# ]

website_route_rules = [{'from_route': '/portal/<path:app_path>', 'to_route': 'portal'}, {'from_route': '/dashboard/<path:app_path>', 'to_route': 'dashboard'},]