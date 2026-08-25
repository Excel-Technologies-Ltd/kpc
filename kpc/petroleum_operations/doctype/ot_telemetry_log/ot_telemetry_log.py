# Copyright (c) 2026, ArcApps and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

from kpc.petroleum_operations.utils import (
	assert_document_immutable,
	assess_pipeline_anomaly,
	raise_ai_alert,
)


class OTTelemetryLog(Document):
	"""OT Safety Boundary (Phase 3): this doctype is a one-way ingest point
	for read-only telemetry from field instrumentation / a SCADA historian.
	It is structurally incapable of commanding an industrial control system:

	- No field on this doctype represents a setpoint, command, or actuator
	  target - only sensor readings (pressure, flow, vibration) and ingest
	  metadata. Nothing here is ever written back out to OT equipment.
	- No permission role has ``write`` or ``delete`` - once ingested, a
	  reading can only ever be read, never edited or erased (see
	  :func:`assert_document_immutable` for the equivalent server-side
	  guarantee, which holds even for a script running with
	  ``ignore_permissions=True``).
	- :func:`ingest_reading` is the one recommended integration entrypoint
	  for a real SCADA/historian bridge: it only accepts sensor values in
	  and returns a document name - there is no corresponding "write" API.
	"""

	def validate(self):
		assert_document_immutable(self)

	def after_insert(self):
		result = assess_pipeline_anomaly(self.pressure_bar, self.flow_rate_m3h, self.vibration_mm_s)
		self.db_set("anomaly_score", result["score"], update_modified=False)
		self.db_set("anomaly_severity", result["severity"], update_modified=False)

		alert_name = raise_ai_alert(self.journey_ref, self.movement, result)
		if alert_name:
			self.db_set("alert_triggered", 1, update_modified=False)


@frappe.whitelist()
def ingest_reading(
	movement: str,
	pressure_bar: float | None = None,
	flow_rate_m3h: float | None = None,
	vibration_mm_s: float | None = None,
	source_tag: str | None = None,
	ingest_channel: str = "SCADA Historian API",
	reading_datetime: str | None = None,
) -> str:
	"""Recommended integration entrypoint for a real SCADA/historian bridge.
	Read-only ingest only: accepts sensor values in, returns the new OT
	Telemetry Log's name. There is no corresponding update/delete API and
	none is planned - this function is the entire OT-facing surface area.
	"""
	doc = frappe.get_doc(
		{
			"doctype": "OT Telemetry Log",
			"movement": movement,
			"pressure_bar": pressure_bar,
			"flow_rate_m3h": flow_rate_m3h,
			"vibration_mm_s": vibration_mm_s,
			"source_tag": source_tag,
			"ingest_channel": ingest_channel,
			"reading_datetime": reading_datetime,
		}
	)
	doc.insert()
	return doc.name
