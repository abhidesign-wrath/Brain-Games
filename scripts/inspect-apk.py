"""Verify a native, standalone test APK and record reproducible build metadata."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import zipfile

apk = Path(sys.argv[1])
destination = Path(sys.argv[2])
with zipfile.ZipFile(apk) as archive:
    names = archive.namelist()
    assert archive.testzip() is None, "Corrupt APK ZIP"
    assert "AndroidManifest.xml" in names, "Missing Android manifest"
    assert "assets/index.android.bundle" in names, "Missing offline JavaScript bundle"
    assert any(name.endswith("/libreactnative.so") for name in names), "Missing native React Native runtime"
    assert any(name.endswith("/libhermes.so") for name in names), "Missing Hermes runtime"
    abis = sorted({name.split('/')[1] for name in names if name.startswith('lib/')})
destination.mkdir(parents=True, exist_ok=True)
output = destination / "Mindtrail.apk"
shutil.copyfile(apk, output)
config = json.loads(Path("app.json").read_text())["expo"]
metadata = {
    "versionName": config["version"],
    "versionCode": config["android"]["versionCode"],
    "package": config["android"]["package"],
    "commit": os.environ.get("GITHUB_SHA", "local"),
    "runId": os.environ.get("GITHUB_RUN_ID", "local"),
    "runtime": "React Native / Hermes",
    "standalone": True,
    "signing": "Expo template debug/test certificate; not for Play submission",
    "abis": abis,
    "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
    "sizeBytes": output.stat().st_size,
}
(destination / "build-info.json").write_text(json.dumps(metadata, indent=2) + "\n")
print(json.dumps(metadata, indent=2))
