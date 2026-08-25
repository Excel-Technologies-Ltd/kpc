# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt

from kpc.petroleum_operations.utils import (
	assert_journey_ref_immutable,
	get_product_compatibility,
	log_journey_step,
)


class PipelineBatch(Document):
	def validate(self):
		assert_journey_ref_immutable(self)
		self.validate_schedule()
		self.validate_against_nomination()
		self.validate_against_capacity()
		self.validate_product_adjacency()

	def validate_schedule(self):
		if self.scheduled_start and self.scheduled_end and self.scheduled_end <= self.scheduled_start:
			frappe.throw(_("Scheduled End must be after Scheduled Start."))

	def validate_against_nomination(self):
		nomination = frappe.get_doc("Nomination", self.nomination)
		if nomination.docstatus != 1:
			frappe.throw(_("Nomination {0} must be submitted (accepted) before batching.").format(self.nomination))

		already_batched = flt(
			frappe.db.sql(
				"""
				select coalesce(sum(planned_volume_kl), 0)
				from `tabPipeline Batch`
				where nomination = %s and docstatus < 2 and name != %s
				""",
				(self.nomination, self.name or ""),
			)[0][0]
		)
		if already_batched + flt(self.planned_volume_kl) > flt(nomination.nominated_quantity_kl):
			frappe.throw(
				_("Batched volume ({0} KL) would exceed Nomination {1}'s nominated quantity ({2} KL).").format(
					already_batched + flt(self.planned_volume_kl), self.nomination, nomination.nominated_quantity_kl
				)
			)

	def validate_against_capacity(self):
		if not self.capacity_assessment:
			return
		available = flt(
			frappe.db.get_value("Capacity Assessment", self.capacity_assessment, "available_capacity_kl")
		)
		if flt(self.planned_volume_kl) > available:
			frappe.throw(
				_("Planned volume ({0} KL) exceeds available capacity ({1} KL) on {2}.").format(
					self.planned_volume_kl, available, self.capacity_assessment
				)
			)

	def validate_product_adjacency(self):
		"""A pipeline moves one continuous column of liquid - two consecutive
		slugs pumped back-to-back on the same route share a physical
		interface, so their products must be checked against the Product
		Compatibility matrix. Adjacency here means "immediate neighbour by
		Pumping Sequence No on the same origin/destination route", which is
		the same scoping Capacity Assessment already uses for a route."""
		if not self.batch_sequence_no or not self.product:
			return

		for neighbour in self._get_adjacent_batches():
			if not neighbour.product or neighbour.product == self.product:
				continue

			rule = get_product_compatibility(self.product, neighbour.product)
			if rule["compatibility"] == "Incompatible":
				frappe.throw(
					_(
						"{0} (sequence {1}) cannot be adjacent to {2} (sequence {3}) on this route: "
						"{4} and {5} are marked Incompatible in the Product Compatibility matrix."
					).format(
						self.product,
						self.batch_sequence_no,
						neighbour.product,
						neighbour.batch_sequence_no,
						self.product,
						neighbour.product,
					),
					title=_("Prohibited Product Adjacency"),
				)
			if rule["compatibility"] == "Requires Interface Cut":
				minimum = flt(rule["minimum_interface_cut_kl"])
				if flt(self.interface_cut_kl) < minimum:
					frappe.throw(
						_(
							"{0} is adjacent to {1} (sequence {2}) on this route, which requires an "
							"interface cut of at least {3} KL. Set Interface Cut Volume accordingly."
						).format(self.product, neighbour.product, neighbour.batch_sequence_no, minimum),
						title=_("Interface Cut Required"),
					)

	def _get_adjacent_batches(self):
		"""The immediate previous and next batches by sequence number on the
		same route, excluding cancelled batches and this document itself."""
		base_filters = {
			"origin_terminal": self.origin_terminal,
			"destination_terminal": self.destination_terminal,
			"docstatus": ["<", 2],
			"name": ["!=", self.name or ""],
		}
		previous = frappe.get_all(
			"Pipeline Batch",
			filters={**base_filters, "batch_sequence_no": ["<", self.batch_sequence_no]},
			fields=["name", "product", "batch_sequence_no"],
			order_by="batch_sequence_no desc",
			limit=1,
		)
		following = frappe.get_all(
			"Pipeline Batch",
			filters={**base_filters, "batch_sequence_no": [">", self.batch_sequence_no]},
			fields=["name", "product", "batch_sequence_no"],
			order_by="batch_sequence_no asc",
			limit=1,
		)
		return previous + following

	def on_submit(self):
		log_journey_step(self.journey_ref, "6. Batch", self)
		if self.capacity_assessment:
			frappe.get_doc("Capacity Assessment", self.capacity_assessment).refresh_commitment()

	def on_cancel(self):
		if self.capacity_assessment:
			frappe.get_doc("Capacity Assessment", self.capacity_assessment).refresh_commitment()
