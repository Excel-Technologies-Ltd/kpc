# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt
"""Runtime compatibility shims for this Frappe / ERPNext pair.

ERPNext 14.92+ formats stock-shortage messages with
``frappe.get_desk_link(..., show_title_with_name=True)``. Older Frappe
builds reject that keyword, so the real "insufficient stock" message is
replaced by a TypeError Server Error. Patch the function so every
stock-posting doctype (Dispatch, Stock Entry, Delivery Note, ...) shows
the readable shortage instead.
"""

from __future__ import annotations

import frappe
from frappe import _


def patch_get_desk_link(*_args, **_kwargs):
	"""Idempotent: wrap ``frappe.get_desk_link`` so extra kwargs are safe."""
	current = frappe.get_desk_link
	if getattr(current, "_kpc_compat", False):
		return

	def get_desk_link(doctype, name, show_title_with_name=False, **kwargs):
		try:
			return current(
				doctype,
				name,
				show_title_with_name=show_title_with_name,
				**kwargs,
			)
		except TypeError:
			return _desk_link_without_kwargs(
				current, doctype, name, show_title_with_name
			)

	get_desk_link._kpc_compat = True
	frappe.get_desk_link = get_desk_link


def _desk_link_without_kwargs(original, doctype, name, show_title_with_name):
	try:
		return original(doctype, name)
	except TypeError:
		pass

	meta = frappe.get_meta(doctype)
	title = frappe.get_value(doctype, name, meta.get_title_field())
	if show_title_with_name and name != title:
		html = (
			'<a href="/app/Form/{doctype}/{name}" style="font-weight: bold;">'
			"{doctype_local} {name}: {title_local}</a>"
		)
	else:
		html = (
			'<a href="/app/Form/{doctype}/{name}" style="font-weight: bold;">'
			"{doctype_local} {title_local}</a>"
		)
	return html.format(
		doctype=doctype,
		name=name,
		doctype_local=_(doctype),
		title_local=_(title),
	)
