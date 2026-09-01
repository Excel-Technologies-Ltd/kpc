# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt
"""Stock voucher controllers that surface readable shortage messages.

Reconciliation, Terminal Receipt, Tank Measurement, and Dispatch all
submit or cancel a real ArcApps Stock Entry / Delivery Note. Overriding
those two controllers covers every path - including desk-side submit
and cancel - so a get_desk_link TypeError never reaches the operator.
"""

from erpnext.stock.doctype.delivery_note.delivery_note import DeliveryNote
from erpnext.stock.doctype.stock_entry.stock_entry import StockEntry

from kpc.petroleum_operations.integrations.stock import wrap_stock_method


class KPCStockEntry(StockEntry):
	def submit(self):
		return wrap_stock_method(self, super().submit)

	def cancel(self):
		return wrap_stock_method(self, super().cancel)


class KPCDeliveryNote(DeliveryNote):
	def submit(self):
		return wrap_stock_method(self, super().submit)

	def cancel(self):
		return wrap_stock_method(self, super().cancel)
