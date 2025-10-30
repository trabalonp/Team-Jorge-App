#!/usr/bin/env python3
"""
convert_fit_to_json.py
Lee un archivo FIT y exporta un JSON con:
 - metadata (device, creator, file_id)
 - session/activity info (distance, total_elapsed_time, sport, start_time)
 - lista de records (timestamp, position_lat, position_long, heart_rate, speed, distance, cadence, power, altitude)
Uso:
    python convert_fit_to_json.py path/to/input.fit path/to/output.json
Requiere: fitparse  (pip install fitparse)
"""
import sys, json
from fitparse import FitFile

def fit_to_json(input_path, output_path):
    fitfile = FitFile(input_path)
    activity_info = {}
    records = []
    meta = {}

    # collect file-level messages
    for msg in fitfile.get_messages():
        name = msg.name
        # session/activity/lap
        if name in ("session", "activity", "lap"):
            fields = {}
            for f in msg:
                val = f.value
                fields[f.name] = val.isoformat() if hasattr(val, "isoformat") else val
            activity_info.setdefault(name, {}).update(fields)
        elif name == "record":
            rec = {}
            for f in msg:
                if f.name in ("timestamp","position_lat","position_long","heart_rate","speed","distance","cadence","power","enhanced_altitude","altitude"):
                    val = f.value
                    rec[f.name] = val.isoformat() if hasattr(val, "isoformat") else val
            records.append(rec)
        elif name in ("file_id","device_info","software","user_profile"):
            fields = {}
            for f in msg:
                fields[f.name] = f.value.isoformat() if hasattr(f.value, "isoformat") else f.value
            meta.setdefault(name, {}).update(fields)

    out = {
        "meta": meta,
        "activity_info": activity_info,
        "records_count": len(records),
        "records": records
    }

    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: convert_fit_to_json.py input.fit output.json")
        sys.exit(2)
    fit_to_json(sys.argv[1], sys.argv[2])
    print("Wrote", sys.argv[2])
