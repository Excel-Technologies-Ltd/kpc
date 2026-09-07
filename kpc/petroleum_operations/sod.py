# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt
"""Segregation of Duties (Phase 6) - DISABLED APP-WIDE by explicit business
decision. This module's two enforcement functions, :func:`block_self_submit`
and :func:`assert_not_self_approving`, are no longer wired anywhere - kept
here, still correct and still tested, only so the control can be re-enabled
(entirely, or doctype-by-doctype) without rebuilding it from scratch. Nothing
in this app currently calls either one.

History, for whoever needs to re-enable this:

Originally, the person who created a document (its ``owner``) could not also
be the one who submitted or approved it - the "global app hook preventing
document owner from Submitting/Approving their own document" called for in
the brief. Two complementary mechanisms existed, because this app models
"approval" two different ways:

- Most transactional doctypes (Nomination, Reconciliation, Dispatch, ...)
  model acceptance as a docstatus submit. :func:`block_self_submit` was wired
  as a global ``"*": {"before_submit": ...}`` hook in hooks.py, scoped
  internally (via ``frappe.get_meta(doc.doctype).module``) to only this
  app's own doctypes - never ArcApps/Frappe core or another installed app.
- A handful of non-submittable doctypes (Quality Result, Variance, AI
  Recommendation) modeled their decision as a ``workflow_state`` transition
  instead, so each called :func:`assert_not_self_approving` explicitly, at
  the exact point it already detected its own decision transition.

Oil Shipment's own workflow_state was deliberately never covered even while
this was active: its states are sequential physical-progress milestones (a
vessel arriving, discharging, being received), normally all logged by the
same Terminal Operator watching the same physical event in real time - not a
requester/approver split. The same reasoning was later extended, after a
live-reported bug, to three submittable doctypes that a wildcard hook had
caught without meaning to - Tank Measurement, Terminal Receipt, and
Dispatch - and then to Quality Result's own workflow_state transition, on
the same "this is genuinely one operator doing one job" grounds.

**Reported live: even with those exemptions, every remaining requester/
approver doctype - Nomination, Allocation, Reconciliation, Invoice, and the
two remaining workflow_state doctypes (Variance, AI Recommendation) - still
required a second person, and the business decision was to remove that
requirement everywhere rather than continue auditing doctype-by-doctype.**
The wildcard hook was removed from hooks.py entirely; the explicit
``assert_not_self_approving()`` calls were removed from
quality_result.py, variance.py, and ai_recommendation.py. Each of those
three still stamps ``approved_by``/``approved_on`` and writes its Decision
Ledger entry exactly as before - only the same-user restriction is gone, so
the audit trail (who actually approved what, when) is unaffected; it simply
no longer forbids that person from being the same one who created it.
"""

import frappe
from frappe import _

# Administrator is the system/automation identity - migrations, demo data,
# and every doc_events integration hook in this app run as it. It is not a
# real, segregated business role, so it is exempt here exactly the way
# Frappe's own core permission system already exempts Administrator from
# virtually every other permission check.
_EXEMPT_USERS = ("Administrator",)

# Single-Terminal-Operator physical-event logs that were exempted from
# block_self_submit while it was still active - see the module docstring
# above. Kept only for when/if block_self_submit is rewired.
_SELF_SUBMIT_EXEMPT_DOCTYPES = ("Tank Measurement", "Terminal Receipt", "Dispatch")


def assert_not_self_approving(doc, action: str) -> None:
	"""Throw if the current user is also this document's ``owner``. Not
	called from anywhere currently - see the module docstring."""
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
	"""Was wired as ``"*": {"before_submit": ...}`` in hooks.py; that entry
	has been removed, so this is no longer called by anything. Left intact,
	including its own app-scoping (only this app's own Petroleum Operations
	doctypes, never ArcApps/Frappe core or another installed app), in case
	it's rewired later - see the module docstring."""
	if frappe.get_meta(doc.doctype).module != "Petroleum Operations":
		return
	if doc.doctype in _SELF_SUBMIT_EXEMPT_DOCTYPES:
		return
	assert_not_self_approving(doc, action=_("submitted"))
