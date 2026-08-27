# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

from frappe.model.document import Document
from frappe.utils import flt

from kpc.petroleum_operations.utils import (
	assert_journey_ref_immutable,
	assert_tank_available,
	log_journey_step,
)


class InventoryPosition(Document):
	def validate(self):
		assert_journey_ref_immutable(self)
		self.validate_tank_state()
		self.calculate_closing_volume()

	def validate_tank_state(self):
		if flt(self.receipts_kl) > 0:
			assert_tank_available(self.tank, action="record a receipt against")
		if flt(self.dispatches_kl) > 0:
			assert_tank_available(self.tank, action="record a dispatch against")

	def calculate_closing_volume(self):
		self.closing_volume_kl = flt(
			flt(self.opening_volume_kl)
			+ flt(self.receipts_kl)
			- flt(self.dispatches_kl)
			+ flt(self.adjustments_kl),
			3,
		)

	def on_update(self):
		# flags.in_insert, not is_new() - see Oil Shipment for why is_new()
		# doesn't work here (Frappe has already cleared it by the time
		# on_update() runs, even on the very first save). Unlike the other
		# doctypes here, Inventory Position has no workflow_state to compare
		# - each document *is* one position snapshot, so the meaningful
		# event is its creation, not any later save. Without this guard,
		# re-saving an existing position (e.g. to edit remarks) would log a
		# duplicate "4. Inventory Position" entry for a step that already
		# happened.
		if self.flags.in_insert:
			log_journey_step(self.journey_ref, "4. Inventory Position", self)
