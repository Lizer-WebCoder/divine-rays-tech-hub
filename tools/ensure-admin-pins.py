#!/usr/bin/env python3
"""Ensure Admin portal pins exist in index.html. Safe for End-User pin updates."""
import re, pathlib, sys

ADMIN_LOCK = '61caa12d784ef14dbce219a4ad0825e33a108552'
SIDEBAR_ROLE = 'e1b64444ddb0dbeea9ec05d05cf843032414c738'
USERS_NAV = 'b6f328bf2f2e29c4ab6d88de2fc416c79e4bb070'
THEME = 'e1b64444ddb0dbeea9ec05d05cf843032414c738'
TOPBAR = 'c49dd3bd4b8cd07fa3608633c3d096ce1ac5db04'
DASH = 'e1b64444ddb0dbeea9ec05d05cf843032414c738'
PENDING = '94a5aeaaa38fafaaa1ac94872341ce3bf992dfd1'
LOGIN_CHROME = '60c3368efd15da0e8d15cac0674b28eaed22d973'
FORCE_LIGHT = 'ebcbb4637a65511602a399006a8ccc29f346ecfa'
# ECG v20 gated on __DR_ECG_OK — no boot lifeline
HB = '829f7c393037fd701330e45726da9b061d859ae5'

INDEX = pathlib.Path('index.html')
if not INDEX.exists():
    print('no index.html'); sys.exit(0)
text = INDEX.read_text(encoding='utf-8')

def has_good_pins(t):
    return (
        ADMIN_LOCK in t and USERS_NAV in t and SIDEBAR_ROLE in t
        and TOPBAR in t and DASH in t and THEME in t
        and LOGIN_CHROME in t and FORCE_LIGHT in t and HB in t
        and "HB_SHA + \"'" in t
        and 'heartbeat: single load from boot' in t
        and '__DR_ECG_OK' in t
    )

if has_good_pins(text) and 'admin-portal-lock.js' in text:
    print('Admin pins already correct')
    sys.exit(0)

print('Admin pins missing or stale — patching index.html')

replacements = [
    (r"var ADMIN_LOCK_SHA = '[^']*';", f"var ADMIN_LOCK_SHA = '{ADMIN_LOCK}';"),
    (r"var SIDEBAR_ROLE_SHA = '[^']*';", f"var SIDEBAR_ROLE_SHA = '{SIDEBAR_ROLE}';"),
    (r"var USERS_NAV_SHA = '[^']*';", f"var USERS_NAV_SHA = '{USERS_NAV}';"),
    (r"var THEME_SHA = '[^']*';", f"var THEME_SHA = '{THEME}';"),
    (r"var TOPBAR_SHA = '[^']*';", f"var TOPBAR_SHA = '{TOPBAR}';"),
    (r"var DASH_NO_TICKETS_SHA = '[^']*';", f"var DASH_NO_TICKETS_SHA = '{DASH}';"),
    (r"var PENDING_FIX_SHA = '[^']*';", f"var PENDING_FIX_SHA = '{PENDING}';"),
    (r"var LOGIN_CHROME_HIDE_SHA = '[^']*';", f"var LOGIN_CHROME_HIDE_SHA = '{LOGIN_CHROME}';"),
    (r"var FORCE_LIGHT_BG_SHA = '[^']*';", f"var FORCE_LIGHT_BG_SHA = '{FORCE_LIGHT}';"),
    (r"var HB_SHA = '[^']*';", f"var HB_SHA = '{HB}';"),
    (r'"var HB_SHA = \'[a-f0-9]+\';"', '"var HB_SHA = \'" + HB_SHA + "\';"'),
]
for pat, rep in replacements:
    if re.search(pat, text):
        text = re.sub(pat, rep, text)

if 'ADMIN_LOCK_SHA' not in text:
    block = f"""
    var ADMIN_LOCK_SHA = '{ADMIN_LOCK}';
    var SIDEBAR_ROLE_SHA = '{SIDEBAR_ROLE}';
    var USERS_NAV_SHA = '{USERS_NAV}';
    var THEME_SHA = '{THEME}';
    var TOPBAR_SHA = '{TOPBAR}';
    var DASH_NO_TICKETS_SHA = '{DASH}';
    var PENDING_FIX_SHA = '{PENDING}';
"""
    text = re.sub(r"(var SIDEBAR_SHA = '[^']*';)", r"\1\n" + block, text, count=1)

if 'admin-portal-lock.js' not in text[:2000]:
    text = text.replace(
        '</head>',
        '  <script src="https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@main/js/admin-portal-lock.js"></script>\n</head>',
        1,
    )

INDEX.write_text(text, encoding='utf-8')
print('Patched index.html with quiet portal-aware Admin pins')
