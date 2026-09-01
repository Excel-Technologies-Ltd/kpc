__version__ = "0.0.1"

try:
	from kpc.compat import patch_get_desk_link

	patch_get_desk_link()
except Exception:
	pass
