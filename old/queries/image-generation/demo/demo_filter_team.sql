SELECT 
	name as value, 
	callsign as description
from mledb.team
WHERE branding_id IS NOT NULL