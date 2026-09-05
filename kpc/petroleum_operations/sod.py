# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt
"""Segregation of Duties (Phase 6): the person who created a document (its
``owner``) cannot also be the one who submits or approves it. This is the
"global app hook preventing document owner from Submitting/Approving their
own document" called for in the brief.

Two complementary mechanisms, because this app models "approval" two
different ways:

- Most transactional doctypes (Nomination, Reconciliation, Dispatch, ...)
  model acceptance as a docstatus submit. :func:`block_self_submit` is wired
  as a global ``before_submit`` hook (see hooks.py's ``"*"`` doc_events
  entry) and is scoped, internally, to only this app's own doctypes - never
  ArcApps/Frappe core or another installed app.
- A handful of non-submittable doctypes (Quality Result, Variance, AI
  Recommendation) model their decision as a ``workflow_state`` transition
  instead. There is no safe, generic way to detect "this workflow_state
  change is the approval-shaped one" across arbitrary doctypes, so
  :func:`assert_not_self_approving` is called explicitly, by each of those
  doctypes, at the exact point they already detect their own decision
  transition - not from a blanket hook.

Oil Shipment's own workflow_state is deliberately NOT covered: its states
are sequential physical-progress milestones (a vessel arriving, discharging,
being received), normally all logged by the same Terminal Operator watching
the same physical event in real time - not a requester/approver split, so a
self-approval gate there would just block normal operations.

The same reasoning applies to a small, explicit set of *submittable*
doctypes too - real-time physical-event logs by the same Terminal Operator,
not a requester/approver split, per BUSINESS_GUIDE.md's own description of
that role ("takes dip readings ... records receipts and dispatches as they
happen"): Tank Measurement (a dip reading), Terminal Receipt, and Dispatch.
These were caught by the wildcard `before_submit` hook anyway (a real bug,
not an intentional gap - the block was applied to every submittable
Petroleum Operations doctype without distinguishing the two cases this
module's own docstring already describes), so a single Terminal Operator
genuinely could not submit their own dip reading, receipt, or dispatch
record - exactly the "normal operations" this same reasoning already
protects Oil Shipment from. Every other submittable doctype (Nomination,
Allocation, Reconciliation, Invoice, ...) is a real requester/approver
handoff and keeps the block.
"""

import frappe
from frappe import _

# Administrator is the system/automation identity - migrations, demo data,
# and every doc_events integration hook in this app run as it. It is not a
# real, segregated business role, so it is exempt here exactly the way
# Frappe's own core permission system already exempts Administrator from
# virtually every other permission check. Every doctype this app cares about
# also already has System Manager's submit/cancel permission removed
# (Phases 1-5), so in practice this exemption is never reachable through the
# desk UI for a real user anyway - it only matters for scripts and hooks
# that legitimately run as Administrator.
_EXEMPT_USERS = ("Administrator",)

# Single-Terminal-Operator physical-event logs - see the module docstring
# above for why these, specifically, get the same exemption Oil Shipment's
# workflow_state already has, and why every other submittable doctype in
# this module does not.
_SELF_SUBMIT_EXEMPT_DOCTYPES = ("Tank Measurement", "Terminal Receipt", "Dispatch")


def assert_not_self_approving(doc, action: str) -> None:
	"""Throw if the current user is also this document's ``owner``."""
	if frappe.session.user in _EXEMPT_USERS:
		return
	if doc.owner and doc.owner == frappe.session.user:
		frappe.throw(
			_(
				"{0} {1} was created by {2}, and cannot also be {3} by the same user. "
				"Segregation of duties requires a different person to {3} it."
			).format(doc.doctype, doc.name, doc.owner, action),
			title=_("Segregation of Duties"),
		)


def block_self_submit(doc, method=None):
	"""Wired as ``"*": {"before_submit": ...}`` in hooks.py. Scoped here,
	not in hooks.py, to only this app's own module - a wildcard doc_event
	fires for every doctype in every installed app, and this must never
	reach ArcApps's or Frappe's own submittable doctypes (Sales Invoice,
	Stock Entry, ...), whose documents are routinely created and submitted
	by the same user as a matter of normal, unrelated business process."""
	if frappe.get_meta(doc.doctype).module != "Petroleum Operations":
		return
	if doc.doctype in _SELF_SUBMIT_EXEMPT_DOCTYPES:
		return
	assert_not_self_approving(doc, action=_("submitted"))
